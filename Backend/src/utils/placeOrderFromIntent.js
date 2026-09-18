import mongoose from "mongoose";
import Order from "../models/Order.js";
import PaymentIntent from "../models/PaymentIntent.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

/**
 * Turns a paid PaymentIntent into an order, inside one transaction.
 *
 * Two things can tell us a payment succeeded: the customer's browser calling
 * verify-payment, and Razorpay's webhook. Whichever arrives first claims the
 * intent — the claim is a single-use status change — so the other is simply
 * told the payment was already processed and no second order is created.
 *
 * Resolves to { order, alreadyProcessed }.
 */
export const placeOrderFromIntent = async ({ intent, paymentId }) => {
  const session = await mongoose.startSession();
  let placedOrder = null;
  let committed = false;

  try {
    session.startTransaction();

    // Single-use claim. A replay finds status CONSUMED and gets nothing.
    const claimed = await PaymentIntent.findOneAndUpdate(
      { _id: intent._id, status: "CREATED" },
      { status: "CONSUMED", paymentId },
      { session, new: true }
    );

    if (!claimed) {
      await session.abortTransaction();
      return { order: null, alreadyProcessed: true };
    }

    const shortfalls = [];

    for (const item of claimed.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );

      // The customer has already paid for this line, so it stays on the
      // order; flag it for the admin rather than silently dropping it.
      if (!updated) {
        shortfalls.push(`${item.name} (x${item.quantity})`);
      }
    }

    const created = await Order.create(
      [
        {
          user: claimed.user,
          items: claimed.items,
          shippingAddress: claimed.shippingAddress,
          subtotal: claimed.subtotal,
          discount: claimed.discount,
          deliveryFee: claimed.deliveryFee,
          codCharge: 0,
          totalAmount: claimed.totalAmount,
          coupon: claimed.coupon,
          status: "CONFIRMED",
          paymentMethod: "ONLINE",
          paymentId,
          isPaid: true,
          adminRemark: shortfalls.length
            ? `Paid but out of stock at capture: ${shortfalls.join(", ")}`
            : undefined,
        },
      ],
      { session }
    );

    placedOrder = created[0];

    // Clear only the lines that were just ordered.
    const user = await User.findById(claimed.user).session(session);
    if (user) {
      let changed = false;
      for (const item of claimed.items) {
        const key = item.product.toString();
        if (user.cartData && key in user.cartData) {
          delete user.cartData[key];
          changed = true;
        }
      }
      if (changed) {
        user.markModified("cartData");
        await user.save({ session });
      }
    }

    await session.commitTransaction();
    committed = true;
  } catch (txError) {
    if (!committed) {
      await session.abortTransaction().catch(() => {});
    }
    throw txError;
  } finally {
    session.endSession();
  }

  return { order: placedOrder, alreadyProcessed: false };
};
