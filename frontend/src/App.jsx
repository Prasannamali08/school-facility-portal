import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import TrackIssues from './pages/TrackIssues';
import IssueDetails from './pages/IssueDetails';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Wraps a page with the public Navbar only (no sidebar) - used for Home/Auth pages
const PublicLayout = ({ children }) => (
  <div className="min-h-screen">
    <Navbar />
    {children}
  </div>
);

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
      <Route path="/reset-password/:token" element={<PublicLayout><ResetPassword /></PublicLayout>} />

      {/* Authenticated pages (any role) */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/report-issue" element={<ProtectedRoute><DashboardLayout><ReportIssue /></DashboardLayout></ProtectedRoute>} />
      <Route path="/track-issues" element={<ProtectedRoute><DashboardLayout><TrackIssues /></DashboardLayout></ProtectedRoute>} />
      <Route path="/issues/:id" element={<ProtectedRoute><DashboardLayout><IssueDetails /></DashboardLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><DashboardLayout><Notifications /></DashboardLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />

      {/* Admin-only pages */}
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></ProtectedRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><ManageUsers /></DashboardLayout></ProtectedRoute>}
      />

      {/* 404 */}
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
}

export default App;
