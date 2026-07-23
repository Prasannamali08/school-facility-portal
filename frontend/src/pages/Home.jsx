import React from 'react';
import { Link } from 'react-router-dom';
import { FiTool, FiBell, FiBarChart2, FiShield, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: <FiTool />, title: 'Report Issues Instantly', desc: 'Log facility problems in seconds with photos, category, and priority.' },
  { icon: <FiBarChart2 />, title: 'Track in Real Time', desc: 'Follow every repair from Pending to Resolved with a full activity timeline.' },
  { icon: <FiBell />, title: 'Stay Notified', desc: 'Get notified the moment your issue is assigned, updated, or resolved.' },
  { icon: <FiShield />, title: 'Role-Based Access', desc: 'Parents, teachers, and admins each get a tailored, secure experience.' },
];

const stats = [
  { value: '500+', label: 'Issues Resolved' },
  { value: '3', label: 'User Roles' },
  { value: '24h', label: 'Avg. Response Time' },
  { value: '99.9%', label: 'Uptime' },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">School Facility Condition Reporting &amp; Repair Tracking</h1>
          <p className="text-lg md:text-xl text-primary-50 max-w-2xl mx-auto mb-8">
            A single portal for parents, teachers, and administrators to report, assign, and resolve
            school facility issues — fast.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-100">
                Go to Dashboard <FiArrowRight />
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100">
                  Get Started
                </Link>
                <Link to="/login" className="border border-white/70 font-semibold px-6 py-3 rounded-lg hover:bg-white/10">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary-600">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Everything you need to keep facilities in shape</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">Built for real schools with real maintenance workflows.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-xl mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">About the Project</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This portal was built to close the gap between people who notice facility problems — parents and
            teachers — and the administrators responsible for fixing them. Every report is tracked from
            submission to resolution, with a full history and transparent communication at every step.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to report your first issue?</h2>
        <Link to={isAuthenticated ? '/report-issue' : '/register'} className="btn-primary inline-flex items-center gap-2">
          {isAuthenticated ? 'Report an Issue' : 'Create Your Free Account'} <FiArrowRight />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-semibold text-white">🏫 School Facility Portal</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} School Facility Portal. Built for internship evaluation.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
