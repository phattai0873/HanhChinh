const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Test endpoint - không cần auth
router.get('/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM users');
        res.json({
            status: 'OK',
            message: 'Database connected',
            userCount: result.rows[0].count
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
