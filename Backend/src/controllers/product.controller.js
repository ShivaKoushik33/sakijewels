// import Product from "../models/Product.js";

/**
 * ADMIN – Create Product
 */
// import cloudinary from "../config/cloudinary.js";
import Product from "../models/Product.js";
import { v2 as cloudinary } from 'cloudinary';
export const createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image required" });
    }

    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        return {
          url: result.secure_url,
          public_id: result.public_id,
        };
      })
    );

    const product = await Product.create({
      name: req.body.name,
      type: req.body.type,
      variantType:req.body.variantType,
      description: req.body.description,
      rate: req.body.rate,
      discountRate: req.body.discountRate,
      finalPrice: req.body.finalPrice,
      stock: req.body.stock,
      images: uploadedImages,
      createdBy: req.user._id,
      isActive: req.body.isActive,
      isBestSeller: req.body.isBestSeller || false,
      isMostGifted: req.body.isMostGifted || false
      
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * USER – Get All Products
 */
export const getAllProducts = async (req, res) => {
  try {
    const { name, type, variantType, sort } = req.query;

    let filter = { isActive: true };

    // 🔎 Filter by name (search)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // 🏷 Filter by type
    if (type) {
      filter.type = type.trim().toUpperCase();
    }

    // 🧬 Filter by variantType
    if (variantType) {
      filter.variantType = variantType.trim().toUpperCase();
    }

    let query = Product.find(filter);

    // 🔄 Sorting
    if (sort) {
      switch (sort) {
        case "price_asc":
          query = query.sort({ finalPrice: 1 });
          break;
        case "price_desc":
          query = query.sort({ finalPrice: -1 });
          break;
        case "recent":
          query = query.sort({ createdAt: -1 });
          break;
        case "oldest":
          query = query.sort({ createdAt: 1 });
          break;
      }
    }

    const products = await query;

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * USER – Get Single Product
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADMIN – Update Product
 */
// export const updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     res.status(200).json({
//       message: "Product updated",
//       product
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

/**
 * ADMIN – Delete (Deactivate) Product
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product permanently deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const getProductsByCategory = async (req, res) => {
  try {
    const { type } = req.params;

    const products = await Product.find({
      type: type.trim().toUpperCase(),
      isActive: true
    });

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found for this category"
      });
    }

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsByVariantCategory = async (req, res) => {
  try {
    const { variantType } = req.params;

    const products = await Product.find({
      variantType: variantType.trim().toUpperCase(),
      isActive: true
    });

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found for this category"
      });
    }

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllProductsAdmin = async (req, res) => {
  try {
    const { name, type, variantType, sort } = req.query;

    let filter = { isActive: true };

    // 🔎 Filter by name (search)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // 🏷 Filter by type
    if (type) {
      filter.type = type.trim().toUpperCase();
    }

    // 🧬 Filter by variantType
    if (variantType) {
      filter.variantType = variantType.trim().toUpperCase();
    }

    let query = Product.find(filter);

    // 🔄 Sorting
    if (sort) {
      switch (sort) {
        case "price_asc":
          query = query.sort({ finalPrice: 1 });
          break;
        case "price_desc":
          query = query.sort({ finalPrice: -1 });
          break;
        case "recent":
          query = query.sort({ createdAt: -1 });
          break;
        case "oldest":
          query = query.sort({ createdAt: 1 });
          break;
      }
    }

    const products = await query;

    res.status(200).json(
      {success:true,
        products});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔹 Update text fields if provided
    if (req.body.name !== undefined) product.name = req.body.name;
    if (req.body.type !== undefined) product.type = req.body.type.trim().toUpperCase();
    if (req.body.varaintType !== undefined) product.variantType = req.body.variantType.trim().toUpperCase();
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.rate !== undefined) product.rate = req.body.rate;
    if (req.body.finalPrice !== undefined) product.finalPrice = req.body.finalPrice;
    if (req.body.discountRate !== undefined) product.discountRate = req.body.discountRate;
    if (req.body.stock !== undefined) product.stock = req.body.stock;

    // 🔹 Boolean conversion
    if (req.body.isActive !== undefined) {
      product.isActive = req.body.isActive === "true" || req.body.isActive === true;
    }
    if (req.body.isBestSeller !== undefined) {
      product.isBestSeller = req.body.isBestSeller === "true" || req.body.isBestSeller === true;
    }

    if (req.body.isMostGifted !== undefined) {
      product.isMostGifted = req.body.isMostGifted === "true" || req.body.isMostGifted === true;
    }

    // 🔹 If new images uploaded → replace old images
    if (req.files && req.files.length > 0) {

      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });

          return {
            url: result.secure_url,
            public_id: result.public_id,
          };
        })
      );

      product.images = uploadedImages;
    }

    // 🔹 Save (this triggers pre-save finalPrice calculation)
    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBestSellers = async (req, res) => {
  const products = await Product
    .find({ isBestSeller: true, isActive: true })
    .limit(4);

  res.json(products);
};


export const getMostGifted = async (req, res) => {
  const products = await Product
    .find({ isMostGifted: true, isActive: true })
    .limit(4);

  res.json(products);
};



