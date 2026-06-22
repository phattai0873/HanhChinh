const pool = require('../src/config/db');

async function checkTable() {
    try {
        // Get table structure
        const result = await pool.query(`
            SELECT 
                column_name, 
                data_type, 
                character_maximum_length,
                column_default,
                is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);

        console.log('📋 Users table columns:');
        console.table(result.rows);

        // Count users
        const count = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`\n👥 Total users: ${count.rows[0].count}`);

        pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        pool.end();
    }
}

checkTable();
