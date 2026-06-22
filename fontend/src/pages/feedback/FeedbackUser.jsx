import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { feedbackAPI } from "../../services/api";
import Header from "../../components/layout/Header";

import { toast } from 'react-toastify';
export default function FeedbackUserPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('userSidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const toggleSidebar = () => {
        setSidebarOpen(prev => {
            const newState = !prev;
            localStorage.setItem('userSidebarOpen', JSON.stringify(newState));
            return newState;
        });
    };
    const [user, setUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [submittedCode, setSubmittedCode] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "Hạ tầng",
        location: ""
    });

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [location.pathname]);



    const menuItems = [
        { path: "/home", label: "Trang chủ", icon: "🏠" },
        { path: "/services", label: "Dịch vụ công", icon: "📋" },
        { path: "/track", label: "Tra cứu hồ sơ", icon: "🔍" },
        { path: "/feedback", label: "Phản ánh kiến nghị", icon: "💬" },
        { path: "/news", label: "Tin tức", icon: "📰" },
        { path: "/contact", label: "Liên hệ", icon: "📞" },
    ];

    const categories = ["Hạ tầng", "An ninh trật tự", "Môi trường", "Giáo dục", "Y tế", "Hành chính", "Khác"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Vui lòng đăng nhập để gửi phản ánh!");
            navigate("/login");
            return;
        }
        setSubmitting(true);
        try {
            const response = await feedbackAPI.create({
                ...formData,
                user_id: user.id,
                citizen_name: user.full_name || user.username,
                citizen_phone: user.phone,
                citizen_email: user.email,
            });

            const feedbackCode = response?.data?.feedback_code || response?.feedback_code || "PA" + Date.now().toString().slice(-6);
            setSubmittedCode(feedbackCode);
            setIsSuccess(true);
            setFormData({ title: "", content: "", category: "Hạ tầng", location: "" });
        } catch (err) {
            toast.error("Có lỗi xảy ra khi gửi phản ánh. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-inter text-slate-900">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full bg-white shadow-2xl transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 bg-gradient-to-r from-blue-700 to-indigo-800">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-lg">🏛️</div>
                            <div>
                                <h1 className="text-white font-black text-sm uppercase tracking-wider leading-none">Hành chính số</h1>
                                <p className="text-blue-100 text-[9px] font-bold opacity-80 tracking-widest mt-0.5">Phường Mỹ Trà</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-lg mx-auto">🏛️</div>
                    )}
                </div>
                <nav className="p-3 space-y-1">
                    {menuItems.map((item, index) => (
                        <Link key={index} to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium'}`}>
                            <span className="text-xl">{item.icon}</span>
                            {sidebarOpen && <span className="text-sm">{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <Header
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    title={
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Phản ánh kiến nghị</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Gửi ý kiến của bạn</p>
                        </div>
                    }
                />

                <main className="p-8 max-w-4xl mx-auto">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-br from-[#1E40AF] to-[#4338CA] rounded-[2.5rem] p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2 tracking-tight uppercase">Gửi phản ánh mới</h3>
                            <p className="text-blue-100 text-sm font-medium opacity-80 leading-relaxed max-w-lg">
                                Chúng tôi luôn lắng nghe và sẵn sàng giải quyết các vấn đề của bạn để cải thiện chất lượng dịch vụ công và đời sống cộng đồng.
                            </p>
                        </div>
                        <div className="absolute right-0 top-0 text-[10rem] opacity-5 pointer-events-none rotate-12 -mr-10 -mt-10">✍️</div>
                    </div>

                    {/* Content Section */}
                    {isSuccess ? (
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-12 text-center animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner border border-emerald-100">✨</div>
                            <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Gửi phản ánh thành công!</h3>
                            <p className="text-slate-400 text-sm font-medium mb-8 max-w-md mx-auto leading-relaxed">
                                Cảm ơn bạn đã đóng góp ý kiến. Phản ánh của bạn đã được chuyển đến cơ quan chức năng để xem xét và xử lý.
                            </p>

                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-10 inline-block min-w-[280px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mã tra cứu phản ánh</p>
                                <p className="text-4xl font-black text-[#2563EB] tracking-wider leading-none">{submittedCode}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button onClick={() => setIsSuccess(false)}
                                    className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-200 transition-all min-w-[200px]">
                                    Gửi phản ánh khác
                                </button>
                                <Link to="/track" className="px-8 py-4 bg-[#2563EB] text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all min-w-[200px]">
                                    Tra cứu tiến độ
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10">
                            {!user ? (
                                <div className="py-12 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">🔐</div>
                                    <h5 className="text-lg font-black text-slate-800 mb-2">Yêu cầu đăng nhập</h5>
                                    <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto leading-relaxed">Vui lòng đăng nhập tài khoản Định danh điện tử để chúng tôi có thể phản hồi và hỗ trợ bạn tốt nhất.</p>
                                    <Link to="/login" className="inline-flex items-center gap-3 px-8 py-4 bg-[#2563EB] text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                                        🚀 Đăng nhập ngay
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block ml-1">Tiêu đề phản ánh *</label>
                                            <input type="text" required value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-800 text-sm placeholder:text-slate-300 shadow-sm"
                                                placeholder="Tóm tắt ngắn gọn vấn đề" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block ml-1">Lĩnh vực liên quan *</label>
                                            <div className="relative">
                                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-800 text-sm appearance-none cursor-pointer shadow-sm">
                                                    {categories.map(c => <option key={c}>{c}</option>)}
                                                </select>
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block ml-1">Địa điểm / Vị trí cụ thể</label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 relative">
                                                <input type="text" value={formData.location}
                                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-800 text-sm placeholder:text-slate-300 shadow-sm"
                                                    placeholder="VD: Khu vực chợ, TDP số 5..." />
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">📍</div>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={gettingLocation}
                                                onClick={async () => {
                                                    if (!navigator.geolocation) {
                                                        toast.error('Trình duyệt không hỗ trợ vị trí!');
                                                        return;
                                                    }
                                                    setGettingLocation(true);
                                                    navigator.geolocation.getCurrentPosition(
                                                        async (pos) => {
                                                            try {
                                                                const { latitude, longitude } = pos.coords;
                                                                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=vi`);
                                                                const json = await res.json();
                                                                const addr = json.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                                                                setFormData(prev => ({ ...prev, location: addr }));
                                                            } catch {
                                                                setFormData(prev => ({ ...prev, location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}` }));
                                                            } finally {
                                                                setGettingLocation(false);
                                                            }
                                                        },
                                                        () => {
                                                            setGettingLocation(false);
                                                            toast.error('Không lấy được vị trí. Vui lòng nhập thủ công.');
                                                        }
                                                    );
                                                }}
                                                className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${gettingLocation
                                                    ? 'bg-blue-50 text-blue-400 cursor-wait'
                                                    : 'bg-[#2563EB] text-white hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center justify-center gap-2'}`}>
                                                {gettingLocation ? '🔄 Đang định vị...' : '🗺️ Lấy vị trí'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block ml-1">Nội dung phản ánh chi tiết *</label>
                                        <textarea required rows={6} value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-800 text-sm resize-none placeholder:text-slate-300 leading-relaxed shadow-sm min-h-[150px]"
                                            placeholder="Vui lòng mô tả chi tiết sự việc, thời điểm xảy ra và yêu cầu của bạn..." />
                                    </div>

                                    <div className="pt-6">
                                        <button type="submit" disabled={submitting}
                                            className="w-full py-5 bg-[#2563EB] text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-4 group relative overflow-hidden shadow-lg shadow-blue-100">
                                            {submitting ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Hệ thống đang gửi...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xl">📫</span>
                                                    Gửi phản ánh kiến nghị
                                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                                </>
                                            )}
                                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 pointer-events-none"></div>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

