// server/routes/communication.js
const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const communicationController = require('../controllers/communicationController');
const upload = require('../middleware/upload');
const { ChatMessage, ChatRoomMember } = require('../models');

// Middleware to normalize targetEmails and ccEmails to arrays
function normalizeEmailArrays(req, res, next) {
  if (req.body.targetEmails && typeof req.body.targetEmails === 'string') {
    req.body.targetEmails = req.body.targetEmails
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);
  }
  if (req.body.ccEmails && typeof req.body.ccEmails === 'string') {
    req.body.ccEmails = req.body.ccEmails
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);
  }
  next();
}

// Team Messages
router.post(
  '/messages',
  auth,
  authorize('admin', 'superadmin', 'management'),
  upload.array('attachments', 5), // <-- Allow up to 5 files per message
  normalizeEmailArrays, // <-- Add this middleware
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('priority').isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
    body('targetEmails').optional().isArray().withMessage('targetEmails must be an array'),
    body('ccEmails').optional().isArray().withMessage('ccEmails must be an array'),
    handleValidationErrors
  ],
  communicationController.createTeamMessage
);

router.get('/messages', auth, communicationController.getTeamMessages);
router.post('/messages/:id/read', auth, communicationController.markMessageAsRead);

// Chat Rooms
router.get('/chat/rooms', auth, communicationController.getChatRooms);
router.post(
  '/chat/rooms',
  auth,
  [
    body('name').notEmpty().withMessage('Room name is required'),
    body('type').isIn(['group', 'direct', 'department']).withMessage('Invalid room type'),
    handleValidationErrors
  ],
  communicationController.createChatRoom
);
router.get('/chat/rooms/:roomId/messages', auth, communicationController.getChatMessages);

// Route to get read receipts for messages
router.post(
  '/chat/rooms/read-receipts',
  auth,
  async (req, res) => {
    try {
      const { messageIds } = req.body;
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.json({ data: {} });
      }
      // For each message, find all users who have read it (simulate: all room members whose lastReadAt > message.createdAt)
      const receipts = {};
      for (const msgId of messageIds) {
        const msg = await ChatMessage.findByPk(msgId);
        if (!msg) continue;
        const members = await ChatRoomMember.findAll({
          where: {
            roomId: msg.roomId,
            lastReadAt: { [require('sequelize').Op.gte]: msg.createdAt }
          }
        });
        receipts[msgId] = members.map(m => m.staffId);
      }
      res.json({ data: receipts });
    } catch (error) {
      res.json({ data: {} });
    }
  }
);

// Employee Surveys
router.post(
  '/surveys',
  auth,
  authorize('admin', 'superadmin', 'hr', 'management'),
  [
    body('title').notEmpty().withMessage('Survey title is required'),
    body('description').optional(),
    body('closesAt').optional().isISO8601().withMessage('Invalid date format'),
    handleValidationErrors
  ],
  communicationController.createSurvey
);

router.get('/surveys', auth, communicationController.getSurveys);
router.post(
  '/surveys/:surveyId/responses',
  auth,
  [
    body('responseText').notEmpty().withMessage('Response text is required'),
    body('sentiment').optional().isIn(['positive', 'neutral', 'negative', 'suggestion', 'complaint']),
    handleValidationErrors
  ],
  communicationController.submitSurveyResponse
);

router.get(
  '/surveys/:surveyId/responses',
  auth,
  communicationController.getSurveyResponses
);

// Update Survey
router.put(
  '/surveys/:surveyId',
  auth,
  authorize('admin', 'superadmin', 'hr', 'management'),
  [
    body('title').optional(),
    body('description').optional(),
    body('closesAt').optional().isISO8601().withMessage('Invalid date format'),
    body('anonymousOnly').optional().isBoolean(),
    handleValidationErrors
  ],
  communicationController.updateSurvey
);

// Survey Templates
router.post(
  '/survey-templates',
  auth,
  authorize('admin', 'superadmin', 'hr', 'management'),
  [
    body('title').notEmpty().withMessage('Template title is required'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
    handleValidationErrors
  ],
  communicationController.createSurveyTemplate
);

router.get(
  '/survey-templates',
  auth,
  communicationController.getSurveyTemplates
);

router.delete(
  '/survey-templates/:id',
  auth,
  authorize('admin', 'superadmin', 'hr', 'management'),
  communicationController.deleteSurveyTemplate
);

module.exports = router;