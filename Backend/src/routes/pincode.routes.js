import express from "express";
import rateLimit from "express-rate-limit";
import { lookupPincode } from "../controllers/pincode.controller.js";

const router = express.Router();

// Public and unauthenticated, so it gets its own bucket.
const pincodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many pincode lookups. Please try again shortly." },
});

router.get("/:pin", pincodeLimiter, lookupPincode);

export default router;
