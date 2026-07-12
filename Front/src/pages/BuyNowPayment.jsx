import { useState, useContext,useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

export default function BuyNowPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addressId = searchParams.get("addressId");
  const couponCode = searchParams.get("coupon");
  const mode = searchParams.get("mode");

  // Clean values from the review page (mirror the backend math exactly).
  const subtotal = Number(searchParams.get("subtotal")) || 0;
  const couponDiscount = Number(searchParams.get("couponDiscount")) || 0;
  const freeShipping = searchParams.get("freeShipping") === "1";

  // Charge constants — MUST match backend (order.controller.js).
  const DELIVERY_FEE = 49;
  const COD_CHARGE = 29;

  const deliveryFee = freeShipping ? 0 : DELIVERY_FEE;
  // Prepaid discount is 3% of item subtotal only (not delivery/cod).
  const prepaidDiscount = mode === "online" ? Math.floor(subtotal * 0.03) : 0;
  const codCharge = mode === "cod" ? COD_CHARGE : 0;

  // Coupon + prepaid discounts apply to item subtotal only; fees added after.
  const grandTotal =
    subtotal - couponDiscount - prepaidDiscount + deliveryFee + codCharge;

 const { backendUrl, token, setCartItems, getUserCart, buyNowItem, setBuyNowItem, selectedAddress, getCartProducts } = useContext(ShopContext);

 const buyNowPayload = buyNowItem
   ? { productId: buyNowItem.productId, quantity: buyNowItem.quantity }
   : null;

  const [loading, setLoading] = useState(false);
  const [payMsg, setPayMsg] = useState("");   // inline payment error
  const [address, setAddress] = useState(null);

  // Items to show: single buy-now item, or the in-stock cart products.
  const displayItems = buyNowItem
    ? [{
        id: buyNowItem.productId,
        name: buyNowItem.name,
        image: buyNowItem.image,
        quantity: buyNowItem.quantity,
      }]
    : getCartProducts().filter((p) => p.stock > 0);

  // Expected delivery = 7 days from today (order placed now).
  const deliveryDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  })();

useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  // Resolve the delivery address: prefer the one selected in review,
  // otherwise fetch the user's addresses and match by id (handles refresh).
  useEffect(() => {
    if (selectedAddress && selectedAddress._id === addressId) {
      setAddress(selectedAddress);
      return;
    }
    if (!token || !addressId) return;

    const fetchAddress = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/addresses`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const match = (res.data || []).find((a) => a._id === addressId);
        if (match) setAddress(match);
      } catch (error) {
        // silent — address section just won't show
      }
    };
    fetchAddress();
  }, [selectedAddress, addressId, token, backendUrl]);

const handlePayment = async () => {
  setPayMsg("");
  if (!addressId) {
    setPayMsg("Invalid address");
    return;
  }

  try {
    setLoading(true);

    // 🟢 COD FLOW
    if (mode === "cod") {
      const { data: codData } = await axios.post(
        `${backendUrl}/api/orders/place-cod`,
        {
          addressId,
          coupon: couponCode || null,
          buyNow: buyNowPayload
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (buyNowPayload) {
        setBuyNowItem(null);
      } else {
        await getUserCart(token);
      }
      const codOrderId = codData?.order?._id;
      navigate(codOrderId ? `/orders/${codOrderId}` : "/orders");
      return;
    }

    // 🟣 ONLINE PAYMENT FLOW

    // Call backend to create Razorpay order
    const { data } = await axios.post(
      `${backendUrl}/api/orders/create-payment`,
      {
        coupon: couponCode || null,
        addressId,
        buyNow: buyNowPayload
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { razorpayOrder } = data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      // Use the backend's authoritative order amount (paise) so the charge
      // always matches what the server computed.
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Saki Jewels",
      description: "Order Payment",
      order_id: razorpayOrder.id,

      handler: async function (response) {
        try {
          const { data: verifyData } = await axios.post(
            `${backendUrl}/api/orders/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              addressId,
              coupon: couponCode || null,
              buyNow: buyNowPayload
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (buyNowPayload) {
            setBuyNowItem(null);
          } else {
            await getUserCart(token);
          }
          const orderId = verifyData?.order?._id;
          navigate(orderId ? `/orders/${orderId}` : "/orders");

        } catch (error) {
          setPayMsg(
            error?.response?.data?.message ||
            "Payment verification failed. Please retry."
          );
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: function () {
          setPayMsg("Payment cancelled");
          setLoading(false);
        }
      },

      theme: {
        color: "#901CDB"
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      setPayMsg(response.error.description || "Payment failed");
      setLoading(false);
    });

    rzp.open();

  } catch (error) {
    setPayMsg(
      error?.response?.data?.message || "Payment initiation failed"
    );
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">

        <h1 className="text-2xl md:text-3xl font-bold text-[#141416] mb-2">
          Payment
        </h1>

        <p className="text-sm md:text-base text-[#777E90] mb-6 md:mb-8">
          Complete your secure payment
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <section className="sticky top-24 bg-white border border-[#E6E8EC] rounded-lg p-4 md:p-6">

              <h2 className="text-base md:text-lg font-semibold text-[#141416] mb-4 md:mb-6">
                Order Summary
              </h2>

              {/* DELIVERY ADDRESS */}
              {address && (
                <div className="mb-5 pb-5 border-b border-[#E6E8EC]">
                  <p className="text-xs font-semibold text-[#777E90] uppercase tracking-wide mb-2">
                    Delivery Address
                  </p>
                  <p className="text-sm font-medium text-[#141416]">{address.fullName}</p>
                  {address.phone && <p className="text-sm text-[#353945]">{address.phone}</p>}
                  <p className="text-sm text-[#353945]">
                    {[address.house, address.street].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-sm text-[#353945]">
                    {[address.city, address.state].filter(Boolean).join(', ')}
                    {address.pincode ? ` - ${address.pincode}` : ''}
                  </p>
                </div>
              )}

              {/* EXPECTED DELIVERY DATE */}
              <div className="mb-5 pb-5 border-b border-[#E6E8EC]">
                <p className="text-xs font-semibold text-[#777E90] uppercase tracking-wide mb-1">
                  Expected Delivery
                </p>
                <p className="text-sm font-medium text-[#141416]">{deliveryDate}</p>
              </div>

              {/* ITEMS (name, image, quantity only) */}
              {displayItems.length > 0 && (
                <div className="mb-5 pb-5 border-b border-[#E6E8EC]">
                  <p className="text-xs font-semibold text-[#777E90] uppercase tracking-wide mb-3">
                    Items ({displayItems.length})
                  </p>
                  <div className="flex flex-col gap-3">
                    {displayItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#E6E8EC] flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#141416] truncate">{item.name}</p>
                          <p className="text-xs text-[#777E90] mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRICE BREAKDOWN — discounts apply to item amount only */}
              <div className="flex flex-col gap-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-[#777E90]">Items Total</span>
                  <span className="text-[#141416]">₹ {subtotal.toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#777E90]">Coupon Discount</span>
                    <span className="text-green-600">- ₹ {couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                {prepaidDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#777E90]">Prepaid Discount (3%)</span>
                    <span className="text-green-600">- ₹ {prepaidDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-[#777E90]">Delivery Fee</span>
                  <span className="text-[#141416]">
                    {deliveryFee === 0 ? 'FREE' : `₹ ${deliveryFee.toLocaleString()}`}
                  </span>
                </div>

                {codCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#777E90]">COD Charge</span>
                    <span className="text-[#141416]">₹ {codCharge.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-4 border-t pt-4">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  ₹ {grandTotal.toLocaleString()}
                </span>
              </div>

              <button
  type="button"
  onClick={handlePayment}
  disabled={loading}
  className="w-full py-3 bg-[#901CDB] text-white rounded-lg"
>
  {loading
    ? "Processing..."
    : mode === "cod"
    ? "Place Order"
    : "Pay Now"}
</button>

{payMsg && (
  <p className="text-red-600 text-sm mt-3">{payMsg}</p>
)}
<button
  type="button"
  onClick={() => navigate("/checkout/review")}
  className="w-full py-3 mt-3 bg-[#D4A017] text-white rounded-lg"
>
  Back
</button>

            </section>
          </div>

        </div>
      </div>
    </div>
  );
}