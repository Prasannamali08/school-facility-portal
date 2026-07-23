const User = require('../models/User');
const Issue = require('../models/Issue');

// @desc Get all users (admin)
// @route GET /api/users
// @access Private (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      users: users.map((u) => u.toSafeObject()),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get maintenance-assignable staff (teachers + admins), used for issue assignment dropdown
// @route GET /api/users/staff
// @access Private (admin)
const getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['teacher', 'admin'] }, isActive: true }).select('name email role');
    res.status(200).json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

// @desc Update a user's role or active status (admin)
// @route PUT /api/users/:id
// @access Private (admin)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();
    res.status(200).json({ success: true, message: 'User updated', user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a user (admin)
// @route DELETE /api/users/:id
// @access Private (admin)
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getStaff, updateUser, deleteUser };
