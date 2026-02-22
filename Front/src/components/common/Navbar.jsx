import { Link } from 'react-router-dom';
import { useState ,useEffect } from 'react';
import MainIcon from '../../assets/images/MainIcon.svg';
import cart_icon from '../../assets/images/cart_icon.png';
import { ShopContext } from '../../context/shopContext';
import { useContext } from 'react';
import SearchBar from "../common/SearchBar";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartCount , setShowSearch } = useContext(ShopContext);
  const [isLangOpen, setIsLangOpen] = useState(false);
const [selectedLang, setSelectedLang] = useState("English");


  useEffect(() => {
  const script = document.createElement("script");
  script.src =
    "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);

  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      { pageLanguage: "en" },
      "google_translate_element"
    );
  };
}, []);

const changeLanguage = (langCode, label) => {
  const googleFrame = document.querySelector(".goog-te-combo");
  if (googleFrame) {
    googleFrame.value = langCode;
    googleFrame.dispatchEvent(new Event("change"));
  }

  setSelectedLang(label);
  setIsLangOpen(false);
};



  return (
    <>
      {/* Top Promotional Banner - hide on very small screens */}
      <div className="bg-[#901CDB] h-8 md:h-10 flex items-center justify-center overflow-hidden relative hidden sm:flex">
        <div className="flex items-center gap-[18px] animate-scroll whitespace-nowrap">
          <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-[#FBCC8E] via-[#FFECD3] to-[#FBCC8E] bg-clip-text text-transparent">
            FLAT 50% on Rings and Necklaces
          </span>
          <div className="w-[9.9px] h-[9.9px] bg-[#FBCC8E] rounded-full flex-shrink-0"></div>
          <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-[#FBCC8E] via-[#FFECD3] to-[#FBCC8E] bg-clip-text text-transparent">
            Exclusive Offers on Traditional Jewellery
          </span>
          <div className="w-[9.9px] h-[9.9px] bg-[#FBCC8E] rounded-full flex-shrink-0"></div>
          <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-[#FBCC8E] via-[#FFECD3] to-[#FBCC8E] bg-clip-text text-transparent">
            FLAT 50% on Rings and Necklaces
          </span>
          <div className="w-[9.9px] h-[9.9px] bg-[#FBCC8E] rounded-full flex-shrink-0"></div>
          <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-[#FBCC8E] via-[#FFECD3] to-[#FBCC8E] bg-clip-text text-transparent">
            Exclusive Offers on Traditional Jewellery
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-[140px] py-3 md:py-[18px]">
          <div className="flex items-center justify-between gap-4 md:gap-10">
            {/* Hamburger - mobile only */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-[5px] md:gap-[7.61px] flex-shrink-0">
              <img
                src={MainIcon}
                alt="The Sakhi Jewels"
                className="h-9 md:h-[49px] w-auto"
              />
              <span className="font-olivera text-lg md:text-[23.82px] leading-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFBD37] to-[#F7D14E]">
                THE SAKHI
                <br />
                JEWELS
              </span>
            </Link>

            {/* Location Selector - desktop only */}
            {/* <div className="hidden xl:flex flex-col gap-1 px-2 py-2 border border-[#901CDB] rounded-lg">
              <div className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0C5.24 0 3 2.24 3 5C3 9 8 16 8 16S13 9 13 5C13 2.24 10.76 0 8 0ZM8 7C6.9 7 6 6.1 6 5C6 3.9 6.9 3 8 3C9.1 3 10 3.9 10 5C10 6.1 9.1 7 8 7Z" fill="#000000"/>
                </svg>
                <span className="text-xs text-right text-black">Where to Deliver?</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-black">Update Delivery Pincode</span>
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.42 0.42L4 4L7.58 0.42" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div> */}

            {/* Search Bar - hide on small, show from md */}
              <div className="hidden md:flex flex-1 max-w-[400px] lg:max-w-none items-center gap-2 px-4 lg:px-5 py-2 lg:py-[14px] border border-[#E8E8E8] rounded-xl relative">
                  <SearchBar className="flex-1" />

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <circle cx="9" cy="9" r="6.5" stroke="#901CDB" strokeWidth="2"/>
                    <path d="M13.5 13.5L17 17" stroke="#901CDB" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-5 h-10 md:h-12">
              {/* Language Selector - desktop only */}
              <div className="flex flex-col items-center gap-2 relative">

  {/* Clickable Area */}
  <div
    className="flex flex-col items-center gap-1 cursor-pointer"
    onClick={() => setIsLangOpen(!isLangOpen)}
  >
    {/* Round Icon */}
    <div className="w-[18px] h-[18px] rounded-full bg-gray-200"></div>

    {/* Language + Arrow (Below Icon) */}
    <div className="flex items-center gap-1">
      <span className="text-[13px] text-[#901CDB]">
        {selectedLang}
      </span>

      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-200 ${
          isLangOpen ? "rotate-180" : ""
        }`}
      >
        <path
          d="M0.42 0.42L4 4L7.58 0.42"
          stroke="#901CDB"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>

  {/* Dropdown */}
  {isLangOpen && (
    <div className="absolute top-14 bg-white border border-[#E6E8EC] shadow-md rounded-md w-[130px] py-2 z-50">
      <button
        onClick={() => changeLanguage("en", "English")}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        English
      </button>
      <button
        onClick={() => changeLanguage("hi", "Hindi")}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Hindi
      </button>
      <button
        onClick={() => changeLanguage("te", "Telugu")}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Telugu
      </button>
      <button
        onClick={() => changeLanguage("ta", "Tamil")}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Tamil
      </button>
      <button
        onClick={() => changeLanguage("kn", "Kannada")}
        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      >
        Kannada
      </button>
    </div>
  )}
</div>



              {/* Search icon - mobile only */}
                {/* <button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="9" r="6.5" stroke="#901CDB" strokeWidth="2"/>
                  <path d="M13.5 13.5L17 17" stroke="#901CDB" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button> */}

              {/* Wishlist - icon only on mobile */}
              <Link to="/wishlist" className="hidden md:flex flex-col items-center gap-0.5 md:gap-2 p-1 md:p-0">
                <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 15.5L2.5 9C1.5 8 1 6.5 1 5C1 2.5 3 0.5 5.5 0.5C6.5 0.5 7.5 0.8 8.2 1.5L9 2.3L9.8 1.5C10.5 0.8 11.5 0.5 12.5 0.5C15 0.5 17 2.5 17 5C17 6.5 16.5 8 15.5 9L9 15.5Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs md:text-sm text-black hidden sm:inline">Wishlist</span>
              </Link>

             {/* Cart */}
<Link to="/cart" className="hidden md:flex relative items-center justify-center">
  {/* Cart Icon */}
  <img
    src={cart_icon}
    alt="cart"
    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7"
  />

  {/* Badge */}
  <span
    className="
      absolute
      -top-1.5 -right-1.5
      sm:-top-2 sm:-right-2
      min-w-[16px] sm:min-w-[18px]
      h-[16px] sm:h-[18px]
      px-1
      flex items-center justify-center
      text-[9px] sm:text-[10px]
      font-semibold
      text-white
      bg-black
      rounded-full
      shadow-md
    "
  >
    {getCartCount()||0}
  </span>
  {/* <span className="text-xs md:text-sm text-black hidden sm:inline">Cart</span> */}
              
</Link>


              {/* Profile - icon only on mobile */}
              <Link to="/profile" className="hidden md:flex flex-col items-center gap-0.5 md:gap-2 w-10 md:w-12 p-1 md:p-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="5" r="3" stroke="black" strokeWidth="0.5"/>
                  <path d="M3 16C3 12 6 10 9 10C12 10 15 12 15 16" stroke="black" strokeWidth="0.5" strokeLinecap="round"/>
                </svg>
                <span className="text-xs md:text-sm text-black hidden sm:inline">Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Menu - desktop; mobile as dropdown when isMenuOpen */}
        <div className={`border-b border-[#E6E8EC] ${isMenuOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-[100px] pb-2">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-1 lg:gap-0 flex-nowrap lg:whitespace-nowrap">
              <div className="flex items-center gap-1 px-[10px] py-[10px]">
                <span className="text-base text-[#353945]">Shop by Category</span>
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6L5 1L0 6" stroke="#353945" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="px-[10px] py-[10px]">
                <span className="text-base text-[#353945]">SALE is Live</span>
              </div>
              <div className="px-[10px] py-[10px]">
                <Link to="/collections?type=RING" className="text-base text-[#353945]">Rings</Link>
              </div>
              <div className="px-[10px] py-[10px]">
                <Link to="/collections?type=BRACELET" className="text-base text-[#353945]">Bracelets</Link>
              </div>
              <div className="px-[10px] py-[10px]">
                <Link to="/collections?type=NECKLACE" className="text-base text-[#353945]">Necklaces</Link>
              </div>
              {/* <div className="flex items-center gap-1 px-[10px] py-[10px]">
                <span className="text-base text-[#353945]">Student collections</span>
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6L5 1L0 6" stroke="#353945" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div> */}
              <div className="flex items-center gap-1 px-[10px] py-[10px]">
                <span className="text-base text-[#353945]">Exclusive collections</span>
                <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6L5 1L0 6" stroke="#353945" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex items-center gap-1 px-[10px] py-[10px]">
                <span className="text-base text-[#353945]">More at Sakhi Jewels</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div id="google_translate_element" style={{ display: "none" }}></div>
    </>
  );
}
