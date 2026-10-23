const express = require('express');
const { getDashboardStats, getRecentTransactions } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/recent-transactions', protect, getRecentTransactions);

module.exports = router;
