import express from "express";
import { registerUser, loginUser,getMyProfile ,firebaseLogin, updateMyProfile} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/firebase-login", firebaseLogin); // 🔥 NEW
router.get("/me",authMiddleware, getMyProfile);
router.put("/me",authMiddleware, updateMyProfile);

export default router;
