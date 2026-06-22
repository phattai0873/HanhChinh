const pool = require('../config/db');

async function seedDocuments() {
    const client = await pool.connect();
    try {
        console.log('Seeding documents data...');
        await client.query('BEGIN');

        // Sample Data
        const documents = [
            // INCOMING DOCUMENTS
            {
                type: 'incoming',
                document_number: '105/QĐ-UBND',
                title: 'Quyết định về việc phê duyệt kế hoạch chuyển đổi số năm 2026',
                source_dest: 'UBND Tỉnh',
                issued_date: '2026-01-15',
                status: 'processed',
                notes: 'Đã chuyển cho phòng CNTT triển khai',
                file_url: null
            },
            {
                type: 'incoming',
                document_number: '23/TB-SYT',
                title: 'Thông báo về việc tăng cường công tác phòng chống dịch bệnh mùa đông xuân',
                source_dest: 'Sở Y Tế',
                issued_date: '2026-01-20',
                status: 'pending',
                notes: 'Yêu cầu các đơn vị phổ biến cho cán bộ',
                file_url: null
            },
            {
                type: 'incoming',
                document_number: '89/KH-SGDĐT',
                title: 'Kế hoạch tổ chức hội thi giáo viên dạy giỏi cấp tỉnh',
                source_dest: 'Sở Giáo dục và Đào tạo',
                issued_date: '2026-01-25',
                status: 'processing',
                notes: 'Đang rà soát danh sách giáo viên tham dự',
                file_url: null
            },
            {
                type: 'incoming',
                document_number: '12/CT-TTg',
                title: 'Chỉ thị về việc đôn đốc thực hiện nhiệm vụ trọng tâm sau kỳ nghỉ Tết',
                source_dest: 'Thủ tướng Chính phủ',
                issued_date: '2026-01-28',
                status: 'processed',
                notes: 'Lưu văn thư, phổ biến toàn cơ quan',
                file_url: null
            },
            {
                type: 'incoming',
                document_number: '45/CV-BTC',
                title: 'Công văn hướng dẫn quyết toán ngân sách nhà nước năm 2025',
                source_dest: 'Bộ Tài Chính',
                issued_date: '2026-01-10',
                status: 'processed',
                notes: 'Chuyển kế toán trưởng',
                file_url: null
            },

            // OUTGOING DOCUMENTS
            {
                type: 'outgoing',
                document_number: '05/BC-UBND',
                title: 'Báo cáo tình hình kinh tế - xã hội tháng 01 năm 2026',
                source_dest: 'UBND Tỉnh',
                issued_date: '2026-01-29',
                status: 'processed',
                notes: 'Đã gửi qua hệ thống điều hành',
                file_url: null
            },
            {
                type: 'outgoing',
                document_number: '02/TTr-VP',
                title: 'Tờ trình về việc mua sắm văn phòng phẩm quý I/2026',
                source_dest: 'Lãnh đạo UBND',
                issued_date: '2026-01-22',
                status: 'pending',
                notes: 'Chờ phê duyệt kinh phí',
                file_url: null
            },
            {
                type: 'outgoing',
                document_number: '18/GM-UBND',
                title: 'Giấy mời họp giao ban công tác tháng 02/2026',
                source_dest: 'Các phòng ban chuyên môn',
                issued_date: '2026-01-28',
                status: 'processed',
                notes: 'Họp vào 8h00 ngày 02/02/2026',
                file_url: null
            },
            {
                type: 'outgoing',
                document_number: '09/CV-UBND',
                title: 'Công văn trả lời kiến nghị của cử tri phường X',
                source_dest: 'UBND Phường X',
                issued_date: '2026-01-26',
                status: 'processed',
                notes: 'Đã gửi bưu điện',
                file_url: null
            },
            {
                type: 'outgoing',
                document_number: '01/QD-UBND',
                title: 'Quyết định thành lập ban chỉ đạo chuyển đổi số cấp xã',
                source_dest: 'Nội bộ',
                issued_date: '2026-01-05',
                status: 'processed',
                notes: 'Lưu VT',
                file_url: null
            }
        ];

        for (const doc of documents) {
            await client.query(
                `INSERT INTO documents (type, document_number, title, source_dest, issued_date, status, notes, file_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [doc.type, doc.document_number, doc.title, doc.source_dest, doc.issued_date, doc.status, doc.notes, doc.file_url]
            );
        }

        await client.query('COMMIT');
        console.log(`Successfully seeded ${documents.length} documents!`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding data:', error);
    } finally {
        client.release();
        process.exit();
    }
}

seedDocuments();
