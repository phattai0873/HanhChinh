const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running news table migration...');

        // Read SQL file
        const sqlPath = path.join(__dirname, '002_create_news_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute SQL
        await pool.query(sql);

        console.log('✅ News table created successfully!');

        // Check if table exists and show structure
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'news'
            ORDER BY ordinal_position;
        `);

        console.log('\n📋 News table structure:');
        console.table(result.rows);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
