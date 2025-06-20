const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const testimonialController = require('../controllers/testimonialController');
const upload = require('../middleware/upload');
const router = express.Router();

// Validation rules
const testimonialValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('position').optional().trim(),
  body('company').optional().trim(),
  body('content').trim().isLength({ min: 10 }).withMessage('Testimonial content must be at least 10 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('isPublished').optional().isBoolean()
];

// Public routes first (no authentication required)
router.get('/public', testimonialController.getPublicTestimonials);
router.post('/public/submit', testimonialController.submitPublicTestimonial);

// Protected routes below
router.use(auth); // Apply authentication middleware to all routes below

// Stats and request routes
router.get('/stats', authorize('admin', 'superadmin'), testimonialController.getTestimonialStats);
router.post('/request', authorize('admin', 'superadmin'), testimonialController.requestTestimonialEmail);

// Regular CRUD routes
router.get('/', authorize('admin', 'superadmin'), testimonialController.getTestimonials);
router.post('/', authorize('admin', 'superadmin'), upload.single('avatar'), testimonialValidation, testimonialController.createTestimonial);

// ID-based routes
router.get('/:id', authorize('admin', 'superadmin'), testimonialController.getTestimonial);
router.put('/:id', authorize('admin', 'superadmin'), upload.single('avatar'), testimonialValidation, testimonialController.updateTestimonial);
router.patch('/:id/toggle-publish', authorize('admin', 'superadmin'), testimonialController.togglePublished);
router.delete('/:id', authorize('superadmin'), testimonialController.deleteTestimonial);

module.exports = router;