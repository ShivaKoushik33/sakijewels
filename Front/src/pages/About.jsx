import { useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/Logo.svg";
import SupportContact from "../components/common/SupportContact";

const TRADITIONAL = [
  "One gram gold necklaces",
  "Pearl and ruby necklaces",
  "Earrings and jhumkas",
  "Bangles",
  "Mangalsutra",
  "Minimal necklaces and pendants",
];

const FASHION = [
  "Necklaces and earrings",
  "Bracelets and rings",
  "Anklets",
  "Hair accessories",
  "Mangalsutra",
  "Gift hampers",
];

const PROMISES = [
  {
    title: "Checked and packed with care",
    text: "Every order is checked and securely packed before it leaves us.",
  },
  {
    title: "Prices you can see",
    text: "The price, discount, delivery fee and total are shown before you pay. Nothing is added later.",
  },
  {
    title: "Pay your way",
    text: "Pay online or choose cash on delivery, whichever you are comfortable with.",
  },
  {
    title: "We put it right",
    text: "If a piece arrives damaged or is not what you ordered, tell us within 48 hours and we will replace or refund it.",
  },
];

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FAF7FF] min-h-screen py-8 px-4">
      <div className="max-w-[900px] mx-auto bg-white rounded-2xl shadow-md p-6 md:p-8">

        {/* Title */}
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <img src={Logo} alt="The Sakhi Jewels" className="w-14 md:w-20 h-auto" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#901CDB]">
              About The Sakhi Jewels
            </h1>
            <p className="text-sm text-[#777E90] mt-1">
              Jewellery for every day and every occasion
            </p>
          </div>
        </div>

        {/* Who we are */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
            Who we are
          </h2>
          <p className="text-gray-700 mb-3">
            The Sakhi Jewels is an online jewellery store from Kalikiri, in the
            Chittoor district of Andhra Pradesh. &ldquo;Sakhi&rdquo; means a
            close friend, and that is how we like to help you choose: honestly,
            the way a friend would.
          </p>
          <p className="text-gray-700">
            We bring together traditional pieces for weddings and festivals and
            lighter, modern pieces for everyday wear, at prices that let you
            wear something new more often.
          </p>
        </section>

        {/* What we offer */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
            What you will find
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-[#901CDB] mb-1">Traditional</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {TRADITIONAL.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#901CDB] mb-1">Fashion</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {FASHION.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-gray-700 mt-3">
            There is a men&apos;s collection too.
          </p>
          <Link
            to="/collections"
            className="inline-block mt-4 px-6 py-2.5 bg-[#901CDB] text-white rounded-lg text-sm font-medium hover:bg-[#7A16C0] transition-colors"
          >
            Browse the collections
          </Link>
        </section>

        {/* Our promise */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
            Our promise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROMISES.map((promise) => (
              <div key={promise.title} className="border border-[#E6E8EC] rounded-xl p-4">
                <h3 className="font-semibold text-[#141416]">{promise.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{promise.text}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#777E90] mt-3">
            The details are in our{" "}
            <Link to="/terms" className="text-[#901CDB] underline">
              policies
            </Link>{" "}
            and{" "}
            <Link to="/faq" className="text-[#901CDB] underline">
              FAQs
            </Link>
            .
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold text-[#F7B500] mb-2">
            Talk to us
          </h2>
          <p className="text-gray-700 mb-3">
            Questions about a piece, an order or a gift? We are happy to help.
          </p>
          <SupportContact />
        </section>

        {/* Footer */}
        <p className="mt-8 text-center text-[#901CDB] font-medium">
          Thank you for shopping with us 💜
        </p>

      </div>
    </div>
  );
}
