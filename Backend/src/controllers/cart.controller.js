import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";

// A cart line can hold at most this many units, and a cart at most this many
// distinct products. Without a bound, cartData is an unvalidated user-writable
// object growing against MongoDB's 16 MB document limit.
const MAX_QUANTITY_PER_ITEM = 100;
const MAX_CART_LINES = 100;

const parseQuantity = (value) => {
  const quantity = Math.trunc(Number(value));
  if (!Number.isFinite(quantity)) return null;
  return quantity;
};

/**
 * ADD TO CART
 */
export const addToCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid product" });
    }

    const product = await Product.findById(itemId).select("_id isActive");
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!user.cartData) user.cartData = {};

    const key = product._id.toString();
    const current = parseQuantity(user.cartData[key]) || 0;

    if (!(key in user.cartData) && Object.keys(user.cartData).length >= MAX_CART_LINES) {
      return res
        .status(400)
        .json({ success: false, message: "Your cart is full" });
    }

    user.cartData[key] = Math.min(current + 1, MAX_QUANTITY_PER_ITEM);

    user.markModified("cartData");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Item added successfully",
      cartData: user.cartData,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ success: false, message: "Could not update cart" });
  }
};

export const getCart = async (req, res) => {
  res.status(200).json({
    success: true,
    cartData: req.user.cartData || {},
  });
};

export const updateCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid product" });
    }

    const quantity = parseQuantity(req.body.quantity);
    if (quantity === null) {
      return res.status(400).json({ success: false, message: "Invalid quantity" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cartData) user.cartData = {};

    const key = String(itemId);

    if (quantity <= 0) {
      delete user.cartData[key];
    } else {
      const product = await Product.findById(key).select("_id isActive");
      if (!product || !product.isActive) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (
        !(key in user.cartData) &&
        Object.keys(user.cartData).length >= MAX_CART_LINES
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Your cart is full" });
      }

      user.cartData[key] = Math.min(quantity, MAX_QUANTITY_PER_ITEM);
    }

    user.markModified("cartData");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cartData: user.cartData,
    });
  } catch (error) {
    console.error("updateCart error:", error);
    res.status(500).json({ success: false, message: "Could not update cart" });
  }
};

/**
 * REMOVE FROM CART
 *
 * Previously read `user.cart`, a field that does not exist on the schema, so
 * every call threw. The cart lives in `cartData`.
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.cartData && productId in user.cartData) {
      delete user.cartData[productId];
      user.markModified("cartData");
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cartData: user.cartData || {},
    });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ success: false, message: "Could not update cart" });
  }
};
