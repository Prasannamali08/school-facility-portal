import React from 'react';

const colorMap = {
  blue: 'bg-primary-50 text-primary-600',
  green: 'bg-green-50 text-secondary-600',
  orange: 'bg-orange-50 text-warning',
  red: 'bg-red-50 text-danger',
  gray: 'bg-gray-100 text-gray-600',
};

const StatCard = ({ icon, label, value, color = 'blue', loading }) => {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {loading ? (
          <div className="skeleton h-6 w-16 mt-1" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
