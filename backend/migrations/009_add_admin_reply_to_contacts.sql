-- Add admin reply fields to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS admin_reply TEXT,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS replied_by INTEGER REFERENCES users(id);

-- Add index for replied_by foreign key
CREATE INDEX IF NOT EXISTS idx_contacts_replied_by ON contacts(replied_by);

-- Add comments
COMMENT ON COLUMN contacts.admin_reply IS 'Phản hồi của admin cho liên hệ';
COMMENT ON COLUMN contacts.replied_at IS 'Thời gian admin gửi phản hồi';
COMMENT ON COLUMN contacts.replied_by IS 'ID của admin đã phản hồi';
