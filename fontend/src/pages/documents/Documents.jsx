import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { documentAPI } from "../../services/api";
import mammoth from "mammoth";
import axios from "axios";

import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const URGENCY_OPTIONS = ["Thường", "Khẩn", "Hỏa tốc"];
const STATUS_OPTIONS = ["draft", "pending", "approved", "rejected", "archived"];
const STATUS_LABELS = {
    draft: { label: "Nháp", color: "bg-gray-100 text-gray-600" },
    pending: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-700" },
    approved: { label: "Đã duyệt", color: "bg-green-100 text-green-700" },
    rejected: { label: "Từ chối", color: "bg-red-100 text-red-700" },
    archived: { label: "Lưu trữ", color: "bg-slate-100 text-slate-600" },
};

const DOC_TYPE_LABELS = {
    incoming: "Văn bản đến",
    outgoing: "Văn bản đi",
    pending: "Chờ duyệt",
};

const emptyForm = {
    title: "",
    document_number: "",
    type: "incoming",
    source_dest: "",
    issued_date: "",
    received_date: "",
    urgency: "Thường",
    content_summary: "",
    status: "pending",
    notes: "",
    file: null,
};

export default function DocumentsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("incoming");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await documentAPI.getAll();
            // Normalize: API có thể trả về array hoặc object
            if (Array.isArray(data)) {
                setDocuments(data);
            } else if (data && Array.isArray(data.data)) {
                setDocuments(data.data);
            } else if (data && Array.isArray(data.documents)) {
                setDocuments(data.documents);
            } else if (data && Array.isArray(data.rows)) {
                setDocuments(data.rows);
            } else {
                setDocuments([]);
            }
        } catch (err) {
            console.error("Failed to fetch documents:", err);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = user && ["admin", "leader", "super_admin", "lanh_dao"].includes(user.role);
    const docTypes = isAdmin ? ["incoming", "outgoing", "pending"] : ["incoming", "outgoing"];

    const filtered = documents.filter(doc => {
        const matchTab = activeTab === "pending" ? doc.status === "pending" : doc.type === activeTab;
        const matchSearch = (doc.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (doc.document_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (doc.source_dest?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "all" || doc.status === statusFilter;
        return matchTab && matchSearch && matchStatus;
    });

    const openCreate = () => {
        setEditingDoc(null);
        setFormData({ ...emptyForm, type: activeTab });
        setShowModal(true);
    };

    const openEdit = (doc) => {
        setEditingDoc(doc);
        setFormData({
            title: doc.title || "",
            document_number: doc.document_number || "",
            type: doc.type || "incoming",
            source_dest: doc.source_dest || "",
            issued_date: doc.issued_date ? (typeof doc.issued_date === 'string' ? doc.issued_date.substring(0, 10) : new Date(doc.issued_date).toISOString().substring(0, 10)) : "",
            received_date: doc.received_date ? (typeof doc.received_date === 'string' ? doc.received_date.substring(0, 10) : new Date(doc.received_date).toISOString().substring(0, 10)) : "",
            urgency: doc.urgency || "Thường",
            content_summary: doc.content_summary || "",
            status: doc.status || "pending",
            notes: doc.notes || "",
            file: null,
        });
        setShowModal(true);
    };

    const openView = (doc) => {
        navigate(`/admin/documents/view/${doc.id}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === "file") {
                    if (formData.file) fd.append("file", formData.file);
                } else {
                    fd.append(key, formData[key] || "");
                }
            });

            const finalType = formData.type || activeTab;
            if (editingDoc) {
                await documentAPI.update(finalType, editingDoc.id, fd);
            } else {
                await documentAPI.create(finalType, fd);
            }

            setShowModal(false);
            fetchDocuments();
        } catch (err) {
            console.error("Submit error:", err);
            toast.error("Có lỗi khi lưu văn bản. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (doc) => {
        if (!isAdmin) return;
        const result = await Swal.fire({
            title: 'Xác nhận duyệt',
            text: 'Bạn có chắc chắn muốn duyệt văn bản này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy'
        });
        if (!result.isConfirmed) return;
        
        try {
            await documentAPI.update(doc.document_type, doc.id, { status: "approved" });
            fetchDocuments();
        } catch (err) {
            toast.error("Lỗi khi duyệt văn bản.");
        }
    };

    const handleReject = async (doc) => {
        if (!isAdmin) return;
        const result = await Swal.fire({
            title: 'Từ chối văn bản',
            input: 'textarea',
            inputLabel: 'Lý do từ chối',
            inputPlaceholder: 'Nhập lý do chi tiết...',
            showCancelButton: true,
            confirmButtonText: 'Từ chối',
            cancelButtonText: 'Hủy',
            inputValidator: (value) => {
                if (!value) {
                    return 'Vui lòng nhập lý do từ chối!'
                }
            }
        });
        
        if (!result.isConfirmed || !result.value) return;
        
        try {
            await documentAPI.update(doc.document_type, doc.id, { status: "rejected", notes: result.value });
            fetchDocuments();
        } catch (err) {
            toast.error("Lỗi khi từ chối văn bản.");
        }
    };

    const handleDelete = async (doc) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa',
            text: `Bạn có chắc chắn muốn xóa văn bản "${doc.title}"? Dữ liệu không thể khôi phục!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy'
        });
        
        if (!result.isConfirmed) return;
        
        try {
            await documentAPI.delete(doc.document_type, doc.id);
            fetchDocuments();
        } catch (err) {
            toast.error("Lỗi khi xóa văn bản.");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        {/* <h2 className="text-2xl font-black text-gray-800">Quản lý văn bản</h2>
                        <p className="text-sm text-gray-400 mt-1">Tiếp nhận và xử lý văn bản đến, đi</p> */}
                    </div>
                    <button onClick={openCreate}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center gap-2 w-fit">
                        + Thêm văn bản
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
                    {docTypes.map(type => (
                        <button key={type} onClick={() => setActiveTab(type)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === type ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                            {DOC_TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề, số hiệu, đơn vị..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                    />
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm bg-white w-48">
                        <option value="all">Tất cả trạng thái</option>
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>
                        ))}
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {[{ key: "all", label: "Tất cả" }, ...STATUS_OPTIONS.map(s => ({ key: s, label: STATUS_LABELS[s].label }))].map(item => {
                        const count = item.key === "all"
                            ? documents.filter(d => activeTab === 'pending' ? d.status === 'pending' : d.type === activeTab).length
                            : documents.filter(d => (activeTab === 'pending' ? d.status === 'pending' : d.type === activeTab) && d.status === item.key).length;
                        return (
                            <button key={item.key} onClick={() => setStatusFilter(item.key)}
                                className={`p-2 rounded-2xl text-left border transition-all ${statusFilter === item.key ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
                                <p className="text-lg font-black text-gray-800">{count}</p>
                                <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">{item.label}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Document List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Số hiệu</th>
                                        <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Tiêu đề</th>
                                        <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Đơn vị</th>
                                        <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Ngày</th>
                                        <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Độ khẩn</th>
                                        <th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                                        <th className="px-5 py-3 text-center text-[9px] font-black text-gray-400 uppercase tracking-widest">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(doc => (
                                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-black text-blue-600">{doc.document_number || `#${doc.id}`}</span>
                                            </td>
                                            <td className="px-5 py-4 max-w-xs">
                                                <p className="text-sm font-bold text-gray-800 line-clamp-1">{doc.title}</p>
                                                {doc.content_summary && (
                                                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{doc.content_summary}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-xs text-gray-600">{doc.source_dest || "—"}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-xs text-gray-500">
                                                    {doc.issued_date ? new Date(doc.issued_date).toLocaleDateString("vi-VN") : "—"}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${doc.urgency === "Hỏa tốc" ? "bg-red-100 text-red-700" : doc.urgency === "Khẩn" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                                                    {doc.urgency || "Thường"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${(STATUS_LABELS[doc.status] || { color: "bg-gray-100 text-gray-600" }).color}`}>
                                                    {(STATUS_LABELS[doc.status] || { label: doc.status }).label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => openView(doc)}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-all">
                                                        Xem
                                                    </button>
                                                    {(isAdmin || doc.created_by === user?.id) && (
                                                        <button onClick={() => openEdit(doc)}
                                                            className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-all">
                                                            Sửa
                                                        </button>
                                                    )}
                                                    {isAdmin && doc.status === "pending" && (
                                                        <>
                                                            <button onClick={() => handleApprove(doc)}
                                                                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold hover:bg-green-100 transition-all">
                                                                Duyệt
                                                            </button>
                                                            <button onClick={() => handleReject(doc)}
                                                                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all">
                                                                Từ chối
                                                            </button>
                                                        </>
                                                    )}
                                                    {(isAdmin || doc.created_by === user?.id) && (
                                                        <button onClick={() => handleDelete(doc)}
                                                            className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-all">
                                                            Xóa
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📁</div>
                            <p className="text-gray-500 font-medium">Chưa có văn bản nào</p>
                            <button onClick={openCreate}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
                                + Thêm văn bản đầu tiên
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal content remains same */}
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xl font-black text-gray-800">
                                {editingDoc ? "Chỉnh sửa văn bản" : "Thêm văn bản mới"}
                            </h4>
                            <button onClick={() => setShowModal(false)}
                                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Tiêu đề văn bản *</label>
                                    <input type="text" required value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm"
                                        placeholder="Tiêu đề đầy đủ của văn bản" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Số hiệu văn bản</label>
                                    <input type="text" value={formData.document_number}
                                        onChange={e => setFormData({ ...formData, document_number: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm"
                                        placeholder="VD: 123/QĐ-UBND" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Loại văn bản *</label>
                                    <select value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm bg-white">
                                        <option value="incoming">Văn bản đến</option>
                                        <option value="outgoing">Văn bản đi</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Đơn vị ban hành</label>
                                    <input type="text" value={formData.source_dest}
                                        onChange={e => setFormData({ ...formData, source_dest: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm"
                                        placeholder="Tên cơ quan ban hành" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Độ khẩn</label>
                                    <select value={formData.urgency}
                                        onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm bg-white">
                                        {URGENCY_OPTIONS.map(u => <option key={u}>{u}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Ngày ban hành</label>
                                    <input type="date" value={formData.issued_date}
                                        onChange={e => setFormData({ ...formData, issued_date: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Ngày nhận</label>
                                    <input type="date" value={formData.received_date}
                                        onChange={e => setFormData({ ...formData, received_date: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Trạng thái</label>
                                    <select value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm bg-white">
                                        {STATUS_OPTIONS.filter(s => isAdmin || s !== "approved").map(s => (
                                            <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Trích yếu nội dung</label>
                                    <textarea rows={3} value={formData.content_summary}
                                        onChange={e => setFormData({ ...formData, content_summary: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm resize-none"
                                        placeholder="Tóm tắt nội dung chính của văn bản..." />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Ghi chú</label>
                                    <textarea rows={2} value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm resize-none"
                                        placeholder="Ghi chú bổ sung..." />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">Đính kèm file</label>
                                    <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
                                        onChange={e => setFormData({ ...formData, file: e.target.files[0] || null })}
                                        className="w-full px-4 py-3 border border-dashed border-gray-300 rounded-2xl text-sm text-gray-500" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-60 text-sm">
                                    {submitting ? "Đang lưu..." : editingDoc ? "Cập nhật" : "Thêm mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
