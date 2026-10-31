import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import ColorTabs from '../Components/ColorTabs';

const MAX_IMAGES = 6;
let lastDraftKey = 0;

const Add = ({ token, colorOf }) => {
  const navigate = useNavigate();
//   const categoryMap = {
//   TRADITIONAL: [
//     { value: "ONE_GRAM_GOLD_NECKLACES", label: "One Gram Gold Necklaces" },
//     { value: "PEARL_NECKLACES", label: "Pearl Necklaces" },
//     { value: "RUBY_NECKLACES", label: "Ruby Necklaces" },
//     { value: "EARINGS_JUMKA", label: "Earings & Jumka" },
//     { value: "BANGLES", label: "Bangles" },
//     { value: "MANGALSUTRA", label: "Mangalsutra" },
//     { value: "RINGS", label: "Rings" },
//     { value: "MODERN_MINIMUM_NECKLACES", label: "Modern Minimum Necklaces" },
//     { value: "NOSE_PINS", label: "Nose Pins" }
//   ],

//   FASHION: [
//     { value: "FASHION_NECKLACES", label: "Necklaces" },
//     { value: "FASHION_EARINGS_JUMKA", label: "Earings & Jumka" },
//     { value: "BRACELET_BANGLES", label: "Bracelets" },
//     { value: "FASHION_RINGS", label: "Rings" },
//     { value: "ANKLETS", label: "Anklets" },
//     { value: "HAIR_ACCESSORIES", label: "Hair Accessories" }
//   ]
// };
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

  const newDraft = (values = {}) => ({
    key: ++lastDraftKey,
    colorName: "",
    images: Array(MAX_IMAGES).fill(false),
    name: "",
    variantType: "TRADITIONAL",
    type: categoryMap.TRADITIONAL[0].value,
    description: "",
    rate: "",
    finalPrice: "",
    stock: "",
    isNewArrival: false,
    ...values,
  });

  // One unsaved product per color tab.
  const [drafts, setDrafts] = useState(() => [newDraft()]);
  const [activeKey, setActiveKey] = useState(null);
  const active = drafts.find((draft) => draft.key === activeKey) || drafts[0];

  const updateActive = (changes) =>
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.key === active.key ? { ...draft, ...changes } : draft
      )
    );

  // Colors already in the database, and the product new colors attach to.
  const [savedColors, setSavedColors] = useState([]);
  const [anchorId, setAnchorId] = useState(colorOf);

  const [parent, setParent] = useState(null);
  const [parentColorName, setParentColorName] = useState("");

  const [askingColor, setAskingColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");

  const [isLoading, setIsLoading] = useState(false); // ✅ Added

  // Start from the original product's details; photos and stock are per color.
  useEffect(() => {
    if (!colorOf) return;

    const load = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/products/${colorOf}`);
        setParent(data);
        setDrafts((prev) =>
          prev.map((draft) => ({
            ...draft,
            name: data.name,
            variantType: data.variantType,
            type: data.type,
            description: data.description,
            rate: data.rate > data.finalPrice ? data.rate : "",
            finalPrice: data.finalPrice,
          }))
        );

        if (!data.colorGroup) {
          setSavedColors([data]);
          return;
        }

        const siblings = await axios.get(
          `${backendUrl}/api/products/admin/products?colorGroup=${data.colorGroup}&sort=oldest`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedColors(siblings.data.products);
      } catch {
        toast.error("Failed to load the original product");
      }
    };

    load();
  }, [colorOf, token]);

  const isSameColor = (a, b) =>
    a.trim().toLowerCase() === b.trim().toLowerCase();

  const savedColorNames = () => [
    ...savedColors.map((color) => color.colorName || ""),
    ...(parent && !parent.colorName ? [parentColorName] : []),
  ];

  const onlyUnnamedDraft =
    drafts.length === 1 && !drafts[0].colorName.trim();

  const confirmNewColor = () => {
    const colorName = newColorName.trim();
    if (!colorName) {
      toast.error("Enter a color name");
      return;
    }

    const taken = [
      ...savedColorNames(),
      ...drafts.map((draft) => draft.colorName),
    ].some((existing) => isSameColor(existing, colorName));

    if (taken) {
      toast.error(`This item already has the color "${colorName}"`);
      return;
    }

    if (onlyUnnamedDraft) {
      updateActive({ colorName });
    } else {
      const draft = newDraft({
        colorName,
        name: active.name,
        variantType: active.variantType,
        type: active.type,
        description: active.description,
        rate: active.rate,
        finalPrice: active.finalPrice,
      });
      setDrafts((prev) => [...prev, draft]);
      setActiveKey(draft.key);
    }

    setNewColorName("");
    setAskingColor(false);
  };

  const removeDraft = (key) => {
    const remaining = drafts.filter((draft) => draft.key !== key);
    setDrafts(remaining);
    if (active.key === key) setActiveKey(remaining[0].key);
  };

  const draftProblem = (draft) => {
    const label = draft.colorName.trim();
    const needsColor = Boolean(anchorId) || drafts.length > 1;

    if (needsColor && !label) return "Enter a color name";

    const prefix = label ? `${label}: ` : "";
    const final = Number(draft.finalPrice);
    const actual = String(draft.rate).trim() === "" ? final : Number(draft.rate);

    if (!draft.images.some(Boolean)) return `${prefix}Upload at least one image`;
    if (!draft.name.trim()) return `${prefix}Enter the product name`;
    if (!draft.description.trim()) return `${prefix}Enter the description`;
    if (!(final > 0)) return `${prefix}Enter the final selling price`;
    if (final > actual) return `${prefix}Final price cannot be greater than actual price`;
    if (String(draft.stock).trim() === "") return `${prefix}Enter the stock`;

    const duplicate =
      label &&
      (savedColorNames().some((name) => isSameColor(name, label)) ||
        drafts.some(
          (other) =>
            other.key !== draft.key && isSameColor(other.colorName, label)
        ));

    return duplicate ? `This item already has the color "${label}"` : "";
  };

  const buildFormData = (draft, colorOfId) => {
    const formData = new FormData();
    // Actual price is optional; blank means no discount.
    const final = Number(draft.finalPrice);
    const actual = String(draft.rate).trim() === "" ? final : Number(draft.rate);
    const calculatedDiscount =
      actual > 0 ? Math.round(((actual - final) / actual) * 100) : 0;

    formData.append("name", draft.name);
    formData.append("type", draft.type);
    formData.append("variantType", draft.variantType);
    formData.append("description", draft.description);
    if (String(draft.rate).trim() !== "") formData.append("rate", actual);
    formData.append("finalPrice", final);
    formData.append("discountRate", calculatedDiscount);
    formData.append("stock", draft.stock);
    formData.append("isNewArrival", draft.isNewArrival);
    formData.append("colorName", draft.colorName);

    if (colorOfId) {
      formData.append("colorOf", colorOfId);
      formData.append("parentColorName", parentColorName);
    }

    draft.images.forEach((image) => {
      if (image) formData.append("images", image);
    });

    return formData;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (isLoading) return; // prevent double click

    for (const draft of drafts) {
      const problem = draftProblem(draft);
      if (problem) {
        setActiveKey(draft.key);
        toast.error(problem);
        return;
      }
    }

    setIsLoading(true); // ✅ start loading

    // One at a time: the first new product is what the others attach to. On a
    // failure, saved colors leave the tabs so a retry cannot duplicate them.
    let anchor = anchorId;
    let current = null;

    try {
      for (let i = 0; i < drafts.length; i++) {
        current = drafts[i];

        const response = await axios.post(
          backendUrl + "/api/products",
          buildFormData(current, anchor),
          { headers: { Authorization: `Bearer ${token}` } }
        );

        anchor = anchor || response.data.product._id;
        setAnchorId(anchor);

        if (i < drafts.length - 1) {
          const savedKey = current.key;
          setDrafts((prev) => prev.filter((draft) => draft.key !== savedKey));
          setSavedColors((prev) => [...prev, response.data.product]);
        }
      }

      if (colorOf) {
        toast.success(drafts.length > 1 ? "Colors added successfully" : "Color added successfully");
        navigate("/list");
        return;
      }

      const blank = newDraft();
      setDrafts([blank]);
      setActiveKey(blank.key);
      setSavedColors([]);
      setAnchorId(null);
      toast.success(drafts.length > 1 ? "Product and colors added successfully" : "Product created successfully");
    } catch (error) {
      setActiveKey(current?.key ?? null);
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false); // ✅ stop loading
    }
  };

  const { rate, finalPrice } = active;
  const discount =
  rate && finalPrice && Number(finalPrice) < Number(rate)
    ? (Math.round(((rate - finalPrice) / rate) * 100)).toFixed(2)
    : 0;

  const tabs = [
    ...savedColors.map((color) => ({
      key: color._id,
      label: color.colorName || parentColorName || "Original",
      active: false,
      onClick: () => navigate(`/edit/${color._id}`),
    })),
    ...drafts
      .filter((draft) => draft.colorName.trim() || drafts.length > 1)
      .map((draft) => ({
        key: draft.key,
        label: draft.colorName.trim() || "Unnamed",
        active: draft.key === active.key,
        onClick: () => setActiveKey(draft.key),
        onRemove: drafts.length > 1 ? () => removeDraft(draft.key) : undefined,
      })),
  ];

  return (
    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col w-full items-start gap-3'
    >
      {/* Colors of this product */}
      <ColorTabs
        tabs={tabs}
        addLabel={tabs.length === 0 ? "Add Color" : "Add New Color"}
        onAdd={() => setAskingColor(true)}
      />

      {askingColor && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmNewColor();
              }
            }}
            maxLength={40}
            placeholder="Color name, e.g. Red"
            aria-label="New color name"
            className="px-3 py-2 border"
            autoFocus
          />
          <button
            type="button"
            onClick={confirmNewColor}
            className="bg-black text-white px-4 py-2 rounded cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setAskingColor(false);
              setNewColorName("");
            }}
            className="px-4 py-2 border rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Upload Images */}
      <div>
        <p className="mb-2 font-semibold">Upload Images</p>

        <div className="flex flex-wrap gap-3">
          {active.images.map((img, index) => (
            <label key={index} htmlFor={`image${index}`}>
              <img
                className="w-24 h-24 object-cover border cursor-pointer"
                src={
                  !img
                    ? assets.upload_area
                    : URL.createObjectURL(img)
                }
                alt=""
              />
              <input
                type="file"
                id={`image${index}`}
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  updateActive({
                    images: active.images.map((image, i) =>
                      i === index ? file || false : image
                    ),
                  });
                  e.target.value = "";
                }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Product Name */}
      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          type="text"
          value={active.name}
          onChange={(e) => updateActive({ name: e.target.value })}
          className="w-full max-w-[500px] px-3 py-2 border"
          required
        />
      </div>

      {/* Color */}
      <div className="w-full">
        <p className="mb-2">
          Color Name{" "}
          {!colorOf && drafts.length === 1 && (
            <span className="text-gray-400">(optional)</span>
          )}
        </p>
        <input
          type="text"
          value={active.colorName}
          onChange={(e) => updateActive({ colorName: e.target.value })}
          maxLength={40}
          placeholder="e.g. Ruby Red"
          className="w-full max-w-[500px] px-3 py-2 border"
          required={Boolean(colorOf) || drafts.length > 1}
        />
      </div>

      {parent && !parent.colorName && (
        <div className="w-full">
          <p className="mb-2">Color Name of the Original Product</p>
          <input
            type="text"
            value={parentColorName}
            onChange={(e) => setParentColorName(e.target.value)}
            maxLength={40}
            placeholder="e.g. Gold"
            className="w-full max-w-[500px] px-3 py-2 border"
            required
          />
        </div>
      )}

      {/* Product varinatType */}
      <div>
        <p className="mb-2">Product variant Type</p>
        <select
  value={active.variantType}
  onChange={(e) => {
    const newVariant = e.target.value;
    updateActive({
      variantType: newVariant,
      type: categoryMap[newVariant][0].value, // reset type
    });
  }}
  className="px-3 py-2 border"
>
  <option value="TRADITIONAL">Traditional Jewellery</option>
  <option value="FASHION">Fashion Jewellery</option>
</select>
      </div>

      {/* Product Type */}
      <div>
        <p className="mb-2">Product Type</p>
        <select
  value={active.type}
  onChange={(e) => updateActive({ type: e.target.value })}
  className="px-3 py-2 border"
>
  {categoryMap[active.variantType].map((item) => (
    <option key={item.value} value={item.value}>
      {item.label}
    </option>
  ))}
</select>
      </div>

      {/* Description */}
      <div className="w-full">
        <p className="mb-2">Description</p>
        <textarea
          value={active.description}
          onChange={(e) => updateActive({ description: e.target.value })}
          className="w-full max-w-[500px] px-3 py-2 border"
          required
        />
      </div>

      {/* Pricing Section */}
      <div className="flex gap-6">
        <div>
          <p className="mb-2">Actual Price / MRP (₹) <span className="text-gray-400">(optional)</span></p>
          <input
            type="number"
            value={active.rate}
            onChange={(e) => updateActive({ rate: e.target.value })}
            className="px-3 py-2 border"
            placeholder="Leave blank if no discount"
          />
        </div>

        <div>
  <p className="mb-2">Final Selling Price (₹)</p>
  <input
    type="number"
    value={active.finalPrice}
    onChange={(e) => updateActive({ finalPrice: e.target.value })}
    className="px-3 py-2 border"
    required
  />
  <p className="text-sm mt-2 text-green-600">
  Discount: {discount}%
</p>
</div>

        <div>
          <p className="mb-2">Stock</p>
          <input
            type="number"
            value={active.stock}
            onChange={(e) => updateActive({ stock: e.target.value })}
            className="px-3 py-2 border"
            required
          />
        </div>
      </div>

      {/* New Arrival */}
      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={active.isNewArrival}
          onChange={() => updateActive({ isNewArrival: !active.isNewArrival })}
        />
        Mark as New Arrival
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-60"
      >
        {isLoading
          ? "Adding..."
          : drafts.length > 1
          ? `Add ${drafts.length} Colors`
          : colorOf
          ? "Add Color"
          : "Add Product"}
      </button>
    </form>
  );
};

// Keyed so leaving a prefilled "add color" form for plain Add starts blank.
const AddPage = ({ token }) => {
  const [searchParams] = useSearchParams();
  const colorOf = searchParams.get("colorOf");
  return <Add key={colorOf || "new"} token={token} colorOf={colorOf} />;
};

export default AddPage;
