import { Link, useNavigate } from 'react-router-dom';
import { useState ,useEffect } from 'react';
import MainIcon from '../../assets/images/MainIcon.svg';
import cart_icon from '../../assets/images/cart_icon.png';
import { ShopContext } from '../../context/ShopContext';
import { useContext } from 'react';
import SearchBar from "../common/SearchBar";

export default function Navbar({ onMenuToggle }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartCount , setShowSearch, setVariantType } = useContext(ShopContext);
  const navigate = useNavigate();

  // Mobile menu: go home, switch variant, and scroll to top.
  const goToVariant = (variant) => {
    setVariantType(variant);
    toggleMenu(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const [isLangOpen, setIsLangOpen] = useState(false);
const [selectedLang, setSelectedLang] = useState("English");

  const toggleMenu = (value) => {
    const next = typeof value === 'boolean' ? value : !isMenuOpen;
    setIsMenuOpen(next);
    onMenuToggle?.(next);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

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
        <div className="relative z-50 bg-white max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-[140px] py-3 md:py-[18px]">
          <div className="flex items-center justify-between gap-4 md:gap-10">
            {/* Hamburger - mobile only */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => toggleMenu()}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              )}
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


              {/* Orders - desktop */}
              <Link to="/orders" className="hidden md:flex flex-col items-center gap-0.5 md:gap-2 p-1 md:p-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6H21" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs md:text-sm text-black hidden sm:inline">Orders</span>
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

        {/* Overlay when mobile menu is open */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 backdrop-blur-[2px] z-40 lg:hidden"
            onClick={() => toggleMenu(false)}
          />
        )}

        {/* Navigation Menu - desktop; mobile as dropdown when isMenuOpen */}
        <div className={`${isMenuOpen ? 'block absolute top-full left-0 right-0 z-50' : 'hidden'} lg:static lg:block lg:border-b lg:border-[#E6E8EC]`}>
          {/* Desktop layout */}
          <div className="hidden lg:block max-w-[1440px] mx-auto px-4 md:px-10 lg:px-[100px] pb-2 bg-white">
            <div className="flex flex-row items-center justify-between w-full flex-nowrap whitespace-nowrap">
              <div className="flex items-center gap-1 px-[10px] py-[10px]">
               <Link to="/#shop-category">Shop by Category</Link>
              </div>
              <div className="px-[10px] py-[10px]">
                <Link to="/#essentials">Mens Collection</Link>
              </div>
              <div className="px-[10px] py-[10px]">
                <Link to="/#most-gifted">Most Gifted</Link>
              </div>
              <div className="px-[10px] py-[10px]">
                <Link to="/#best-selling">Best Selling</Link>
              </div>
              <div className="px-[10px] py-[10px]">
                <Link to="/#reviews">Reviews</Link>
              </div>
              <div className="px-[10px] py-[10px]">
                <Link to="/orders">My Orders</Link>
              </div>
              <div className="flex items-center gap-1 px-[10px] py-[10px]">
               <Link to="/#about-us">About Us</Link>
              </div>
              <div className="px-[10px] py-[10px]">
                <Link to="/terms">Terms & Conditions</Link>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="lg:hidden bg-white rounded-b-2xl shadow-xl border-t border-[#E6E8EC] overflow-hidden animate-[slideDown_0.2s_ease-out]">
            <div className="flex flex-col py-2">
              {/* Home */}
              <Link to="/" onClick={() => { toggleMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>
                </span>
                Home
              </Link>

              {/* Traditional */}
              <button type="button" onClick={() => goToVariant("TRADITIONAL")} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors text-left w-full">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 20l-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 2z"/></svg>
                </span>
                Traditional
              </button>

              {/* Modern */}
              <button type="button" onClick={() => goToVariant("FASHION")} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors text-left w-full">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M12 3v18M5 8l7-5 7 5M5 8v8l7 5 7-5V8"/></svg>
                </span>
                Modern
              </button>

              {/* New Arrivals */}
              <Link to="/#new-arrivals" onClick={() => toggleMenu(false)} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6L12 2z"/></svg>
                </span>
                New Arrivals
              </Link>

              <div className="border-t border-[#E6E8EC] my-1 mx-5"></div>

              <Link to="/#shop-category" onClick={() => toggleMenu(false)} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>
                </span>
                Shop by Category
              </Link>
              <Link to="/#essentials" onClick={() => toggleMenu(false)} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </span>
                Mens Collection
              </Link>
              <Link to="/#most-gifted" onClick={() => toggleMenu(false)} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6M12 2v16M12 2l4 4M12 2L8 6"/></svg>
                </span>
                Most Gifted
              </Link>
              <Link to="/#best-selling" onClick={() => toggleMenu(false)} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </span>
                Best Selling
              </Link>
              <Link to="/#reviews" onClick={() => toggleMenu(false)} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </span>
                Reviews
              </Link>
              <div className="border-t border-[#E6E8EC] my-1 mx-5"></div>
              <Link to="/orders" onClick={() => toggleMenu(false)} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                </span>
                My Orders
              </Link>
              <Link to="/#about-us" onClick={() => toggleMenu(false)} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                </span>
                About Us
              </Link>
              <Link to="/terms" onClick={() => toggleMenu(false)} className="flex items-center gap-3 px-5 py-3 text-[15px] font-medium text-[#141416] hover:bg-[#F4F5F6] transition-colors">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#901CDB]/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#901CDB" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                </span>
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div id="google_translate_element" style={{ display: "none" }}></div>
    </>
  );
}
