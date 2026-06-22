import { apiCall } from './api';

export const authService = {
    // Login user
    login: async (username, password) => {
        try {
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: { username, password },
            });
            if (response.token) {
                // Use sessionStorage to auto-expire on browser close
                sessionStorage.setItem('token', response.token);
                sessionStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Logout user
    logout: () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    },

    // Get current user (renamed helper for clarity if needed, but matching existing usage)
    getUser: () => {
        const user = sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Get current user (alias for backward compatibility if needed)
    getCurrentUser: () => {
        const user = sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!sessionStorage.getItem('token');
    },

    // Get auth token
    getToken: () => {
        return sessionStorage.getItem('token');
    },

    // Register user (if applicable)
    register: async (userData) => {
        try {
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: userData,
            });
            if (response.token) {
                sessionStorage.setItem('token', response.token);
                sessionStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Verify token
    verifyToken: async () => {
        try {
            const response = await apiCall('/auth/verify', {
                method: 'GET',
            });
            return response;
        } catch (error) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            throw error;
        }
    },
};

export default authService;
