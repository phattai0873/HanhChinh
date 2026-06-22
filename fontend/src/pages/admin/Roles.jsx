import { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import AdminLayout from '../../components/admin/AdminLayout';

export default function Roles() {
    const [roles, setRoles] = useState([
        {
            id: 1,
            name: 'Admin',
            description: 'Full system access',
            permissions: 'All',
            createdDate: '2024-01-01',
        },
        {
            id: 2,
            name: 'Staff',
            description: 'Process documents and files',
            permissions: 'Read, Write',
            createdDate: '2024-01-05',
        },
        {
            id: 3,
            name: 'Citizen',
            description: 'Submit and track requests',
            permissions: 'Read Own',
            createdDate: '2024-01-10',
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: '',
    });

    const handleAddRole = (e) => {
        e.preventDefault();
        setShowForm(false);
        setFormData({ name: '', description: '', permissions: '' });
    };

    const columns = [
        { id: 'name', label: 'Name' },
        { id: 'description', label: 'Description' },
        { id: 'permissions', label: 'Permissions' },
        { id: 'createdDate', label: 'Created Date' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
                    <Button onClick={() => setShowForm(!showForm)} variant="primary">
                        {showForm ? 'Cancel' : 'Add Role'}
                    </Button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Role</h2>
                        <form onSubmit={handleAddRole} className="space-y-4">
                            <Input
                                type="text"
                                label="Role Name"
                                placeholder="Enter role name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />

                            <Input
                                type="text"
                                label="Description"
                                placeholder="Enter role description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />

                            <Input
                                type="text"
                                label="Permissions"
                                placeholder="Enter permissions (comma separated)"
                                value={formData.permissions}
                                onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
                                required
                            />

                            <Button type="submit" variant="primary">Add Role</Button>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow p-6">
                    <Table columns={columns} data={roles} />
                </div>
            </div>
        </AdminLayout>
    );
}
