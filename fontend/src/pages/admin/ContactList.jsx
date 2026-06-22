import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { contactAPI } from '../../services/api';
import { exportToExcel } from '../../utils/helpers';
import {
    Download, Search, Mail, Clock, CheckCircle, AlertCircle, Inbox,
    User, Phone, ArrowDown, Trash2, Send, CalendarPlus
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ContactList() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        loadContacts();
    }, [filterStatus]);

    // Auto-scroll chat to bottom when selected contact changes or new reply
    useEffect(() => {
        if (selectedContact && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedContact]);

    const showNotification = (message, type = 'success') => {
        if (type === 'success') toast.success(message);
        else toast.error(message);
    };

    const loadContacts = async () => {
        try {
            const params = { limit: 100 };
            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }
            const response = await contactAPI.getAll(params);

            // Sắp xếp mới nhất lên đầu
            const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setContacts(sorted);
        } catch (error) {
            console.error("Failed to load contacts", error);
            showNotification("Không thể tải danh sách liên hệ", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await contactAPI.updateStatus(id, { status: newStatus });
            setContacts(contacts.map(c => c.id === id ? { ...c, status: newStatus } : c));
            if (selectedContact && selectedContact.id === id) {
                setSelectedContact({ ...selectedContact, status: newStatus });
            }
            showNotification('Cập nhật trạng thái thành công!');
        } catch (error) {
            console.error("Failed to update status", error);
            showNotification("Cập nhật trạng thái thất bại", "error");
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa liên hệ này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        try {
            await contactAPI.delete(id);
            setContacts(contacts.filter(c => c.id !== id));
            setSelectedContact(null);
            showNotification('Xóa thành công!');
        } catch (error) {
            console.error("Failed to delete contact", error);
            showNotification("Xóa thất bại", "error");
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            showNotification('Vui lòng nhập nội dung phản hồi', 'error');
            return;
        }

        setSendingReply(true);
        try {
            const response = await contactAPI.sendReply(selectedContact.id, replyText);
            const updatedContact = response.data;
            setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
            setSelectedContact(updatedContact);
            setReplyText('');
            showNotification('Gửi tin nhắn phản hồi thành công!');
        } catch (error) {
            console.error("Failed to send reply", error);
            showNotification(error.response?.data?.error || "Gửi phản hồi thất bại", "error");
        } finally {
            setSendingReply(false);
        }
    };

    const handleQuickReply = (template) => {
        setReplyText(template);
    };

    const handleExport = () => {
        const columns = [
            { header: 'ID', key: 'id' },
            { header: 'Người gửi', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Số điện thoại', key: 'phone' },
            { header: 'Tiêu đề', key: 'subject' },
            { header: 'Nội dung', key: 'message' },
            { header: 'Ngày gửi', key: 'created_at' },
            { header: 'Trạng thái', key: 'statusLabel' }
        ];

        const exportData = filteredContacts.map(item => {
            const labels = { pending: 'Chờ xử lý', replied: 'Đã trả lời', spam: 'Spam' };
            return {
                ...item,
                created_at: new Date(item.created_at).toLocaleString('vi-VN'),
                statusLabel: labels[item.status] || item.status
            };
        });

        exportToExcel(exportData, 'Danh_sach_lien_he', columns, 'BÁO CÁO TỔNG HỢP LIÊN HỆ CÔNG TÁC');
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', icon: Clock, label: 'Chờ xử lý' },
            replied: { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', icon: CheckCircle, label: 'Đã trả lời' },
            spam: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', icon: AlertCircle, label: 'Spam' }
        };
        const current = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Inbox, label: status };
        const Icon = current.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${current.bg} ${current.text} border border-current border-opacity-20`}>
                <Icon className="w-3.5 h-3.5" />
                {current.label}
            </span>
        );
    };

    const filteredContacts = contacts.filter(contact => {
        const searchLower = searchTerm.toLowerCase();
        return (
            contact.name.toLowerCase().includes(searchLower) ||
            contact.email.toLowerCase().includes(searchLower) ||
            contact.subject.toLowerCase().includes(searchLower) ||
            contact.message.toLowerCase().includes(searchLower)
        );
    });

    // Mẫu tin nhắn hẹn lịch
    const quickReplies = [
        "Chào bạn, hồ sơ của bạn đã hoàn tất. Mời bạn đến cơ quan nhận kết quả vào lúc 08h00 - 11h00 ngày mai.",
        "Chào bạn, vui lòng mang theo CMND/CCCD gốc để đối chiếu khi đến nhận kết quả.",
        "Dạ chào bạn, xin lỗi vì sự bất tiện này..."
    ];

    // Get Admin & Citizen Replies array with fallback to legacy single string
    const getRepliesArray = (contact) => {
        if (!contact) return [];
        if (contact.replies && Array.isArray(contact.replies) && contact.replies.length > 0) {
            return contact.replies;
        }
        if (contact.admin_reply) {
            return [{ message: contact.admin_reply, sent_at: contact.replied_at, sender_type: 'citizen' }];
        }
        return [];
    };

    return (
        <AdminLayout>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="w-full h-full flex flex-col pb-8 font-inter">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-[22px] font-bold text-[#2A3F8B] flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white">
                            <Mail className="w-4 h-4" />
                        </div>
                        Nhắn tin Liên hệ & Hẹn lịch
                    </h1>
                    <button
                        onClick={handleExport}
                        className="bg-[#059669] text-white hover:bg-[#047857] px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-semibold shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm người nhắn, số điện thoại, nội dung..."
                            className="w-full pl-11 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-[#4F46E5] focus:outline-none transition-all shadow-sm text-[14px]"
                        />
                    </div>
                    <div className="relative w-full md:w-[220px]">
                        <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-[#4F46E5] opacity-80" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:border-[#4F46E5] focus:outline-none transition-all appearance-none shadow-sm text-[14px] font-medium text-gray-700"
                        >
                            <option value="all">Tất cả cuộc hội thoại</option>
                            <option value="pending">Tin nhắn mới</option>
                            <option value="replied">Đã nhắn lại</option>
                            <option value="spam">Spam</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                            <ArrowDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                </div>

                {/* Main Split Layout - Master/Detail Chat UI */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left Panel: Contact List */}
                    <div className="lg:col-span-4 bg-white rounded-2xl flex flex-col border border-gray-200 shadow-sm overflow-hidden h-[680px]">
                        <div className="p-4 bg-gray-50 flex items-center justify-between border-b border-gray-200">
                            <div className="font-bold text-gray-900 text-sm">Hộp thư đến</div>
                            <div className="text-[12px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{filteredContacts.length}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="text-center py-10 text-gray-500 text-sm">Đang tải...</div>
                            ) : filteredContacts.length > 0 ? (
                                filteredContacts.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedContact(item)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${selectedContact?.id === item.id ? 'bg-[#EEF2FF] border-l-4 border-l-[#4F46E5]' : 'border-l-4 border-l-transparent'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="font-bold text-gray-900 text-[14px] line-clamp-1">{item.name}</div>
                                            <div className="text-[11px] text-gray-500 whitespace-nowrap ml-2">
                                                {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                        <div className="text-[13px] font-semibold text-gray-800 mb-1 line-clamp-1">{item.subject}</div>
                                        <div className="text-[12px] text-gray-500 mb-2 line-clamp-1">{item.message}</div>
                                        <div>{getStatusBadge(item.status)}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500 text-sm">Trống</div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Chat Box */}
                    <div className="lg:col-span-8 bg-white rounded-2xl flex flex-col h-[680px] shadow-sm border border-gray-200 overflow-hidden relative">
                        {selectedContact ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white z-10 shadow-sm shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-100 flex items-center justify-center font-bold text-indigo-700 shadow-sm border border-white">
                                            {selectedContact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-900 text-sm leading-tight">{selectedContact.name}</h2>
                                            <div className="flex items-center gap-3 text-[12px] text-gray-500 font-medium">
                                                <span>{selectedContact.phone}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{selectedContact.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={selectedContact.status}
                                            onChange={(e) => handleUpdateStatus(selectedContact.id, e.target.value)}
                                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 font-bold outline-none cursor-pointer"
                                        >
                                            <option value="pending">Chờ xử lý</option>
                                            <option value="replied">Đã trả lời</option>
                                            <option value="spam">Spam</option>
                                        </select>
                                        <button
                                            onClick={() => handleDelete(selectedContact.id)}
                                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Xóa cuộc trò chuyện"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Chat History Window */}
                                <div className="flex-1 overflow-y-auto p-5 bg-[#F8FAF9] custom-scrollbar space-y-6">

                                    {/* System Subject separator */}
                                    <div className="flex justify-center">
                                        <div className="bg-gray-200/70 text-gray-600 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide">
                                            Chủ đề: {selectedContact.subject}
                                        </div>
                                    </div>

                                    {/* User Message Bubble */}
                                    <div className="flex border-opacity-0">
                                        <div className="flex flex-col items-start max-w-[80%] md:max-w-[70%]">
                                            <div className="flex items-baseline gap-2 mb-1 ml-2">
                                                <span className="text-[12px] font-bold text-gray-700">{selectedContact.name}</span>
                                                <span className="text-[11px] text-gray-400">{new Date(selectedContact.created_at).toLocaleString('vi-VN')}</span>
                                            </div>
                                            <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-[14px] text-gray-800 whitespace-pre-wrap leading-relaxed inline-block">
                                                {selectedContact.message}
                                            </div>
                                        </div>
                                    </div>

                                    {/* History Messages Loop */}
                                    {getRepliesArray(selectedContact).map((reply, index) => {
                                        const isCitizen = reply.sender_type === 'citizen' || reply.sender_type === 'user';

                                        if (isCitizen) {
                                            return (
                                                <div key={index} className="flex border-opacity-0">
                                                    <div className="flex flex-col items-start max-w-[80%] md:max-w-[70%]">
                                                        <div className="flex items-baseline gap-2 mb-1 ml-2">
                                                            <span className="text-[12px] font-bold text-gray-700">{selectedContact.name}</span>
                                                            <span className="text-[11px] text-gray-400">{reply.sent_at ? new Date(reply.sent_at).toLocaleString('vi-VN') : ''}</span>
                                                        </div>
                                                        <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 text-[14px] text-gray-800 whitespace-pre-wrap leading-relaxed inline-block">
                                                            {reply.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={index} className="flex justify-end border-opacity-0">
                                                    <div className="flex flex-col items-end max-w-[80%] md:max-w-[70%]">
                                                        <div className="flex items-baseline gap-2 mb-1 mr-2">
                                                            <span className="text-[11px] text-gray-400">{reply.sent_at ? new Date(reply.sent_at).toLocaleString('vi-VN') : 'Gần đây'}</span>
                                                            <span className="text-[12px] font-bold text-[#4F46E5]">Cơ quan Hành chính (Bạn)</span>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-[#4F46E5] to-[#4338CA] px-5 py-3 rounded-2xl rounded-tr-sm shadow-md text-[14px] text-white whitespace-pre-wrap leading-relaxed inline-block text-left">
                                                            {reply.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}

                                    {/* Empty div for auto-scrolling to bottom */}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Chat Input Area */}
                                <div className="bg-white border-t border-gray-200 p-4 shrink-0">
                                    {/* Quick Replies */}
                                    <div className="flex overflow-x-auto gap-2 mb-3 pb-1 custom-scrollbar">
                                        {quickReplies.map((qr, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleQuickReply(qr)}
                                                className="shrink-0 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full text-[12px] font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                                            >
                                                <CalendarPlus className="w-3.5 h-3.5" /> Cài mẫu: Hẹn lịch / Bổ sung
                                            </button>
                                        ))}
                                    </div>

                                    {/* Input Field */}
                                    <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-[16px] p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Nhập nội dung trao đổi, báo kết quả hoặc hẹn lịch tiếp theo..."
                                            className="flex-1 max-h-[120px] min-h-[44px] bg-transparent border-none focus:ring-0 resize-none text-[14px] py-1.5 px-2 text-gray-800"
                                            rows="1"
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = (e.target.scrollHeight) + 'px';
                                            }}
                                            disabled={sendingReply}
                                        />
                                        <button
                                            onClick={handleSendReply}
                                            disabled={sendingReply || !replyText.trim()}
                                            className={`p-3 rounded-[14px] shrink-0 transition-all ${sendingReply || !replyText.trim()
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-md shadow-indigo-600/30 hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {sendingReply ? (
                                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <Send className="w-5 h-5 ml-0.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#F8FAF9]">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                                    <Inbox className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="font-bold text-[16px] text-gray-400">Chọn một tin nhắn để bắt đầu trao đổi</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94A3B8; }
            `}</style>
        </AdminLayout>
    );
}
