import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiBell, FiCheck, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
    } catch (err) {
      // handled globally
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={markAllAsRead} className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
          <FiCheckCircle /> Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16" />)}</div>
      ) : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className={`card p-4 flex items-start gap-3 ${!n.read ? 'border-l-4 border-l-primary-600' : ''}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                <FiBell size={16} />
              </div>
              <div className="flex-1">
                {n.issue ? (
                  <Link to={`/issues/${n.issue._id}`} className="text-sm hover:underline">{n.message}</Link>
                ) : (
                  <p className="text-sm">{n.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!n.read && (
                  <button onClick={() => markAsRead(n._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Mark as read">
                    <FiCheck size={16} />
                  </button>
                )}
                <button onClick={() => deleteNotification(n._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-danger" title="Delete">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-gray-400">You're all caught up! No notifications.</div>
      )}
    </div>
  );
};

export default Notifications;
