const pool = require('../config/db');
const emailService = require('../services/email.service');

// Lấy danh sách hồ sơ
exports.getAll = async (req, res) => {
    try {
        console.log('=== FILE CONTROLLER getAll ===');
        console.log('User:', req.user);
        console.log('Query params:', req.query);

        const { status, file_type_id, department_id, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT a.*, 
                   COALESCE(c.full_name, u.full_name, a.citizen_name, a.form_data->>'fullName', a.form_data->>'hoTen', u.username, 'N/A') as citizen_name,
                   COALESCE(c.phone, u.phone, a.form_data->>'phone', a.form_data->>'soDienThoai') as citizen_phone,
                   COALESCE(c.email, u.email, a.form_data->>'email') as citizen_email,
                   COALESCE(c.id_number, a.form_data->>'idNumber', a.form_data->>'soCMND') as citizen_id_number,
                   COALESCE(c.address, a.form_data->>'address', a.form_data->>'diaChi') as citizen_address,
                   d.name as department_name,
                   d.code as department_code,
                   d.icon as department_icon
            FROM applications a
            LEFT JOIN users u ON a.user_id = u.id AND a.user_type != 'citizen'
            LEFT JOIN citizens c ON a.user_id = c.id AND a.user_type = 'citizen'
            LEFT JOIN departments d ON a.department_id = d.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Filter by role
        if (req.user.role === 'citizen') {
            query += ` AND a.user_id = $${paramIndex} AND a.user_type = 'citizen'`;
            params.push(req.user.id);
            paramIndex++;
        }

        if (status) {
            query += ` AND a.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (file_type_id) {
            query += ` AND a.service_id = $${paramIndex}`;
            params.push(file_type_id);
            paramIndex++;
        }

        if (department_id) {
            query += ` AND a.department_id = $${paramIndex}`;
            params.push(department_id);
            paramIndex++;
        }

        query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM applications a WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;

        if (req.user.role === 'citizen') {
            countQuery += ` AND a.user_id = $${countParamIndex} AND a.user_type = 'citizen'`;
            countParams.push(req.user.id);
            countParamIndex++;
        }

        if (status) {
            countQuery += ` AND a.status = $${countParamIndex}`;
            countParams.push(status);
            countParamIndex++;
        }

        if (file_type_id) {
            countQuery += ` AND a.service_id = $${countParamIndex}`;
            countParams.push(file_type_id);
            countParamIndex++;
        }

        if (department_id) {
            countQuery += ` AND a.department_id = $${countParamIndex}`;
            countParams.push(department_id);
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('=== GET FILES ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Lỗi server khi lấy danh sách hồ sơ',
            details: error.message
        });
    }
};

// Lấy chi tiết hồ sơ
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT a.*, 
                    COALESCE(c.full_name, u.full_name, a.citizen_name, a.form_data->>'fullName', a.form_data->>'hoTen', u.username, 'N/A') as citizen_name,
                    COALESCE(c.phone, u.phone, a.form_data->>'phone', a.form_data->>'soDienThoai') as citizen_phone,
                    COALESCE(c.email, u.email, a.form_data->>'email') as citizen_email,
                    COALESCE(c.id_number, a.form_data->>'idNumber', a.form_data->>'soCMND') as citizen_id_number,
                    COALESCE(c.address, a.form_data->>'address', a.form_data->>'diaChi') as citizen_address
             FROM applications a
             LEFT JOIN users u ON a.user_id = u.id AND a.user_type != 'citizen'
             LEFT JOIN citizens c ON a.user_id = c.id AND a.user_type = 'citizen'
             WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
        }

        const file = result.rows[0];

        // Check permission
        if (req.user.role === 'citizen' && file.citizen_id !== req.user.id) {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        // Get attachments
        const attachments = await pool.query(
            'SELECT * FROM file_attachments WHERE file_id = $1',
            [id]
        );

        file.attachments = attachments.rows;

        res.json(file);
    } catch (error) {
        console.error('Get file by id error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Tạo hồ sơ mới
exports.create = async (req, res) => {
    try {
        const {
            file_type_id,
            citizen_name,
            citizen_phone,
            citizen_email,
            citizen_address,
            citizen_id_number,
            content,
            receive_method = 'online'
        } = req.body;

        // Validate
        if (!file_type_id || !citizen_name || !citizen_phone || !content) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Generate file number
        const year = new Date().getFullYear();
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM applications WHERE EXTRACT(YEAR FROM created_at) = $1',
            [year]
        );
        const count = parseInt(countResult.rows[0].count) + 1;
        const application_code = `HS${year}${String(count).padStart(5, '0')}`;

        // Mapping service_id -> department_code
        const serviceDepartmentMapping = {
            1: 'HO_TICH', 2: 'HO_TICH', 3: 'HO_TICH',
            4: 'CU_TRU', 5: 'CU_TRU', 6: 'CU_TRU',
            7: 'TU_PHAP', 8: 'TU_PHAP', 9: 'TU_PHAP',
            10: 'KINH_DOANH', 11: 'XAY_DUNG', 12: 'TU_PHAP'
        };

        const deptCode = serviceDepartmentMapping[file_type_id];
        let department_id = null;
        if (deptCode) {
            const deptRes = await pool.query('SELECT id FROM departments WHERE code = $1', [deptCode]);
            if (deptRes.rows.length > 0) department_id = deptRes.rows[0].id;
        }

        // Create application
        const result = await pool.query(
            `INSERT INTO applications(
                application_code, service_id, service_name, user_id, user_type,
                form_data, status, department_id, created_at
            ) VALUES($1, $2, $3, $4, $5, $6, 'pending', $7, CURRENT_TIMESTAMP)
        RETURNING * `,
            [
                application_code, file_type_id, 'Hồ sơ Một cửa', req.user.id, 
                req.user.userType || req.user.role || 'citizen',
                JSON.stringify(content), department_id
            ]
        );

        res.status(201).json({
            message: 'Nộp hồ sơ thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create file error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Cập nhật trạng thái hồ sơ
exports.updateStatus = async (req, res) => {
    try {
        console.log('=== UPDATE APPLICATION STATUS ===');
        const { id } = req.params;
        const { status, processing_note, admin_note, appointment_date } = req.body;

        // Note: accommodate both names if one exists
        const note = processing_note || admin_note;

        // Only staff can update status
        if (req.user.role === 'citizen') {
            return res.status(403).json({ error: 'Không có quyền thực hiện' });
        }

        // Get current application data with all possible email/name sources
        const currentApp = await pool.query(
            `SELECT a.*, 
                    COALESCE(u.email, c.email, a.form_data->>'email', a.form_data->>'soEmail') as citizen_email,
                    COALESCE(u.full_name, c.full_name, a.citizen_name, a.form_data->>'fullName', a.form_data->>'hoTen') as citizen_display_name
             FROM applications a
             LEFT JOIN users u ON a.user_id = u.id AND a.user_type != 'citizen'
             LEFT JOIN citizens c ON a.user_id = c.id AND a.user_type = 'citizen'
             WHERE a.id = $1`,
            [id]
        );

        if (currentApp.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
        }

        const application = currentApp.rows[0];
        console.log('Current application for email:', {
            id: application.id,
            email: application.citizen_email,
            name: application.citizen_display_name
        });


        const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
        const params = [status];
        let paramIndex = 2;

        if (note !== undefined) {
            updateFields.push(`admin_note = $${paramIndex}`);
            params.push(note);
            paramIndex++;
        }

        if (appointment_date !== undefined) {
            updateFields.push(`appointment_date = $${paramIndex}`);
            params.push(appointment_date);
            paramIndex++;
        }

        if (status === 'completed') {
            updateFields.push('processed_at = CURRENT_TIMESTAMP');
        }

        params.push(id);

        const result = await pool.query(
            `UPDATE applications SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            params
        );

        console.log('Application updated successfully');

        // Send email notification using email service
        if (application.citizen_email && (note || status || appointment_date)) {
            emailService.sendApplicationStatusEmail(application.citizen_email, {
                citizen_name: application.citizen_display_name,
                application_code: application.application_code,
                service_name: application.service_name,
                status: status,
                admin_note: note,
                appointment_date: appointment_date
            }).catch(e => console.error('⚠️  Email notification failed (non-critical):', e.message));
        }



        res.json({
            message: 'Cập nhật trạng thái thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('=== UPDATE APPLICATION STATUS ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Lỗi server khi cập nhật trạng thái',
            details: error.message
        });
    }
};

// Phân công xử lý hồ sơ
exports.assign = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigned_to } = req.body;

        // Only staff can assign
        if (!['admin', 'staff', 'leader'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Không có quyền thực hiện' });
        }

        const result = await pool.query(
            `UPDATE applications 
             SET assigned_to = $1, 
            status = 'processing', updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
        RETURNING * `,
            [assigned_to, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
        }

        // Add to history
        await pool.query(
            `INSERT INTO processing_history(record_type, record_id, action, new_status, created_by)
        VALUES('file', $1, 'assign', 'processing', $2)`,
            [id, req.user.id]
        );

        res.json({
            message: 'Phân công xử lý thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Assign file error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy danh sách loại hồ sơ
exports.getFileTypes = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM procedures WHERE is_active = true ORDER BY name'
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get file types error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy danh sách phòng ban chuyên môn
exports.getDepartments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, 
                   COUNT(a.id) as total_applications,
                   COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_count,
                   COUNT(CASE WHEN a.status = 'processing' THEN 1 END) as processing_count,
                   COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_count
            FROM departments d
            LEFT JOIN applications a ON d.id = a.department_id
            WHERE d.is_active = true
            GROUP BY d.id
            ORDER BY d.id
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
