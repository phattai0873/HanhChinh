import { useState } from 'react';
import { documentAPI } from '../../services/api';

export default function ApprovalModal({ document, action, onClose, onSuccess }) {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isApprove = action === 'approve';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isApprove && !note.trim()) {
            setError('Vui lòng nhập lý do từ chối');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isApprove) {
                await documentAPI.approve(document.id, note);
            } else {
                await documentAPI.reject(document.id, note);
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Approval error:', err);
            setError(err.response?.data?.error || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className={`${isApprove ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-4 rounded-t-lg`}>
                    <h3 className="text-lg font-semibold">
                        {isApprove ? '✓ Phê duyệt văn bản' : '✗ Từ chối văn bản'}
                    </h3>
                    <p className="text-sm opacity-90 mt-1">{document.title}</p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Confirmation Message */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            {isApprove ? (
                                <>
                                    <strong>Xác nhận phê duyệt:</strong> Văn bản sẽ được chuyển sang trạng thái
                                    <span className="text-green-600 font-semibold"> Đã duyệt</span> và sẵn sàng gửi đi.
                                </>
                            ) : (
                                <>
                                    <strong>Xác nhận từ chối:</strong> Văn bản sẽ được chuyển về trạng thái
                                    <span className="text-orange-600 font-semibold"> Dự thảo</span> để chỉnh sửa lại.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Note */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isApprove ? 'Ghi chú (tùy chọn)' : 'Lý do từ chối'}
                            {!isApprove && <span className="text-red-500"> *</span>}
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            placeholder={isApprove
                                ? 'Nhập ghi chú nếu cần...'
                                : 'Nhập lý do từ chối, yêu cầu chỉnh sửa...'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                            required={!isApprove}
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
                            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isApprove
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : (isApprove ? 'Phê duyệt' : 'Từ chối')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
