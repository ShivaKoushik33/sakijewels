import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { getProductDetailsData } from "../services/productDetailsService";
import RelatedProducts from "../components/product/RelatedProducts";
import { ShopContext } from "../context/shopContext";
import { toast } from "react-toastify";
import "@fontsource/lato";
import "@fontsource/roboto";
import left_arrow from "../assets/images/left_arrow.svg?url";
import right_arrow from "../assets/images/right_arrow.svg?url";
import share from "../assets/images/share.svg?url";
import { addToWishlistApi,removeFromWishlistApi } from "../services/wishlistService";
import { getWishlistData } from "../services/wishlistService";


export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, token, navigate } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  // Dummy functions for wishlist and share
 const handleAddToWishlist = async () => {
  if (!token) {
    toast.info("Please login to use wishlist");
    navigate("/login");
    return;
  }

  try {
    if (!isWishlisted) {
      await addToWishlistApi(product._id, token);
      toast.success("Added to wishlist");
      setIsWishlisted(true);
    } else {
      await removeFromWishlistApi(product._id, token);
      toast.success("Removed from wishlist");
      setIsWishlisted(false);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
  }
};

  const handleShare = () => {
    toast.info("Share feature coming soon!");
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? (product?.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => 
      prev === (product?.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };
  
  
  

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    async function fetchData() {
      try {
        const data = await getProductDetailsData(id);

        setProduct(data.product);
        setReviews(data.reviews || []);

        // Check if product is in wishlist
        if (token) {
        const wishlist = await getWishlistData(token);
        const exists = wishlist.some(
          (item) => item._id === id
        );
        setIsWishlisted(exists);
      }
        
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfc]" style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* Main Product Section */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* LEFT SIDE - Square Images */}
          <div className="lg:col-span-1">
            {/* Main Image Container - SQUARE SHAPE */}
            <div className="relative w-full aspect-square rounded-[12px] overflow-hidden bg-white mb-4">
              {product?.images?.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 bg-[#fcfdfc]">
                  No image available
                </div>
              )}

              {/* Rating Badge - Bottom Left */}
              {product?.rating && (
                <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-1.5">
                  <span className="text-yellow-500 text-base">★</span>
                  <span className="text-[#141416] font-semibold text-sm">{product.rating.toFixed(1)}</span>
                  <span className="text-[#141416] text-xs">({product.reviews_count || 0})</span>
                </div>
              )}
            </div>

            {/* Navigation Controls and Thumbnails - Below Image */}
            <div className="flex items-center gap-4">
              {/* Left Arrow Button */}
              {product?.images?.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="size-6  p-2 hover:bg-[#f8f8f9] transition-all duration-200"
                  aria-label="Previous image"
                >
                  <img
                    src={left_arrow}
                    alt="Previous"
                    className="w-5 h-5"
                  />
                </button>
              )}

              {/* Thumbnails - Flex with horizontal scroll */}
              <div className="flex gap-2 overflow-x-auto flex-1">
                {product?.images?.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-[8px] shrink-0 overflow-hidden transition-all duration-200 ${
                      selectedImage === index
                        ? "border-[#4d0f75] shadow-md"
                        : "border-[#e6e8ec] hover:border-[#d0d0d0]"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Right Arrow Button */}
              {product?.images?.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="size-6  p-2 hover:bg-[#f8f8f9] transition-all duration-200"
                  aria-label="Next image"
                >
                  <img
                    src={right_arrow}
                    alt="Next"
                    className="w-5 h-5"
                  />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - Details Card */}
          <div className="lg:col-span-1">
            {/* White Card Container for Details */}
            <div className="">
              {/* Product Title & Price */}
              <div className="flex flex-col gap-4">
                {/* Title and Action Buttons */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h1
                      className="text-lg md:text-xl font-semibold text-[#121212] mb-1"
                      style={{ fontFamily: "'Lato', sans-serif", fontWeight: 600 }}
                    >
                      {product?.name}
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                      {product?.material}
                    </p>
                  </div>

                  {/* Wishlist and Share Icons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToWishlist}
                      className="p-2 rounded-lg hover:bg-[#f8f8f9] transition-all duration-200"
                      aria-label="Add to wishlist"
                      title="Add to wishlist"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`${
                        isWishlisted ? "text-red-500" : "text-[#121212]"
                      } hover:text-[#901CDB]`}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-lg hover:bg-[#f8f8f9] transition-all duration-200"
                      aria-label="Share product"
                      title="Share product"
                    >
                      <img
                        src={share}
                        alt="Share"
                        className="w-5 h-5"
                      />
                    </button>
                  </div>
                </div>

                {/* Rating */}
                {product?.rating && (
                  <div className="flex items-center gap-3 pb-3">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs" style={{ fontFamily: "'Lato', sans-serif" }}>
                        {product.rating}
                      </span>
                      <span className="text-yellow-400 text-sm">★</span>
                    </div>
                    <span className="text-gray-600 text-xs" style={{ fontFamily: "'Lato', sans-serif" }}>
                      ({product.ratingCount || 323} Reviews)
                    </span>
                  </div>
                )}

                {/* Price Section */}
                <div className="space-y-2 pb-4">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span
                      className="text-2xl md:text-3xl font-bold text-[#121212]"
                      style={{ fontFamily: "'Lato', sans-serif", fontWeight: 600 }}
                    >
                      ₹{product?.finalPrice?.toLocaleString()}
                    </span>

                    {product?.rate && (
                      <span className="text-sm line-through text-gray-400" style={{ fontFamily: "'Lato', sans-serif" }}>
                        ₹{product.rate.toLocaleString()}
                      </span>
                    )}

                    {product?.discountRate > 0 && (
                      <div className="bg-[#34C759] text-white px-2.5 py-1 rounded text-xs font-bold" style={{ fontFamily: "'Lato', sans-serif" }}>
                        {product.discountRate}% OFF
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs" style={{ fontFamily: "'Lato', sans-serif" }}>
                    MRP incl. of all taxes
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2 pb-4">
                  <p className="text-gray-700 text-xs md:text-sm leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif" }}>
                    {product?.description}
                  </p>
                  <p className="text-[#121212] font-medium text-xs" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>
                    Made With Pure 925 Silver
                  </p>
                </div>

                {/* Finish/Options Selection */}
                {product?.finishes && product.finishes.length > 0 && (
                  <div className="pb-4">
                    <label className="block text-[#121212] font-medium mb-3 text-sm" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>
                      Choose your finish
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {product.finishes.map((finish, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedFinish(finish)}
                          className={`px-4 py-2 border-2 rounded-lg font-medium transition-all duration-200 text-xs ${
                            selectedFinish === finish
                              ? "border-[#901CDB] bg-[#901CDB] text-white"
                              : "border-[#e6e8ec] bg-white text-[#121212] hover:border-[#901CDB]"
                          }`}
                          style={{ fontFamily: "'Lato', sans-serif" }}
                        >
                          {finish}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Estimator */}
                <div className="pb-6">
                  <label className="block text-[#121212] font-medium mb-3 text-sm" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>
                    Estimated Delivery Time
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Your Pincode"
                      className="flex-1 px-3 py-2 border border-[#e6e8ec] rounded-lg focus:outline-none focus:border-[#901CDB] focus:ring-1 focus:ring-[#901CDB] transition-all text-xs"
                      style={{ fontFamily: "'Roboto', sans-serif" }}
                    />
                    <button className="bg-[#901CDB] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#7A16C0] transition-colors text-xs" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 600 }}>
                      Check
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    className="flex-1 px-4 py-2.5 border-2 border-[#901CDB] text-[#901CDB] rounded-lg font-medium hover:bg-[#f8f8f9] transition-colors text-sm"
                    style={{ fontFamily: "'Lato', sans-serif", fontWeight: 600 }}
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => {
                      if (!token) {
                        toast.info("Please login to add items to cart");
                        navigate("/login");
                        return;
                      }
                      addToCart(product._id);
                      toast.success("Added to cart!");
                    }}
                    className="flex-1 px-4 py-2.5 bg-[#901CDB] text-white rounded-lg font-medium hover:bg-[#7A16C0] transition-colors text-sm"
                    style={{ fontFamily: "'Lato', sans-serif", fontWeight: 600 }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="border-t border-[#e6e8ec] mt-12 md:mt-16">
        <RelatedProducts currentProduct={product} />
      </div>
    </div>
  );
}