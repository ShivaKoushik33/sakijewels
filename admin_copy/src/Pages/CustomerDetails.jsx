import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { backendUrl, currency } from "../App";
import BackButton from "../Components/BackButton";

const CustomerDetails = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data } = await axios.get(
        `${backendUrl}/api/dashboard/customers/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
  });

  if (isLoading) return <p className="p-6">Loading Customer...</p>;

  if (isError) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BackButton fallback="/customers" />
          <h2 className="text-2xl font-bold">Customer Details</h2>
        </div>
        <p className="text-red-500">Could not load this customer.</p>
      </div>
    );
  }

  const { customer, orders, orderCount, totalSpent } = data;
  const addresses = customer.addresses || [];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BackButton fallback="/customers" />
        <h2 className="text-2xl font-bold">Customer Details</h2>
      </div>

      {/* Customer Info */}
      <div className="mb-6 bg-white p-4 shadow rounded">
        <p><strong>Name:</strong> {customer.name || "—"}</p>
        <p><strong>Phone:</strong> {customer.phone || "—"}</p>
        <p><strong>Email:</strong> {customer.email || "—"}</p>
        <p><strong>Joined:</strong> {new Date(customer.createdAt).toLocaleDateString()}</p>
        <p><strong>Orders:</strong> {orderCount}</p>
        <p>
          <strong>Total Spent:</strong> {currency}{totalSpent.toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Orders and total spent leave out cancelled orders.
        </p>
      </div>

      {/* Orders */}
      <div className="mb-6 bg-white p-4 shadow rounded">
        <h3 className="text-xl font-semibold mb-4">Orders ({orders.length})</h3>

        {orders.length === 0 ? (
          <p className="text-gray-400">This customer has not ordered yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Paid</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => navigate(`/orders/single/${order._id}`)}
                  className="border-t cursor-pointer hover:bg-gray-50"
                >
                  <td className="p-3 text-xs text-blue-600">
                    {order.orderNumber || order._id}
                  </td>
                  <td className="p-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">{order.itemCount}</td>
                  <td className="p-3">
                    {currency}{Number(order.totalAmount).toLocaleString("en-IN")}
                  </td>
                  <td className="p-3">{order.status}</td>
                  <td className="p-3">{order.isPaid ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Saved Addresses */}
      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-xl font-semibold mb-4">
          Saved Addresses ({addresses.length})
        </h3>

        {addresses.length === 0 ? (
          <p className="text-gray-400">No saved addresses.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address._id} className="border rounded p-3">
                <p className="font-medium">
                  {address.fullName}
                  {address.isDefault && (
                    <span className="ml-2 text-xs text-green-600">Default</span>
                  )}
                </p>
                <p>{[address.house, address.street].filter(Boolean).join(", ")}</p>
                {address.landmark && <p>Landmark: {address.landmark}</p>}
                <p>
                  {[address.city, address.district, address.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>
                  {address.country} - {address.pincode}
                </p>
                <p>Phone: {address.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetails;
