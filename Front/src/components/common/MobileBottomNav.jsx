import { Link, useLocation } from 'react-router-dom';

const navItems = [
  // { to: '/', label: 'Home', icon: 'home' },
  { to: '/wishlist', label: 'Wishlist', icon: 'wishlist' },
  { to: '/cart', label: 'Cart', icon: 'cart' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

function NavIcon({ icon, isActive }) {
  const stroke = isActive ? '#000000' : '#000000';
  const size = 22;
  switch (icon) {
    // case 'home':
    //   return (
    //     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    //       <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    //       <path d="M9 22V12h6v10" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    //     </svg>
    //   );
    case 'wishlist':
      return (
        <svg width={size} height={size} viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.18L12 20z" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'cart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1h3l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="22" r="1.5" stroke={stroke} strokeWidth="2"/>
          <circle cx="20" cy="22" r="1.5" stroke={stroke} strokeWidth="2"/>
        </svg>
      );
    case 'profile':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function MobileBottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#ffffff]"
      aria-label="Mobile navigation"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, label, icon }) => {
          const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`
                flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0
                transition-colors
                ${isActive ? 'text-[#000000]' : 'text-[#000000]'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={isActive ? 'flex items-center justify-center w-10 h-10 rounded-full bg-[#901CDB]/20 text-[#901CDB]' : 'text-white'}>
                <NavIcon icon={icon} isActive={isActive} />
              </span>
              <span className="text-[10px] md:text-xs font-medium truncate max-w-[64px]">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
