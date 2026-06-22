import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

export default function Header({ sidebarOpen, toggleSidebar, title }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn đăng xuất?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
                navigate("/login");
            }
        });
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-20 border-b border-gray-100 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {toggleSidebar && (
                    <button
                        onClick={toggleSidebar}
                        className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-md"
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                )}
                {title && <h2 className="text-lg font-bold text-gray-800 hidden sm:block">{title}</h2>}
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        {['admin', 'staff', 'leader', 'super_admin'].includes(user.role) && (
                            <Link
                                to="/dashboard"
                                className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 border border-indigo-100"
                            >
                                <span>Dashboard</span>
                                <span>📊</span>
                            </Link>
                        )}
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-800 leading-none">{user.full_name || user.username}</p>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">{user.role || 'Công dân'}</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                            🚪
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all">
                        Đăng nhập
                    </Link>
                )}
            </div>
        </header>
    );
}
