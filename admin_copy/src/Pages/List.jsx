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
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value })
          }
        >
          <option value="">All Types</option>
          <option value="RING">Ring</option>
          <option value="NECKLACE">Necklace</option>
          <option value="EARRING">Earring</option>
          <option value="BRACELET">Bracelet</option>
          <option value="BANGLE">Bangle</option>
          <option value="CHAIN">Chain</option>
          <option value="ANKLET">anklet</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          className="border p-2 text-sm rounded"
          onChange={(e) =>
            setFilters({ ...filters, variantType: e.target.value })
          }
        >
          <option value="">All Variants</option>
          <option value="TRADITIONAL">TRADITIONAL</option>
          <option value="WESTERN">WESTERN</option>
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

      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-2 px-2 border bg-gray-100 text-sm font-semibold">
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
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-2 px-2 border text-sm"
          >
            {/* Image */}
            <img
              src={product.images?.[0]?.url}
              alt={product.name}
              className="w-12 h-12 object-cover rounded"
            />

            {/* Name */}
            <p>{product.name}</p>

            {/* Type */}
            <p>{product.type}</p>

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