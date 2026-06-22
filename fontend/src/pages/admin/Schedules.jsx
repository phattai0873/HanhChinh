import { useState, useEffect } from 'react';
import { scheduleAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2, X, Search, CalendarDays } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import Swal from 'sweetalert2';
export default function Schedules() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '', // Separate date input for UI convenience
        time_start: '',
        time_end: '',
        location: '',
        attendees: '',
        type: 'meeting',
        status: 'scheduled' // 'scheduled', 'completed', 'cancelled'
    });

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const data = await scheduleAPI.getAll();
            setSchedules(data);
        } catch (error) {
            console.error('Lỗi khi tải lịch:', error);
            toast.error('Không thể tải lịch phân công.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // cập nhật thời gian mỗi phút
        return () => clearInterval(timer);
    }, []);

    const handleOpenModal = (schedule = null) => {
        if (schedule) {
            // parse start_time and end_time for form safely into local timezone
            const startDate = new Date(schedule.start_time);
            const endDate = new Date(schedule.end_time);

            // Helper to get local date in YYYY-MM-DD
            const localDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
            const localTimeStartStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
            const localTimeEndStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

            setFormData({
                title: schedule.title || '',
                description: schedule.description || '',
                date: localDateStr,
                time_start: localTimeStartStr,
                time_end: localTimeEndStr,
                location: schedule.location || '',
                attendees: schedule.attendees || '',
                type: schedule.type || 'meeting',
                status: schedule.status || 'scheduled'
            });
            setSelectedSchedule(schedule);
        } else {
            const today = new Date();
            const localTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            setFormData({
                title: '',
                description: '',
                date: localTodayStr,
                time_start: '08:00',
                time_end: '09:00',
                location: '',
                attendees: '',
                type: 'meeting',
                status: 'scheduled'
            });
            setSelectedSchedule(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSchedule(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Build local correctly formatted string for PostgreSQL `timestamp without time zone`
            const start_time = `${formData.date}T${formData.time_start}:00`;
            const end_time = `${formData.date}T${formData.time_end}:00`;

            const payload = {
                ...formData,
                start_time,
                end_time
            };

            if (selectedSchedule) {
                await scheduleAPI.update(selectedSchedule.id, payload);
                toast.success('Cập nhật lịch thành công!');
            } else {
                await scheduleAPI.create(payload);
                toast.success('Thêm mới lịch thành công!');
            }
            handleCloseModal();
            fetchSchedules();
        } catch (error) {
            console.error('Lỗi lưu lịch:', error);
            toast.error('Có lỗi xảy ra khi lưu lịch.');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn xóa lịch này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });
        if (result.isConfirmed) {
            try {
                await scheduleAPI.delete(id);
                toast.success('Xóa lịch thành công!');
                fetchSchedules();
            } catch (error) {
                console.error('Lỗi xóa lịch:', error);
                toast.error('Có lỗi xảy ra khi xóa lịch.');
            }
        }
    };

    const getTypeLabel = (type) => {
        const types = {
            meeting: { label: 'Cuộc họp', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            event: { label: 'Sự kiện', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
            field: { label: 'Công tác', color: 'bg-orange-100 text-orange-700 border-orange-200' },
            online: { label: 'Trực tuyến', color: 'bg-purple-100 text-purple-700 border-purple-200' }
        };
        return types[type] || types.meeting;
    };

    const filteredSchedules = schedules.filter(s =>
        (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderScheduleRow = (schedule, dayData, isFirstOfDay, totalCount, isMorning, isFirstOfMorning, isFirstOfAfternoon, morningCount, afternoonCount) => {
        const startDate = new Date(schedule.start_time);
        const endDate = new Date(schedule.end_time);
        const typeInfo = getTypeLabel(schedule.type);

        let displayStatus = schedule.status;
        if (schedule.status === 'scheduled') {
            if (currentTime >= startDate && currentTime <= endDate) {
                displayStatus = 'inprogress';
            } else if (currentTime > endDate) {
                displayStatus = 'ended';
            }
        }

        let statusColor = '';
        let statusDotColor = '';
        let statusLabel = '';

        if (displayStatus === 'completed') {
            statusColor = 'text-emerald-700 bg-emerald-100';
            statusDotColor = 'bg-emerald-500';
            statusLabel = 'Hoàn thành';
        } else if (displayStatus === 'ended') {
            statusColor = 'text-emerald-700 bg-emerald-100';
            statusDotColor = 'bg-emerald-500';
            statusLabel = 'Kết thúc';
        } else if (displayStatus === 'inprogress') {
            statusColor = 'text-blue-700 bg-blue-100';
            statusDotColor = 'bg-blue-500';
            statusLabel = 'Đang diễn ra';
        } else if (displayStatus === 'cancelled') {
            statusColor = 'text-red-700 bg-red-100';
            statusDotColor = 'bg-red-500';
            statusLabel = 'Đã hủy';
        } else {
            statusColor = 'text-amber-700 bg-amber-100';
            statusDotColor = 'bg-amber-500';
            statusLabel = 'Sắp tới';
        }

        const isMorningRow = isMorning;
        const isFirstOfSession = isMorningRow ? isFirstOfMorning : isFirstOfAfternoon;
        const sessionSpan = isMorningRow ? morningCount : afternoonCount;

        const dayInfoParts = dayData.displayDate.split(', ');
        const dayOfWeek = dayInfoParts[0];
        const dateString = dayInfoParts[1]?.replace('ngày ', '') || '';

        return (
            <tr key={`row-${schedule.id}`} className="hover:bg-blue-50/20 transition-colors group bg-slate-50 border-t border-[#3b82f6]">
                {/* Cột Ngày (Span all) */}
                {isFirstOfDay && (
                    <td rowSpan={totalCount} className="px-4 py-6 align-middle text-center border-r border-[#3b82f6] bg-slate-100/50 whitespace-nowrap">
                        <div className="flex flex-col items-center justify-center font-bold text-[#1e5b9e]">
                            <span>{dayOfWeek}</span>
                            <span className="font-normal text-slate-800 mt-1">{dateString}</span>
                        </div>
                    </td>
                )}

                {/* Cột Buổi (Span session) */}
                {isFirstOfSession && (
                    <td rowSpan={sessionSpan} className="px-4 py-4 align-middle text-center border-r border-[#3b82f6] bg-slate-100/50 font-bold text-[13px] uppercase tracking-wider text-slate-800">
                        {isMorningRow ? 'Sáng' : 'Chiều'}
                    </td>
                )}

                {/* Cột Thời gian */}
                <td className="px-4 py-4 align-middle text-center whitespace-nowrap border-r border-[#3b82f6] text-slate-800 font-medium">
                    {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </td>

                <td className="px-6 py-4 border-r border-[#3b82f6]">
                    <span className={`inline-block px-2.5 py-1 mb-2 rounded-md text-[11px] font-bold border uppercase tracking-wider ${typeInfo.color}`}>
                        {typeInfo.label}
                    </span>
                    <h3 className="font-bold text-slate-800 text-[15px] leading-tight mb-1">{schedule.title}</h3>
                    {schedule.description && (
                        <p className="text-sm text-slate-500 line-clamp-1">{schedule.description}</p>
                    )}
                </td>
                <td className="px-6 py-4 align-top border-r border-[#3b82f6]">
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2 text-slate-600">
                            <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-2 font-medium">{schedule.location || 'Chưa xác định'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600">
                            <Users className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-2">{schedule.attendees || 'Chưa phân công'}</span>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 align-middle text-center whitespace-nowrap border-r border-[#3b82f6]">
                    <div className="flex flex-col items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold leading-none ${statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDotColor}`}></span>
                            {statusLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-2 font-medium tracking-wide">TẠO BỞI: {schedule.creator_name || 'ADMIN'}</span>
                    </div>
                </td>
                <td className="px-6 py-4 align-middle text-center w-24">
                    <div className="flex justify-center gap-2 opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(schedule)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm border border-blue-200">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(schedule.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm border border-red-200">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    const groupSchedulesByDateAndSession = (schedulesList) => {
        const map = new Map();
        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        
        schedulesList.forEach(schedule => {
            const startDate = new Date(schedule.start_time);
            if (isNaN(startDate)) return;

            const keyDate = `${startDate.getFullYear()}-${String(startDate.getMonth()+1).padStart(2,'0')}-${String(startDate.getDate()).padStart(2,'0')}`;
            const hour = startDate.getHours();
            const session = hour < 12 ? 'morning' : 'afternoon';
            
            if (!map.has(keyDate)) {
                map.set(keyDate, {
                    displayDate: `${dayNames[startDate.getDay()]}, ngày ${startDate.toLocaleDateString('vi-VN')}`,
                    morning: [],
                    afternoon: []
                });
            }
            map.get(keyDate)[session].push(schedule);
        });
        
        return Array.from(map.entries());
    };

    const groupedData = groupSchedulesByDateAndSession(filteredSchedules);

    return (
        <AdminLayout>
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <CalendarDays className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Lịch phân công tác</h1>
                            <p className="text-slate-500">Quản lý lịch làm việc, họp giao ban và phân công công tác</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200 active:scale-95 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm lịch mới
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, địa điểm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>
                </div>

                {/* Loading / Empty State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Calendar className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có lịch phân công nào</h3>
                        <p className="text-slate-500 max-w-sm">Hãy thêm các lịch họp giao ban, sự kiện, hoặc đi công tác để dễ dàng quản lý chung.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-6 flex items-center gap-2 text-indigo-600 font-semibold bg-indigo-50 px-6 py-2.5 rounded-xl hover:bg-indigo-100 transition"
                        >
                            <Plus className="w-5 h-5" /> Thêm lịch đầu tiên
                        </button>
                    </div>
                ) : (
                    /* Schedules List */
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px] border border-[#3b82f6]">
                                <thead className="bg-[#f8fafc] text-[#1e5b9e] border-b-[2px] border-[#1e5b9e]">
                                    <tr>
                                        <th className="px-4 py-4 text-center text-sm font-bold whitespace-nowrap w-24 border-r border-[#3b82f6]">Ngày</th>
                                        <th className="px-4 py-4 text-center text-sm font-bold whitespace-nowrap w-20 border-r border-[#3b82f6]">Buổi</th>
                                        <th className="px-4 py-4 text-center text-sm font-bold whitespace-nowrap w-24 border-r border-[#3b82f6]">Thời gian</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold border-r border-[#3b82f6]">Nội dung & Phân công</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold w-64 border-r border-[#3b82f6]">Địa điểm & Thành phần</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold whitespace-nowrap w-28 border-r border-[#3b82f6]">Trạng thái</th>
                                        <th className="px-4 py-4 text-center text-sm font-bold whitespace-nowrap w-24">Thao tác</th>
                                    </tr>
                                </thead>
                                {groupedData.length === 0 ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500 border border-[#3b82f6]">
                                                Không có lịch trong danh sách tìm kiếm.
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    groupedData.map(([dateKey, dayData]) => {
                                        const morningCount = dayData.morning.length;
                                        const afternoonCount = dayData.afternoon.length;
                                        const totalCount = morningCount + afternoonCount;

                                        return (
                                            <tbody key={dateKey} className="border-b-[2px] border-[#1e5b9e]">
                                                {[...dayData.morning, ...dayData.afternoon].map((schedule, idx) => {
                                                    const isFirstOfDay = idx === 0;
                                                    const isMorning = idx < morningCount;
                                                    const isFirstOfMorning = idx === 0 && morningCount > 0;
                                                    const isFirstOfAfternoon = idx === morningCount && afternoonCount > 0;

                                                    return renderScheduleRow(
                                                        schedule,
                                                        dayData,
                                                        isFirstOfDay,
                                                        totalCount,
                                                        isMorning,
                                                        isFirstOfMorning,
                                                        isFirstOfAfternoon,
                                                        morningCount,
                                                        afternoonCount
                                                    );
                                                })}
                                            </tbody>
                                        );
                                    })
                                )}
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Create / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">
                                {selectedSchedule ? 'Cập nhật lịch phân công' : 'Thêm lịch phân công mới'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition bg-white p-2 rounded-full shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto w-full">
                            <form id="scheduleForm" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề / Nội dung công việc *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                            placeholder="Nhập tiêu đề cuộc họp, sự kiện..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Loại lịch</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        >
                                            <option value="meeting">Cuộc họp</option>
                                            <option value="event">Sự kiện</option>
                                            <option value="field">Công tác thực địa</option>
                                            <option value="online">Trực tuyến</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Ngày dự kiến *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Giờ bắt đầu *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time_start}
                                            onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Giờ kết thúc *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time_end}
                                            onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Địa điểm</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                                placeholder="Phòng họp số 1, Hội trường..."
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Thành phần tham dự</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                value={formData.attendees}
                                                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                                placeholder="VD: Chủ tịch, Trưởng phòng..."
                                            />
                                        </div>
                                    </div>

                                    {selectedSchedule && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Trạng thái</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-slate-50 font-semibold"
                                            >
                                                <option value="scheduled">Sắp diễn ra</option>
                                                <option value="completed">Đã hoàn thành</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả thêm (Tùy chọn)</label>
                                        <textarea
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                            placeholder="Ghi chú thêm về cuộc họp..."
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                form="scheduleForm"
                                className="px-5 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
                            >
                                {selectedSchedule ? 'Cập nhật' : 'Thêm lịch'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
