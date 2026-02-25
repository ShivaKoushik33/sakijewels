import { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Add = ({ token }) => {
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
//     { value: "BRACELET_BANGLES", label: "Bracelet & Bangles" },
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
    { value: "PENDANTS", label: "Pendants" }
  ],

  FASHION: [
    { value: "FASHION_NECKLACES", label: "Necklaces" },
    { value: "FASHION_EARINGS_JUMKA", label: "Earrings & Jumka" },
    { value: "BRACELET_BANGLES", label: "Bracelet & Bangles" },
    { value: "FASHION_RINGS", label: "Rings" },
    { value: "ANKLETS", label: "Anklets" },
    { value: "HAIR_ACCESSORIES", label: "Hair Accessories" },
    { value: "FASHION_MANGALSUTRA", label: "Mangalsutra" },
    { value: "GIFT_HAMPER", label: "Gift Hamper" }
  ]
};

const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState(categoryMap.TRADITIONAL[0].value);
  const [variantType , setVariantType] = useState("TRADITIONAL");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
const [discountRate, setDiscountRate] = useState(0);
  const [stock, setStock] = useState("");

  const [isLoading, setIsLoading] = useState(false); // ✅ Added

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (isLoading) return; // prevent double click

    try {
      setIsLoading(true); // ✅ start loading

      const formData = new FormData();
      const actual = Number(rate);
const final = Number(finalPrice);

if (final > actual) {
  toast.error("Final price cannot be greater than actual price");
  setIsLoading(false);
  return;
}

const calculatedDiscount =
  actual > 0
    ? Math.round(((actual - final) / actual) * 100)
    : 0;

setDiscountRate(calculatedDiscount);

      formData.append("name", name);
      formData.append("type", type);
      formData.append("variantType",variantType);
      formData.append("description", description);
      formData.append("rate", actual);
formData.append("finalPrice", final);
formData.append("discountRate", calculatedDiscount);
      formData.append("stock", stock);

      if (image1) formData.append("images", image1);
      if (image2) formData.append("images", image2);
      if (image3) formData.append("images", image3);
      if (image4) formData.append("images", image4);

      const response = await axios.post(
        backendUrl + "/api/products",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        setName("");
        setDescription("");
        setRate("");
        setFinalPrice("");
        setDiscountRate(0);
        setStock("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);

        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false); // ✅ stop loading
    }
  };

  const discount =
  rate && finalPrice && Number(finalPrice) < Number(rate)
    ? (Math.round(((rate - finalPrice) / rate) * 100)).toFixed(2)
    : 0;

  return (
    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col w-full items-start gap-3'
    >
      {/* Upload Images */}
      <div>
        <p className="mb-2 font-semibold">Upload Images</p>

        <div className="flex gap-3">
          {[image1, image2, image3, image4].map((img, index) => (
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
                  if (index === 0) setImage1(file);
                  if (index === 1) setImage2(file);
                  if (index === 2) setImage3(file);
                  if (index === 3) setImage4(file);
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2 border"
          required
        />
      </div>

      

      {/* Product varinatType */}
      <div>
        <p className="mb-2">Product variant Type</p>
        <select
  value={variantType}
  onChange={(e) => {
    const newVariant = e.target.value;
    setVariantType(newVariant);
    setType(categoryMap[newVariant][0].value); // reset type
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
  value={type}
  onChange={(e) => setType(e.target.value)}
  className="px-3 py-2 border"
>
  {categoryMap[variantType].map((item) => (
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2 border"
          required
        />
      </div>

      {/* Pricing Section */}
      <div className="flex gap-6">
        <div>
          <p className="mb-2">Rate (₹)</p>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="px-3 py-2 border"
            required
          />
        </div>

        <div>
  <p className="mb-2">Final Selling Price (₹)</p>
  <input
    type="number"
    value={finalPrice}
    onChange={(e) => setFinalPrice(e.target.value)}
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
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="px-3 py-2 border"
            required
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-60"
      >
        {isLoading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
};

export default Add;
