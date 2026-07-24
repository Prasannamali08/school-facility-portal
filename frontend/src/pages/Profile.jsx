import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiCamera } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      schoolId: user?.schoolId,
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    watch,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm();

  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || '');

  const newPassword = watch('newPassword');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Unsupported image type');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmitProfile = async (formData) => {
    setSaving(true);

    try {
      const fd = new FormData();

      Object.entries(formData).forEach(([key, value]) =>
        fd.append(key, value)
      );

      if (avatarFile) {
        fd.append('avatar', avatarFile);
      }

      const { data } = await api.put('/auth/profile', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateUser(data.user);

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const onSubmitPassword = async (formData) => {
    setChangingPwd(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success('Password changed successfully');
      resetPwd();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal information and account security.
        </p>
      </div>

      {/* Personal Information */}

      <div className="card p-8 shadow-lg">

        <h2 className="text-xl font-semibold mb-6">
          Personal Information
        </h2>

        <form
          onSubmit={handleSubmit(onSubmitProfile)}
          className="space-y-5"
        >

          <div className="flex items-center gap-6 mb-6">

            <div className="relative">

              <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-white shadow-md">

                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}

              </div>

              <label className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-lg cursor-pointer transition">

                <FiCamera size={16} />

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />

              </label>

            </div>

            <div>
              <h3 className="text-xl font-semibold">
                {user?.name}
              </h3>

              <p className="text-gray-500">
                {user?.email}
              </p>

              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm capitalize">
                {user?.role}
              </span>
            </div>

          </div>

          <div>

            <label className="block text-sm font-semibold mb-2">
              Full Name
            </label>

            <input
              className="input-field"
              {...register('name', { required: true })}
            />

          </div>

          <div>

            <label className="block text-sm font-semibold mb-2">
              Phone Number
            </label>

            <input
              className="input-field"
              {...register('phone')}
            />

          </div>

          <div>

            <label className="block text-sm font-semibold mb-2">
              School ID
            </label>

            <input
              className="input-field"
              {...register('schoolId')}
            />

          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>

        </form>

      </div>

      {/* Change Password */}

      <div className="card p-8 shadow-lg">

        <h2 className="text-xl font-semibold mb-6">
          Change Password
        </h2>

        <form
          onSubmit={handlePwdSubmit(onSubmitPassword)}
          className="space-y-5"
        >

          <div>

            <label className="block text-sm font-semibold mb-2">
              Current Password
            </label>

            <input
              type="password"
              className="input-field"
              {...registerPwd('currentPassword', {
                required: 'Required',
              })}
            />

            {pwdErrors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">
                {pwdErrors.currentPassword.message}
              </p>
            )}

          </div>

          <div>

            <label className="block text-sm font-semibold mb-2">
              New Password
            </label>

            <input
              type="password"
              className="input-field"
              {...registerPwd('newPassword', {
                required: 'Required',
                minLength: {
                  value: 6,
                  message: 'Minimum 6 characters',
                },
              })}
            />

            {pwdErrors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {pwdErrors.newPassword.message}
              </p>
            )}

          </div>

          <div>

            <label className="block text-sm font-semibold mb-2">
              Confirm New Password
            </label>

            <input
              type="password"
              className="input-field"
              {...registerPwd('confirmPassword', {
                validate: (v) =>
                  v === newPassword || 'Passwords do not match',
              })}
            />

            {pwdErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {pwdErrors.confirmPassword.message}
              </p>
            )}

          </div>

          <button
            type="submit"
            disabled={changingPwd}
            className="btn-secondary w-full"
          >
            {changingPwd ? 'Updating Password...' : 'Change Password'}
          </button>

        </form>

      </div>

    </div>
  );
};

export default Profile;