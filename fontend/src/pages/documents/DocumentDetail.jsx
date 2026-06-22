import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { documentAPI } from "../../services/api";
import * as docx from "docx-preview";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [viewDoc, setViewDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(true);
    const docxContainerRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
        fetchDocument();
    }, [id]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const data = await documentAPI.getAll(); // Fetch all or fetch one. If there's no getById, simulate it
            let target = null;
            const extractTarget = (list) => list.find(d => d.id === parseInt(id) || d.id === id);

            if (Array.isArray(data)) {
                target = extractTarget(data);
            } else if (data && Array.isArray(data.data)) {
                target = extractTarget(data.data);
            } else if (data && Array.isArray(data.documents)) {
                target = extractTarget(data.documents);
            } else if (data && Array.isArray(data.rows)) {
                target = extractTarget(data.rows);
            }
            if (target) {
                setViewDoc(target);
            } else {
                toast.error("Không tìm thấy văn bản!");
                navigate('/admin/documents');
            }
        } catch (err) {
            console.error("Failed to fetch document:", err);
            toast.error("Lỗi khi tải văn bản.");
            navigate('/admin/documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!viewDoc || !viewDoc.file_url) {
            setPreviewLoading(false);
            return;
        }

        const isDOCX = viewDoc.file_url.match(/\.(docx)$/i);
        if (isDOCX) {
            loadWordDocument();
        } else {
            setPreviewLoading(false);
        }
    }, [viewDoc]);

    const loadWordDocument = async () => {
        try {
            setPreviewLoading(true);
            const fileUrl = `${API_BASE.replace('/api', '')}${viewDoc.file_url}`;
            const response = await fetch(fileUrl);
            const arrayBuffer = await response.arrayBuffer();

            setTimeout(async () => {
                if (docxContainerRef.current) {
                    try {
                        docxContainerRef.current.innerHTML = "";
                        await docx.renderAsync(arrayBuffer, docxContainerRef.current, null, {
                            className: "docx",
                            inWrapper: true,
                            ignoreWidth: false,
                            ignoreHeight: false,
                            ignoreFonts: false,
                            breakPages: true,
                            ignoreLastRenderedPageBreak: false,
                            experimental: false,
                            trimXmlDeclaration: true,
                            debug: false,
                        });
                    } catch (renderErr) {
                        console.error('Error rendering DOCX:', renderErr);
                        docxContainerRef.current.innerHTML = "<p class='p-8 text-rose-500 font-bold'>Lỗi định dạng khi hiển thị file Word. Vui lòng tải về.</p>";
                    }
                }
                setPreviewLoading(false);
            }, 100);
        } catch (err) {
            console.error("Fetch Word file error:", err);
            setPreviewLoading(false);
        }
    };

    const isAdmin = user && ["admin", "leader", "super_admin", "lanh_dao"].includes(user.role);

    const handleApprove = async () => {
        if (!isAdmin || !viewDoc) return;
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
            await documentAPI.update(viewDoc.document_type || viewDoc.type, viewDoc.id, { status: "approved" });
            toast.success("Duyệt thành công!");
            navigate('/admin/documents');
        } catch (err) {
            toast.error("Lỗi khi duyệt văn bản.");
        }
    };

    const handleReject = async () => {
        if (!isAdmin || !viewDoc) return;
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
            await documentAPI.update(viewDoc.document_type || viewDoc.type, viewDoc.id, { status: "rejected", notes: result.value });
            toast.success("Từ chối thành công!");
            navigate('/admin/documents');
        } catch (err) {
            toast.error("Lỗi khi từ chối văn bản.");
        }
    };

    const goBack = () => navigate('/admin/documents');

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">Đang tải dữ liệu...</div>
            </AdminLayout>
        );
    }

    if (!viewDoc) return null;

    const fileUrl = viewDoc.file_url ? `${API_BASE.replace('/api', '')}${viewDoc.file_url}` : null;
    const isImage = viewDoc.file_url?.match(/\.(jpg|jpeg|png|gif)$/i);
    const isPDF = viewDoc.file_url?.match(/\.(pdf)$/i);
    const isDOCX = viewDoc.file_url?.match(/\.(docx)$/i);
    const googleViewerUrl = fileUrl ? `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.protocol + '//' + window.location.host + fileUrl)}&embedded=true` : null;

    return (
        <AdminLayout>
            <div className="bg-white w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden shadow-sm border border-slate-200">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={goBack}
                            className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all border border-slate-100 group">
                            <span className="text-sm font-bold group-hover:-translate-x-1 transition-transform">←</span>
                        </button>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${viewDoc.type === 'incoming' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {viewDoc.type === 'incoming' ? '📂' : '💬'}
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none">{viewDoc.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${(STATUS_LABELS[viewDoc.status] || { color: "bg-gray-100 text-gray-600 border-gray-200" }).color} border`}>
                                    {(STATUS_LABELS[viewDoc.status] || { label: viewDoc.status }).label}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{DOC_TYPE_LABELS[viewDoc.type]}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Split Layout */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-slate-50/30">
                    {/* Left: Information (1/3) */}
                    <div className="w-full md:w-[340px] border-r border-slate-100 flex flex-col shrink-0 bg-white relative z-10">
                        {/* Scrollable Content Container */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-4">
                            <section>
                                <h5 className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase mb-3">Thông tin chi tiết</h5>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {viewDoc.content_summary && (
                                        <section className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                                            <h5 className="text-[9px] font-black text-blue-100 tracking-widest uppercase mb-2 relative z-10">Tóm tắt</h5>
                                            <p className="text-xs leading-relaxed font-medium relative z-10 line-clamp-3">{viewDoc.content_summary}</p>
                                        </section>
                                    )}
                                    {[
                                        { label: "Số hiệu văn bản", value: viewDoc.document_number || "—", icon: "🔢" },
                                        { label: "Đơn vị ban hành", value: viewDoc.source_dest || "—", icon: "🏛️" },
                                        { label: "Người đăng", value: viewDoc.creator_name || "—", icon: "👤" },
                                        { label: "Độ khẩn", value: viewDoc.urgency || "Thường", icon: "⚡" },
                                        { label: "Ngày ban hành", value: viewDoc.issued_date ? new Date(viewDoc.issued_date).toLocaleDateString("vi-VN") : "—", icon: "📅" },
                                        { label: "Ngày tiếp nhận", value: viewDoc.received_date ? new Date(viewDoc.received_date).toLocaleDateString("vi-VN") : "—", icon: "📥" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-3 px-4 py-3 bg-white rounded-[1rem] border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-0.5">{item.label}</p>
                                                <p className="text-sm font-bold text-slate-700 leading-tight truncate">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>



                            {viewDoc.notes && (
                                <section className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <h5 className="text-[9px] font-black text-amber-600 tracking-widest uppercase mb-2">Ghi chú</h5>
                                    <p className="text-xs text-slate-700 italic leading-relaxed font-medium line-clamp-2">"{viewDoc.notes}"</p>
                                </section>
                            )}
                        </div>

                        {/* Fixed Action Buttons */}
                        {isAdmin && viewDoc.status === "pending" && (
                            <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0">
                                <section className="grid grid-cols-2 gap-3">
                                    <button onClick={handleApprove}
                                        className="h-12 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2">
                                        ✅ Duyệt
                                    </button>
                                    <button onClick={handleReject}
                                        className="h-12 bg-white text-rose-600 border border-slate-200 rounded-2xl font-black text-xs hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2">
                                        ❌ Từ chối
                                    </button>
                                </section>
                            </div>
                        )}
                    </div>

                    {/* Right: Preview (2/3) */}
                    <div className="flex-1 min-h-0 bg-slate-100/50 p-6 relative flex flex-col">
                        <div className="absolute top-0 right-0 p-4 z-10">
                            {viewDoc.file_url && (
                                <a href={fileUrl}
                                    download
                                    className="px-6 py-2.5 bg-white text-[#2563EB] rounded-xl text-xs font-black shadow-xl border border-slate-100 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                    <span>📥</span> Tải tệp xuống
                                </a>
                            )}
                        </div>

                        <div className="flex-1 min-h-0 bg-white rounded-3xl shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col group/preview">
                            {!viewDoc.file_url ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50">
                                    <div className="text-6xl mb-4 grayscale opacity-30">📁</div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Không có tệp đính kèm</p>
                                </div>
                            ) : isImage ? (
                                <div className="w-full h-full p-8 flex items-center justify-center bg-slate-50">
                                    <img src={fileUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-white" />
                                </div>
                            ) : isPDF ? (
                                <iframe src={fileUrl} className="w-full h-full border-none" title="PDF Preview"></iframe>
                            ) : isDOCX ? (
                                <div className="w-full h-full overflow-y-auto bg-slate-200 p-6 sm:p-10 docx-preview-container flex-1">
                                    <style>{`
                                        /* Fix page cutoff and blank page issue in docx-preview */
                                        .docx-wrapper {
                                            background: transparent !important;
                                            padding: 0 !important;
                                        }
                                        .docx-wrapper > section.docx {
                                            height: auto !important;
                                            min-height: 297mm !important; /* A4 min-height */
                                            overflow: visible !important;
                                            margin-bottom: 2rem !important;
                                            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
                                            border-radius: 0.25rem !important;
                                        }
                                        .docx-wrapper table {
                                            max-width: 100% !important;
                                        }
                                    `}</style>
                                    <div ref={docxContainerRef} className="docx-viewer-reset w-full mx-auto" />
                                    {previewLoading && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 p-8 rounded-3xl flex flex-col items-center justify-center shadow-2xl backdrop-blur-md z-50">
                                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="mt-5 text-sm font-black text-slate-800 tracking-widest uppercase">Đang căn chỉnh trang...</p>
                                        </div>
                                    )}
                                </div>
                            ) : window.location.hostname === 'localhost' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                                    <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-inner animate-bounce">📄</div>
                                    <h6 className="text-xl font-black text-slate-800 mb-2">Xem trước tệp văn phòng</h6>
                                    <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed font-medium">Bạn đang ở môi trường <span className="text-blue-600 font-bold">Localhost</span>. Trình xem văn bản trực tuyến không thể truy cập tệp trên máy tính cá nhân của bạn.</p>
                                    <a href={fileUrl} target="_blank" rel="noreferrer"
                                        className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">
                                        Mở file trực tiếp (Download) ↗
                                    </a>
                                </div>
                            ) : (
                                <iframe src={googleViewerUrl} className="w-full h-full border-none" title="Office Preview"></iframe>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
