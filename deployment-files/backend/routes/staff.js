const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const staffController = require('../controllers/staffController');
const upload = require('../middleware/upload');

// List all staff
router.get('/', auth, authorize('admin', 'superadmin'), staffController.listStaff);
// Get single staff
router.get('/:id', auth, authorize('admin', 'superadmin'), staffController.getStaff);
// Create staff
router.post('/', auth, authorize('admin', 'superadmin'), upload.single('avatar'), staffController.createStaff);
// Update staff
router.put('/:id', auth, authorize('admin', 'superadmin'), upload.single('avatar'), staffController.updateStaff);
// Delete staff
router.delete('/:id', auth, authorize('admin', 'superadmin'), staffController.deleteStaff);

module.exports = router; 