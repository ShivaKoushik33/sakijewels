import mongoose from "mongoose";

/**
 * A customer's review of one product from one delivered order.
 *
 * The customer's name and the product's name/image are copied in on purpose:
 * the landing page renders reviews without loading users or products, and a
 * later rename or image change should not rewrite a review that is already
 * published.
 */
const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    customerName: {
      type: String,
      trim: true,
      default: "",
    },

    productName: {
      type: String,
      default: "",
    },

    productImage: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  { timestamps: true }
);

// One review per product per order. Buying the same product again earns
// another chance to review it.
reviewSchema.index({ order: 1, product: 1, user: 1 }, { unique: true });

// A product's own reviews, newest first.
reviewSchema.index({ product: 1, createdAt: -1 });

// The landing page: newest high ratings.
reviewSchema.index({ rating: -1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
