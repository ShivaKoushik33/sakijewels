import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { backendUrl, currency } from "../App";
import BackButton from "../Components/BackButton";

const Customers = ({ token }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // In the URL so the dashboard tiles can link to a filtered list, and Back
  // from a customer returns to it.
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("filter") || "";
  const setFilter = (value) =>
    setSearchParams(value ? { filter: value } : {}, { replace: true });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers", page, filter],
    queryFn: async () => {
      const { data } = await axios.get(`${backendUrl}/api/dashboard/customers`, {
        params: { page, limit: 10, filter },
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    keepPreviousData: true,
  });

  if (isLoading) return <p className="p-4">Loading Customers...</p>;
  if (isError) return <p className="p-4 text-red-500">Could not load customers.</p>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BackButton />
        <h2 className="text-2xl font-bold">Customers</h2>
        <span className="text-sm text-gray-500">({data.totalCustomers})</span>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => {
            setPage(1);
            setFilter(e.target.value);
          }}
          className="border p-2"
        >
          <option value="">All Customers</option>
          <option value="new">New This Month</option>
          <option value="repeat">Repeat Customers</option>
        </select>
      </div>

      <div className="bg-white shadow rounded">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total Spent</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>

          <tbody>
            {data.customers.map((customer) => (
              <tr
                key={customer._id}
                onClick={() => navigate(`/customers/${customer._id}`)}
                className="border-t cursor-pointer hover:bg-gray-50"
              >
                <td className="p-3 text-blue-600">{customer.name || "—"}</td>
                <td className="p-3">{customer.phone || "—"}</td>
                <td className="p-3">{customer.email || "—"}</td>
                <td className="p-3">{customer.orderCount}</td>
                <td className="p-3">
                  {currency}{Math.round(customer.totalSpent).toLocaleString("en-IN")}
                </td>
                <td className="p-3">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {data.customers.length === 0 && (
              <tr className="border-t">
                <td className="p-3 text-gray-400" colSpan={6}>
                  No customers to show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="border px-4 py-2 disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {data.currentPage} of {data.totalPages}
        </span>

        <button
          disabled={page >= data.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="border px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Customers;
