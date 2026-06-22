const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (!content.includes('alert(')) return;

    // Detect if we need to add toast import
    let hasToastImport = content.includes('import { toast } from') || content.includes('import {ToastContainer, toast}') || content.includes('import { ToastContainer, toast } from');

    if (!hasToastImport) {
        // Add import after the last import statement or at the top
        const importMatch = content.match(/import .*;[\r\n]*/g);
        if (importMatch) {
            const lastImportPos = content.lastIndexOf(importMatch[importMatch.length - 1]);
            const insertPos = lastImportPos + importMatch[importMatch.length - 1].length;
            content = content.slice(0, insertPos) + "import { toast } from 'react-toastify';\n" + content.slice(insertPos);
        } else {
            content = "import { toast } from 'react-toastify';\n" + content;
        }
    }

    // Replace alerts with toast.success or toast.error
    content = content.replace(/alert\((.*?)\);/g, (match, p1) => {
        // Guess success or error based on text
        const lowerText = p1.toLowerCase();
        if (lowerText.includes('thành công') || lowerText.includes('success')) {
            return `toast.success(${p1});`;
        } else if (lowerText.includes('lỗi') || lowerText.includes('thất bại') || lowerText.includes('không thể') || lowerText.includes('không hỗ trợ') || lowerText.includes('bắt buộc') || lowerText.includes('vui lòng đăng nhập') || lowerText.includes('không lấy được')) {
            return `toast.error(${p1});`;
        } else {
            // Default to info
            return `toast.info(${p1});`;
        }
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Replaced alerts in ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

traverseDir(srcDir);
console.log('Script execution complete.');
