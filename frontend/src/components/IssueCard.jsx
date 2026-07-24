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
    <Link
      to={`/issues/${issue._id}`}
      className="card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >

      {/* Issue Image */}
      <div className="h-48 bg-gray-100 dark:bg-gray-700">
        {issue.images?.length > 0 ? (
          <img
            src={issue.images[0].url}
            alt={issue.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x400?text=No+Image";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image Available
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">

        {/* Title + Status */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-2">
            {issue.title}
          </h3>

          <span
            className={`badge whitespace-nowrap ${statusColors[issue.status]}`}
          >
            {issue.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
          {issue.description}
        </p>

        {/* Bottom Info */}
        <div className="space-y-3">

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiMapPin className="text-primary-500" />
            <span>{issue.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiClock className="text-primary-500" />
            <span>
              {new Date(issue.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">

            <span
              className={`badge ${priorityColors[issue.priority]}`}
            >
              {issue.priority}
            </span>

            <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {issue.category}
            </span>

          </div>

        </div>

      </div>

    </Link>
  );
};

export default IssueCard;