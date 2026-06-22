-- Hệ thống quản lý hành chính điện tử cấp phường/xã
-- Database Schema

-- 1. Bảng người dùng
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng loại hồ sơ
CREATE TABLE IF NOT EXISTS file_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    required_documents TEXT,
    processing_time INTEGER, -- số ngày xử lý
    fee DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng hồ sơ
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    file_number VARCHAR(100) UNIQUE NOT NULL,
    file_type_id INTEGER REFERENCES file_types(id),
    citizen_id INTEGER REFERENCES users(id),
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(20),
    citizen_email VARCHAR(255),
    citizen_address TEXT,
    citizen_id_number VARCHAR(20),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, received, processing, completed, rejected
    receive_method VARCHAR(50), -- online, offline
    receive_date TIMESTAMP,
    assigned_to INTEGER REFERENCES users(id),
    assigned_date TIMESTAMP,
    processing_note TEXT,
    result TEXT,
    completed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng tài liệu đính kèm hồ sơ
CREATE TABLE IF NOT EXISTS file_attachments (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng văn bản đến
CREATE TABLE IF NOT EXISTS incoming_documents (
    id SERIAL PRIMARY KEY,
    document_number VARCHAR(100) UNIQUE NOT NULL,
    document_date DATE NOT NULL,
    sender VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    document_type VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'normal', -- urgent, normal, low
    content TEXT,
    received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng văn bản đi
CREATE TABLE IF NOT EXISTS outgoing_documents (
    id SERIAL PRIMARY KEY,
    document_number VARCHAR(100) UNIQUE NOT NULL,
    document_date DATE NOT NULL,
    receiver VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    document_type VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'normal',
    content TEXT,
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft', -- draft, pending_approval, approved, sent
    sent_date TIMESTAMP,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng tài liệu đính kèm văn bản
CREATE TABLE IF NOT EXISTS document_attachments (
    id SERIAL PRIMARY KEY,
    document_id INTEGER,
    document_type VARCHAR(50), -- incoming, outgoing
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bảng phản ánh/kiến nghị
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    citizen_id INTEGER REFERENCES users(id),
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(20),
    citizen_email VARCHAR(255),
    citizen_address TEXT,
    category VARCHAR(100), -- complaint, suggestion, question
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, resolved, rejected
    priority VARCHAR(50) DEFAULT 'normal',
    assigned_to INTEGER REFERENCES users(id),
    response TEXT,
    response_date TIMESTAMP,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bảng tài liệu đính kèm phản ánh
CREATE TABLE IF NOT EXISTS feedback_attachments (
    id SERIAL PRIMARY KEY,
    feedback_id INTEGER REFERENCES feedbacks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Bảng lịch sử xử lý
CREATE TABLE IF NOT EXISTS processing_history (
    id SERIAL PRIMARY KEY,
    record_type VARCHAR(50) NOT NULL, -- file, document, feedback
    record_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    note TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Bảng thông báo
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50), -- info, warning, success, error
    is_read BOOLEAN DEFAULT false,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_citizen_id ON files(citizen_id);
CREATE INDEX idx_files_assigned_to ON files(assigned_to);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_citizen_id ON feedbacks(citizen_id);
CREATE INDEX idx_incoming_docs_status ON incoming_documents(status);
CREATE INDEX idx_outgoing_docs_status ON outgoing_documents(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, full_name, email, role, department, position)
VALUES ('admin', '$2a$10$rZ5YvYvYvYvYvYvYvYvYvOeKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'Quản trị viên', 'admin@phuong.gov.vn', 'admin', 'Văn phòng UBND', 'Quản trị hệ thống')
ON CONFLICT (username) DO NOTHING;

-- Insert sample file types
INSERT INTO file_types (code, name, description, processing_time, fee) VALUES
('KS_TAMTRU', 'Đăng ký tạm trú', 'Thủ tục đăng ký tạm trú tại địa phương', 3, 0),
('KS_TAMVANG', 'Đăng ký tạm vắng', 'Thủ tục đăng ký tạm vắng', 2, 0),
('HKTT', 'Đăng ký hộ khẩu thường trú', 'Thủ tục đăng ký hộ khẩu thường trú', 7, 0),
('GIAYPHEP_XAYDUNG', 'Giấy phép xây dựng', 'Cấp giấy phép xây dựng nhà ở', 15, 500000),
('XN_THUNHAP', 'Xác nhận thu nhập', 'Xác nhận thu nhập cho người dân', 3, 0),
('XN_CHUA_KET_HON', 'Xác nhận chưa kết hôn', 'Xác nhận tình trạng hôn nhân', 2, 0)
ON CONFLICT (code) DO NOTHING;
