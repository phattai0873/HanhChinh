import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    changePassword: async (oldPassword, newPassword) => {
        const response = await api.post('/auth/change-password', { oldPassword, newPassword });
        return response.data;
    }
};

// Dashboard API
export const dashboardAPI = {
    getStats: async (timeFilter = 'all') => {
        const response = await api.get('/dashboard/stats', { params: { timeFilter } });
        return response.data;
    },
    getRecentActivities: async (limit = 10) => {
        const response = await api.get(`/dashboard/recent-activities?limit=${limit}`);
        return response.data;
    },
    getStatsByTime: async (type, period) => {
        const response = await api.get(`/dashboard/stats-by-time?type=${type}&period=${period}`);
        return response.data;
    },
    getPendingTasks: async () => {
        const response = await api.get('/dashboard/pending-tasks');
        return response.data;
    }
};

// User API
export const userAPI = {
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
    }
};

// Citizen API
export const citizenAPI = {
    getAll: async (params) => {
        const response = await api.get('/citizens', { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/citizens/${id}`);
        return response.data;
    },
    getByIdNumber: async (idNumber) => {
        const response = await api.get(`/citizens/id-number/${idNumber}`);
        return response.data;
    },
    create: async (citizenData) => {
        const response = await api.post('/citizens', citizenData);
        return response.data;
    },
    update: async (id, citizenData) => {
        const response = await api.put(`/citizens/${id}`, citizenData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/citizens/${id}`);
        return response.data;
    }
};

// Feedback API
export const feedbackAPI = {
    create: async (feedbackData) => {
        const response = await api.post('/feedbacks', feedbackData);
        return response.data;
    },

    getAll: async (params) => {
        const response = await api.get('/feedbacks', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/feedbacks/${id}`);
        return response.data;
    },

    updateStatus: async (id, status, responseText) => {
        const response = await api.put(`/feedbacks/${id}/status`, { status, response: responseText });
        return response.data;
    },

    getPublic: async (params) => {
        const response = await api.get('/feedbacks/public', { params });
        return response.data;
    },

    getByCode: async (code) => {
        const response = await api.get(`/feedbacks/track/${code}`);
        return response.data;
    }
};

// File/OneGate API
export const fileAPI = {
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
    updateStatus: async (id, status, processingNote, appointmentDate) => {
        const response = await api.put(`/files/${id}/status`, {
            status,
            processing_note: processingNote,
            appointment_date: appointmentDate
        });
        return response.data;
    },
    getFileTypes: async () => {
        const response = await api.get('/files/types');
        return response.data;
    },
    getDepartments: async () => {
        const response = await api.get('/files/departments');
        return response.data;
    }
};

// News API
export const newsAPI = {
    getAll: async (params) => {
        const response = await api.get('/news', { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/news/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/news', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/news/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/news/${id}`);
        return response.data;
    },
    getPublic: async (limit = 6) => {
        const response = await api.get(`/news/public?limit=${limit}`);
        return response.data;
    }
};

// Application API (Legacy/Specific forms)
export const applicationAPI = {
    create: async (applicationData) => {
        const response = await api.post('/applications', applicationData);
        return response.data;
    },

    getByUser: async () => {
        const response = await api.get('/applications/user');
        return response.data;
    },

    getByCode: async (code) => {
        const response = await api.get(`/applications/code/${code}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/applications/${id}`);
        return response.data;
    }
};

// Document API (Incoming/Outgoing documents)
// Document API (Unified)
export const documentAPI = {
    getAll: async (type) => {
        const response = await api.get('/documents', { params: { type } });
        return response.data;
    },

    getById: async (type, id) => {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    },

    create: async (type, documentData) => {
        // documentData should be FormData or JSON containing 'type'
        const isFormData = documentData instanceof FormData;

        // If it's JSON and doesn't have type, add it
        if (!isFormData && !documentData.type) {
            documentData.type = type;
        }

        // If FormData, the caller must append 'type'

        const response = await api.post('/documents', documentData, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data;
    },

    update: async (type, id, documentData) => {
        const isFormData = documentData instanceof FormData;
        const response = await api.put(`/documents/${id}`, documentData, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        return response.data;
    },

    delete: async (type, id) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/documents/stats/summary');
        return response.data;
    }
};

// Contact API
export const contactAPI = {
    create: async (data) => {
        const response = await api.post('/contacts', data);
        return response.data;
    },
    getAll: async (params) => {
        const response = await api.get('/contacts', { params });
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await api.put(`/contacts/${id}/status`, { status });
        return response.data;
    },
    sendReply: async (id, admin_reply) => {
        const response = await api.post(`/contacts/${id}/reply`, { admin_reply });
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/contacts/${id}`);
        return response.data;
    },
    getMyContacts: async () => {
        const response = await api.get('/contacts/my/history');
        return response.data;
    },
    userReply: async (id, message) => {
        const response = await api.post(`/contacts/${id}/user-reply`, { message });
        return response.data;
    }
};

// Schedule API
export const scheduleAPI = {
    getAll: async (params) => {
        const response = await api.get('/schedules', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/schedules', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/schedules/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/schedules/${id}`);
        return response.data;
    }
};

export default api;
