import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { get } from 'mongoose';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  // console.log("Backend URL in context provider:", backendUrl); // Debug log
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });
 
  const [variantType, setVariantType] = useState(
  localStorage.getItem("variantType") || "TRADITIONAL"
  
);

  const [search, setSearch] = useState(''); 
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});


  const [selectedAddress, setSelectedAddress] = useState(null);
  const [delivery_fee, setDeliveryFee] = useState(79); 
    


  const navigate = useNavigate(); // to navigate to different pages

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/products/main-category/${variantType}`);

      // console.log("Products data:", response.data);

      setProducts(response.data);
        console.log("Products set:", response.data);   // ✅ directly set array

    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch products");
    }
  };

  const addToCart = async (itemId) => {
    console.log("Adding item to cart:", itemId); // Debug log
    if (!token) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }
    let cartData = structuredClone(cartItems);
    console.log("Adding to cart, current cart data:", cartData); // Debug log
    if (cartData[itemId]) {
      cartData[itemId] += 1
    } else {
      cartData[itemId] = 1
    }

  setCartItems(cartData);
  console.log("Updated cart data after adding item:", cartData); // Debug log
    if (token) {
      try {
        const response = await axios.post(
          backendUrl + '/api/cart/add',
          {
            itemId
          },
          {
            headers: {
  Authorization: `Bearer ${token}`,
},
          }
        );
        console.log("Add to cart response:", response); // Debug log

        if (response.status === 200) {
          console.log(response.data.message);
        } else {
          console.log('error', response.data.message);
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    }
  }
  

   useEffect(() => {
    console.log("Cart items updated:", cartItems);
  }, [cartItems]);



    const getCartCount = () => {
      let totalCount = 0;
      for (let item in cartItems) {
        const productExists = products.find((product) => product._id === item);
        if (productExists) {
          totalCount += cartItems[item];
        }

      }
      return totalCount;
    };



  const getCartProducts = () => {
    return Object.keys(cartItems)
      .map((id) => {
        const product = products.find((p) => p._id === id);
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
    console.log("Fetching user cart with token:", token); // Debug log
    try {
      const response = await axios.get(
        backendUrl + '/api/cart',
        
        {
         headers: {
          Authorization: `Bearer ${token}`,
        }

        }
      );
      console.log("User cart response:", response); // Debug log
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
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
  getProductsData();
}, [variantType]);

   useEffect(() => {
  const initialize = async () => {
    await getProductsData();

    if (token) {
      await getUserCart(token);
    }
    else{
      await getUserCart();
    }
  };

  initialize();
}, [token]);





  // useEffect(() => {
  //   if (token) {
  //     localStorage.setItem("token", token);
  //   } else {
  //     localStorage.removeItem("token");
  //   }
  // }, [token]);

 


       

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
          setVariantType
        };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
export default ShopContextProvider;