import express from "express";
import {
  registerUser,
  loginUser,
  getMyProfile,
  sendOtp,
  verifyOtp,
  updateMyProfile,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  authLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
} from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/send-otp", otpSendLimiter, sendOtp);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);
router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);

export default router;
