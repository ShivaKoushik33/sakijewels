import express from "express";
import {
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  createPaymentOrder,
  verifyPaymentAndPlaceOrder,
  getSingleOrder,
  placeOrderCOD
} from "../controllers/order.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminOnly from "../middlewares/role.middleware.js";

const router = express.Router();

/* USER */
router.get("/my-orders", authMiddleware, getUserOrders);

/* ADMIN */
router.get("/", authMiddleware, adminOnly, getAllOrders);
router.put("/:id", authMiddleware, adminOnly, updateOrderStatus);


//admin and user
router.get("/single/:id", authMiddleware, getSingleOrder);

/* USER */
router.post("/create-payment", authMiddleware, createPaymentOrder);
router.post("/verify-payment", authMiddleware, verifyPaymentAndPlaceOrder);
router.post("/place-cod", authMiddleware, placeOrderCOD);


export default router;
