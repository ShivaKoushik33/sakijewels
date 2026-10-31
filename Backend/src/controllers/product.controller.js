import fs from "node:fs/promises";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

// High enough that the storefront keeps showing the whole catalogue,
// low enough that a single request cannot ask for unbounded work.
const MAX_PAGE_SIZE = 500;
const MAX_SEARCH_LENGTH = 80;

/**
 * A search term goes into a MongoDB $regex, so its metacharacters have to be
 * neutralised. Passing the raw string let anyone send a pattern like "(a+)+$"
 * and pin the database through catastrophic backtracking.
 */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildProductFilter = (query, { publicOnly }) => {
  const filter = publicOnly ? { isActive: true } : {};

  const { name, type, variantType } = query;

  if (typeof name === "string" && name.trim()) {
    filter.name = {
      $regex: escapeRegex(name.trim().slice(0, MAX_SEARCH_LENGTH)),
      $options: "i",
    };
  }

  if (typeof type === "string" && type.trim()) {
    filter.type = type.trim().toUpperCase();
  }

  if (typeof variantType === "string" && variantType.trim()) {
    filter.variantType = variantType.trim().toUpperCase();
  }

  if (!publicOnly && mongoose.isValidObjectId(query.colorGroup)) {
    filter.colorGroup = query.colorGroup;
  }

  return filter;
};

const SORTS = {
  price_asc: { finalPrice: 1 },
  price_desc: { finalPrice: -1 },
  recent: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

/** Upload the multipart files to Cloudinary, always clearing the temp files. */
// Same limit as the upload middleware (multer.js, files: 6).
const MAX_PRODUCT_IMAGES = 6;

const uploadImages = async (files) => {
  try {
    return await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        return { url: result.secure_url, public_id: result.public_id };
      })
    );
  } finally {
    // Temp files were never removed, so every upload leaked disk space.
    await Promise.all(
      files.map((file) => fs.unlink(file.path).catch(() => {}))
    );
  }
};

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toBoolean = (value) => value === true || value === "true";

/**
 * `finalPrice` is entered by the admin and `discountRate` is derived from it —
 * that is what the admin UI does, so the server derives it the same way rather
 * than trusting a client-computed percentage.
 */
const deriveDiscountRate = (rate, finalPrice) => {
  if (!rate || rate <= 0 || finalPrice === null) return 0;
  if (finalPrice >= rate) return 0;
  return Math.round(((rate - finalPrice) / rate) * 100);
};

const cleanColorName = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 40) : "";

const sameColor = (a, b) => a.toLowerCase() === b.toLowerCase();

const colorTaken = (colorGroup, colorName, excludeId) =>
  Product.exists({
    colorGroup,
    colorName: { $regex: `^${escapeRegex(colorName)}$`, $options: "i" },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

/**
 * ADMIN - Create Product
 *
 * With `colorOf` (an existing product's id) the new product joins that
 * product's colors. `parentColorName` names the existing product if it has no
 * color yet.
 */
export const createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image required" });
    }

    const finalPrice = toNumber(req.body.finalPrice);
    const stock = toNumber(req.body.stock);

    if (finalPrice === null || finalPrice <= 0) {
      return res.status(400).json({ message: "Enter a valid final price" });
    }

    // The actual price (MRP) is optional: left blank, the product simply has
    // no discount and its actual price is its selling price.
    const rateGiven = !isBlank(req.body.rate);
    const rate = rateGiven ? toNumber(req.body.rate) : finalPrice;

    if (rate === null || rate <= 0) {
      return res.status(400).json({ message: "Enter a valid actual price" });
    }
    if (finalPrice > rate) {
      return res
        .status(400)
        .json({ message: "Final price cannot be higher than the rate" });
    }
    if (stock === null || stock < 0) {
      return res.status(400).json({ message: "Enter a valid stock quantity" });
    }

    const colorName = cleanColorName(req.body.colorName);
    let parent = null;
    let parentColorName = "";
    let colorGroup;

    if (!isBlank(req.body.colorOf)) {
      if (!mongoose.isValidObjectId(req.body.colorOf)) {
        return res.status(400).json({ message: "Original product not found" });
      }
      parent = await Product.findById(req.body.colorOf);
      if (!parent) {
        return res.status(400).json({ message: "Original product not found" });
      }

      parentColorName = parent.colorName || cleanColorName(req.body.parentColorName);
      if (!colorName || !parentColorName) {
        return res.status(400).json({ message: "Enter a color name" });
      }

      colorGroup = parent.colorGroup || parent._id;
      if (
        sameColor(colorName, parentColorName) ||
        (await colorTaken(colorGroup, colorName))
      ) {
        return res
          .status(400)
          .json({ message: `This item already has the color "${colorName}"` });
      }
    }

    const uploadedImages = await uploadImages(req.files);

    const product = await Product.create({
      colorName,
      colorGroup,
      name: req.body.name,
      type: req.body.type,
      variantType: req.body.variantType,
      description: req.body.description,
      rate,
      discountRate: deriveDiscountRate(rate, finalPrice),
      finalPrice,
      stock: Math.trunc(stock),
      images: uploadedImages,
      createdBy: req.user._id,
      isActive: req.body.isActive === undefined ? true : toBoolean(req.body.isActive),
      isBestSeller: toBoolean(req.body.isBestSeller),
      isMostGifted: toBoolean(req.body.isMostGifted),
      isNewArrival: toBoolean(req.body.isNewArrival),
    });

    if (parent) {
      await Product.updateOne(
        { _id: parent._id },
        { colorGroup, colorName: parentColorName }
      );
    }

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("createProduct error:", error);
    res.status(500).json({ message: "Could not create product" });
  }
};

/**
 * USER - Get All Products
 *
 * Still returns a plain array so existing clients keep working; `limit` and
 * `page` are optional and capped.
 */
export const getAllProducts = async (req, res) => {
  try {
    const filter = buildProductFilter(req.query, { publicOnly: true });
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(req.query.limit) || MAX_PAGE_SIZE)
    );
    const page = Math.max(1, Number(req.query.page) || 1);

    let dbQuery = Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    // No default sort: the storefront relied on the collection's natural order.
    if (SORTS[req.query.sort]) dbQuery = dbQuery.sort(SORTS[req.query.sort]);

    const products = await dbQuery;

    res.status(200).json(products);
  } catch (error) {
    console.error("getAllProducts error:", error);
    res.status(500).json({ message: "Could not load products" });
  }
};

/**
 * USER - Get Single Product
 */
export const getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const colorVariants = product.colorGroup
      ? await Product.find({ colorGroup: product.colorGroup, isActive: true })
          .select("colorName images stock")
          .sort({ createdAt: 1 })
      : [];

    res.status(200).json({ ...product.toObject(), colorVariants });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ message: "Could not load product" });
  }
};

/**
 * ADMIN - Delete Product (also removes its Cloudinary images)
 */
export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Otherwise the images stay in Cloudinary forever, billed and unreferenced.
    await Promise.all(
      (product.images || [])
        .filter((image) => image.public_id)
        .map((image) =>
          cloudinary.uploader.destroy(image.public_id).catch(() => {})
        )
    );

    res.status(200).json({ message: "Product permanently deleted" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ message: "Could not delete product" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { type } = req.params;

    const products = await Product.find({
      type: String(type).trim().toUpperCase(),
      isActive: true,
    }).limit(MAX_PAGE_SIZE);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this category" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    res.status(500).json({ message: "Could not load products" });
  }
};

export const getProductsByVariantCategory = async (req, res) => {
  try {
    const { variantType } = req.params;

    const products = await Product.find({
      variantType: String(variantType).trim().toUpperCase(),
      isActive: true,
    }).limit(MAX_PAGE_SIZE);

    res.status(200).json(products);
  } catch (error) {
    console.error("getProductsByVariantCategory error:", error);
    res.status(500).json({ message: "Could not load products" });
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const filter = buildProductFilter(req.query, { publicOnly: false });

    let dbQuery = Product.find(filter).limit(MAX_PAGE_SIZE);
    if (SORTS[req.query.sort]) dbQuery = dbQuery.sort(SORTS[req.query.sort]);

    const products = await dbQuery;

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("getAllProductsAdmin error:", error);
    res.status(500).json({ message: "Could not load products" });
  }
};

/**
 * ADMIN - Update Product
 */
export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.body.name !== undefined) product.name = req.body.name;
    if (req.body.type !== undefined) {
      product.type = String(req.body.type).trim().toUpperCase();
    }
    // Previously guarded on a misspelled key ("varaintType"), so the variant
    // could never actually be changed.
    if (req.body.variantType !== undefined) {
      product.variantType = String(req.body.variantType).trim().toUpperCase();
    }
    if (req.body.description !== undefined) {
      product.description = req.body.description;
    }

    const rate = toNumber(req.body.rate);
    const finalPrice = toNumber(req.body.finalPrice);
    const stock = toNumber(req.body.stock);

    if (req.body.finalPrice !== undefined) {
      if (finalPrice === null || finalPrice <= 0) {
        return res.status(400).json({ message: "Enter a valid final price" });
      }
      product.finalPrice = finalPrice;
    }

    if (req.body.rate !== undefined) {
      if (isBlank(req.body.rate)) {
        // Cleared: no discount, the actual price is the selling price.
        product.rate = product.finalPrice;
      } else {
        if (rate === null || rate <= 0) {
          return res.status(400).json({ message: "Enter a valid actual price" });
        }
        product.rate = rate;
      }
    }

    if (product.finalPrice > product.rate) {
      return res
        .status(400)
        .json({ message: "Final price cannot be higher than the actual price" });
    }

    if (req.body.stock !== undefined) {
      if (stock === null || stock < 0) {
        return res.status(400).json({ message: "Enter a valid stock quantity" });
      }
      product.stock = Math.trunc(stock);
    }

    // Kept in step with rate/finalPrice rather than trusting the client value.
    product.discountRate = deriveDiscountRate(product.rate, product.finalPrice);

    if (req.body.isActive !== undefined) {
      product.isActive = toBoolean(req.body.isActive);
    }
    if (req.body.isBestSeller !== undefined) {
      product.isBestSeller = toBoolean(req.body.isBestSeller);
    }
    if (req.body.isMostGifted !== undefined) {
      product.isMostGifted = toBoolean(req.body.isMostGifted);
    }
    if (req.body.isNewArrival !== undefined) {
      product.isNewArrival = toBoolean(req.body.isNewArrival);
    }

    if (req.body.colorName !== undefined) {
      const colorName = cleanColorName(req.body.colorName);
      if (product.colorGroup) {
        if (!colorName) {
          return res.status(400).json({ message: "Enter a color name" });
        }
        if (await colorTaken(product.colorGroup, colorName, product._id)) {
          return res
            .status(400)
            .json({ message: `This item already has the color "${colorName}"` });
        }
      }
      product.colorName = colorName;
    }

    // Images. With `keepImages` (a JSON list of the current image URLs to
    // keep, in order), the admin can remove some images and add new ones:
    // the result is the kept images followed by the uploads. Without it, any
    // upload replaces every image, as before.
    const files = req.files || [];
    const previousImages = product.images || [];
    let removedImages = [];

    if (req.body.keepImages !== undefined) {
      let keepUrls;
      try {
        keepUrls = JSON.parse(req.body.keepImages);
      } catch {
        keepUrls = null;
      }
      if (!Array.isArray(keepUrls)) {
        return res.status(400).json({ message: "Invalid image list" });
      }

      // Only images this product already has can be kept.
      const kept = keepUrls
        .map((url) => previousImages.find((image) => image.url === url))
        .filter(Boolean);

      if (kept.length + files.length === 0) {
        return res.status(400).json({ message: "A product needs at least one image" });
      }
      if (kept.length + files.length > MAX_PRODUCT_IMAGES) {
        return res.status(400).json({
          message: `A product can have at most ${MAX_PRODUCT_IMAGES} images`,
        });
      }

      const uploaded = files.length > 0 ? await uploadImages(files) : [];
      product.images = [...kept, ...uploaded];
      removedImages = previousImages.filter((image) => !kept.includes(image));
    } else if (files.length > 0) {
      product.images = await uploadImages(files);
      removedImages = previousImages;
    }

    await product.save();

    // Only once the product points at its new images. Best effort: the update
    // is already saved, so a Cloudinary hiccup must not report it as failed.
    await Promise.all(
      removedImages
        .filter((image) => image.public_id)
        .map(async (image) => {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (error) {
            console.error("Could not delete old product image:", error.message);
          }
        })
    );

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("updateProduct error:", error);
    res.status(500).json({ message: "Could not update product" });
  }
};

export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({
      isBestSeller: true,
      isActive: true,
    }).limit(4);
    res.json(products);
  } catch (error) {
    console.error("getBestSellers error:", error);
    res.status(500).json({ message: "Could not load products" });
  }
};

export const getMostGifted = async (req, res) => {
  try {
    const products = await Product.find({
      isMostGifted: true,
      isActive: true,
    }).limit(4);
    res.json(products);
  } catch (error) {
    console.error("getMostGifted error:", error);
    res.status(500).json({ message: "Could not load products" });
  }
};

export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({
      isNewArrival: true,
      isActive: true,
    }).limit(4);
    res.json(products);
  } catch (error) {
    console.error("getNewArrivals error:", error);
    res.status(500).json({ message: "Could not load products" });
  }
};
