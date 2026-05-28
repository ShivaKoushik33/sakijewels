import axios from "axios";
const backendUrl = import.meta.env.VITE_API_BASE_URL




export const getWishlistData = async (token) => {

  const res = await axios.get(`${backendUrl}/api/wishlist/get_items`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const removeFromWishlistApi = async (productId, token) => {
  const res = await axios.delete(
    `${backendUrl}/api/wishlist/remove/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};


export const addToWishlistApi = async (productId, token) => {
  const res = await axios.post(
    `${backendUrl}/api/wishlist/add`,
    { productId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
