const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/public', feedbackController.getPublic);
router.get('/track/:code', feedbackController.getByCode);

// Protected routes
router.use(authMiddleware);

router.get('/', feedbackController.getAll);
router.get('/:id', feedbackController.getById);
router.post('/', feedbackController.create);
router.put('/:id/status', feedbackController.updateStatus);
router.put('/:id/assign', feedbackController.assign);

module.exports = router;
