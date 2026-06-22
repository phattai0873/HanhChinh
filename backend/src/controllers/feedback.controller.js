const pool = require('../config/db');
const emailService = require('../services/email.service');

// Lấy danh sách phản ánh/kiến nghị
exports.getAll = async (req, res) => {
    try {
        const { status, category, timeFilter, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT f.*, 
                   COALESCE(c.full_name, u.full_name) as citizen_name,
                   COALESCE(c.phone, u.phone) as citizen_phone,
                   COALESCE(c.email, u.email, f.citizen_email) as citizen_email,
                   c.address as citizen_address,
                   f.admin_note as response,
                   s.name as status_name,
                   a.full_name as assigned_to_name
            FROM feedbacks f
            LEFT JOIN users u ON f.citizen_id = u.id AND f.user_type != 'citizen'
            LEFT JOIN citizens c ON f.citizen_id = c.id AND f.user_type = 'citizen'
            LEFT JOIN status s ON f.status_id = s.id
            LEFT JOIN users a ON f.assigned_to = a.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Filter by role
        if (req.user.role === 'citizen') {
            query += ` AND f.citizen_id = $${paramIndex} AND f.user_type = 'citizen'`;
            params.push(req.user.id);
            paramIndex++;
        }

        if (status) {
            query += ` AND f.status_id = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (category) {
            query += ` AND f.category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (timeFilter === 'day') {
            query += ` AND f.created_at >= CURRENT_DATE AND f.created_at < CURRENT_DATE + INTERVAL '1 day'`;
        } else if (timeFilter === 'month') {
            query += ` AND f.created_at >= DATE_TRUNC('month', CURRENT_DATE) AND f.created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`;
        } else if (timeFilter === 'year') {
            query += ` AND f.created_at >= DATE_TRUNC('year', CURRENT_DATE) AND f.created_at < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'`;
        }

        query += ` ORDER BY f.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM feedbacks f WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;

        if (req.user.role === 'citizen') {
            countQuery += ` AND f.citizen_id = $${countParamIndex} AND f.user_type = 'citizen'`;
            countParams.push(req.user.id);
            countParamIndex++;
        }

        if (status) {
            countQuery += ` AND f.status_id = $${countParamIndex}`;
            countParams.push(status);
            countParamIndex++;
        }

        if (category) {
            countQuery += ` AND f.category = $${countParamIndex}`;
            countParams.push(category);
        }

        if (timeFilter === 'day') {
            countQuery += ` AND f.created_at >= CURRENT_DATE AND f.created_at < CURRENT_DATE + INTERVAL '1 day'`;
        } else if (timeFilter === 'month') {
            countQuery += ` AND f.created_at >= DATE_TRUNC('month', CURRENT_DATE) AND f.created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`;
        } else if (timeFilter === 'year') {
            countQuery += ` AND f.created_at >= DATE_TRUNC('year', CURRENT_DATE) AND f.created_at < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'`;
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        // Map the data to match frontend expectations
        const formattedData = result.rows.map(row => ({
            ...row,
            subject: row.title, // Map title to subject for frontend compatibility
            // Use status field directly (text), not status_name from JOIN
            // row.status is already the correct value from the feedbacks table
            citizen_full_name: row.citizen_name || (row.full_name) // Fallback to user full_name if no citizen name
        }));

        res.json({
            data: formattedData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get feedbacks error details:', error);
        res.status(500).json({
            error: 'Lỗi server khi lấy danh sách phản ánh',
            details: error.message
        });
    }
};

// Lấy chi tiết phản ánh
exports.getById = async (req, res) => {
    try {
        console.log('=== GET FEEDBACK BY ID ===');
        console.log('Request params:', req.params);
        console.log('Request user:', req.user);

        const { id } = req.params;

        console.log('Querying feedback with id:', id);
        const result = await pool.query(
            `SELECT f.*, 
                    COALESCE(c.full_name, u.full_name) as citizen_name,
                    COALESCE(c.phone, u.phone) as citizen_phone,
                    COALESCE(c.email, u.email, f.citizen_email) as citizen_email,
                    c.address as citizen_address,
                    f.admin_note as response,
                    s.name as status_name,
                    a.full_name as assigned_to_name
             FROM feedbacks f
             LEFT JOIN users u ON f.citizen_id = u.id AND f.user_type != 'citizen'
             LEFT JOIN citizens c ON f.citizen_id = c.id AND f.user_type = 'citizen'
             LEFT JOIN status s ON f.status_id = s.id
             LEFT JOIN users a ON f.assigned_to = a.id
             WHERE f.id = $1`,
            [id]
        );

        console.log('Query result rows:', result.rows.length);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy phản ánh' });
        }

        const feedback = result.rows[0];
        console.log('Feedback found:', feedback.id);

        // Check permission
        if (req.user.role === 'citizen' && feedback.citizen_id !== req.user.id) {
            console.log('Permission denied for user:', req.user.id);
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        console.log('Querying attachments...');
        // Get attachments
        const attachments = await pool.query(
            'SELECT * FROM feedback_attachments WHERE feedback_id = $1',
            [id]
        );

        console.log('Attachments found:', attachments.rows.length);
        feedback.attachments = attachments.rows;

        // Map data to match frontend expectations
        feedback.subject = feedback.title;
        // Use the status field directly (text), not status_name from JOIN
        // feedback.status is already the correct value from the feedbacks table
        feedback.citizen_full_name = feedback.citizen_name || feedback.full_name;

        console.log('Sending response');
        res.json(feedback);
    } catch (error) {
        console.error('=== GET FEEDBACK BY ID ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Lỗi server khi lấy chi tiết phản ánh',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Tạo phản ánh mới
exports.create = async (req, res) => {
    try {
        console.log('=== CREATE FEEDBACK ===');
        console.log('Request body:', req.body);
        console.log('User:', req.user);

        const {
            title,
            content,
            category,
            citizen_name,
            citizen_phone,
            citizen_email
        } = req.body;

        // Validate
        if (!title || !content) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tiêu đề và nội dung' });
        }

        // Check if user has email to receive replies - check both tables based on role
        const tableName = req.user.role === 'citizen' ? 'citizens' : 'users';
        const userCheck = await pool.query(
            `SELECT email FROM ${tableName} WHERE id = $1`,
            [req.user.id]
        );

        if (!userCheck.rows[0] || !userCheck.rows[0].email) {
            return res.status(400).json({
                error: 'Bạn cần có email để nhận phản hồi. Vui lòng cập nhật email trong tài khoản của bạn.'
            });
        }

        console.log('User email:', userCheck.rows[0].email);

        // Generate feedback code
        const codeResult = await pool.query(
            'SELECT COUNT(*) as count FROM feedbacks'
        );
        const count = parseInt(codeResult.rows[0].count) + 1;
        const feedbackCode = `PA${String(count).padStart(3, '0')}`;

        // Create feedback with only the columns that exist
        const result = await pool.query(
            `INSERT INTO feedbacks (
                feedback_code, citizen_id, title, content, category, 
                citizen_name, citizen_phone, citizen_email, status, user_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
            RETURNING *`,
            [
                feedbackCode, req.user.id, title, content, category,
                citizen_name, citizen_phone, citizen_email, req.user.userType || req.user.role || 'citizen'
            ]
        );

        const feedback = result.rows[0];

        // Gửi email xác nhận tiếp nhận phản ánh
        try {
            const userEmail = userCheck.rows[0].email;
            const userName = req.user.full_name || 'Quý khách';

            emailService.sendFeedbackConfirmation(userEmail, {
                feedback_code: feedback.feedback_code,
                title: feedback.title,
                citizen_name: userName
            }).catch(e => console.error('Feedback confirmation email failed:', e.message));
        } catch (emailError) {
            console.error('Failed to trigger feedback confirmation email:', emailError.message);
        }

        res.status(201).json({
            message: 'Gửi phản ánh thành công',
            data: feedback
        });

    } catch (error) {
        console.error('=== CREATE FEEDBACK ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error detail:', error.detail);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Lỗi server khi tạo phản ánh',
            details: error.message
        });
    }
};

// Cập nhật trạng thái phản ánh
exports.updateStatus = async (req, res) => {
    try {
        console.log('=== UPDATE FEEDBACK STATUS ===');
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        console.log('User:', req.user);

        const { id } = req.params;
        const { status, response } = req.body;

        // Only staff can update status
        if (req.user.role === 'citizen') {
            return res.status(403).json({ error: 'Không có quyền thực hiện' });
        }

        // Check if feedback exists first
        const checkResult = await pool.query('SELECT * FROM feedbacks WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy phản ánh' });
        }

        console.log('Current feedback:', checkResult.rows[0]);

        // Build update query (no updated_at column in feedbacks table)
        const updateFields = [];
        const params = [];
        let paramIndex = 1;

        // Update status field
        updateFields.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;

        // Update admin_note (not response)
        if (response) {
            updateFields.push(`admin_note = $${paramIndex}`);
            params.push(response);
            paramIndex++;
        }

        // Update status_id based on status mapping
        const statusMap = {
            'pending': 1,
            'new': 1,
            'processing': 3,
            'resolved': 5,
            'completed': 5,
            'rejected': 6
        };

        if (statusMap[status]) {
            updateFields.push(`status_id = $${paramIndex}`);
            params.push(statusMap[status]);
            paramIndex++;
        }

        // Update resolved_at if status is resolved
        if (status === 'resolved') {
            updateFields.push(`resolved_at = CURRENT_TIMESTAMP`);
        }

        params.push(id);

        const updateQuery = `UPDATE feedbacks SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        console.log('Update query:', updateQuery);
        console.log('Update params:', params);

        const result = await pool.query(updateQuery, params);
        console.log('Update successful:', result.rows[0]);

        // Add to history
        try {
            await pool.query(
                `INSERT INTO processing_history (record_type, record_id, action, new_status, note, created_by)
                 VALUES ('feedback', $1, 'update_status', $2, $3, $4)`,
                [id, status, response, req.user.id]
            );
        } catch (historyError) {
            console.error('Failed to add history (non-critical):', historyError.message);
        }

        // Send email notification to citizen if there's a response
        try {
            // Get current feedback with all possible email/name sources
            const feedbackWithCitizen = await pool.query(
                `SELECT f.*, 
                        COALESCE(u.email, c.email, f.citizen_email) as citizen_email,
                        COALESCE(u.full_name, c.full_name, f.citizen_name) as citizen_display_name
                 FROM feedbacks f
                 LEFT JOIN users u ON f.citizen_id = u.id AND f.user_type != 'citizen'
                 LEFT JOIN citizens c ON f.citizen_id = c.id AND f.user_type = 'citizen'
                 WHERE f.id = $1`,
                [id]
            );

            const feedback = feedbackWithCitizen.rows[0];
            const citizenEmail = feedback.citizen_email;

            if (response && citizenEmail) {

                console.log('Sending email notification to:', citizenEmail);

                const emailData = {
                    citizen_name: feedback.citizen_display_name || 'Quý khách',
                    title: feedback.title,
                    admin_note: response,
                    status: status,
                    feedback_code: feedback.feedback_code
                };


                const emailResult = await emailService.sendFeedbackReplyEmail(citizenEmail, emailData);

                if (emailResult.success) {
                    console.log('✅ Email notification sent successfully');
                } else {
                    console.log('⚠️  Email notification failed (non-critical):', emailResult.message);
                }
            }
        } catch (emailError) {
            console.error('⚠️  Failed to send email notification (non-critical):', emailError.message);
        }


        // Fetch the full record with joins to return consistent data for the frontend
        const fullRecordResult = await pool.query(
            `SELECT f.*, 
                    COALESCE(c.full_name, u.full_name) as citizen_name,
                    COALESCE(c.phone, u.phone) as citizen_phone,
                    COALESCE(c.email, u.email, f.citizen_email) as citizen_email,
                    c.address as citizen_address,
                    f.admin_note as response,
                    s.name as status_name,
                    a.full_name as assigned_to_name
             FROM feedbacks f
             LEFT JOIN users u ON f.citizen_id = u.id AND f.user_type != 'citizen'
             LEFT JOIN citizens c ON f.citizen_id = c.id AND f.user_type = 'citizen'
             LEFT JOIN status s ON f.status_id = s.id
             LEFT JOIN users a ON f.assigned_to = a.id
             WHERE f.id = $1`,
            [id]
        );

        const fullFeedback = fullRecordResult.rows[0];
        if (fullFeedback) {
            fullFeedback.subject = fullFeedback.title;
            fullFeedback.citizen_full_name = fullFeedback.citizen_name;
        }

        res.json({
            message: 'Cập nhật trạng thái thành công',
            data: fullFeedback
        });
    } catch (error) {
        console.error('=== UPDATE FEEDBACK STATUS ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error detail:', error.detail);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Lỗi server khi cập nhật trạng thái',
            details: error.message,
            hint: error.hint,
            code: error.code
        });
    }
};

// Phân công xử lý phản ánh
exports.assign = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigned_to } = req.body;

        // Only staff can assign
        if (!['admin', 'staff', 'leader'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Không có quyền thực hiện' });
        }

        const result = await pool.query(
            `UPDATE feedbacks 
             SET assigned_to = $1, status = 'processing', updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 
             RETURNING *`,
            [assigned_to, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy phản ánh' });
        }

        // Add to history
        await pool.query(
            `INSERT INTO processing_history (record_type, record_id, action, new_status, created_by)
             VALUES ('feedback', $1, 'assign', 'processing', $2)`,
            [id, req.user.id]
        );

        res.json({
            message: 'Phân công xử lý thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Assign feedback error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy danh sách phản ánh công khai
exports.getPublic = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT id, category, title as subject, content, admin_note as response, resolved_at as response_date, created_at
             FROM feedbacks
             WHERE is_public = true AND status = 'resolved'
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM feedbacks WHERE is_public = true AND status = \'resolved\''
        );
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
        console.error('Get public feedbacks error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Tra cứu phản ánh theo mã
exports.getByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query(
            `SELECT f.*, 
                    COALESCE(c.full_name, u.full_name, f.citizen_name) as citizen_name,
                    f.admin_note as response,
                    s.name as status_name
             FROM feedbacks f
             LEFT JOIN users u ON f.citizen_id = u.id AND f.user_type != 'citizen'
             LEFT JOIN citizens c ON f.citizen_id = c.id AND f.user_type = 'citizen'
             LEFT JOIN status s ON f.status_id = s.id
             WHERE f.feedback_code = $1`,
            [code]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy phản ánh' });
        }

        const feedback = result.rows[0];
        // Clean data for public view if needed
        res.json(feedback);
    } catch (error) {
        console.error('Get feedback by code error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
