const pool = require('../config/db');

// Helper function to check if table exists
const tableExists = async (tableName) => {
    try {
        const res = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            );
        `, [tableName]);
        return res.rows[0].exists;
    } catch (error) {
        console.error(`Check table ${tableName} error:`, error);
        return false;
    }
};

// Lấy thống kê tổng quan
exports.getStats = async (req, res) => {
    try {
        const { timeFilter } = req.query;

        let dateCondition = '';
        let andDateCondition = '';
        if (timeFilter === 'day') {
            dateCondition = "WHERE created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'";
            andDateCondition = "AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'";
        } else if (timeFilter === 'month') {
            dateCondition = "WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'";
            andDateCondition = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE) AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'";
        } else if (timeFilter === 'year') {
            dateCondition = "WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE) AND created_at < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'";
            andDateCondition = "AND created_at >= DATE_TRUNC('year', CURRENT_DATE) AND created_at < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'";
        }

        const stats = {
            files: { total: 0, pending: 0, processing: 0, completed: 0, rejected: 0 },
            feedbacks: { total: 0, pending: 0, processing: 0, resolved: 0, rejected: 0 },
            incoming_documents: { total: 0, pending: 0, processing: 0, completed: 0 },
            outgoing_documents: { total: 0, draft: 0, pending_approval: 0, approved: 0, sent: 0 },
            users: { total: 0, citizens: 0, staff: 0, leaders: 0, admins: 0 }
        };

        // 1. Thống kê hồ sơ (Safe block)
        try {
            if (await tableExists('applications')) {
                const applicationStats = await pool.query(`
                    SELECT 
                        COUNT(*) as total,
                        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
                    FROM applications
                    ${dateCondition}
                `);
                stats.files = applicationStats.rows[0];

                // Add department breakdown
                if (await tableExists('departments')) {
                    const deptStats = await pool.query(`
                        SELECT 
                            d.id, d.name, d.code, d.icon,
                            COUNT(a.id) as count
                        FROM departments d
                        LEFT JOIN applications a ON d.id = a.department_id 
                            ${andDateCondition ? andDateCondition.replace(/created_at/g, 'a.created_at') : ''}
                        GROUP BY d.id, d.name, d.code, d.icon
                        ORDER BY d.id ASC
                    `);
                    stats.departments = deptStats.rows;
                }
            }
        } catch (e) {
            console.error('Applications stats failed:', e.message);
        }

        // 2. Thống kê phản ánh (Safe block)
        try {
            if (await tableExists('feedbacks')) {
                const feedbackStats = await pool.query(`
                    SELECT 
                        COUNT(*) as total,
                        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
                        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
                        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
                    FROM feedbacks
                    ${dateCondition}
                `);
                stats.feedbacks = feedbackStats.rows[0];
            }
        } catch (e) {
            console.error('Feedbacks stats failed:', e.message);
        }

        // 3. Thống kê người dùng (Safe block)
        try {
            if (await tableExists('users')) {
                const userStats = await pool.query(`
                    SELECT 
                        COUNT(*) as total,
                        COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
                        COUNT(CASE WHEN role = 'leader' THEN 1 END) as leaders,
                        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
                    FROM users
                    WHERE is_active = true ${andDateCondition}
                `);
                stats.users = userStats.rows[0];

                // Count from citizens table for accuracy
                if (await tableExists('citizens')) {
                    const citizenRes = await pool.query(`SELECT COUNT(*) as count FROM citizens ${dateCondition}`);
                    stats.users.citizens = parseInt(citizenRes.rows[0].count) || 0;
                } else {
                    // Fallback to role if table doesn't exist
                    const citizenRoleRes = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'citizen' AND is_active = true ${andDateCondition}`);
                    stats.users.citizens = parseInt(citizenRoleRes.rows[0].count) || 0;
                }
            }
        } catch (e) {
            console.error('Users stats failed:', e.message);
        }

        // 4. Thống kê văn bản
        try {
            if (await tableExists('documents')) {
                const docStats = await pool.query(`
                    SELECT 
                        type,
                        COUNT(*) as total,
                        COUNT(*) FILTER (WHERE status = 'processing' OR status = 'pending') as in_progress
                    FROM documents
                    ${dateCondition}
                    GROUP BY type
                `);

                docStats.rows.forEach(r => {
                    if (r.type === 'incoming') {
                        stats.incoming_documents = { total: parseInt(r.total) || 0, processing: parseInt(r.in_progress) || 0 };
                    } else if (r.type === 'outgoing') {
                        stats.outgoing_documents = { total: parseInt(r.total) || 0, pending_approval: parseInt(r.in_progress) || 0 };
                    }
                });
            }
        } catch (e) {
            console.error('Documents stats failed:', e.message);
        }

        res.json(stats);
    } catch (error) {
        console.error('Get global stats error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// ... (Các function khác giữ nguyên logic kiểm tra safe tableExists)
// Lấy thống kê theo thời gian
exports.getStatsByTime = async (req, res) => {
    try {
        const { type = 'file', period = 'month' } = req.query;

        let table;
        switch (type) {
            case 'feedback': table = 'feedbacks'; break;
            case 'incoming_document': table = 'incoming_documents'; break;
            case 'outgoing_document': table = 'outgoing_documents'; break;
            default: table = 'applications';
        }

        if (!(await tableExists(table))) {
            return res.json([]);
        }

        let dateFormat;
        let dateGroup;

        switch (period) {
            case 'day':
                dateFormat = 'YYYY-MM-DD';
                dateGroup = 'DATE(created_at)';
                break;
            case 'week':
                dateFormat = 'YYYY-IW';
                dateGroup = 'DATE_TRUNC(\'week\', created_at)';
                break;
            case 'year':
                dateFormat = 'YYYY';
                dateGroup = 'DATE_TRUNC(\'year\', created_at)';
                break;
            default: // month
                dateFormat = 'YYYY-MM';
                dateGroup = 'DATE_TRUNC(\'month\', created_at)';
        }

        const result = await pool.query(`
            SELECT 
                TO_CHAR(${dateGroup}, '${dateFormat}') as period,
                COUNT(*) as count,
                status
            FROM ${table}
            WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY ${dateGroup}, status
            ORDER BY ${dateGroup} DESC
        `);

        res.json(result.rows);
    } catch (error) {
        // console.error('Get stats by time error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Lấy hoạt động gần đây
exports.getRecentActivities = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        if (!(await tableExists('processing_history'))) {
            return res.json([]);
        }

        const result = await pool.query(`
            SELECT 
                ph.*,
                u.full_name as user_name
            FROM processing_history ph
            LEFT JOIN users u ON ph.created_by = u.id
            ORDER BY ph.created_at DESC
            LIMIT $1
        `, [limit]);

        res.json(result.rows);
    } catch (error) {
        // console.error('Get recent activities error:', error); 
        // Đôi khi query lỗi do cấu trúc bảng nhưng không nên crash UI
        res.json([]);
    }
};

// Lấy công việc cần xử lý
exports.getPendingTasks = async (req, res) => {
    try {
        const tasks = {
            pending_files: 0,
            pending_feedbacks: 0,
            pending_incoming_docs: 0,
            pending_outgoing_docs: 0
        };

        if (await tableExists('files')) {
            try {
                const pendingFiles = await pool.query(`
                    SELECT COUNT(*) as count
                    FROM files
                    WHERE (status = 'pending' OR (status = 'processing' AND assigned_to = $1))
                `, [req.user?.id]);
                tasks.pending_files = parseInt(pendingFiles.rows[0].count);
            } catch (e) { }
        }

        if (await tableExists('feedbacks')) {
            try {
                const pendingFeedbacks = await pool.query(`
                    SELECT COUNT(*) as count
                    FROM feedbacks
                    WHERE (status = 'pending' OR (status = 'processing' AND assigned_to = $1))
                `, [req.user?.id]);
                tasks.pending_feedbacks = parseInt(pendingFeedbacks.rows[0].count);
            } catch (e) { }
        }

        res.json(tasks);
    } catch (error) {
        console.error('Get pending tasks error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
