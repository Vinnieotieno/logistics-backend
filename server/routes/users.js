const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const staffController = require('../controllers/userController'); // Now staffController
const upload = require('../middleware/upload');
const router = express.Router();

// Validation rules
const userValidation = [
  body('email').isEmail().normalizeEmail(),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('role').optional().isIn(['superadmin', 'admin', 'user']),
  body('isActive').optional().isBoolean(),
  body('department').optional().isString(),
  body('phone').optional().isString()
];

const passwordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Public endpoint for team section
router.get('/team', async (req, res) => {
  try {
    const team = await staffController.getTeamMembers();
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching team', error: error.message });
  }
});

// All staff routes require authentication and admin privileges
router.use(auth);
router.use(authorize('admin', 'superadmin'));

router.get('/', staffController.getUsers);
router.get('/stats', staffController.getUserStats);
router.get('/:id', staffController.getUser);
router.post('/', [...userValidation, ...passwordValidation], staffController.createUser);
router.put('/:id', userValidation, staffController.updateUser);
router.patch('/:id/toggle-active', staffController.toggleActiveStatus);
router.patch('/:id/reset-password', authorize('superadmin'), staffController.resetPassword);
router.delete('/:id', authorize('superadmin'), staffController.deleteUser);
router.post('/:id/avatar', upload.single('avatar'), staffController.updateAvatar);

module.exports = router;
