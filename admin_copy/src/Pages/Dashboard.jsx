import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { backendUrl, currency } from "../App";

const money = (amount) => `${currency}${Number(amount || 0).toLocaleString("en-IN")}`;

// With `to`, the whole card is a link to the list behind the number.
const StatCard = ({ label, value, hint, tone = "text-gray-800", to }) => {
  const body = (
    <>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </>
  );

  if (!to) return <div className="bg-white shadow rounded p-4">{body}</div>;

  return (
    <Link
      to={to}
      className="block bg-white shadow rounded p-4 hover:shadow-md hover:bg-gray-50 transition"
    >
      {body}
    </Link>
  );
};

const Section = ({ title, action, children }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// Products the admin should restock; each row opens that product's edit page.
const StockList = ({ title, products, count, emptyText, stockTone }) => (
  <div className="bg-white shadow rounded p-4">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold">{title}</h4>
      <span className={`text-sm font-bold ${stockTone}`}>{count}</span>
    </div>

    {products.length === 0 ? (
      <p className="text-sm text-gray-400">{emptyText}</p>
    ) : (
      <div className="max-h-80 overflow-y-auto divide-y">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/edit/${product.id}`}
            className="flex items-center gap-3 py-2 hover:bg-gray-50"
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-gray-100" />
            )}
            <span className="flex-1 min-w-0 truncate text-sm">{product.name}</span>
            <span className={`text-sm font-semibold ${stockTone}`}>
              {product.stock} left
            </span>
          </Link>
        ))}
      </div>
    )}

    {count > products.length && (
      <p className="text-xs text-gray-400 mt-2">
        Showing {products.length} of {count}.
      </p>
    )}
  </div>
);

const Dashboard = ({ token }) => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await axios.get(`${backendUrl}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });

  if (isLoading) return <p className="p-6">Loading Dashboard...</p>;

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-500 mb-3">Could not load the dashboard.</p>
        <button onClick={() => refetch()} className="border px-4 py-2">
          Try again
        </button>
      </div>
    );
  }

  const { sales, orders, customers, stock } = data;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="border px-4 py-2 text-sm disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <Section title="Sales">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={money(sales.totalRevenue)}
            hint="All orders except cancelled"
          />
          <StatCard label="Today's Sales" value={money(sales.today)} />
          <StatCard label="This Month's Sales" value={money(sales.thisMonth)} />
          <StatCard label="Average Order Value" value={money(sales.averageOrderValue)} />
        </div>
      </Section>

      <Section
        title="Orders"
        action={
          <Link to="/orders" className="text-sm text-blue-600">
            View all orders
          </Link>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={orders.total} to="/orders" />
          <StatCard
            label="Yet To Ship"
            value={orders.yetToShip}
            tone="text-orange-500"
            hint="Pending, accepted or confirmed"
            to="/orders?status=PENDING,ACCEPTED,CONFIRMED"
          />
          <StatCard
            label="Delivered"
            value={orders.delivered}
            tone="text-green-600"
            to="/orders?status=DELIVERED"
          />
          <StatCard
            label="Cancelled"
            value={orders.cancelled}
            tone="text-red-500"
            hint="Rejected, cancelled or refunded"
            to="/orders?status=REJECTED,CANCELLED,REFUNDED"
          />
        </div>
      </Section>

      <Section
        title="Customers"
        action={
          <Link to="/customers" className="text-sm text-blue-600">
            View all customers
          </Link>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Customers" value={customers.total} to="/customers" />
          <StatCard
            label="New This Month"
            value={customers.newThisMonth}
            to="/customers?filter=new"
          />
          <StatCard
            label="Repeat Customers"
            value={customers.repeat}
            hint="Ordered two or more times"
            to="/customers?filter=repeat"
          />
        </div>
      </Section>

      <Section
        title="Stock"
        action={
          <Link to="/list" className="text-sm text-blue-600">
            View all products
          </Link>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StockList
            title={`Low Stock (${stock.lowStockThreshold} or fewer)`}
            products={stock.lowStock}
            count={stock.lowStockCount}
            emptyText="No products are running low."
            stockTone="text-orange-500"
          />
          <StockList
            title="Out of Stock"
            products={stock.outOfStock}
            count={stock.outOfStockCount}
            emptyText="Nothing is out of stock."
            stockTone="text-red-500"
          />
        </div>
      </Section>
    </div>
  );
};

export default Dashboard;
