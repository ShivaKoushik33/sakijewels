import crypto from "node:crypto";
import Order from "../models/Order.js";
import PaymentIntent from "../models/PaymentIntent.js";
import { placeOrderFromIntent } from "../utils/placeOrderFromIntent.js";

/**
 * RAZORPAY WEBHOOK
 *
 * Without this, an order only exists if the customer's browser makes it back
 * to verify-payment. Close the tab at the wrong moment and Razorpay has the
 * money while we have no order at all. Razorpay tells us directly here, so
 * the order is placed either way.
 *
 * The request is authenticated by its signature, not by a login. The body is
 * the raw bytes Razorpay signed — app.js mounts this route before
 * express.json() so nothing re-serialises it.
 *
 * Razorpay retries anything that is not a 2xx for days, so events we cannot
 * act on are acknowledged rather than rejected; only a bad signature and a
 * genuine server fault are errors.
 */
export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error(
      "Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set — ignoring"
    );
    return res.status(200).json({ received: true });
  }

  const signature = req.headers["x-razorpay-signature"];
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);

  if (typeof signature !== "string" || rawBody.length === 0) {
    return res.status(400).json({ message: "Invalid webhook" });
  }

  const expected = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
    "utf8"
  );
  const received = Buffer.from(signature, "utf8");

  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    console.error("Razorpay webhook rejected: bad signature");
    return res.status(400).json({ message: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ message: "Invalid payload" });
  }

  // Refunds, failures and settlement events are acknowledged and ignored.
  if (event.event !== "payment.captured") {
    return res.status(200).json({ received: true });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment?.order_id) {
    return res.status(200).json({ received: true });
  }

  try {
    // Already placed — usually because the customer's browser got here first.
    const existing = await Order.findOne({ paymentId: payment.id });
    if (existing) {
      return res.status(200).json({ received: true, order: existing._id });
    }

    const intent = await PaymentIntent.findOne({
      razorpayOrderId: payment.order_id,
    });

    if (!intent) {
      console.error(
        `Razorpay webhook: no payment intent for order ${payment.order_id} (payment ${payment.id})`
      );
      return res.status(200).json({ received: true });
    }

    // Never place an order for an amount we did not quote.
    if (Number(payment.amount) !== intent.amount) {
      console.error(
        `Razorpay webhook amount mismatch on ${payment.id}: paid ${payment.amount}, quoted ${intent.amount}`
      );
      return res.status(200).json({ received: true });
    }

    const { order, alreadyProcessed } = await placeOrderFromIntent({
      intent,
      paymentId: payment.id,
    });

    if (alreadyProcessed) {
      return res.status(200).json({ received: true });
    }

    console.log(
      `Razorpay webhook placed order ${order._id} for payment ${payment.id}`
    );
    return res.status(200).json({ received: true, order: order._id });
  } catch (error) {
    console.error("razorpayWebhook error:", error);
    // A 500 asks Razorpay to retry, which is what we want for a transient
    // database problem.
    return res.status(500).json({ message: "Could not process webhook" });
  }
};
