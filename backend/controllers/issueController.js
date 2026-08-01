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
// @desc Get issues for logged-in user
// @route GET /api/issues/my
// @access Private

const getUserIssues = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      priority,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // Role-wise access
    if (req.user.role === "admin") {
      query = {};
    } else if (req.user.role === "teacher") {
      query = {
        $or: [
          { reportedBy: req.user._id },
          { assignedTo: req.user._id },
        ],
      };
    } else {
      query = {
        reportedBy: req.user._id,
      };
    }

    // Filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Search
    if (search) {
      const searchQuery = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
      };

      if (req.user.role === "teacher") {
        query = {
          $and: [
            {
              $or: [
                { reportedBy: req.user._id },
                { assignedTo: req.user._id },
              ],
            },
            searchQuery,
          ],
        };
      } else if (req.user.role === "parent") {
        query = {
          $and: [
            { reportedBy: req.user._id },
            searchQuery,
          ],
        };
      } else {
        query = searchQuery;
      }

      if (category) query.category = category;
      if (status) query.status = status;
      if (priority) query.priority = priority;
    }

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate("reportedBy", "name email")
        .populate("assignedTo", "name email")
        .sort("-createdAt")
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
// @desc Get single issue
// @route GET /api/issues/:id
// @access Private

const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "name email role phone")
      .populate("assignedTo", "name email role")
      .populate("comments.user", "name role avatar")
      .populate("timeline.updatedBy", "name role");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Admin can view all
    if (req.user.role === "admin") {
      return res.status(200).json({
        success: true,
        issue,
      });
    }

    // Parent can view only their own issues
    const isOwner =
      issue.reportedBy._id.toString() === req.user._id.toString();

    // Assigned teacher can view assigned issue
    const isAssignedTeacher =
      issue.assignedTo &&
      issue.assignedTo._id.toString() === req.user._id.toString();

    if (!isOwner && !isAssignedTeacher) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this issue",
      });
    }

    res.status(200).json({
      success: true,
      issue,
    });

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


// @desc Assign an issue to a teacher
// @route PUT /api/issues/:id/assign
// @access Private (admin)
const assignIssue = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assigned user ID is required",
      });
    }

    // Find the issue
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    

    // Find the assigned user
    const staff = await User.findById(assignedTo);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      });
    }

    // Allow only teachers
    if (staff.role !== "teacher") {
      return res.status(400).json({
        success: false,
        message: "Only teachers can be assigned to issues",
      });
    }

    // Update issue
    issue.assignedTo = assignedTo;
    issue.status = "Assigned";

    issue.timeline.push({
      status: "Assigned",
      note: `Assigned to ${staff.name}`,
      updatedBy: req.user._id,
    });

    await issue.save();

    // Create repair history
    await RepairHistory.create({
      issue: issue._id,
      updatedBy: req.user._id,
      status: "Assigned",
      note: `Assigned to ${staff.name}`,
    });

    // Notify the reporter
    await createNotification({
      user: issue.reportedBy,
      message: `Your issue "${issue.title}" has been assigned to ${staff.name}.`,
      type: "issue_assigned",
      issue: issue._id,
    });

    // Notify the assigned teacher
    await createNotification({
      user: assignedTo,
      message: `A new issue "${issue.title}" has been assigned to you by the administrator.`,
      type: "issue_assigned",
      issue: issue._id,
    });

    res.status(200).json({
      success: true,
      message: "Issue assigned successfully",
      issue,
    });

  } catch (error) {
    next(error);
  }
};
// @desc Teacher submits repair for verification
// @route PUT /api/issues/:id/repair
// @access Private (Teacher)

const submitRepair = async (req, res, next) => {
  try {
    const { repairNote } = req.body;

    const issue = await Issue.findById(req.params.id);

if (!issue) {
  return res.status(404).json({
    success: false,
    message: "Issue not found",
  });
}

// Prevent submitting repair after resolution
if (issue.status === "Resolved") {
  return res.status(400).json({
    success: false,
    message: "This issue has already been resolved.",
  });
}

    // Only assigned teacher can submit repair
    if (
      !issue.assignedTo ||
      issue.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this issue",
      });
    }

    // Upload repair image
    if (req.file) {
      issue.teacherRepairImage = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    // Save repair note
    issue.teacherRepairNote = repairNote || "";

    // Save completion time
    issue.teacherCompletedAt = new Date();

    // Change status
    issue.status = "In Progress";

    // Timeline
    issue.timeline.push({
      status: "In Progress",
      note: repairNote || "Repair completed by teacher",
      updatedBy: req.user._id,
    });

    await issue.save();

    // Repair History
    await RepairHistory.create({
      issue: issue._id,
      updatedBy: req.user._id,
      status: "In Progress",
      note: repairNote || "Repair completed by teacher",
      photo: req.file
        ? {
            url: req.file.path,
            publicId: req.file.filename,
          }
        : undefined,
    });

    // Notify all admins
    const admins = await User.find({ role: "admin" }).select("_id");

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          user: admin._id,
          message: `Teacher has completed the repair for "${issue.title}". Please verify.`,
          type: "repair_completed",
          issue: issue._id,
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "Repair submitted successfully. Waiting for admin verification.",
      issue,
    });
  } catch (error) {
    next(error);
  }
};
// @desc Update issue status (with optional repair note/photo) - drives repair history + notifications
// @route PUT /api/issues/:id/status
// @access Private (admin)
// @desc Update issue status (Admin)
// @route PUT /api/issues/:id/status
// @access Private (Admin)

const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validStatuses = [
      "Pending",
      "Assigned",
      "In Progress",
      "Resolved",
      "Rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Update status
    // Teacher must submit repair before admin resolves
if (
  status === "Resolved" &&
  !issue.teacherRepairImage?.url
) {
  return res.status(400).json({
    success: false,
    message:
      "Teacher must submit a repair image before resolving the issue.",
  });
}

// Update status
issue.status = status;

    // If admin resolves the issue
    if (status === "Resolved") {

  issue.resolvedAt = new Date();

  issue.verifiedAt = new Date();

  issue.adminVerificationNote = note || "";

  if (req.file) {
    issue.adminResolvedImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

} else {

  issue.adminVerificationNote = "";

}

    // Timeline
    issue.timeline.push({
      status,
      note: note || "",
      updatedBy: req.user._id,
    });

    await issue.save();

    // Repair History
    await RepairHistory.create({
      issue: issue._id,
      updatedBy: req.user._id,
      status,
      note: note || "",
      photo: req.file
        ? {
            url: req.file.path,
            publicId: req.file.filename,
          }
        : undefined,
    });

    // Notify Reporter
    await createNotification({
      user: issue.reportedBy,
      message:
        status === "Resolved"
          ? `Your issue "${issue.title}" has been resolved successfully.`
          : `Your issue "${issue.title}" status changed to "${status}".`,
      type: status === "Resolved" ? "issue_resolved" : "issue_status",
      issue: issue._id,
    });

    res.status(200).json({
      success: true,
      message: `Issue status updated to ${status}`,
      issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add a comment to an issue
// @route POST /api/issues/:id/comments
// @access Private
// @desc Add comment
// @route POST /api/issues/:id/comments
// @access Private

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const isOwner =
      issue.reportedBy.toString() === req.user._id.toString();

    const isAssignedTeacher =
      issue.assignedTo &&
      issue.assignedTo.toString() === req.user._id.toString();

    if (
      req.user.role !== "admin" &&
      !isOwner &&
      !isAssignedTeacher
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to comment on this issue",
      });
    }

    issue.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await issue.save();

    // Notify reporter
   // Teacher commented
if (req.user.role === "teacher") {

  // Notify parent
  if (issue.reportedBy.toString() !== req.user._id.toString()) {
    await createNotification({
      user: issue.reportedBy,
      message: `Teacher commented on your issue "${issue.title}".`,
      type: "comment_added",
      issue: issue._id,
    });
  }

  // Notify all admins
  const admins = await User.find({ role: "admin" }).select("_id");

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        user: admin._id,
        message: `Teacher commented on issue "${issue.title}".`,
        type: "comment_added",
        issue: issue._id,
      })
    )
  );
}

    // Notify assigned teacher
    if (
      req.user.role === "admin" &&
      issue.assignedTo
    ) {
      await createNotification({
        user: issue.assignedTo,
        message: `Administrator commented on issue "${issue.title}".`,
        type: "comment_added",
        issue: issue._id,
      });
    }

    const updatedIssue = await Issue.findById(issue._id)
      .populate("comments.user", "name role avatar");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comments: updatedIssue.comments,
    });

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
  submitRepair,
  updateStatus,
  addComment,
};