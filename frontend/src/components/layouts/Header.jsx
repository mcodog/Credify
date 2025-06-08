import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  selectIsLoggedIn,
  selectUser,
  selectUserRole,
} from "../../features/user/userSelector";
import { clearUser } from "../../features/user/userSlice";
import Logo from "../../assets/Credify.png";

const Header = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userRole = useSelector(selectUserRole);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);


  const handleLogout = () => {
    dispatch(clearUser());
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePage = (path) => location.pathname === path;

  return (

    <div className={`fixed w-full z-[100] bg-[var(--secondary-color)] px-4 sm:px-6 lg:px-8 py-3 lg:py-4 transition-transform duration-300 ease-in-out ${

      isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-3 max-w-[1350px] mx-auto items-center relative">
        {/* Logo positioned over content area - DESKTOP ONLY */}
        <div className="absolute top-1 left-8 xl:left-16 z-10 group">
          <img
            src={Logo}
            alt="Credify"
            className="h-20 w-auto transform transition-all duration-300 group-hover:scale-105"
            style={{
              filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
            }}
          />
        </div>

        {/* Left section - empty for logo space */}
        <div></div>

        {/* Center section - Navigation */}
         <nav className="flex gap-6 xl:gap-8 items-center justify-center">
          {[
            { path: '/', label: 'Home' },
            { path: '/about', label: 'About' },
            ...(isLoggedIn ? [{ path: '/verification', label: 'Verification' }] : []),
            ...(userRole === "admin" ? [{ path: '/admin', label: 'Admin' }] : [])
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`relative text-sm xl:text-base font-medium transition-all duration-300 group ${
                isActivePage(path)
                  ? 'text-[var(--tertiary-color)]'
                  : 'text-white hover:text-[var(--tertiary-color)]'
              }`}
            >
              {label}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--tertiary-color)] transition-all duration-300 ${
                isActivePage(path) ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          ))}
        </nav>

        {/* Right section - User Profile/Sign In */}
        <div className="flex justify-end items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* User Avatar/Greeting */}
              <div className="flex items-center gap-2">
                <Link to="/profile" className="w-8 h-8 rounded-full bg-[var(--tertiary-color)] flex items-center justify-center text-[var(--secondary-color)] font-semibold text-sm hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--tertiary-color)]">
                  {user?.firstname?.charAt(0)?.toUpperCase() || 'U'}
                </Link>
                <span className="text-white text-sm hidden xl:block">
                  Hi, {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="group relative overflow-hidden bg-transparent border border-[var(--tertiary-color)] text-[var(--tertiary-color)] px-4 py-2 rounded-lg hover:text-[var(--secondary-color)] transition-all duration-300 font-medium text-sm xl:text-base"
              >
                <span className="absolute inset-0 bg-[var(--tertiary-color)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                <span className="relative">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="group relative overflow-hidden bg-[var(--tertiary-color)] text-[var(--secondary-color)] px-4 xl:px-6 py-2.5 rounded-lg hover:bg-white transition-all duration-300 font-medium text-sm xl:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="relative">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden items-center justify-between relative">
        {/* Mobile Logo */}
        <div className="relative z-10 group">
          <img
            src={Logo}
            alt="Credify"
            className="h-12 sm:h-16 w-auto transform transition-all duration-300 group-hover:scale-105"
            style={{
              filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))",
            }}
          />
        </div>

        {/* Mobile User Info */}
        {isLoggedIn && (
          <div className="flex items-center gap-2">
            <Link to="/profile" className="w-8 h-8 rounded-full bg-[var(--tertiary-color)] flex items-center justify-center text-[var(--secondary-color)] font-semibold text-sm hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--tertiary-color)]">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className={`relative w-10 h-10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--tertiary-color)] transition-all duration-300 ${
            isMobileMenuOpen ? 'bg-[var(--tertiary-color)]/10' : 'hover:bg-white/10'
          }`}
          aria-label="Toggle menu"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-6 h-6">
              <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
              }`}></span>
              <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
              }`}></span>
            </div>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden absolute top-full left-0 right-0 transition-all duration-300 z-[90] ${
        isMobileMenuOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-[var(--secondary-color)]/95 backdrop-blur-md border border-white/10 rounded-b-xl mx-4 shadow-xl">
          <div className="px-6 py-6 space-y-2">
            {[
              { path: '/', label: 'Home' },
              { path: '/about', label: 'About' },
              { path: '/verification', label: 'Verification' },
              ...(userRole === "doctor" ? [{ path: '/admin', label: 'Admin' }] : [])
            ].map(({ path, label }, index) => (
              <Link
                key={path}
                to={path}
                onClick={closeMobileMenu}
                className={`block relative overflow-hidden px-4 py-3 rounded-lg transition-all duration-300 group ${
                  isActivePage(path)
                    ? 'text-[var(--tertiary-color)] bg-[var(--tertiary-color)]/10'
                    : 'text-white hover:text-[var(--tertiary-color)] hover:bg-white/5'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="relative font-medium">{label}</span>
                {isActivePage(path) && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--tertiary-color)] rounded-r"></span>
                )}
              </Link>
            ))}

            {/* Mobile Sign In/Logout */}
            <div className="pt-4 mt-4 border-t border-white/10">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2 text-white">
                    <div className="w-10 h-10 rounded-full bg-[var(--tertiary-color)] flex items-center justify-center text-[var(--secondary-color)] font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{user?.name || 'User'}</p>
                      <p className="text-sm text-white/70 capitalize">{userRole}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-all duration-300 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block w-full bg-[var(--tertiary-color)] text-[var(--secondary-color)] px-4 py-3 rounded-lg hover:bg-white transition-all duration-300 font-medium text-center shadow-lg"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
