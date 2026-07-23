import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiPlusCircle, FiList, FiBell, FiUsers, FiUser, FiBarChart2,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary-600 text-white'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
  }`;

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={onClose} />}

      <aside
        className={`fixed md:sticky top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 p-4 z-30 transform transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="space-y-1">
          <NavLink to="/dashboard" className={linkClasses} onClick={onClose}>
            <FiGrid /> Dashboard
          </NavLink>
          <NavLink to="/report-issue" className={linkClasses} onClick={onClose}>
            <FiPlusCircle /> Report Issue
          </NavLink>
          <NavLink to="/track-issues" className={linkClasses} onClick={onClose}>
            <FiList /> Track Issues
          </NavLink>
          <NavLink to="/notifications" className={linkClasses} onClick={onClose}>
            <FiBell /> Notifications
          </NavLink>

          {user.role === 'admin' && (
            <>
              <div className="pt-4 pb-1 px-4 text-xs font-semibold uppercase text-gray-400">Admin</div>
              <NavLink to="/admin" className={linkClasses} onClick={onClose}>
                <FiBarChart2 /> Admin Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={linkClasses} onClick={onClose}>
                <FiUsers /> Manage Users
              </NavLink>
            </>
          )}

          <div className="pt-4 pb-1 px-4 text-xs font-semibold uppercase text-gray-400">Account</div>
          <NavLink to="/profile" className={linkClasses} onClick={onClose}>
            <FiUser /> Profile
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
