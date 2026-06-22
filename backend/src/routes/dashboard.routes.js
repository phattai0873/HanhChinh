const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/stats', dashboardController.getStats);
router.get('/stats-by-time', dashboardController.getStatsByTime);
router.get('/recent-activities', dashboardController.getRecentActivities);
router.get('/pending-tasks', dashboardController.getPendingTasks);

module.exports = router;
