import { useNavigate } from "react-router-dom";

/**
 * Back arrow for pages reached from another page. Goes to wherever the admin
 * came from; `fallback` is used when the page was opened directly.
 */
const BackButton = ({ fallback = "/dashboard" }) => {
  const navigate = useNavigate();

  const goBack = () => {
    // React Router records its position in history state; 0 means there is
    // no earlier page inside the admin to return to.
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      title="Back"
      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

export default BackButton;
