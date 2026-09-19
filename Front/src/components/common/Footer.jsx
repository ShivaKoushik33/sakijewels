import { Link } from 'react-router-dom';
import Logo from '../../assets/images/Logo.svg';
import insta from '../../assets/images/Insta.svg';
import Mdot from '../../assets/images/Mdot.svg';
import instaMain from '../../assets/images/InstaMain.jpeg';



// The shop's own contact details, used by the call, mail and chat links.
const SHOP_PHONE = '9705653066';
const SHOP_EMAIL = 'support@thesakhijewels.com';
const WHATSAPP_GREETING = encodeURIComponent(
  "Hi, I have a question about an order from The Sakhi Jewels."
);

export default function Footer() {
  return (
    <footer id="about-us" className="w-full bg-[#FFEED8]">
      <div className="max-w-[1440px] mx-auto">

        {/* Main Footer */}
        <div className="px-4 sm:px-6 md:px-10 lg:px-[120px] pt-10 sm:pt-12 md:pt-16 pb-8 md:pb-12">
          <div className="flex flex-col gap-8 md:gap-12">

            {/* Top Row - stack on mobile, row on desktop */}
            <div className="flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-12">

              {/* Logo */}
              <div className="flex items-center gap-3">
                <img
                  src={Logo}
                  alt="The Sakhi Jewels"
                  className="w-16 md:w-[100px] h-auto"
                />
                <span className="font-olivera text-xl md:text-[25px] leading-[1.05] text-[#901CDB]">
                  THE SAKHI <br />
                  JEWELS
                </span>
              </div>

              {/* Links - grid on mobile, row on desktop */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-10 md:gap-12 lg:gap-[140px]">

                {/* Quick Links */}
                <div className="flex flex-col gap-3 md:gap-5">
                  <h4 className="font-semibold text-[#141416]">Quick Links</h4>
                  <Link to="/cart" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">My Cart</Link>
                  <Link to="/profile" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">My Profile</Link>
                  <Link to="/#reviews" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">Customer Reviews</Link>
                  <Link to="/#about-us" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">About The Sakhi Jewels</Link>
                </div>

                {/* Info & Policy */}
                <div className="flex flex-col gap-3 md:gap-5">
          
                  <Link to="/terms" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">Info & Policy</Link>
                  <Link to="/terms" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">Shipping & Return</Link>
                  <Link to="/terms" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">FAQ's & Support</Link>
                  <Link to="/terms" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">Terms of Service</Link>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-3 md:gap-4 max-w-[280px]">
                  <h4 className="font-semibold text-[#141416]">Contact Us</h4>
                  <p className="text-xs md:text-sm text-[#353945]">
                    For any suggestions, queries or complaints please contact us:
                  </p>
                  <div className="text-sm text-[#353945]">
                    <p className="font-semibold">The Sakhi Jewels</p>
                    <p>
                      1-108-2 kotala kalikiri Mandal<br />
                      chittoor dist Andhra Pradesh - 517234
                    </p>
                  </div>
                  <p className="text-sm text-[#353945]">
                    Call us:{' '}
                    <a href={`tel:+91${SHOP_PHONE}`} className="hover:text-[#901CDB]">
                      +91 97056 53066
                    </a>
                  </p>
                  <p className="text-sm text-[#353945]">
                    Email:{' '}
                    <a href={`mailto:${SHOP_EMAIL}`} className="hover:text-[#901CDB]">
                      {SHOP_EMAIL}
                    </a>
                  </p>
                  <a
                    href={`https://wa.me/91${SHOP_PHONE}?text=${WHATSAPP_GREETING}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm underline text-[#901CDB] hover:text-[#7A16C0]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.8.8-1 1.9-.6 3a9.3 9.3 0 0 0 4.3 4.5c1.5.7 2.4.7 3.2.6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3z" />
                    </svg>
                    Chat with us on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-col gap-4">
              <span className="font-semibold text-sm md:text-base">Follow us on:</span>
              <img src={instaMain} alt="Instagram" className="w-24 h-24 md:w-28 md:h-28" onClick={() =>
    window.open(
      "https://www.instagram.com/the_sakhijewels?igsh=eXFjeDJhajF2bTBm",
      "_blank"
    )
  } />
            </div>

            {/* Copyright */}
            <p className="text-xs md:text-sm uppercase text-[#353945]">
              All Copyrights © 2026 Reserved
            </p>
          </div>
        </div>

        {/* Bottom Credit */}
        <div className="border-t border-black px-4 sm:px-6 md:px-10 lg:px-[120px] py-4 md:py-6">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-center">
            <span className="tracking-widest text-xs md:text-sm">
              AN ORIGINAL DESIGN BY
            </span>
            <img src={Mdot} alt="M Dot Designs" className="h-5 md:h-[26px]" />
            <span className="text-base md:text-[20px] font-kodchasan text-[#901CDB]">Dot Designs</span>
            <span className="text-[10px] text-[#901CDB]">TM</span>
          </div>
        </div>

      </div>
    </footer>
  );
}