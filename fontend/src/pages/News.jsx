import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { newsAPI } from "../services/api";
import Header from "../components/layout/Header";

export default function NewsPage() {
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
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const data = await newsAPI.getAll();
            // Normalize: API có thể trả về array hoặc object { data/news/rows: [...] }
            if (Array.isArray(data)) {
                setNews(data);
            } else if (data && Array.isArray(data.data)) {
                setNews(data.data);
            } else if (data && Array.isArray(data.news)) {
                setNews(data.news);
            } else if (data && Array.isArray(data.rows)) {
                setNews(data.rows);
            } else {
                setNews([]);
            }
        } catch (error) {
            console.error("Failed to fetch news:", error);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };



    const menuItems = [
        { path: "/", label: "Trang chủ", icon: "🏠" },
        { path: "/services", label: "Dịch vụ công", icon: "📋" },
        { path: "/track", label: "Tra cứu hồ sơ", icon: "🔍" },
        { path: "/feedback", label: "Phản ánh kiến nghị", icon: "💬" },
        { path: "/news", label: "Tin tức", icon: "📰" },
        { path: "/contact", label: "Liên hệ", icon: "📞" },
    ];

    const categories = ["all", "Thông báo", "Quy định", "Sự kiện", "Hướng dẫn"];

    const filteredNews = news.filter(item => {
        const matchSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.content?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
        return matchSearch && matchCategory;
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
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${index === 4
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
                <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} title="Tin tức & Thông báo" />

                {/* Page Content */}
                <main className="p-4 md:p-6 max-w-7xl mx-auto">
                    {/* Search & Filter */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tin tức..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                        />
                        <div className="flex gap-2 flex-wrap">
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'}`}>
                                    {cat === 'all' ? 'Tất cả' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* News Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-gray-100"></div>
                            ))}
                        </div>
                    ) : filteredNews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredNews.map(item => (
                                <Link key={item.id} to={`/news/${item.id}`}
                                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                    <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-5xl overflow-hidden">
                                        {item.thumbnail
                                            ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            : '🗞️'}
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                {item.category || 'Tin tức'}
                                            </span>
                                            <span className="text-[9px] text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-gray-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">{item.title}</h3>
                                        <p className="text-[11px] text-gray-400 line-clamp-2">{item.summary || item.content?.substring(0, 100)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📰</div>
                            <p className="text-gray-500 font-medium">Không tìm thấy tin tức phù hợp</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
