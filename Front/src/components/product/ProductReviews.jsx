import { useEffect, useState } from "react";
import { getProductReviews } from "../../services/reviewService";

const Stars = ({ rating }) => (
  <span
    role="img"
    aria-label={`${rating} out of 5 stars`}
    className="text-base leading-none tracking-wide"
  >
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        aria-hidden="true"
        className={star <= Math.round(rating) ? "text-yellow-500" : "text-[#e6e8ec]"}
      >
        ★
      </span>
    ))}
  </span>
);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function ProductReviews({ productId, rating, ratingCount }) {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    getProductReviews(productId)
      .then((data) => {
        if (cancelled) return;
        setReviews(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <section
      aria-labelledby="product-reviews-title"
      className="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 pb-10 md:pb-14"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <div className="border-t border-[#e6e8ec] pt-8">
        <h2 id="product-reviews-title" className="text-lg md:text-xl font-semibold text-[#121212]">
          Reviews
        </h2>

        {ratingCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-2xl font-semibold text-[#121212]">
              {Number(rating || 0).toFixed(1)}
            </span>
            <Stars rating={rating} />
            <span className="text-sm text-[#777E90]">
              {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}

        {status === "loading" && (
          <p className="mt-4 text-sm text-[#777E90]">Loading reviews...</p>
        )}

        {status === "error" && (
          <p className="mt-4 text-sm text-[#777E90]">
            Could not load reviews. Please try again later.
          </p>
        )}

        {status === "ready" && reviews.length === 0 && (
          <p className="mt-4 text-sm text-[#777E90]">No reviews yet.</p>
        )}

        {reviews.length > 0 && (
          <ul className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <li key={review.id} className="p-4 border border-[#e6e8ec] rounded-[12px] bg-white">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-[#121212] break-words min-w-0">
                    {review.name}
                  </p>
                  <time dateTime={review.date} className="shrink-0 text-xs text-[#777E90]">
                    {formatDate(review.date)}
                  </time>
                </div>
                <div className="mt-1">
                  <Stars rating={review.rating} />
                </div>
                {review.message && (
                  <p className="mt-2 text-sm leading-relaxed text-[#353945] break-words">
                    {review.message}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
