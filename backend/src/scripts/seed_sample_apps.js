const pool = require('../config/db');

async function seedApplications() {
    try {
        console.log('🚀 Bắt đầu thêm dữ liệu mẫu...');

        // 1. Lấy mapping departments
        const deptsRes = await pool.query('SELECT id, code FROM departments');
        const depts = {};
        deptsRes.rows.forEach(d => depts[d.code] = d.id);

        console.log('Departments found:', depts);

        const sampleApplications = [
            // Nhóm Hộ tịch – Dân sự (HO_TICH)
            {
                service_id: 3,
                service_name: 'Giấy khai sinh',
                dept: 'HO_TICH',
                citizen: 'Trần Văn An',
                form: { fullName: 'Trần Văn An', fatherName: 'Trần Văn B', motherName: 'Lê Thị C', birthDate: '2026-01-20' }
            },
            {
                service_id: 5,
                service_name: 'Đăng ký kết hôn',
                dept: 'HO_TICH',
                citizen: 'Phạm Minh Hoàng',
                form: { groomName: 'Phạm Minh Hoàng', brideName: 'Nguyễn Thu Thủy', weddingDate: '2026-02-14' }
            },
            {
                service_id: 8,
                service_name: 'Xác nhận độc thân',
                dept: 'HO_TICH',
                citizen: 'Lê Thị Mai',
                form: { fullName: 'Lê Thị Mai', reason: 'Bổ sung hồ sơ mua nhà', status: 'Chưa kết hôn' }
            },

            // Nhóm Cư trú – Nhân khẩu (CU_TRU)
            {
                service_id: 2,
                service_name: 'Hộ khẩu',
                dept: 'CU_TRU',
                citizen: 'Nguyễn Văn Định',
                form: { headOfHousehold: 'Nguyễn Văn Định', address: '123 Đường ABC, Phường X', memberCount: 4 }
            },
            {
                service_id: 4,
                service_name: 'Chứng minh thư',
                dept: 'CU_TRU',
                citizen: 'Hoàng Văn Bách',
                form: { fullName: 'Hoàng Văn Bách', idNumber: '025123456789', reason: 'Cấp mới' }
            },
            {
                service_id: 11,
                service_name: 'Xác nhận cư trú',
                dept: 'CU_TRU',
                citizen: 'Đỗ Thị Lan',
                form: { fullName: 'Đỗ Thị Lan', currentAddress: '456 Đường XYZ', duration: '6 tháng' }
            },

            // Nhóm Tư pháp (TU_PHAP)
            {
                service_id: 6,
                service_name: 'Lý lịch tư pháp',
                dept: 'TU_PHAP',
                citizen: 'Bùi Thế Anh',
                form: { fullName: 'Bùi Thế Anh', purpose: 'Xin việc làm', type: 'Số 1' }
            },
            {
                service_id: 6,
                service_name: 'Lý lịch tư pháp',
                dept: 'TU_PHAP',
                citizen: 'Vũ Thị Hồng',
                form: { fullName: 'Vũ Thị Hồng', purpose: 'Du học', type: 'Số 2' }
            },

            // Nhóm Kinh doanh (KINH_DOANH)
            {
                service_id: 7,
                service_name: 'Giấy phép kinh doanh',
                dept: 'KINH_DOANH',
                citizen: 'Trương Gia Bình',
                form: { businessName: 'Cửa hàng Tiện lợi ABC', shopAddress: '789 Đường MNP', capital: '500,000,000' }
            },
            {
                service_id: 7,
                service_name: 'Giấy phép kinh doanh',
                dept: 'KINH_DOANH',
                citizen: 'Nguyễn Phi Long',
                form: { businessName: 'Quán Cà phê Highland', shopAddress: '159 Đường QRS', type: 'Hộ cá thể' }
            },

            // Nhóm Xây dựng – Đất đai (XAY_DUNG)
            {
                service_id: 12,
                service_name: 'Giấy phép xây dựng',
                dept: 'XAY_DUNG',
                citizen: 'Lý Văn Phúc',
                form: { applicant: 'Lý Văn Phúc', constructionSite: 'Lô 5, Khu dân cư mới', floors: 3, area: '100m2' }
            },
            {
                service_id: 12,
                service_name: 'Giấy phép xây dựng',
                dept: 'XAY_DUNG',
                citizen: 'Tạ Minh Tâm',
                form: { applicant: 'Tạ Minh Tâm', constructionSite: 'Hẻm 12, Đường Lê Lợi', type: 'Cải tạo' }
            }
        ];

        for (const app of sampleApplications) {
            const appCode = 'HS' + (Date.now() + Math.floor(Math.random() * 1000));
            const deptId = depts[app.dept];

            await pool.query(
                `INSERT INTO applications 
                (application_code, service_id, service_name, user_id, form_data, citizen_name, department_id, status, created_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)`,
                [appCode, app.service_id, app.service_name, null, JSON.stringify(app.form), app.citizen, deptId]
            );
            console.log(`✅ Đã thêm hồ sơ: ${app.service_name} - ${app.citizen}`);
        }

        console.log('\n🎉 Hoàn tất thêm dữ liệu mẫu!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

seedApplications();
