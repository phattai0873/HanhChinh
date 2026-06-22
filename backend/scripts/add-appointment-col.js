const pool = require('../src/config/db');

async function addAppointmentColumn() {
    try {
        console.log('🔧 Adding appointment_date column to applications table...');
        await pool.query('ALTER TABLE applications ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMP;');
        console.log('✅ Column added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addAppointmentColumn();
