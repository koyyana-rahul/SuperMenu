import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/userSlice";
import toast from "react-hot-toast";
import useMobile from "../hooks/useMobile";

const Header = () => {
  const { userDetails, accessToken } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobile] = useMobile();
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  // Close mobile menu when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }

    // Lock body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile]);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = (
    <>
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "text-green-500" : "hover:text-green-500 transition-colors"
        }
      >
        Home
      </NavLink>
      <NavLink
        to="/about"
        className={({ isActive }) =>
          isActive ? "text-green-500" : "hover:text-green-500 transition-colors"
        }
      >
        About
      </NavLink>
      <NavLink
        to="/contact"
        className={({ isActive }) =>
          isActive ? "text-green-500" : "hover:text-green-500 transition-colors"
        }
      >
        Contact
      </NavLink>
    </>
  );

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-green-600">
              SuperMenu
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8 font-medium">
            {navLinks}
          </nav>

          {/* Auth links and User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {accessToken ? (
              <div
                ref={profileMenuRef}
                className="relative"
                aria-haspopup="true"
              >
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  aria-label="Open user menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  <FaUserCircle className="w-8 h-8 text-gray-600 cursor-pointer hover:text-green-500" />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 transition-all duration-200 ease-out ${
                    isProfileMenuOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <p className="px-4 py-2 text-sm text-gray-700">
                    Hi, {userDetails?.name || "User"}{" "}
                    {userDetails?.role && (
                      <span className="text-xs text-gray-500">
                        ({userDetails.role})
                      </span>
                    )}
                  </p>
                  {userDetails?.role === "BRAND_ADMIN" && (
                    <Link
                      to="/manage"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Manage Brand
                    </Link>
                  )}
                  {userDetails?.role === "BRAND_ADMIN" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-green-500 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-30 transition-opacity duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            aria-label="Close mobile menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-600 hover:text-green-500"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col p-4 space-y-2 font-medium">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex flex-col space-y-4"
          >
            {navLinks}
          </div>
          <div className="pt-4 border-t flex flex-col space-y-4">
            {accessToken ? (
              <>
                <div className="flex items-center space-x-2 px-2">
                  <FaUserCircle className="w-6 h-6 text-gray-600" />
                  <span className="truncate">
                    {userDetails?.name || "User"} ({userDetails?.role})
                  </span>
                </div>
                {userDetails?.role === "BRAND_ADMIN" && (
                  <NavLink
                    to="/manage"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-left py-2 px-2 rounded-md hover:bg-gray-100"
                  >
                    Manage Brand
                  </NavLink>
                )}
                {userDetails?.role === "BRAND_ADMIN" && (
                  <NavLink
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-left py-2 px-2 rounded-md hover:bg-gray-100"
                  >
                    Dashboard
                  </NavLink>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-md w-full text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md w-full text-center hover:bg-green-600"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
