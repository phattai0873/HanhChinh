/**
 * Format date to string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (DD/MM/YYYY, etc.)
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year);
};

/**
 * Format time to string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time (HH:mm:ss)
 */
export const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
};

/**
 * Check if user has specific role
 * @param {object} user - User object
 * @param {string|array} roles - Role(s) to check
 * @returns {boolean} True if user has role
 */
export const hasRole = (user, roles) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
};

/**
 * Check if user has permission
 * @param {object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (user, permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
};

/**
 * Truncate string to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 50) => {
    if (!text) return '';
    return text.length > length ? `${text.substring(0, length)}...` : text;
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Capitalize first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Check if phone is valid
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if phone is valid
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9\-\+]{10,}$/;
    return phoneRegex.test(phone);
};

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file
 * @param {Array} columns - Array of {header, key} objects
 * @param {string} reportTitle - Title to display at the top of the report
 */
export const exportToExcel = async (data, fileName, columns, reportTitle = 'BÁO CÁO HỆ THỐNG') => {
    try {
        const { utils, writeFile } = await import('xlsx');

        // 1. Prepare worksheet data starting with Title
        const wsData = [
            [reportTitle.toUpperCase()],
            [`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`],
            [`Đơn vị: UBND PHƯỜNG/XÃ CAO LÃNH`],
            [], // Empty row
            columns.map(col => col.header) // Headers
        ];

        // 2. Add data rows
        data.forEach(item => {
            wsData.push(columns.map(col => item[col.key] !== undefined ? item[col.key] : ''));
        });

        // 3. Create worksheet
        const ws = utils.aoa_to_sheet(wsData);

        // 4. Merge title rows (Optional, but looks "beautiful")
        const merge = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }, // Merge title across all columns
            { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: columns.length - 1 } }
        ];
        ws['!merges'] = merge;

        // 5. Column widths (estimation for "beauty")
        const wscols = columns.map(col => {
            // Find max length in this column
            const maxLen = data.reduce((max, item) => {
                const len = String(item[col.key] || '').length;
                return len > max ? len : max;
            }, col.header.length);
            return { wch: Math.min(maxLen + 5, 50) }; // cap at 50 chars
        });
        ws['!cols'] = wscols;

        // 6. Create workbook and save
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Báo cáo");

        writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error("Excel export failed:", error);
        // Fallback to basic CSV if Excel failing
        exportToCSV(data, fileName, columns);
    }
};

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file
 * @param {Array} columns - Array of {header, key} objects
 */
export const exportToCSV = (data, fileName, columns) => {
    if (!data || !data.length) return;

    const csvRows = [];

    // Add headers
    csvRows.push(columns.map(col => col.header).join(','));

    // Add data rows
    for (const item of data) {
        const values = columns.map(col => {
            const val = item[col.key] !== undefined ? item[col.key] : '';
            // Escape double quotes and wrap in quotes
            const escaped = String(val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    // Create blob with UTF-8 BOM for Excel compatibility
    const csvContent = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
