const pool = require('../src/config/db');

async function fixUsersTable() {
    try {
        console.log('🔍 Checking users table structure...\n');

        // Get current table structure
        const structure = await pool.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);

        console.log('📋 Current columns:');
        structure.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });

        // Check if password column exists
        const hasPassword = structure.rows.some(col => col.column_name === 'password');

        if (!hasPassword) {
            console.log('\n⚠️  Missing password column! Adding it...');

            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
            `);

            console.log('✅ Password column added!');
        } else {
            console.log('\n✅ Password column exists');
        }

        // Check and add other missing columns
        const requiredColumns = {
            'username': 'VARCHAR(255)',
            'password': 'VARCHAR(255)',
            'full_name': 'VARCHAR(255)',
            'email': 'VARCHAR(255)',
            'phone': 'VARCHAR(20)',
            'role': 'VARCHAR(50)',
            'is_active': 'BOOLEAN',
            'created_at': 'TIMESTAMP',
            'updated_at': 'TIMESTAMP'
        };

        console.log('\n🔧 Checking all required columns...');

        for (const [colName, colType] of Object.entries(requiredColumns)) {
            const exists = structure.rows.some(col => col.column_name === colName);

            if (!exists) {
                console.log(`  ⚠️  Adding missing column: ${colName}`);

                let defaultValue = '';
                if (colName === 'role') defaultValue = "DEFAULT 'citizen'";
                else if (colName === 'is_active') defaultValue = "DEFAULT true";
                else if (colName === 'created_at' || colName === 'updated_at') defaultValue = "DEFAULT CURRENT_TIMESTAMP";

                await pool.query(`
                    ALTER TABLE users 
                    ADD COLUMN ${colName} ${colType} ${defaultValue};
                `);

                console.log(`  ✅ Added ${colName}`);
            }
        }

        // Show final structure
        const finalStructure = await pool.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);

        console.log('\n📋 Final table structure:');
        console.table(finalStructure.rows);

        console.log('\n✅ Users table is now ready!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

fixUsersTable();
