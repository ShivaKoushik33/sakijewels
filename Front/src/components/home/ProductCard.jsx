import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { ShopContext } from '../../context/ShopContext';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function ProductCard({ product }) {
  const [adding, setAdding] = useState(false);
  const { addToCart, cartItems, isWishlisted, toggleWishlist, token, navigate } =
    useContext(ShopContext);

  if (!product) return null;

  const id = product.id;
  const wishlisted = isWishlisted(id);

  const {
    name = 'Silver Classic Solitaire Ring',
    price = 3799,
    originalPrice = 8399,
    discount = 72,
    image = '/images/product-ring-56586a.png',
    isBestseller = false,
    stock,
  } = product;

  const inCart = Boolean(cartItems[id]);
  // Cards that don't receive stock can't know, so they stay purchasable.
  const outOfStock = stock !== undefined && stock <= 0;

  const handleCartClick = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (inCart) {
      navigate('/cart');
      return;
    }

    setAdding(true);
    await addToCart(id);
    setAdding(false);
  };

  const cartButtonClass = inCart
    ? 'bg-white text-[#901CDB] border-[#901CDB] hover:bg-[#F5ECFC]'
    : outOfStock
    ? 'bg-[#E6E8EC] text-[#777E90] border-[#E6E8EC] cursor-not-allowed'
    : 'bg-[#901CDB] text-white border-[#901CDB] hover:bg-[#7A16C0] disabled:opacity-70';

  return (
    <div className="flex flex-col h-full gap-2 sm:gap-4 w-full max-w-[307px] mx-auto sm:mx-0">
      {/* Product Image Container - clickable to Product Details */}
      <Link to={`/products/${id}`} className="block">
        <div className="relative w-full aspect-square max-h-[200px] sm:max-h-[280px] md:max-h-[307px] md:h-[307px] bg-[#FCFDFC] border border-[#F8F8F9] rounded-t-xl md:rounded-[20px] overflow-hidden">
          <img
            src={image}
            alt={name}
            className={`w-full h-full object-cover ${outOfStock ? 'opacity-60' : ''}`}
          />
          {/* Bestseller Badge */}
          {isBestseller && (
            <div className="absolute top-0 left-[-10px] w-[80px] h-8 md:w-[108.16px] md:h-[44.41px]">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-[#4D0F75] to-[#901CDB] rounded-br-[10px] flex items-center justify-center">
                  <span className="text-[10px] md:text-sm font-semibold uppercase text-white tracking-wider">Bestseller</span>
                </div>
              </div>
            </div>
          )}
          {/* In-cart badge */}
          {inCart && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/95 text-[#901CDB] text-[10px] md:text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
              <CheckIcon /> In cart
            </span>
          )}
          {outOfStock && (
            <span className="absolute bottom-2 left-2 bg-[#141416]/80 text-white text-[10px] md:text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col justify-between flex-1 gap-1.5 md:gap-2.5">
        <Link to={`/products/${id}`} className="block">
          <div className="flex items-center gap-1.5 md:gap-2.5 flex-wrap">
            <div className="flex items-center gap-1 md:gap-1.25">
              <span className="text-base md:text-lg font-medium text-[#141416]">₹{price.toLocaleString()}</span>
              <span className="text-xs md:text-sm font-normal text-[#777E90] line-through">₹{originalPrice.toLocaleString()}</span>
            </div>
            <div className="bg-[#34C759] inline-flex items-center px-1.5 py-1 rounded-md">
              <span className="text-[10px] md:text-[11px] font-bold text-white uppercase tracking-wider leading-none">{discount}% OFF</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-sm md:text-[17px] font-normal text-[#777E90] leading-snug line-clamp-2 hover:text-[#141416]">{name}</span>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCartClick}
            disabled={adding || (outOfStock && !inCart)}
            className={`flex-1 border px-2 py-2 md:px-2.5 md:py-2.5 rounded-lg text-sm md:text-lg font-medium text-center transition-colors ${cartButtonClass}`}
          >
            {inCart ? (
              <span className="inline-flex items-center justify-center gap-1.5">
                <CheckIcon /> Go to Cart
              </span>
            ) : outOfStock ? (
              'Out of Stock'
            ) : adding ? (
              'Adding...'
            ) : (
              'Add to Cart'
            )}
          </button>
          <button
            type="button"
            onClick={() => toggleWishlist(id)}
            className="p-2 rounded-lg hover:bg-[#f8f8f9] transition-all duration-200"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={wishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${wishlisted ? 'text-red-500' : 'text-[#121212]'} hover:text-[#901CDB]`}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
