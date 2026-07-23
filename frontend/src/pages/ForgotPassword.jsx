import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../services/api';

const ForgotPassword = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', formData);
      setSent(true);
      toast.success('If that email exists, a reset link has been generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-1">Forgot Password</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Enter your email and we'll send you a reset link
        </p>

        {sent ? (
          <p className="text-center text-secondary-600 text-sm">
            Check your email for a password reset link. You can now return to{' '}
            <Link to="/login" className="text-primary-600 underline">login</Link>.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="email" className="input-field" placeholder="you@example.com" {...register('email', { required: true })} />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
