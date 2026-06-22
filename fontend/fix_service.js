const fs = require('fs');

const file = 'src/pages/ServiceDetail.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<input
                                                            type={field.type}
                                                            required={field.required}
                                                            value={formData[field.name] || ""}
                                                            onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                                            placeholder={field.placeholder}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm bg-slate-50"
                                                        />`;

const replacement = `<input
                                                            type={field.type}
                                                            required={field.required}
                                                            value={formData[field.name] || ""}
                                                            onChange={e => {
                                                                let val = e.target.value;
                                                                if (field.name === 'phone' || field.name === 'idNumber' || field.name === 'maleId' || field.name === 'femaleId' || field.name === 'oldIdNumber' || (field.label && (field.label.toLowerCase().includes('cccd') || field.label.toLowerCase().includes('cmnd') || field.label.toLowerCase().includes('điện thoại')))) {
                                                                    val = val.replace(/\\D/g, '');
                                                                }
                                                                setFormData({ ...formData, [field.name]: val });
                                                            }}
                                                            placeholder={field.placeholder}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm bg-slate-50"
                                                            {...((field.name === 'phone' || (field.label && field.label.toLowerCase().includes('điện thoại'))) && {
                                                                pattern: '[0-9]{10}', 
                                                                maxLength: 10, 
                                                                minLength: 10, 
                                                                title: 'Vui lòng nhập đúng 10 số điện thoại'
                                                            })}
                                                            {...((field.name === 'idNumber' || field.name === 'maleId' || field.name === 'femaleId' || field.name === 'oldIdNumber' || (field.label && (field.label.toLowerCase().includes('cccd') || field.label.toLowerCase().includes('cmnd')))) && {
                                                                pattern: '[0-9]{12}', 
                                                                maxLength: 12, 
                                                                minLength: 12, 
                                                                title: 'Vui lòng nhập đúng 12 số CCCD/CMND'
                                                            })}
                                                        />`;

if(content.includes(target)){
    fs.writeFileSync(file, content.replace(target, replacement), 'utf8');
    console.log('Success!');
} else {
    console.log('Target not found!');
}
