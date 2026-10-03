import express from "express";
import {
  getDashboard,
  getCustomers,
  getCustomer,
} from "../controllers/dashboard.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminOnly from "../middlewares/role.middleware.js";

const router = express.Router();

/* ADMIN */
router.get("/", authMiddleware, adminOnly, getDashboard);
router.get("/customers", authMiddleware, adminOnly, getCustomers);
router.get("/customers/:id", authMiddleware, adminOnly, getCustomer);

export default router;
