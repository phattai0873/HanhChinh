const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tất cả routes đều cần authentication
router.post('/', authMiddleware, applicationController.create);
router.get('/user', authMiddleware, applicationController.getByUser);
router.get('/code/:code', applicationController.getByCode);
router.get('/:id', authMiddleware, applicationController.getById);

module.exports = router;
