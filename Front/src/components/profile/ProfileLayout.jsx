import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';

const sidebarLinks = [
  { to: '/profile', label: 'Personal Information' },
  { to: '/profile/addresses', label: 'Addresses' },
  // { to: '/profile/bank-details', label: 'Bank & UPI Details' },
  { to: '/', label: 'Log Out' },
];

export default function ProfileLayout() {
  const location = useLocation();
  const { logout } = useContext(ShopContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white lg:flex">
      {/* Sidebar - desktop only */}
      <aside className="hidden lg:block lg:static w-[280px] flex-shrink-0 bg-white border-r border-[#E6E8EC]">
        <div className="flex flex-col h-full pt-6 pb-6 px-4">
          <h2 className="text-lg font-semibold text-[#141416] mb-8">Account</h2>
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
