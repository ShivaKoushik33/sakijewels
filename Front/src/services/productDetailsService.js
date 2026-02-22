import api from "./apiService";

export const getProductDetailsData = async (id) => {
  const response = await api.get(`/products/${id}`);
  return {
    product: response.data,
    reviews: [] // we’ll connect real reviews later
  };
};
