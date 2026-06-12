import { useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const getToneClasses = (status) => {
  switch (status) {
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
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
