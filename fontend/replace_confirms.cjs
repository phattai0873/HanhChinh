const fs = require('fs');
const path = require('path');

const filesToProcess = [
    'src/pages/documents/Outgoing.jsx',
    'src/pages/documents/Incoming.jsx',
    'src/pages/admin/Settings.jsx',
    'src/pages/admin/Schedules.jsx',
    'src/pages/admin/News.jsx'
];

filesToProcess.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Add import if needed
    if (!content.includes('import Swal from')) {
        const importMatch = content.match(/import .*;[\r\n]*/g);
        if (importMatch) {
            const lastImportPos = content.lastIndexOf(importMatch[importMatch.length - 1]);
            const insertPos = lastImportPos + importMatch[importMatch.length - 1].length;
            content = content.slice(0, insertPos) + "import Swal from 'sweetalert2';\n" + content.slice(insertPos);
        } else {
            content = "import Swal from 'sweetalert2';\n" + content;
        }
    }

    // Replace: if (window.confirm('...')) {
    content = content.replace(/if\s*\(\s*window\.confirm\('([^']+)'\)\s*\)\s*\{/g, (match, text) => {
        return `const result = await Swal.fire({
            title: 'Xác nhận',
            text: '${text}',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });
        if (result.isConfirmed) {`;
    });

    // Replace: if (!window.confirm('...')) return;
    content = content.replace(/if\s*\(\s*!window\.confirm\('([^']+)'\)\s*\)\s*return;/g, (match, text) => {
        return `const result = await Swal.fire({
            title: 'Xác nhận',
            text: '${text}',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });
        if (!result.isConfirmed) return;`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Replaced confirm in ${file}`);
    }
});

console.log('Done confirming replacements.');
