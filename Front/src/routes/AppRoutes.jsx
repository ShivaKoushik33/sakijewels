import { Routes, Route } from 'react-router-dom';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MobileBottomNav from '../components/common/MobileBottomNav';
import ProfileLayout from '../components/profile/ProfileLayout';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import BuyNowReview from '../pages/BuyNowReview';
import BuyNowPayment from '../pages/BuyNowPayment';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import MyOrders from '../pages/MyOrders';
import Addresses from '../pages/Addresses';
import BankDetails from '../pages/BankDetails';
import AddAddress from '../pages/AddAddress';
import EditAddress from '../pages/EditAddress';
import Collections from '../pages/Collections';
import SearchBar from '../components/common/SearchBar';
import ProtectedRoute from './ProtectedRoute';
export default function AppRoutes() {
  return (
  
      <div className="flex flex-col min-h-screen pb-16 lg:pb-0">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/products" element={<Products />} /> */}
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout/review" element={<BuyNowReview />} />
            <Route path="/checkout/payment" element={<BuyNowPayment />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Profile />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="addresses/new" element={<AddAddress />} />
            <Route path="addresses/:id/edit" element={<EditAddress />} />
            
            <Route path="bank-details" element={<BankDetails />} />
          </Route>
          </Routes>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    
  );
}
