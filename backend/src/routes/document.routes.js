const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const auth = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // Simple filename: timestamp-originalname
        // Ensure strictly safe filename if needed, but this is demo
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// All routes require authentication
router.use(auth);

// Get statistics
router.get('/stats/summary', documentController.getStats);

// Get all documents (query param ?type=...)
router.get('/', documentController.getAll);

// Create new document (with optional file upload)
router.post('/', upload.single('file'), documentController.create);

// Get document by ID
router.get('/:id', documentController.getById);

// Update document
router.put('/:id', upload.single('file'), documentController.update);

// Delete document
router.delete('/:id', documentController.delete);

module.exports = router;
