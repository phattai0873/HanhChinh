const pool = require('../config/db');

// Get all schedules
const getSchedules = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = `
            SELECT ws.*, u.full_name as creator_name 
            FROM work_schedules ws
            LEFT JOIN users u ON ws.created_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (start_date) {
            params.push(start_date);
            query += ` AND ws.start_time >= $${params.length}`;
        }
        if (end_date) {
            params.push(end_date);
            query += ` AND ws.end_time <= $${params.length}`;
        }

        query += ` ORDER BY ws.start_time ASC`;

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error in getSchedules:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create schedule
const createSchedule = async (req, res) => {
    try {
        const { title, description, start_time, end_time, location, attendees, type } = req.body;
        const created_by = req.user.id; // from auth middleware

        const { rows } = await pool.query(
            `INSERT INTO work_schedules 
            (title, description, start_time, end_time, location, attendees, type, created_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [title, description, start_time, end_time, location, attendees, type, created_by]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error in createSchedule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update schedule
const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, start_time, end_time, location, attendees, type, status } = req.body;

        const { rows } = await pool.query(
            `UPDATE work_schedules 
            SET title = $1, description = $2, start_time = $3, end_time = $4, 
                location = $5, attendees = $6, type = $7, status = $8, updated_at = CURRENT_TIMESTAMP
            WHERE id = $9 
            RETURNING *`,
            [title, description, start_time, end_time, location, attendees, type, status, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error in updateSchedule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query('DELETE FROM work_schedules WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error in deleteSchedule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
};
