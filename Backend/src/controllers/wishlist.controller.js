import User from "../models/User.js";
import Product from "../models/Product.js";

/**
 * ADD TO WISHLIST
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }
    

    const user = await User.findById(req.user._id);
     console.log("user", user);
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();
   

    const updatedUser = await User.findById(req.user._id)
  .populate("wishlist", "name finalPrice images rating");

      res.status(200).json({
        message: "Added to wishlist",
        wishlist: updatedUser.wishlist
      });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "wishlist",
      "name rate images rating discountRate finalPrice"
    );

    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product not in wishlist" });
}

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      message: "Removed from wishlist",
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
