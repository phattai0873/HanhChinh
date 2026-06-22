import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { userAPI } from '../../services/api';

import { toast } from 'react-toastify';
export default function StaffManagement() {
    const [staffs, setStaffs] = useState([]);
    const [filteredStaffs, setFilteredStaffs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [loading, setLoading] = useState(true);
    const [editingStaff, setEditingStaff] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStaff, setNewStaff] = useState({
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        role: 'staff'
    });

    useEffect(() => {
        loadStaffs();
    }, []);

    const loadStaffs = async () => {
        try {
            const response = await userAPI.getAll({ limit: 100 });
            const allUsers = response.data;
            const staffList = allUsers.filter(user => ['admin', 'staff', 'leader'].includes(user.role));
            setStaffs(staffList);
            setFilteredStaffs(staffList);
        } catch (error) {
            console.error("Failed to load staffs", error);
            toast.error('Không thể tải danh sách cán bộ: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = staffs;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                (user.full_name && user.full_name.toLowerCase().includes(term)) ||
                (user.username && user.username.toLowerCase().includes(term)) ||
                (user.email && user.email.toLowerCase().includes(term))
            );
        }

        if (filterRole !== 'all') {
            filtered = filtered.filter(user => user.role === filterRole);
        }

        setFilteredStaffs(filtered);
    }, [searchTerm, filterRole, staffs]);

    const handleEdit = (staff) => {
        setEditingStaff({ ...staff });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            await userAPI.update(editingStaff.id, editingStaff);
            const updatedStaffs = staffs.map(s =>
                s.id === editingStaff.id ? editingStaff : s
            );
            setStaffs(updatedStaffs);
            setShowEditModal(false);
            toast.success('Cập nhật thành công!');
        } catch (error) {
            console.error("Failed to update staff", error);
            toast.error('Cập nhật thất bại: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleToggleActive = async (staffId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await userAPI.update(staffId, { is_active: newStatus });
            const updatedStaffs = staffs.map(s =>
                s.id === staffId ? { ...s, is_active: newStatus } : s
            );
            setStaffs(updatedStaffs);
        } catch (error) {
            console.error("Failed to toggle staff status", error);
            toast.error('Không thể thay đổi trạng thái: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleAddStaff = async () => {
        try {
            if (!newStaff.username || !newStaff.password || !newStaff.full_name || !newStaff.role) {
                toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc!');
                return;
            }

            await userAPI.create(newStaff);
            toast.success('Thêm cán bộ thành công!');
            setShowAddModal(false);
            setNewStaff({
                username: '',
                password: '',
                full_name: '',
                email: '',
                phone: '',
                role: 'staff'
            });
            loadStaffs(); // Reload danh sách
        } catch (error) {
            console.error("Failed to add staff", error);
            toast.error('Thêm cán bộ thất bại: ' + (error.response?.data?.error || error.message));
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: 'bg-red-100 text-red-700',
            staff: 'bg-blue-100 text-blue-700',
            leader: 'bg-purple-100 text-purple-700'
        };
        const labels = {
            admin: 'Quản trị viên',
            staff: 'Nhân viên',
            leader: 'Lãnh đạo'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[role] || 'bg-gray-100'}`}>
                {labels[role] || role}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Quản lý cán bộ
                    </h1>
                    <p className="text-sm text-gray-500">Danh sách các cán bộ, nhân viên trong hệ thống</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm cán bộ
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
                            placeholder="Tìm theo tên, username, email..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lọc theo chức vụ
                        </label>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                            <option value="all">Tất cả cán bộ</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="leader">Lãnh đạo</option>
                            <option value="staff">Nhân viên</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Họ tên</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Chức vụ</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Liên hệ</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStaffs.length > 0 ? (
                                filteredStaffs.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900">#{staff.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {staff.full_name ? staff.full_name.charAt(0) : 'S'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{staff.full_name || 'Chưa cập nhật'}</div>
                                                    <div className="text-xs text-gray-500">@{staff.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getRoleBadge(staff.role)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{staff.phone || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{staff.email || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(staff.id, staff.is_active)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${staff.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {staff.is_active ? 'Đang hoạt động' : 'Tạm khóa'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleEdit(staff)}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                Chỉnh sửa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-gray-500">
                                        {loading ? "Đang tải dữ liệu..." : "Không tìm thấy cán bộ nào phù hợp"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">Thêm cán bộ mới</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newStaff.full_name}
                                        onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newStaff.username}
                                        onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={newStaff.password}
                                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newStaff.email}
                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
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
                                        value={newStaff.phone}
                                        onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value.replace(/\D/g, '') })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Vai trò <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={newStaff.role}
                                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="staff">Nhân viên</option>
                                        <option value="leader">Lãnh đạo</option>
                                        <option value="admin">Quản trị viên</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewStaff({
                                        username: '',
                                        password: '',
                                        full_name: '',
                                        email: '',
                                        phone: '',
                                        role: 'staff'
                                    });
                                }}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddStaff}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                            >
                                Thêm cán bộ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingStaff && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa cán bộ</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        value={editingStaff.full_name || ''}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, full_name: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={editingStaff.username || ''}
                                        disabled
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editingStaff.email || ''}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
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
                                        value={editingStaff.phone || ''}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value.replace(/\D/g, '') })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Vai trò
                                    </label>
                                    <select
                                        value={editingStaff.role}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="staff">Nhân viên</option>
                                        <option value="leader">Lãnh đạo</option>
                                        <option value="admin">Quản trị viên</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <select
                                        value={editingStaff.is_active ? 'active' : 'inactive'}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, is_active: e.target.value === 'active' })}
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
