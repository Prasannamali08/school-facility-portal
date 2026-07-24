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
          Track Your Issues
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Search, filter and monitor all reported facility issues.
        </p>
      </div>

      {/* Filters */}

      <div className="card p-6 shadow-lg mb-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">

        <div className="relative lg:col-span-2">

          <FiSearch
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            className="input-field pl-12"
            placeholder="Search title, description, location..."
            value={filters.search}
            onChange={(e) =>
              handleFilterChange('search', e.target.value)
            }
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