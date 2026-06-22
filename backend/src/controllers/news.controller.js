const pool = require('../config/db');

// Lấy danh sách tin tức (Admin)
exports.getAll = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM news WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (category) {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (search) {
            query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM news WHERE 1=1';
        const countParams = [];
        let countParamIndex = 1;

        if (status) {
            countQuery += ` AND status = $${countParamIndex}`;
            countParams.push(status);
            countParamIndex++;
        }

        if (category) {
            countQuery += ` AND category = $${countParamIndex}`;
            countParams.push(category);
            countParamIndex++;
        }

        if (search) {
            countQuery += ` AND (title ILIKE $${countParamIndex} OR content ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
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
        console.error('Get news error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy chi tiết tin tức
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM news WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy tin tức' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get news by id error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Tạo tin tức mới
exports.create = async (req, res) => {
    try {
        const { title, category, content, status, thumbnail, is_public } = req.body;
        const author = req.user.full_name || req.user.username;

        if (!title || !content) {
            return res.status(400).json({ error: 'Tiêu đề và nội dung là bắt buộc' });
        }

        const result = await pool.query(
            `INSERT INTO news (title, category, content, author, status, thumbnail, is_public, published_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, ${status === 'published' ? 'CURRENT_TIMESTAMP' : 'NULL'})
             RETURNING *`,
            [title, category, content, author, status || 'draft', thumbnail, is_public || false]
        );

        res.status(201).json({
            message: 'Tạo tin tức thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create news error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Cập nhật tin tức
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, content, status, thumbnail, is_public } = req.body;

        const updateFields = ['updated_at = CURRENT_TIMESTAMP'];
        const params = [];
        let paramIndex = 1;

        if (title) { updateFields.push(`title = $${paramIndex}`); params.push(title); paramIndex++; }
        if (category) { updateFields.push(`category = $${paramIndex}`); params.push(category); paramIndex++; }
        if (content) { updateFields.push(`content = $${paramIndex}`); params.push(content); paramIndex++; }
        if (status) {
            updateFields.push(`status = $${paramIndex}`);
            params.push(status);
            paramIndex++;
            if (status === 'published') {
                updateFields.push('published_at = COALESCE(published_at, CURRENT_TIMESTAMP)');
            }
        }
        if (thumbnail) { updateFields.push(`thumbnail = $${paramIndex}`); params.push(thumbnail); paramIndex++; }
        if (is_public !== undefined) { updateFields.push(`is_public = $${paramIndex}`); params.push(is_public); paramIndex++; }

        params.push(id);

        const result = await pool.query(
            `UPDATE news SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy tin tức' });
        }

        res.json({
            message: 'Cập nhật tin tức thành công',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update news error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Xóa tin tức
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy tin tức' });
        }

        res.json({ message: 'Xóa tin tức thành công' });
    } catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy tin tức công khai (cho trang chủ/public)
exports.getPublic = async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const result = await pool.query(`
            SELECT * FROM news 
            WHERE status = 'published' AND is_public = true 
            ORDER BY published_at DESC 
            LIMIT $1
        `, [limit]);

        res.json(result.rows);
    } catch (error) {
        console.error('Get public news error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
