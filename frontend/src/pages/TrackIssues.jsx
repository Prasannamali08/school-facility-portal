import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch } from 'react-icons/fi';
import api from '../services/api';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'Broken Furniture',
  'Electrical',
  'Water Supply',
  'Toilet',
  'Classroom',
  'Playground',
  'Laboratory',
  'Library',
  'Boundary Wall',
  'Sanitation',
  'Safety Hazard',
  'Others',
];

const STATUSES = [
  'Pending',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
];

const PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

const TrackIssues = () => {
  const { user } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    priority: '',
  });

  const fetchIssues = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        ...filters,
        page,
        limit: 9,
      };

      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

     const endpoint =
  user?.role === 'admin'
    ? '/issues'
    : '/issues/my';

const { data } = await api.get(endpoint, { params });

      setIssues(data.issues);
      setPages(data.pages);
    } catch (err) {
      // handled globally
    } finally {
      setLoading(false);
    }
  }, [filters, page, user]);
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div>

      {/* Header */}

      <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
  {user?.role === "teacher"
    ? "My & Assigned Issues"
    : user?.role === "admin"
    ? "Manage Issues"
    : "Track Your Issues"}
</h1>

<p className="mt-2 text-gray-500 dark:text-gray-400">
  {user?.role === "teacher"
    ? "View your reported issues and issues assigned to you."
    : user?.role === "admin"
    ? "Monitor and manage all reported issues."
    : "Search, filter and monitor all reported facility issues."}
</p>
      </div>

      {/* Filters */}

     <div className="card p-6 shadow-lg mb-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">

  <div className="lg:col-span-2 flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3">

    <FiSearch
      size={20}
      className="text-gray-400 mr-4 flex-shrink-0"
    />

    <input
      type="text"
      placeholder="Search title, description, location..."
      value={filters.search}
      onChange={(e) =>
        handleFilterChange("search", e.target.value)
      }
      className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
    />

  </div>
        <select
          className="input-field cursor-pointer"
          value={filters.category}
          onChange={(e) =>
            handleFilterChange('category', e.target.value)
          }
        >
          <option value="">All Categories</option>

          {CATEGORIES.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        <select
          className="input-field cursor-pointer"
          value={filters.status}
          onChange={(e) =>
            handleFilterChange('status', e.target.value)
          }
        >
          <option value="">All Statuses</option>

          {STATUSES.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}
        </select>

        <select
          className="input-field cursor-pointer"
          value={filters.priority}
          onChange={(e) =>
            handleFilterChange('priority', e.target.value)
          }
        >
          <option value="">All Priorities</option>

          {PRIORITIES.map((priority) => (
            <option
              key={priority}
              value={priority}
            >
              {priority}
            </option>
          ))}
        </select>

      </div>

      {/* Loading */}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="skeleton h-44 rounded-2xl"
            />
          ))}
        </div>
      ) : issues.length ? (
        <>
          {/* Issue Cards */}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {issues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
              />
            ))}
          </div>

          {/* Pagination */}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">

              {Array.from(
                { length: pages },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                    p === page
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}

            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center shadow-lg">

          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            No Issues Found
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Try changing your search or filter options.
          </p>

        </div>
      )}

    </div>
  );
};

export default TrackIssues;