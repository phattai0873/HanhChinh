-- Bảng thông tin công dân/người dân
CREATE TABLE IF NOT EXISTS citizens (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    id_number VARCHAR(20) UNIQUE, -- CMND/CCCD
    date_of_birth DATE,
    gender VARCHAR(10), -- male, female, other
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    ward VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    household_head VARCHAR(255), -- Chủ hộ
    household_number VARCHAR(50), -- Số hộ khẩu
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for better performance
CREATE INDEX idx_citizens_id_number ON citizens(id_number);
CREATE INDEX idx_citizens_phone ON citizens(phone);
CREATE INDEX idx_citizens_email ON citizens(email);

-- Insert some sample data
INSERT INTO citizens (full_name, id_number, date_of_birth, gender, phone, email, address, ward, district, city, household_head, household_number) VALUES
('Nguyễn Văn An', '001234567890', '1990-05-15', 'male', '0912345678', 'nguyenvanan@gmail.com', '123 Đường ABC', 'Phường 1', 'Quận 1', 'TP. HCM', 'Nguyễn Văn An', 'HK001'),
('Trần Thị Bích', '002345678901', '1985-08-20', 'female', '0923456789', 'tranthibich@gmail.com', '456 Đường XYZ', 'Phường 2', 'Quận 1', 'TP. HCM', 'Trần Văn Cường', 'HK002'),
('Lê Minh Tuấn', '003456789012', '1992-12-10', 'male', '0934567890', 'leminhtuan@gmail.com', '789 Đường DEF', 'Phường 3', 'Quận 1', 'TP. HCM', 'Lê Minh Tuấn', 'HK003'),
('Phạm Thu Hà', '004567890123', '1988-03-25', 'female', '0945678901', 'phamthuha@gmail.com', '321 Đường GHI', 'Phường 1', 'Quận 1', 'TP. HCM', 'Phạm Văn Nam', 'HK004'),
('Hoàng Đức Long', '005678901234', '1995-07-30', 'male', '0956789012', 'hoangduclong@gmail.com', '654 Đường JKL', 'Phường 2', 'Quận 1', 'TP. HCM', 'Hoàng Đức Long', 'HK005')
ON CONFLICT (id_number) DO NOTHING;
