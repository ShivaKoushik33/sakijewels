import express from "express";
import { razorpayWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

/* PUBLIC — called by Razorpay, authenticated by its signature, not a token */
router.post("/razorpay", razorpayWebhook);

export default router;
