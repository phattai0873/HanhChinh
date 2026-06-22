-- Thêm trường citizen_id vào bảng users để liên kết với bảng citizens
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS citizen_id INTEGER REFERENCES citizens(id) ON DELETE SET NULL;

-- Tạo index cho citizen_id
CREATE INDEX IF NOT EXISTS idx_users_citizen_id ON users(citizen_id);

-- Comment để giải thích
COMMENT ON COLUMN users.citizen_id IS 'ID của công dân trong bảng citizens (nếu user là citizen)';
