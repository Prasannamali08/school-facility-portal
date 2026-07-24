import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiMail, FiLock } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', formData);

      login(data.user, data.token);

      toast.success('Welcome back!');

      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md p-8 md:p-10 shadow-xl">

        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Email
            </label>

            <div className="relative">

              <FiMail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="input-field pl-12"
                {...register('email', {
                  required: 'Email is required',
                })}
              />

            </div>

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Password
            </label>

            <div className="relative">

              <FiLock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-field pl-12"
                {...register('password', {
                  required: 'Password is required',
                })}
              />

            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}

            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Button */}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:underline"
          >
            Register
          </Link>
        </p>

        {/* Demo Accounts */}

        <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-4 shadow-sm">

          <h3 className="font-semibold mb-3">
            Demo Accounts
          </h3>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">

            <p>
              <strong>Admin:</strong> admin@school.edu / Admin@123
            </p>

            <p>
              <strong>Teacher:</strong> teacher@school.edu / Teacher@123
            </p>

            <p>
              <strong>Parent:</strong> parent@school.edu / Parent@123
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;