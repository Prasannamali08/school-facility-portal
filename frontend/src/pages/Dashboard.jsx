import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { FiClipboard, FiClock, FiCheckCircle, FiAlertTriangle, FiPlusCircle } from 'react-icons/fi';
import api from '../services/api';
import StatCard from '../components/StatCard';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, chartsRes, issuesRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/charts'),
          api.get('/issues/my?limit=4'),
        ]);
        setSummary(summaryRes.data.summary);
        setCharts(chartsRes.data.charts);
        setRecentIssues(issuesRes.data.issues);
      } catch (err) {
        // handled globally
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = {
    labels: charts?.byStatus.map((s) => s.status) || [],
    datasets: [
      {
        data: charts?.byStatus.map((s) => s.count) || [],
        backgroundColor: ['#9ca3af', '#3b82f6', '#f97316', '#16a34a', '#dc2626'],
      },
    ],
  };

  const barData = {
    labels: charts?.byCategory.map((c) => c.category) || [],
    datasets: [
      {
        label: 'Issues',
        data: charts?.byCategory.map((c) => c.count) || [],
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Here's what's happening with your reported issues.</p>
        </div>
        <Link to="/report-issue" className="btn-primary flex items-center gap-2">
          <FiPlusCircle /> Report Issue
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FiClipboard />} label="Total Issues" value={summary?.total ?? 0} color="blue" loading={loading} />
        <StatCard icon={<FiClock />} label="Pending" value={summary?.pending ?? 0} color="orange" loading={loading} />
        <StatCard icon={<FiCheckCircle />} label="Resolved" value={summary?.resolved ?? 0} color="green" loading={loading} />
        <StatCard icon={<FiAlertTriangle />} label="Critical" value={summary?.critical ?? 0} color="red" loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Issues by Status</h2>
          {charts?.byStatus.length ? <Pie data={pieData} /> : <p className="text-sm text-gray-400">No data yet</p>}
        </div>
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Issues by Category</h2>
          {charts?.byCategory.length ? (
            <Bar data={barData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
          ) : (
            <p className="text-sm text-gray-400">No data yet</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Issues</h2>
          <Link to="/track-issues" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="skeleton h-28" />)}
          </div>
        ) : recentIssues.length ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {recentIssues.map((issue) => <IssueCard key={issue._id} issue={issue} />)}
          </div>
        ) : (
          <div className="card p-8 text-center text-gray-400">
            <p>You haven't reported any issues yet.</p>
            <Link to="/report-issue" className="text-primary-600 hover:underline text-sm">Report your first issue</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
