
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { toast } from 'react-toastify';

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Call login from AuthContext
            const response = await login(formData.username, formData.password);

            // Check if user has admin privileges
            if (response.user.role !== 'admin' && response.user.role !== 'super_admin') {
                // If not admin, maybe warn but we are already logged in locally.
                // You might want to logout immediately if you want to restrict access STRICTLY to admin only here.
                // For now, let's allow it but redirect to dashboard where checks happen.
            }

            toast.success("Đăng nhập thành công!");
            setTimeout(() => {
                navigate("/dashboard");
            }, 1200);
        } catch (err) {
            console.error("Login error:", err);
            // Handle error message properly
            const msg = err.response?.data?.message || err.response?.data?.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-100 flex items-center justify-center p-4">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden bg-white">

                {/* Left Side - Admin Branding */}
                <div className="hidden lg:flex flex-col justify-center items-center bg-slate-900 text-white p-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 opacity-50"></div>
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                    <div className="relative z-10 text-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl border border-slate-700">
                            🛡️
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Quản Trị Hệ Thống</h1>
                        <p className="text-slate-400 mb-8">Phường Mỹ Trà</p>

                        <div className="space-y-6 text-left max-w-xs mx-auto">
                            <div className="flex items-center gap-4 text-slate-300">
                                <span className="p-2 bg-slate-800 rounded-lg">📊</span>
                                <div>
                                    <p className="font-medium text-white">Thống kê & Báo cáo</p>
                                    <p className="text-xs text-slate-500">Xem dữ liệu thời gian thực</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-slate-300">
                                <span className="p-2 bg-slate-800 rounded-lg">👥</span>
                                <div>
                                    <p className="font-medium text-white">Quản lý người dùng</p>
                                    <p className="text-xs text-slate-500">Phân quyền và kiểm soát</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-slate-300">
                                <span className="p-2 bg-slate-800 rounded-lg">⚙️</span>
                                <div>
                                    <p className="font-medium text-white">Cấu hình hệ thống</p>
                                    <p className="text-xs text-slate-500">Tùy chỉnh tham số vận hành</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập Admin</h2>
                        <p className="text-gray-500">Vui lòng nhập thông tin xác thực để tiếp tục.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                            <div className="flex">
                                <span className="text-red-500 mr-3">⚠️</span>
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tên đăng nhập / Email
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="admin@example.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-slate-800 border-gray-300 rounded focus:ring-slate-800" />
                                <span className="ml-2 text-sm text-gray-600">Ghi nhớ tôi</span>
                            </label>
                            {/* <a href="#" className="text-sm text-slate-600 hover:text-slate-800 hover:underline">
                                Quên mật khẩu?
                            </a> */}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 bg-slate-900 text-white rounded-lg font-semibold text-base shadow-lg hover:bg-black hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Đang xác thực...</span>
                                </div>
                            ) : (
                                'Truy cập trang quản trị'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-slate-800 transition-colors">
                            <span className="mr-2">←</span> Quay về trang chủ người dân
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
