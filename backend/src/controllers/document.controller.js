const pool = require('../config/db');

// Helper function to format date for DB (DD-MM-YYYY -> YYYY-MM-DD)
const formatDateForDB = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    }
    return dateStr;
};

// Get all documents (optional filter by type)
exports.getAll = async (req, res) => {
    try {
        const { type } = req.query;
        let query = `
            SELECT d.*, u.full_name as creator_name 
            FROM documents d 
            LEFT JOIN users u ON d.created_by = u.id
        `;
        let params = [];
        let conditions = [];

        if (type) {
            params.push(type);
            conditions.push(`d.type = $${params.length}`);
        }

        // Role-based visibility logic
        const userRole = req.user?.role || req.user?.userType;
        const userId = req.user?.id;
        const isAdmin = ["admin", "leader", "lanh_dao", "super_admin"].includes(userRole);

        if (!isAdmin) {
            // Staff can only see approved documents or documents they created
            params.push(userId);
            conditions.push(`(d.status = 'approved' OR d.created_by = $${params.length})`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY d.created_at DESC';

        const result = await pool.query(query, params);
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Get document by ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT d.*, u.full_name as creator_name 
            FROM documents d 
            LEFT JOIN users u ON d.created_by = u.id 
            WHERE d.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy văn bản' });
        }

        const doc = result.rows[0];
        const userRole = req.user?.role || req.user?.userType;
        const userId = req.user?.id;
        const isAdmin = ["admin", "leader", "lanh_dao", "super_admin"].includes(userRole);

        if (!isAdmin && doc.status !== 'approved' && doc.created_by !== userId) {
            return res.status(403).json({ error: 'Không có quyền truy cập văn bản này' });
        }

        res.json(doc);
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Create new document
exports.create = async (req, res) => {
    try {
        const {
            type, document_number, title,
            issuing_authority, source_dest,
            issue_date, issued_date,
            received_date,
            urgency, content_summary, status, notes
        } = req.body;

        const userId = req.user.id;

        let file_url = req.body.file_url;
        if (req.file) {
            file_url = `/uploads/${req.file.filename}`;
        }

        const finalSourceDest = source_dest || issuing_authority;
        const finalIssueDate = issued_date || issue_date;

        const formattedIssueDate = formatDateForDB(finalIssueDate);
        const formattedReceivedDate = formatDateForDB(received_date);

        const result = await pool.query(
            `INSERT INTO documents 
            (type, document_number, title, source_dest, issued_date, received_date, urgency, content_summary, status, notes, file_url, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                type || 'incoming',
                document_number || "",
                title || "Văn bản không tiêu đề",
                finalSourceDest || "",
                formattedIssueDate,
                formattedReceivedDate,
                urgency || 'Thường',
                content_summary || "",
                status || 'pending',
                notes || "",
                file_url || null,
                userId
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({ error: 'Lỗi server', detail: error.message });
    }
};

// Update document
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            type, document_number, title,
            issuing_authority, source_dest,
            issue_date, issued_date,
            received_date,
            urgency, content_summary, status, notes
        } = req.body;

        const userRole = req.user?.role || req.user?.userType;
        const userId = req.user?.id;
        const isAdmin = ["admin", "leader", "lanh_dao", "super_admin"].includes(userRole);

        // Check if user has permission
        const docResult = await pool.query('SELECT created_by FROM documents WHERE id = $1', [id]);
        if (docResult.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy văn bản' });
        }
        if (!isAdmin && docResult.rows[0].created_by !== userId) {
            return res.status(403).json({ error: 'Không có quyền chỉnh sửa văn bản này' });
        }

        let file_url = req.body.file_url;
        if (req.file) {
            file_url = `/uploads/${req.file.filename}`;
        }

        const finalSourceDest = source_dest || issuing_authority;
        const finalIssueDate = issued_date || issue_date;

        const formattedIssueDate = formatDateForDB(finalIssueDate);
        const formattedReceivedDate = formatDateForDB(received_date);

        const result = await pool.query(
            `UPDATE documents 
             SET type = $1, document_number = $2, title = $3, source_dest = $4, 
                 issued_date = $5, received_date = $6, urgency = $7, content_summary = $8,
                 status = $9, notes = $10, 
                 file_url = COALESCE($11, file_url),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $12
             RETURNING *`,
            [
                type || 'incoming',
                document_number || "",
                title || "Văn bản không tiêu đề",
                finalSourceDest || "",
                formattedIssueDate,
                formattedReceivedDate,
                urgency || 'Thường',
                content_summary || "",
                status || 'pending',
                notes || "",
                file_url || null,
                id
            ]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Delete document
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const userRole = req.user?.role || req.user?.userType;
        const userId = req.user?.id;
        const isAdmin = ["admin", "leader", "lanh_dao", "super_admin"].includes(userRole);

        // Check if user has permission
        const docResult = await pool.query('SELECT created_by FROM documents WHERE id = $1', [id]);
        if (docResult.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy văn bản' });
        }
        if (!isAdmin && docResult.rows[0].created_by !== userId) {
            return res.status(403).json({ error: 'Không có quyền xóa văn bản này' });
        }

        const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);

        res.json({ message: 'Xóa văn bản thành công' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Get stats
exports.getStats = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE type = 'incoming') as incoming,
                COUNT(*) FILTER (WHERE type = 'outgoing') as outgoing
            FROM documents
        `);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

module.exports = exports;
