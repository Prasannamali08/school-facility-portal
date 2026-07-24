import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications?unreadOnly=true');
        setUnreadCount(data.unreadCount);
      } catch (err) {
        // Ignore errors
      }
    };

    fetchUnread();

    const interval = setInterval(fetchUnread, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">

      <div className="flex items-center justify-between h-16 px-4 md:px-6">

        {/* Left */}
        <div className="flex items-center gap-3">

          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FiMenu size={20} />
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-wide text-primary-600 hover:text-primary-700 transition"
          >
            🏫
            <span>Facility Portal</span>
          </Link>

        </div>

        {/* Right */}
        {user && (
          <div className="flex items-center gap-4">

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl transition-all hover:bg-primary-50 dark:hover:bg-gray-700 hover:scale-105"
            >
              <FiBell size={21} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <div className="relative" ref={menuRef}>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >

                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>

              </button>

              {menuOpen && (

                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                  >
                    <FiUser />
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition"
                  >
                    <FiLogOut />
                    Logout
                  </button>

                </div>

              )}

            </div>

          </div>
        )}

      </div>

    </header>
  );
};

export default Navbar;