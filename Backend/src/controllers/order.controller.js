import mongoose from "mongoose";
import crypto from "node:crypto";

import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import PaymentIntent from "../models/PaymentIntent.js";
import razorpay from "../config/razorpay.js";
import { priceOrder, MIN_ORDER_SUBTOTAL } from "../utils/pricing.js";

const INTENT_TTL_MINUTES = 60;

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const isPositiveInt = (value) =>
  Number.isInteger(value) && value > 0 && value <= 100;

/**
 * Turn the customer's cart (or a buy-now request) into priced line items.
 *
 * Cart keys and quantities are user-controlled and were never validated, so a
 * junk key used to throw a CastError mid-checkout. Anything unusable is skipped
 * here instead.
 */
const collectItems = async ({ user, buyNow, variantType, session }) => {
  const items = [];

  if (buyNow && buyNow.productId) {
    if (!mongoose.isValidObjectId(buyNow.productId)) {
      return { items, error: "Product not found" };
    }

    const quantity = Math.max(1, Math.trunc(Number(buyNow.quantity) || 1));
    if (!isPositiveInt(quantity)) {
      return { items, error: "Invalid quantity" };
    }

    const product = await Product.findById(buyNow.productId).session(session ?? null);

    if (!product || !product.isActive) {
      return { items, error: "Product not found" };
    }
    if (product.stock < quantity) {
      return { items, error: `${product.name} is out of stock` };
    }

    items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: product.finalPrice,
      quantity,
    });

    return { items, error: null };
  }

  const cartData = user?.cartData || {};

  for (const [productId, rawQuantity] of Object.entries(cartData)) {
    if (!mongoose.isValidObjectId(productId)) continue;

    const quantity = Math.trunc(Number(rawQuantity));
    if (!isPositiveInt(quantity)) continue;

    const product = await Product.findById(productId).session(session ?? null);
    if (!product || !product.isActive) continue;

    if (variantType && product.variantType !== variantType) continue;

    // Not enough stock to fulfil the requested quantity: leave it in the cart
    // rather than charging for it.
    if (product.stock < quantity) continue;

    items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: product.finalPrice,
      quantity,
    });
  }

  return { items, error: null };
};

const resolveAddress = (user, addressId) => {
  if (!addressId || !mongoose.isValidObjectId(addressId)) return null;
  return user.addresses.id(addressId) || null;
};

const toAddressSnapshot = (address) => ({
  fullName: address.fullName,
  phone: address.phone,
  house: address.house,
  street: address.street,
  city: address.city,
  state: address.state,
  pincode: address.pincode,
  country: address.country,
});

/* ------------------------------------------------------------------ *
 * USER - my orders
 * ------------------------------------------------------------------ */

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("getUserOrders error:", error);
    res.status(500).json({ message: "Could not load your orders" });
  }
};

/* ------------------------------------------------------------------ *
 * ONLINE - step 1: create the Razorpay order and record what we quoted
 * ------------------------------------------------------------------ */

export const createPaymentOrder = async (req, res) => {
  try {
    const { coupon, addressId, variantType, buyNow } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const address = resolveAddress(user, addressId);
    if (!address) {
      return res.status(400).json({ message: "Invalid address" });
    }

    const { items, error } = await collectItems({ user, buyNow, variantType });

    if (error) {
      return res.status(400).json({ message: error });
    }
    if (items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const isFirstOrder = !(await Order.exists({ user: user._id }));

    const quote = priceOrder({
      items,
      coupon,
      isFirstOrder,
      paymentMethod: "ONLINE",
    });

    if (quote.subtotal < MIN_ORDER_SUBTOTAL) {
      return res
        .status(400)
        .json({ message: `Minimum order amount is ₹${MIN_ORDER_SUBTOTAL}` });
    }

    if (!Number.isFinite(quote.totalAmount) || quote.totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const amountInPaise = Math.round(quote.totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Record exactly what we asked them to pay. verifyPaymentAndPlaceOrder
    // reads this back instead of re-pricing the cart.
    await PaymentIntent.create({
      user: user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      items,
      shippingAddress: toAddressSnapshot(address),
      subtotal: quote.subtotal,
      discount: quote.discount,
      deliveryFee: quote.deliveryFee,
      totalAmount: quote.totalAmount,
      coupon: quote.coupon,
      expiresAt: new Date(Date.now() + INTENT_TTL_MINUTES * 60 * 1000),
    });

    res.status(200).json({
      razorpayOrder,
      subtotal: quote.subtotal,
      discount: quote.discount,
      deliveryFee: quote.deliveryFee,
      totalAmount: quote.totalAmount,
      coupon: quote.coupon,
      items: items.map((item) => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    res.status(500).json({ message: "Could not start payment. Please retry." });
  }
};

/* ------------------------------------------------------------------ *
 * ONLINE - step 2: verify the payment and place the order
 * ------------------------------------------------------------------ */

export const verifyPaymentAndPlaceOrder = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  try {
    /* 1. Signature — proves the pair really came from Razorpay. */
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(razorpay_signature, "utf8");

    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    /* 2. Already processed? Return the existing order instead of a second one. */
    const existingOrder = await Order.findOne({ paymentId: razorpay_payment_id });
    if (existingOrder) {
      if (!existingOrder.user.equals(req.user._id)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      return res.status(200).json({
        message: "Order already placed",
        order: existingOrder,
      });
    }

    /* 3. The quote we issued. */
    const intent = await PaymentIntent.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!intent) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    if (!intent.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    /* 4. What was actually paid, straight from Razorpay. */
    let payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    if (Number(payment.amount) !== intent.amount) {
      console.error(
        `Amount mismatch on ${razorpay_payment_id}: paid ${payment.amount}, quoted ${intent.amount}`
      );
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    // Auto-capture is normally on, but capture explicitly if the payment is
    // only authorised — otherwise the money is never actually collected.
    if (payment.status === "authorized") {
      payment = await razorpay.payments.capture(
        razorpay_payment_id,
        intent.amount,
        intent.currency
      );
    }

    if (payment.status !== "captured") {
      return res
        .status(400)
        .json({ message: "Payment not completed. Please try again." });
    }

    /* 5. Place the order from the recorded quote, not from the live cart. */
    const session = await mongoose.startSession();
    let placedOrder;
    let committed = false;

    try {
      session.startTransaction();

      // Single-use claim. A replay finds status CONSUMED and gets nothing.
      const claimed = await PaymentIntent.findOneAndUpdate(
        { _id: intent._id, status: "CREATED" },
        { status: "CONSUMED", paymentId: razorpay_payment_id },
        { session, new: true }
      );

      if (!claimed) {
        await session.abortTransaction();
        return res
          .status(409)
          .json({ message: "This payment has already been processed." });
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
            paymentId: razorpay_payment_id,
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

    return res.status(201).json({
      message: "Payment successful & order placed",
      order: placedOrder,
    });
  } catch (error) {
    console.error("verifyPaymentAndPlaceOrder error:", error);

    // The payment succeeded but we could not record the order — refund so the
    // customer is never charged for nothing. Only reached when no order was
    // committed, so this can no longer refund a completed order.
    try {
      await razorpay.payments.refund(razorpay_payment_id, {
        speed: "normal",
      });
      console.error(`Refunded ${razorpay_payment_id} after failed checkout`);
    } catch (refundError) {
      console.error(
        `REFUND FAILED for ${razorpay_payment_id} — refund manually:`,
        refundError?.message
      );
    }

    return res.status(500).json({
      message:
        "We could not complete your order. Any amount debited will be refunded.",
    });
  }
};

/* ------------------------------------------------------------------ *
 * COD
 * ------------------------------------------------------------------ */

export const placeOrderCOD = async (req, res) => {
  const session = await mongoose.startSession();
  let committed = false;

  try {
    session.startTransaction();

    const { addressId, coupon, variantType, buyNow } = req.body;

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(401).json({ message: "User not found" });
    }

    const address = resolveAddress(user, addressId);
    if (!address) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid address" });
    }

    const { items, error } = await collectItems({
      user,
      buyNow,
      variantType,
      session,
    });

    if (error) {
      await session.abortTransaction();
      return res.status(400).json({ message: error });
    }
    if (items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cart is empty" });
    }

    const isFirstOrder = !(await Order.exists({ user: user._id }).session(
      session
    ));

    const quote = priceOrder({
      items,
      coupon,
      isFirstOrder,
      paymentMethod: "COD",
    });

    if (quote.subtotal < MIN_ORDER_SUBTOTAL) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: `Minimum order amount is ₹${MIN_ORDER_SUBTOTAL}` });
    }

    if (!Number.isFinite(quote.totalAmount) || quote.totalAmount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid total amount" });
    }

    // Reserve stock atomically; drop any line we lose the race for.
    const reserved = [];

    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );

      if (updated) reserved.push(item);
    }

    if (reserved.length === 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "The items in your cart are out of stock" });
    }

    // Re-price against what we actually reserved so the customer is never
    // billed for a line we could not fulfil.
    const finalQuote =
      reserved.length === items.length
        ? quote
        : priceOrder({
            items: reserved,
            coupon,
            isFirstOrder,
            paymentMethod: "COD",
          });

    if (finalQuote.subtotal < MIN_ORDER_SUBTOTAL) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: `Minimum order amount is ₹${MIN_ORDER_SUBTOTAL}` });
    }

    const created = await Order.create(
      [
        {
          user: user._id,
          items: reserved,
          shippingAddress: toAddressSnapshot(address),
          subtotal: finalQuote.subtotal,
          discount: finalQuote.discount,
          deliveryFee: finalQuote.deliveryFee,
          codCharge: finalQuote.codCharge,
          totalAmount: finalQuote.totalAmount,
          coupon: finalQuote.coupon,
          status: "ACCEPTED",
          paymentMethod: "COD",
          paymentId: null,
          isPaid: false,
        },
      ],
      { session }
    );

    if (!buyNow || !buyNow.productId) {
      let changed = false;
      for (const item of reserved) {
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

    res.status(201).json({
      message: "Order placed successfully (Cash on Delivery)",
      order: created[0],
    });
  } catch (error) {
    if (!committed) {
      await session.abortTransaction().catch(() => {});
    }
    console.error("placeOrderCOD error:", error);
    res.status(500).json({ message: "Failed to place COD order" });
  } finally {
    session.endSession();
  }
};

/* ------------------------------------------------------------------ *
 * ADMIN
 * ------------------------------------------------------------------ */

export const getAllOrders = async (req, res) => {
  try {
    const { status, sort = "DATE_DESC" } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const filter = {};
    if (typeof status === "string" && status.trim()) {
      filter.status = status.trim();
    }

    let sortOption = { createdAt: -1 };
    if (sort === "DATE_ASC") sortOption = { createdAt: 1 };
    if (sort === "PRICE_DESC") sortOption = { totalAmount: -1 };
    if (sort === "PRICE_ASC") sortOption = { totalAmount: 1 };

    const skip = (page - 1) * limit;

    const [totalOrders, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate("user", "name email phone")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    res.status(500).json({ message: "Could not load orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (adminRemark !== undefined) updates.adminRemark = adminRemark;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order updated", order });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid order status" });
    }
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ message: "Could not update order" });
  }
};

/**
 * Single order — the customer who placed it, or an admin. Nothing else.
 */
export const getSingleOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const ownerId = order.user?._id ?? order.user;
    const isOwner = ownerId?.equals(req.user._id);
    const isAdmin = req.user.role === "ADMIN";

    // Same 404 as a missing order, so order ids cannot be probed for existence.
    if (!isOwner && !isAdmin) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("getSingleOrder error:", error);
    res.status(500).json({ message: "Could not load order" });
  }
};
