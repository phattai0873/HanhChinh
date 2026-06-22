import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
export default function AdminLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [openMenus, setOpenMenus] = useState({});

    useEffect(() => {
        // Check if user is logged in
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);

        // Check if user is admin, staff or leader
        if (!['admin', 'staff', 'leader', 'super_admin'].includes(userData.role)) {
            toast.info('Bạn không có quyền truy cập trang này!');
            navigate('/');
            return;
        }
    }, [navigate]);

    const handleLogout = () => {
        Swal.fire({
            title: 'Xác nhận đăng xuất',
            text: 'Bạn có chắc chắn muốn đăng xuất?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                // Clear all session data
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                sessionStorage.clear();

                // Navigate based on user role
                const isAdminOrStaff = user && (user.role === 'admin' || user.role === 'staff' || user.role === 'leader');
                navigate(isAdminOrStaff ? '/admin/login' : '/login', { replace: true });
            }
        });
    };

    const toggleMenu = (title) => {
        setOpenMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    if (!user) {
        return null;
    }

    const allMenuItems = [
        {
            icon: '📊',
            title: 'Tổng quan',
            path: '/dashboard',
            roles: ['admin', 'leader', 'staff']
        },
        {
            icon: '📋',
            title: 'Quản lý hồ sơ',
            roles: ['admin', 'leader', 'staff'],
            children: [
                { title: '📋 Tất cả hồ sơ', path: '/admin/applications' },
                { title: '👶 Hộ tịch & Dân sự', path: '/admin/applications/ho-tich' },
                { title: '🏘️ Cư trú & Nhân khẩu', path: '/admin/applications/cu-tru' },
                { title: '🏪 Kinh doanh', path: '/admin/applications/kinh-doanh' },
                { title: '🏗️ Xây dựng & Đất đai', path: '/admin/applications/xay-dung' },
                { title: '⚖️ Tư pháp', path: '/admin/applications/tu-phap' },
            ]
        },
        {
            icon: '📁',
            title: 'Quản lý văn bản',
            path: '/admin/documents',
            roles: ['admin', 'leader', 'staff']
        },
        {
            icon: '👥',
            title: 'Quản lý tài khoản',
            roles: ['admin', 'leader'],
            children: [
                { title: 'Người dùng', path: '/admin/users' },
                { title: 'Cán bộ', path: '/admin/staff' }
            ]
        },
        {
            icon: '💬',
            title: 'Quản lý phản ánh',
            path: '/admin/feedbacks',
            roles: ['admin', 'leader', 'staff']
        },
        {
            icon: '📞',
            title: 'Quản lý liên hệ',
            path: '/admin/contacts',
            roles: ['admin', 'leader', 'staff']
        },
        {
            icon: '📰',
            title: 'Quản lý tin tức',
            path: '/admin/news',
            roles: ['admin', 'leader', 'staff']
        },
        {
            icon: '📅',
            title: 'Lịch phân công',
            path: '/admin/schedules',
            roles: ['admin', 'leader', 'staff']
        },
        {
            icon: '⚙️',
            title: 'Cài đặt',
            path: '/admin/settings',
            roles: ['admin']
        },
    ];

    const menuItems = allMenuItems.filter(item =>
        item.roles && item.roles.includes(user.role)
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-700 text-white fixed top-0 bottom-0 shadow-2xl z-20 hidden lg:flex flex-col overflow-y-auto print:hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
                            🏛️
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                Hành Chính Công
                            </h1>
                            <p className="text-xs text-slate-400">Portal Quản lý</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map((item, index) => {
                            if (item.children) {
                                const isOpen = openMenus[item.title];
                                const isActive = item.children.some(child => location.pathname.startsWith(child.path));

                                return (
                                    <div key={index} className="mb-1">
                                        <button
                                            onClick={() => toggleMenu(item.title)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-slate-800/50 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xl transition-transform ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'}`}>{item.icon}</span>
                                                <span className="font-medium whitespace-nowrap">{item.title}</span>
                                            </div>
                                            <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                                        </button>

                                        {/* Dropdown Items */}
                                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                            <div className="pl-9 space-y-1">
                                                {item.children.map((child, cIndex) => {
                                                    const isChildActive = location.pathname === child.path;
                                                    return (
                                                        <Link
                                                            key={cIndex}
                                                            to={child.path}
                                                            className={`flex items-center py-2 px-3 rounded-lg text-sm transition-colors whitespace-nowrap ${isChildActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                                        >
                                                            {child.title}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <Link
                                        key={index}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{item.icon}</span>
                                        <span className="font-medium whitespace-nowrap">{item.title}</span>
                                    </Link>
                                );
                            }
                        })}
                    </nav>
                </div>


            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 flex flex-col min-h-screen print:ml-0 print:block">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 px-4 py-4 flex items-center justify-between print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {(() => {
                                for (const item of menuItems) {
                                    if (item.path && location.pathname.startsWith(item.path)) return item.title;
                                    if (item.children) {
                                        const child = item.children.find(c => location.pathname.startsWith(c.path));
                                        if (child) return `${item.title} - ${child.title}`;
                                    }
                                }
                                return 'Quản lý';
                            })()}
                        </h2>
                        <p className="text-sm text-slate-500">Xin chào, {user.full_name || user.username}!</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* <div className="relative">
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                🔔
                            </button>
                        </div> */}
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-semibold text-slate-700">{user.full_name || 'Admin'}</p>
                                <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 print:p-0 flex-1 flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}
