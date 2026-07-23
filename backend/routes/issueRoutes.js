const express = require('express');
const router = express.Router();
const {
  createIssue,
  getAllIssues,
  getUserIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  assignIssue,
  updateStatus,
  addComment,
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('images', 5), createIssue);
router.get('/', protect, authorize('admin'), getAllIssues);
router.get('/my', protect, getUserIssues);
router.get('/:id', protect, getIssue);
router.put('/:id', protect, upload.array('images', 5), updateIssue);
router.delete('/:id', protect, deleteIssue);

router.put('/:id/assign', protect, authorize('admin'), assignIssue);
router.put('/:id/status', protect, authorize('admin'), upload.single('photo'), updateStatus);
router.post('/:id/comments', protect, addComment);

module.exports = router;
