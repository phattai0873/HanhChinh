const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Mẫu 1: onChange={(e) => { ... if (/^\d*$/.test(val)) setFormData... }}
    // The previous state bindings may be slightly different so we update with a regex
    content = content.replace(/onChange=\{\(e\) => \{\s*const val = e\.target\.value;\s*if \(\/^\d\*\$\/\.test\(val\)\) \{\s*set([A-Za-z0-9]+)\(\{ \.\.\.([A-Za-z0-9]+), (phone|id_number|idNumber): val \}\);\s*\}\s*\}\}/g, 
        (match, setter, stateName, fieldName) => {
            return `onChange={(e) => set${setter}({ ...${stateName}, ${fieldName}: e.target.value.replace(/\\D/g, '') })}`;
        });

    // Thay thế lại trường hợp setFormData trong Contact.jsx
    content = content.replace(/onChange=\{\(e\) => \{\s*if \(\/^\d\*\$\/\.test\(e\.target\.value\)\) setFormData\(\{ \.\.\.formData, phone: e\.target\.value \}\);\s*\} \}/g, 
        'onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\\D/g, \'\') })}');

    fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('src/pages/auth/Register.jsx');
fixFile('src/pages/admin/Users.jsx');
fixFile('src/pages/admin/Staff.jsx');
fixFile('src/pages/Contact.jsx');
console.log('Script finish');
