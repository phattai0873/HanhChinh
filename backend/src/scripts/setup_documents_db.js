const pool = require('../config/db');

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('Starting simplified Documents database setup...');
        await client.query('BEGIN');

        // Drop existing tables related to documents
        console.log('Dropping existing document tables...');
        await client.query('DROP TABLE IF EXISTS document_history CASCADE');
        await client.query('DROP TABLE IF EXISTS document_assignments CASCADE');
        await client.query('DROP TABLE IF EXISTS incoming_documents CASCADE');
        await client.query('DROP TABLE IF EXISTS outgoing_documents CASCADE');
        await client.query('DROP TABLE IF EXISTS documents CASCADE');

        // Create unified documents table
        console.log('Creating new unified documents table...');
        await client.query(`
            CREATE TABLE documents (
                id SERIAL PRIMARY KEY,
                type VARCHAR(20) NOT NULL CHECK (type IN ('incoming', 'outgoing')),
                document_number VARCHAR(50), -- Số ký hiệu
                title TEXT NOT NULL, -- Trích yếu
                source_dest VARCHAR(255), -- Nơi ban hành (đến) / Nơi nhận (đi)
                issued_date DATE, -- Ngày ban hành
                status VARCHAR(50) DEFAULT 'processed', -- processed, draft, etc. simplified
                file_url TEXT, -- Đường dẫn file
                notes TEXT,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create document_history table (Simplified version just for logging if needed, or we can skip it, 
        // but user said "Correct basic business logic", usually logging is good. 
        // User also said "SỬA LẠI DATABASE... mô phỏng", so maybe just the main table is enough.
        // I will add a simple history table just in case, or stick to just one table for simplicity as requested "simple simulation style".
        // Let's stick to the main table. The requirement "No complex approval workflow" suggests we don't need heavy normalization.

        // Add sample data?
        // console.log('Adding sample data...');
        // await client.query(`
        //     INSERT INTO documents (type, document_number, title, source_dest, issued_date, status, notes)
        //     VALUES 
        //     ('incoming', '123/UBND', 'Quyết định về việc...', 'UBND Tỉnh', '2026-01-20', 'processed', 'Ghi chú văn bản đến'),
        //     ('outgoing', '45/BC-UBND', 'Báo cáo tình hình...', 'Sở Tài Nguyên', '2026-01-28', 'sent', 'Ghi chú văn bản đi')
        // `);

        await client.query('COMMIT');
        console.log('Database setup completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error setting up database:', error);
    } finally {
        client.release();
        process.exit();
    }
}

setupDatabase();
