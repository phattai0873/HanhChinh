const pool = require('../src/config/db');

async function setupDatabase() {
    try {
        console.log('🔄 Setting up database...\n');

        // Check if users table exists
        const checkTable = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);

        if (checkTable.rows[0].exists) {
            console.log('✅ Users table already exists');

            // Show table structure
            const structure = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position;
            `);

            console.log('\n📋 Current table structure:');
            console.table(structure.rows);
        } else {
            console.log('📝 Creating users table...');

            // Create users table
            await pool.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255),
                    phone VARCHAR(20),
                    role VARCHAR(50) DEFAULT 'citizen',
                    department VARCHAR(255),
                    position VARCHAR(255),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            console.log('✅ Users table created successfully!');

            // Create indexes
            await pool.query(`
                CREATE INDEX idx_users_username ON users(username);
                CREATE INDEX idx_users_email ON users(email);
            `);

            console.log('✅ Indexes created successfully!');
        }

        // Count users
        const count = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`\n👥 Total users: ${count.rows[0].count}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

setupDatabase();
