import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/layout/Header";

export default function ServicesPage() {
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
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("all");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
    }, []);



    const menuItems = [
        { path: "/", label: "Trang chủ", icon: "🏠" },
        { path: "/services", label: "Dịch vụ công", icon: "📋" },
        { path: "/track", label: "Tra cứu hồ sơ", icon: "🔍" },
        { path: "/feedback", label: "Phản ánh kiến nghị", icon: "💬" },
        { path: "/news", label: "Tin tức", icon: "📰" },
        { path: "/contact", label: "Liên hệ", icon: "📞" },
    ];

    const departments = [
        { id: "all", label: "Tất cả" },
        { id: "ho-tich", label: "Hộ tịch" },
        { id: "cu-tru", label: "Cư trú" },
        { id: "tu-phap", label: "Tư pháp" },
        { id: "kinh-doanh", label: "Kinh doanh" },
        { id: "xay-dung", label: "Xây dựng" },
    ];

    const services = [
        {
            id: 1,
            title: "Đăng ký khai sinh",
            icon: "👶",
            dept: "ho-tich",
            color: "from-rose-500 to-pink-600",
            desc: "Đăng ký khai sinh cho trẻ em, cấp bản sao giấy khai sinh",
            time: "3 ngày làm việc",
            fee: "Miễn phí",
        },
        {
            id: 2,
            title: "Đăng ký kết hôn",
            icon: "💍",
            dept: "ho-tich",
            color: "from-pink-500 to-rose-600",
            desc: "Đăng ký kết hôn, xác nhận tình trạng hôn nhân",
            time: "5 ngày làm việc",
            fee: "Miễn phí",
        },
        {
            id: 3,
            title: "Đăng ký khai tử",
            icon: "📜",
            dept: "ho-tich",
            color: "from-gray-500 to-slate-600",
            desc: "Đăng ký khai tử, xóa đăng ký thường trú",
            time: "2 ngày làm việc",
            fee: "Miễn phí",
        },
        {
            id: 4,
            title: "Đăng ký tạm trú",
            icon: "🏠",
            dept: "cu-tru",
            color: "from-blue-500 to-indigo-600",
            desc: "Đăng ký tạm trú, gia hạn tạm trú cho công dân",
            time: "3 ngày làm việc",
            fee: "Miễn phí",
        },
        {
            id: 5,
            title: "Đăng ký thường trú",
            icon: "🏘️",
            dept: "cu-tru",
            color: "from-indigo-500 to-blue-600",
            desc: "Nhập hộ khẩu thường trú, chuyển hộ khẩu",
            time: "15 ngày làm việc",
            fee: "Miễn phí",
        },
        {
            id: 6,
            title: "Cấp CCCD/CMND",
            icon: "🪪",
            dept: "cu-tru",
            color: "from-violet-500 to-purple-600",
            desc: "Cấp mới, đổi thẻ Căn cước công dân gắn chip",
            time: "7 ngày làm việc",
            fee: "Theo quy định",
        },
        {
            id: 7,
            title: "Cấp phiếu lý lịch tư pháp",
            icon: "⚖️",
            dept: "tu-phap",
            color: "from-amber-500 to-orange-600",
            desc: "Cấp phiếu lý lịch tư pháp số 1 và số 2",
            time: "10 ngày làm việc",
            fee: "200.000đ",
        },
        {
            id: 8,
            title: "Chứng thực bản sao",
            icon: "📄",
            dept: "tu-phap",
            color: "from-teal-500 to-green-600",
            desc: "Chứng thực bản sao từ bản chính các loại giấy tờ",
            time: "Trong ngày",
            fee: "2.000đ/trang",
        },
        {
            id: 9,
            title: "Chứng thực chữ ký",
            icon: "✍️",
            dept: "tu-phap",
            color: "from-green-500 to-emerald-600",
            desc: "Chứng thực chữ ký trên các loại giấy tờ, hợp đồng",
            time: "Trong ngày",
            fee: "10.000đ/chữ ký",
        },
        {
            id: 10,
            title: "Đăng ký kinh doanh hộ cá thể",
            icon: "🏪",
            dept: "kinh-doanh",
            color: "from-cyan-500 to-blue-600",
            desc: "Đăng ký, thay đổi, chấm dứt hộ kinh doanh cá thể",
            time: "3 ngày làm việc",
            fee: "100.000đ",
        },
        {
            id: 11,
            title: "Cấp phép xây dựng",
            icon: "🏗️",
            dept: "xay-dung",
            color: "from-orange-500 to-amber-600",
            desc: "Cấp giấy phép xây dựng nhà ở, công trình dân dụng",
            time: "15 ngày làm việc",
            fee: "Theo quy định",
        },
        {
            id: 12,
            title: "Xác nhận lý lịch",
            icon: "📋",
            dept: "tu-phap",
            color: "from-slate-500 to-gray-600",
            desc: "Xác nhận lý lịch cư trú, phục vụ các thủ tục hành chính",
            time: "2 ngày làm việc",
            fee: "Miễn phí",
        },
    ];

    const filtered = services.filter(s => {
        const matchDept = selectedDept === "all" || s.dept === selectedDept;
        const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.desc.toLowerCase().includes(searchTerm.toLowerCase());
        return matchDept && matchSearch;
    });

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
                        <Link key={index} to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${index === 1
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
                <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} title="Dịch vụ công trực tuyến" />

                {/* Page Content */}
                <main className="p-4 md:p-6 max-w-7xl mx-auto">
                    {/* Search & Filter */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                        />
                        <div className="flex gap-2 flex-wrap">
                            {departments.map(dept => (
                                <button key={dept.id} onClick={() => setSelectedDept(dept.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedDept === dept.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                                    {dept.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Services Grid */}
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filtered.map(service => (
                                <Link key={service.id} to={`/services/${service.id}`}
                                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className={`h-28 bg-gradient-to-br ${service.color} flex items-center justify-center text-5xl`}>
                                        {service.icon}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-black text-gray-800 text-sm mb-2 group-hover:text-blue-600 transition-colors leading-snug">{service.title}</h3>
                                        <p className="text-[10px] text-gray-400 mb-4 line-clamp-2 leading-relaxed">{service.desc}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-gray-400"><span className="font-black text-gray-600">⏱</span> {service.time}</p>
                                                <p className="text-[9px] text-gray-400"><span className="font-black text-gray-600">💰</span> {service.fee}</p>
                                            </div>
                                            <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">→</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-gray-500 font-medium">Không tìm thấy dịch vụ phù hợp</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
