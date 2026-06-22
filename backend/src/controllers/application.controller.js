const pool = require('../config/db');
const emailService = require('../services/email.service');

// Tạo hồ sơ mới
exports.create = async (req, res) => {
    try {
        console.log('📝 [APPLICATION] Nhận request tạo hồ sơ mới');
        const { service_id, service_name, form_data } = req.body;
        const user_id = req.user?.id || null;

        if (!service_id || !service_name || !form_data) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const application_code = 'HS' + Date.now();

        // Mapping service_id -> department_code để tự động phân loại
        const serviceDepartmentMapping = {
            // Nhóm Hộ tịch – Dân sự
            1: 'HO_TICH',   // Đăng ký khai sinh
            2: 'HO_TICH',   // Đăng ký kết hôn
            3: 'HO_TICH',   // Đăng ký khai tử

            // Nhóm Cư trú – Nhân khẩu
            4: 'CU_TRU',    // Đăng ký tạm trú
            5: 'CU_TRU',    // Đăng ký thường trú
            6: 'CU_TRU',    // Cấp CCCD/CMND

            // Nhóm Tư pháp
            7: 'TU_PHAP',   // Cấp phiếu lý lịch tư pháp
            8: 'TU_PHAP',   // Chứng thực bản sao
            9: 'TU_PHAP',   // Chứng thực chữ ký
            12: 'TU_PHAP',  // Xác nhận lý lịch

            // Nhóm Kinh doanh
            10: 'KINH_DOANH', // Đăng ký kinh doanh hộ cá thể

            // Nhóm Xây dựng – Đất đai
            11: 'XAY_DUNG'  // Cấp phép xây dựng
        };

        // Lấy department_id dựa trên service_id
        const departmentCode = serviceDepartmentMapping[service_id];
        let department_id = null;

        if (departmentCode) {
            const deptResult = await pool.query(
                'SELECT id FROM departments WHERE code = $1',
                [departmentCode]
            );
            if (deptResult.rows.length > 0) {
                department_id = deptResult.rows[0].id;
            }
        }

        // Lấy thông tin tên từ tài khoản
        let accountName = null;
        const userType = req.user?.userType || req.user?.role || 'citizen';
        if (user_id) {
            if (userType === 'citizen') {
                const citRes = await pool.query('SELECT full_name FROM citizens WHERE id = $1', [user_id]);
                if (citRes.rows.length > 0) accountName = citRes.rows[0].full_name;
            } else {
                const userRes = await pool.query('SELECT full_name FROM users WHERE id = $1', [user_id]);
                if (userRes.rows.length > 0) accountName = userRes.rows[0].full_name;
            }
        }

        const citizen_name = accountName || form_data.fullName || form_data.hoTen || form_data.headOfHousehold || 'N/A';
        const citizen_phone = form_data.phone || form_data.soDienThoai || null;
        const citizen_email = form_data.email || form_data.soEmail || null;
        const citizen_id_number = form_data.idNumber || form_data.soCMND || form_data.soCCCD || null;
        const citizen_address = form_data.address || form_data.diaChi || form_data.currentAddress || null;

        const result = await pool.query(
            `INSERT INTO applications 
            (application_code, service_id, service_name, user_id, user_type, form_data, citizen_name, citizen_phone, citizen_email, citizen_id_number, citizen_address, department_id, status, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', CURRENT_TIMESTAMP) 
            RETURNING *`,
            [application_code, service_id, service_name, user_id, req.user?.userType || req.user?.role || 'citizen', JSON.stringify(form_data), citizen_name, citizen_phone, citizen_email, citizen_id_number, citizen_address, department_id]
        );

        const application = result.rows[0];

        // Ưu tiên gửi về mail đăng ký tài khoản trước
        let citizenEmail = null;
        if (user_id) {
            if (userType === 'citizen') {
                const citRes = await pool.query('SELECT email FROM citizens WHERE id = $1', [user_id]);
                if (citRes.rows.length > 0 && citRes.rows[0].email) {
                    citizenEmail = citRes.rows[0].email;
                }
            } else {
                const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [user_id]);
                if (userRes.rows.length > 0 && userRes.rows[0].email) {
                    citizenEmail = userRes.rows[0].email;
                }
            }
        }

        // Nếu tài khoản không có mail mới lấy mail trong đơn
        if (!citizenEmail) {
            citizenEmail = form_data.email || form_data.soEmail;
        }

        if (citizenEmail) {
            emailService.sendApplicationConfirmation(citizenEmail, {
                application_code,
                service_name,
                form_data
            }).catch(e => console.error('Email confirmation failed:', e.message));
        }



        res.status(201).json({ message: 'Nộp hồ sơ thành công', application });
    } catch (error) {
        console.error('❌ [APPLICATION] LỖI:', error.message);
        res.status(500).json({ error: 'Lỗi server khi nộp hồ sơ', detail: error.message });
    }
};

// Lấy danh sách hồ sơ của user
exports.getByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT a.*, 
                    COALESCE(c.full_name, u.full_name, a.citizen_name, a.form_data->>'fullName', a.form_data->>'hoTen', u.username, 'N/A') as citizen_name
            FROM applications a
            LEFT JOIN users u ON a.user_id = u.id AND a.user_type != 'citizen'
            LEFT JOIN citizens c ON a.user_id = c.id AND a.user_type = 'citizen'
            WHERE a.user_id = $1 AND a.user_type = $2
            ORDER BY a.created_at DESC`,
            [userId, req.user?.userType || req.user?.role || 'citizen']
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Tra cứu hồ sơ theo mã
exports.getByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query(
            `SELECT a.*, 
                    COALESCE(c.full_name, u.full_name, a.citizen_name, a.form_data->>'fullName', a.form_data->>'hoTen', u.username, 'N/A') as citizen_name
            FROM applications a
            LEFT JOIN users u ON a.user_id = u.id AND a.user_type != 'citizen'
            LEFT JOIN citizens c ON a.user_id = c.id AND a.user_type = 'citizen'
            WHERE a.application_code = $1`,
            [code]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy chi tiết hồ sơ
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT a.*, 
                    COALESCE(c.full_name, u.full_name, a.citizen_name, a.form_data->>'fullName', a.form_data->>'hoTen', u.username, 'N/A') as citizen_name
            FROM applications a
            LEFT JOIN users u ON a.user_id = u.id AND a.user_type != 'citizen'
            LEFT JOIN citizens c ON a.user_id = c.id AND a.user_type = 'citizen'
            WHERE a.id = $1`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
};

module.exports = exports;
