import { createContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  addToWishlistApi,
  getWishlistData,
  removeFromWishlistApi,
} from '../services/wishlistService';

export const ShopContext = createContext();

const backendUrl = import.meta.env.VITE_API_BASE_URL;

const ShopContextProvider = ({ children }) => {
  // Every product, including out-of-stock ones, so the cart can still show
  // items that went out of stock and let the user remove them.
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });
  const [variantType, setVariantType] = useState(
    localStorage.getItem("variantType") || "FASHION"
  );
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  // Token whose cart and wishlist are loaded (null = none yet), so pages can
  // tell a loading cart from an empty one.
  const [userDataFor, setUserDataFor] = useState(null);
  // One shared list, so every heart on every page agrees.
  const [wishlistIds, setWishlistIds] = useState([]);

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
    setWishlistIds([]);
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
          setWishlistIds([]);
          // Pass the reason to the login page (shown inline there).
          localStorage.setItem(
            "authNotice",
            code === "TOKEN_EXPIRED"
              ? "Session expired. Please login again."
              : "Please login to continue."
          );
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [navigate]);

  // Collections show in-stock products of the chosen variant. Deriving this
  // instead of refetching on every variant switch means a slow response for
  // the previous variant can never overwrite the current one.
  const products = useMemo(
    () =>
      allProducts.filter(
        (p) => p.stock > 0 && p.variantType === variantType
      ),
    [allProducts, variantType]
  );

  /**
   * Adds `quantity` units and resolves to true on success. The badge updates
   * immediately; the server's cart then replaces the local copy, and a failed
   * request takes the units back out.
   */
  const addToCart = async (itemId, quantity = 1) => {
    if (!token) {
      navigate("/login");
      return false;
    }

    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + quantity }));

    try {
      const response = await axios.post(
        backendUrl + '/api/cart/add',
        { itemId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.cartData) {
        setCartItems(response.data.cartData);
      }
      return true;
    } catch {
      // 401 is handled by the interceptor; undo only this add.
      setCartItems((prev) => {
        const next = { ...prev };
        const remaining = (next[itemId] || 0) - quantity;
        if (remaining > 0) next[itemId] = remaining;
        else delete next[itemId];
        return next;
      });
      return false;
    }
  };

  const isWishlisted = (productId) => wishlistIds.includes(productId);

  /**
   * Adds or removes a product from the wishlist and resolves to true on
   * success. Every heart updates at once; a failed request rolls it back.
   */
  const toggleWishlist = async (productId) => {
    if (!token) {
      navigate("/login");
      return false;
    }

    const removing = wishlistIds.includes(productId);
    const add = (prev) => (prev.includes(productId) ? prev : [...prev, productId]);
    const remove = (prev) => prev.filter((id) => id !== productId);

    setWishlistIds(removing ? remove : add);
    try {
      if (removing) {
        await removeFromWishlistApi(productId, token);
      } else {
        await addToWishlistApi(productId, token);
      }
      return true;
    } catch {
      setWishlistIds(removing ? add : remove);
      return false;
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
    } catch {
      // 401 handled by interceptor; stay silent on cart load errors
    }
  };

  const getCartSummary = () => {
    // Only in-stock items count toward totals — out-of-stock items are shown
    // in the cart but excluded from the payable amount.
    // Must match the server rule in order.controller.js: a line is only
    // ordered (and only charged) when the full quantity is in stock.
    const cartProducts = getCartProducts().filter((p) => p.stock >= p.quantity);

    const subtotal = cartProducts.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Price before discount (MRP), so summaries read MRP − discount = subtotal.
    const mrpTotal = cartProducts.reduce(
      (acc, item) => acc + (item.originalPrice || item.price) * item.quantity,
      0
    );

    return {
      itemCount: cartProducts.length,
      unitCount: cartProducts.reduce((acc, item) => acc + item.quantity, 0),
      mrpTotal,
      subtotal,
      discount: mrpTotal - subtotal,
      total: subtotal,
    };
  };

  useEffect(() => {
    localStorage.setItem("variantType", variantType);
  }, [variantType]);

  // Products: on first load, and again on login/logout so stock is fresh.
  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${backendUrl}/api/products`)
      .then((response) => {
        if (!cancelled) setAllProducts(response.data || []);
      })
      .catch(() => {
        // silent — products just won't load
      })
      .finally(() => {
        if (!cancelled) setProductsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // The logged-in user's cart and wishlist. Logging out (logout() or the 401
  // interceptor) already clears both.
  useEffect(() => {
    if (!token) return;

    // A response for a token that has since changed must not be applied.
    let cancelled = false;
    const headers = { Authorization: `Bearer ${token}` };

    const loadUserData = async () => {
      const [cartResponse, wishlist] = await Promise.all([
        axios.get(`${backendUrl}/api/cart`, { headers }).catch(() => null),
        getWishlistData(token).catch(() => null),
      ]);
      if (cancelled) return;

      if (cartResponse?.data?.success) {
        setCartItems(cartResponse.data.cartData);
      }
      if (Array.isArray(wishlist)) {
        setWishlistIds(wishlist.map((item) => item._id));
      }
      setUserDataFor(token);
    };

    loadUserData();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const cartReady = productsLoaded && (!token || userDataFor === token);

  const value = {
    products,
    allProducts,
    productsLoaded,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    cartReady,
    addToCart,
    getCartCount,
    getCartProducts,
    getCartSummary,
    wishlistIds,
    isWishlisted,
    toggleWishlist,
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
