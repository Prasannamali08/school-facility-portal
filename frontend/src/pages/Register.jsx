import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

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

  const background =
  "https://res.cloudinary.com/mg7foqao/image/upload/v1785076035/Login_page_ryfqa1.png";

return (
  <div
    className="relative min-h-screen bg-cover bg-center"
    style={{
      backgroundImage: `url(${background})`,
    }}
  >
    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-black/45 backdrop-blur-sm"></div>

    {/* Registration Card */}
  <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
            <div className="
            w-full
            max-w-sm
            sm:max-w-md
            lg:max-w-lg
            rounded-3xl
            bg-white/95
            backdrop-blur-xl
            shadow-2xl
            p-5
            sm:p-6
            lg:p-8
            ">

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-2">
          Create Your Account
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Join as a Parent or Teacher
        </p>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-5"
        >

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Full Name
            </label>

            <input
              type="text"
              className="input-field"
              placeholder="John Doe"
              autoComplete="name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name is too short",
                },
              })}
            />

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

            <input
              type="email"
              className="input-field"
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

            <select
              className="input-field"
              {...register('role', {
                required: true,
              })}
            >
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Phone
            </label>

            <input
              type="tel"
              className="input-field"
              placeholder="9876543210"
              autoComplete="tel"
              {...register('phone')}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Password
            </label>

            <input
              type="password"
              className="input-field"
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

            <input
              type="password"
              className="input-field"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
            />

            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

               </form>

        <p className="text-center text-gray-500 mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:underline"
          >
            Sign In
          </Link>
        </p>

      </div>

    </div>

  </div>
);};

export default Register;