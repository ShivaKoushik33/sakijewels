import axios from "axios";

const backendUrl = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

/** Reviews shown in the landing page carousel (4 and 5 star, newest first). */
export const getFeaturedReviews = async () => {
  const res = await axios.get(`${backendUrl}/api/reviews/featured`);
  return res.data;
};

/** Every review of one product, newest first. */
export const getProductReviews = async (productId) => {
  const res = await axios.get(`${backendUrl}/api/reviews/product/${productId}`);
  return res.data;
};

/** What this customer has already written for one of their orders. */
export const getOrderReviews = async (orderId, token) => {
  const res = await axios.get(
    `${backendUrl}/api/reviews/order/${orderId}`,
    authHeaders(token)
  );
  return res.data;
};

/** Writes a review, or updates the customer's existing one for that item. */
export const saveReview = async ({ orderId, productId, rating, message }, token) => {
  const res = await axios.post(
    `${backendUrl}/api/reviews`,
    { orderId, productId, rating, message },
    authHeaders(token)
  );
  return res.data.review;
};
