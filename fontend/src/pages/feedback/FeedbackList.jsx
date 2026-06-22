import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { feedbackAPI } from '../../services/api';
import { exportToExcel } from '../../utils/helpers';
import {
    Search, Filter, Download, MessageSquare,
    CheckCircle, Clock, AlertCircle, Inbox,
    Calendar, User, Eye, ArrowRight
} from 'lucide-react';

export default function FeedbackList() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await feedbackAPI.getAll({ limit: 100, timeFilter: timeFilter !== 'all' ? timeFilter : undefined });
                let data = [];
                if (response && Array.isArray(response.data)) {
                    data = response.data;
                } else if (Array.isArray(response)) {
                    data = response;
                }

                const formattedFeedbacks = data.map(item => ({
                    id: item.id,
                    code: item.feedback_code || `PA${String(item.id).padStart(3, '0')}`,
                    userId: item.citizen_phone || 'N/A',
                    userName: item.citizen_name || item.citizen_full_name || 'Công dân',
                    subject: item.subject,
                    rating: item.rating || 0,
                    submittedDate: item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'N/A',
                    status: item.status
                }));
                setFeedbacks(formattedFeedbacks);
                setFilteredFeedbacks(formattedFeedbacks);
            } catch (error) {
                console.error("Failed to fetch feedbacks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [timeFilter]);

    useEffect(() => {
        let filtered = feedbacks;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.subject.toLowerCase().includes(term) ||
                item.userName.toLowerCase().includes(term)
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(item => item.status === filterStatus);
        }

        setFilteredFeedbacks(filtered);
    }, [searchTerm, filterStatus, feedbacks]);

    const stats = {
        total: feedbacks.length,
        pending: feedbacks.filter(f => f.status === 'new' || f.status === 'pending').length,
        processing: feedbacks.filter(f => f.status === 'processing').length,
        resolved: feedbacks.filter(f => f.status === 'resolved').length
    };

    const getStatusBadge = (status) => {
        const config = {
            new: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle, label: 'Mới tiếp nhận' },
            pending: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle, label: 'Chờ xử lý' },
            processing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Clock, label: 'Đang xử lý' },
            resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle, label: 'Đã giải quyết' }
        };
        const current = config[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: Inbox, label: status };
        const Icon = current.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}>
                <Icon className="w-3.5 h-3.5" />
                {current.label}
            </span>
        );
    };

    const handleExport = () => {
        const columns = [
            { header: 'ID', key: 'id' },
            { header: 'Người gửi', key: 'userName' },
            { header: 'Số điện thoại', key: 'userId' },
            { header: 'Tiêu đề', key: 'subject' },
            { header: 'Ngày gửi', key: 'submittedDate' },
            { header: 'Trạng thái', key: 'statusLabel' }
        ];

        const exportData = filteredFeedbacks.map(item => {
            const labels = {
                new: 'Mới tiếp nhận',
                pending: 'Chờ xử lý',
                processing: 'Đang xử lý',
                resolved: 'Đã giải quyết'
            };
            return {
                ...item,
                statusLabel: labels[item.status] || item.status
            };
        });

        let titleExt = 'TẤT CẢ';
        if (timeFilter === 'day') titleExt = 'HÔM NAY';
        if (timeFilter === 'month') titleExt = 'THÁNG NÀY';
        if (timeFilter === 'year') titleExt = 'NĂM NAY';

        exportToExcel(exportData, `Báo_cáo_phản_ánh_${titleExt}`, columns, `BÁO CÁO TỔNG HỢP PHẢN ÁNH KIẾN NGHỊ - ${titleExt}`);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col h-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
                    <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <MessageSquare className="w-7 h-7 text-blue-600" />
                        Quản lý phản ánh
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Tiếp nhận, theo dõi và xử lý ý kiến công dân</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-sm font-medium transition-all appearance-none"
                        >
                            <option value="all">Tất cả thời gian</option>
                            <option value="day">Hôm nay</option>
                            <option value="month">Tháng này</option>
                            <option value="year">Năm nay</option>
                        </select>
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                </div>
            </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Tổng phản ánh</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <Inbox className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Chờ xử lý</p>
                            <h3 className="text-2xl font-bold text-red-600">{stats.pending}</h3>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Đang xử lý</p>
                            <h3 className="text-2xl font-bold text-blue-600">{stats.processing}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Đã giải quyết</p>
                            <h3 className="text-2xl font-bold text-emerald-600">{stats.resolved}</h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>
            </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tìm kiếm phản ánh
                        </label>
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm theo tiêu đề, người gửi..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lọc theo trạng thái
                        </label>
                        <div className="relative">
                            <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="processing">Đang xử lý</option>
                                <option value="resolved">Đã giải quyết</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0">
                <div className="overflow-auto flex-1">
                    <table className="w-full relative">
                        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã / Ngày gửi</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Người phản ánh</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nội dung / Tiêu đề</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFeedbacks.length > 0 ? (
                                filteredFeedbacks.map((item, idx) => (
                                    <tr key={`${item.id}_${idx}`} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{item.code}</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {item.submittedDate}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold">
                                                    {item.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{item.userName}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <User className="w-3 h-3" />
                                                        {item.userId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700 max-w-sm" title={item.subject}>
                                                <p className="font-medium text-gray-900 truncate">{item.subject}</p>
                                                <p className="text-xs text-gray-500 truncate mt-1">Nhấn chi tiết để xem đầy đủ</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link
                                                to={`/admin/feedbacks/${item.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium shadow-sm group-hover:shadow"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-16 px-6">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                                <p className="text-gray-500">Đang tải dữ liệu phản ánh...</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                                    <Inbox className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-lg font-medium text-gray-900 mb-1">Không có phản ánh nào</p>
                                                <p className="text-gray-500 text-sm">Chưa có phản ánh nào {searchTerm ? 'phù hợp với tìm kiếm của bạn' : 'trong hệ thống hiện tại'}</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        </AdminLayout>
    );
}
