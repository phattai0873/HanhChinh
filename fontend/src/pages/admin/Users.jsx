import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { citizenAPI } from '../../services/api';

import { toast } from 'react-toastify';
export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterWard, setFilterWard] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await citizenAPI.getAll({ limit: 100 });
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error("Failed to load citizens", error);
        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = users;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                (user.full_name && user.full_name.toLowerCase().includes(term)) ||
                (user.id_number && user.id_number.toLowerCase().includes(term)) ||
                (user.phone && user.phone.toLowerCase().includes(term)) ||
                (user.email && user.email.toLowerCase().includes(term))
            );
        }

        // Filter by ward
        if (filterWard !== 'all') {
            filtered = filtered.filter(user => user.ward === filterWard);
        }

        setFilteredUsers(filtered);
    }, [searchTerm, filterWard, users]);

    const handleEdit = (user) => {
        setEditingUser({ ...user });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            await citizenAPI.update(editingUser.id, editingUser);
            // Reload users or update local state
            const updatedUsers = users.map(u =>
                u.id === editingUser.id ? editingUser : u
            );
            setUsers(updatedUsers);
            setShowEditModal(false);
            toast.success('Cập nhật thành công!');
        } catch (error) {
            console.error("Failed to update citizen", error);
            toast.error('Cập nhật thất bại: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await citizenAPI.update(userId, { is_active: newStatus });
            const updatedUsers = users.map(u =>
                u.id === userId ? { ...u, is_active: newStatus } : u
            );
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Failed to toggle citizen status", error);
            toast.error('Không thể thay đổi trạng thái: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Quản lý người dùng
                    </h1>
                    <p className="text-sm text-gray-500">Quản lý thông tin công dân</p>
                </div>
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
                            placeholder="Tìm theo tên, CMND/CCCD, SĐT, email..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lọc theo phường/xã
                        </label>
                        <select
                            value={filterWard}
                            onChange={(e) => setFilterWard(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                            <option value="all">Tất cả</option>
                            <option value="Phường 1">Phường 1</option>
                            <option value="Phường 2">Phường 2</option>
                            <option value="Phường 3">Phường 3</option>
                            <option value="Phường 4">Phường 4</option>
                            <option value="Phường 6">Phường 6</option>
                            <option value="Phường 11">Phường 11</option>
                            <option value="Phường Mỹ Trà">Phường Mỹ Trà</option>
                            <option value="Phường Mỹ Ngãi">Phường Mỹ Ngãi</option>
                            <option value="Phường Cao Lãnh">Phường Cao Lãnh</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Họ tên</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">CMND/CCCD</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">SĐT</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Địa chỉ</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Phường/Xã</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{user.full_name}</div>
                                            {user.email && <div className="text-xs text-gray-500">{user.email}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.id_number || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.address || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.ward || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(user.id, user.is_active)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {user.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                Chỉnh sửa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-gray-500">
                                        {loading ? "Đang tải dữ liệu..." : "Không tìm thấy công dân nào"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa người dùng</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        value={editingUser.full_name || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        CMND/CCCD
                                    </label>
                                    <input
                                        type="text"
                                        pattern="[0-9]{12}" minLength="12" maxLength="12" title="Vui lòng nhập đúng 12 số CCCD/CMND"
                                        value={editingUser.id_number || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, id_number: e.target.value.replace(/\D/g, '') })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        pattern="[0-9]{10}" minLength="10" maxLength="10" title="Vui lòng nhập đúng 10 số điện thoại"
                                        value={editingUser.phone || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value.replace(/\D/g, '') })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editingUser.email || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Địa chỉ
                                    </label>
                                    <input
                                        type="text"
                                        value={editingUser.address || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phường/Xã
                                    </label>
                                    <select
                                        value={editingUser.ward || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, ward: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">Chọn phường/xã</option>
                                        <option value="Phường 1">Phường 1</option>
                                        <option value="Phường 2">Phường 2</option>
                                        <option value="Phường 3">Phường 3</option>
                                        <option value="Phường 4">Phường 4</option>
                                        <option value="Phường 6">Phường 6</option>
                                        <option value="Phường 11">Phường 11</option>
                                        <option value="Phường Mỹ Phú">Phường Mỹ Phú</option>
                                        <option value="Phường Hòa Thuận">Phường Hòa Thuận</option>
                                        <option value="Xã Mỹ Trà">Xã Mỹ Trà</option>
                                        <option value="Xã Mỹ Tân">Xã Mỹ Tân</option>
                                        <option value="Xã Mỹ Ngãi">Xã Mỹ Ngãi</option>
                                        <option value="Xã Hòa An">Xã Hòa An</option>
                                        <option value="Xã Tân Thuận Đông">Xã Tân Thuận Đông</option>
                                        <option value="Xã Tân Thuận Tây">Xã Tân Thuận Tây</option>
                                        <option value="Xã Tịnh Thới">Xã Tịnh Thới</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <select
                                        value={editingUser.is_active ? 'active' : 'inactive'}
                                        onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.value === 'active' })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Vô hiệu hóa</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
