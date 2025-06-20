const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const trackingController = require('../controllers/trackingController');
const router = express.Router();

// Validation rules
const shipmentValidation = [
  body('senderName').trim().isLength({ min: 2 }).withMessage('Sender name is required'),
  body('senderEmail').optional().isEmail().normalizeEmail(),
  body('receiverName').trim().isLength({ min: 2 }).withMessage('Receiver name is required'),
  body('receiverEmail').optional().isEmail().normalizeEmail(),
  body('packageDescription').optional().trim(),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('dimensions').optional().trim(),
  body('declaredValue').optional().isFloat({ min: 0 }).withMessage('Declared value must be a positive number'),
  body('origin').trim().isLength({ min: 2 }).withMessage('Origin is required'),
  body('destination').trim().isLength({ min: 2 }).withMessage('Destination is required'),
  body('packageName').optional().trim(),
  body('numberOfPackages').optional().isInt({ min: 1 }).withMessage('Number of packages must be at least 1'),
  body('isDangerousGood').optional().isBoolean(),
  body('unNumber').optional().trim()
];

const updateValidation = [
  body('status').trim().isLength({ min: 3 }).withMessage('Status is required'),
  body('location').optional().trim(),
  body('description').trim().isLength({ min: 5 }).withMessage('Description is required')
];

// Public routes
router.get('/public/:trackingNumber', trackingController.publicTrackShipment);

// Add these routes for waybill/invoice download
router.get('/:id/waybill', trackingController.downloadWaybill);
router.get('/:id/invoice', trackingController.downloadInvoice);

// Admin routes
router.get('/', auth, trackingController.getShipments);
router.get('/stats', auth, authorize('admin', 'superadmin'), trackingController.getTrackingStats);
router.get('/:identifier', auth, trackingController.getShipment);
router.post('/', auth, authorize('admin', 'superadmin'), shipmentValidation, trackingController.createShipment);
router.put('/:id', auth, authorize('admin', 'superadmin'), shipmentValidation, trackingController.updateShipment);
router.post('/:id/updates', auth, authorize('admin', 'superadmin'), updateValidation, trackingController.addTrackingUpdate);
router.delete('/:id', auth, authorize('superadmin'), trackingController.deleteShipment);

module.exports = router;