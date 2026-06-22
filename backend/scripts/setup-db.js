const pool = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    try {
        console.log('🔄 Starting complete database schema initialization and seeding...\n');

        // 1. Create departments table
        console.log('⏳ Creating "departments" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS departments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(100) UNIQUE NOT NULL,
                icon VARCHAR(100),
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Create procedures table
        console.log('⏳ Creating "procedures" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS procedures (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                code VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                processing_days INTEGER DEFAULT 3,
                fee DECIMAL(10, 2) DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Create citizens table
        console.log('⏳ Creating "citizens" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS citizens (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                id_number VARCHAR(20) UNIQUE,
                date_of_birth DATE,
                gender VARCHAR(10),
                phone VARCHAR(20),
                email VARCHAR(255),
                address TEXT,
                ward VARCHAR(100),
                district VARCHAR(100),
                city VARCHAR(100),
                household_head VARCHAR(255),
                household_number VARCHAR(50),
                username VARCHAR(255) UNIQUE,
                password_hash VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Create users table
        console.log('⏳ Creating "users" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20),
                role VARCHAR(50) NOT NULL DEFAULT 'citizen',
                department VARCHAR(255),
                position VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                citizen_id INTEGER REFERENCES citizens(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. Create applications table
        console.log('⏳ Creating "applications" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                application_code VARCHAR(50) UNIQUE NOT NULL,
                service_id INTEGER NOT NULL,
                service_name VARCHAR(255) NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                user_type VARCHAR(50) DEFAULT 'citizen',
                form_data JSONB NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                admin_note TEXT,
                department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
                appointment_date TIMESTAMP,
                citizen_name VARCHAR(255),
                citizen_phone VARCHAR(20),
                citizen_email VARCHAR(255),
                citizen_id_number VARCHAR(20),
                citizen_address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP
            );
        `);

        // 6. Create file_attachments table
        console.log('⏳ Creating "file_attachments" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS file_attachments (
                id SERIAL PRIMARY KEY,
                file_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_type VARCHAR(100),
                file_size INTEGER,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 7. Create documents table (unified)
        console.log('⏳ Creating "documents" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                type VARCHAR(20) NOT NULL CHECK (type IN ('incoming', 'outgoing')),
                document_number VARCHAR(50),
                title TEXT NOT NULL,
                source_dest VARCHAR(255),
                issued_date DATE,
                status VARCHAR(50) DEFAULT 'processed',
                file_url TEXT,
                notes TEXT,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 8. Create document_attachments table
        console.log('⏳ Creating "document_attachments" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS document_attachments (
                id SERIAL PRIMARY KEY,
                document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
                document_type VARCHAR(50),
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_size INTEGER,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 9. Create feedbacks table
        console.log('⏳ Creating "feedbacks" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedbacks (
                id SERIAL PRIMARY KEY,
                citizen_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                citizen_name VARCHAR(255) NOT NULL,
                citizen_phone VARCHAR(20),
                citizen_email VARCHAR(255),
                citizen_address TEXT,
                category VARCHAR(100),
                subject VARCHAR(500) NOT NULL,
                content TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                priority VARCHAR(50) DEFAULT 'normal',
                assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
                response TEXT,
                response_date TIMESTAMP,
                is_public BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 10. Create feedback_attachments table
        console.log('⏳ Creating "feedback_attachments" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS feedback_attachments (
                id SERIAL PRIMARY KEY,
                feedback_id INTEGER REFERENCES feedbacks(id) ON DELETE CASCADE,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_type VARCHAR(100),
                file_size INTEGER,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 11. Create processing_history table
        console.log('⏳ Creating "processing_history" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS processing_history (
                id SERIAL PRIMARY KEY,
                record_type VARCHAR(50) NOT NULL,
                record_id INTEGER NOT NULL,
                action VARCHAR(100) NOT NULL,
                old_status VARCHAR(50),
                new_status VARCHAR(50),
                note TEXT,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 12. Create notifications table
        console.log('⏳ Creating "notifications" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                type VARCHAR(50),
                is_read BOOLEAN DEFAULT false,
                link VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 13. Create contacts table
        console.log('⏳ Creating "contacts" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                admin_reply TEXT,
                replied_at TIMESTAMP,
                replied_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 14. Create news table
        console.log('⏳ Creating "news" table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS news (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                content TEXT,
                author VARCHAR(255),
                thumbnail VARCHAR(255),
                status VARCHAR(50) DEFAULT 'draft',
                is_public BOOLEAN DEFAULT false,
                views INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP
            );
        `);

        console.log('✅ All tables verified/created successfully!');

        // 15. Create indexes
        console.log('\n📊 Creating database indexes...');
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_citizens_id_number ON citizens(id_number);
            CREATE INDEX IF NOT EXISTS idx_citizens_phone ON citizens(phone);
            CREATE INDEX IF NOT EXISTS idx_citizens_username ON citizens(username);
            CREATE INDEX IF NOT EXISTS idx_applications_code ON applications(application_code);
            CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
            CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
            CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
            CREATE INDEX IF NOT EXISTS idx_feedbacks_citizen ON feedbacks(citizen_id);
            CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
            CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
        `);
        console.log('✅ Indexes created successfully!');

        // 16. Seed departments
        console.log('\n🌱 Seeding departments...');
        await pool.query(`
            INSERT INTO departments (id, name, code, icon, description) VALUES
            (1, 'Hộ tịch - Dân sự', 'HO_TICH', 'UserCheck', 'Quản lý khai sinh, kết hôn, khai tử và xác nhận tình trạng hôn nhân'),
            (2, 'Cư trú - Nhân khẩu', 'CU_TRU', 'Home', 'Quản lý đăng ký thường trú, tạm trú, tạm vắng'),
            (3, 'Tư pháp - Chứng thực', 'TU_PHAP', 'FileText', 'Chứng thực bản sao, chữ ký, cấp lý lịch tư pháp'),
            (4, 'Đăng ký Kinh doanh', 'KINH_DOANH', 'Briefcase', 'Cấp và quản lý giấy phép đăng ký kinh doanh hộ cá thể'),
            (5, 'Quản lý Xây dựng', 'XAY_DUNG', 'Layers', 'Cấp giấy phép xây dựng và sửa chữa nhà ở')
            ON CONFLICT (code) DO UPDATE SET 
                name = EXCLUDED.name, 
                icon = EXCLUDED.icon, 
                description = EXCLUDED.description;
        `);
        console.log('✅ Departments seeded');

        // 17. Seed procedures
        console.log('🌱 Seeding procedures...');
        await pool.query(`
            INSERT INTO procedures (id, name, code, description, processing_days, fee) VALUES
            (1, 'Đăng ký khai sinh', 'DK_KHAISINH', 'Thủ tục đăng ký khai sinh cho trẻ mới sinh', 3, 0),
            (2, 'Đăng ký thường trú / Hộ khẩu', 'DK_THUONGTRU', 'Đăng ký hộ khẩu thường trú', 7, 0),
            (3, 'Đăng ký khai tử', 'DK_KHAITU', 'Thủ tục đăng ký khai tử', 1, 0),
            (4, 'Đăng ký tạm trú', 'DK_TAMTRU', 'Thủ tục đăng ký tạm trú', 3, 0),
            (5, 'Đăng ký kết hôn', 'DK_KETHON', 'Thủ tục đăng ký kết hôn', 3, 0),
            (6, 'Cấp phiếu lý lịch tư pháp / CMND', 'CAP_LLTP', 'Thủ tục cấp lý lịch tư pháp', 10, 200000),
            (7, 'Đăng ký kinh doanh hộ cá thể', 'DK_KINHDOANH', 'Thủ tục cấp phép kinh doanh hộ cá thể', 5, 100000),
            (8, 'Chứng thực bản sao', 'CHUNG_THUC_BANSAO', 'Chứng thực bản sao từ bản chính', 1, 5000),
            (9, 'Chứng thực chữ ký', 'CHUNG_THUC_CHUKY', 'Chứng thực chữ ký trên giấy tờ', 1, 10000),
            (10, 'Xác nhận lý lịch', 'XAC_NHAN_LYLICH', 'Xác nhận lý lịch cá nhân', 2, 0),
            (11, 'Cấp phép xây dựng', 'CAP_PHEP_XAYDUNG', 'Cấp giấy phép xây dựng nhà ở riêng lẻ', 15, 500000),
            (12, 'Xác nhận độc thân', 'XN_DOC_THAN', 'Xác nhận tình trạng hôn nhân', 2, 0)
            ON CONFLICT (id) DO UPDATE SET 
                name = EXCLUDED.name, 
                code = EXCLUDED.code, 
                description = EXCLUDED.description, 
                processing_days = EXCLUDED.processing_days, 
                fee = EXCLUDED.fee;
        `);
        console.log('✅ Procedures seeded');

        // 18. Seed default citizens
        console.log('🌱 Seeding default citizens...');
        const userPasswordHash = await bcrypt.hash('citizen123', 10);
        await pool.query(`
            INSERT INTO citizens (id, full_name, id_number, phone, email, address, username, password_hash) VALUES
            (1, 'Lê Văn C', '001234567899', '0123456789', 'nguoidan@gmail.com', '123 Đường ABC, Phường X', 'nguoidan1', $1)
            ON CONFLICT (username) DO NOTHING;
        `, [userPasswordHash]);
        console.log('✅ Citizen user seeded');

        // 19. Seed default admin & staff users
        console.log('🌱 Seeding administrative users...');
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const staffPasswordHash = await bcrypt.hash('staff123', 10);

        // Seed Admin
        await pool.query(`
            INSERT INTO users (username, password, full_name, email, role, department, position)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (username) DO NOTHING;
        `, ['admin', adminPasswordHash, 'Quản trị viên', 'admin@phuong.gov.vn', 'admin', 'Văn phòng UBND', 'Quản trị hệ thống']);

        // Seed Staff
        await pool.query(`
            INSERT INTO users (username, password, full_name, email, role, department, position)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7),
                ($8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (username) DO NOTHING;
        `, [
            'canbo1', staffPasswordHash, 'Nguyễn Văn A', 'canbo1@phuong.gov.vn', 'staff', 'Phòng Hành chính', 'Cán bộ',
            'canbo2', staffPasswordHash, 'Trần Thị B', 'canbo2@phuong.gov.vn', 'staff', 'Phòng Hành chính', 'Cán bộ'
        ]);
        console.log('✅ Administrative users seeded');

        console.log('\n🎉 Database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error('Full error details:', error);
        process.exit(1);
    }
}

setupDatabase();
