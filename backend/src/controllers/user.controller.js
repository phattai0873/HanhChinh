const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Lấy danh sách người dùng  
exports.getAll = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;

        const result = await pool.query(
            'SELECT id, username, full_name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT $1',
            [limit]
        );

        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);

        res.json({
            data: result.rows,
            pagination: {
                page: 1,
                limit,
                total,
                totalPages: 1
            }
        });
    } catch (error) {
        console.error('Get users error:', error.message);
        res.status(500).json({ error: 'Lỗi server', message: error.message });
    }
};

// Lấy thông tin người dùng theo ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, username, full_name, email, phone, role, is_active, created_at FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get user by id error:', error.message);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Tạo người dùng mới
exports.create = async (req, res) => {
    try {
        const { username, password, full_name, email, phone, role } = req.body;

        if (!username || !password || !full_name || !role) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, password, full_name, email, phone, role)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, username, full_name, email, phone, role, created_at`,
            [username, hashedPassword, full_name, email, phone, role]
        );

        res.status(201).json({
            message: 'Tạo người dùng thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create user error:', error.message);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Cập nhật thông tin người dùng
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, role, is_active } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET full_name = COALESCE($1, full_name),
                 email = COALESCE($2, email),
                 phone = COALESCE($3, phone),
                 role = COALESCE($4, role),
                 is_active = COALESCE($5, is_active)
             WHERE id = $6
             RETURNING id, username, full_name, email, phone, role, is_active`,
            [full_name, email, phone, role, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        res.json({
            message: 'Cập nhật thông tin thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update user error:', error.message);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Xóa người dùng
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        console.error('Delete user error:', error.message);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy danh sách cán bộ
exports.getStaff = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, full_name, role
             FROM users 
             WHERE role IN ('staff', 'leader', 'admin') AND is_active = true
             ORDER BY full_name`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get staff error:', error.message);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

module.exports = exports;
