import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import api from '../services/api';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Broken Furniture', 'Electrical', 'Water Supply', 'Toilet', 'Classroom',
  'Playground', 'Laboratory', 'Library', 'Boundary Wall', 'Sanitation',
  'Safety Hazard', 'Others',
];
const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const TrackIssues = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: '', status: '', priority: '' });

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 9 };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      // Admin uses the all-issues endpoint scoped to their own reports isn't relevant here;
      // this page is for the logged-in user's own issues regardless of role.
      const { data } = await api.get('/issues/my', { params });
      setIssues(data.issues);
      setPages(data.pages);
    } catch (err) {
      // handled globally
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Track Your Issues</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Search and filter through all issues you've reported.</p>

      <div className="card p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            className="input-field pl-9"
            placeholder="Search title, description, location..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <select className="input-field" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input-field" value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-32" />)}
        </div>
      ) : issues.length ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => <IssueCard key={issue._id} issue={issue} />)}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card p-10 text-center text-gray-400">No issues match your filters.</div>
      )}
    </div>
  );
};

export default TrackIssues;
