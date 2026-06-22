import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { newsAPI } from "../services/api";
import Header from "../components/layout/Header";

import { toast } from 'react-toastify';
export default function HomePage() {
    const navigate = useNavigate();
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
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }

        const fetchNews = async () => {
            try {
                const data = await newsAPI.getPublic(6);
                setNewsList(data || []);
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const menuItems = [
        { path: "/", label: "Trang chủ", icon: "🏠" },
        { path: "/services", label: "Dịch vụ công", icon: "📋" },
        { path: "/track", label: "Tra cứu hồ sơ", icon: "🔍" },
        { path: "/feedback", label: "Phản ánh kiến nghị", icon: "💬" },
        { path: "/news", label: "Tin tức", icon: "📰" },
        { path: "/contact", label: "Liên hệ", icon: "📞" },
    ];

    const services = [
        { title: "Đăng ký tạm trú", icon: "🏠", desc: "Thủ tục đăng ký tạm trú cho công dân", color: "bg-blue-600", path: "/services/1" },
        { title: "Hộ khẩu", icon: "👨‍👩‍👧‍👦", desc: "Các thay đổi về sổ hộ khẩu, nhân khẩu", color: "bg-indigo-600", path: "/services/2" },
        { title: "Khai sinh", icon: "👶", desc: "Đăng ký khai sinh, cấp bản sao", color: "bg-rose-600", path: "/services/3" },
        { title: "CCCD/CMND", icon: "🪪", desc: "Cấp mới, đổi thẻ Căn cước công dân", color: "bg-violet-600", path: "/services/4" },
        { title: "Kết hôn", icon: "💍", desc: "Đăng ký kết hôn, xác nhận tình trạng dân sự", color: "bg-pink-600", path: "/services/5" },
        { title: "Lý lịch tư pháp", icon: "⚖️", desc: "Cấp phiếu lý lịch tư pháp số 1 và 2", color: "bg-amber-600", path: "/services/6" },
    ];

    const departments = [
        { name: "Một cửa", icon: "🏢", count: "145+" },
        { name: "Hộ tịch", icon: "👶", count: "82+" },
        { name: "Cư trú", icon: "🏘️", count: "210+" },
        { name: "Xây dựng", icon: "🏗️", count: "34+" },
        { name: "Tư pháp", icon: "⚖️", count: "56+" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
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
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${index === 0
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {sidebarOpen && <span className="text-sm">{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

                {/* Page Content */}
                <main className="p-4 md:p-6 max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-500 rounded-2xl p-8 md:p-14 mb-6 shadow-xl text-white">
                        <div className="relative z-10 max-w-2xl">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 inline-block backdrop-blur-md border border-white/20">
                                Digital Governance Portal
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                                Giải quyết hồ sơ <br />
                                <span className="text-blue-300">Nhanh chóng - Quy chuẩn</span>
                            </h1>
                            <p className="text-blue-100 mb-8 text-xs md:text-sm leading-relaxed opacity-80 font-medium max-w-md tracking-wide">
                                Nền tảng một cửa phục vụ nhu cầu tra cứu và giải quyết thủ tục hành chính tại địa bàn Phường/Xã.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/services" className="px-8 py-3.5 bg-white text-blue-700 rounded-2xl font-black hover:shadow-xl hover:-translate-y-0.5 transition-all text-[11px]">
                                    Khám phá dịch vụ
                                </Link>
                                <Link to="/track" className="px-8 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-2xl font-black hover:bg-white/20 transition-all text-[11px]">
                                    Tra cứu hồ sơ
                                </Link>
                            </div>
                        </div>
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl opacity-40"></div>
                        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/30 rounded-full blur-3xl opacity-40"></div>
                        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Lượt tiếp nhận", value: "24.5k+", icon: "📊" },
                            { label: "Đúng hạn", value: "99.2%", icon: "✅" },
                            { label: "Dịch vụ", value: "150+", icon: "🌐" },
                            { label: "Thành viên", value: "10k+", icon: "👥" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 group">
                                <div className="text-2xl group-hover:scale-110 transition-transform">{stat.icon}</div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1.5">{stat.label}</p>
                                    <p className="text-lg font-black text-gray-800 leading-none tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Major Services Column */}
                        <div className="lg:col-span-8 space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-6 px-1">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Dịch vụ trọng tâm</h3>
                                        <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">Hệ thống giải quyết nhanh các hồ sơ thiết yếu</p>
                                    </div>
                                    <Link to="/services" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex লাইনems-center gap-1.5 group bg-blue-50 px-4 py-2 rounded-2xl transition-all hover:bg-blue-100 shadow-sm">
                                        Xem tất cả <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {services.map((service, i) => (
                                        <Link
                                            key={i}
                                            to={service.path}
                                            className="group bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 flex items-start gap-5 relative overflow-hidden"
                                        >
                                            <div className={`w-14 h-14 shrink-0 ${service.color} rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl group-hover:scale-110 transition-transform relative z-10`}>
                                                {service.icon}
                                            </div>
                                            <div className="relative z-10">
                                                <h4 className="font-black text-gray-800 text-xs mb-1.5 group-hover:text-blue-600 transition-colors tracking-tight leading-none">{service.title}</h4>
                                                <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed font-bold tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">{service.desc}</p>
                                            </div>
                                            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity -mr-10 -mt-10 ${service.color}`}></div>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* News Section */}
                            <section>
                                <div className="flex items-center justify-between mb-6 px-1">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Cổng thông tin</h3>
                                        <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">Thông cáo báo chí & Quy định mới nhất</p>
                                    </div>
                                    <Link to="/news" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Khám phá ngay →</Link>
                                </div>

                                {loading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse border border-gray-100 h-24"></div>
                                        ))}
                                    </div>
                                ) : newsList.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {newsList.map((item) => (
                                            <Link
                                                key={item.id}
                                                to={`/news/${item.id}`}
                                                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center p-3 gap-4"
                                            >
                                                <div className="relative w-20 h-20 shrink-0 overflow-hidden bg-slate-50 rounded-2xl flex items-center justify-center text-3xl">
                                                    {item.thumbnail ? (
                                                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : "🗞️"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5 leading-none">
                                                        {item.category || "Cập nhật"} • {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                                    </p>
                                                    <h4 className="font-black text-gray-800 text-[11px] group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight tracking-tight">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-dashed border-gray-200 rounded-3xl p-10 text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Hiện chưa có bản tin mới</p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Departments Overview Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
                                <h3 className="text-base font-black text-gray-800 uppercase tracking-tight mb-2 relative z-10">Số hóa Phòng ban</h3>
                                <p className="text-[10px] text-gray-400 font-bold tracking-widest mb-8 relative z-10">Công tác chuyên môn & Phân bổ hồ sơ</p>

                                <div className="space-y-4 relative z-10">
                                    {departments.map((dept, i) => (
                                        <Link key={i} to="/services" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group scale-100 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-blue-200">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl group-hover:scale-110 transition-transform">{dept.icon}</span>
                                                <div>
                                                    <p className="text-[10px] font-black tracking-tight leading-none mb-1">{dept.name}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 tracking-widest group-hover:text-blue-200">{dept.count} lượt xử lý</p>
                                                </div>
                                            </div>
                                            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                        </Link>
                                    ))}
                                </div>

                                <button onClick={() => navigate('/contact')} className="w-full mt-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100">
                                    Xem chi tiết sơ đồ tổ chức
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-800 to-blue-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200/50">
                                <h3 className="text-base font-black tracking-tight mb-4 leading-tight">Yêu cầu khẩn cấp?</h3>
                                <p className="text-[11px] text-blue-100 font-medium mb-8 leading-relaxed opacity-80 tracking-wide">Vui lòng liên hệ trực tiếp qua số hòm thư công vụ hoặc gửi phản ánh kiến nghị trực tuyến.</p>
                                <button onClick={() => navigate('/feedback')} className="px-6 py-2.5 bg-white text-blue-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                    Gửi phản ánh
                                </button>
                                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mb-10"></div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-100 py-10 px-8">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-lg shadow-lg">🏛️</div>
                            <div className="leading-none text-left">
                                <p className="text-[12px] font-black text-gray-800 tracking-[0.2em] mb-1.5 leading-none">Cổng hành chính số Phường/Xã</p>
                                <p className="text-[9px] font-bold text-gray-400 tracking-tighter opacity-60">© 2026 Toàn bộ quyền được bảo lưu bởi UBND Mỹ Trà</p>
                            </div>
                        </div>
                        <div className="flex gap-10">
                            {['Điều khoản', 'Bảo mật', 'Trợ giúp'].map(link => (
                                <button key={link} className="text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-[0.3em] transition-colors">{link}</button>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}