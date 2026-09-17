/**
 * Star rating.
 *
 * Pass onChange to let the customer pick a rating; leave it out to simply
 * show one. Picking is done with real buttons, so it works with a keyboard
 * and with a screen reader.
 */
const Star = ({ filled, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-.9z" />
  </svg>
);

export default function StarRating({ value = 0, onChange, size = 22, label }) {
  const stars = [1, 2, 3, 4, 5];

  if (!onChange) {
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[#901CDB]"
        role="img"
        aria-label={`${value} out of 5 stars`}
      >
        {stars.map((star) => (
          <Star key={star} filled={star <= value} size={size} />
        ))}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1" role="group" aria-label={label || "Rating"}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          aria-pressed={star === value}
          title={`${star} star${star === 1 ? "" : "s"}`}
          className={`rounded transition-colors ${
            star <= value ? "text-[#901CDB]" : "text-[#B1B5C3] hover:text-[#901CDB]"
          }`}
        >
          <Star filled={star <= value} size={size} />
        </button>
      ))}
    </span>
  );
}
