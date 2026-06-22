import { useState } from 'react';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

export default function ProcessFile() {
    const [files, setFiles] = useState([
        {
            id: 1,
            fileName: 'application.pdf',
            requestId: 'REQ-2024-001',
            receivedDate: '2024-01-15',
            processingStatus: 'In Progress',
            progress: 60,
        },
        {
            id: 2,
            fileName: 'document.docx',
            requestId: 'REQ-2024-002',
            receivedDate: '2024-01-14',
            processingStatus: 'Completed',
            progress: 100,
        },
    ]);

    const columns = [
        { id: 'fileName', label: 'File Name' },
        { id: 'requestId', label: 'Request ID' },
        { id: 'receivedDate', label: 'Received Date' },
        { id: 'processingStatus', label: 'Status' },
        {
            id: 'progress',
            label: 'Progress',
            render: (value) => (
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${value}%` }}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Process File</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <Table columns={columns} data={files} />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Processing Tools</h2>
                <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Start Processing</Button>
                    <Button variant="secondary">Pause</Button>
                    <Button variant="danger">Cancel</Button>
                </div>
            </div>
        </div>
    );
}
