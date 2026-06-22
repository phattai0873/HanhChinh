const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// File management routes
router.get('/', fileController.getAll);
router.get('/types', fileController.getFileTypes);
router.get('/departments', fileController.getDepartments);
router.get('/:id', fileController.getById);
router.post('/', fileController.create);
router.put('/:id/status', fileController.updateStatus);
router.put('/:id/assign', fileController.assign);

module.exports = router;
