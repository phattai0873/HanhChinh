const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const initDatabase = async () => {
    try {
        console.log('🚀 Bắt đầu khởi tạo database...');

        // Hash password for admin
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        await pool.query(`
            INSERT INTO users (username, password, full_name, email, role, department, position)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (username) DO NOTHING
        `, ['admin', hashedPassword, 'Quản trị viên', 'admin@phuong.gov.vn', 'admin', 'Văn phòng UBND', 'Quản trị hệ thống']);

        console.log('✅ Đã tạo tài khoản admin');
        console.log('   Username: admin');
        console.log('   Password: admin123');

        // Create sample staff users
        const staffPassword = await bcrypt.hash('staff123', 10);

        await pool.query(`
            INSERT INTO users (username, password, full_name, email, role, department, position)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7),
                ($8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (username) DO NOTHING
        `, [
            'canbo1', staffPassword, 'Nguyễn Văn A', 'canbo1@phuong.gov.vn', 'staff', 'Phòng Hành chính', 'Cán bộ',
            'canbo2', staffPassword, 'Trần Thị B', 'canbo2@phuong.gov.vn', 'staff', 'Phòng Hành chính', 'Cán bộ'
        ]);

        console.log('✅ Đã tạo tài khoản cán bộ mẫu');
        console.log('   Username: canbo1, canbo2');
        console.log('   Password: staff123');

        // Create sample citizen user
        const citizenPassword = await bcrypt.hash('citizen123', 10);

        await pool.query(`
            INSERT INTO users (username, password, full_name, email, phone, role)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (username) DO NOTHING
        `, ['nguoidan1', citizenPassword, 'Lê Văn C', 'nguoidan@gmail.com', '0123456789', 'citizen']);

        console.log('✅ Đã tạo tài khoản người dân mẫu');
        console.log('   Username: nguoidan1');
        console.log('   Password: citizen123');

        console.log('\n🎉 Khởi tạo database thành công!');
        console.log('\n📝 Hướng dẫn:');
        console.log('1. Chạy backend: cd backend && npm run dev');
        console.log('2. Chạy frontend: cd fontend && npm run dev');
        console.log('3. Truy cập: http://localhost:5173');
        console.log('4. Đăng nhập với tài khoản admin hoặc các tài khoản mẫu');

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khởi tạo database:', error);
        process.exit(1);
    }
};

initDatabase();
