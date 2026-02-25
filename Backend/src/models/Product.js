import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    type: {
  type: String,
  required: true,
  enum: [
    // Traditional
    "ONE_GRAM_GOLD_NECKLACES",
    "PEARL_NECKLACES",
    "RUBY_NECKLACES",
    "EARINGS_JUMKA",
    "BANGLES",
    "MANGALSUTRA",
    "MODERN_MINIMUM_NECKLACES",
    "PENDANTS",

    // Fashion
    "FASHION_NECKLACES",
    "FASHION_EARINGS_JUMKA",
    "BRACELET_BANGLES",
    "FASHION_RINGS",
    "ANKLETS",
    "HAIR_ACCESSORIES",
    "FASHION_MANGALSUTRA",
    "GIFT_HAMPER",
  ]
},

    variantType:{
      type:String,
      required:true,
      enum:["FASHION","TRADITIONAL"]
    },

    description: {
      type: String,
      required: true
    },

    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String }
      }
    ],

    rate: {
      type: Number,
      required: true   // actual price before discount
    },

    discountRate: {
      type: Number,
      default: 0 ,
      min:0,
      max:100       // percentage (0–100)
    },

    finalPrice: {
      type: Number
    },

    rating: {
      type: Number,
      default: 0
    },

    ratingCount: {
      type: Number,
      default: 0
    },

    stock: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },
     createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
      isBestSeller: { type: Boolean, default: false },
      isMostGifted: { type: Boolean, default: false }
    
  },
  {
    timestamps: true
  },
 
);

/**
 * Auto-calculate final price
 */



export default mongoose.model("Product", productSchema);
