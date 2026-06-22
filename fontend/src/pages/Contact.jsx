import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { contactAPI } from "../services/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import Header from '../components/layout/Header';

export default function ContactPage() {
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

    // Auth Status
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('inbox'); // inbox, form

    // Form State
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

    // Inbox State
    const [myContacts, setMyContacts] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData(prev => ({
                ...prev,
                name: parsedUser.full_name || parsedUser.username || "",
                email: parsedUser.email || "",
                phone: parsedUser.phone || ""
            }));
            fetchMyContacts();
        } else {
            setActiveTab('form');
        }
    }, []);

    useEffect(() => {
        if (selectedThread && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedThread]);

    const fetchMyContacts = async () => {
        try {
            const response = await contactAPI.getMyContacts();
            setMyContacts(response.data);
            if (response.data.length === 0) {
                setActiveTab('form'); // Auto switch to form if no history
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await contactAPI.create(formData);
            toast.success("Đã gửi thông tin liên hệ thành công!");
            setFormData({ ...formData, subject: "", message: "" });
            if (user) {
                setActiveTab('inbox');
                const newData = [response.data, ...myContacts];
                setMyContacts(newData);
                setSelectedThread(response.data);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendUserReply = async () => {
        if (!replyText.trim() || !selectedThread) return;
        setSendingReply(true);
        try {
            const response = await contactAPI.userReply(selectedThread.id, replyText);

            // Update local state
            const updatedContact = response.data;
            setMyContacts(myContacts.map(c => c.id === updatedContact.id ? updatedContact : c));
            setSelectedThread(updatedContact);
            setReplyText('');
        } catch (error) {
            toast.error(error.response?.data?.error || "Gửi lỗi. Thử lại sau!");
        } finally {
            setSendingReply(false);
        }
    };

    // Helper functions
    const getRepliesArray = (contact) => {
        if (!contact) return [];
        if (contact.replies && Array.isArray(contact.replies) && contact.replies.length > 0) {
            return contact.replies;
        }
        if (contact.admin_reply) {
            return [{ message: contact.admin_reply, sent_at: contact.replied_at, sender_type: 'admin' }];
        }
        return [];
    };

    const menuItems = [
        { path: "/", label: "Trang chủ", icon: "🏠" },
        { path: "/services", label: "Dịch vụ công", icon: "📋" },
        { path: "/track", label: "Tra cứu hồ sơ", icon: "🔍" },
        { path: "/feedback", label: "Phản ánh kiến nghị", icon: "💬" },
        { path: "/news", label: "Tin tức", icon: "📰" },
        { path: "/contact", label: "Liên hệ", icon: "📞" },
    ];

    const contactInfo = [
        { icon: "📍", title: "Địa chỉ trụ sở", content: "Số 04 đường Lê Duẩn, khóm Mỹ Phú, phường Mỹ Trà, TP. Cao Lãnh, Đồng Tháp" },
        { icon: "📞", title: "Tổng đài hỗ trợ", content: "(028) 1234 5678" },
        { icon: "📧", title: "Hòm thư điện tử", content: "ubnd.myphu@caolanh.gov.vn" },
        { icon: "🕐", title: "Thời gian làm việc", content: "Sáng 7:30-11:30, Chiều 13:30-17:00" },
    ];

    const departments = [
        { name: "Bộ phận Tiếp nhận & Trả kết quả (Một cửa)", phone: "0272.3838.111", email: "motcua@caolanh.gov.vn", task: "Tiếp nhận hồ sơ hành chính" },
        { name: "Phòng Hộ tịch & Dân sự", phone: "0272.3838.222", email: "hotich@caolanh.gov.vn", task: "Khai sinh, kết hôn, khai tử" },
        { name: "Phòng Cư trú & Nhân khẩu", phone: "0272.3838.333", email: "cutru@caolanh.gov.vn", task: "Tạm trú, hộ khẩu, xác nhận cư trú" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            <ToastContainer position="top-right" autoClose={3000} />
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full bg-white shadow-2xl transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 bg-gradient-to-r from-blue-700 to-indigo-800">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-lg">🏛️</div>
                            <div>
                                <h1 className="text-white font-black text-sm uppercase tracking-wider">Hành chính số</h1>
                                <p className="text-blue-100 text-[10px] font-bold opacity-80 uppercase tracking-tighter">Phường  Mỹ Trà</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-lg mx-auto">🏛️</div>
                    )}
                </div>
                <nav className="p-3 space-y-1">
                    {menuItems.map((item, index) => (
                        <Link key={index} to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${index === 5
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
                <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} title="Liên hệ công tác" />

                {/* Page Content */}
                <main className="p-4 md:p-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                        {/* Left Info Column */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-[10px] font-black text-gray-800 tracking-[0.2em] mb-8 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span> Thông tin cơ quan
                                </h3>
                                <div className="space-y-6">
                                    {contactInfo.map((info, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-100">
                                                {info.icon}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 tracking-[0.2em] leading-none mb-2">{info.title}</p>
                                                <p className="text-[11px] font-black text-gray-700 leading-relaxed tracking-tight">{info.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
                                <h3 className="text-[10px] font-black text-gray-800 tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span> Vị trí trên bản đồ
                                </h3>
                                <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100" style={{ height: '200px' }}>
                                    <iframe title="Bản đồ" src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d376.58900043739885!2d105.64762664603258!3d10.471498479112922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1776301354506!5m2!1sen!2s" className="w-full h-full border-0" loading="lazy" />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-[10px] font-black text-gray-800 tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span> Liên hệ nhanh
                                </h3>
                                <div className="space-y-4">
                                    {departments.map((dept, i) => (
                                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                                            <h4 className="text-[10px] font-bold text-gray-800">{dept.name}</h4>
                                            <p className="text-[10px] font-bold text-blue-600 mt-1">📞 {dept.phone}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Interaction Column: Tab View if Logged In */}
                        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">

                                {/* TABS TITLE */}
                                <div className="flex border-b border-gray-100 bg-slate-50/50">
                                    {user && (
                                        <button
                                            onClick={() => setActiveTab('inbox')}
                                            className={`flex-1 py-5 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'inbox'
                                                ? 'bg-white text-blue-600 border-t-[3px] border-blue-600 shadow-sm z-10'
                                                : 'text-gray-400 hover:bg-slate-100 border-t-[3px] border-transparent'
                                                }`}
                                        >
                                            Hộp thư hỗ trợ
                                            {myContacts.filter(c => c.status === 'replied').length > 0 && activeTab !== 'inbox' && (
                                                <span className="ml-2 w-2 h-2 inline-block bg-red-500 rounded-full mb-0.5 animate-pulse"></span>
                                            )}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setActiveTab('form')}
                                        className={`flex-1 py-5 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'form'
                                            ? 'bg-white text-blue-600 border-t-[3px] border-blue-600 shadow-sm z-10'
                                            : 'text-gray-400 hover:bg-slate-100 border-t-[3px] border-transparent'
                                            } ${!user ? 'w-full flex-none cursor-default' : ''}`}
                                    >
                                        Gửi yêu cầu mới
                                    </button>
                                </div>

                                {/* CONTENT AREA */}
                                <div className="flex-1 flex flex-col relative h-full">

                                    {/* TAB: FORM */}
                                    {activeTab === 'form' && (
                                        <div className="p-8 md:p-10 animate-in fade-in duration-300 overflow-y-auto">
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-2">Lời nhắn mới</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold tracking-[0.3em]">Hệ thống tiếp nhận trực tuyến</p>
                                                </div>
                                                <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg animate-bounce">💬</div>
                                            </div>

                                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1 block mb-2">Danh tính công dân</label>
                                                        <input type="text" required disabled={!!user} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className={`w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-[11px] font-bold ${!!user ? 'bg-gray-100 text-gray-500' : 'bg-slate-50 focus:bg-white'}`} placeholder="Họ và tên" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1 block mb-2">Đường dây nóng</label>
                                                        <input type="tel" required disabled={!!user}
                                                            pattern="[0-9]{10}" minLength="10" maxLength="10" title="Vui lòng nhập đúng 10 số điện thoại"
                                                            value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                                            className={`w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-[11px] font-bold ${!!user ? 'bg-gray-100 text-gray-500' : 'bg-slate-50 focus:bg-white'}`} placeholder="SĐT liên hệ" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1 block mb-2">Chủ đề làm việc</label>
                                                    <input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none text-[11px] font-bold" placeholder="VD: Hẹn lịch lấy bằng lái xe" />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 tracking-[0.2em] ml-1 block mb-2">Nội dung chi tiết</label>
                                                    <textarea required rows="4" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none text-[11px] font-bold resize-none" placeholder="Xin chào, tôi muốn hẹn lịch..." />
                                                </div>
                                                <button type="submit" disabled={submitting} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black tracking-[0.4em] shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                                                    {submitting ? 'ĐANG GỬI...' : 'XÁC NHẬN GỬI THÔNG TIN'}
                                                </button>
                                            </form>
                                            {user && (
                                                <div className="mt-6 text-center">
                                                    <button onClick={() => setActiveTab('inbox')} className="text-[11px] font-bold text-blue-600 hover:underline">
                                                        Quay lại Hộp thư của tôi →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB: INBOX */}
                                    {activeTab === 'inbox' && (
                                        <div className="flex flex-col md:flex-row h-[600px] animate-in fade-in duration-300">

                                            {/* Thread List (Left side of inbox) */}
                                            <div className="w-full md:w-[35%] border-r border-gray-100 bg-gray-50/50 flex flex-col shrink-0">
                                                <div className="p-4 border-b border-gray-100 bg-white">
                                                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Tin nhắn của tôi</h4>
                                                </div>
                                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                    {myContacts.length === 0 ? (
                                                        <div className="p-8 text-center text-gray-400 text-xs font-bold leading-relaxed">
                                                            Chưa có tin nhắn nào. <br /> Hãy gửi yêu cầu mới!
                                                        </div>
                                                    ) : (
                                                        myContacts.map((c) => (
                                                            <div
                                                                key={c.id}
                                                                onClick={() => setSelectedThread(c)}
                                                                className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${selectedThread?.id === c.id
                                                                    ? 'bg-blue-50 border-l-4 border-l-blue-600'
                                                                    : 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent'
                                                                    }`}
                                                            >
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <div className="text-[10px] text-gray-400 font-bold">{new Date(c.created_at).toLocaleDateString('vi-VN')}</div>
                                                                    {c.status === 'replied' && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                                                                </div>
                                                                <div className="text-xs font-black text-gray-800 line-clamp-1 mb-1">{c.subject}</div>
                                                                <div className="text-[11px] font-medium text-gray-500 line-clamp-2">{c.message}</div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            {/* Chat View (Right side of inbox) */}
                                            <div className="flex-1 flex flex-col bg-white">
                                                {selectedThread ? (
                                                    <>
                                                        <div className="p-4 border-b border-gray-100 bg-white z-10 shadow-sm flex items-center justify-between">
                                                            <div>
                                                                <h4 className="text-sm font-black text-gray-800">{selectedThread.subject}</h4>
                                                                <p className="text-[10px] text-gray-400 font-bold mt-1">
                                                                    Trạng thái: {selectedThread.status === 'pending' ? 'Chưa phản hồi' : selectedThread.status === 'replied' ? 'Đã phản hồi' : 'Khác'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Chat Bubbles */}
                                                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8FAF9] space-y-6 custom-scrollbar">

                                                            {/* Initial Message (User) */}
                                                            <div className="flex justify-end border-opacity-0">
                                                                <div className="flex flex-col items-end max-w-[85%]">
                                                                    <div className="flex items-baseline gap-2 mb-1 mr-2">
                                                                        <span className="text-[10px] text-gray-400 font-bold">{new Date(selectedThread.created_at).toLocaleString('vi-VN')}</span>
                                                                        <span className="text-[11px] font-black text-blue-600">Bạn</span>
                                                                    </div>
                                                                    <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md text-[13px] leading-relaxed whitespace-pre-wrap">
                                                                        {selectedThread.message}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* History Messages */}
                                                            {getRepliesArray(selectedThread).map((reply, index) => {
                                                                const isAdmin = reply.sender_type !== 'citizen' && reply.sender_type !== 'user';
                                                                return (
                                                                    <div key={index} className={`flex border-opacity-0 ${!isAdmin ? 'justify-end' : ''}`}>
                                                                        <div className={`flex flex-col ${!isAdmin ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                                                            <div className={`flex items-baseline gap-2 mb-1 ${!isAdmin ? 'mr-2' : 'ml-2'}`}>
                                                                                {!isAdmin ? (
                                                                                    <>
                                                                                        <span className="text-[10px] text-gray-400 font-bold">{reply.sent_at ? new Date(reply.sent_at).toLocaleString('vi-VN') : ''}</span>
                                                                                        <span className="text-[11px] font-black text-blue-600">Bạn</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <span className="text-[11px] font-black text-emerald-600">CQ Hành chính</span>
                                                                                        <span className="text-[10px] text-gray-400 font-bold">{reply.sent_at ? new Date(reply.sent_at).toLocaleString('vi-VN') : ''}</span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                            <div className={`${!isAdmin ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'} px-5 py-3 rounded-2xl shadow-sm text-[13px] leading-relaxed whitespace-pre-wrap`}>
                                                                                {reply.message}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            <div ref={chatEndRef} />
                                                        </div>

                                                        {/* Reply Input */}
                                                        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                                                            <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20">
                                                                <textarea
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    placeholder="Nhập nội dung trao đổi thêm..."
                                                                    className="flex-1 max-h-[100px] min-h-[40px] bg-transparent border-none focus:ring-0 resize-none text-[13px] font-medium py-1.5 px-2"
                                                                    rows="1"
                                                                    disabled={sendingReply}
                                                                    onInput={(e) => {
                                                                        e.target.style.height = 'auto';
                                                                        e.target.style.height = (e.target.scrollHeight) + 'px';
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={handleSendUserReply}
                                                                    disabled={sendingReply || !replyText.trim()}
                                                                    className={`p-3 rounded-xl transition-all shadow-sm ${sendingReply || !replyText.trim()
                                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5'
                                                                        }`}
                                                                >
                                                                    {sendingReply ? '⏳' : '🚀'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-[#F8FAF9]">
                                                        <div className="text-4xl mb-4 opacity-50">💬</div>
                                                        <p className="text-sm font-bold">Chọn một luồng trò chuyện</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #CBD5E1; }
            `}</style>
        </div>
    );
}
