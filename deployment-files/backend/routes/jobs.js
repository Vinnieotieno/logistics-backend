const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const jobController = require('../controllers/jobController');
const upload = require('../middleware/upload');
const router = express.Router();

// Validation rules
const jobValidation = [
  body('title').trim().isLength({ min: 5 }).withMessage('Job title must be at least 5 characters'),
  body('department').notEmpty().trim().withMessage('Department is required'),
  body('location').notEmpty().trim().withMessage('Location is required'),
  body('jobType').notEmpty().isIn(['full-time', 'part-time', 'contract', 'internship']).withMessage('Job type is required'),
  body('description').trim().isLength({ min: 50 }).withMessage('Job description must be at least 50 characters'),
  body('requirements').notEmpty().trim().withMessage('Qualifications are required'),
  body('responsibilities').notEmpty().trim().withMessage('Responsibilities are required'),
  body('benefits').optional().isArray(),
  body('applicationDeadline').notEmpty().isISO8601().withMessage('Application deadline is required and must be valid'),
  body('isPublished').optional().isBoolean()
];

const applicationValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('coverLetter').optional().trim(),
  body('portfolioUrl')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Invalid portfolio URL'),
];

// Public routes
router.get('/public', jobController.getPublicJobs);
router.get('/public/:identifier', jobController.getPublicJob);
router.post('/public/:id/apply', upload.single('resume'), applicationValidation, jobController.applyToJob);

// Admin routes
router.get('/', auth, jobController.getJobs);
router.get('/stats', auth, authorize('admin', 'superadmin'), jobController.getJobStats);
router.get('/applications', auth, authorize('admin', 'superadmin'), jobController.getApplications);
router.get('/:identifier', auth, jobController.getJob);
router.post('/', auth, authorize('admin', 'superadmin'), jobValidation, jobController.createJob);
router.put('/:id', auth, authorize('admin', 'superadmin'), jobValidation, jobController.updateJob);
router.patch('/:id/toggle-publish', auth, authorize('admin', 'superadmin'), jobController.togglePublished);
router.delete('/:id', auth, authorize('superadmin'), jobController.deleteJob);
router.patch('/applications/:id/status', auth, authorize('admin', 'superadmin'), jobController.updateApplicationStatus);
router.patch('/:id/close', auth, authorize('admin', 'superadmin'), jobController.closeJob);

// Schedule interview for all pending/shortlisted applications for a job
router.post(
  '/:id/schedule-interview',
  auth,
  authorize('admin', 'superadmin'),
  jobController.scheduleInterviewForJob
);

// Bulk update application statuses
router.patch(
  '/applications/bulk-status',
  auth,
  authorize('admin', 'superadmin'),
  jobController.bulkUpdateApplicationStatus
);

module.exports = router;
