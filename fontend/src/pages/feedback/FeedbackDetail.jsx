import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { feedbackAPI } from '../../services/api';

import { toast } from 'react-toastify';
export default function FeedbackDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState(null);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const data = await feedbackAPI.getById(id);
                setFeedback(data);
                setStatus(data.status);
                setResponse(data.admin_note || data.response || '');
            } catch (error) {
                console.error("Failed to fetch feedback", error);
                // navigate('/admin/feedbacks');
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [id, navigate]);

    const handleSubmitResponse = async (e) => {
        e.preventDefault();
        try {
            const updatedFeedback = await feedbackAPI.updateStatus(id, status, response);
            setFeedback(prev => ({ ...prev, ...updatedFeedback.data }));
            toast.success('Cập nhật thành công!');
        } catch (error) {
            console.error("Failed to update feedback", error);
            toast.error('Cập nhật thất bại: ' + (error.response?.data?.error || error.message));
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!feedback) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold text-gray-700">Không tìm thấy phản ánh</h2>
                    <Link to="/admin/feedbacks" className="text-blue-600 hover:underline mt-4 inline-block">
                        Quay lại danh sách
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    const getStatusBadge = (st) => {
        const styles = {
            new: 'bg-red-100 text-red-700',
            pending: 'bg-red-100 text-red-700',
            processing: 'bg-blue-100 text-blue-700',
            resolved: 'bg-green-100 text-green-700'
        };
        const labels = {
            new: 'Mới tiếp nhận',
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            resolved: 'Đã giải quyết'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[st] || 'bg-gray-100'}`}>
                {labels[st] || st}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin/feedbacks" className="text-gray-600 hover:text-gray-800">
                        ← Quay lại danh sách
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Chi tiết phản ánh {feedback.feedback_code || `PA${String(feedback.id).padStart(3, '0')}`}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {feedback.subject}
                            </h2>
                            {getStatusBadge(feedback.status)}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {feedback.content}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm border-t border-gray-100 pt-4">
                            <div>
                                <p className="text-gray-500">Thời gian gửi</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(feedback.created_at).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>

                        {/* Attachments if any */}
                        {feedback.attachments && feedback.attachments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Đính kèm:</p>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.attachments.map((att, idx) => (
                                        <a
                                            key={idx}
                                            href={att.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
                                        >
                                            {att.file_name || `File ${idx + 1}`}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Response Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                            Xử lý & Phản hồi
                        </h3>
                        <form onSubmit={handleSubmitResponse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Trạng thái xử lý
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="pending">Chờ xử lý</option>
                                    <option value="processing">Đang xử lý</option>
                                    <option value="resolved">Đã giải quyết</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nội dung trả lời
                                </label>
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="Nhập nội dung trả lời cho công dân..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none min-h-[150px]"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Cập nhật & Gửi phản hồi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                            Thông tin người gửi
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {feedback.citizen_name ? feedback.citizen_name.charAt(0) : 'U'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{feedback.citizen_name || feedback.citizen_full_name || 'Công dân'}</p>
                                    <p className="text-xs text-gray-500">Công dân</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-800">{feedback.citizen_email || 'Không có'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Số điện thoại</p>
                                    <p className="text-sm font-medium text-gray-800">{feedback.citizen_phone || 'Không có'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Địa chỉ</p>
                                    <p className="text-sm font-medium text-gray-800">{feedback.citizen_address || 'Không có'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
