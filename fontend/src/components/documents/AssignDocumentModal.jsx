import { useState, useEffect } from 'react';
import { userAPI, documentAPI } from '../../services/api';

export default function AssignDocumentModal({ document, onClose, onSuccess }) {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        assigned_to: '',
        deadline: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userAPI.getAll();
            // Filter only staff and admin users
            const staffUsers = data.data.filter(u =>
                ['staff', 'admin', 'leader'].includes(u.role) && u.is_active
            );
            setUsers(staffUsers);
        } catch (err) {
            console.error('Fetch users error:', err);
            setError('Không thể tải danh sách nhân viên');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.assigned_to) {
            setError('Vui lòng chọn người xử lý');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await documentAPI.assign('incoming', document.id, formData);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Assign error:', err);
            setError(err.response?.data?.error || 'Có lỗi xảy ra khi phân công');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
                    <h3 className="text-lg font-semibold">👥 Phân công xử lý văn bản</h3>
                    <p className="text-sm opacity-90 mt-1">{document.title}</p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Assigned To */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Người xử lý <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.assigned_to}
                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        >
                            <option value="">-- Chọn người xử lý --</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.full_name} ({user.role === 'admin' ? 'Quản trị' : user.role === 'leader' ? 'Lãnh đạo' : 'Nhân viên'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Deadline */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hạn xử lý
                        </label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>

                    {/* Note */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú
                        </label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            rows={3}
                            placeholder="Nhập ghi chú, yêu cầu xử lý..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Phân công'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
