import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/shopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function BuyNowReview() {
  const navigate = useNavigate();

  const {
    getCartProducts,
    getCartSummary,
    selectedAddress,
    setSelectedAddress,
    delivery_fee,
    backendUrl,
    token
  } = useContext(ShopContext);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔥 COUPON STATES */
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  const cartProducts = getCartProducts();
  const summary = getCartSummary();
  const savings = summary.discount + couponDiscount;
  const itemCount = summary.itemCount;

  const effectiveDeliveryFee = freeShipping ? 0 : delivery_fee;
  const finalTotal =
    summary.subtotal - couponDiscount + effectiveDeliveryFee;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/addresses`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAddresses(res.data);

        if (res.data.length > 0) {
          const defaultAddr = res.data.find(a => a.isDefault);
          setSelectedAddress(defaultAddr || res.data[0]);
        }

      } catch (error) {
        toast.error("Failed to fetch addresses");
      } finally {
        setLoading(false);
      }
    };

    /* 🔥 CHECK FIRST ORDER */
    const checkFirstOrder = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/orders/my-orders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (res.data && res.data.length === 0) {
          setIsFirstOrder(true);
        }
      } catch (error) {
        console.log("Order check failed");
      }
    };

    fetchAddresses();
    checkFirstOrder();

  }, [token]);

  const handleCODOrder = async () => {
  if (!selectedAddress) {
    toast.error("Please select delivery address");
    return;
  }

  try {
    await axios.post(
      `${backendUrl}/api/orders/place-cod`,
      {
        addressId: selectedAddress._id,
        coupon: couponCode
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    toast.success("Order placed successfully!");
    navigate("/");

  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to place order"
    );
  }
};

  /* 🔥 APPLY COUPON FUNCTION */
  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    let discount = 0;
    let freeShip = false;

    if (!code) {
      toast.error("Enter coupon code");
      return;
    }

    // 1️⃣ TSJFIRST
    if (code === "TSJFIRST") {
      if (!isFirstOrder) {
        toast.error("Valid only for first order");
        return;
      }
      if (summary.subtotal >= 599) {
        discount = 100;
      } else {
        toast.error("Order must be above ₹599");
        return;
      }
    }

    // 2️⃣ TSJSSFIRST
    else if (code === "TSJSSFIRST") {
      if (!isFirstOrder) {
        toast.error("Valid only for first order");
        return;
      }
      if (summary.subtotal >= 999) {
        discount = 100;
        freeShip = true;
      } else {
        toast.error("Order must be above ₹999");
        return;
      }
    }

    // 3️⃣ TSJ10
    else if (code === "TSJ10") {
      if (summary.subtotal >= 999) {
        discount = Math.floor(summary.subtotal * 0.10);
      } else {
        toast.error("Order must be above ₹999");
        return;
      }
    }

    // 4️⃣ TSJSS15
    else if (code === "TSJSS15") {
      if (summary.subtotal >= 1499) {
        discount = Math.floor(summary.subtotal * 0.15);
        freeShip = true;
      } else {
        toast.error("Order must be above ₹1499");
        return;
      }
    }

    else {
      toast.error("Invalid coupon code");
      return;
    }

    setCouponDiscount(discount);
    setFreeShipping(freeShip);
    toast.success("Coupon applied successfully");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">

        <h1 className="text-2xl md:text-3xl font-bold text-[#141416] mb-2">
          Review your order
        </h1>

        <p className="text-sm md:text-base text-[#777E90] mb-6 md:mb-8">
          Confirm items and delivery before payment
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">

            {/* ADDRESS SECTION (UNCHANGED) */}
            <section className="bg-white border border-[#E6E8EC] rounded-lg p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold text-[#141416] mb-4">
                Delivery Address
              </h2>

              {addresses.length === 0 ? (
                <button
                  onClick={() => navigate('/profile/addresses/new?redirect=checkout')}
                  className="text-[#901CDB] font-medium"
                >
                  + Add New Address
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  {addresses.map(addr => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`border p-4 rounded cursor-pointer ${
                        selectedAddress?._id === addr._id
                          ? "border-[#901CDB]"
                          : "border-[#E6E8EC]"
                      }`}
                    >
                      <p className="font-medium">{addr.fullName}</p>
                      <p>{addr.phone}</p>
                      <p>{addr.house}, {addr.street}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}

                  <button
                    onClick={() => navigate('/profile/addresses/new?redirect=checkout')}
                    className="text-[#901CDB] font-medium"
                  >
                    + Add New Address
                  </button>
                </div>
              )}
            </section>

            {/* ITEMS SECTION (UNCHANGED) */}
            <section className="bg-white border border-[#E6E8EC] rounded-lg p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold text-[#141416] mb-3 md:mb-4">
                Items
              </h2>

              <div className="flex flex-col gap-4">
                {cartProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 md:gap-4 p-3 md:p-4 border border-[#E6E8EC] rounded-lg"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="font-semibold">
                          ₹{item.price.toLocaleString()}
                        </span>
                        <span className="line-through text-gray-400">
                          ₹{item.originalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SUMMARY SECTION */}
          <div>
            <section className="sticky top-24 bg-white border border-[#E6E8EC] rounded-lg p-4 md:p-6">

              <h2 className="text-lg font-semibold mb-6">
                Order Summary
              </h2>

              <div className="flex justify-between mb-3">
                <span>Subtotal ({itemCount} items)</span>
                <span>₹ {summary.subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between mb-3">
                <span>Discount</span>
                <span className="text-green-600">
                  - ₹ {summary.discount.toLocaleString()}
                </span>
              </div>

              {/* 🔥 COUPON FIELD ADDED */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 border p-2 rounded"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="px-3 bg-[#901CDB] text-white rounded"
                >
                  Apply
                </button>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between mb-3 text-green-600">
                  <span>Coupon Discount</span>
                  <span>- ₹ {couponDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between mb-3">
                <span>Delivery Fee</span>
                <span>₹ {effectiveDeliveryFee}</span>
              </div>

              <div className="border-t my-4"></div>

              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span>₹ {finalTotal.toLocaleString()}</span>
              </div>

              <p className="text-sm text-green-600 mb-6">
                You saved ₹{savings.toLocaleString()} on this order
              </p>

              <div className="flex flex-col gap-3">

  {/* ONLINE PAYMENT */}
  <button
    type="button"
    onClick={() => {
      if (!selectedAddress) {
        toast.error("Please select delivery address");
        return;
      }

      navigate(`/checkout/payment?addressId=${selectedAddress._id}&coupon=${couponCode}&total=${finalTotal}`);
    }}
    className="w-full py-3 bg-[#901CDB] text-white rounded-lg"
  >
    Pay Online
  </button>

  {/* CASH ON DELIVERY */}
  <button
    type="button"
    onClick={handleCODOrder}
    className="w-full py-3 border border-[#901CDB] text-[#901CDB] rounded-lg"
  >
    Cash on Delivery
  </button>

</div>

            </section>
          </div>

        </div>
      </div>
    </div>
  );
}