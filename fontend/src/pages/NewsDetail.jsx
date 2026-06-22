import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { newsAPI } from "../services/api";
import Header from "../components/layout/Header";

export default function NewsDetailPage() {
    const { id } = useParams();
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
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedNews, setRelatedNews] = useState([]);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
        fetchNews();
    }, [id]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const data = await newsAPI.getById(id);
            setNews(data);
            // Fetch related
            const all = await newsAPI.getPublic(6);
            setRelatedNews((all || []).filter(n => n.id !== parseInt(id)).slice(0, 3));
        } catch (error) {
            console.error("Failed to fetch news:", error);
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
                                <p className="text-blue-100 text-[9px] font-bold opacity-80 tracking-widest mt-0.5">Phường/Xã Cao Lãnh</p>
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
                <Header 
                    sidebarOpen={sidebarOpen} 
                    toggleSidebar={toggleSidebar} 
                    title={
                        <button onClick={() => navigate('/news')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-bold">
                            ← Quay lại tin tức
                        </button>
                    } 
                />

                {/* Page Content */}
                <main className="p-4 md:p-8 max-w-5xl mx-auto">
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-8 bg-gray-200 rounded-xl w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded-xl w-1/4"></div>
                            <div className="h-64 bg-gray-200 rounded-3xl"></div>
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-gray-200 rounded-xl"></div>)}
                            </div>
                        </div>
                    ) : news ? (
                        <div>
                            {/* Article Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        {news.category || 'Tin tức'}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        {new Date(news.created_at).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight mb-4">{news.title}</h1>
                                {news.summary && (
                                    <p className="text-base text-gray-500 leading-relaxed font-medium border-l-4 border-blue-500 pl-4">{news.summary}</p>
                                )}
                            </div>

                            {/* Thumbnail */}
                            {news.thumbnail && (
                                <div className="mb-8 rounded-3xl overflow-hidden h-72">
                                    <img src={news.thumbnail} alt={news.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="prose max-w-none bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{news.content}</div>
                            </div>

                            {/* Related News */}
                            {relatedNews.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-black text-gray-800 mb-4">Tin tức liên quan</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {relatedNews.map(item => (
                                            <Link key={item.id} to={`/news/${item.id}`}
                                                className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-all group">
                                                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">{item.category || 'Tin tức'}</p>
                                                <h3 className="font-bold text-gray-700 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h3>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📰</div>
                            <p className="text-gray-500">Không tìm thấy bài viết</p>
                            <Link to="/news" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
                                Quay lại danh sách
                            </Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
