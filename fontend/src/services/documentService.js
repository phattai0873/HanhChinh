import { apiCall } from './api';

export const documentService = {
    // Get incoming documents
    getIncomingDocuments: async (filters = {}) => {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = `/documents/incoming${queryString ? `?${queryString}` : ''}`;
        return apiCall(endpoint);
    },

    // Get outgoing documents
    getOutgoingDocuments: async (filters = {}) => {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = `/documents/outgoing${queryString ? `?${queryString}` : ''}`;
        return apiCall(endpoint);
    },

    // Get document by ID
    getDocumentById: async (documentId) => {
        return apiCall(`/documents/${documentId}`);
    },

    // Create document
    createDocument: async (documentData) => {
        return apiCall('/documents', {
            method: 'POST',
            body: documentData,
        });
    },

    // Update document
    updateDocument: async (documentId, documentData) => {
        return apiCall(`/documents/${documentId}`, {
            method: 'PUT',
            body: documentData,
        });
    },

    // Delete document
    deleteDocument: async (documentId) => {
        return apiCall(`/documents/${documentId}`, {
            method: 'DELETE',
        });
    },

    // Send document
    sendDocument: async (documentId, recipientData) => {
        return apiCall(`/documents/${documentId}/send`, {
            method: 'POST',
            body: recipientData,
        });
    },

    // Receive document
    receiveDocument: async (documentId) => {
        return apiCall(`/documents/${documentId}/receive`, {
            method: 'POST',
        });
    },

    // Get document history
    getDocumentHistory: async (documentId) => {
        return apiCall(`/documents/${documentId}/history`);
    },
};

export default documentService;
