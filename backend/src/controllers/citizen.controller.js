const pool = require('../config/db');

// Lấy danh sách công dân
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, ward, district } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM citizens WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        // Search filter
        if (search) {
            query += ` AND (full_name ILIKE $${paramIndex} OR id_number ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Ward filter
        if (ward) {
            query += ` AND ward = $${paramIndex}`;
            params.push(ward);
            paramIndex++;
        }

        // District filter
        if (district) {
            query += ` AND district = $${paramIndex}`;
            params.push(district);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM citizens WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;

        if (search) {
            countQuery += ` AND (full_name ILIKE $${countParamIndex} OR id_number ILIKE $${countParamIndex} OR phone ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
            countParamIndex++;
        }

        if (ward) {
            countQuery += ` AND ward = $${countParamIndex}`;
            countParams.push(ward);
            countParamIndex++;
        }

        if (district) {
            countQuery += ` AND district = $${countParamIndex}`;
            countParams.push(district);
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
        console.error('Get citizens error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy thông tin công dân theo ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM citizens WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy công dân' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get citizen by id error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Tìm công dân theo CMND/CCCD
exports.getByIdNumber = async (req, res) => {
    try {
        const { id_number } = req.params;

        const result = await pool.query(
            'SELECT * FROM citizens WHERE id_number = $1',
            [id_number]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy công dân' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get citizen by id number error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Tạo công dân mới
exports.create = async (req, res) => {
    try {
        const {
            full_name,
            id_number,
            date_of_birth,
            gender,
            phone,
            email,
            address,
            ward,
            district,
            city,
            household_head,
            household_number,
            notes
        } = req.body;

        // Validate required fields
        if (!full_name) {
            return res.status(400).json({ error: 'Vui lòng nhập họ tên' });
        }

        // Check if id_number exists
        if (id_number) {
            const existing = await pool.query(
                'SELECT id FROM citizens WHERE id_number = $1',
                [id_number]
            );

            if (existing.rows.length > 0) {
                return res.status(400).json({ error: 'Số CMND/CCCD đã tồn tại' });
            }
        }

        const result = await pool.query(
            `INSERT INTO citizens (
                full_name, id_number, date_of_birth, gender, phone, email,
                address, ward, district, city, household_head, household_number, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
            [
                full_name, id_number, date_of_birth, gender, phone, email,
                address, ward, district, city, household_head, household_number, notes
            ]
        );

        res.status(201).json({
            message: 'Tạo hồ sơ công dân thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create citizen error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Cập nhật thông tin công dân
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name,
            id_number,
            date_of_birth,
            gender,
            phone,
            email,
            address,
            ward,
            district,
            city,
            household_head,
            household_number,
            is_active,
            notes
        } = req.body;

        const updateFields = [];
        const params = [];
        let paramIndex = 1;

        if (full_name !== undefined) {
            updateFields.push(`full_name = $${paramIndex}`);
            params.push(full_name);
            paramIndex++;
        }

        if (id_number !== undefined) {
            // Check if id_number exists for other citizens
            const existing = await pool.query(
                'SELECT id FROM citizens WHERE id_number = $1 AND id != $2',
                [id_number, id]
            );

            if (existing.rows.length > 0) {
                return res.status(400).json({ error: 'Số CMND/CCCD đã tồn tại' });
            }

            updateFields.push(`id_number = $${paramIndex}`);
            params.push(id_number);
            paramIndex++;
        }

        if (date_of_birth !== undefined) {
            updateFields.push(`date_of_birth = $${paramIndex}`);
            params.push(date_of_birth);
            paramIndex++;
        }

        if (gender !== undefined) {
            updateFields.push(`gender = $${paramIndex}`);
            params.push(gender);
            paramIndex++;
        }

        if (phone !== undefined) {
            updateFields.push(`phone = $${paramIndex}`);
            params.push(phone);
            paramIndex++;
        }

        if (email !== undefined) {
            updateFields.push(`email = $${paramIndex}`);
            params.push(email);
            paramIndex++;
        }

        if (address !== undefined) {
            updateFields.push(`address = $${paramIndex}`);
            params.push(address);
            paramIndex++;
        }

        if (ward !== undefined) {
            updateFields.push(`ward = $${paramIndex}`);
            params.push(ward);
            paramIndex++;
        }

        if (district !== undefined) {
            updateFields.push(`district = $${paramIndex}`);
            params.push(district);
            paramIndex++;
        }

        if (city !== undefined) {
            updateFields.push(`city = $${paramIndex}`);
            params.push(city);
            paramIndex++;
        }

        if (household_head !== undefined) {
            updateFields.push(`household_head = $${paramIndex}`);
            params.push(household_head);
            paramIndex++;
        }

        if (household_number !== undefined) {
            updateFields.push(`household_number = $${paramIndex}`);
            params.push(household_number);
            paramIndex++;
        }

        if (is_active !== undefined) {
            updateFields.push(`is_active = $${paramIndex}`);
            params.push(is_active);
            paramIndex++;
        }

        if (notes !== undefined) {
            updateFields.push(`notes = $${paramIndex}`);
            params.push(notes);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Không có thông tin cần cập nhật' });
        }

        // Luôn cập nhật thời gian updated_at
        updateFields.push(`updated_at = $${paramIndex}`);
        params.push(new Date());
        paramIndex++;

        // Thêm ID vào cuối mảng params
        params.push(id);
        const idParamIndex = paramIndex;

        const query = `UPDATE citizens SET ${updateFields.join(', ')} WHERE id = $${idParamIndex} RETURNING *`;

        console.log('Update citizen query:', query);
        console.log('Update citizen params:', params);

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy công dân' });
        }

        res.json({
            message: 'Cập nhật thông tin thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update citizen error:', error);
        res.status(500).json({ error: 'Lỗi server', message: error.message });
    }
};

// Xóa công dân (soft delete)
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE citizens SET is_active = false WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy công dân' });
        }

        res.json({ message: 'Xóa hồ sơ công dân thành công' });
    } catch (error) {
        console.error('Delete citizen error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

module.exports = exports;
