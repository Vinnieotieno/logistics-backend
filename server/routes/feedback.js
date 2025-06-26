const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { auth, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Public endpoint - submit feedback
router.post('/submit', [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
  body('feedbackType').optional().isIn(['positive', 'negative', 'suggestion', 'general']).withMessage('Invalid feedback type'),
  handleValidationErrors
], feedbackController.submitFeedback);

// Admin endpoints - require authentication
router.get('/', auth, authorize('admin', 'superadmin'), feedbackController.getAllFeedback);
router.get('/stats', auth, authorize('admin', 'superadmin'), feedbackController.getFeedbackStats);
router.patch('/:id/process', auth, authorize('admin', 'superadmin'), [
  body('processed').optional().isBoolean().withMessage('Processed must be a boolean'),
  body('adminNotes').optional().isString().withMessage('Admin notes must be a string'),
  handleValidationErrors
], feedbackController.markAsProcessed);
router.delete('/:id', auth, authorize('admin', 'superadmin'), feedbackController.deleteFeedback);

module.exports = router; 