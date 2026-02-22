import { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";



const Orders = ({ token }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("DATE_DESC");

  // 🔹 Fetch Orders
  const fetchOrders = async () => {
    const { data } = await axios.get(
      `${backendUrl}/api/orders`,
      {
        params: { page, limit: 10, status, sort },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page, status, sort],
    queryFn: fetchOrders,
    keepPreviousData: true
  });

  // 🔹 Update Status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      axios.put(
        `${backendUrl}/api/orders/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      ),

    onSuccess: () => {
      toast.success("Status Updated");
      queryClient.invalidateQueries(["orders"]);
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Error updating status");
    }
  });

  if (isLoading) return <p className="p-4">Loading Orders...</p>;

  return (
    <div className="p-6">

      {/* 🔹 Title */}
      <h2 className="text-2xl font-bold mb-6">Orders Management</h2>

      {/* 🔹 Filters */}
      <div className="flex gap-4 mb-6">

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border p-2"
        >
          <option value="">All Status</option>
          <option value="PENDING">PENDING</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="REJECTED">REJECTED</option>
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
          className="border p-2"
        >
          <option value="DATE_DESC">Newest</option>
          <option value="DATE_ASC">Oldest</option>
          <option value="PRICE_DESC">Price High → Low</option>
          <option value="PRICE_ASC">Price Low → High</option>
        </select>

      </div>

      {/* 🔹 Orders Table */}
      <div className="bg-white shadow rounded">

        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Paid</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {data?.orders?.map((order) => (
              <tr key={order._id} className="border-t">

                <td className="p-3 text-xs text-blue-600 cursor-pointer"
                  onClick={() => navigate(`/orders/single/${order._id}`)}>
                  {order._id}
                </td>

                <td className="p-3">
                  {order.user?.name}
                </td>

                <td className="p-3">
                  {order.items.length}
                </td>

                <td className="p-3">
                  {currency}{order.totalAmount}
                </td>

                <td className="p-3">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({
                        id: order._id,
                        status: e.target.value
                      })
                    }
                    className="border p-1"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </td>

                <td className="p-3">
                  {order.isPaid ? "Yes" : "No"}
                </td>

                <td className="p-3">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* 🔹 Pagination */}
      <div className="flex justify-between items-center mt-6">

        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="border px-4 py-2 disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {data?.currentPage} of {data?.totalPages}
        </span>

        <button
          disabled={page === data?.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="border px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default Orders;
