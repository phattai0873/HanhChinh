-- Thêm cột updated_at nếu chưa có
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
