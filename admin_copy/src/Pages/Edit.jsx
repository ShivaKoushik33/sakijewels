import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------------- CATEGORY MAP ---------------- */

  const categoryMap = {
  TRADITIONAL: [
    { value: "ONE_GRAM_GOLD_NECKLACES", label: "One Gram Gold Necklaces" },
    { value: "PEARL_NECKLACES", label: "Pearl Necklaces" },
    { value: "RUBY_NECKLACES", label: "Ruby Necklaces" },
    { value: "EARINGS_JUMKA", label: "Earings & Jumka" },
    { value: "BANGLES", label: "Bangles" },
    { value: "MANGALSUTRA", label: "Mangalsutra" },
    // { value: "RINGS", label: "Rings" },
    { value: "MODERN_MINIMUM_NECKLACES", label: "Modern Minimum Necklaces" },
    // { value: "NOSE_PINS", label: "Nose Pins" },
    { value: "PENDANTS", label: "Pendants" }
  ],

  FASHION: [
    { value: "FASHION_NECKLACES", label: "Necklaces" },
    { value: "FASHION_EARINGS_JUMKA", label: "Earings & Jumka" },
    { value: "BRACELET_BANGLES", label: "Bracelet & Bangles" },
    { value: "FASHION_RINGS", label: "Rings" },
    { value: "ANKLETS", label: "Anklets" },
    { value: "HAIR_ACCESSORIES", label: "Hair Accessories" },
    { value: "FASHION_MANGALSUTRA", label: "Fashion Mangalsutra" },
    { value: "GIFT_HAMPER", label: "Gift Hamper" }
  ]
};



  /* ---------------- STATE ---------------- */

  const [name, setName] = useState("");
  const [variantType, setVariantType] = useState("TRADITIONAL");
  const [type, setType] = useState(categoryMap.TRADITIONAL[0].value);
  const [description, setDescription] = useState("");

  const [rate, setRate] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [discountRate, setDiscountRate] = useState(0);

  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [bestSeller, setBestSeller] = useState(false);
  const [mostGifted, setMostGifted] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  /* ---------------- FETCH PRODUCT ---------------- */

  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const product = res.data;

      setName(product.name);
      setVariantType(product.variantType);
      setType(product.type);
      setDescription(product.description);

      setRate(product.rate);
      setFinalPrice(product.finalPrice);
      setDiscountRate(product.discountRate);

      setStock(product.stock);
      setIsActive(product.isActive);
      setBestSeller(product.isBestSeller);
      setMostGifted(product.isMostGifted);
      setExistingImages(product.images || []);

    } catch {
      toast.error("Failed to load product");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  /* ---------------- AUTO CALCULATE DISCOUNT ---------------- */

  useEffect(() => {
    if (rate && finalPrice && Number(rate) > 0) {
      const discount =
        ((Number(rate) - Number(finalPrice)) / Number(rate)) * 100;

      setDiscountRate(Math.round(discount));
    }
  }, [rate, finalPrice]);

  /* ---------------- UPDATE HANDLER ---------------- */

  const updateHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("variantType", variantType);
      formData.append("type", type);
      formData.append("description", description);
      formData.append("rate", rate);
      formData.append("finalPrice", finalPrice);
      formData.append("discountRate", discountRate);
      formData.append("stock", stock);
      formData.append("isActive", isActive);
      formData.append("isBestSeller", bestSeller);
      formData.append("isMostGifted", mostGifted);

      if (newImages.length > 0) {
        newImages.forEach((img) => {
          formData.append("images", img);
        });
      }

      await axios.put(
        `${backendUrl}/api/products/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Product updated successfully");
      navigate("/list");

    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={updateHandler} className="flex flex-col gap-4 max-w-lg">

      <h2 className="text-xl font-bold">Edit Product</h2>

      {/* Existing Images */}
      <div>
        <p>Current Images</p>
        <div className="flex gap-2">
          {existingImages.map((img, index) => (
            <img
              key={index}
              src={img.url}
              className="w-16 h-16 object-cover rounded"
              alt="product"
            />
          ))}
        </div>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />

      {/* Variant Type */}
      <select
        value={variantType}
        onChange={(e) => {
          const newVariant = e.target.value;
          setVariantType(newVariant);
          setType(categoryMap[newVariant][0].value);
        }}
        className="border p-2"
      >
        <option value="TRADITIONAL">Traditional Jewellery</option>
        <option value="FASHION">Fashion Jewellery</option>
      </select>

      {/* Type */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2"
      >
        {categoryMap[variantType].map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2"
      />

      {/* Pricing */}
      <input
        type="number"
        placeholder="Actual Price"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        className="border p-2"
      />

      <input
        type="number"
        placeholder="Final Price"
        value={finalPrice}
        onChange={(e) => setFinalPrice(e.target.value)}
        className="border p-2"
      />

      <p className="text-sm text-gray-600">
        Discount: {discountRate}%
      </p>

      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="border p-2"
      />

      {/* Toggles */}
      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => setIsActive(prev => !prev)}
        />
        Active
      </label>

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={bestSeller}
          onChange={() => setBestSeller(prev => !prev)}
        />
        BestSeller
      </label>

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={mostGifted}
          onChange={() => setMostGifted(prev => !prev)}
        />
        MostGifted
      </label>

      <button className="bg-black text-white py-2 rounded">
        Update Product
      </button>

    </form>
  );
};

export default Edit;