import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-bold text-primary-600">404</p>
      <h1 className="text-2xl font-bold mt-4">Page Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary mt-6 flex items-center gap-2">
        <FiHome /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
