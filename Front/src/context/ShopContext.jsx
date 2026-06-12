import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });
  const [variantType, setVariantType] = useState(
    localStorage.getItem("variantType") || "FASHION"
  );
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [delivery_fee, setDeliveryFee] = useState(49);

  const [buyNowItem, setBuyNowItem] = useState(() => {
    try {
      const stored = localStorage.getItem("buyNowItem");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (buyNowItem) {
      localStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
    } else {
      localStorage.removeItem("buyNowItem");
    }
  }, [buyNowItem]);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("buyNowItem");
    setToken("");
    setCartItems({});
    setBuyNowItem(null);
    setSelectedAddress(null);
  };

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const code = error?.response?.data?.code;
        const isAuthFailure =
          status === 401 &&
          (code === "TOKEN_EXPIRED" ||
            code === "TOKEN_INVALID" ||
            code === "USER_INACTIVE" ||
            code === "NO_TOKEN");

        if (isAuthFailure && localStorage.getItem("token")) {
          localStorage.removeItem("token");
          setToken("");
          setCartItems({});
          if (code === "TOKEN_EXPIRED") {
            toast.info("Session expired. Please login again.");
          } else {
            toast.info("Please login to continue.");
          }
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [navigate]);

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/products`);
      const inStock = response.data?.filter(p => p.stock > 0) || [];
      setAllProducts(inStock);
      setProducts(inStock.filter(p => p.variantType === variantType));
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  const addToCart = async (itemId) => {
    if (!token) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    setCartItems(cartData);
    try {
      const response = await axios.post(
        backendUrl + '/api/cart/add',
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error?.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to add to cart");
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (let item in cartItems) {
      const productExists = allProducts.find((product) => product._id === item);
      if (productExists) {
        totalCount += cartItems[item];
      }
    }
    return totalCount;
  };

  const getCartProducts = () => {
    return Object.keys(cartItems)
      .map((id) => {
        const product = allProducts.find((p) => p._id === id);
        if (!product) return null;

        return {
          ...product,
          id: product._id,
          quantity: cartItems[id],
          image: product.images?.[0]?.url,
          price: product.finalPrice,
          originalPrice: product.rate,
          discount: product.discountRate
        };
      })
      .filter(Boolean);
  };

  const getUserCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(
        backendUrl + '/api/cart',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      // 401 handled by interceptor; stay silent on cart load errors
    }
  };

  const getCartSummary = () => {
    const cartProducts = getCartProducts();

    const subtotal = cartProducts.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const discount = cartProducts.reduce(
      (acc, item) =>
        acc + ((item.originalPrice - item.price) * item.quantity),
      0
    );

    return {
      itemCount: cartProducts.length,
      subtotal,
      discount,
      total: subtotal,
    };
  };

  useEffect(() => {
    localStorage.setItem("variantType", variantType);
  }, [variantType]);

  useEffect(() => {
    const initialize = async () => {
      await getProductsData();

      if (token) {
        await getUserCart(token);
      }
    };

    initialize();
  }, [token, variantType]);

  const value = {
    products,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    getCartProducts,
    getCartSummary,
    token,
    setToken,
    backendUrl,
    navigate,
    selectedAddress,
    setSelectedAddress,
    delivery_fee,
    setDeliveryFee,
    getUserCart,
    variantType,
    setVariantType,
    buyNowItem,
    setBuyNowItem,
    logout,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
export default ShopContextProvider;
