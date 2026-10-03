import { useParams } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { backendUrl, currency } from "../App";
import BackButton from "../Components/BackButton";

const OrderDetails = ({ token }) => {
  const { id } = useParams();

  const fetchOrder = async () => {
    const { data } = await axios.get(
      `${backendUrl}/api/orders/single/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  };

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: fetchOrder
  });

  if (isLoading) return <p className="p-6">Loading Order...</p>;

  const itemsTotal = Number(
    order.subtotal ||
      order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  const discount = Number(order.discount || 0);
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const codCharge = Number(order.codCharge || 0);
  const totalAmount = Number(order.totalAmount || 0);

  // Older orders saved only the total, not the delivery fee, COD charge or
  // discount behind it. Whatever the saved rows do not explain is shown as
  // one line, so the summary always adds up to the total.
  const unexplained =
    Math.round(
      (totalAmount - (itemsTotal - discount + deliveryFee + codCharge)) * 100
    ) / 100;
  const chargesNotRecorded = unexplained !== 0 && deliveryFee === 0;

  return (
    <div className="p-6">

      <div className="flex items-center gap-3 mb-6">
        <BackButton fallback="/orders" />
        <h2 className="text-2xl font-bold">
          Order Details
        </h2>
      </div>

      {/* Order Info */}
      <div className="mb-6 bg-white p-4 shadow rounded">
        <p><strong>Order ID:</strong> {order.orderNumber || order._id}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Payment:</strong> {order.isPaid ? "Paid" : "Not Paid"}</p>
      </div>

      {/* Items */}
      <div className="mb-6 bg-white p-4 shadow rounded">
        <h3 className="text-xl font-semibold mb-4">
          Items To Pack
        </h3>

        {order.items.map((item) => (
          <div key={item._id} className="flex items-center gap-4 border-b py-3">

            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded"
            />

            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p>Price: {currency}{item.price}</p>
              <p>Quantity: {item.quantity}</p>
            </div>

            <div>
              <p className="font-semibold">
                {currency}{item.price * item.quantity}
              </p>
            </div>

          </div>
        ))}

        <div className="text-right mt-4 font-bold">
          Items Total: {currency}{itemsTotal.toLocaleString()}
        </div>
      </div>

      {/* Payment Summary — same rows the customer sees on their order page */}
      <div className="mb-6 bg-white p-4 shadow rounded">
        <h3 className="text-xl font-semibold mb-4">
          Payment Summary
        </h3>

        <div className="max-w-md flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Items Total</span>
            <span>{currency}{itemsTotal.toLocaleString()}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Discount</span>
              <span className="text-green-600">- {currency}{discount.toLocaleString()}</span>
            </div>
          )}

          {!chargesNotRecorded && (
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span>{deliveryFee === 0 ? "FREE" : `${currency}${deliveryFee.toLocaleString()}`}</span>
            </div>
          )}

          {unexplained > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery &amp; other charges</span>
              <span>{currency}{unexplained.toLocaleString()}</span>
            </div>
          )}

          {unexplained < 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Other discount</span>
              <span className="text-green-600">- {currency}{Math.abs(unexplained).toLocaleString()}</span>
            </div>
          )}

          {codCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">COD Charge</span>
              <span>{currency}{codCharge.toLocaleString()}</span>
            </div>
          )}

          {order.coupon && (
            <div className="flex justify-between">
              <span className="text-gray-500">Coupon</span>
              <span>{order.coupon}</span>
            </div>
          )}

          <div className="flex justify-between border-t pt-3 mt-1 text-lg font-bold">
            <span>{order.isPaid ? "Total Paid" : "Total To Collect"}</span>
            <span>{currency}{totalAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between border-t pt-3 mt-1">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-medium">{order.paymentMethod || "ONLINE"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Payment Status</span>
            <span className={order.isPaid ? "text-green-600 font-medium" : "text-orange-500 font-medium"}>
              {order.isPaid ? "Paid" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-xl font-semibold mb-4">
          Shipping Address
        </h3>

        <p>{order.shippingAddress.fullName}</p>
        <p>
          {[order.shippingAddress.house, order.shippingAddress.street]
            .filter(Boolean)
            .join(", ")}
        </p>
        {order.shippingAddress.landmark && (
          <p>Landmark: {order.shippingAddress.landmark}</p>
        )}
        <p>
          {[
            order.shippingAddress.city,
            order.shippingAddress.district,
            order.shippingAddress.state,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
        <p>
          {order.shippingAddress.country} - {order.shippingAddress.pincode}
        </p>
        <p>Phone: {order.shippingAddress.phone}</p>
      </div>

    </div>
  );
};

export default OrderDetails;
