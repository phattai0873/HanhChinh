-- Cập nhật dữ liệu từ form_data vào các cột mới cho các hồ sơ đã tồn tại
UPDATE applications
SET 
    citizen_phone = COALESCE(
        form_data->>'phone',
        form_data->>'soDienThoai'
    ),
    citizen_email = COALESCE(
        form_data->>'email',
        form_data->>'soEmail'
    ),
    citizen_id_number = COALESCE(
        form_data->>'idNumber',
        form_data->>'soCMND',
        form_data->>'soCCCD'
    ),
    citizen_address = COALESCE(
        form_data->>'address',
        form_data->>'diaChi',
        form_data->>'currentAddress'
    )
WHERE 
    (citizen_phone IS NULL OR citizen_email IS NULL OR citizen_id_number IS NULL OR citizen_address IS NULL)
    AND form_data IS NOT NULL;

-- Hiển thị kết quả
SELECT COUNT(*) as updated_count FROM applications 
WHERE citizen_phone IS NOT NULL OR citizen_email IS NOT NULL;
