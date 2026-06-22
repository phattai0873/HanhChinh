import { apiCall } from './api';

export const feedbackService = {
    // Get all feedback
    getFeedback: async (filters = {}) => {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = `/feedback${queryString ? `?${queryString}` : ''}`;
        return apiCall(endpoint);
    },

    // Get feedback by ID
    getFeedbackById: async (feedbackId) => {
        return apiCall(`/feedback/${feedbackId}`);
    },

    // Create feedback
    createFeedback: async (feedbackData) => {
        return apiCall('/feedback', {
            method: 'POST',
            body: feedbackData,
        });
    },

    // Update feedback
    updateFeedback: async (feedbackId, feedbackData) => {
        return apiCall(`/feedback/${feedbackId}`, {
            method: 'PUT',
            body: feedbackData,
        });
    },

    // Delete feedback
    deleteFeedback: async (feedbackId) => {
        return apiCall(`/feedback/${feedbackId}`, {
            method: 'DELETE',
        });
    },

    // Reply to feedback
    replyFeedback: async (feedbackId, reply) => {
        return apiCall(`/feedback/${feedbackId}/reply`, {
            method: 'POST',
            body: { reply },
        });
    },

    // Get feedback stats
    getFeedbackStats: async () => {
        return apiCall('/feedback/stats');
    },
};

export default feedbackService;
