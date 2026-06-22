import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { documentAPI } from '../../services/api';
import { format } from 'date-fns';
import ApprovalModal from '../../components/documents/ApprovalModal';
import DocumentViewer from '../../components/documents/DocumentViewer';
import { Eye, Download } from 'lucide-react';

import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function Outgoing() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalDoc, setApprovalDoc] = useState(null);
    const [approvalAction, setApprovalAction] = useState('approve');
    const [viewingDoc, setViewingDoc] = useState(null);

    // Get user role for permissions
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const canApprove = ['admin', 'leader'].includes(user.role);

    // Form state
    const [formData, setFormData] = useState({
        document_number: '',
        title: '',
        recipient: '',
        sent_date: format(new Date(), 'yyyy-MM-dd'),
        status: 'draft',
        priority: 'normal',
        notes: ''
    });

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await documentAPI.getAll('outgoing');
            setDocuments(response.data || []);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoc) {
                await documentAPI.update('outgoing', editingDoc.id, formData);
            } else {
                await documentAPI.create('outgoing', formData);
            }
            fetchDocuments();
            setShowModal(false);
            resetForm();
            toast.success(editingDoc ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        } catch (error) {
            console.error("Submit error", error);
            toast.error('Có lỗi xảy ra!');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn xóa văn bản này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });
        if (result.isConfirmed) {
            try {
                await documentAPI.delete('outgoing', id);
                fetchDocuments();
            } catch (error) {
                console.error("Delete error", error);
                toast.error('Không thể xóa văn bản này');
            }
        }
    };

    const handleEdit = (doc) => {
        setEditingDoc(doc);
        setFormData({
            document_number: doc.document_number,
            title: doc.title,
            recipient: doc.recipient,
            sent_date: doc.sent_date ? format(new Date(doc.sent_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            status: doc.status,
            priority: doc.priority,
            notes: doc.notes || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingDoc(null);
        setFormData({
            document_number: '',
            title: '',
            recipient: '',
            sent_date: format(new Date(), 'yyyy-MM-dd'),
            status: 'draft',
            priority: 'normal',
            notes: ''
        });
    };

    const handleSendForApproval = async (doc) => {
        try {
            await documentAPI.update('outgoing', doc.id, {
                ...doc,
                status: 'pending_approval'
            });
            fetchDocuments();
            toast.info('Đã gửi văn bản để phê duyệt!');
        } catch (error) {
            console.error('Send for approval error:', error);
            toast.error('Có lỗi xảy ra!');
        }
    };

    const handleApprove = (doc) => {
        setApprovalDoc(doc);
        setApprovalAction('approve');
        setShowApprovalModal(true);
    };

    const handleReject = (doc) => {
        setApprovalDoc(doc);
        setApprovalAction('reject');
        setShowApprovalModal(true);
    };

    const handleApprovalSuccess = () => {
        fetchDocuments();
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.document_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-600 border-gray-200',
            pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-blue-100 text-blue-800 border-blue-200',
            sent: 'bg-teal-100 text-teal-800 border-teal-200'
        };
        const labels = {
            draft: 'Dự thảo',
            pending_approval: 'Chờ duyệt',
            approved: 'Đã duyệt',
            sent: 'Đã gửi'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.draft}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        Quản lý Văn bản đi
                    </h1>
                    <p className="text-sm text-gray-500">Soạn thảo, duyệt và phát hành văn bản</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl shadow-lg hover:bg-teal-700 transition-all font-medium text-sm"
                >
                    <span>+</span> Soạn văn bản mới
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xl font-bold">
                            📤
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Văn bản đã gửi</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {documents.filter(d => d.status === 'sent').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl font-bold">
                            ✓
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Đã duyệt</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {documents.filter(d => d.status === 'approved').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xl font-bold">
                            ✍️
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Chờ phê duyệt</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {documents.filter(d => d.status === 'pending_approval').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xl font-bold">
                            📝
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Dự thảo</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {documents.filter(d => d.status === 'draft').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo số hiệu, trích yếu..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="draft">📝 Dự thảo</option>
                    <option value="pending_approval">🟡 Chờ duyệt</option>
                    <option value="sent">🟢 Đã gửi</option>
                </select>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                                <th className="px-6 py-4 font-semibold">Số hiệu</th>
                                <th className="px-6 py-4 font-semibold">Trích yếu / Nội dung</th>
                                <th className="px-6 py-4 font-semibold">Người soạn</th>
                                {canApprove && <th className="px-6 py-4 font-semibold">Người duyệt</th>}
                                <th className="px-6 py-4 font-semibold">Nơi nhận</th>
                                <th className="px-6 py-4 font-semibold">Ngày gửi</th>
                                <th className="px-6 py-4 font-semibold">Độ khẩn</th>
                                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-center">Tệp tin</th>
                                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500 italic">Không tìm thấy văn bản nào</td></tr>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-teal-50/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-teal-600 font-medium">{doc.document_number || '---'}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800 line-clamp-2" title={doc.title}>{doc.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700 font-medium">
                                                👤 {doc.created_by_name || 'Tôi'}
                                            </span>
                                        </td>
                                        {canApprove && (
                                            <td className="px-6 py-4">
                                                {doc.approved_by_name ? (
                                                    <span className="text-sm text-gray-700 font-medium">
                                                        ✅ {doc.approved_by_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">...</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-gray-600">{doc.recipient}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {doc.sent_date ? format(new Date(doc.sent_date), 'dd/MM/yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${doc.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {doc.priority === 'urgent' ? 'KHẨN' : 'Thường'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                                        <td className="px-6 py-4 text-center">
                                            {doc.file_url ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* View button for PDF and Word files */}
                                                    {(() => {
                                                        const fileName = doc.file_url.split('/').pop();
                                                        const fileExt = fileName.split('.').pop().toLowerCase();
                                                        const viewableExts = ['pdf', 'doc', 'docx'];

                                                        if (viewableExts.includes(fileExt)) {
                                                            return (
                                                                <button
                                                                    onClick={() => setViewingDoc(doc)}
                                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110 transition-all"
                                                                    title="Xem chi tiết"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                            );
                                                        }
                                                        return null;
                                                    })()}

                                                    {/* Download button */}
                                                    <a
                                                        href={doc.file_url.startsWith('http') ? doc.file_url : `${API_BASE_URL}${doc.file_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-green-600 hover:bg-green-100 hover:scale-110 transition-all"
                                                        title="Tải về"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xl" title="Không có file">•</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {doc.status === 'draft' && (
                                                <button
                                                    onClick={() => handleSendForApproval(doc)}
                                                    className="text-orange-600 hover:text-orange-800 font-medium text-sm"
                                                    title="Gửi duyệt"
                                                >
                                                    📨 Gửi duyệt
                                                </button>
                                            )}

                                            {canApprove && doc.status === 'pending_approval' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(doc)}
                                                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                                                        title="Phê duyệt"
                                                    >
                                                        ✓ Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(doc)}
                                                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                                                        title="Từ chối"
                                                    >
                                                        ✗ Từ chối
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => handleEdit(doc)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="text-red-500 hover:text-red-700 font-medium text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingDoc ? '✏️ Cập nhật văn bản' : '➕ Soạn văn bản mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 text-2xl">
                                &times;
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số ký hiệu (Nếu có)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.document_number}
                                        onChange={e => setFormData({ ...formData, document_number: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nơi nhận</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.recipient}
                                        onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Trích yếu / Nội dung</label>
                                    <textarea
                                        required
                                        rows="3"
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày phát hành/gửi</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                        value={formData.sent_date}
                                        onChange={e => setFormData({ ...formData, sent_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Độ khẩn</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="normal">Thường</option>
                                        <option value="urgent">Khẩn</option>
                                        <option value="top_priority">Thượng khẩn</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="draft">Dự thảo</option>
                                        <option value="pending_approval">Chờ duyệt</option>
                                        <option value="approved">Đã duyệt</option>
                                        <option value="sent">Đã phát hành</option>
                                    </select>
                                </div>

                                <div className="col-span-2 pt-4 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-lg shadow-teal-500/30"
                                    >
                                        {editingDoc ? 'Lưu thay đổi' : 'Lưu văn bản'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && approvalDoc && (
                <ApprovalModal
                    document={approvalDoc}
                    action={approvalAction}
                    onClose={() => setShowApprovalModal(false)}
                    onSuccess={handleApprovalSuccess}
                />
            )}

            {/* Document Viewer Modal */}
            {viewingDoc && (
                <DocumentViewer
                    document={viewingDoc}
                    onClose={() => setViewingDoc(null)}
                />
            )}
        </AdminLayout>
    );
}
