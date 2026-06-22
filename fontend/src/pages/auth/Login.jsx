import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authAPI } from "../../services/api";

import { toast } from 'react-toastify';
export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Call backend API
            const response = await authAPI.login(formData.email, formData.password);

            // Save token and user info
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));

            toast.success("Đăng nhập thành công!");
            setTimeout(() => {
                navigate("/");
            }, 1200);
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <div className="hidden lg:block">
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl">
                            🏛️
                        </div>
                        <h1 className="text-4xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Hành chính điện tử
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">Phường Mỹ Trà </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                ⚡
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-1">Nhanh chóng</h3>
                                <p className="text-sm text-gray-600">Xử lý hồ sơ trong 1-5 ngày làm việc</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                🔒
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-1">An toàn</h3>
                                <p className="text-sm text-gray-600">Bảo mật thông tin tuyệt đối</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                💼
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-1">Tiện lợi</h3>
                                <p className="text-sm text-gray-600">Thực hiện mọi lúc mọi nơi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
                        <p className="text-gray-600">Chào mừng bạn trở lại!</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="email@example.com"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" disabled={loading} />
                                <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all hover:-translate-y-0.5 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Hoặc</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-gray-600">
                                Chưa có tài khoản?{" "}
                                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>

                        <div className="text-center">
                            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
                                ← Quay lại trang chủ
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
