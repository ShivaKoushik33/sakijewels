import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { ShopContext } from '../../context/shopContext';
import { useNavigate } from 'react-router-dom';
const sidebarLinks = [
  { to: '/profile', label: 'Personal Information' },
  { to: '/profile/orders', label: 'My Orders' },
  { to: '/profile/addresses', label: 'Addresses' },
  // { to: '/profile/bank-details', label: 'Bank & UPI Details' },
  { to: '/', label: 'Log Out' },
];


export default function ProfileLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { token, setToken } = useContext(ShopContext);
  const navigate = useNavigate();
const handleLogout = () => {
  localStorage.removeItem("token");
  setToken("");
  navigate("/");
};


  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - fixed on desktop, drawer on mobile */}
      <aside
        className={`
          fixed lg:static top-16 bottom-0 left-0 z-40
          w-[280px] flex-shrink-0 bg-white border-r border-[#E6E8EC]
          transform transition-transform duration-200 ease-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full pt-6 pb-6 px-4">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-lg font-semibold text-[#141416]">Account</h2>
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg hover:bg-[#F4F5F6]"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map(({ to, label }) => {
              const isLogout = label === "Log Out";
              const isActive = location.pathname === to || (to !== '/profile' && location.pathname.startsWith(to));
              if (isLogout) {
                return (
                  <button
                    key={to}
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-[#FF3B30] hover:bg-[#FDECEC] text-left"
                  >
                    {label}
                  </button>
                );
              }

              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-[#901CDB] text-white'
                      : 'text-[#353945] hover:bg-[#F4F5F6]'}
                  `}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content + mobile header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[#E6E8EC] bg-white">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-[#F4F5F6]"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span className="text-base font-semibold text-[#141416]">My Profile</span>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
