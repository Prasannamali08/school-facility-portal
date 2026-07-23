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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">School-wide facility issue analytics and management.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<FiClipboard />} label="Total Issues" value={summary?.total ?? 0} color="blue" loading={!summary} />
        <StatCard icon={<FiClock />} label="Pending" value={summary?.pending ?? 0} color="orange" loading={!summary} />
        <StatCard icon={<FiCheckCircle />} label="Resolved" value={summary?.resolved ?? 0} color="green" loading={!summary} />
        <StatCard icon={<FiAlertTriangle />} label="Critical" value={summary?.critical ?? 0} color="red" loading={!summary} />
        <StatCard icon={<FiUsers />} label="Total Users" value={summary?.totalUsers ?? 0} color="gray" loading={!summary} />
      </div>

      <div className="card p-4">
        <p className="text-sm text-gray-500">Average Resolution Time</p>
        <p className="text-3xl font-bold text-primary-600">{summary?.avgResolutionHours ?? 0} hrs</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Issues by Status</h2>
          {charts?.byStatus.length ? <Pie data={pieData} /> : <p className="text-sm text-gray-400">No data yet</p>}
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Issues by Priority</h2>
          {charts?.byPriority.length ? (
            <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
          ) : (
            <p className="text-sm text-gray-400">No data yet</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Manage All Issues</h2>
        <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Search issues..."
              value={filters.search}
              onChange={(e) => { setPage(1); setFilters((p) => ({ ...p, search: e.target.value })); }}
            />
          </div>
          <select
            className="input-field sm:w-48"
            value={filters.status}
            onChange={(e) => { setPage(1); setFilters((p) => ({ ...p, status: e.target.value })); }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Reported By</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
              ) : issues.length ? (
                issues.map((issue) => (
                  <tr key={issue._id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <Link to={`/issues/${issue._id}`} className="font-medium hover:underline">{issue.title}</Link>
                    </td>
                    <td className="px-4 py-3">{issue.reportedBy?.name}</td>
                    <td className="px-4 py-3"><span className={`badge ${priorityColors[issue.priority]}`}>{issue.priority}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${statusColors[issue.status]}`}>{issue.status}</span></td>
                    <td className="px-4 py-3 text-gray-400">{new Date(issue.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No issues found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
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
      </div>
    </div>
  );
};

export default AdminDashboard;
