const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const auth = require('../middlewares/auth.middleware');

// Public route - anyone can submit contact form
router.post('/', contactController.create);

// Citizen routes - logged in user managing their own contacts
router.get('/my/history', auth, contactController.getMyContacts);
router.post('/:id/user-reply', auth, contactController.userReply);

// Protected routes - only admin/staff can view/manage
router.get('/', auth, contactController.getAll);
router.put('/:id/status', auth, contactController.updateStatus);
router.post('/:id/reply', auth, contactController.sendReply);
router.delete('/:id', auth, contactController.delete);

module.exports = router;
