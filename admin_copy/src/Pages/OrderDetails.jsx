import { useParams } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { backendUrl, currency } from "../App";

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

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">
        Order Details
      </h2>

      {/* Order Info */}
      <div className="mb-6 bg-white p-4 shadow rounded">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Payment:</strong> {order.isPaid ? "Paid" : "Not Paid"}</p>
        <p><strong>Payment ID:</strong> {order.paymentId || "N/A"}</p>
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
          Total: {currency}{order.totalAmount}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-xl font-semibold mb-4">
          Shipping Address
        </h3>

        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.street}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state}
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
