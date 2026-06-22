import { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';

export default function AssignFile() {
    const [selectedFile, setSelectedFile] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [assignments, setAssignments] = useState([
        {
            id: 1,
            fileName: 'document.pdf',
            assignedTo: 'John Doe',
            assignedDate: '2024-01-15',
            status: 'In Progress',
        },
        {
            id: 2,
            fileName: 'report.docx',
            assignedTo: 'Jane Smith',
            assignedDate: '2024-01-14',
            status: 'Completed',
        },
    ]);

    const handleAssign = (e) => {
        e.preventDefault();
        // Assign file logic
        setSelectedFile('');
        setAssignedTo('');
    };

    const columns = [
        { id: 'fileName', label: 'File Name' },
        { id: 'assignedTo', label: 'Assigned To' },
        { id: 'assignedDate', label: 'Assigned Date' },
        { id: 'status', label: 'Status' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Assign File</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Assign New File</h2>
                <form onSubmit={handleAssign} className="space-y-4">
                    <Input
                        type="text"
                        label="Select File"
                        placeholder="Choose file to assign"
                        value={selectedFile}
                        onChange={(e) => setSelectedFile(e.target.value)}
                        required
                    />

                    <Input
                        type="text"
                        label="Assign To"
                        placeholder="Enter staff member name"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        required
                    />

                    <Button type="submit" variant="primary">Assign</Button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Assignments</h2>
                <Table columns={columns} data={assignments} />
            </div>
        </div>
    );
}
