import api from './api';

// Authentication services
export const authService = {
    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    changePassword: async (oldPassword, newPassword) => {
        const response = await api.post('/auth/change-password', { oldPassword, newPassword });
        return response.data;
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};

// File services
export const fileService = {
    getAll: async (params) => {
        const response = await api.get('/files', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/files/${id}`);
        return response.data;
    },

    create: async (fileData) => {
        const response = await api.post('/files', fileData);
        return response.data;
    },

    updateStatus: async (id, status, processing_note, result) => {
        const response = await api.put(`/files/${id}/status`, { status, processing_note, result });
        return response.data;
    },

    assign: async (id, assigned_to) => {
        const response = await api.put(`/files/${id}/assign`, { assigned_to });
        return response.data;
    },

    getFileTypes: async () => {
        const response = await api.get('/files/types');
        return response.data;
    },
};

// Feedback services
export const feedbackService = {
    getAll: async (params) => {
        const response = await api.get('/feedbacks', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/feedbacks/${id}`);
        return response.data;
    },

    create: async (feedbackData) => {
        const response = await api.post('/feedbacks', feedbackData);
        return response.data;
    },

    updateStatus: async (id, status, response) => {
        const res = await api.put(`/feedbacks/${id}/status`, { status, response });
        return res.data;
    },

    assign: async (id, assigned_to) => {
        const response = await api.put(`/feedbacks/${id}/assign`, { assigned_to });
        return response.data;
    },

    getPublic: async (params) => {
        const response = await api.get('/feedbacks/public', { params });
        return response.data;
    },
};

// User services
export const userService = {
    getAll: async (params) => {
        const response = await api.get('/users', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    create: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    update: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    getStaff: async () => {
        const response = await api.get('/users/staff');
        return response.data;
    },
};

// Dashboard services
export const dashboardService = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },

    getStatsByTime: async (type, period) => {
        const response = await api.get('/dashboard/stats-by-time', { params: { type, period } });
        return response.data;
    },

    getRecentActivities: async (limit) => {
        const response = await api.get('/dashboard/recent-activities', { params: { limit } });
        return response.data;
    },

    getPendingTasks: async () => {
        const response = await api.get('/dashboard/pending-tasks');
        return response.data;
    },
};
