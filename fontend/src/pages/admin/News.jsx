import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { newsAPI } from '../../services/api';

import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
export default function NewsManagement() {
    const [news, setNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Tin tức',
        thumbnail: '',
        summary: '',
        content: '',
        status: 'draft',
        is_public: false,
        is_featured: false
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        try {
            const response = await newsAPI.getAll({ limit: 100 });
            const data = response.data.map(item => ({
                id: item.id,
                title: item.title,
                category: item.category,
                author: item.author,
                publishedDate: item.published_at
                    ? new Date(item.published_at).toLocaleDateString('vi-VN')
                    : new Date(item.created_at).toLocaleDateString('vi-VN'),
                status: item.status,
                content: item.content,
                thumbnail: item.thumbnail,
                summary: item.summary,
                is_featured: item.is_featured,
                is_public: item.is_public
            }));
            setNews(data);
            setFilteredNews(data);
        } catch (error) {
            console.error("Failed to load news", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = news;
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredNews(filtered);
    }, [searchTerm, news]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await newsAPI.update(editingId, formData);
                toast.success('Cập nhật tin tức thành công!');
            } else {
                await newsAPI.create(formData);
                toast.success('Đăng tin mới thành công!');
            }
            setShowModal(false);
            setFormData({ title: '', category: 'Tin tức', thumbnail: '', summary: '', content: '', status: 'draft', is_public: false, is_featured: false });
            setEditingId(null);
            loadNews();
        } catch (error) {
            console.error("Save failed", error);
            toast.error('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title,
            category: item.category,
            thumbnail: item.thumbnail || '',
            summary: item.summary || '',
            content: item.content,
            status: item.status,
            is_public: item.is_public,
            is_featured: item.is_featured || false
        });
        setEditingId(item.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc muốn xóa tin này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });
        if (!result.isConfirmed) return;
        try {
            await newsAPI.delete(id);
            loadNews();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error('Xóa thất bại');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            published: 'bg-green-100 text-green-700',
            draft: 'bg-gray-100 text-gray-700',
            archived: 'bg-red-100 text-red-700'
        };
        const labels = {
            published: 'Đã xuất bản',
            draft: 'Bản nháp',
            archived: 'Đã lưu trữ'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Quản lý tin tức
                    </h1>
                    <p className="text-sm text-gray-500">Đăng tải và quản lý thông tin, thông báo</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', category: 'Tin tức', thumbnail: '', summary: '', content: '', status: 'draft', is_public: false, is_featured: false });
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:shadow-lg transition-all font-medium flex items-center gap-2"
                >
                    <span>+</span> Đăng tin mới
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tìm kiếm
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tiêu đề, danh mục..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Tiêu đề</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Danh mục</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Tác giả</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Ngày đăng</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredNews.length > 0 ? (
                                filteredNews.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900">{item.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 max-w-sm truncate" title={item.title}>{item.title}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.author}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.publishedDate}</td>
                                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-gray-500">
                                        {loading ? "Đang tải..." : "Chưa có tin tức nào"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingId ? 'Chỉnh sửa tin tức' : 'Đăng tin mới'}
                            </h2>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="Tin tức">Tin tức</option>
                                        <option value="Thông báo">Thông báo</option>
                                        <option value="Hướng dẫn">Hướng dẫn</option>
                                        <option value="Y tế">Y tế</option>
                                        <option value="Văn hóa">Văn hóa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="draft">Bản nháp</option>
                                        <option value="published">Xuất bản</option>
                                        <option value="archived">Lưu trữ</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh đại diện (Thumbnail)</label>
                                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-100 rounded-2xl bg-slate-50/50 hover:border-blue-400 transition-all">
                                    <div className="w-24 h-24 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-white shrink-0 flex items-center justify-center text-gray-300">
                                        {formData.thumbnail ? (
                                            <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl">🖼️</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-2">
                                            <label className="cursor-pointer px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                                                Tải ảnh từ máy
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const uploadData = new FormData();
                                                            uploadData.append('image', file);
                                                            try {
                                                                const res = await newsAPI.uploadThumbnail(uploadData);
                                                                setFormData({ ...formData, thumbnail: res.url });
                                                            } catch (err) {
                                                                toast.error('Tải ảnh thất bại: ' + (err.response?.data?.error || err.message));
                                                            }
                                                        }
                                                    }}
                                                />
                                            </label>
                                            {formData.thumbnail && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, thumbnail: '' })}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
                                                >
                                                    Xóa ảnh
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.thumbnail}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            placeholder="Hoặc dán link (URL) ảnh tại đây..."
                                            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tóm tắt (Ngắn gọn)</label>
                                <textarea
                                    rows="2"
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                    placeholder="Mô tả ngắn gọn về bài viết..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung chi tiết</label>
                                <textarea
                                    required
                                    rows="6"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                ></textarea>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 p-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_public"
                                        checked={formData.is_public}
                                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                    />
                                    <label htmlFor="is_public" className="text-sm text-gray-700 font-bold cursor-pointer">Công khai trang chủ</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_featured"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        className="w-4 h-4 text-amber-500 rounded cursor-pointer"
                                    />
                                    <label htmlFor="is_featured" className="text-sm text-amber-700 font-bold cursor-pointer flex items-center gap-1">
                                        🔥 Đánh dấu Tin nổi bật
                                    </label>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                                >
                                    {editingId ? 'Cập nhật' : 'Đăng tin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
