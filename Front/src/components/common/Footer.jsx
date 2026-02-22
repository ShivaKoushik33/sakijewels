import { Link } from 'react-router-dom';
import Logo from '../../assets/images/Logo.svg';
import insta from '../../assets/images/insta.svg';
import Mdot from '../../assets/images/Mdot.svg';



export default function Footer() {
  return (
    <footer className="w-full bg-[#FFEED8]">
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
                  <span className="text-sm md:text-base text-[#353945]">Customer Reviews</span>
                  <span className="text-sm md:text-base text-[#353945]">About The Sakhi Jewels</span>
                </div>

                {/* Info & Policy */}
                <div className="flex flex-col gap-3 md:gap-5">
                  <h4 className="font-semibold text-[#141416]">Info & Policy</h4>
                  <span className="text-sm md:text-base text-[#353945]">Shipping & Return</span>
                  <span className="text-sm md:text-base text-[#353945]">Privacy & Policy</span>
                  <span className="text-sm md:text-base text-[#353945]">FAQ's & Support</span>
                  <span className="text-sm md:text-base text-[#353945]">Terms of Service</span>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-3 md:gap-4 max-w-[280px]">
                  <h4 className="font-semibold text-[#141416]">Contact Us</h4>
                  <p className="text-xs md:text-sm text-[#353945]">
                    For any suggestions, queries or complaints please contact us:
                  </p>
                  <div className="text-sm text-[#353945]">
                    <p className="font-semibold">The Sakhi Jewels Pvt Ltd.</p>
                    <p>
                      Third Floor, Magnum Vista,<br />
                      Raghuvanahalli, Bangalore 560062
                    </p>
                  </div>
                  <p className="text-sm text-[#353945]">Call us: +91 70323 71104</p>
                  <p className="text-sm text-[#353945]">Email: support@thesakijewels.com</p>
                  <p className="text-sm underline cursor-pointer text-[#901CDB]">Chat with us</p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-sm md:text-base">Follow us on:</span>
              <img src={insta} alt="Instagram" className="w-6 h-6 md:w-8 md:h-8" />
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