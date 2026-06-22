const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        }

        let user = null;
        let userType = null;

        // First, try to find in citizens table (for regular citizens)
        const citizenResult = await pool.query(
            'SELECT * FROM citizens WHERE username = $1 AND is_active = true',
            [username]
        );

        if (citizenResult.rows.length > 0) {
            user = citizenResult.rows[0];
            userType = 'citizen';
            user.role = 'citizen'; // Add role field for consistency
        } else {
            // If not found in citizens, try users table (for staff/admin)
            const userResult = await pool.query(
                'SELECT * FROM users WHERE username = $1 AND is_active = true',
                [username]
            );

            if (userResult.rows.length > 0) {
                user = userResult.rows[0];
                userType = 'staff';
            }
        }

        // If user not found in either table
        if (!user) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, userType: userType },
            process.env.JWT_SECRET || 'ubnd_phuong_secret',
            { expiresIn: '24h' }
        );

        // Remove password from response
        delete user.password_hash;

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                ...user,
                userType: userType
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Đăng ký (cho người dân)
exports.register = async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            username,
            password,
            full_name,
            email,
            phone,
            id_number,
            date_of_birth,
            gender,
            address,
            ward,
            district,
            city
        } = req.body;

        // Validate input
        if (!username || !password || !full_name || !email) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin (tên đăng nhập, mật khẩu, họ tên, email)' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email không hợp lệ' });
        }

        // Start transaction
        await client.query('BEGIN');

        // Check if username exists in citizens table
        const existingUsername = await client.query(
            'SELECT id FROM citizens WHERE username = $1',
            [username]
        );

        if (existingUsername.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        }

        // Check if email exists in citizens table
        if (email) {
            const existingCitizen = await client.query(
                'SELECT id FROM citizens WHERE email = $1',
                [email]
            );
            if (existingCitizen.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Email đã được sử dụng' });
            }
        }

        // Check if id_number exists in citizens table
        if (id_number) {
            const existingIdNumber = await client.query(
                'SELECT id FROM citizens WHERE id_number = $1',
                [id_number]
            );
            if (existingIdNumber.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Số CMND/CCCD đã được sử dụng' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create citizen record with authentication fields
        const citizenResult = await client.query(
            `INSERT INTO citizens (
                username, password_hash, full_name, email, phone, id_number, 
                date_of_birth, gender, address, ward, district, city, is_active
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true) 
             RETURNING id, username, full_name, email, phone, id_number, date_of_birth, 
                       gender, address, ward, district, city, created_at`,
            [
                username, hashedPassword, full_name, email, phone, id_number,
                date_of_birth, gender, address, ward, district, city
            ]
        );

        const newCitizen = citizenResult.rows[0];

        // Commit transaction
        await client.query('COMMIT');

        // Generate token
        const token = jwt.sign(
            { id: newCitizen.id, username: newCitizen.username, role: 'citizen' },
            process.env.JWT_SECRET || 'ubnd_phuong_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                ...newCitizen,
                role: 'citizen'
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Register error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint
        });
        res.status(500).json({
            error: 'Lỗi server',
            message: error.message,
            detail: error.detail
        });
    } finally {
        client.release();
    }
};

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, full_name, email, phone, role, department, position FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Get current user
        const result = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.id]
        );

        const user = result.rows[0];

        // Check old password
        const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Mật khẩu cũ không đúng' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, req.user.id]
        );

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
