import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Swal from 'sweetalert2';
import {
    Settings as SettingsIcon,
    Globe,
    Building2,
    ShieldCheck,
    Palette,
    Mail,
    Bell,
    Save,
    RefreshCcw,
    CheckCircle2,
    Info
} from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial settings with localStorage persistence
    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('app_configs');
        return savedSettings ? JSON.parse(savedSettings) : {
            // General
            appName: 'HỆ THỐNG HÀNH CHÍNH CÔNG',
            appVersion: '2.4.0',
            appDescription: 'Cổng thông tin tiếp nhận và trả kết quả hồ sơ hành chính công một cửa.',

            // Organization
            orgName: 'ỦY BAN NHÂN DÂN PHƯỜNG CAO LÃNH',
            orgAddress: 'Số 123, Đường Lý Thường Kiệt, Phường 1, TP Cao Lãnh, Đồng Tháp',
            orgPhone: '0277.3851.234',
            orgEmail: 'ubnd.caolanh@dongthap.gov.vn',
            orgWebsite: 'https://caolanh.dongthap.gov.vn',

            // System
            maxUploadSize: '50', // MB
            sessionTimeout: '60', // Minutes
            maintenanceMode: false,
            enableEmailNotifications: true,
            enableSystemLogs: true,

            // Appearance
            primaryColor: '#4f46e5',
            sidebarTheme: 'dark',
            compactMode: false
        };
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('app_configs', JSON.stringify(settings));
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    const resetToDefault = async () => {
        const result = await Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn khôi phục cài đặt gốc?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });
        if (result.isConfirmed) {
            localStorage.removeItem('app_configs');
            window.location.reload();
        }
    };

    const tabs = [
        { id: 'general', label: 'Cấu hình chung', icon: <Globe className="w-5 h-5" /> },
        { id: 'org', label: 'Thông tin đơn vị', icon: <Building2 className="w-5 h-5" /> },
        { id: 'system', label: 'Hệ thống', icon: <SettingsIcon className="w-5 h-5" /> },
        { id: 'appearance', label: 'Giao diện', icon: <Palette className="w-5 h-5" /> },
        { id: 'security', label: 'Bảo mật', icon: <ShieldCheck className="w-5 h-5" /> },
    ];

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                                <SettingsIcon className="w-6 h-6" />
                            </div>
                            Cài đặt hệ thống
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Tùy chỉnh các thông số vận hành và giao diện của Portal</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={resetToDefault}
                            className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Khôi phục mặc định
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>

                {saved && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="font-bold">Đã lưu cấu hình thành công!</div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Navigation Sidebar */}
                    <div className="w-full lg:w-72 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                                        : 'bg-white text-slate-500 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-indigo-100'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="ml-auto w-1.5 h-6 bg-white/40 rounded-full"></div>
                                )}
                            </button>
                        ))}

                        <div className="mt-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="p-2 bg-indigo-600 text-white rounded-lg w-fit mb-4">
                                    <Info className="w-4 h-4" />
                                </div>
                                <h3 className="font-black text-indigo-900 mb-1">Trợ giúp?</h3>
                                <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">Nếu bạn có thắc mắc về các thông số kỹ thuật, vui lòng liên hệ đội ngũ kỹ thuật.</p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl group-hover:bg-indigo-200 transition-colors"></div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
                            <form onSubmit={handleSave} className="space-y-10">
                                {activeTab === 'general' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="border-l-4 border-indigo-600 pl-6">
                                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Cấu hình chung</h2>
                                            <p className="text-sm text-slate-500 font-medium">Tên hiển thị và mô tả cơ bản của ứng dụng</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Tên ứng dụng</label>
                                                <input
                                                    type="text"
                                                    name="appName"
                                                    value={settings.appName}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Phiên bản</label>
                                                <input
                                                    type="text"
                                                    name="appVersion"
                                                    value={settings.appVersion}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Mô tả hệ thống</label>
                                                <textarea
                                                    name="appDescription"
                                                    rows="4"
                                                    value={settings.appDescription}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'org' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="border-l-4 border-indigo-600 pl-6">
                                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Thông tin đơn vị</h2>
                                            <p className="text-sm text-slate-500 font-medium">Dữ liệu này sẽ hiển thị trên phôi in ấn và thông tin liên hệ</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Tên đơn vị chủ quản</label>
                                                <input
                                                    type="text"
                                                    name="orgName"
                                                    value={settings.orgName}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner text-lg"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Địa chỉ trụ sở</label>
                                                <input
                                                    type="text"
                                                    name="orgAddress"
                                                    value={settings.orgAddress}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Số điện thoại hỗ trợ</label>
                                                <input
                                                    type="text"
                                                    name="orgPhone"
                                                    value={settings.orgPhone}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Email liên hệ</label>
                                                <input
                                                    type="email"
                                                    name="orgEmail"
                                                    value={settings.orgEmail}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'system' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="border-l-4 border-indigo-600 pl-6">
                                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Tham số hệ thống</h2>
                                            <p className="text-sm text-slate-500 font-medium">Giới hạn tài nguyên và các chế độ vận hành</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Dung lượng tải lên tối đa (MB)</label>
                                                <input
                                                    type="number"
                                                    name="maxUploadSize"
                                                    value={settings.maxUploadSize}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Thời gian chờ phiên (phút)</label>
                                                <input
                                                    type="number"
                                                    name="sessionTimeout"
                                                    value={settings.sessionTimeout}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-6">
                                            <label className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group">
                                                <div className="flex-1">
                                                    <h3 className="font-black text-slate-800">Chế độ bảo trì</h3>
                                                    <p className="text-xs text-slate-500 font-semibold group-hover:text-slate-600">Khi bật, công dân sẽ không thể truy cập các tính năng nộp hồ sơ.</p>
                                                </div>
                                                <div className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="maintenanceMode"
                                                        checked={settings.maintenanceMode}
                                                        onChange={handleChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group">
                                                <div className="flex-1">
                                                    <h3 className="font-black text-slate-800">Thông báo qua Email</h3>
                                                    <p className="text-xs text-slate-500 font-semibold group-hover:text-slate-600">Tự động gửi email cho cán bộ và công dân khi có thay đổi trạng thái hồ sơ.</p>
                                                </div>
                                                <div className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="enableEmailNotifications"
                                                        checked={settings.enableEmailNotifications}
                                                        onChange={handleChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'appearance' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="border-l-4 border-indigo-600 pl-6">
                                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Tùy chỉnh giao diện</h2>
                                            <p className="text-sm text-slate-500 font-medium">Thay đổi tông màu chủ đạo và bố cục trang quản trị</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Màu chủ đạo (Indigo/Blue)</label>
                                                <div className="flex gap-4 items-center">
                                                    <input
                                                        type="color"
                                                        name="primaryColor"
                                                        value={settings.primaryColor}
                                                        onChange={handleChange}
                                                        className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer p-1"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={settings.primaryColor}
                                                        readOnly
                                                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-600"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 ml-1">Chủ đề Sidebar</label>
                                                <select
                                                    name="sidebarTheme"
                                                    value={settings.sidebarTheme}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 shadow-inner appearance-none"
                                                >
                                                    <option value="dark">Tối (Dark) - Sang trọng</option>
                                                    <option value="light">Sáng (Light) - Tinh khiết</option>
                                                    <option value="colored">Màu sắc (Indigo)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="p-8 bg-red-50 border border-red-100 rounded-[2.5rem] relative overflow-hidden">
                                            <div className="relative z-10 flex items-start gap-6">
                                                <div className="w-14 h-14 bg-white text-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 shrink-0">
                                                    <ShieldCheck className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-red-900 mb-2 uppercase tracking-wide">Chế độ bảo mật cao</h3>
                                                    <p className="text-sm text-red-700 font-medium leading-relaxed max-w-xl">
                                                        Hệ thống hiện đang hoạt động trong mạng nội bộ an toàn. Các thay đổi về quyền truy cập nâng cao yêu cầu quyền <span className="underline decoration-2">Super Admin</span>.
                                                    </p>
                                                    <button type="button" className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                                                        Xác thực lại danh tính
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <div>
                                                    <h4 className="font-bold text-slate-800">Bắt buộc đổi mật khẩu theo định kỳ</h4>
                                                    <p className="text-xs text-slate-500 font-medium italic">Yêu cầu người dùng đổi mật khẩu mỗi 90 ngày.</p>
                                                </div>
                                                <div className="w-12 h-6 bg-indigo-600/10 rounded-full flex items-center px-1">
                                                    <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                <div>
                                                    <h4 className="font-bold text-slate-800">Xác thực 2 yếu tố (2FA)</h4>
                                                    <p className="text-xs text-slate-500 font-medium italic">Tính năng này đang được phát triển...</p>
                                                </div>
                                                <div className="w-12 h-6 bg-slate-200 rounded-full flex items-center px-1">
                                                    <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="mt-8 flex justify-center items-center gap-6 text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Hệ thống đang trực tuyến</span>
                            </div>
                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                            <span className="text-[10px] font-bold">Portal Version v{settings.appVersion}</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
