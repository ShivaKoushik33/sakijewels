import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";

import ProductCard from "../components/home/ProductCard";
import { getWishlistData } from "../services/wishlistService";
import { ShopContext } from "../context/shopContext";
export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token} = useContext(ShopContext);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getWishlistData(token);
        console.log("Fetched wishlist data:", data);
        const normalizedWishlist = data.map((item) => ({
              id: item._id,
              name: item.name,
              price: item.finalPrice,
              originalPrice: item.rate,
              discount: item.discountRate,
              rating: item.rating,
              reviews: item.ratingCount,
              image: item.images?.[0]?.url,
              couponPrice: item.finalPrice, // optional if needed
              isBestseller: false, // optional
            }));
        setWishlist(normalizedWishlist || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-[#141416]">Loading...</div>
      </div>
    );
  }

  if (!wishlist.length) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-10">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <h1 className="text-2xl font-bold text-[#141416]">
              Your Wishlist is Empty
            </h1>

            <p className="text-[#777E90]">
              Looks like you haven’t added anything yet.
            </p>

            <Link
              to="/collections"
              className="px-8 py-3 bg-[#901CDB] text-white rounded-lg font-medium hover:bg-[#7A16C0] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#141416] mb-10">
          My Wishlist
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Link
            to="/collections"
            className="px-8 py-3 border-2 border-[#901CDB] rounded-lg font-medium text-[#901CDB] hover:bg-[#901CDB] hover:text-white transition-colors"
          >
            Keep Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
