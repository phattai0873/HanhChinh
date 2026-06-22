import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fileAPI, applicationAPI, feedbackAPI } from "../services/api";
import Header from "../components/layout/Header";

export default function TrackPage() {
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
    const [trackCode, setTrackCode] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [myApplications, setMyApplications] = useState([]);
    const [loadingMy, setLoadingMy] = useState(false);
    const [trackType, setTrackType] = useState("all"); // 'all', 'application', 'feedback'

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
            fetchMyApplications();
        }
    }, []);

    const fetchMyApplications = async () => {
        try {
            setLoadingMy(true);
            const data = await applicationAPI.getByUser();
            // Normalize response
            if (Array.isArray(data)) setMyApplications(data);
            else if (data && Array.isArray(data.data)) setMyApplications(data.data);
            else setMyApplications([]);
        } catch (err) {
            console.error("Failed to fetch applications:", err);
            setMyApplications([]);
        } finally {
            setLoadingMy(false);
        }
    };


    const handleTrack = async (e) => {
        e.preventDefault();
        const code = trackCode.trim();
        if (!code) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            // Try application first
            if (code.startsWith('HS') || trackType === 'application' || trackType === 'all') {
                try {
                    const data = await applicationAPI.getByCode(code);
                    if (data) {
                        setResult({ ...data, _type: 'application' });
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    // Fail silently and try feedback if 'all'
                    if (trackType === 'application') throw err;
                }
            }

            // Try feedback
            if (code.startsWith('PA') || trackType === 'feedback' || trackType === 'all') {
                const data = await feedbackAPI.getByCode(code);
                if (data) {
                    setResult({ ...data, _type: 'feedback' });
                } else {
                    setError("Không tìm thấy thông tin với mã này. Vui lòng kiểm tra lại.");
                }
            } else {
                setError("Không tìm thấy thông tin với mã này. Vui lòng kiểm tra lại.");
            }
        } catch (err) {
            setError("Không tìm thấy dữ liệu với mã này. Vui lòng kiểm tra lại chính xác mã số của bạn.");
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { path: "/home", label: "Trang chủ", icon: "🏠" },
        { path: "/services", label: "Dịch vụ công", icon: "📋" },
        { path: "/track", label: "Tra cứu hồ sơ/Phản ánh", icon: "🔍" },
        { path: "/feedback", label: "Phản ánh kiến nghị", icon: "💬" },
        { path: "/news", label: "Tin tức", icon: "📰" },
        { path: "/contact", label: "Liên hệ", icon: "📞" },
    ];

    const statusConfig = {
        pending: { label: "Đang chờ xử lý", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
        processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700 border-blue-200" },
        approved: { label: "Đã duyệt", color: "bg-green-100 text-green-700 border-green-200" },
        rejected: { label: "Từ chối", color: "bg-red-100 text-red-700 border-red-200" },
        completed: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
        resolved: { label: "Đã giải quyết", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
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
                <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} title="Tra cứu thông tin" />

                <main className="p-8 max-w-4xl mx-auto">
                    {/* Search Box */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Tra cứu nhanh</h3>
                            <p className="text-slate-400 text-sm font-medium mb-8">Nhập mã số hồ sơ hoặc mã phản ánh của bạn</p>

                            <form onSubmit={handleTrack} className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input
                                        type="text"
                                        value={trackCode}
                                        onChange={e => setTrackCode(e.target.value)}
                                        placeholder="Nhập mã số cần tra cứu..."
                                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-800 shadow-sm"
                                    />
                                    <button type="submit" disabled={loading}
                                        className="px-10 py-4 bg-[#2563EB] text-white rounded-2xl font-black text-sm hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all disabled:opacity-60 flex items-center justify-center gap-3">
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : '🔍 Tra cứu ngay'}
                                    </button>
                                </div>
                                <div className="mt-8 space-y-4">
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-center gap-4 transition-all hover:bg-blue-50">
                                        <div className="w-12 h-12 rounded-xl bg-white text-blue-600 flex items-center justify-center text-xl shadow-sm border border-blue-100">📂</div>
                                        <div>
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Tra cứu hồ sơ hành chính</p>
                                            <p className="text-sm font-bold text-slate-700">Sử dụng mã bắt đầu bằng <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs mx-1">HS</span> (Ví dụ: HS20240001)</p>
                                        </div>
                                        <div className="ml-auto hidden sm:block">
                                            <span className="text-[10px] font-black text-blue-300 uppercase italic">Tự động nhận diện</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-center gap-4 transition-all hover:bg-indigo-50">
                                        <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center text-xl shadow-sm border border-indigo-100">💬</div>
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Tra cứu phản ánh kiến nghị</p>
                                            <p className="text-sm font-bold text-slate-700">Sử dụng mã bắt đầu bằng <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-xs mx-1">PA</span> (Ví dụ: PA123456)</p>
                                        </div>
                                        <div className="ml-auto hidden sm:block">
                                            <span className="text-[10px] font-black text-indigo-300 uppercase italic">Tự động nhận diện</span>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {error && (
                                <div className="mt-6 p-5 bg-rose-50 border border-rose-100 rounded-2xl animate-in shake duration-500">
                                    <p className="text-rose-600 text-[13px] font-bold flex items-center gap-3">
                                        <span className="text-xl">⚠️</span> {error}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="absolute right-0 top-0 text-[10rem] opacity-5 pointer-events-none rotate-12 -mr-10 -mt-10">🔍</div>
                    </div>

                    {/* Track Result */}
                    {result && (
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-5 duration-700">
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                        {result._type === 'application' ? '📂' : '💬'}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-800 tracking-tight">Kết quả tìm kiếm</h4>
                                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">
                                            {result._type === 'application' ? 'Hồ sơ hành chính' : 'Phản ánh kiến nghị'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${(statusConfig[result.status] || { color: 'bg-slate-100 text-slate-600 border-slate-200' }).color}`}>
                                    {(statusConfig[result.status] || { label: result.status }).label}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="group">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Mã số tra cứu</p>
                                        <p className="font-black text-slate-800 text-2xl tracking-tight group-hover:text-[#2563EB] transition-colors">
                                            {result.feedback_code || result.application_code || result.code || (result._type === 'feedback' ? `PA${String(result.id).padStart(3, '0')}` : result.id)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Tiêu đề / Nội dung</p>
                                        <p className="font-bold text-slate-700 leading-relaxed">
                                            {result.title || result.service_name || result.file_type || 'Thông tin chi tiết'}
                                        </p>
                                        {result.content && (
                                            <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed opacity-80">{result.content}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 text-center sm:text-left">Ngày tiếp nhận</p>
                                            <p className="font-black text-slate-800 text-sm text-center sm:text-left">
                                                {new Date(result.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        {result.appointment_date && (
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 text-center sm:text-left">Ngày hẹn trả</p>
                                                <p className="font-black text-[#2563EB] text-sm text-center sm:text-left">
                                                    {new Date(result.appointment_date).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {result.location && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Vị trí liên quan</p>
                                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                <span>📍</span> {result.location}
                                            </p>
                                        </div>
                                    )}

                                    {/* Response Message */}
                                    {(result.response || result.processing_note) && (
                                        <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 shadow-inner relative overflow-hidden group/resp mt-4">
                                            <div className="absolute top-0 right-0 p-4 text-blue-100 text-5xl font-black">✓</div>
                                            <p className="text-[10px] font-black text-blue-600 tracking-widest mb-2 relative z-10 uppercase">Phản hồi từ cơ quan</p>
                                            <p className="text-sm text-slate-700 leading-relaxed font-bold relative z-10 italic">"{result.response || result.processing_note}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
