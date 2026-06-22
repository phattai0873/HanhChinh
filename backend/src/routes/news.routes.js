const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Public routes
router.get('/public', newsController.getPublic);
router.get('/:id', newsController.getById);

// Protected routes (Admin/Staff only)
router.use(authMiddleware);

router.get('/', newsController.getAll);
router.post('/', roleMiddleware('admin', 'staff'), newsController.create);
router.put('/:id', roleMiddleware('admin', 'staff'), newsController.update);
router.delete('/:id', roleMiddleware('admin'), newsController.delete);

module.exports = router;
