import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByVariantCategory,
  getAllProductsAdmin,
  getBestSellers,
  getMostGifted
} from "../controllers/product.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminOnly from "../middlewares/role.middleware.js";
import upload from "../middlewares/multer.js";
const router = express.Router();

/* USER APIs */
router.get("/", getAllProducts);
router.get("/category/:type", getProductsByCategory);
//router.get("/main-category/:variantType", getProductsByVariantCategory);
router.get("/best-sellers", getBestSellers);
router.get("/most-gifted", getMostGifted);
router.get("/:id", getProductById);




/* ADMIN APIs */
router.post("/", authMiddleware, adminOnly, upload.array("images", 4), createProduct);
router.put("/:id", authMiddleware, adminOnly, upload.array("images", 4), updateProduct);
router.delete("/:id", authMiddleware, adminOnly, deleteProduct);
router.get(
  "/admin/products",
  authMiddleware,
  adminOnly,
  getAllProductsAdmin
);

export default router;
