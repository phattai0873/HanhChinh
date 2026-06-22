const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizen.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Tất cả routes yêu cầu đăng nhập
router.use(authMiddleware);

// GET /api/citizens - Lấy danh sách công dân
router.get('/', citizenController.getAll);

// GET /api/citizens/:id - Lấy thông tin công dân theo ID
router.get('/:id', citizenController.getById);

// GET /api/citizens/id-number/:id_number - Tìm công dân theo CMND/CCCD
router.get('/id-number/:id_number', citizenController.getByIdNumber);

// POST /api/citizens - Tạo công dân mới (chỉ admin và staff)
router.post('/', roleMiddleware('admin', 'staff'), citizenController.create);

// PUT /api/citizens/:id - Cập nhật thông tin công dân (chỉ admin và staff)
router.put('/:id', roleMiddleware('admin', 'staff'), citizenController.update);

// DELETE /api/citizens/:id - Xóa công dân (chỉ admin)
router.delete('/:id', roleMiddleware('admin'), citizenController.delete);

module.exports = router;
