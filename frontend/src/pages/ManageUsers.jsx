import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get('/users', { params });
      setUsers(data.users);
    } catch (err) {
      // handled globally
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.put(`/users/${id}`, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isActive: !isActive } : u)));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
  <div className="space-y-8">

    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Manage Users
      </h1>

      <p className="mt-2 text-gray-500 dark:text-gray-400">
        View, update roles, activate/deactivate, or remove user accounts.
      </p>
    </div>

    {/* Search & Filter */}
    <div className="card p-6 shadow-lg rounded-2xl flex flex-col lg:flex-row gap-4">

      <div className="relative flex-1">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />

        <input
          className="input-field pl-10"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select
        className="input-field lg:w-56"
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
      >
        <option value="">All Roles</option>
        <option value="parent">Parent</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>

    </div>

    {/* Users Table */}
    <div className="card shadow-lg rounded-2xl overflow-hidden overflow-x-auto">

      <table className="w-full text-sm">

        <thead className="bg-gray-100 dark:bg-gray-700 text-left uppercase text-xs tracking-wide text-gray-600 dark:text-gray-200">

          <tr>
            <th className="px-5 py-4">Name</th>
            <th className="px-5 py-4">Email</th>
            <th className="px-5 py-4">Role</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Joined</th>
            <th className="px-5 py-4 text-center">Actions</th>
          </tr>

        </thead>

        <tbody>

          {loading ? (

            <tr>
              <td
                colSpan={6}
                className="py-10 text-center text-gray-400"
              >
                Loading...
              </td>
            </tr>

          ) : users.length ? (

            users.map((u) => (

              <tr
                key={u._id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800 transition"
              >

                <td className="px-5 py-4 font-semibold">
                  {u.name}
                </td>

                <td className="px-5 py-4 text-gray-500">
                  {u.email}
                </td>

                <td className="px-5 py-4">

                  <select
                    className="input-field py-2 text-sm"
                    value={u.role}
                    disabled={u._id === currentUser.id}
                    onChange={(e) =>
                      handleRoleChange(u._id, e.target.value)
                    }
                  >
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>

                </td>

                <td className="px-5 py-4">

                  <button
                    onClick={() =>
                      handleToggleActive(
                        u._id,
                        u.isActive
                      )
                    }
                    disabled={u._id === currentUser.id}
                    className={`badge px-3 py-2 ${
                      u.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {u.isActive
                      ? "Active"
                      : "Inactive"}
                  </button>

                </td>

                <td className="px-5 py-4 text-gray-500">
                  {new Date(
                    u.createdAt
                  ).toLocaleDateString()}
                </td>

                <td className="px-5 py-4 text-center">

                  <button
                    onClick={() =>
                      handleDelete(u._id)
                    }
                    disabled={u._id === currentUser.id}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition disabled:opacity-40"
                  >
                    <FiTrash2 size={18} />
                  </button>

                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td
                colSpan={6}
                className="py-10 text-center text-gray-400"
              >
                No users found
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

  </div>
);
};

export default ManageUsers;
