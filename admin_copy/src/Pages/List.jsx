import { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    variantType: "",
    sort: ""
  });

  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const queryParams = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        )
      ).toString();

      const response = await axios.get(
        `${backendUrl}/api/products/admin/products?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching products");
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(response.data.message);
      fetchList();

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error deleting product");
    }
  };

  useEffect(() => {
    fetchList();
  }, [filters]);

  return (
    <>
      <p className="mb-2">All Products List</p>

      {/* 🔹 FILTER SECTION (Minimal, no UI change) */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name"
          className="border p-2 text-sm rounded"
          onChange={(e) =>
            setFilters({ ...filters, name: e.target.value })
          }
        />

          <select
  className="border p-2 text-sm rounded"
  value={filters.type || ""}
  onChange={(e) =>
    setFilters({ ...filters, type: e.target.value })
  }
>
  <option value="">All Types</option>

  {(filters.variantType === "" || filters.variantType === "TRADITIONAL")  && (
    <>
      <option value="ONE_GRAM_GOLD_NECKLACES">1 Gram Gold Necklaces</option>
      <option value="PEARL_NECKLACES">Pearl Necklaces</option>
      <option value="RUBY_NECKLACES">Ruby Necklaces</option>
      <option value="EARINGS_JUMKA">Earrings & Jumka</option>
      <option value="BANGLES">Bangles</option>
      <option value="MANGALSUTRA">Mangalsutra</option>
      {/* <option value="RINGS">Rings (Traditional)</option> */}
      <option value="MODERN_MINIMUM_NECKLACES">Minimal Necklaces</option>
      {/* <option value="NOSE_PINS">Nose Pins</option> */}
      <option value="PENDANTS">Pendants</option>
    </>
  )}

  {(filters.variantType === "" || filters.variantType === "FASHION")  && (
    <>
      <option value="FASHION_NECKLACES">Necklaces (Fashion)</option>
      <option value="FASHION_EARINGS_JUMKA">Earrings & Jumka (Fashion)</option>
      <option value="BRACELET_BANGLES">Bracelet & Bangles</option>
      <option value="FASHION_RINGS">Rings (Fashion)</option>
      <option value="ANKLETS">Anklets</option>
      <option value="HAIR_ACCESSORIES">Hair Accessories</option>
      <option value="FASHION_MANGALSUTRA">Mangalsutra</option>
      <option value="GIFT_HAMPER">Gift Hamper</option>
    </>
  )}
</select>
        <select
          className="border p-2 text-sm rounded"
          onChange={(e) =>
            setFilters({ ...filters, variantType: e.target.value })
          }
        >
          <option value="">All Variants</option>
          <option value="TRADITIONAL">TRADITIONAL</option>
          <option value="FASHION">FASHION</option>
        </select>

        <select
          className="border p-2 text-sm rounded"
          onChange={(e) =>
            setFilters({ ...filters, sort: e.target.value })
          }
        >
          <option value="">Sort</option>
          <option value="price_asc">Price Low → High</option>
          <option value="price_desc">Price High → Low</option>
          <option value="recent">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="flex flex-col gap-2 w-full overflow-x-auto">
        {/* Table Header */}
        <div className="hidden md:grid min-w-[750px] grid-cols-[80px_2fr_1fr_1fr_1fr_120px] items-center py-2 px-2 border bg-gray-100 text-sm font-semibold">
          <b>Image</b>
          <b>Name</b>
          <b>Type</b>
          <b>Price</b>
          <b>Stock</b>
          <b className="text-center">Action</b>
        </div>

        {/* Product List */}
        {list.map((product) => (
          <div
            key={product._id}
            className="grid grid-cols-[60px_1fr_auto] md:min-w-[750px] md:grid-cols-[80px_2fr_1fr_1fr_1fr_120px] items-center gap-2 py-2 px-2 border text-sm"
          >
            {/* Image */}
            <img
              src={product.images?.[0]?.url}
              alt={product.name}
              className="w-12 h-12 object-cover rounded"
            />

            {/* Name */}
            <p className='truncate'>{product.name}</p>

            {/* Type */}
            <p className='truncate'>{product.type}</p>

            {/* Final Price */}
            <p>
              {currency}
              {product.finalPrice}
            </p>

            {/* Stock */}
            <p>{product.stock}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(`/edit/${product._id}`)}
                className="text-blue-500 font-semibold cursor-pointer"
              >
                Edit
              </button>

              <button
                onClick={() => removeProduct(product._id)}
                className="text-red-500 font-bold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;