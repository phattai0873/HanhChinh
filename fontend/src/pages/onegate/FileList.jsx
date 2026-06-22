import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { fileAPI } from '../../services/api';
import { format } from 'date-fns';
import { exportToExcel } from '../../utils/helpers';

export default function FileList() {
    const { type } = useParams();
    const [applications, setApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: pageSize,
                status: filterStatus === 'all' ? undefined : filterStatus,
                department_id: filterDepartment === 'all' ? undefined : filterDepartment
            };

            // If viewing specific group from URL, find its dynamic ID
            if (type) {
                const typeMapping = {
                    'ho-tich': 'HO_TICH',
                    'cu-tru': 'CU_TRU',
                    'kinh-doanh': 'KINH_DOANH',
                    'xay-dung': 'XAY_DUNG',
                    'tu-phap': 'TU_PHAP'
                };
                const targetCode = typeMapping[type];

                // Wait for departments to be loaded if not already
                let currentDepts = departments;
                if (currentDepts.length === 0) {
                    const deptRes = await fileAPI.getDepartments();
                    setDepartments(deptRes);
                    currentDepts = deptRes;
                }

                const targetDept = currentDepts.find(d => d.code === targetCode);
                if (targetDept) {
                    params.department_id = targetDept.id;
                }
            }

            const response = await fileAPI.getAll(params);

            const formattedFiles = response.data.map(item => ({
                id: item.application_code || `APP-${item.id}`,
                realId: item.id,
                fileName: item.service_name || 'Dịch vụ khác',
                applicant: item.citizen_name || 'N/A',
                submittedDate: item.created_at,
                field: item.service_name || 'Hành chính',
                status: item.status || 'pending',
                departmentId: item.department_id,
                departmentName: item.department_name,
                departmentIcon: item.department_icon,
                departmentCode: item.department_code
            }));

            setApplications(formattedFiles);
            setTotalPages(response.pagination?.totalPages || 1);
            setTotalItems(response.pagination?.total || 0);
        } catch (error) {
            console.error("Failed to fetch files", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fileAPI.getDepartments();
                setDepartments(response);
            } catch (error) {
                console.error("Failed to fetch departments", error);
            }
        };
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [currentPage, pageSize, filterStatus, filterDepartment, type]);

    // Search logic (still frontend for now as it's easier, or we could add search to backend too)
    const filteredApps = searchTerm
        ? applications.filter(item =>
            item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : applications;

    // Reset to page 1 when filters or pageSize change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterDepartment, pageSize, type]);

    const getPageTitle = () => {
        const typeMapping = {
            'ho-tich': 'Hồ sơ Hộ tịch – Dân sự',
            'cu-tru': 'Hồ sơ Cư trú – Nhân khẩu',
            'kinh-doanh': 'Hồ sơ Kinh doanh',
            'xay-dung': 'Hồ sơ Xây dựng – Đất đai',
            'tu-phap': 'Hồ sơ Tư pháp'
        };
        return typeMapping[type] || 'Tất cả hồ sơ';
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        };
        const labels = {
            pending: 'Chờ tiếp nhận',
            processing: 'Đang xử lý',
            approved: 'Đã hoàn thành',
            completed: 'Đã hoàn thành',
            rejected: 'Từ chối'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const handleExport = () => {
        const columns = [
            { header: 'Mã hồ sơ', key: 'id' },
            { header: 'Tên hồ sơ', key: 'fileName' },
            { header: 'Người nộp', key: 'applicant' },
            { header: 'Ngày nộp', key: 'submittedDate' },
            { header: 'Phòng ban', key: 'departmentName' },
            { header: 'Trạng thái', key: 'statusLabel' }
        ];

        const exportData = filteredApps.map(item => {
            const labels = {
                pending: 'Chờ tiếp nhận',
                processing: 'Đang xử lý',
                completed: 'Đã hoàn thành',
                approved: 'Đã hoàn thành',
                rejected: 'Từ chối'
            };
            return {
                ...item,
                submittedDate: item.submittedDate ? format(new Date(item.submittedDate), 'dd/MM/yyyy HH:mm') : '',
                statusLabel: labels[item.status] || item.status
            };
        });

        const title = type ? `BÁO CÁO HỒ SƠ: ${type.toUpperCase()}` : 'BÁO CÁO TỔNG HỢP HỒ SƠ';
        exportToExcel(exportData, `Báo_cáo_hồ_sơ_${type || 'tất_cả'}`, columns, title);
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {getPageTitle()}
                    </h1>
                    <p className="text-sm text-gray-500">Tiếp nhận và xử lý hồ sơ hành chính công</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium"
                    >
                        📊 Xuất báo cáo
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo mã hồ sơ, tên, người nộp..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                        <span className="text-sm text-gray-500 whitespace-nowrap">Lọc theo:</span>
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                        >
                            <option value="all">📋 Tất cả phòng ban</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.icon || '📁'} {dept.name} ({dept.total_applications || 0})
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">🟡 Chờ tiếp nhận</option>
                            <option value="processing">🔵 Đang xử lý</option>
                            <option value="completed">🟢 Đã hoàn thành</option>
                            <option value="rejected">🔴 Từ chối</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                                <th className="px-6 py-4 font-semibold">Mã hồ sơ</th>
                                <th className="px-6 py-4 font-semibold">Tên hồ sơ</th>
                                <th className="px-6 py-4 font-semibold">Người nộp</th>
                                <th className="px-6 py-4 font-semibold">Ngày nộp</th>
                                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-4xl">📭</span>
                                            <p className="text-gray-500">Không tìm thấy hồ sơ nào phù hợp</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredApps.map((item) => (
                                    <tr key={item.realId} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {item.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs truncate font-medium text-gray-800" title={item.fileName}>
                                                {item.fileName}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {item.departmentName && (
                                                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                                                        {item.departmentIcon || '📁'} {item.departmentName}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {item.applicant}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {item.submittedDate ? format(new Date(item.submittedDate), 'dd/MM/yyyy') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/files/${item.realId}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium shadow-sm"
                                            >
                                                <span>✏️</span> Xử lý
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <span>Hiển thị {filteredApps.length} / {totalItems} hồ sơ (Trang {currentPage}/{totalPages})</span>
                        <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                            <span>Số hàng:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(parseInt(e.target.value))}
                                className="bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={30}>30</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all font-medium text-gray-600 shadow-sm"
                        >
                            Trước
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all font-medium text-gray-600 shadow-sm"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
