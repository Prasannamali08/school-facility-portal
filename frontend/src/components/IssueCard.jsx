import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock } from 'react-icons/fi';

export const statusColors = {
  Pending: 'bg-gray-100 text-gray-700',
  Assigned: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Resolved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export const priorityColors = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-600',
  High: 'bg-orange-100 text-orange-600',
  Critical: 'bg-red-100 text-red-600',
};

const IssueCard = ({ issue }) => {
  return (
    <Link to={`/issues/${issue._id}`} className="card p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">{issue.title}</h3>
        <span className={`badge whitespace-nowrap ${statusColors[issue.status]}`}>{issue.status}</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{issue.description}</p>
      <div className="flex items-center flex-wrap gap-3 text-xs text-gray-400 mt-1">
        <span className="flex items-center gap-1">
          <FiMapPin size={12} /> {issue.location}
        </span>
        <span className="flex items-center gap-1">
          <FiClock size={12} /> {new Date(issue.createdAt).toLocaleDateString()}
        </span>
        <span className={`badge ${priorityColors[issue.priority]}`}>{issue.priority}</span>
        <span className="badge bg-gray-50 text-gray-500">{issue.category}</span>
      </div>
    </Link>
  );
};

export default IssueCard;
