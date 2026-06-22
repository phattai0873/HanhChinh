-- ================================
-- HỆ THỐNG MỘT CỬA / HÀNH CHÍNH
-- PostgreSQL
-- ================================

-- 1. BẢNG NGƯỜI DÂN
CREATE TABLE citizens (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG TRẠNG THÁI DÙNG CHUNG
CREATE TABLE status (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50),
    name VARCHAR(100)
);

-- 3. BẢNG THỦ TỤC HÀNH CHÍNH
CREATE TABLE procedures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    processing_days INT,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. BẢNG PHÒNG BAN
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT
);

-- 5. BẢNG CÁN BỘ / NGƯỜI DÙNG HỆ THỐNG
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password_hash TEXT,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    department_id INT REFERENCES departments(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    password VARCHAR(255),
    role VARCHAR(50)
);

-- 6. BẢNG QUYỀN
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    description TEXT
);

-- 7. BẢNG GÁN QUYỀN NGƯỜI DÙNG
CREATE TABLE user_roles (
    user_id INT REFERENCES users(id),
    role_id INT REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- 8. BẢNG HỒ SƠ HÀNH CHÍNH
CREATE TABLE administrative_files (
    id SERIAL PRIMARY KEY,
    file_code VARCHAR(50),
    citizen_id INT REFERENCES citizens(id),
    procedure_id INT REFERENCES procedures(id),
    status_id INT REFERENCES status(id),
    assigned_to INT REFERENCES users(id),
    received_at TIMESTAMP(6),
    completed_at TIMESTAMP(6),
    note TEXT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 9. BẢNG ĐÍNH KÈM HỒ SƠ
CREATE TABLE file_attachments (
    id SERIAL PRIMARY KEY,
    file_id INT REFERENCES administrative_files(id),
    file_name TEXT,
    file_path TEXT,
    uploaded_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);



-- 11. BẢNG PHẢN ÁNH / KIẾN NGHỊ
CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    feedback_code VARCHAR(50),
    citizen_id INT REFERENCES citizens(id),
    title VARCHAR(255),
    content TEXT,
    status_id INT REFERENCES status(id),
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);



-- 13. BẢNG HỒ SƠ ĐIỆN TỬ / ĐƠN TRỰC TUYẾN
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    application_code VARCHAR(50),
    service_id INT,
    service_name VARCHAR(255),
    user_id INT REFERENCES users(id),
    form_data JSONB,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- 14. BẢNG VĂN BẢN / TÀI LIỆU
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    document_code VARCHAR(50),
    title VARCHAR(255),
    document_type VARCHAR(50),
    issued_date DATE,
    department_id INT REFERENCES departments(id),
    file_path TEXT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- GỢI Ý INDEX (KHUYẾN NGHỊ)
-- ================================
CREATE INDEX idx_file_code ON administrative_files(file_code);
CREATE INDEX idx_feedback_code ON feedbacks(feedback_code);
CREATE INDEX idx_application_code ON applications(application_code);
CREATE INDEX idx_citizen_email ON citizens(email);
CREATE INDEX idx_user_username ON users(username);
