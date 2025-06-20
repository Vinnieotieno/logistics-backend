const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const serviceController = require('../controllers/serviceController');
const upload = require('../middleware/upload');
const router = express.Router();

// Validation rules
const serviceValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Service title must be at least 3 characters'),
  body('shortDescription').optional().trim(),
  body('description').optional().trim(),
  body('keyBenefits').optional(),
  body('imageUrl').optional(),
  body('isPublished').optional().isBoolean()
];

// Public routes
router.get('/public', serviceController.getPublicServices);
router.get('/public/:identifier', serviceController.getPublicService);

// Admin routes
router.get('/', auth, serviceController.getServices);
router.get('/stats', auth, authorize('admin', 'superadmin'), serviceController.getServiceStats);
router.get('/:identifier', auth, serviceController.getService);
router.post('/', auth, authorize('admin', 'superadmin'), upload.single('image'), serviceValidation, serviceController.createService);
router.put('/:id', auth, authorize('admin', 'superadmin'), upload.single('image'), serviceValidation, serviceController.updateService);
router.patch('/:id/toggle-publish', auth, authorize('admin', 'superadmin'), serviceController.togglePublished);
router.delete('/:id', auth, authorize('admin', 'superadmin'), serviceController.deleteService);
router.post('/bulk', auth, authorize('admin', 'superadmin'), serviceController.bulkUpdateServices);

module.exports = router;