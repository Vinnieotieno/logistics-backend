const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const contactController = require('../controllers/contactController');
const router = express.Router();

// Validation rules
const contactValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail(),
  body('mobileNumber').optional().trim(),
  body('services').optional().isArray().withMessage('Services must be an array'),
  body('inquiryType').optional().trim(),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
];

const replyValidation = [
  body('replyMessage').trim().isLength({ min: 10 }).withMessage('Reply message must be at least 10 characters'),
  body('subject').optional().trim()
];

// Public routes
router.post('/public', contactValidation, contactController.createContact);

// Admin routes
router.get('/', auth, authorize('admin', 'superadmin'), contactController.getContacts);
router.get('/stats', auth, authorize('admin', 'superadmin'), contactController.getContactStats);
router.get('/export', auth, authorize('admin', 'superadmin'), contactController.exportContacts);
router.get('/:id', auth, authorize('admin', 'superadmin'), contactController.getContact);
router.post('/:id/reply', auth, authorize('admin', 'superadmin'), replyValidation, contactController.replyToContact);
router.patch('/:id/toggle-read', auth, authorize('admin', 'superadmin'), contactController.toggleReadStatus);
router.delete('/:id', auth, authorize('superadmin'), contactController.deleteContact);
router.post('/bulk', auth, authorize('admin', 'superadmin'), contactController.bulkUpdateContacts);

module.exports = router;