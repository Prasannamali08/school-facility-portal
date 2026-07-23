const express = require('express');
const router = express.Router();
const { getSummary, getCharts, getRecentActivity } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getSummary);
router.get('/charts', protect, getCharts);
router.get('/recent-activity', protect, getRecentActivity);

module.exports = router;
