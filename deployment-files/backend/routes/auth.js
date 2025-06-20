const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const authController = require('../controllers/authController');
const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('role').optional().isIn(['superadmin', 'admin', 'staff']),
  body('department').optional().isString(),
  body('phone').optional().isString()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists().withMessage('Password is required')
];

// Routes
router.post('/register', auth, authorize('superadmin'), registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/change-password', auth, authController.changePassword);
router.post('/logout', auth, authController.logout);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
