import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/shopContext";

export default function Cart() {
  const navigate = useNavigate();

  const {
    products,
    cartItems,
    setCartItems,
    addToCart,
    getCartProducts,
    getCartSummary,
    token,
    backendUrl
  } = useContext(ShopContext);

  const [loading] = useState(false);

  // 🔥 UPDATE QUANTITY (Frontend + Backend Sync)
  const updateQuantity = async (itemId, change) => {
    const newQuantity = Math.max(1, cartItems[itemId] + change);

    try {
      const response = await axios.put(
        `${backendUrl}/api/cart/update`,
        {
          itemId,
          quantity: newQuantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Re item response:", response.data.cartData);
      setCartItems(response.data.cartData);
    } catch (error) {
      console.error(error);
    }
  };

  // 🔥 REMOVE ITEM (Frontend + Backend Sync)
  const removeItem = async (itemId) => {
    const updatedCart = { ...cartItems };
    delete updatedCart[itemId];

  

    try {
      const response = await axios.put(
        `${backendUrl}/api/cart/update`,
        {
          itemId,
          quantity: 0
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Remove item response:", response.data.cartData); // Debug log
      setCartItems(response.data.cartData);
    } catch (error) {
      console.error(error);
    }
  };

  const cartProducts = getCartProducts();
  const orderSummary = getCartSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-lg mb-4">Your cart is empty</p>
        <Link
          to="/collections"
          className="px-6 py-3 bg-[#901CDB] text-white rounded-lg"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#141416] mb-6 md:mb-10">
          My Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
            {cartProducts.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 md:p-6 bg-white border border-[#E6E8EC] rounded-lg shadow-sm relative"
              >
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 text-gray-500"
                >
                  ✕
                </button>

                <div className="w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden border">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <h3 className="text-lg font-semibold">{item.name}</h3>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">
                      ₹{item.price ? item.price.toLocaleString() : 0}
                    </span>
                    <span className="line-through text-gray-400">
                      ₹{item.originalPrice ? item.originalPrice.toLocaleString() : 0}
                    </span>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      {item.discount}% OFF
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-9 h-9 bg-[#901CDB] text-white rounded-lg"
                    >
                      -
                    </button>

                    <input
                      type="number"
                      value={item.quantity}
                      readOnly
                      className="w-14 text-center border rounded-lg"
                    />

                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-9 h-9 bg-[#901CDB] text-white rounded-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE SUMMARY */}
          <div>
            <div className="bg-white border rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="flex justify-between mb-3">
                <span>Subtotal</span>
                <span>₹ {orderSummary.subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between mb-3">
                <span>Discount</span>
                <span className="text-green-600">
                  - ₹ {orderSummary.discount.toLocaleString()}
                </span>
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span>₹ {orderSummary.total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => navigate("/checkout/review")}
                className="w-full py-3 bg-[#901CDB] text-white rounded-lg"
              >
                Checkout Securely
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
