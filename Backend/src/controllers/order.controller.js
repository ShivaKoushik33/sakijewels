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
    const { coupon, addressId, variantType, buyNow } = req.body;

    const user = await User.findById(req.user._id);

    let subtotal = 0;

    if (buyNow && buyNow.productId) {
      const qty = Math.max(1, Number(buyNow.quantity) || 1);
      const product = await Product.findById(buyNow.productId);

      if (!product) {
        return res.status(400).json({ message: "Product not found" });
      }
      if (product.stock < qty) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
      subtotal = product.finalPrice * qty;
    } else {
      if (!user || !user.cartData) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const productIds = Object.keys(user.cartData);

      if (productIds.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const productFilter = { _id: { $in: productIds } };
      if (variantType) productFilter.variantType = variantType;

      const products = await Product.find(productFilter);

      if (products.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      products.forEach(product => {
        const quantity = user.cartData[product._id];
        subtotal += product.finalPrice * quantity;
      });
    }

    if (subtotal < 249) {
  return res.status(400).json({ message: "Minimum order amount is ₹249" });
}

    // 🔥 DELIVERY FEE (adjust if needed)
    let deliveryFee = 69;

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

    // 🔥 PREPAID 5% DISCOUNT
const prepaidDiscount = Math.floor(subtotal * 0.03);
discount += prepaidDiscount;

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
      coupon,
      variantType,
      buyNow
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

    const isBuyNow = !!(buyNow && buyNow.productId);

    if (!isBuyNow && (!user || !user.cartData || Object.keys(user.cartData).length === 0)) {
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
    let deliveryFee = 69;
    let discount = 0;

    const orderItems = [];

    // 🔥 CHECK FIRST ORDER
    const previousOrders = await Order.find({ user: user._id }).session(session);
    const isFirstOrder = previousOrders.length === 0;

    const processedProductIds = [];

    if (isBuyNow) {
      const qty = Math.max(1, Number(buyNow.quantity) || 1);
      const product = await Product.findById(buyNow.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Product not found" });
      }

      if (product.stock < qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      product.stock -= qty;
      await product.save({ session });

      subtotal += product.finalPrice * qty;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        price: product.finalPrice,
        quantity: qty
      });
    } else {
      for (const productId of Object.keys(user.cartData)) {

        const quantity = user.cartData[productId];
        if (quantity <= 0) continue;

        const product = await Product.findById(productId).session(session);

        if (!product) continue;

        if (variantType && product.variantType !== variantType) continue;

        if (product.stock < quantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `${product?.name || "Product"} is out of stock`
          });
        }

        product.stock -= quantity;
        await product.save({ session });

        subtotal += product.finalPrice * quantity;

        processedProductIds.push(product._id.toString());

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url,
          price: product.finalPrice,
          quantity
        });
      }
    }

    if (orderItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (subtotal < 249) {
  await session.abortTransaction();
  session.endSession();
  return res.status(400).json({ message: "Minimum order amount is ₹249" });
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

    // 🔥 PREPAID 5% DISCOUNT
const prepaidDiscount = Math.floor(subtotal * 0.03);
discount += prepaidDiscount;

    const totalAmount = subtotal - discount + deliveryFee;

    const order = await Order.create([{
      user: user._id,
      items: orderItems,
      shippingAddress: address,
      subtotal,
      discount,
      deliveryFee,
      codCharge: 0,
      totalAmount,
      coupon: coupon || null,
      status: "ACCEPTED",
      paymentMethod: "ONLINE",
      paymentId: razorpay_payment_id,
      isPaid: true
    }], { session });

    // 🛒 CLEAR CART (only the items that were just ordered — keep other variant)
    if (!isBuyNow) {
      for (const pid of processedProductIds) {
        delete user.cartData[pid];
      }
      user.markModified("cartData");
      await user.save({ session });
    }

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
  }
} catch (refundError) {
  // refund failed silently
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
    const { addressId, coupon, variantType, buyNow } = req.body;


    const user = await User.findById(req.user._id).session(session);

    const isBuyNow = !!(buyNow && buyNow.productId);

    if (!isBuyNow && (!user || !user.cartData || Object.keys(user.cartData).length === 0)) {
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
    let deliveryFee = 69;
    let codCharge = 29;
    let discount = 0;

    const orderItems = [];

    // 🔥 CHECK FIRST ORDER
    const previousOrders = await Order.find({ user: user._id }).session(session);
    const isFirstOrder = previousOrders.length === 0;

    const processedProductIds = [];

    if (isBuyNow) {
      const qty = Math.max(1, Number(buyNow.quantity) || 1);

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: buyNow.productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { session, new: true }
      );

      if (!updatedProduct) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Product is out of stock" });
      }

      subtotal += updatedProduct.finalPrice * qty;

      orderItems.push({
        product: updatedProduct._id,
        name: updatedProduct.name,
        image: updatedProduct.images?.[0]?.url,
        price: updatedProduct.finalPrice,
        quantity: qty
      });
    } else {
      for (const productId of Object.keys(user.cartData)) {

        const quantity = user.cartData[productId];
        if (quantity <= 0) continue;

        const product = await Product.findById(productId).session(session);

        if (!product) continue;

        if (variantType && product.variantType !== variantType) continue;

        if (product.stock < quantity) {
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

        subtotal += product.finalPrice * quantity;

        processedProductIds.push(product._id.toString());

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url,
          price: product.finalPrice,
          quantity
        });
      }
    }

    if (orderItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (subtotal < 249) {
   await session.abortTransaction();
   session.endSession();

   return res.status(400).json({
      message: "Minimum order amount is ₹249"
   });
}
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
    const totalAmount = subtotal - discount + deliveryFee + codCharge;

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
      codCharge,
      totalAmount,
      coupon: coupon || null,
      status: "PENDING",
      paymentMethod: "COD",
      paymentId: null,
      isPaid: false
    }], { session });
    // 🛒 CLEAR CART (only the items that were just ordered — keep other variant)
    if (!isBuyNow) {
      for (const pid of processedProductIds) {
        delete user.cartData[pid];
      }
      user.markModified("cartData");
      await user.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      message: "Order placed successfully (Cash on Delivery)",
      order: order[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: "Failed to place COD order",
      error: error.message
    });
  }
};