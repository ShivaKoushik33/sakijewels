import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart
} from "../controllers/cart.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.put("/update", authMiddleware, updateCart);
router.delete("/remove/:productId", authMiddleware, removeFromCart);

export default router;
