import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authAPI } from "../../services/api";

import { toast } from 'react-toastify';
export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        idNumber: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        ward: "",
        district: "",
        city: "",
        agreeTerms: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (!formData.agreeTerms) {
            setError("Vui lòng đồng ý với điều khoản sử dụng!");
            return;
        }

        setLoading(true);

        try {
            // Call backend API
            const response = await authAPI.register({
                username: formData.email, // Use email as username
                password: formData.password,
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                id_number: formData.idNumber,
                date_of_birth: formData.dateOfBirth,
                gender: formData.gender,
                address: formData.address,
                ward: formData.ward,
                district: formData.district,
                city: formData.city
            });

            // Save token and user info
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));

            toast.success("Đăng ký thành công!");
            setTimeout(() => {
                navigate("/");
            }, 1200);
        } catch (err) {
            console.error("Register error:", err);
            setError(err.response?.data?.error || "Đăng ký thất bại. Vui lòng thử lại!");
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
                                Tham gia ngay hôm nay
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">Trải nghiệm dịch vụ hành chính hiện đại</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                ✓
                            </div>
                            <p className="text-gray-700">Miễn phí đăng ký và sử dụng</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                ✓
                            </div>
                            <p className="text-gray-700">Theo dõi hồ sơ 24/7</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                ✓
                            </div>
                            <p className="text-gray-700">Nhận thông báo qua email & SMS</p>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                ✓
                            </div>
                            <p className="text-gray-700">Hỗ trợ 24/7</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-h-[90vh] overflow-y-auto">
                    <div className="mb-8 sticky top-0 bg-white pb-4 z-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Đăng ký tài khoản</h2>
                        <p className="text-gray-600">Tạo tài khoản để sử dụng dịch vụ</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Thông tin cá nhân */}
                        <div className="border-b pb-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin cá nhân</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Nguyễn Văn A"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            CMND/CCCD <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            pattern="[0-9]{12}"
                                            minLength="12"
                                            maxLength="12"
                                            title="Vui lòng nhập đúng 12 số CCCD/CMND"
                                            value={formData.idNumber}
                                            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value.replace(/\D/g, '') })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="001234567890"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Ngày sinh <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Giới tính <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        disabled={loading}
                                    >
                                        <option value="">-- Chọn giới tính --</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin liên hệ */}
                        <div className="border-b pb-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin liên hệ</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
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
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        pattern="[0-9]{10}"
                                        minLength="10"
                                        maxLength="10"
                                        title="Vui lòng nhập đúng 10 số điện thoại"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="0123456789"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="border-b pb-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Địa chỉ thường trú</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Địa chỉ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Số nhà, tên đường"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phường/Xã <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={formData.ward}
                                            onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            disabled={loading}
                                        >
                                            <option value="">-- Chọn phường/xã --</option>
                                            <option value="Phường 1">Phường 1</option>
                                            <option value="Phường 2">Phường 2</option>
                                            <option value="Phường 3">Phường 3</option>
                                            <option value="Phường 4">Phường 4</option>
                                            <option value="Phường 6">Phường 6</option>
                                            <option value="Phường 11">Phường 11</option>
                                            <option value="Phường Mỹ Trà">Phường Mỹ Trà</option>
                                            <option value="Phường Mỹ Ngãi">Phường Mỹ Ngãi</option>
                                            <option value="Phường Cao Lãnh">Phường Cao Lãnh</option>
                                        </select>
                                    </div>


                                    {/*    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Quận/Huyện <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="Quận 1"
                                            disabled={loading}
                                        />
                                    </div> */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tỉnh/Thành phố <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="TP. HCM"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Mật khẩu */}
                        <div className="border-b pb-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin đăng nhập</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength="6"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Tối thiểu 6 ký tự"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="Nhập lại mật khẩu"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                checked={formData.agreeTerms}
                                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded mt-1"
                                disabled={loading}
                            />
                            <label className="ml-2 text-sm text-gray-600">
                                Tôi đồng ý với{" "}
                                <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Điều khoản sử dụng
                                </Link>
                                {" "}và{" "}
                                <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Chính sách bảo mật
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all hover:-translate-y-0.5 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>

                        <div className="text-center">
                            <p className="text-gray-600">
                                Đã có tài khoản?{" "}
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                                    Đăng nhập ngay
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
