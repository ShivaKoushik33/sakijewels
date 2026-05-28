import express from "express";
import { lookupPincode } from "../controllers/pincode.controller.js";

const router = express.Router();

router.get("/:pin", lookupPincode);

export default router;
