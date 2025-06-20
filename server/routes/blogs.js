const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const blogController = require('../controllers/blogController');
const upload = require('../middleware/upload');
const router = express.Router();

// Validation rules
const blogValidation = [
  body('title').trim().isLength({ min: 5 }).withMessage('Blog title must be at least 5 characters'),
  body('shortDescription').optional().trim(),
  body('content').trim().isLength({ min: 50 }).withMessage('Blog content must be at least 50 characters'),
  body('categoryId').optional().isInt().withMessage('Invalid category'),
  // Accept tags as string or array
  body('tags').optional().custom(value => {
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') return true;
    return false;
  }).withMessage('Tags must be a string or array'),
  body('isPublished').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
];

const commentValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('comment').trim().isLength({ min: 3 }).withMessage('Comment must be at least 3 characters')
];

// Public routes
router.get('/public', blogController.getPublicBlogs);
router.get('/public/:identifier', blogController.getPublicBlog);
router.post('/public/:id/comments', commentValidation, blogController.addComment);
router.post('/public/:id/like', blogController.likeBlog);
router.post('/newsletter/subscribe', blogController.subscribeNewsletter);
router.post('/newsletter/unsubscribe', blogController.unsubscribeNewsletter);
router.get('/categories', blogController.getCategories);

// Admin routes
router.get('/', auth, blogController.getBlogs);
router.get('/stats', auth, authorize('admin', 'superadmin'), blogController.getBlogStats);
router.get('/comments', auth, authorize('admin', 'superadmin'), blogController.getComments);
router.get('/:identifier', auth, blogController.getBlog);
router.post('/', auth, authorize('admin', 'superadmin'), upload.single('featuredImage'), blogValidation, blogController.createBlog);
router.put('/:id', auth, authorize('admin', 'superadmin'), upload.single('featuredImage'), blogValidation, blogController.updateBlog);
router.patch('/:id/toggle-publish', auth, authorize('admin', 'superadmin'), blogController.togglePublished);
router.delete('/:id', auth, authorize('admin', 'superadmin'), blogController.deleteBlog);
router.patch('/comments/:id/moderate', auth, authorize('admin', 'superadmin'), blogController.moderateComment);

// Newsletter management routes (admin only)
router.get('/newsletter/subscribers', auth, authorize('admin', 'superadmin'), blogController.getNewsletterSubscribers);
router.get('/newsletter/stats', auth, authorize('admin', 'superadmin'), blogController.getNewsletterStats);
router.delete('/newsletter/subscribers/:id', auth, authorize('admin', 'superadmin'), blogController.deleteNewsletterSubscriber);
router.patch('/newsletter/subscribers/:id/unsubscribe', auth, authorize('admin', 'superadmin'), blogController.adminUnsubscribeNewsletter);
router.patch('/newsletter/subscribers/:id/resubscribe', auth, authorize('admin', 'superadmin'), blogController.adminResubscribeNewsletter);

module.exports = router;