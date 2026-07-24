import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiUsers,
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', formData);

      login(data.user, data.token);

      toast.success('Account created successfully!');

      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-8 md:p-10 shadow-xl">

        <h1 className="text-3xl font-bold text-center mb-2">
          Create Your Account
        </h1>

        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Join as a Parent or Teacher
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Full Name
            </label>

            <div className="relative">
              <FiUser
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                className="input-field pl-12"
                placeholder="John Doe"
                autoComplete="name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name is too short',
                  },
                })}
              />
            </div>

            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

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
                className="input-field pl-12"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Enter a valid email',
                  },
                })}
              />
            </div>

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              I am a
            </label>

            <div className="relative">
              <FiUsers
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />

              <select
                className="input-field pl-12"
                {...register('role', { required: true })}
              >
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Phone
            </label>

            <div className="relative">
              <FiPhone
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                className="input-field pl-12"
                placeholder="9876543210"
                autoComplete="tel"
                {...register('phone')}
              />
            </div>
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
                className="input-field pl-12"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Minimum 6 characters',
                  },
                })}
              />
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <FiLock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="password"
                className="input-field pl-12"
                placeholder="Re-enter password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
              />
            </div>

            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        <p className="text-center text-gray-500 mt-8">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:underline"
          >
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;