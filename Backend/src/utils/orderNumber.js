import Counter from "../models/Counter.js";

const PREFIX = "TSJ";
const PAYMENT_CODE = { COD: "C", ONLINE: "P" };

// The shop runs on Indian time, whatever the server's clock is set to.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** "261003" for 3 Oct 2026, in Indian time. */
const dayKey = (date) => {
  const ist = new Date(new Date(date).getTime() + IST_OFFSET_MS);
  const yy = String(ist.getUTCFullYear()).slice(-2);
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(ist.getUTCDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
};

/**
 * The next order number, e.g. "TSJ-261003-C-0042": the day the order was
 * placed, C for cash on delivery or P for prepaid, and that day's running
 * count (shared by both payment types).
 *
 * Deliberately taken outside the order's transaction: two customers checking
 * out together would otherwise collide on the counter and one order would
 * fail. The cost is that a failed checkout leaves a gap in the sequence.
 *
 * @param {"COD"|"ONLINE"} paymentMethod
 * @param {Date|string} [placedAt] - defaults to now
 */
export const nextOrderNumber = async (paymentMethod, placedAt = new Date()) => {
  const day = dayKey(placedAt);

  const counter = await Counter.findOneAndUpdate(
    { _id: `order-${day}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const code = PAYMENT_CODE[paymentMethod] || PAYMENT_CODE.ONLINE;
  return `${PREFIX}-${day}-${code}-${String(counter.seq).padStart(4, "0")}`;
};
