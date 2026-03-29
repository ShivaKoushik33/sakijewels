import { useState, useContext,useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function BuyNowPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addressId = searchParams.get("addressId");
  const couponCode = searchParams.get("coupon");
  const initialTotal = searchParams.get("total");
  const mode = searchParams.get("mode");

 const { backendUrl, token, setCartItems } = useContext(ShopContext);

  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(
  initialTotal ? Number(initialTotal) : 0
);

useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

useEffect(() => {
  if (!initialTotal) return;

  let calculatedTotal = Number(initialTotal);

  if (mode === "online") {
    const prepaidDiscount = Math.floor(calculatedTotal * 0.05);
    calculatedTotal = calculatedTotal - prepaidDiscount;
  }

  if (mode === "cod") {
    calculatedTotal = calculatedTotal + 39;
  }

  setTotal(calculatedTotal);

}, [initialTotal, mode]);

const handlePayment = async () => {
  if (!addressId) {
    toast.error("Invalid address");
    return;
  }

  try {
    setLoading(true);

    // 🟢 COD FLOW
    if (mode === "cod") {
      await axios.post(
        `${backendUrl}/api/orders/place-cod`,
        {
          addressId,
          coupon: couponCode || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order placed successfully!");
      setCartItems({});
      navigate("/");
      return;
    }

    // 🟣 ONLINE PAYMENT FLOW

    // Call backend to create Razorpay order
    const { data } = await axios.post(
      `${backendUrl}/api/orders/create-payment`,
      {
        coupon: couponCode || null,
        addressId
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { razorpayOrder } = data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: total * 100, // 🔥 use adjusted total (5% already applied)
      currency: "INR",
      name: "Saki Jewels",
      description: "Order Payment",
      order_id: razorpayOrder.id,

      handler: async function (response) {
        try {
          await axios.post(
            `${backendUrl}/api/orders/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              addressId,
              coupon: couponCode || null
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success("Payment successful 🎉");
          setCartItems({});
          navigate("/");

        } catch (error) {
          toast.error(
            error?.response?.data?.message ||
            "Payment verification failed. Please retry."
          );
        } finally {
          setLoading(false);
        }
      },

      modal: {
        ondismiss: function () {
          toast.error("Payment cancelled");
          setLoading(false);
        }
      },

      theme: {
        color: "#901CDB"
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      toast.error(response.error.description || "Payment failed");
      setLoading(false);
    });

    rzp.open();

  } catch (error) {
    toast.error(
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

              <div className="flex justify-between items-center mb-4">
                <span>Total</span>
                <span className="text-xl font-bold">
                  ₹ {total ? (total+69).toLocaleString() : "—"}
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