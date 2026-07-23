const Issue = require('../models/Issue');
const User = require('../models/User');

// @desc Get dashboard summary stats (scoped: admin sees all, others see own issues)
// @route GET /api/analytics/summary
// @access Private
const getSummary = async (req, res, next) => {
  try {
    const baseQuery = req.user.role === 'admin' ? {} : { reportedBy: req.user._id };

    const [total, pending, assigned, inProgress, resolved, rejected, critical] = await Promise.all([
      Issue.countDocuments(baseQuery),
      Issue.countDocuments({ ...baseQuery, status: 'Pending' }),
      Issue.countDocuments({ ...baseQuery, status: 'Assigned' }),
      Issue.countDocuments({ ...baseQuery, status: 'In Progress' }),
      Issue.countDocuments({ ...baseQuery, status: 'Resolved' }),
      Issue.countDocuments({ ...baseQuery, status: 'Rejected' }),
      Issue.countDocuments({ ...baseQuery, priority: 'Critical' }),
    ]);

    // Average resolution time (in hours) for resolved issues
    const resolvedIssues = await Issue.find({ ...baseQuery, status: 'Resolved', resolvedAt: { $ne: null } }).select('createdAt resolvedAt');
    let avgResolutionHours = 0;
    if (resolvedIssues.length > 0) {
      const totalHours = resolvedIssues.reduce((sum, issue) => {
        const diffMs = new Date(issue.resolvedAt) - new Date(issue.createdAt);
        return sum + diffMs / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedIssues.length) * 10) / 10;
    }

    let totalUsers;
    if (req.user.role === 'admin') {
      totalUsers = await User.countDocuments();
    }

    res.status(200).json({
      success: true,
      summary: {
        total,
        pending,
        assigned,
        inProgress,
        resolved,
        rejected,
        critical,
        avgResolutionHours,
        ...(totalUsers !== undefined ? { totalUsers } : {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get chart data: issues by category, by priority, monthly trend
// @route GET /api/analytics/charts
// @access Private
const getCharts = async (req, res, next) => {
  try {
    const baseQuery = req.user.role === 'admin' ? {} : { reportedBy: req.user._id };

    const [byCategory, byPriority, byStatus, monthly] = await Promise.all([
      Issue.aggregate([{ $match: baseQuery }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Issue.aggregate([{ $match: baseQuery }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Issue.aggregate([{ $match: baseQuery }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Issue.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      charts: {
        byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
        byPriority: byPriority.map((p) => ({ priority: p._id, count: p.count })),
        byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
        monthly: monthly.map((m) => ({ label: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`, count: m.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get recent activity feed (latest timeline events across issues)
// @route GET /api/analytics/recent-activity
// @access Private
const getRecentActivity = async (req, res, next) => {
  try {
    const baseQuery = req.user.role === 'admin' ? {} : { reportedBy: req.user._id };
    const issues = await Issue.find(baseQuery)
      .populate('reportedBy', 'name')
      .sort('-updatedAt')
      .limit(10)
      .select('title status priority updatedAt reportedBy');

    res.status(200).json({ success: true, activity: issues });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCharts, getRecentActivity };
