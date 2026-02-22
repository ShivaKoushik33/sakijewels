import mongoose from "mongoose";

/**
 * Address Sub-Schema
 * A user can have multiple addresses
 */
const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    house: {
      type: String,
      required: true
    },

    street: {
      type: String
    },

    city: {
      type: String,
      required: true
    },
    
    state: {
      type: String,
      required: true
    },

    pincode: {
      type: String,
      required: true
    },

    country: {
      type: String,
      default: "India"
    },

    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

/**
 * User Schema
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true,
      select: false // never return password in queries
    },

  

    isActive: {
      type: Boolean,
      default: true
    },
     role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    },

    

    addresses: [addressSchema],

    // Future-ready references (not mandatory now)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

     cartData: {
      type: Object,
      default: {},
    },
  },
  {                
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);
