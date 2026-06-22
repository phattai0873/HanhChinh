import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, FileText, AlertCircle } from 'lucide-react';
import mammoth from 'mammoth';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function DocumentViewer({ document, onClose }) {
    const [zoom, setZoom] = useState(100);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wordHtml, setWordHtml] = useState('');

    if (!document || !document.file_url) {
        return null;
    }

    const fileUrl = document.file_url.startsWith('http')
        ? document.file_url
        : `${API_BASE_URL}${document.file_url}`;

    const fileName = document.file_url.split('/').pop();
    const fileExtension = fileName.split('.').pop().toLowerCase();

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

    // Load Word document
    useEffect(() => {
        if (fileExtension === 'docx') {
            loadWordDocument();
        }
    }, [fileUrl, fileExtension]);

    const loadWordDocument = async () => {
        try {
            setLoading(true);
            const response = await fetch(fileUrl);
            const arrayBuffer = await response.arrayBuffer();

            const result = await mammoth.convertToHtml({ arrayBuffer });
            setWordHtml(result.value);
            setLoading(false);
        } catch (err) {
            console.error('Error loading Word document:', err);
            setError('Không thể tải file Word. Vui lòng tải về để xem.');
            setLoading(false);
        }
    };

    const renderViewer = () => {
        // PDF Viewer
        if (fileExtension === 'pdf') {
            return (
                <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
                    <iframe
                        src={`${fileUrl}#zoom=${zoom}`}
                        className="w-full h-full border-0"
                        title={document.title}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setError('Không thể tải file PDF');
                        }}
                    />
                </div>
            );
        }

        // Word Document Viewer (.docx with mammoth.js)
        if (fileExtension === 'docx') {
            return (
                <div className="flex-1 overflow-auto bg-white">
                    <div
                        className="max-w-4xl mx-auto p-8 bg-white shadow-lg my-8"
                        style={{
                            zoom: `${zoom}%`,
                            minHeight: '100%'
                        }}
                    >
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: wordHtml }}
                            style={{
                                fontFamily: 'Times New Roman, serif',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                color: '#000'
                            }}
                        />
                    </div>
                </div>
            );
        }

        // Old Word format (.doc) - Show download option
        if (fileExtension === 'doc') {
            if (loading) setLoading(false);

            return (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="text-center p-8 max-w-2xl">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                            File Word 97-2003 (.doc)
                        </h3>
                        <p className="text-gray-600 mb-2">
                            <span className="font-semibold">{fileName}</span>
                        </p>
                        <p className="text-gray-500 mb-6 text-sm">
                            File định dạng cũ (.doc) không hỗ trợ xem trực tiếp. Vui lòng tải về để xem.
                        </p>

                        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 mb-6">
                            <p className="text-sm text-gray-600 mb-4">
                                💡 <strong>Gợi ý:</strong> Bạn có thể mở file bằng Microsoft Word,
                                Google Docs, hoặc các ứng dụng văn phòng khác.
                            </p>
                        </div>

                        <a
                            href={fileUrl}
                            download
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
                        >
                            <Download size={24} />
                            Tải về để xem
                        </a>
                    </div>
                </div>
            );
        }

        // Unsupported file type
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Không hỗ trợ xem trực tiếp file này
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Loại file: .{fileExtension}
                    </p>
                    <a
                        href={fileUrl}
                        download
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download size={20} />
                        Tải về để xem
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold text-gray-800 truncate">
                                    {document.title}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Số hiệu: <span className="font-mono font-semibold text-blue-600">{document.document_number}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 ml-4">
                        {/* Zoom controls for PDF and DOCX */}
                        {(fileExtension === 'pdf' || fileExtension === 'docx') && (
                            <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-gray-200">
                                <button
                                    onClick={handleZoomOut}
                                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                    title="Thu nhỏ"
                                >
                                    <ZoomOut size={18} />
                                </button>
                                <span className="text-sm font-medium px-2 min-w-[60px] text-center">
                                    {zoom}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                    title="Phóng to"
                                >
                                    <ZoomIn size={18} />
                                </button>
                            </div>
                        )}

                        {/* Download button */}
                        <a
                            href={fileUrl}
                            download
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title="Tải về"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Tải về</span>
                        </a>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="Đóng"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Document Info Bar */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-4 text-sm shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Loại file:</span>
                        <span className="font-semibold text-gray-700 uppercase">.{fileExtension}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Tên file:</span>
                        <span className="font-mono text-gray-700 text-xs">{fileName}</span>
                    </div>
                    {document.source_dest && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                                {document.type === 'incoming' ? 'Nơi ban hành:' : 'Nơi nhận:'}
                            </span>
                            <span className="font-semibold text-gray-700">{document.source_dest}</span>
                        </div>
                    )}
                </div>

                {/* Loading Indicator */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-gray-600 font-medium">Đang tải văn bản...</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex-1 flex items-center justify-center bg-red-50">
                        <div className="text-center p-8">
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                {error}
                            </h3>
                            <a
                                href={fileUrl}
                                download
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
                            >
                                <Download size={20} />
                                Tải về để xem
                            </a>
                        </div>
                    </div>
                )}

                {/* Viewer */}
                {!error && renderViewer()}
            </div>
        </div>
    );
}
