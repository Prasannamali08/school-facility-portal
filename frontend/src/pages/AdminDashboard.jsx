import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { FiClipboard, FiClock, FiCheckCircle, FiAlertTriangle, FiUsers, FiSearch } from 'react-icons/fi';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { statusColors, priorityColors } from '../components/IssueCard';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchOverview = async () => {
    try {
      const [summaryRes, chartsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/charts'),
      ]);
      setSummary(summaryRes.data.summary);
      setCharts(chartsRes.data.charts);
    } catch (err) {
      // handled globally
    }
  };

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 8 };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/issues', { params });
      setIssues(data.issues);
      setPages(data.pages);
    } catch (err) {
      // handled globally
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchOverview(); }, []);
  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const pieData = {
    labels: charts?.byStatus.map((s) => s.status) || [],
    datasets: [{ data: charts?.byStatus.map((s) => s.count) || [], backgroundColor: ['#9ca3af', '#3b82f6', '#f97316', '#16a34a', '#dc2626'] }],
  };
  const barData = {
    labels: charts?.byPriority.map((p) => p.priority) || [],
    datasets: [{ label: 'Issues', data: charts?.byPriority.map((p) => p.count) || [], backgroundColor: '#16a34a', borderRadius: 6 }],
  };

  return (
  <div className="space-y-8">

    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>

      <p className="mt-2 text-gray-500 dark:text-gray-400">
        School-wide facility issue analytics and management.
      </p>
    </div>

    {/* Statistics */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
      <StatCard
        icon={<FiClipboard />}
        label="Total Issues"
        value={summary?.total ?? 0}
        color="blue"
        loading={!summary}
      />

      <StatCard
        icon={<FiClock />}
        label="Pending"
        value={summary?.pending ?? 0}
        color="orange"
        loading={!summary}
      />

      <StatCard
        icon={<FiCheckCircle />}
        label="Resolved"
        value={summary?.resolved ?? 0}
        color="green"
        loading={!summary}
      />

      <StatCard
        icon={<FiAlertTriangle />}
        label="Critical"
        value={summary?.critical ?? 0}
        color="red"
        loading={!summary}
      />

      <StatCard
        icon={<FiUsers />}
        label="Total Users"
        value={summary?.totalUsers ?? 0}
        color="gray"
        loading={!summary}
      />
    </div>

    {/* Average Resolution */}
    <div className="card p-6 shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Average Resolution Time
      </p>

      <p className="mt-2 text-4xl font-bold text-primary-600">
        {summary?.avgResolutionHours ?? 0} hrs
      </p>
    </div>

    {/* Charts */}
    <div className="grid xl:grid-cols-2 gap-8">

      <div className="card p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-6">
          Issues by Status
        </h2>

        {charts?.byStatus?.length ? (
          <Pie data={pieData} />
        ) : (
          <p className="text-gray-400">No data yet</p>
        )}
      </div>

      <div className="card p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-6">
          Issues by Priority
        </h2>

        {charts?.byPriority?.length ? (
          <Bar
            data={barData}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                },
              },
            }}
          />
        ) : (
          <p className="text-gray-400">No data yet</p>
        )}
      </div>

    </div>

    {/* Manage Issues */}
    <div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">
          Manage All Issues
        </h2>
      </div>

      <div className="card p-6 shadow-lg mb-6 flex flex-col lg:flex-row gap-4">

        <div className="relative flex-1">

          <FiSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            className="input-field pl-10"
            placeholder="Search issues..."
            value={filters.search}
            onChange={(e) => {
              setPage(1);
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
              }));
            }}
          />

        </div>

        <select
          className="input-field lg:w-56"
          value={filters.status}
          onChange={(e) => {
            setPage(1);
            setFilters((prev) => ({
              ...prev,
              status: e.target.value,
            }));
          }}
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

      </div>

      <div className="card shadow-lg overflow-hidden overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 dark:bg-gray-700 text-left uppercase text-xs tracking-wide text-gray-600 dark:text-gray-200">

            <tr>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Reported By</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Date</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-400"
                >
                  Loading...
                </td>
              </tr>

            ) : issues.length ? (

              issues.map((issue) => (

                <tr
                  key={issue._id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800 transition"
                >

                  <td className="px-5 py-4">

                    <Link
                      to={`/issues/${issue._id}`}
                      className="font-semibold hover:text-primary-600"
                    >
                      {issue.title}
                    </Link>

                  </td>

                  <td className="px-5 py-4">
                    {issue.reportedBy?.name}
                  </td>

                  <td className="px-5 py-4">

                    <span className={`badge ${priorityColors[issue.priority]}`}>
                      {issue.priority}
                    </span>

                  </td>

                  <td className="px-5 py-4">

                    <span className={`badge ${statusColors[issue.status]}`}>
                      {issue.status}
                    </span>

                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-400"
                >
                  No issues found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {pages > 1 && (

        <div className="flex justify-center gap-3 mt-8">

          {Array.from(
            { length: pages },
            (_, i) => i + 1
          ).map((p) => (

            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl font-semibold transition ${
                p === page
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>

          ))}

        </div>

      )}

    </div>

  </div>
);
};

export default AdminDashboard;
