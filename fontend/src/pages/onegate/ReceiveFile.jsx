import { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';

export default function ReceiveFile() {
    const [files, setFiles] = useState([
        {
            id: 1,
            fileName: 'document1.pdf',
            size: '2.5 MB',
            receivedDate: '2024-01-15',
            status: 'Processed',
        },
        {
            id: 2,
            fileName: 'report.docx',
            size: '1.2 MB',
            receivedDate: '2024-01-14',
            status: 'Pending',
        },
    ]);

    const columns = [
        { id: 'fileName', label: 'File Name' },
        { id: 'size', label: 'Size' },
        { id: 'receivedDate', label: 'Received Date' },
        { id: 'status', label: 'Status' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Receive File</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New File</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        id="fileInput"
                    />
                    <label
                        htmlFor="fileInput"
                        className="cursor-pointer"
                    >
                        <p className="text-gray-600">Drag and drop files here or click to select</p>
                    </label>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Received Files</h2>
                <Table columns={columns} data={files} />
            </div>
        </div>
    );
}
