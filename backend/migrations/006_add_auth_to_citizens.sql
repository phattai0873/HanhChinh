-- Thêm các trường đăng nhập vào bảng citizens
ALTER TABLE citizens 
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Tạo index cho username
CREATE INDEX IF NOT EXISTS idx_citizens_username ON citizens(username);

-- Comment để giải thích
COMMENT ON COLUMN citizens.username IS 'Tên đăng nhập của công dân';
COMMENT ON COLUMN citizens.password_hash IS 'Mật khẩu đã mã hóa của công dân';
