import express from "express";
import { registerUser, loginUser,getMyProfile ,sendOtp, verifyOtp, updateMyProfile} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);     // 📱 phone OTP: request code
router.post("/verify-otp", verifyOtp); // 📱 phone OTP: verify + login
router.get("/me",authMiddleware, getMyProfile);
router.put("/me",authMiddleware, updateMyProfile);

export default router;
