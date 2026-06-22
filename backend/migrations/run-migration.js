const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running database migration...');

        // Read SQL file
        const sqlPath = path.join(__dirname, '001_create_users_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute SQL
        await pool.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('📊 Users table created/verified');

        // Check if table exists and show structure
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);

        console.log('\n📋 Users table structure:');
        console.table(result.rows);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
