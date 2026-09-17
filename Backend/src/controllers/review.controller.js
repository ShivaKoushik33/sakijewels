import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

const MAX_MESSAGE = 1000;

// The landing page is a shop front: only confident ratings that actually say
// something appear there. Every review still counts toward the product rating.
const FEATURED_MIN_RATING = 4;
const FEATURED_LIMIT = 12;
const PRODUCT_REVIEW_LIMIT = 50;

const parseRating = (value) => {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return rating;
};

/** Shape sent to the storefront — no user ids, no internal fields. */
const toClientReview = (review) => ({
  id: review._id,
  productId: review.product,
  productName: review.productName,
  image: review.productImage,
  name: review.customerName || "Customer",
  rating: review.rating,
  message: review.message,
  date: review.updatedAt || review.createdAt,
});

/** Keeps Product.rating / ratingCount in step with that product's reviews. */
const refreshProductRating = async (productId) => {
  const [summary] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: summary ? Math.round(summary.average * 10) / 10 : 0,
    ratingCount: summary ? summary.count : 0,
  });
};

/**
 * SAVE REVIEW (create, or edit the customer's existing one)
 *
 * Who may review what is decided from the order itself, never from the
 * request: it must be this customer's order, it must be delivered, and the
 * product must be one of its items.
 */
export const saveReview = async (req, res) => {
  try {
    const { orderId, productId, message } = req.body;
    const rating = parseRating(req.body.rating);

    if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid order or product" });
    }

    if (rating === null) {
      return res
        .status(400)
        .json({ message: "Please select a rating between 1 and 5 stars" });
    }

    if (message !== undefined && typeof message !== "string") {
      return res.status(400).json({ message: "Invalid review message" });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "DELIVERED") {
      return res
        .status(400)
        .json({ message: "You can review this order once it has been delivered" });
    }

    const item = order.items.find(
      (orderItem) => orderItem.product?.toString() === productId
    );
    if (!item) {
      return res.status(400).json({ message: "That item is not in this order" });
    }

    const review = await Review.findOneAndUpdate(
      { order: order._id, product: item.product, user: req.user._id },
      {
        rating,
        message: (message || "").trim().slice(0, MAX_MESSAGE),
        customerName: req.user.name || "",
        productName: item.name || "",
        productImage: item.image || "",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    await refreshProductRating(item.product);

    res.status(200).json({
      message: "Thanks for your review",
      review: toClientReview(review),
    });
  } catch (error) {
    console.error("saveReview error:", error);
    res.status(500).json({ message: "Could not save your review" });
  }
};

/** The reviews this customer has already written for one of their orders. */
export const getOrderReviews = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: "Invalid order" });
    }

    const reviews = await Review.find({
      order: orderId,
      user: req.user._id,
    }).lean();

    res.status(200).json(reviews.map(toClientReview));
  } catch (error) {
    console.error("getOrderReviews error:", error);
    res.status(500).json({ message: "Could not load your reviews" });
  }
};

/** Public: every review of one product, newest first. */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(PRODUCT_REVIEW_LIMIT)
      .lean();

    res.status(200).json(reviews.map(toClientReview));
  } catch (error) {
    console.error("getProductReviews error:", error);
    res.status(500).json({ message: "Could not load reviews" });
  }
};

/** Public: what the landing page shows — newest 4 and 5 star reviews. */
export const getFeaturedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      rating: { $gte: FEATURED_MIN_RATING },
      message: { $nin: ["", null] },
    })
      .sort({ createdAt: -1 })
      .limit(FEATURED_LIMIT)
      .lean();

    res.status(200).json(reviews.map(toClientReview));
  } catch (error) {
    console.error("getFeaturedReviews error:", error);
    res.status(500).json({ message: "Could not load reviews" });
  }
};
