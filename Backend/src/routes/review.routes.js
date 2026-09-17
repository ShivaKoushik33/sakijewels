import express from "express";
import {
  getFeaturedReviews,
  getOrderReviews,
  getProductReviews,
  saveReview,
} from "../controllers/review.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { reviewLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

/* PUBLIC — what the storefront shows */
router.get("/featured", getFeaturedReviews);
router.get("/product/:productId", getProductReviews);

/* CUSTOMER — writing and re-reading your own reviews */
router.get("/order/:orderId", authMiddleware, getOrderReviews);
router.post("/", authMiddleware, reviewLimiter, saveReview);

export default router;
