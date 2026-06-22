import { apiCall } from './api';

export const fileService = {
    // Get all files (OneGate)
    getFiles: async (filters = {}) => {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = `/files${queryString ? `?${queryString}` : ''}`;
        return apiCall(endpoint);
    },

    // Get file by ID
    getFileById: async (fileId) => {
        return apiCall(`/files/${fileId}`);
    },

    // Create new file
    createFile: async (fileData) => {
        return apiCall('/files', {
            method: 'POST',
            body: fileData,
        });
    },

    // Update file
    updateFile: async (fileId, fileData) => {
        return apiCall(`/files/${fileId}`, {
            method: 'PUT',
            body: fileData,
        });
    },

    // Delete file
    deleteFile: async (fileId) => {
        return apiCall(`/files/${fileId}`, {
            method: 'DELETE',
        });
    },

    // Upload file
    uploadFile: async (fileId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${fileId}/upload`,
            {
                method: 'POST',
                headers,
                body: formData,
            }
        );

        if (!response.ok) throw new Error('File upload failed');
        return response.json();
    },

    // Assign file to user
    assignFile: async (fileId, userId) => {
        return apiCall(`/files/${fileId}/assign`, {
            method: 'POST',
            body: { userId },
        });
    },

    // Receive file
    receiveFile: async (fileId) => {
        return apiCall(`/files/${fileId}/receive`, {
            method: 'POST',
        });
    },
};

export default fileService;
