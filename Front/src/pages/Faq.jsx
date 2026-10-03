import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SupportContact from "../components/common/SupportContact";

// The figures here repeat Backend/src/utils/pricing.js and the Terms page.
// Change a charge or a policy there, and change it here too.
const FAQ_GROUPS = [
  {
    title: "Orders & Payment",
    questions: [
      {
        q: "How do I place an order?",
        a: "Add the pieces you like to your cart, open the cart and continue to checkout. Choose or add a delivery address, check the order summary, then pay online or pick cash on delivery.",
      },
      {
        q: "Do I need an account?",
        a: "Yes. Sign in with your mobile number and the one-time code we send you. There is no password to remember.",
      },
      {
        q: "Which payment methods do you accept?",
        a: "You can pay online through our secure payment gateway, or pay cash on delivery.",
      },
      {
        q: "Is there any benefit to paying online?",
        a: "Yes. Online payment takes ₹9 off your order. Cash on delivery has a ₹12 handling charge.",
      },
      {
        q: "Is there a minimum order amount?",
        a: "Yes, the items in your order must total at least ₹99.",
      },
      {
        q: "How do I use a coupon?",
        a: "Enter the code in the coupon box on the Review your order page and press Apply. One coupon can be used per order, and each coupon has its own minimum order amount.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    questions: [
      {
        q: "How much is shipping?",
        a: "Shipping is ₹49 per order. Some coupons include free shipping.",
      },
      {
        q: "How long does delivery take?",
        a: "We process orders in 1–3 working days, and delivery takes a further 3–7 working days. The expected delivery date is shown at checkout and on your order page.",
      },
      {
        q: "Where do you deliver?",
        a: "We deliver to addresses within India.",
      },
      {
        q: "How do I check my order status?",
        a: "Open My Orders and choose the order. For anything more, message us on WhatsApp with your Order ID.",
      },
    ],
  },
  {
    title: "Cancellation, Returns & Refunds",
    questions: [
      {
        q: "Can I cancel my order?",
        a: "Yes, as long as it has not been shipped. Open the order in My Orders, choose Cancel Order and contact us. Orders cancelled before shipping are refunded in full within 3 business days. Cash on delivery orders cannot be cancelled after shipment.",
      },
      {
        q: "What if my order arrives damaged, or I get the wrong item?",
        a: "Contact us within 48 hours of delivery with your Order ID and photos or a video. An unboxing video helps us resolve it faster.",
      },
      {
        q: "How long does a replacement or refund take?",
        a: "Once we have verified the request, replacements are sent within 7 working days and refunds are made within 5 business days. We may ask you to return the item first.",
      },
      {
        q: "Can I return an item I simply changed my mind about?",
        a: "No. We accept returns only for items that arrive damaged or are not what you ordered. The item must be unused and in its original packaging.",
      },
      {
        q: "Are shipping and cash on delivery charges refunded?",
        a: "No, shipping and cash on delivery charges are non-refundable.",
      },
    ],
  },
  {
    title: "Account & Reviews",
    questions: [
      {
        q: "Can I save more than one delivery address?",
        a: "Yes. Add and manage addresses under My Profile, and choose which one to use at checkout.",
      },
      {
        q: "How do I review a product?",
        a: "After your order is delivered, open it in My Orders and use Rate your purchase to give a star rating and a short review.",
      },
      {
        q: "Is my information safe?",
        a: "Your details are used only to process and deliver your orders. Payments are handled by our payment gateway; we never store your card, UPI or bank details.",
      },
    ],
  },
];

export default function Faq() {
  const location = useLocation();

  // The footer's support link points at /faq#support. Runs on every click,
  // including when this page is already open.
  useEffect(() => {
    const section = location.hash && document.getElementById(location.hash.slice(1));
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="bg-[#FAF7FF] min-h-screen py-8 px-4">
      <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow-md p-6 md:p-8">

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#901CDB] mb-6 border-b pb-3">
          FAQs & Support
        </h1>

        {FAQ_GROUPS.map((group) => (
          <section key={group.title} className="mb-6">
            <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
              {group.title}
            </h2>

            <div className="flex flex-col gap-2">
              {group.questions.map((item) => (
                <details
                  key={item.q}
                  className="group border border-[#E6E8EC] rounded-xl open:border-[#901CDB]/40"
                >
                  <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-medium text-[#141416]">
                    {item.q}
                    <svg
                      className="w-5 h-5 flex-shrink-0 text-[#901CDB] transition-transform group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 7.5l5 5 5-5" />
                    </svg>
                  </summary>
                  <p className="px-4 pb-4 text-gray-700">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <p className="text-sm text-[#777E90] mb-8">
          The full policies are on our{" "}
          <Link to="/terms" className="text-[#901CDB] underline">
            Terms & Conditions
          </Link>{" "}
          page.
        </p>

        {/* Support */}
        <section id="support" className="scroll-mt-24 sm:scroll-mt-44">
          <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
            Still need help?
          </h2>
          <p className="text-gray-700 mb-3">
            Reach us any of these ways. If it is about an order, keep your
            Order ID handy.
          </p>
          <SupportContact />
        </section>

      </div>
    </div>
  );
}
