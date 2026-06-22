const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get staff list (for assignment)
router.get('/staff', userController.getStaff);

// User management routes
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', roleMiddleware('admin'), userController.create);
router.put('/:id', userController.update);
router.delete('/:id', roleMiddleware('admin'), userController.delete);

module.exports = router;
