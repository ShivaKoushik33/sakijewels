import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import ColorTabs from "../Components/ColorTabs";
import ConfirmDialog from "../Components/ConfirmDialog";

const Edit = ({ token, id }) => {
  const navigate = useNavigate();

  /* ---------------- CATEGORY MAP ---------------- */

  const categoryMap = {
  TRADITIONAL: [
    { value: "ONE_GRAM_GOLD_NECKLACES", label: "1 Gram Gold Necklaces" },
    { value: "PEARL_NECKLACES", label: "Pearl Necklaces" },
    { value: "RUBY_NECKLACES", label: "Ruby Necklaces" },
    { value: "EARINGS_JUMKA", label: "Earrings & Jumka" },
    { value: "BANGLES", label: "Bangles" },
    { value: "MANGALSUTRA", label: "Mangalsutra" },
    // { value: "RINGS", label: "Rings" },
    { value: "MODERN_MINIMUM_NECKLACES", label: "Minimal Necklaces" },
    // { value: "NOSE_PINS", label: "Nose Pins" },
    { value: "PENDANTS", label: "Pendants" },
    { value: "MENS_COLLECTION", label: "Mens Collection" }
  ],

  FASHION: [
    { value: "FASHION_NECKLACES", label: "Necklaces" },
    { value: "FASHION_EARINGS_JUMKA", label: "Earrings & Jumka" },
    { value: "BRACELET_BANGLES", label: "Bracelets" },
    { value: "FASHION_RINGS", label: "Rings" },
    { value: "ANKLETS", label: "Anklets" },
    { value: "HAIR_ACCESSORIES", label: "Hair Accessories" },
    { value: "FASHION_MANGALSUTRA", label: "Mangalsutra" },
    { value: "GIFT_HAMPER", label: "Gift Hamper" },
    { value: "MENS_COLLECTION", label: "Mens Collection" }
  ]
};



  /* ---------------- STATE ---------------- */

  const [name, setName] = useState("");
  const [variantType, setVariantType] = useState("TRADITIONAL");
  const [type, setType] = useState(categoryMap.TRADITIONAL[0].value);
  const [description, setDescription] = useState("");
  const [colorName, setColorName] = useState("");
  const [colors, setColors] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [rate, setRate] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [discountRate, setDiscountRate] = useState(0);

  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [bestSeller, setBestSeller] = useState(false);
  const [mostGifted, setMostGifted] = useState(false);
  const [newArrival, setNewArrival] = useState(false);

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
      setColorName(product.colorName || "");

      // Blank when there is no discount, matching how it was entered.
      setRate(product.rate > product.finalPrice ? product.rate : "");
      setFinalPrice(product.finalPrice);
      setDiscountRate(product.discountRate);

      setStock(product.stock);
      setIsActive(product.isActive);
      setBestSeller(product.isBestSeller);
      setMostGifted(product.isMostGifted);
      setNewArrival(product.isNewArrival);
      setExistingImages(product.images || []);

      if (product.colorGroup) {
        const siblings = await axios.get(
          `${backendUrl}/api/products/admin/products?colorGroup=${product.colorGroup}&sort=oldest`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setColors(siblings.data.products);
      } else {
        setColors(product.colorName ? [product] : []);
      }

    } catch {
      toast.error("Failed to load product");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  /* ---------------- IMAGES ---------------- */

  // Kept images plus new ones; same limit as the backend.
  const MAX_IMAGES = 6;
  const freeSlots = MAX_IMAGES - existingImages.length - newImages.length;

  const addImages = (fileList) => {
    const files = Array.from(fileList || []).slice(0, freeSlots);
    if (files.length === 0) return;
    setNewImages((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const removeExistingImage = (url) =>
    setExistingImages((prev) => prev.filter((img) => img.url !== url));

  const removeNewImage = (preview) => {
    URL.revokeObjectURL(preview);
    setNewImages((prev) => prev.filter((img) => img.preview !== preview));
  };

  /* ---------------- AUTO CALCULATE DISCOUNT ---------------- */

  useEffect(() => {
    if (rate && finalPrice && Number(rate) > 0) {
      const discount =
        ((Number(rate) - Number(finalPrice)) / Number(rate)) * 100;

      setDiscountRate(Math.max(0, Math.round(discount)));
    } else {
      // No actual price: no discount.
      setDiscountRate(0);
    }
  }, [rate, finalPrice]);

  /* ---------------- UPDATE HANDLER ---------------- */

  const updateHandler = async (e) => {
    e.preventDefault();

    if (existingImages.length + newImages.length === 0) {
      toast.error("Add at least one image");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("variantType", variantType);
      formData.append("type", type);
      formData.append("description", description);
      formData.append("colorName", colorName);
      formData.append("rate", rate);
      formData.append("finalPrice", finalPrice);
      formData.append("discountRate", discountRate);
      formData.append("stock", stock);
      formData.append("isActive", isActive);
      formData.append("isBestSeller", bestSeller);
      formData.append("isMostGifted", mostGifted);
      formData.append("isNewArrival", newArrival);

      // The current images still shown (in order), then any new uploads.
      formData.append(
        "keepImages",
        JSON.stringify(existingImages.map((img) => img.url))
      );
      newImages.forEach((img) => {
        formData.append("images", img.file);
      });

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

  /* ---------------- DELETE ---------------- */

  const hasMultipleColors = colors.length > 1;

  const deleteProducts = (ids) =>
    Promise.allSettled(
      ids.map((productId) =>
        axios.delete(`${backendUrl}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );

  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);

    if (pendingDelete === "color") {
      const [result] = await deleteProducts([id]);
      setDeleting(false);
      setPendingDelete(null);

      if (result.status === "rejected") {
        toast.error(result.reason.response?.data?.message || "Could not delete color");
        return;
      }

      toast.success("Color deleted");
      const next = colors.find((color) => color._id !== id);
      navigate(`/edit/${next._id}`, { replace: true });
      return;
    }

    const ids = hasMultipleColors ? colors.map((color) => color._id) : [id];
    const results = await deleteProducts(ids);
    const failed = results.filter((result) => result.status === "rejected").length;
    setDeleting(false);
    setPendingDelete(null);

    if (failed > 0) {
      toast.error(`Could not delete ${failed} of ${ids.length} colors. Please try again.`);
      fetchProduct();
      return;
    }

    toast.success("Product deleted");
    navigate("/list", { replace: true });
  };

  /* ---------------- UI ---------------- */

  return (
    <>
    <form onSubmit={updateHandler} className="flex flex-col gap-4 max-w-lg">

      <h2 className="text-xl font-bold">Edit Product</h2>

      {/* Colors of this product; each tab opens that color for editing */}
      <ColorTabs
        tabs={colors.map((color) => ({
          key: color._id,
          label: color.colorName || "Unnamed",
          active: color._id === id,
          onClick: () => navigate(`/edit/${color._id}`),
        }))}
        addLabel={colors.length === 0 ? "Add Color" : "Add New Color"}
        onAdd={() => navigate(`/add?colorOf=${id}`)}
      />

      {/* Images: remove any current image, add new ones, up to 6 in all */}
      <div>
        <p>Images ({existingImages.length + newImages.length}/{MAX_IMAGES})</p>
        <p className="text-xs text-gray-500 mb-2">
          The first image is the main one shown in the shop. Removed images are
          deleted when you press Update Product.
        </p>

        <div className="flex flex-wrap gap-2">
          {existingImages.map((img) => (
            <div key={img.url} className="relative">
              <img
                src={img.url}
                className="w-20 h-20 object-cover rounded border"
                alt="product"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(img.url)}
                aria-label="Remove image"
                title="Remove image"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}

          {newImages.map((img) => (
            <div key={img.preview} className="relative">
              <img
                src={img.preview}
                className="w-20 h-20 object-cover rounded border-2 border-green-500"
                alt="new upload"
              />
              <span className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-green-500 text-white rounded-b">
                New
              </span>
              <button
                type="button"
                onClick={() => removeNewImage(img.preview)}
                aria-label="Remove new image"
                title="Remove image"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}

          {freeSlots > 0 && (
            <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed rounded text-gray-500 text-xs cursor-pointer hover:bg-gray-50">
              <span className="text-2xl leading-none">+</span>
              Add image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                hidden
                onChange={(e) => {
                  addImages(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />

      <p className="text-sm text-gray-600 -mb-3">Color Name</p>
      <input
        value={colorName}
        onChange={(e) => setColorName(e.target.value)}
        maxLength={40}
        placeholder="e.g. Ruby Red"
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
      <p className="text-sm text-gray-600 -mb-3">
        Actual Price / MRP (optional — leave blank if no discount)
      </p>
      <input
        type="number"
        placeholder="Actual Price (optional)"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        className="border p-2"
      />

      <p className="text-sm text-gray-600 -mb-3">Selling Price (₹)</p>
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

      <p className="text-sm text-gray-600 -mb-3">Stock</p>
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

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={newArrival}
          onChange={() => setNewArrival(prev => !prev)}
        />
        NewArrival
      </label>

      <button className="bg-black text-white py-2 rounded">
        Update Product
      </button>

      <div className="flex gap-3">
        {hasMultipleColors && (
          <button
            type="button"
            onClick={() => setPendingDelete("color")}
            className="flex-1 py-2 rounded border border-red-500 text-red-500 cursor-pointer"
          >
            Delete Color
          </button>
        )}
        <button
          type="button"
          onClick={() => setPendingDelete("product")}
          className="flex-1 py-2 rounded bg-red-500 text-white cursor-pointer"
        >
          Delete Product
        </button>
      </div>

    </form>

    <ConfirmDialog
      open={Boolean(pendingDelete)}
      title={pendingDelete === "color" ? "Delete this color?" : "Delete this product?"}
      message={
        pendingDelete === "color"
          ? `The "${colorName}" color of "${name}" will be removed from the store. The other colors stay. This cannot be undone.`
          : hasMultipleColors
          ? `"${name}" and all ${colors.length} of its colors will be removed from the store. This cannot be undone.`
          : `"${name}" will be removed from the store. This cannot be undone.`
      }
      confirmText={pendingDelete === "color" ? "Delete color" : "Delete product"}
      busy={deleting}
      onConfirm={confirmDelete}
      onCancel={() => setPendingDelete(null)}
    />
    </>
  );
};

// Keyed so switching color tabs loads that color from fresh state.
const EditPage = ({ token }) => {
  const { id } = useParams();
  return <Edit key={id} token={token} id={id} />;
};

export default EditPage;