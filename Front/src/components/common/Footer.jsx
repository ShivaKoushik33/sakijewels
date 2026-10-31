import { Link } from 'react-router-dom';
import Logo from '../../assets/images/Logo.svg';
import Mdot from '../../assets/images/Mdot.svg';
import {
  EMAIL_LINK,
  PHONE_LINK,
  SHOP_ADDRESS_LINES,
  SHOP_EMAIL,
  SHOP_PHONE_DISPLAY,
  WHATSAPP_LINK,
} from '../../utils/shopContact';

// "Follow us on" icons. An empty href shows the icon without a link.
const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/the_sakhijewels?igsh=eXFjeDJhajF2bTBm',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/share/194pQ5cGpy/',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.900 1.400-3.900 4v2.200H8v3h2.500V21z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@the_sakhijewels',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.6 7.2a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.800 2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.800zM10 15V9l5.200 3z" />
      </svg>
    ),
  },
];

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
                  <Link to="/#reviews" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">Customer Reviews</Link>
                  <Link to="/about" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">About The Sakhi Jewels</Link>
                </div>

                {/* Info & Policy */}
                <div className="flex flex-col gap-3 md:gap-5">
                  <h4 className="font-semibold text-[#141416]">Info & Policy</h4>
                  <Link to="/terms#returns" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">Shipping & Return</Link>
                  <Link to="/faq" className="text-sm md:text-base text-[#353945] hover:text-[#901CDB]">FAQ's & Support</Link>
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
                      {SHOP_ADDRESS_LINES[0]}<br />
                      {SHOP_ADDRESS_LINES[1]}
                    </p>
                  </div>
                  <p className="text-sm text-[#353945]">
                    Call us:{' '}
                    <a href={PHONE_LINK} className="hover:text-[#901CDB]">
                      {SHOP_PHONE_DISPLAY}
                    </a>
                  </p>
                  <p className="text-sm text-[#353945]">
                    Email:{' '}
                    <a href={EMAIL_LINK} className="hover:text-[#901CDB]">
                      {SHOP_EMAIL}
                    </a>
                  </p>
                  <a
                    href={WHATSAPP_LINK}
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
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ name, href, icon }) => {
                  const className =
                    'w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white text-[#901CDB] border border-[#901CDB]/20 transition-colors';

                  // No link yet: show the icon, but nothing to click.
                  if (!href) {
                    return (
                      <span key={name} title={name} aria-label={name} className={className}>
                        {icon}
                      </span>
                    );
                  }

                  return (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      title={name}
                      aria-label={name}
                      className={`${className} hover:bg-[#901CDB] hover:text-white`}
                    >
                      {icon}
                    </a>
                  );
                })}
              </div>
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