import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../context/ShopContext";
import StarRating from "../common/StarRating";
import { getOrderReviews, saveReview } from "../../services/reviewService";

/**
 * "Rate your purchase" — shown on a delivered order.
 *
 * One rating and message per item. Saving again edits the review the customer
 * already left, so the form is always filled with what they last wrote.
 */
// Long enough for a real opinion, short enough to read on a card.
const MAX_REVIEW_CHARS = 300;

export default function OrderReviewSection({ order }) {
  const { token } = useContext(ShopContext);
  const items = order?.items || [];

  // Per product id: { rating, message, saving, saved, error }
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !order?._id) return;
    let cancelled = false;

    getOrderReviews(order._id, token)
      .then((reviews) => {
        if (cancelled) return;
        const existing = {};
        for (const review of reviews) {
          existing[review.productId] = {
            rating: review.rating,
            message: review.message || "",
            saved: true,
          };
        }
        setDrafts(existing);
      })
      .catch(() => {
        // silent — the customer can still write a review
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [order?._id, token]);

  const update = (productId, changes) =>
    setDrafts((prev) => ({ ...prev, [productId]: { ...prev[productId], ...changes } }));

  const submit = async (productId) => {
    const draft = drafts[productId] || {};

    if (!draft.rating) {
      update(productId, { error: "Please select a rating" });
      return;
    }

    update(productId, { saving: true, error: "" });
    try {
      const review = await saveReview(
        {
          orderId: order._id,
          productId,
          rating: draft.rating,
          message: draft.message || "",
        },
        token
      );
      update(productId, {
        saving: false,
        saved: true,
        rating: review.rating,
        message: review.message,
      });
    } catch (error) {
      update(productId, {
        saving: false,
        error:
          error?.response?.data?.message ||
          "Could not save your review. Please try again.",
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <section
      id="reviews"
      className="bg-white border border-[#E6E8EC] rounded-lg p-4 md:p-6"
    >
      <h2 className="text-base md:text-lg font-semibold text-[#141416]">
        Rate your purchase
      </h2>
      <p className="text-sm text-[#777E90] mt-1 mb-4">
        Your review helps other shoppers, and may appear on our home page.
      </p>

      {loading ? (
        <p className="text-sm text-[#777E90]">Loading your reviews...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item, idx) => {
            const productId = item.product;
            const draft = drafts[productId] || {};

            return (
              <div
                key={item._id || idx}
                className="flex gap-3 md:gap-4 p-3 md:p-4 border border-[#E6E8EC] rounded-lg"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-[#E6E8EC] flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <p className="font-semibold text-[#141416] truncate">{item.name}</p>

                  <StarRating
                    value={draft.rating || 0}
                    onChange={(rating) => update(productId, { rating, error: "" })}
                    label={`Your rating for ${item.name}`}
                  />

                  <textarea
                    value={draft.message || ""}
                    onChange={(e) => update(productId, { message: e.target.value })}
                    maxLength={MAX_REVIEW_CHARS}
                    rows={3}
                    placeholder="Tell others what you liked (optional)"
                    className="w-full px-3 py-2 border border-[#E6E8EC] rounded-lg text-sm text-[#141416] bg-white"
                  />
                  <p className="text-xs text-[#777E90] text-right">
                    {(draft.message || "").length}/{MAX_REVIEW_CHARS}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => submit(productId)}
                      disabled={draft.saving}
                      className="px-5 py-2 bg-[#901CDB] text-white rounded-lg text-sm font-medium hover:bg-[#7A16C0] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {draft.saving
                        ? "Saving..."
                        : draft.saved
                        ? "Update review"
                        : "Submit review"}
                    </button>

                    {draft.saved && !draft.saving && (
                      <span className="text-sm text-[#34C759]">
                        Thanks! Your review is saved.
                      </span>
                    )}
                  </div>

                  {draft.error && (
                    <p className="text-sm text-red-500">{draft.error}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
