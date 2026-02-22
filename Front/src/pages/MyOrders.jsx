import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import OrderCard from '../components/profile/OrderCard';
import axios from 'axios';
import { ShopContext } from '../context/shopContext';

export default function MyOrders() {
  const { backendUrl, token } = useContext(ShopContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/orders/my-orders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("My Orders API response:", res.data);
        setOrders(res.data || []);
      } catch (error) {
        console.error(error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">

        <div className="text-3xl font-bold text-[#141416] mb-10">
          My Orders
        </div>

        {orders.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-lg text-gray-500 mb-6">
              You have no orders yet
            </p>
            <Link
              to="/products"
              className="px-8 py-3 border border-[#901CDB] rounded-lg text-[#901CDB] hover:bg-[#901CDB] hover:text-white transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
