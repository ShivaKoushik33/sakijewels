/**
 * Single source of truth for order pricing.
 *
 * These rules were previously copy-pasted into createPaymentOrder,
 * verifyPaymentAndPlaceOrder and placeOrderCOD (plus the payment page in the
 * storefront), and had already drifted — the comment said 5% prepaid discount
 * while the code applied 3%. Every path now calls this one function, so the
 * quote a customer is shown and the amount they are charged cannot disagree.
 *
 * Amounts are whole rupees. Nothing here reads the request body directly.
 */

export const DELIVERY_FEE = 49;
export const COD_CHARGE = 29;
export const MIN_ORDER_SUBTOTAL = 249;
export const PREPAID_DISCOUNT_RATE = 0.03; // 3% off items when paying online

/**
 * Coupon catalogue. `firstOrderOnly` coupons are validated against the
 * customer's real order history, never against a client-supplied flag.
 */
const COUPONS = {
  TSJFIRST: { minSubtotal: 599, firstOrderOnly: true, flat: 100 },
  TSJSSFIRST: { minSubtotal: 999, firstOrderOnly: true, flat: 100, freeShipping: true },
  TSJ10: { minSubtotal: 999, percent: 0.1 },
  TSJSS15: { minSubtotal: 1499, percent: 0.15, freeShipping: true },
};

/**
 * @param {object}  args
 * @param {Array}   args.items         [{ price, quantity }, ...]
 * @param {string}  [args.coupon]      raw coupon code from the client
 * @param {boolean} args.isFirstOrder  true when the customer has no prior orders
 * @param {"ONLINE"|"COD"} args.paymentMethod
 */
export const priceOrder = ({ items, coupon, isFirstOrder, paymentMethod }) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let deliveryFee = DELIVERY_FEE;
  let discount = 0;
  let appliedCoupon = null;

  const code = typeof coupon === "string" ? coupon.trim().toUpperCase() : "";
  const rule = COUPONS[code];

  if (rule && subtotal >= rule.minSubtotal) {
    if (!rule.firstOrderOnly || isFirstOrder) {
      discount += rule.flat ?? Math.floor(subtotal * rule.percent);
      if (rule.freeShipping) deliveryFee = 0;
      appliedCoupon = code;
    }
  }

  // Prepaid incentive applies to the item subtotal only, never to fees.
  if (paymentMethod === "ONLINE") {
    discount += Math.floor(subtotal * PREPAID_DISCOUNT_RATE);
  }

  const codCharge = paymentMethod === "COD" ? COD_CHARGE : 0;
  const totalAmount = subtotal - discount + deliveryFee + codCharge;

  return {
    subtotal,
    discount,
    deliveryFee,
    codCharge,
    totalAmount,
    coupon: appliedCoupon,
  };
};
