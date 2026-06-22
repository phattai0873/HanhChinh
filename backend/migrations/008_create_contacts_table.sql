-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, replied, spam
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscribe to notifications using triggers? Not strictly necessary for MVP but good to have.
-- For now, just indexes.
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Add comments
COMMENT ON TABLE contacts IS 'Lưu trữ thông tin liên hệ gửi từ người dùng';
COMMENT ON COLUMN contacts.status IS 'Trạng thái xử lý: pending (chờ xử lý), replied (đã trả lời), spam';
