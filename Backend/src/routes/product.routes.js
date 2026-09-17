import express from "express";
import multer from "multer";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getAllProductsAdmin,
  getBestSellers,
  getMostGifted,
  getNewArrivals,
} from "../controllers/product.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import adminOnly from "../middlewares/role.middleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

/**
 * Turn upload rejections (too large, wrong type, too many files) into a clear
 * 400 for the admin panel instead of a generic server error.
 */
const handleUpload = (req, res, next) => {
  upload.array("images", 4)(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Each image must be 5 MB or smaller"
          : err.code === "LIMIT_FILE_COUNT"
          ? "You can upload at most 4 images"
          : "Image upload failed";
      return res.status(400).json({ message });
    }

    return res.status(400).json({ message: err.message || "Image upload failed" });
  });
};

/* USER APIs */
router.get("/", getAllProducts);
router.get("/category/:type", getProductsByCategory);
router.get("/best-sellers", getBestSellers);
router.get("/most-gifted", getMostGifted);
router.get("/new-arrivals", getNewArrivals);

/* ADMIN APIs — declared before /:id so they are not swallowed by it */
router.get("/admin/products", authMiddleware, adminOnly, getAllProductsAdmin);
router.post("/", authMiddleware, adminOnly, handleUpload, createProduct);
router.put("/:id", authMiddleware, adminOnly, handleUpload, updateProduct);
router.delete("/:id", authMiddleware, adminOnly, deleteProduct);

router.get("/:id", getProductById);

export default router;
