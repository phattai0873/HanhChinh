-- Thêm các cột thông tin công dân vào bảng applications
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS citizen_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS citizen_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS citizen_id_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS citizen_address TEXT;

-- Tạo index cho các cột mới
CREATE INDEX IF NOT EXISTS idx_applications_citizen_phone ON applications(citizen_phone);
CREATE INDEX IF NOT EXISTS idx_applications_citizen_email ON applications(citizen_email);
