import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  FiClipboard,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiPlusCircle,
} from 'react-icons/fi';

import api from '../services/api';
import StatCard from '../components/StatCard';
import IssueCard from '../components/IssueCard';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

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
        backgroundColor: [
          '#9ca3af',
          '#3b82f6',
          '#f97316',
          '#16a34a',
          '#dc2626',
        ],
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
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Here's what's happening with your reported facility issues today.
          </p>
        </div>

        <Link
          to="/report-issue"
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3 shadow-md hover:shadow-lg transition"
        >
          <FiPlusCircle />
          Report Issue
        </Link>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard
          icon={<FiClipboard />}
          label="Total Issues"
          value={summary?.total ?? 0}
          color="blue"
          loading={loading}
        />

        <StatCard
          icon={<FiClock />}
          label="Pending"
          value={summary?.pending ?? 0}
          color="orange"
          loading={loading}
        />

        <StatCard
          icon={<FiCheckCircle />}
          label="Resolved"
          value={summary?.resolved ?? 0}
          color="green"
          loading={loading}
        />

        <StatCard
          icon={<FiAlertTriangle />}
          label="Critical"
          value={summary?.critical ?? 0}
          color="red"
          loading={loading}
        />

      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-2 gap-8">

        <div className="card p-6 shadow-lg">
          <h2 className="text-lg font-bold mb-6">
            Issues by Status
          </h2>

          {charts?.byStatus.length ? (
            <Pie data={pieData} />
          ) : (
            <p className="text-gray-400 text-sm">
              No data available.
            </p>
          )}
        </div>

        <div className="card p-6 shadow-lg">
          <h2 className="text-lg font-bold mb-6">
            Issues by Category
          </h2>

          {charts?.byCategory.length ? (
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
            <p className="text-gray-400 text-sm">
              No data available.
            </p>
          )}
        </div>

      </div>

      {/* Recent Issues */}
      <div>

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-xl font-bold">
            Recent Issues
          </h2>

          <Link
            to="/track-issues"
            className="font-medium text-primary-600 hover:underline"
          >
            View All
          </Link>

        </div>

        {loading ? (

          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-56 rounded-xl" />
            ))}
          </div>

        ) : recentIssues.length ? (

          <div className="grid md:grid-cols-2 gap-6">
            {recentIssues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
              />
            ))}
          </div>

        ) : (

          <div className="card p-12 text-center shadow-lg">

            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
              You haven't reported any issues yet.
            </p>

            <Link
              to="/report-issue"
              className="inline-block mt-5 btn-primary"
            >
              Report Your First Issue
            </Link>

          </div>

        )}

      </div>

    </div>
  );
};

export default Dashboard;