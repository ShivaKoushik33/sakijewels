/**
 * API endpoints configuration
 * Update these with your backend server URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Product endpoints
  products: `${API_BASE_URL}/products`,
  product: (id) => `${API_BASE_URL}/products/${id}`,

  // Cart endpoints
  cart: `${API_BASE_URL}/cart`,
  cartItem: (id) => `${API_BASE_URL}/cart/${id}`,

  // Wishlist endpoints
  wishlist: `${API_BASE_URL}/wishlist`,
  wishlistItem: (id) => `${API_BASE_URL}/wishlist/${id}`,

  // User endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
  },

  // Profile endpoints
  profile: `${API_BASE_URL}/profile`,
};

export default API_ENDPOINTS;
