import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

// Same rule as MIN_ORDER_SUBTOTAL in Backend/src/utils/pricing.js.
const MIN_ORDER_SUBTOTAL = 249;

const formatINR = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;
const pluralItems = (count) => `${count} ${count === 1 ? "item" : "items"}`;

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export default function Cart() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    cartItems,
    setCartItems,
    cartReady,
    getCartProducts,
    getCartSummary,
    token,
    backendUrl,
    delivery_fee,
    setBuyNowItem
  } = useContext(ShopContext);

  // Latest stock per product, fetched fresh so "+" can't exceed it.
  const [stockMap, setStockMap] = useState({});
  // Per-item stock warning or update error.
  const [lineMessage, setLineMessage] = useState({});
  // Item whose quantity/removal request is in flight.
  const [busyId, setBusyId] = useState(null);

  const cartProducts = getCartProducts();
  const summary = getCartSummary();

  const cartIdsKey = cartProducts.map((p) => p.id).join(",");

  useEffect(() => {
    if (cartProducts.length === 0) return;

    let cancelled = false;

    const fetchStocks = async () => {
      try {
        const entries = await Promise.all(
          cartProducts.map(async (item) => {
            const response = await axios.get(
              `${backendUrl}/api/products/${item.id}`
            );
            return [item.id, response.data.stock || 0];
          })
        );

        if (!cancelled) {
          setStockMap(Object.fromEntries(entries));
        }
      } catch {
        // ignore – buttons still guard with current stockMap
      }
    };

    fetchStocks();

    return () => {
      cancelled = true;
    };
  }, [cartIdsKey, backendUrl]);

  const setMessage = (itemId, text) =>
    setLineMessage((prev) => ({ ...prev, [itemId]: text }));

  // quantity 0 removes the item
  const saveQuantity = async (itemId, quantity) => {
    setBusyId(itemId);
    try {
      const response = await axios.put(
        `${backendUrl}/api/cart/update`,
        { itemId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(response.data.cartData);
      setMessage(itemId, "");
    } catch (error) {
      setMessage(
        itemId,
        error?.response?.data?.message || "Could not update your cart. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  };

  const changeQuantity = (itemId, change) => {
    const next = (cartItems[itemId] || 0) + change;
    if (next < 1) return;

    if (change > 0) {
      const stock = stockMap[itemId];
      if (stock === undefined) {
        setMessage(itemId, "Checking stock, please wait...");
        return;
      }
      if (next > stock) {
        setMessage(
          itemId,
          stock === 0 ? "Out of stock" : `Only ${stock} available in stock`
        );
        return;
      }
    }

    saveQuantity(itemId, next);
  };

  if (!cartReady) {
    return (
      <div className="min-h-[60vh] bg-white flex items-center justify-center text-[#777E90]">
        Loading your cart...
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center px-4 py-10 text-center">
        <img
          src="/images/empty-state.svg"
          alt=""
          className="w-full max-w-[280px] h-auto max-h-[200px] object-contain"
        />
        <p className="text-xl font-semibold text-[#141416] mt-6">Your cart is empty</p>
        <p className="text-sm text-[#777E90] mt-2">
          Browse our collections and add something you love.
        </p>
        <Link
          to="/collections"
          className="mt-6 px-8 py-3 bg-[#901CDB] text-white rounded-lg font-medium hover:bg-[#7A16C0] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Only in-stock lines are charged (see getCartSummary), so the fee and the
  // minimum-order rule apply to those alone.
  const hasPayableItems = summary.itemCount > 0;
  const deliveryFee = hasPayableItems ? delivery_fee : 0;
  const total = summary.subtotal + deliveryFee;
  const belowMinimum = hasPayableItems && summary.subtotal < MIN_ORDER_SUBTOTAL;
  const excludedCount = cartProducts.length - summary.itemCount;
  const totalUnits = cartProducts.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-[120px] py-6 md:py-10">

        <div className="flex items-end justify-between gap-4 mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-[#141416]">
            My Cart{" "}
            <span className="text-base md:text-lg font-medium text-[#777E90]">
              ({pluralItems(totalUnits)})
            </span>
          </h1>
          <Link
            to="/collections"
            className="text-sm font-medium text-[#901CDB] hover:underline whitespace-nowrap"
          >
            Continue shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cartProducts.map((item) => {
              const inStock = item.stock > 0;
              const shortOfStock = inStock && item.quantity > item.stock;
              const busy = busyId === item.id;
              const knownStock = stockMap[item.id];
              const atStockLimit = knownStock !== undefined && item.quantity >= knownStock;

              return (
                <div
                  key={item.id}
                  className={`flex gap-4 sm:gap-6 p-4 md:p-5 bg-white border border-[#E6E8EC] rounded-xl transition-opacity ${busy ? "opacity-60" : ""}`}
                >
                  <Link
                    to={`/products/${item.id}`}
                    className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-[#E6E8EC] bg-[#FCFDFC]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover ${inStock ? "" : "grayscale"}`}
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/products/${item.id}`}
                        className="text-base md:text-lg font-semibold text-[#141416] hover:text-[#901CDB] line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => saveQuantity(item.id, 0)}
                        disabled={busy}
                        aria-label={`Remove ${item.name} from cart`}
                        title="Remove"
                        className="shrink-0 w-8 h-8 rounded-full text-[#777E90] hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors disabled:cursor-not-allowed"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-lg font-semibold text-[#141416]">
                        {formatINR(item.price)}
                      </span>
                      {item.originalPrice > item.price && (
                        <>
                          <span className="text-sm text-[#777E90] line-through">
                            {formatINR(item.originalPrice)}
                          </span>
                          <span className="bg-[#34C759] text-white text-[11px] font-bold uppercase tracking-wider px-1.5 py-1 rounded-md leading-none">
                            {item.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {inStock ? (
                      <div className="flex items-center justify-between flex-wrap gap-3 mt-1">
                        <div className="inline-flex items-center border border-[#E6E8EC] rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, -1)}
                            disabled={busy || item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="w-9 h-9 text-lg font-semibold text-[#901CDB] hover:bg-[#F5ECFC] disabled:text-[#B1B5C3] disabled:hover:bg-transparent disabled:cursor-not-allowed"
                          >
                            −
                          </button>
                          <span
                            className="min-w-10 px-2 text-center text-sm font-semibold text-[#141416]"
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(item.id, 1)}
                            disabled={busy || atStockLimit}
                            aria-label="Increase quantity"
                            className="w-9 h-9 text-lg font-semibold text-[#901CDB] hover:bg-[#F5ECFC] disabled:text-[#B1B5C3] disabled:hover:bg-transparent disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        {item.quantity > 1 && (
                          <span className="text-sm text-[#777E90]">
                            Item total:{" "}
                            <span className="font-semibold text-[#141416]">
                              {formatINR(item.price * item.quantity)}
                            </span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="mt-1 inline-block w-fit bg-red-50 text-red-600 text-sm font-semibold px-3 py-1 rounded">
                        Out of stock — remove to checkout
                      </span>
                    )}

                    {shortOfStock && (
                      <p className="text-sm text-[#B45309]">
                        Only {item.stock} left. Reduce the quantity to include this item in your order.
                      </p>
                    )}

                    {lineMessage[item.id] && (
                      <p className="text-sm text-red-500">{lineMessage[item.id]}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-[#E6E8EC] rounded-xl p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-[#141416] mb-5">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm md:text-base text-[#353945]">
                <div className="flex justify-between gap-4">
                  <span>Price ({pluralItems(summary.unitCount)})</span>
                  <span>{formatINR(summary.mrpTotal)}</span>
                </div>

                {summary.discount > 0 && (
                  <div className="flex justify-between gap-4">
                    <span>Discount</span>
                    <span className="text-[#34C759]">− {formatINR(summary.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between gap-4">
                  <span>Delivery charges</span>
                  <span>{formatINR(deliveryFee)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-[#E6E8EC] my-4" />

              <div className="flex justify-between gap-4 text-lg font-bold text-[#141416]">
                <span>Total Amount</span>
                <span>{formatINR(total)}</span>
              </div>

              {summary.discount > 0 && (
                <p className="mt-3 text-sm font-medium text-[#34C759]">
                  You save {formatINR(summary.discount)} on this order
                </p>
              )}

              {excludedCount > 0 && (
                <p className="mt-3 text-sm text-[#B45309]">
                  {pluralItems(excludedCount)} not included in this total because of stock. See the notes in your cart.
                </p>
              )}

              {belowMinimum && (
                <p className="mt-3 text-sm text-red-500">
                  Add {formatINR(MIN_ORDER_SUBTOTAL - summary.subtotal)} more to place your order
                  (minimum order {formatINR(MIN_ORDER_SUBTOTAL)}).
                </p>
              )}

              <button
                type="button"
                disabled={!hasPayableItems || belowMinimum}
                onClick={() => {
                  setBuyNowItem(null);
                  navigate("/checkout/review");
                }}
                className="mt-5 w-full py-3 bg-[#901CDB] text-white rounded-lg font-medium hover:bg-[#7A16C0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#901CDB]"
              >
                Checkout Securely
              </button>

              <p className="mt-3 text-xs text-center text-[#777E90]">
                Apply coupons and get 3% off with online payment on the next step.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
