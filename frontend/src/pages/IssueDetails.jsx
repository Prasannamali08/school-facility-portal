import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMapPin, FiUser, FiClock, FiSend, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { statusColors, priorityColors } from '../components/IssueCard';

const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

const IssueDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [staff, setStaff] = useState([]);
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigningTo, setAssigningTo] = useState('');

  const fetchIssue = useCallback(async () => {
    try {
      const { data } = await api.get(`/issues/${id}`);
      setIssue(data.issue);
      setStatusForm({ status: data.issue.status, note: '' });
    } catch (err) {
      toast.error('Issue not found');
      navigate('/track-issues');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchIssue();
    if (user?.role === 'admin') {
      api.get('/users/staff').then(({ data }) => setStaff(data.staff)).catch(() => {});
    }
  }, [fetchIssue, user]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/issues/${id}/comments`, { text: commentText });
      setCommentText('');
      fetchIssue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssign = async () => {
    if (!assigningTo) return toast.error('Select a staff member first');
    try {
      await api.put(`/issues/${id}/assign`, { assignedTo: assigningTo });
      toast.success('Issue assigned');
      fetchIssue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign issue');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await api.put(`/issues/${id}/status`, { status: statusForm.status, note: statusForm.note });
      toast.success('Status updated');
      setStatusForm((prev) => ({ ...prev, note: '' }));
      fetchIssue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This cannot be undone.')) return;
    try {
      await api.delete(`/issues/${id}`);
      toast.success('Issue deleted');
      navigate('/track-issues');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete issue');
    }
  };

  if (loading) return <div className="skeleton h-64 max-w-4xl mx-auto" />;
  if (!issue) return null;

  const canDelete = user.role === 'admin' || (issue.reportedBy._id === user.id && issue.status === 'Pending');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{issue.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-2 flex-wrap">
              <span className="flex items-center gap-1"><FiMapPin size={14} /> {issue.location}</span>
              <span className="flex items-center gap-1"><FiUser size={14} /> {issue.reportedBy.name}</span>
              <span className="flex items-center gap-1"><FiClock size={14} /> {new Date(issue.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`badge ${statusColors[issue.status]}`}>{issue.status}</span>
            <span className={`badge ${priorityColors[issue.priority]}`}>{issue.priority}</span>
          </div>
        </div>

        <p className="mt-4 text-gray-700 dark:text-gray-300">{issue.description}</p>
        <p className="mt-2 text-sm text-gray-400">Category: {issue.category}</p>

        {issue.images?.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
            {issue.images.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noreferrer">
                <img src={img.url} alt={`issue-${i}`} className="w-full h-24 object-cover rounded-lg" />
              </a>
            ))}
          </div>
        )}

        {issue.assignedTo && (
          <p className="mt-4 text-sm text-gray-500">
            Assigned to: <span className="font-medium text-gray-700 dark:text-gray-200">{issue.assignedTo.name}</span>
          </p>
        )}

        {canDelete && (
          <button onClick={handleDelete} className="mt-4 text-sm text-danger flex items-center gap-1 hover:underline">
            <FiTrash2 size={14} /> Delete Issue
          </button>
        )}
      </div>

      {/* Admin controls */}
      {user.role === 'admin' && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold">Admin Actions</h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex gap-2">
              <select className="input-field" value={assigningTo} onChange={(e) => setAssigningTo(e.target.value)}>
                <option value="">Select staff to assign...</option>
                {staff.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
              </select>
              <button onClick={handleAssign} className="btn-secondary whitespace-nowrap">Assign</button>
            </div>
          </div>

          <form onSubmit={handleStatusUpdate} className="grid sm:grid-cols-3 gap-3 items-start">
            <select
              className="input-field"
              value={statusForm.status}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              className="input-field sm:col-span-1"
              placeholder="Add a note (optional)"
              value={statusForm.note}
              onChange={(e) => setStatusForm((prev) => ({ ...prev, note: e.target.value }))}
            />
            <button type="submit" disabled={updatingStatus} className="btn-primary">
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </form>
        </div>
      )}

      {/* Timeline */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Repair History Timeline</h2>
        <div className="space-y-4">
          {issue.timeline.slice().reverse().map((event, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${statusColors[event.status]?.split(' ')[0] || 'bg-gray-300'}`} />
              <div>
                <p className="text-sm font-medium">
                  {event.status} {event.updatedBy?.name && <span className="text-gray-400 font-normal">by {event.updatedBy.name}</span>}
                </p>
                {event.note && <p className="text-sm text-gray-500">{event.note}</p>}
                <p className="text-xs text-gray-400">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Comments</h2>
        <div className="space-y-3 mb-4">
          {issue.comments.length ? (
            issue.comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {c.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 flex-1">
                  <p className="text-sm font-medium">{c.user?.name} <span className="text-xs text-gray-400 font-normal">{c.user?.role}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{c.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No comments yet.</p>
          )}
        </div>
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            className="input-field"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" disabled={submittingComment} className="btn-primary">
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueDetails;
