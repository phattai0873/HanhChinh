import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText,
    MessageSquare,
    Inbox,
    Send,
    Users,
    RefreshCw,
    Download,
    Activity,
    LogOut,
    UserCheck,
    Briefcase
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { dashboardAPI } from '../../services/api';
import { exportToExcel } from '../../utils/helpers';

export default function Dashboard() {
    const [timeFilter, setTimeFilter] = useState('all');
    const [stats, setStats] = useState({
        files: { total: 0, pending: 0, processing: 0, completed: 0, rejected: 0 },
        departments: [], // New state for department breakdown
        feedbacks: { total: 0, pending: 0, processing: 0, resolved: 0, rejected: 0 },
        incoming_documents: { total: 0, pending: 0, processing: 0, completed: 0 },
        outgoing_documents: { total: 0, draft: 0, pending_approval: 0, approved: 0, sent: 0 },
        users: { total: 0, citizens: 0, staff: 0, leaders: 0, admins: 0 }
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async (filter) => {
        setLoading(true);
        try {
            const [statsData, activitiesData] = await Promise.all([
                dashboardAPI.getStats(filter),
                dashboardAPI.getRecentActivities(10)
                ]);

                // Ensure data structure existence to prevent errors
                const safeStats = {
                    files: statsData.files || { total: 0, pending: 0, processing: 0, completed: 0 },
                    departments: statsData.departments || [],
                    feedbacks: statsData.feedbacks || { total: 0, pending: 0, processing: 0, resolved: 0 },
                    incoming_documents: statsData.incoming_documents || { total: 0, pending: 0, processing: 0, completed: 0 },
                    outgoing_documents: statsData.outgoing_documents || { total: 0, draft: 0, pending_approval: 0, approved: 0, sent: 0 },
                    users: statsData.users || { total: 0, citizens: 0, staff: 0, leaders: 0, admins: 0 }
                };

                setStats(safeStats);

                const formattedActivities = (activitiesData || []).map(item => ({
                    id: item.id,
                    type: item.record_type === 'file' ? 'application' : 'feedback',
                    user: item.user_name || 'Người dùng ẩn',
                    action: formatAction(item),
                    time: new Date(item.created_at).toLocaleString('vi-VN')
                }));
                setRecentActivities(formattedActivities);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
    };

    useEffect(() => {
        fetchData(timeFilter);
    }, [timeFilter]);

    const formatAction = (item) => {
        if (item.action === 'update_status') {
            return `cập nhật trạng thái sang "${item.new_status}"`;
        } else if (item.action === 'assign') {
            return `phân công xử lý`;
        }
        return item.action;
    };

    const handleExport = () => {
        const reportData = [
            { category: 'Hồ sơ Một cửa - Tổng số', value: stats.files.total || 0 },
            { category: 'Hồ sơ Một cửa - Chờ tiếp nhận', value: stats.files.pending || 0 },
            { category: 'Hồ sơ Một cửa - Đang xử lý', value: stats.files.processing || 0 },
            { category: 'Hồ sơ Một cửa - Đã hoàn thành', value: stats.files.completed || 0 },
            { category: 'Hồ sơ Một cửa - Từ chối', value: stats.files.rejected || 0 },
            { category: 'Phản ánh - Tổng số', value: stats.feedbacks.total || 0 },
            { category: 'Phản ánh - Chờ duyệt', value: stats.feedbacks.pending || 0 },
            { category: 'Phản ánh - Đang xử lý', value: stats.feedbacks.processing || 0 },
            { category: 'Phản ánh - Đã giải quyết', value: stats.feedbacks.resolved || 0 },
            { category: 'Văn bản Đến - Tổng số', value: stats.incoming_documents.total || 0 },
            { category: 'Văn bản Đến - Đang xử lý', value: stats.incoming_documents.processing || 0 },
            { category: 'Văn bản Đi - Tổng số', value: stats.outgoing_documents.total || 0 },
            { category: 'Văn bản Đi - Chờ duyệt', value: stats.outgoing_documents.pending_approval || 0 },
            { category: 'Người dùng - Tổng số', value: stats.users.total || 0 },
            { category: 'Người dùng - Công dân', value: stats.users.citizens || 0 },
            { category: 'Người dùng - Cán bộ', value: stats.users.staff || 0 },
            { category: 'Người dùng - Quản trị', value: (parseInt(stats.users.leaders || 0) + parseInt(stats.users.admins || 0)) },
        ];

        // Add department stats
        if (stats.departments && stats.departments.length > 0) {
            stats.departments.forEach(dept => {
                const percentage = stats.files.total > 0 ? ((parseInt(dept.count) / stats.files.total) * 100).toFixed(1) : 0;
                reportData.push({ category: `Phòng ban - ${dept.name}`, value: `${dept.count} (${percentage}%)` });
            });
        }

        const columns = [
            { header: 'Hạng mục báo cáo', key: 'category' },
            { header: 'Số lượng / Trạng thái', key: 'value' }
        ];

        let titleExt = 'TẤT CẢ';
        if (timeFilter === 'day') titleExt = 'HÔM NAY';
        if (timeFilter === 'month') titleExt = 'THÁNG NÀY';
        if (timeFilter === 'year') titleExt = 'NĂM NAY';

        exportToExcel(reportData, `Báo_cáo_tổng_quan_hệ_thống_${titleExt}`, columns, `BÁO CÁO TỔNG QUAN HỆ THỐNG - ${titleExt}`);
    };

    const statCards = [
        {
            icon: <FileText className="w-6 h-6" />,
            title: 'Hồ sơ Một cửa',
            value: stats.files.total || 0,
            subtext: `${stats.files.pending || 0} hồ sơ mới chờ xử lý`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            link: '/admin/applications'
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: 'Phản ánh Kiến nghị',
            value: stats.feedbacks.total || 0,
            subtext: `${stats.feedbacks.pending || 0} phản ánh chờ duyệt`,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            link: '/admin/feedbacks'
        },
        {
            icon: <Inbox className="w-6 h-6" />,
            title: 'Văn bản Đến (Công văn)',
            value: stats.incoming_documents.total || 0,
            subtext: `${stats.incoming_documents.processing || 0} văn bản đang xử lý`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            link: '/admin/documents?tab=incoming'
        },
        {
            icon: <Send className="w-6 h-6" />,
            title: 'Văn bản Đi (Phát hành)',
            value: stats.outgoing_documents.total || 0,
            subtext: `${stats.outgoing_documents.pending_approval || 0} văn bản chờ duyệt`,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            link: '/admin/documents?tab=outgoing'
        },
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="relative">
                {/* Background Decorations - Wrapped to prevent overflow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl"></div>
                </div>

                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Tổng quan hệ thống
                        </h1>
                        <p className="text-slate-500 mt-2 flex items-center gap-2 font-medium">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Cập nhật: {new Date().toLocaleTimeString('vi-VN')} • {new Date().toLocaleDateString('vi-VN')}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-sm transition-all shadow-sm cursor-pointer hover:border-blue-300"
                        >
                            <option value="all">Tất cả thời gian</option>
                            <option value="day">Hôm nay</option>
                            <option value="month">Tháng này</option>
                            <option value="year">Năm nay</option>
                        </select>
                        <button
                            onClick={() => fetchData(timeFilter)}
                            className="group px-5 py-2.5 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 text-sm font-semibold flex items-center gap-2 shadow-sm active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            Làm mới
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-300 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
                        >
                            <Download className="w-4 h-4" />
                            Xuất báo cáo
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statCards.map((stat, index) => (
                        <Link
                            to={stat.link}
                            key={index}
                            className="relative group bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden"
                        >
                            {/* Accent Glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500 ${stat.bgColor}`}></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color} shadow-inner transition-transform duration-500 group-hover:scale-110`}>
                                        {stat.icon}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tổng số</span>
                                        <h3 className="text-3xl font-black text-slate-800 mt-1">{stat.value}</h3>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-600 font-bold text-lg mb-1">{stat.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`h-1.5 w-1.5 rounded-full ${stat.color.replace('text', 'bg')}`}></span>
                                        <p className={`text-xs font-bold uppercase tracking-wider ${stat.color}`}>{stat.subtext}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Stats Analysis */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <Users className="w-5 h-5 text-slate-500" />
                                </div>
                                Người dùng
                            </h2>
                        </div>
                        <div className="space-y-5">
                            <div className="group flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-blue-50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                                        <UserCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">Công dân</p>
                                        <p className="text-xs text-slate-400 font-medium">Người nộp hồ sơ</p>
                                    </div>
                                </div>
                                <span className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{stats.users.citizens}</span>
                            </div>

                            <div className="group flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-purple-50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white text-purple-600 rounded-xl shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">Cán bộ</p>
                                        <p className="text-xs text-slate-400 font-medium">Người xử lý hồ sơ</p>
                                    </div>
                                </div>
                                <span className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">{stats.users.staff}</span>
                            </div>

                            <div className="group flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-indigo-50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">Quản trị</p>
                                        <p className="text-xs text-slate-400 font-medium">Lãnh đạo & Admin</p>
                                    </div>
                                </div>
                                <span className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{parseInt(stats.users.leaders) + parseInt(stats.users.admins)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Department Statistics (Replaced Recent Activity) */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Activity className="w-5 h-5 text-blue-500" />
                                </div>
                                Hồ sơ theo Lĩnh vực
                            </h2>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">PHÂN BỔ CÔNG VIỆC</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.departments.map((dept) => {
                                // Map code to URL type
                                const codeToUrl = {
                                    'HO_TICH': 'ho-tich',
                                    'CU_TRU': 'cu-tru',
                                    'KINH_DOANH': 'kinh-doanh',
                                    'XAY_DUNG': 'xay-dung',
                                    'TU_PHAP': 'tu-phap'
                                };
                                const urlType = codeToUrl[dept.code] || 'all';
                                const percentage = stats.files.total > 0 ? (parseInt(dept.count) / stats.files.total * 100).toFixed(1) : 0;

                                return (
                                    <Link
                                        to={`/admin/applications/${urlType}`}
                                        key={dept.id}
                                        className="group p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{dept.icon || '📁'}</span>
                                                <p className="font-bold text-slate-700 text-sm">{dept.name}</p>
                                            </div>
                                            <span className="text-lg font-black text-blue-600">{dept.count}</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ: {percentage}%</span>
                                            <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"> CHI TIẾT →</span>
                                        </div>
                                    </Link>
                                );
                            })}

                            {stats.departments.length === 0 && (
                                <div className="col-span-2 flex flex-col items-center justify-center py-16 text-slate-300">
                                    <Briefcase className="w-16 h-16 mb-4 opacity-10 animate-pulse" />
                                    <p className="font-bold tracking-widest uppercase text-xs">Đang cập nhật dữ liệu phòng ban...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
