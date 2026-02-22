import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("RING");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const[bestSeller, setBestSeller] = useState(false);
  const[mostGifted, setMostGifted] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  // Fetch product data
  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/products/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const product = res.data;

      setName(product.name);
      setType(product.type);
      setDescription(product.description);
      setRate(product.rate);
      setDiscountRate(product.discountRate);
      setStock(product.stock);
      setIsActive(product.isActive);
      setExistingImages(product.images || []);
      setBestSeller(product.isBestSeller);
      setMostGifted(product.isMostGifted);
    } catch (error) {
      toast.error("Failed to load product");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  // Update handler
  const updateHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("type", type);
      formData.append("description", description);
      formData.append("rate", rate);
      formData.append("discountRate", discountRate);
      formData.append("stock", stock);
      formData.append("isActive", isActive);
      formData.append("isBestSeller", bestSeller);
      formData.append("isMostGifted", mostGifted);

      // Append new images ONLY if selected
      if (newImages.length > 0) {
        newImages.forEach((img) => {
          formData.append("images", img);
        });
      }

      await axios.put(
        `${backendUrl}/api/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Product updated successfully");
      navigate("/list");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <form onSubmit={updateHandler} className="flex flex-col gap-4 max-w-lg">
      <h2 className="text-xl font-bold">Edit Product</h2>

      {/* Existing Images Preview */}
      <div>
        <p className="mb-2">Current Images</p>
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

      {/* Upload New Images (Optional) */}
      <div>
        <p className="mb-2">Replace Images (Optional)</p>
        <input
          type="file"
          multiple
          onChange={(e) =>
            setNewImages(Array.from(e.target.files))
          }
        />
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2"
      >
        <option value="RING">Ring</option>
        <option value="NECKLACE">Necklace</option>
        <option value="EARRING">Earring</option>
        <option value="BRACELET">Bracelet</option>
        <option value="BANGLE">Bangle</option>
        <option value="CHAIN">Chain</option>
        <option value="OTHER">Other</option>
      </select>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2"
      />

      <input
        type="number"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        className="border p-2"
      />

      <input
        type="number"
        value={discountRate}
        onChange={(e) => setDiscountRate(e.target.value)}
        className="border p-2"
      />

      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="border p-2"
      />

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
