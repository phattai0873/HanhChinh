const pool = require('../src/config/db');

async function createApplicationsTable() {
    try {
        console.log('🔧 Creating applications table...\n');

        // Create applications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                application_code VARCHAR(50) UNIQUE NOT NULL,
                service_id INTEGER NOT NULL,
                service_name VARCHAR(255) NOT NULL,
                user_id INTEGER REFERENCES users(id),
                form_data JSONB NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                admin_note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP
            );
        `);

        console.log('✅ Applications table created!');

        // Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_applications_code ON applications(application_code);
            CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
            CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
        `);

        console.log('✅ Indexes created!');

        // Show table structure
        const structure = await pool.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'applications'
            ORDER BY ordinal_position;
        `);

        console.log('\n📋 Applications table structure:');
        console.table(structure.rows);

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

createApplicationsTable();
