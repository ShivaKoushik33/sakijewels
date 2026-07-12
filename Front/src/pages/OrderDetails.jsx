import { useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const getToneClasses = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "text-[#0EA5A5] border-[#0EA5A5]/30 bg-[#0EA5A5]/10";
    case "ACCEPTED":
      return "text-[#34C759] border-[#34C759]/30 bg-[#34C759]/10";
    case "PENDING":
      return "text-[#FF9900] border-[#FF9900]/30 bg-[#FF9900]/10";
    case "REJECTED":
      return "text-[#FF3B30] border-[#FF3B30]/30 bg-[#FF3B30]/10";
    case "DELIVERED":
      return "text-[#1E4CA6] border-[#1E4CA6]/30 bg-[#1E4CA6]/10";
    case "REFUNDED":
      return "text-[#777E90] border-[#777E90]/30 bg-[#777E90]/10";
    default:
      return "text-[#353945] border-[#E6E8EC] bg-white";
  }
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(ShopContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/orders/single/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrder();
  }, [id, token, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-gray-500">{error || "Order not found"}</p>
        <Link
          to="/orders"
          className="px-6 py-2 border border-[#901CDB] rounded-lg text-[#901CDB] hover:bg-[#901CDB] hover:text-white transition"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress || {};
  const itemsTotal = Number(
    order.subtotal ??
      (order.items || []).reduce(
        (acc, it) => acc + (it.price || 0) * (it.quantity || 0),
        0
      )
  );
  const discount = Number(order.discount || 0);
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const codCharge = Number(order.codCharge || 0);
  const totalAmount = Number(order.totalAmount || 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-[#901CDB] mb-4 hover:underline"
        >
          &larr; Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#141416]">
              Order Details
            </h1>
            <p className="text-xs md:text-sm text-[#777E90] mt-1 break-all">
              Order ID: {order._id}
            </p>
            <p className="text-xs md:text-sm text-[#777E90] mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
            <p className="text-xs md:text-sm text-[#777E90] mt-0.5">
              Expected Delivery: {(() => {
                const d = new Date(order.createdAt);
                d.setDate(d.getDate() + 7);
                return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              })()}
            </p>
          </div>

          <div
            className={`self-start px-3 py-1 rounded-full border text-xs md:text-sm ${getToneClasses(order.status)}`}
          >
            {order.status}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">

            <section className="bg-white border border-[#E6E8EC] rounded-lg p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold text-[#141416] mb-4">
                Items ({order.items?.length || 0})
              </h2>

              <div className="flex flex-col gap-4">
                {(order.items || []).map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="flex gap-3 md:gap-4 p-3 md:p-4 border border-[#E6E8EC] rounded-lg"
                  >
                    <Link
                      to={`/products/${item.product}`}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-[#E6E8EC] flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.product}`}
                        className="font-semibold text-[#141416] hover:text-[#901CDB] block truncate"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-[#777E90] mt-0.5">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm text-[#777E90] mt-0.5">
                        Price: ₹{Number(item.price).toLocaleString()}
                      </p>
                      <p className="text-sm font-semibold text-[#141416] mt-1">
                        Subtotal: ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-[#E6E8EC] rounded-lg p-4 md:p-6">
              <h2 className="text-base md:text-lg font-semibold text-[#141416] mb-4">
                Delivery Address
              </h2>

              {addr && (addr.fullName || addr.house) ? (
                <div className="text-sm text-[#353945] leading-6">
                  <p className="font-medium text-[#141416]">{addr.fullName}</p>
                  {addr.phone && <p>{addr.phone}</p>}
                  <p>
                    {[addr.house, addr.street].filter(Boolean).join(', ')}
                  </p>
                  <p>
                    {[addr.city, addr.state].filter(Boolean).join(', ')}
                    {addr.pincode ? ` - ${addr.pincode}` : ''}
                  </p>
                  {addr.country && <p>{addr.country}</p>}
                </div>
              ) : (
                <p className="text-sm text-[#777E90]">No address available</p>
              )}
            </section>

            {order.adminRemark && (
              <section className="bg-white border border-[#E6E8EC] rounded-lg p-4 md:p-6">
                <h2 className="text-base md:text-lg font-semibold text-[#141416] mb-2">
                  Note
                </h2>
                <p className="text-sm text-[#353945]">{order.adminRemark}</p>
              </section>
            )}
          </div>

          <div>
            <section className="sticky top-24 bg-white border border-[#E6E8EC] rounded-lg p-4 md:p-6">

              <h2 className="text-lg font-semibold mb-6 text-[#141416]">
                Payment Summary
              </h2>

              <div className="flex justify-between mb-3 text-sm">
                <span className="text-[#777E90]">Items Total</span>
                <span className="text-[#141416]">
                  ₹ {itemsTotal.toLocaleString()}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between mb-3 text-sm">
                  <span className="text-[#777E90]">Discount</span>
                  <span className="text-green-600">
                    - ₹ {discount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between mb-3 text-sm">
                <span className="text-[#777E90]">Delivery Fee</span>
                <span className="text-[#141416]">
                  {deliveryFee === 0 ? 'FREE' : `₹ ${deliveryFee.toLocaleString()}`}
                </span>
              </div>

              {codCharge > 0 && (
                <div className="flex justify-between mb-3 text-sm">
                  <span className="text-[#777E90]">COD Charge</span>
                  <span className="text-[#141416]">
                    ₹ {codCharge.toLocaleString()}
                  </span>
                </div>
              )}

              {order.coupon && (
                <div className="flex justify-between mb-3 text-sm">
                  <span className="text-[#777E90]">Coupon</span>
                  <span className="text-[#141416]">{order.coupon}</span>
                </div>
              )}

              <div className="border-t my-4"></div>

              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total Paid</span>
                <span>₹ {totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex flex-col gap-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-[#777E90]">Payment Method</span>
                  <span className="text-[#141416] font-medium">
                    {order.paymentMethod || 'ONLINE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777E90]">Payment Status</span>
                  <span className={order.isPaid ? 'text-green-600 font-medium' : 'text-[#FF9900] font-medium'}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                {order.paymentId && (
                  <div className="flex justify-between gap-2">
                    <span className="text-[#777E90] flex-shrink-0">Payment ID</span>
                    <span className="text-[#141416] text-xs break-all text-right">
                      {order.paymentId}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="w-full mt-6 py-3 border border-[#901CDB] text-[#901CDB] rounded-lg hover:bg-[#901CDB] hover:text-white transition"
              >
                Back to My Orders
              </button>

              {/* Cancel Order — only while the order is still cancellable */}
              {!["DELIVERED", "REJECTED", "REFUNDED"].includes(order.status) && (
                <button
                  type="button"
                  onClick={() => setShowCancel(true)}
                  className="w-full mt-3 py-3 border border-[#FF3B30] text-[#FF3B30] rounded-lg hover:bg-[#FF3B30] hover:text-white transition"
                >
                  Cancel Order
                </button>
              )}
            </section>
          </div>

        </div>
      </div>

      {/* CANCEL ORDER POPUP */}
      {showCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowCancel(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-[slideDown_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-[#141416]">Cancel Order</h3>
              <button
                type="button"
                onClick={() => setShowCancel(false)}
                aria-label="Close"
                className="text-[#777E90] hover:text-[#141416] text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-[#353945] mb-5">
              For cancellation of this order, please contact us:
            </p>

            <div className="flex flex-col gap-3">
              {/* Call */}
              <a
                href="tel:+919705653066"
                className="flex items-center gap-3 px-4 py-3 border border-[#E6E8EC] rounded-lg hover:bg-[#F4F5F6] transition"
              >
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>
                </span>
                <div>
                  <p className="text-xs text-[#777E90]">Call us</p>
                  <p className="text-sm font-medium text-[#141416]">+91 97056 53066</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:support@thesakijewels.com"
                className="flex items-center gap-3 px-4 py-3 border border-[#E6E8EC] rounded-lg hover:bg-[#F4F5F6] transition"
              >
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg>
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-[#777E90]">Email</p>
                  <p className="text-sm font-medium text-[#141416] break-all">support@thesakhijewels.com</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/919705653066"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 border border-[#25D366] rounded-lg hover:bg-[#25D366]/10 transition"
              >
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25D366]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-white">
                    <path d="M16 .396C7.164.396 0 7.56 0 16.396c0 2.883.754 5.703 2.188 8.184L0 32l7.65-2.146A15.93 15.93 0 0016 32c8.836 0 16-7.164 16-16.004C32 7.56 24.836.396 16 .396zm0 29.333a13.26 13.26 0 01-6.76-1.857l-.484-.29-4.54 1.273 1.212-4.427-.314-.51a13.24 13.24 0 01-2.02-7.016c0-7.32 5.94-13.26 13.26-13.26 7.32 0 13.26 5.94 13.26 13.26 0 7.32-5.94 13.26-13.26 13.26zm7.347-9.845c-.402-.201-2.376-1.172-2.745-1.305-.369-.134-.637-.201-.905.201-.268.402-1.038 1.305-1.273 1.573-.235.268-.47.302-.872.101-.402-.201-1.697-.626-3.234-1.997-1.196-1.068-2.003-2.387-2.238-2.789-.235-.402-.025-.619.176-.82.18-.179.402-.47.603-.704.201-.235.268-.402.402-.67.134-.268.067-.503-.033-.704-.101-.201-.905-2.18-1.239-2.986-.326-.785-.657-.678-.905-.691l-.771-.013c-.268 0-.704.101-1.072.503-.369.402-1.407 1.374-1.407 3.349 0 1.975 1.441 3.882 1.641 4.151.201.268 2.833 4.329 6.865 6.07.959.413 1.706.66 2.289.845.961.305 1.835.262 2.527.159.771-.115 2.376-.97 2.711-1.906.336-.937.336-1.74.235-1.906-.101-.167-.369-.268-.771-.47z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs text-[#777E90]">Chat on</p>
                  <p className="text-sm font-medium text-[#141416]">WhatsApp</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
