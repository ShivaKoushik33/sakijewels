import User from "../models/User.js";
import Product from "../models/Product.js";

/**
 * ADD TO CART
 */
// export const addToCart = async (req, res) => {
//   try {
    
//     const userId = req.user._id;
//     console.log(userId);
//     const {  itemId} = req.body;

//     const userData = await User.findById(userId);
//     const cartData = await userData.cartData;

//     if(cartData[itemId]){
//       cartData[itemId] += 1;
//     }else{
//       cartData[itemId]=1;
//     }
//      await User.findByIdAndUpdate(userId, { cartData });
//       res.status(200).json({
//       success: true,
//       message: 'Item added to cart successfully',
//     });
    
//   } catch (error) {
//    res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


export const addToCart = async (req, res) => {
  try {
    const user = req.user; 
    const cartData = await user.cartData;
    console.log("Current cartData:", cartData);
    const { itemId } = req.body;

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // initialize if empty
    if (!user.cartData) {
      user.cartData = {};
    }

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    await User.findByIdAndUpdate(user._id, { cartData });

    console.log("Cart after save:", user.cartData);

    res.status(200).json({
      success: true,
      message: "Item added successfully",
      cartData: user.cartData
    });

  } catch (error) {
    console.error("AddToCart Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// export const getCart = async (req, res) => {
//   try {
//     const userId = req.user;

//     const userData = await User.findById(userId);
//     const cartData = await userData.cartData;

//     res.status(200).json({
//       success: true,
//       cartData,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// update user cart

export const getCart = async (req, res) => {
  try {
    const user = req.user;
    console.log("User in getCart:", user.cartData);

    res.status(200).json({
      success: true,
      cartData: user.cartData || {}
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateCart = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (quantity <= 0) {
      delete user.cartData[itemId];
    } else {
      user.cartData[itemId] = quantity;
    }
    user.markModified("cartData");
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cartData: user.cartData
    });

    console.log("Cart after update:", user.cartData);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      message: "Item removed from cart",
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

