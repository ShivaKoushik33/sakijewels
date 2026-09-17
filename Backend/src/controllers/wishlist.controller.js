import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";

const WISHLIST_FIELDS = "name rate images rating discountRate finalPrice stock";
const MAX_WISHLIST_ITEMS = 200;

/**
 * ADD TO WISHLIST
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findById(productId).select("_id isActive");
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.wishlist.some((id) => id.equals(product._id))) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    if (user.wishlist.length >= MAX_WISHLIST_ITEMS) {
      return res.status(400).json({ message: "Your wishlist is full" });
    }

    user.wishlist.push(product._id);
    await user.save();

    const updatedUser = await User.findById(req.user._id).populate(
      "wishlist",
      WISHLIST_FIELDS
    );

    res.status(200).json({
      message: "Added to wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    console.error("addToWishlist error:", error);
    res.status(500).json({ message: "Could not update wishlist" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      WISHLIST_FIELDS
    );

    res.status(200).json(user?.wishlist ?? []);
  } catch (error) {
    console.error("getWishlist error:", error);
    res.status(500).json({ message: "Could not load wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const before = user.wishlist.length;
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);

    if (user.wishlist.length === before) {
      return res.status(400).json({ message: "Product not in wishlist" });
    }

    await user.save();

    res.status(200).json({
      message: "Removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    res.status(500).json({ message: "Could not update wishlist" });
  }
};
