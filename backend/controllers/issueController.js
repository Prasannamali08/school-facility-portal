const Issue = require('../models/Issue');
const RepairHistory = require('../models/RepairHistory');
const User = require('../models/User');
const createNotification = require('../utils/notify');

// @desc Create a new issue
// @route POST /api/issues
// @access Private (parent, teacher)
const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, priority, location } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ success: false, message: 'Title, description, category and location are required' });
    }

    const images = (req.files || []).map((file) => ({ url: file.path, publicId: file.filename }));

    const issue = await Issue.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      location,
      images,
      reportedBy: req.user._id,
      timeline: [{ status: 'Pending', note: 'Issue reported', updatedBy: req.user._id }],
    });

    // Notify all admins of a new issue
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          user: admin._id,
          message: `New issue reported: "${issue.title}" (${issue.priority} priority)`,
          type: 'issue_created',
          issue: issue._id,
        })
      )
    );

    res.status(201).json({ success: true, message: 'Issue reported successfully', issue });
  } catch (error) {
    next(error);
  }
};

// @desc Get all issues with search/filter/pagination (admin sees all, users see own via getUserIssues)
// @route GET /api/issues
// @access Private (admin)
const getAllIssues = async (req, res, next) => {
  try {
    const { search, category, status, priority, location, reportedBy, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (reportedBy) query.reportedBy = reportedBy;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reportedBy', 'name email role')
        .populate('assignedTo', 'name email')
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Issue.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: issues.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get issues reported by the logged-in user
// @route GET /api/issues/my
// @access Private
const getUserIssues = async (req, res, next) => {
  try {
    const { search, category, status, priority, page = 1, limit = 10 } = req.query;

    const query = { reportedBy: req.user._id };
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('assignedTo', 'name email')
        .sort('-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Issue.countDocuments(query),
    ]);

    res.status(200).json({ success: true, count: issues.length, total, page: pageNum, pages: Math.ceil(total / limitNum), issues });
  } catch (error) {
    next(error);
  }
};

// @desc Get single issue by id
// @route GET /api/issues/:id
// @access Private
const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email role phone')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name role avatar')
      .populate('timeline.updatedBy', 'name role');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Non-admins may only view their own issues
    if (req.user.role !== 'admin' && issue.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this issue' });
    }

    res.status(200).json({ success: true, issue });
  } catch (error) {
    next(error);
  }
};

// @desc Update an issue (owner while pending, or admin anytime)
// @route PUT /api/issues/:id
// @access Private
const updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this issue' });
    }
    if (isOwner && req.user.role !== 'admin' && issue.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Issue can only be edited while still pending' });
    }

    const { title, description, category, priority, location } = req.body;
    if (title) issue.title = title;
    if (description) issue.description = description;
    if (category) issue.category = category;
    if (priority) issue.priority = priority;
    if (location) issue.location = location;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
      issue.images.push(...newImages);
    }

    await issue.save();
    res.status(200).json({ success: true, message: 'Issue updated', issue });
  } catch (error) {
    next(error);
  }
};

// @desc Delete an issue
// @route DELETE /api/issues/:id
// @access Private (admin, or owner while pending)
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !(isOwner && issue.status === 'Pending')) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this issue' });
    }

    await issue.deleteOne();
    await RepairHistory.deleteMany({ issue: issue._id });

    res.status(200).json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc Assign an issue to a maintenance staff / teacher
// @route PUT /api/issues/:id/assign
// @access Private (admin)
const assignIssue = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) return res.status(400).json({ success: false, message: 'assignedTo user id is required' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    const staff = await User.findById(assignedTo);
    if (!staff) return res.status(404).json({ success: false, message: 'Assigned user not found' });

    issue.assignedTo = assignedTo;
    issue.status = 'Assigned';
    issue.timeline.push({ status: 'Assigned', note: `Assigned to ${staff.name}`, updatedBy: req.user._id });
    await issue.save();

    await RepairHistory.create({ issue: issue._id, updatedBy: req.user._id, status: 'Assigned', note: `Assigned to ${staff.name}` });

    await createNotification({
      user: issue.reportedBy,
      message: `Your issue "${issue.title}" has been assigned and will be addressed soon`,
      type: 'issue_assigned',
      issue: issue._id,
    });

    res.status(200).json({ success: true, message: 'Issue assigned successfully', issue });
  } catch (error) {
    next(error);
  }
};

// @desc Update issue status (with optional repair note/photo) - drives repair history + notifications
// @route PUT /api/issues/:id/status
// @access Private (admin)
const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    issue.status = status;
    if (status === 'Resolved') issue.resolvedAt = new Date();

    const photo = req.file ? { url: req.file.path, publicId: req.file.filename } : undefined;

    issue.timeline.push({ status, note: note || '', updatedBy: req.user._id });
    await issue.save();

    await RepairHistory.create({
      issue: issue._id,
      updatedBy: req.user._id,
      status,
      note: note || '',
      photo,
    });

    await createNotification({
      user: issue.reportedBy,
      message: `Your issue "${issue.title}" status changed to "${status}"`,
      type: status === 'Resolved' ? 'issue_resolved' : 'issue_status',
      issue: issue._id,
    });

    res.status(200).json({ success: true, message: 'Status updated successfully', issue });
  } catch (error) {
    next(error);
  }
};

// @desc Add a comment to an issue
// @route POST /api/issues/:id/comments
// @access Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Comment text is required' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    const isOwner = issue.reportedBy.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to comment on this issue' });
    }

    issue.comments.push({ user: req.user._id, text: text.trim() });
    await issue.save();

    // Notify the other party
    const notifyUserId = req.user.role === 'admin' ? issue.reportedBy : null;
    if (notifyUserId) {
      await createNotification({
        user: notifyUserId,
        message: `New comment on your issue "${issue.title}"`,
        type: 'comment_added',
        issue: issue._id,
      });
    }

    const updated = await Issue.findById(issue._id).populate('comments.user', 'name role avatar');
    res.status(201).json({ success: true, message: 'Comment added', comments: updated.comments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getUserIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  assignIssue,
  updateStatus,
  addComment,
};
