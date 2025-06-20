// server/routes/dashboard.js
const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const router = express.Router();

// All dashboard routes require authentication
router.use(auth);

// Main dashboard stats - available to all authenticated users
router.get('/stats', dashboardController.getDashboardStats);

// Recent activity - available to all authenticated users
router.get('/recent-activity', dashboardController.getRecentActivity);

// Analytics - requires admin or superadmin role
router.get('/analytics', authorize('admin', 'superadmin'), dashboardController.getAnalytics);

// Notifications - available to all authenticated users
router.get('/notifications', dashboardController.getNotifications);

module.exports = router;