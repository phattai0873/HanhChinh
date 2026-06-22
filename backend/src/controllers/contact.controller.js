const pool = require('../config/db');
const emailService = require('../services/email.service');

// Create new contact
exports.create = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        const result = await pool.query(
            `INSERT INTO contacts (name, email, phone, subject, message)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, email, phone, subject, message]
        );

        res.status(201).json({
            message: 'Gửi liên hệ thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Get all contacts (for admin)
exports.getAll = async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        let query = 'SELECT * FROM contacts';
        const params = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        const countQuery = status
            ? 'SELECT COUNT(*) FROM contacts WHERE status = $1'
            : 'SELECT COUNT(*) FROM contacts';
        const countParams = status ? [status] : [];
        const countResult = await pool.query(countQuery, countParams);

        res.json({
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Update contact status
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'replied', 'spam', 'pending'

        const result = await pool.query(
            `UPDATE contacts 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy liên hệ' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Delete contact
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM contacts WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy liên hệ' });
        }

        res.json({ message: 'Xóa liên hệ thành công' });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Send admin reply
exports.sendReply = async (req, res) => {
    try {
        console.log('=== SEND CONTACT REPLY ===');
        const { id } = req.params;
        const { admin_reply } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!admin_reply || admin_reply.trim() === '') {
            return res.status(400).json({ error: 'Vui lòng nhập nội dung phản hồi' });
        }

        const newReplyObj = {
            message: admin_reply,
            sent_at: new Date().toISOString(),
            sent_by: userId,
            sender_type: 'admin'
        };

        const result = await pool.query(
            `UPDATE contacts 
             SET admin_reply = $1, 
                 replies = replies || $2::jsonb,
                 replied_at = CURRENT_TIMESTAMP,
                 replied_by = $3,
                 status = 'replied',
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4 
             RETURNING *`,
            [admin_reply, JSON.stringify([newReplyObj]), userId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy liên hệ' });
        }

        const contact = result.rows[0];
        console.log('Contact updated:', contact);

        // Send email notification using email service
        if (contact.email) {
            emailService.sendContactReplyEmail(contact.email, {
                name: contact.name,
                subject: contact.subject,
                admin_reply: admin_reply
            }).catch(e => console.error('⚠️  Email notification failed (non-critical):', e.message));
        }


        res.json({
            message: 'Gửi phản hồi thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Send reply error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Get contacts for logged in citizen
exports.getMyContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        let userEmail = req.user.email;
        let userPhone = req.user.phone;

        if (!userEmail || !userPhone) {
            const citizenRes = await pool.query('SELECT email, phone FROM citizens WHERE id = $1', [userId]);
            if (citizenRes.rows.length > 0) {
                userEmail = citizenRes.rows[0].email;
                userPhone = citizenRes.rows[0].phone;
            } else {
                const staffRes = await pool.query('SELECT email, phone FROM users WHERE id = $1', [userId]);
                if (staffRes.rows.length > 0) {
                    userEmail = staffRes.rows[0].email;
                    userPhone = staffRes.rows[0].phone;
                }
            }
        }

        if (!userEmail && !userPhone) {
            return res.json({ data: [] });
        }

        const result = await pool.query(
            `SELECT * FROM contacts 
             WHERE (email = $1 AND email IS NOT NULL AND email != '') 
             OR (phone = $2 AND phone IS NOT NULL AND phone != '') 
             ORDER BY created_at DESC`,
            [userEmail, userPhone]
        );
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Get my contacts error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Send reply from citizen
exports.userReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const userId = req.user.id;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Vui lòng nhập nội dung' });
        }

        let userEmail = req.user.email;
        let userPhone = req.user.phone;

        if (!userEmail || !userPhone) {
            const citizenRes = await pool.query('SELECT email, phone FROM citizens WHERE id = $1', [userId]);
            if (citizenRes.rows.length > 0) {
                userEmail = citizenRes.rows[0].email;
                userPhone = citizenRes.rows[0].phone;
            } else {
                const staffRes = await pool.query('SELECT email, phone FROM users WHERE id = $1', [userId]);
                if (staffRes.rows.length > 0) {
                    userEmail = staffRes.rows[0].email;
                    userPhone = staffRes.rows[0].phone;
                }
            }
        }

        // Verify ownership
        const checkResult = await pool.query(
            `SELECT * FROM contacts 
             WHERE id = $1 AND (
                (email = $2 AND email IS NOT NULL AND email != '') OR 
                (phone = $3 AND phone IS NOT NULL AND phone != '')
             )`, 
            [id, userEmail, userPhone]
        );
        
        if (checkResult.rows.length === 0) {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        const newReplyObj = {
            message: message,
            sent_at: new Date().toISOString(),
            sent_by: userId,
            sender_type: 'citizen'
        };

        const result = await pool.query(
            `UPDATE contacts 
             SET replies = replies || $1::jsonb,
                 status = 'pending',
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [JSON.stringify([newReplyObj]), id]
        );

        res.json({
            message: 'Đã gửi tin nhắn',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('User reply error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
