import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Terms() {
  const location = useLocation();

  // Footer links point at one policy (/terms#shipping). Runs on every click,
  // including when this page is already open, so a link never does nothing.
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
          Terms & Conditions
        </h1>

        {/* Section */}
        <section id="returns" className="mb-6 scroll-mt-24 sm:scroll-mt-44">
          <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
            Return, Replacement & Refund Policy
          </h2>

          <p className="text-gray-700 mb-3">
            We carefully check and securely pack every order before shipping.
          </p>

          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            <li>The product is received damaged</li>
            <li>You received the wrong item</li>
          </ul>

          <h3 className="font-semibold mt-4 text-[#901CDB]">How to Request</h3>
          <ul className="list-disc ml-5 text-gray-700">
            <li>Contact within 48 hours</li>
            <li>Share Order ID + photos/video</li>
            <li>Unboxing video recommended</li>
          </ul>

          <h3 className="font-semibold mt-4 text-[#901CDB]">After Verification</h3>
          <ul className="list-disc ml-5 text-gray-700">
            <li>Replacement within 7 working days</li>
            <li>Refund within 5 business days</li>
          </ul>

          <h3 className="font-semibold mt-4 text-[#901CDB]">Conditions</h3>
          <ul className="list-disc ml-5 text-gray-700">
            <li>Unused with original packaging</li>
            <li>No requests after 48 hours</li>
            <li>No returns except valid cases</li>
            <li>COD cannot be cancelled after shipment</li>
          </ul>

          <h3 className="font-semibold mt-4 text-[#901CDB]">Important</h3>
          <ul className="list-disc ml-5 text-gray-700">
            <li>Shipping & COD charges are non-refundable</li>
            <li>Return may be required before refund</li>
          </ul>
        </section>

        {/* Shipping */}
        <section id="shipping" className="mb-6 scroll-mt-24 sm:scroll-mt-44">
          <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
            Shipping Policy
          </h2>

          <ul className="list-disc ml-5 text-gray-700">
            <li>Processing: 1–3 working days</li>
            <li>Delivery: 3–7 working days</li>
            <li>Shipping: ₹49</li>
            <li>COD: ₹12 extra</li>
          </ul>
        </section>

        {/* Cancellation */}
        <section id="cancellation" className="mb-6 scroll-mt-24 sm:scroll-mt-44">
          <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
            Cancellation Policy
          </h2>

          <ul className="list-disc ml-5 text-gray-700">
            <li>Cancel only before shipping</li>
            <li>Full refund if cancelled before shipment</li>
            <li>Refund within 3 business days</li>
            <li>COD cannot be cancelled after shipment</li>
          </ul>
        </section>

        {/* Privacy Policy */}
        <section id="privacy" className="scroll-mt-24 sm:scroll-mt-44">
          <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
            Privacy Policy
          </h2>

          <p className="text-gray-700 mb-3">
            Your privacy matters to us. The personal information you share with
            The Sakhi Jewels such as your name, phone number, email and
            delivery address is collected for one purpose only: to process,
            pack and deliver your orders and to keep you updated about them.
          </p>

          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            <li>
              We use your details <strong>solely to fulfil and deliver your
              orders</strong> — never for any other purpose.
            </li>
            <li>
              We <strong>do not sell, rent or share</strong> your personal data
              with any third party for marketing or advertising.
            </li>
            <li>
              Delivery details are shared only with our trusted courier
              partners, and payment is handled securely by our payment gateway —
              we never store your card, UPI or bank details on our servers.
            </li>
            <li>
              Your information is kept confidential and protected with
              reasonable security measures against unauthorised access.
            </li>
            <li>
              We retain your order details only as long as needed for delivery,
              support and any legal or accounting requirements.
            </li>
            <li>
              You may contact us anytime to review, correct or request deletion
              of your personal information.
            </li>
          </ul>

          <p className="text-gray-700 mt-3">
            By placing an order with us, you consent to this Privacy Policy.
          </p>
        </section>

        {/* Footer */}
        <p className="mt-8 text-center text-[#901CDB] font-medium">
          Thank you for shopping with us 💜
        </p>

      </div>
    </div>
  );
}