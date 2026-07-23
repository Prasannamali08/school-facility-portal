import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiCamera } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone, schoolId: user?.schoolId },
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
      Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
      if (avatarFile) fd.append('avatar', avatarFile);

      const { data } = await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
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
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Personal Information</h2>
        <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-semibold overflow-hidden">
                {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase()}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full p-1.5 cursor-pointer">
                <FiCamera size={12} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role} account</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Full Name</label>
            <input className="input-field" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Phone</label>
            <input className="input-field" {...register('phone')} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">School ID</label>
            <input className="input-field" {...register('schoolId')} />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePwdSubmit(onSubmitPassword)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Current Password</label>
            <input type="password" className="input-field" {...registerPwd('currentPassword', { required: 'Required' })} />
            {pwdErrors.currentPassword && <p className="text-danger text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">New Password</label>
            <input
              type="password"
              className="input-field"
              {...registerPwd('newPassword', { required: 'Required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
            />
            {pwdErrors.newPassword && <p className="text-danger text-xs mt-1">{pwdErrors.newPassword.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
            <input
              type="password"
              className="input-field"
              {...registerPwd('confirmPassword', { validate: (v) => v === newPassword || 'Passwords do not match' })}
            />
            {pwdErrors.confirmPassword && <p className="text-danger text-xs mt-1">{pwdErrors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={changingPwd} className="btn-secondary">
            {changingPwd ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
