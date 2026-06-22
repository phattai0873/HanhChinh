// User roles
export const USER_ROLES = {
    ADMIN: 'admin',
    OFFICER: 'officer',
    CITIZEN: 'citizen',
    MODERATOR: 'moderator',
};

// API endpoints
export const API_ENDPOINTS = {
    AUTH: '/auth',
    USERS: '/users',
    FILES: '/files',
    DOCUMENTS: '/documents',
    FEEDBACK: '/feedback',
    DASHBOARD: '/dashboard',
    SETTINGS: '/settings',
};

// Document status
export const DOCUMENT_STATUS = {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ARCHIVED: 'archived',
};

// File status
export const FILE_STATUS = {
    INCOMING: 'incoming',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
    ARCHIVED: 'archived',
};

// Feedback status
export const FEEDBACK_STATUS = {
    NEW: 'new',
    VIEWED: 'viewed',
    RESPONDING: 'responding',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    PAGE_SIZES: [10, 25, 50, 100],
};

// Error messages
export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'You are not authorized to perform this action',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Please check your input',
    SERVER_ERROR: 'Server error occurred',
    NETWORK_ERROR: 'Network error occurred',
};

// Success messages
export const SUCCESS_MESSAGES = {
    CREATED: 'Successfully created',
    UPDATED: 'Successfully updated',
    DELETED: 'Successfully deleted',
    SAVED: 'Successfully saved',
    SENT: 'Successfully sent',
};

// Local storage keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    PREFERENCES: 'preferences',
    THEME: 'theme',
};

// Date formats
export const DATE_FORMATS = {
    DEFAULT: 'DD/MM/YYYY',
    LONG: 'DD MMMM YYYY',
    TIME: 'HH:mm:ss',
    DATETIME: 'DD/MM/YYYY HH:mm:ss',
};
