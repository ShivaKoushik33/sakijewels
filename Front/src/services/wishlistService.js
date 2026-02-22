import axios from "axios";
const backendUrl = import.meta.env.VITE_API_BASE_URL




export const getWishlistData = async (token) => {

  const res = await axios.get(`${backendUrl}/api/wishlist/get_items`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Get Wishlist API response:", res);
  return res.data;
};

export const removeFromWishlistApi = async (productId, token) => {
  // console.log("Removing from wishlist:", { productId, token });
  const res = await axios.delete(
    `${backendUrl}/api/wishlist/remove/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("Remove from Wishlist API response:", res);
  return res.data;
};


export const addToWishlistApi = async (productId, token) => {
  // console.log("Adding to wishlist:", { productId, token });
  // console.log("Backend URL:", backendUrl);
  const res = await axios.post(
    `${backendUrl}/api/wishlist/add`,
    { productId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("add Wishlist API response:", res);
  return res.data;
};