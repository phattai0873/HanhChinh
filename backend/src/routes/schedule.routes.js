const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// All schedule routes require authentication
router.use(authMiddleware);

// Get schedules (all authenticated users can view, but maybe leaders see more)
router.get('/', scheduleController.getSchedules);

// Manage schedules (only admin and leaders can create/update/delete)
router.post('/', roleMiddleware('admin', 'leader'), scheduleController.createSchedule);
router.put('/:id', roleMiddleware('admin', 'leader'), scheduleController.updateSchedule);
router.delete('/:id', roleMiddleware('admin', 'leader'), scheduleController.deleteSchedule);

module.exports = router;
