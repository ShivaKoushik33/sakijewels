import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import mongoose from "mongoose";


/**
 * PLACE ORDER (USER)
 */


export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { coupon, addressId } = req.body;

    const user = await User.findById(req.user._id);

    if (!user || !user.cartData) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const productIds = Object.keys(user.cartData);

    if (productIds.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const products = await Product.find({
      _id: { $in: productIds }
    });

    let subtotal = 0;

    products.forEach(product => {
      const quantity = user.cartData[product._id];
      subtotal += product.finalPrice * quantity;
    });

    // 🔥 DELIVERY FEE (adjust if needed)
    let deliveryFee = 79;

    // 🔥 CHECK FIRST ORDER
    const previousOrders = await Order.find({ user: user._id });
    const isFirstOrder = previousOrders.length === 0;

    // 🔥 APPLY COUPON LOGIC (SECURE)
    let discount = 0;

    if (coupon) {
      const code = coupon.toUpperCase();

      if (code === "TSJFIRST" && isFirstOrder && subtotal >= 599) {
        discount = 100;
      }

      else if (code === "TSJSSFIRST" && isFirstOrder && subtotal >= 999) {
        discount = 100;
        deliveryFee = 0;
      }

      else if (code === "TSJ10" && subtotal >= 999) {
        discount = Math.floor(subtotal * 0.10);
      }

      else if (code === "TSJSS15" && subtotal >= 1499) {
        discount = Math.floor(subtotal * 0.15);
        deliveryFee = 0;
      }
    }

    const totalAmount = subtotal - discount + deliveryFee;

    if (totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      razorpayOrder,
      subtotal,
      discount,
      deliveryFee,
      totalAmount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPaymentAndPlaceOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let {razorpay_payment_id} = req.body;

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
      coupon
    } = req.body;

    // 🔐 VERIFY SIGNATURE
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const user = await User.findById(req.user._id).session(session);

    if (!user || !user.cartData || Object.keys(user.cartData).length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Cart is empty" });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid address" });
    }

    let subtotal = 0;
    let deliveryFee = 79;
    let discount = 0;

    const orderItems = [];

    // 🔥 CHECK FIRST ORDER
    const previousOrders = await Order.find({ user: user._id }).session(session);
    const isFirstOrder = previousOrders.length === 0;

    for (const productId of Object.keys(user.cartData)) {

      const quantity = user.cartData[productId];
      if (quantity <= 0) continue;

      const product = await Product.findById(productId).session(session);

      if (!product || product.stock < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `${product?.name || "Product"} is out of stock`
        });
      }

      product.stock -= quantity;
      await product.save({ session });

      subtotal += product.finalPrice * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        price: product.finalPrice,
        quantity
      });
    }

    // 🔥 APPLY COUPON AGAIN (SECURE CHECK)
    if (coupon) {
      const code = coupon.toUpperCase();

      if (code === "TSJFIRST" && isFirstOrder && subtotal >= 599) {
        discount = 100;
      }

      else if (code === "TSJSSFIRST" && isFirstOrder && subtotal >= 999) {
        discount = 100;
        deliveryFee = 0;
      }

      else if (code === "TSJ10" && subtotal >= 999) {
        discount = Math.floor(subtotal * 0.10);
      }

      else if (code === "TSJSS15" && subtotal >= 1499) {
        discount = Math.floor(subtotal * 0.15);
        deliveryFee = 0;
      }
    }

    const totalAmount = subtotal - discount + deliveryFee;

    const order = await Order.create([{
      user: user._id,
      items: orderItems,
      shippingAddress: address,
      subtotal,
      discount,
      deliveryFee,
      totalAmount,
      coupon: coupon || null,
      status: "PENDING",
      paymentId: razorpay_payment_id,
      isPaid: true
    }], { session });

    // 🛒 CLEAR CART
    user.cartData = {};
    user.markModified("cartData");
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Payment successful & order placed",
      order: order[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    try {
  if (razorpay_payment_id) {
    await razorpay.payments.refund(razorpay_payment_id);
    console.log("Refund initiated successfully");
  }
} catch (refundError) {
  console.error("Refund failed:", refundError.message);
}
    res.status(500).json({
      message: "Payment verification failed. Please retry payment.",
      error
    });
  }
};


/**
 * ADMIN – Get All Orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sort = "DATE_DESC"
    } = req.query;

    // Filtering
    let filter = {};
    if (status) {
      filter.status = status;
    }

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === "DATE_ASC") sortOption = { createdAt: 1 };
    if (sort === "PRICE_DESC") sortOption = { totalAmount: -1 };
    if (sort === "PRICE_ASC") sortOption = { totalAmount: 1 };

    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * ADMIN – Update Order Status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, adminRemark },
      { new: true }
    );

    res.status(200).json({
      message: "Order updated",
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//Get single order details (Admin)
export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const placeOrderCOD = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { addressId, coupon } = req.body;
    console.log("1");

    const user = await User.findById(req.user._id).session(session);

    if (!user || !user.cartData || Object.keys(user.cartData).length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Cart is empty" });
    }
    console.log("2");
    const address = user.addresses.id(addressId);

    if (!address) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid address" });
    }
    console.log("3");
    let subtotal = 0;
    let deliveryFee = 79;
    let discount = 0;

    const orderItems = [];

    // 🔥 CHECK FIRST ORDER
    const previousOrders = await Order.find({ user: user._id }).session(session);
    const isFirstOrder = previousOrders.length === 0;

    for (const productId of Object.keys(user.cartData)) {

      const quantity = user.cartData[productId];
      if (quantity <= 0) continue;

      const product = await Product.findById(productId).session(session);
      console.log("4");
      if (!product || product.stock < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `${product?.name || "Product"} is out of stock`
        });
      }

      const updatedProduct = await Product.findOneAndUpdate(
  { _id: productId, stock: { $gte: quantity } },
  { $inc: { stock: -quantity } },
  { session, new: true }
);

if (!updatedProduct) {
  await session.abortTransaction();
  session.endSession();
  return res.status(400).json({
    message: "Product is out of stock"
  });
}
      console.log("5");
      subtotal += product.finalPrice * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        price: product.finalPrice,
        quantity
      });
    }
    console.log("6");
    // 🔥 APPLY COUPON (SECURE CHECK)
    if (coupon) {
      const code = coupon.toUpperCase();

      if (code === "TSJFIRST" && isFirstOrder && subtotal >= 599) {
        discount = 100;
      }

      else if (code === "TSJSSFIRST" && isFirstOrder && subtotal >= 999) {
        discount = 100;
        deliveryFee = 0;
      }

      else if (code === "TSJ10" && subtotal >= 999) {
        discount = Math.floor(subtotal * 0.10);
      }

      else if (code === "TSJSS15" && subtotal >= 1499) {
        discount = Math.floor(subtotal * 0.15);
        deliveryFee = 0;
      }
    }
    console.log("7");
    const totalAmount = subtotal - discount + deliveryFee;

    if (totalAmount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const order = await Order.create([{
      user: user._id,
      items: orderItems,
      shippingAddress: address,
      subtotal,
      discount,
      deliveryFee,
      totalAmount,
      coupon: coupon || null,
      status: "ACCEPTED",
      paymentMethod: "COD",
      paymentId: null,
      isPaid: false
    }], { session });
    console.log("8");
    // 🛒 CLEAR CART
    user.cartData = {};
    user.markModified("cartData");
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    console.log("9");
    res.status(201).json({
      message: "Order placed successfully (Cash on Delivery)",
      order: order[0]
    });
    console.log("10");

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: "Failed to place COD order",
      error: error.message
    });
  }
};