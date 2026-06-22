import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { fileAPI } from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import { toast } from 'react-toastify';
export default function FileDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [appointmentDate, setAppointmentDate] = useState('');

    useEffect(() => {
        const fetchFile = async () => {
            try {
                const response = await fileAPI.getById(id);
                setFile(response);
                setStatus(response.status || 'pending');
                setNote(response.admin_note || '');
                if (response.appointment_date) {
                    setAppointmentDate(format(new Date(response.appointment_date), 'yyyy-MM-dd'));
                }
            } catch (error) {
                console.error("Failed to fetch file", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchFile();
        }
    }, [id]);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await fileAPI.updateStatus(id, status, note, appointmentDate);
            // Re-fetch to update view similar to a real page reload
            const updatedResponse = await fileAPI.getById(id);
            setFile(updatedResponse);
            toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
        };

        const labels = {
            pending: 'Chờ tiếp nhận',
            processing: 'Đang xử lý',
            completed: 'Đã hoàn thành',
            rejected: 'Đã từ chối',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (!file) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-500">
                    <span className="text-4xl mb-4">📂</span>
                    <p className="text-lg">Không tìm thấy hồ sơ #{id}</p>
                    <button onClick={() => navigate('/admin/applications')} className="mt-4 text-blue-600 hover:underline">
                        Quay lại danh sách
                    </button>
                </div>
            </AdminLayout>
        );
    }

    // Define the logical order for fields
    const sortOrder = [
        // Personal info
        'fullName', 'fullName_v2', 'dateOfBirth', 'gender', 'nationality', 'ethnicity', 'religion',
        'idNumber', 'oldIdNumber', 'phone', 'email',
        // Address
        'address', 'currentAddress', 'temporaryAddress', 'residingSince',
        // Household
        'headOfHousehold', 'numberOfMembers', 'requestType',
        // Family (Birth/Marriage/Divorce/Death)
        'childName', 'placeOfBirth', 'fatherName', 'fatherIdNumber', 'motherName', 'motherIdNumber',
        'groomName', 'groomIdNumber', 'groomDateOfBirth', 'groomAddress',
        'brideName', 'brideIdNumber', 'brideDateOfBirth', 'brideAddress',
        'husbandName', 'husbandIdNumber', 'wifeName', 'wifeIdNumber',
        'marriageDate', 'marriageCertificateNumber', 'hasChildren', 'numberOfChildren',
        'deceasedName', 'deceasedIdNumber', 'deceasedDateOfBirth', 'deceasedGender',
        'dateOfDeath', 'placeOfDeath', 'causeOfDeath',
        'declarantName', 'declarantIdNumber', 'declarantRelation',
        // Business/Construction/Legal
        'businessName', 'ownerName', 'businessAddress', 'businessType', 'capital',
        'landAddress', 'landCertificateNumber', 'landArea', 'constructionType', 'floors', 'buildingArea',
        'certificateType', 'purpose', 'registrationDate',
        // Common
        'fromDate', 'toDate', 'reason', 'content', 'job', 'workplace', 'documents', 'note'
    ];

    // Translation mapping for common form fields
    const fieldTranslations = {
        fullName: 'Họ và tên',
        fullName_v2: 'Họ và tên',
        idNumber: 'Số CMND/CCCD',
        phone: 'Số điện thoại',
        email: 'Địa chỉ Email',
        reason: 'Lý do nộp hồ sơ',
        toDate: 'Đến ngày',
        fromDate: 'Từ ngày',
        address: 'Địa chỉ liên hệ',
        currentAddress: 'Địa chỉ thường trú',
        temporaryAddress: 'Địa chỉ tạm trú',
        dateOfBirth: 'Ngày sinh',
        gender: 'Giới tính',
        documents: 'Tài liệu đính kèm',
        job: 'Nghề nghiệp',
        workplace: 'Nơi làm việc',
        note: 'Ghi chú',
        content: 'Nội dung hồ sơ',
        headOfHousehold: 'Họ tên Chủ hộ',
        numberOfMembers: 'Số nhân khẩu',
        requestType: 'Loại yêu cầu',
        // Birth Certificate
        childName: 'Họ và tên con',
        placeOfBirth: 'Nơi sinh',
        fatherName: 'Họ tên cha',
        fatherIdNumber: 'CMND/CCCD cha',
        motherName: 'Họ tên mẹ',
        motherIdNumber: 'CMND/CCCD mẹ',
        // Identity Card
        nationality: 'Quốc tịch',
        ethnicity: 'Dân tộc',
        religion: 'Tôn giáo',
        oldIdNumber: 'Số CMND/CCCD cũ',
        // Marriage
        groomName: 'Họ tên chú rể',
        groomIdNumber: 'CMND/CCCD chú rể',
        groomDateOfBirth: 'Ngày sinh chú rể',
        groomAddress: 'Địa chỉ chú rể',
        brideName: 'Họ tên cô dâu',
        brideIdNumber: 'CMND/CCCD cô dâu',
        brideDateOfBirth: 'Ngày sinh cô dâu',
        brideAddress: 'Địa chỉ cô dâu',
        registrationDate: 'Ngày đăng ký mong muốn',
        // Legal/Criminal Record
        certificateType: 'Loại lý lịch',
        purpose: 'Mục đích sử dụng',
        // Business
        businessName: 'Tên hộ kinh doanh',
        ownerName: 'Họ tên chủ hộ kinh doanh',
        businessAddress: 'Địa chỉ kinh doanh',
        businessType: 'Ngành nghề kinh doanh',
        capital: 'Vốn kinh doanh',
        // Death Certificate
        deceasedName: 'Họ tên người mất',
        deceasedIdNumber: 'CMND/CCCD người mất',
        deceasedDateOfBirth: 'Ngày sinh người mất',
        deceasedGender: 'Giới tính người mất',
        dateOfDeath: 'Ngày mất',
        placeOfDeath: 'Nơi mất',
        causeOfDeath: 'Nguyên nhân tử vong',
        declarantName: 'Họ tên người khai tử',
        declarantIdNumber: 'CMND/CCCD người khai tử',
        declarantRelation: 'Quan hệ với người mất',
        // Divorce
        husbandName: 'Họ tên chồng',
        husbandIdNumber: 'CMND/CCCD chồng',
        wifeName: 'Họ tên vợ',
        wifeIdNumber: 'CMND/CCCD vợ',
        marriageDate: 'Ngày kết hôn',
        marriageCertificateNumber: 'Số GCN kết hôn',
        hasChildren: 'Đã có con chung',
        numberOfChildren: 'Số con chung',
        // Residency
        residingSince: 'Cư trú từ ngày',
        // Construction
        landAddress: 'Địa chỉ thửa đất',
        landCertificateNumber: 'Số GCN quyền sử dụng đất',
        landArea: 'Diện tích đất (m²)',
        constructionType: 'Loại công trình',
        floors: 'Số tầng',
        buildingArea: 'Diện tích xây dựng (m²)',
        // Authentication/Copy
        signerName: 'Họ tên người ký',
        documentType: 'Loại giấy tờ',
        numberOfSignatures: 'Số chữ ký cần chứng thực',
        requesterName: 'Họ tên người yêu cầu',
        numberOfCopies: 'Số bản sao/chứng thực'
    };

    const translateKey = (key) => {
        const lowerKey = key.toLowerCase();
        for (const [k, v] of Object.entries(fieldTranslations)) {
            if (k.toLowerCase() === lowerKey) return v;
        }
        return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
    };

    // Helper to capitalize first letter
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    // Parse form data safely
    const renderFormData = (data) => {
        if (!data) return <p className="text-gray-500 italic text-center py-4">Không có dữ liệu đơn</p>;

        let parsedData = data;
        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                return <p className="whitespace-pre-wrap p-4">{data}</p>;
            }
        }

        if (typeof parsedData !== 'object') {
            return <p className="whitespace-pre-wrap p-4">{String(parsedData)}</p>;
        }

        // Sort entries according to sortOrder
        const sortedEntries = Object.entries(parsedData).sort(([keyA], [keyB]) => {
            const indexA = sortOrder.findIndex(k => k.toLowerCase() === keyA.toLowerCase());
            const indexB = sortOrder.findIndex(k => k.toLowerCase() === keyB.toLowerCase());

            if (indexA === -1 && indexB === -1) return keyA.localeCompare(keyB);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        return (
            <div className="space-y-4">
                <table className="w-full text-sm border-collapse">
                    <tbody>
                        {sortedEntries.map(([key, value]) => {
                            if (key.startsWith('_')) return null;

                            return (
                                <tr key={key} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 pr-4 font-semibold text-gray-600 w-1/3 align-top">
                                        {translateKey(key)}:
                                    </td>
                                    <td className="py-3 text-gray-900 border-l border-gray-50 pl-4">
                                        {typeof value === 'object' ? (
                                            Array.isArray(value) ? (
                                                <ul className="list-disc list-inside">
                                                    {value.map((v, i) => (
                                                        <li key={i}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>
                                            )
                                        ) : (
                                            <span className="font-medium text-base">
                                                {String(value).trim() || <span className="text-gray-400 italic">(Để trống)</span>}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <AdminLayout>
            {/* Screen View */}
            <div className="print:hidden">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link to="/admin/applications" className="hover:text-blue-600">Quản lý hồ sơ</Link>
                        <span>/</span>
                        <span className="text-gray-800 font-medium">Chi tiết hồ sơ #{file.application_code || file.id}</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all font-medium text-sm shadow-sm"
                        >
                            🖨️ Xuất hồ sơ giấy
                        </button>
                        <button
                            onClick={() => navigate('/admin/applications')}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                        >
                            ← Quay lại
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                            <div className="bg-blue-50 absolute top-0 right-0 p-4 rounded-bl-3xl">
                                <StatusBadge status={file.status} />
                            </div>

                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{file.service_name}</h1>
                            <p className="text-gray-500 flex items-center gap-2 text-sm">
                                <span>📅 Ngày nộp: {file.created_at ? format(new Date(file.created_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}</span>
                                <span>•</span>
                                <span>🆔 Mã hồ sơ: <span className="font-mono text-blue-600">{file.application_code || file.id}</span></span>
                                {file.appointment_date && (
                                    <>
                                        <span>•</span>
                                        <span className="text-orange-600 font-bold">📅 Ngày hẹn: {format(new Date(file.appointment_date), 'dd/MM/yyyy')}</span>
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Citizen Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                👤 Thông tin người nộp
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Họ và tên</label>
                                    <p className="font-semibold text-gray-900">{file.citizen_name || 'Không có tên'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Số CMND/CCCD</label>
                                    <p className="font-semibold text-gray-900">{file.citizen_id_number || '---'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Số điện thoại</label>
                                    <p className="font-semibold text-gray-900">{file.citizen_phone || '---'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Email</label>
                                    <p className="font-semibold text-gray-900">{file.citizen_email || '---'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm text-gray-500 block mb-1">Địa chỉ</label>
                                    <p className="font-semibold text-gray-900">{file.citizen_address || '---'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Application Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                                📝 Nội dung hồ sơ
                            </h2>
                            <div className="bg-white rounded-xl p-4 md:p-8 border-2 border-gray-100 shadow-inner">
                                <div className="flex justify-between mb-8 border-b pb-4">
                                    <div className="text-center text-xs font-bold">
                                        ỦY BAN NHÂN DÂN QUẬN/HUYỆN<br />
                                        BỘ PHẬN TIẾP NHẬN & TRẢ KẾT QUẢ
                                    </div>
                                    <div className="text-center text-xs">
                                        <span className="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span><br />
                                        <span className="font-bold border-b border-black inline-block pb-1">Độc lập - Tự do - Hạnh phúc</span>
                                    </div>
                                </div>

                                <h3 className="text-center font-bold text-xl uppercase mb-2">GIẤY TIẾP NHẬN HỒ SƠ VÀ HẸN TRẢ KẾT QUẢ</h3>
                                <p className="text-center font-bold text-lg uppercase mb-8 text-blue-800">{file.service_name}</p>

                                <div className="mb-4 text-sm italic text-right">
                                    Mã hồ sơ: {file.application_code || file.id}
                                </div>

                                {renderFormData(file.form_data)}

                                <div className="mt-12 text-sm">
                                    <div className="flex justify-end italic mb-2">
                                        Ngày {format(new Date(), 'dd')} tháng {format(new Date(), 'MM')} năm {format(new Date(), 'yyyy')}
                                    </div>
                                    <div className="grid grid-cols-2 gap-8 text-center">
                                        <div className="flex flex-col justify-between h-40">
                                            <p className="font-bold uppercase">Người nộp hồ sơ</p>
                                            <p className="font-bold">{file.citizen_name}</p>
                                        </div>
                                        <div className="flex flex-col justify-between h-40">
                                            <p className="font-bold uppercase">Cán bộ tiếp nhận</p>
                                            <p className="font-bold text-gray-400 italic font-normal">(Ký và ghi rõ họ tên)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Separate Attachment Section block */}
                        {(() => {
                            let fData = file.form_data;
                            if (typeof fData === 'string') {
                                try { fData = JSON.parse(fData); } catch(e) {}
                            }
                            
                            const attachments = fData ? (fData._attachments || (fData._attachmentBase64 ? [fData] : [])) : [];
                            
                            if (attachments.length > 0) {
                                return (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
                                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                                            📎 Tài liệu đính kèm ({attachments.length})
                                        </h2>
                                        <div className="space-y-3">
                                            {attachments.map((att, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-3xl">
                                                            {(() => {
                                                                const name = (att._attachmentName || '').toLowerCase();
                                                                if (name.includes('.pdf')) return '📕';
                                                                if (name.includes('.doc') || name.includes('.docx')) return '📘';
                                                                if (name.includes('.xls') || name.includes('.xlsx')) return '📗';
                                                                if (name.includes('.png') || name.includes('.jpg') || name.includes('.jpeg')) return '🖼️';
                                                                return '🗂️';
                                                            })()}
                                                        </span>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm max-w-[200px] md:max-w-md truncate" title={att._attachmentName}>{att._attachmentName || 'TaiLieuDinhKem'}</p>
                                                            <p className="text-xs text-blue-600 font-medium mt-1">Dung lượng an toàn</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const a = document.createElement("a");
                                                            a.href = att._attachmentBase64;
                                                            a.download = att._attachmentName || "TaiLieuDinhKem";
                                                            a.click();
                                                        }}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow cursor-pointer transition-colors flex-shrink-0"
                                                    >
                                                        Tải xuống / Xem
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* Right Column: Processing & Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-6">
                            {/* Action Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4">⚡ Xem xét & Duyệt hồ sơ</h2>

                                <form onSubmit={handleUpdateStatus} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái quyết định</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="pending">🟡 Chờ tiếp nhận</option>
                                            <option value="processing">🔵 Đang xử lý / Đã tiếp nhận</option>
                                            <option value="completed">🟢 Đã hoàn thành (Hồ sơ hợp lệ)</option>
                                            <option value="rejected">🔴 Từ chối / Yêu cầu bổ sung</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Hẹn ngày lấy kết quả</label>
                                        <input
                                            type="date"
                                            value={appointmentDate}
                                            onChange={(e) => setAppointmentDate(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <p className="text-xs text-blue-600 mt-1 italic">* Thông báo cho người dân ngày đến lấy hồ sơ giấy</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ý kiến xử lý / Ghi chú</label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            rows={5}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            placeholder="Nhập nội dung xử lý, lý do từ chối hoặc hướng dẫn bổ sung cho công dân..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`w-full py-2.5 rounded-lg text-white font-medium shadow-lg transition-all
                                        ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30'}
                                    `}
                                    >
                                        {submitting ? 'Đang lưu...' : '✓ Duyệt & Lưu kết quả'}
                                    </button>
                                </form>
                            </div>

                            {/* History */}
                            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Quy trình xử lý</h3>
                                <div className="border-l-2 border-gray-200 ml-2 space-y-6">
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                                        <p className="text-sm font-medium text-gray-800">Trạng thái hiện tại: {file.status}</p>
                                        <p className="text-xs text-gray-500 mt-1">{file.updated_at ? format(new Date(file.updated_at), 'HH:mm dd/MM/yyyy') : 'N/A'}</p>
                                        {file.admin_note && (
                                            <p className="text-xs bg-white p-2 mt-2 rounded border border-gray-100 italic">"{file.admin_note}"</p>
                                        )}
                                    </div>
                                    {file.created_at && (
                                        <div className="relative pl-6">
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-300 border-2 border-white"></div>
                                            <p className="text-sm font-medium text-gray-600">Hồ sơ được gửi thành công</p>
                                            <p className="text-xs text-gray-500 mt-1">{format(new Date(file.created_at), 'HH:mm dd/MM/yyyy')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View (Only visible when printing) */}
            <div className="hidden print:block print:bg-white print:text-black print:p-0 print:m-0" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                <style type="text/css" dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { margin: 10mm 15mm; size: A4; }
                        body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .no-print { display: none; }
                        .print-border-dotted { border-bottom: 1px dotted #000 !important; }
                    }
                ` }} />

                <div className="max-w-[210mm] mx-auto text-[15px] leading-relaxed">
                    {/* Header */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="text-center text-[14px]">
                            <div className="uppercase">ỦY BAN NHÂN DÂN QUẬN/HUYỆN</div>
                            <div className="font-bold uppercase mt-0.5">BỘ PHẬN TIẾP NHẬN & TRẢ KẾT QUẢ</div>
                            <div className="border-t border-black w-24 mx-auto mt-1.5"></div>
                        </div>
                        <div className="text-center text-[14px]">
                            <div className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                            <div className="font-bold mt-0.5">Độc lập - Tự do - Hạnh phúc</div>
                            <div className="border-t border-black w-36 mx-auto mt-1.5"></div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="font-bold text-[22px] uppercase mb-2">GIẤY TIẾP NHẬN HỒ SƠ<br />VÀ HẸN TRẢ KẾT QUẢ</h1>
                        <h2 className="text-[15px] italic">Mã hồ sơ: <strong>{file.application_code || file.id}</strong></h2>
                    </div>

                    {/* Body Content */}
                    <div className="text-[16px] leading-[1.6]">
                        <p className="mb-4">Bộ phận Tiếp nhận và Trả kết quả đã tiếp nhận hồ sơ của:</p>
                        <table className="w-full mb-6">
                            <tbody>
                                <tr>
                                    <td className="w-56 py-1 align-top">1. Ông/Bà:</td>
                                    <td className="font-bold uppercase py-1">{file.citizen_name}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 align-top">2. Số CMND/CCCD:</td>
                                    <td className="py-1">{file.citizen_id_number || '...................................................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 align-top">3. Số điện thoại:</td>
                                    <td className="py-1">{file.citizen_phone || '...................................................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 align-top">4. Địa chỉ:</td>
                                    <td className="py-1">{file.citizen_address || '.........................................................................................'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 align-top">5. Nội dung yêu cầu giải quyết:</td>
                                    <td className="font-bold uppercase py-1">{file.service_name}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Detailed Info Form */}
                        {file.form_data && (
                            <div className="mb-8">
                                <p className="mb-3">6. Thông tin kê khai, tài liệu kèm theo gồm:</p>
                                <table className="w-full text-[15px] border-collapse border border-black">
                                    <thead>
                                        <tr className="bg-gray-100/50">
                                            <th className="border border-black p-2 text-center w-12">STT</th>
                                            <th className="border border-black p-2 text-center">Trường thông tin / Tài liệu kê khai</th>
                                            <th className="border border-black p-2 text-center">Nội dung chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {typeof file.form_data === 'object' ? (
                                            Object.entries(file.form_data)
                                                .filter(([key]) => !key.startsWith('_'))
                                                .map(([key, value], idx) => (
                                                    <tr key={key}>
                                                        <td className="border border-black p-2 text-center align-top">{idx + 1}</td>
                                                        <td className="border border-black p-2 align-top">{translateKey(key)}</td>
                                                        <td className="border border-black p-2 align-top font-medium">{String(value)}</td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td className="border border-black p-2 text-center" colSpan="3">{String(file.form_data)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Footer Timings */}
                        <div className="mt-8">
                            <p className="mb-2">Hồ sơ được tiếp nhận vào hồi: <strong>{file.created_at ? format(new Date(file.created_at), 'HH:mm') : '--:--'}</strong> ngày <strong>{file.created_at ? format(new Date(file.created_at), 'dd/MM/yyyy') : '--/--/----'}</strong></p>
                            <p className="mb-2">Thời gian hẹn trả kết quả: <strong className="border-b border-black">{file.appointment_date ? format(new Date(file.appointment_date), 'dd/MM/yyyy') : '..............................'}</strong></p>
                            <p className="italic text-[14px] mt-4">* Ghi chú: {file.admin_note || 'Hồ sơ kê khai đầy đủ, hợp lệ.'}</p>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="mt-8 text-[15px]">
                        <div className="flex justify-between w-full">
                            {/* Left Side: Citizen Signature */}
                            <div className="w-1/2 flex flex-col items-center mt-6">
                                <p className="font-bold uppercase">Người nộp hồ sơ</p>
                                <p className="italic text-[13px] mb-[80px]">(Ký, ghi rõ họ tên)</p>
                                <p className="font-bold uppercase">{file.citizen_name}</p>
                            </div>

                            {/* Right Side: Date & Officer Signature */}
                            <div className="w-1/2 flex flex-col items-center">
                                <p className="italic mb-2 text-[15px]">
                                    Ngày {format(new Date(), 'dd')} tháng {format(new Date(), 'MM')} năm {format(new Date(), 'yyyy')}
                                </p>
                                <p className="font-bold uppercase">Người tiếp nhận</p>
                                <p className="italic text-[13px] mb-[80px]">(Ký, ghi rõ họ tên)</p>
                                <p className="font-bold uppercase">CÁN BỘ MỘT CỬA</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
