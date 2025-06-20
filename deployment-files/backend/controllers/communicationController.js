// server/controllers/communicationController.js
const { 
  TeamMessage, 
  ChatRoom, 
  ChatMessage, 
  EmployeeSurvey, 
  SurveyResponse,
  Staff,
  User,
  TeamMember,
  MessageRead,
  ChatRoomMember,
  sequelize,
  SurveyTemplate,
} = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

// Team Messages/Memos
const createTeamMessage = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, content, priority, department, sendEmail: shouldSendEmail } = req.body;
    // Optional fields
    const targetEmails = req.body.targetEmails || [];
    const ccEmails = req.body.ccEmails || [];

    // Handle attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, { folder: 'communication' });
          attachments.push({
            url: result.secure_url,
            originalName: file.originalname,
            mimetype: file.mimetype
          });
          await fs.unlink(file.path);
        } catch (err) {
          console.error('Cloudinary upload failed:', err);
          attachments.push({
            url: `/uploads/${file.filename}`,
            originalName: file.originalname,
            mimetype: file.mimetype
          });
        }
      }
    }

    const message = await TeamMessage.create({
      title,
      content,
      priority,
      department: department && department.length > 0 ? department : null,
      senderId: req.user.id,
      attachments: attachments.length > 0 ? JSON.stringify(attachments) : null
    }, { transaction });

    // Only send email if any of the conditions are met
    if (
      (shouldSendEmail && ['high', 'urgent'].includes(priority)) ||
      (Array.isArray(targetEmails) && targetEmails.length > 0) ||
      (Array.isArray(ccEmails) && ccEmails.length > 0)
    ) {
      let recipients = [];
      if (department && department.length > 0) {
        const teamMembers = await TeamMember.findAll({
          where: { department: { [Op.in]: department } },
          attributes: ['email', 'fullName']
        });
        recipients = teamMembers.filter(tm => tm.email).map(tm => ({
          email: tm.email,
          name: tm.fullName
        }));
      }
      if (Array.isArray(targetEmails)) {
        targetEmails.forEach(email => {
          if (email && !recipients.some(r => r.email === email)) {
            recipients.push({ email, name: '' });
          }
        });
      }
      let ccList = [];
      if (Array.isArray(ccEmails)) {
        ccList = ccEmails.filter(email => !!email && !recipients.some(r => r.email === email));
      }
      recipients = recipients.filter((r, idx, arr) => arr.findIndex(x => x.email === r.email) === idx);

      const emailPromises = recipients.map(recipient => 
        sendEmail({
          to: recipient.email,
          cc: ccList,
          template: 'team-message',
          data: {
            name: recipient.name || recipient.email,
            title: message.title,
            content: message.content,
            priority: message.priority,
            sender: req.user.fullName
          }
        })
      );
      await Promise.allSettled(emailPromises);
      await message.update({ isEmailSent: true }, { transaction });
    }

    await transaction.commit();

    const newMessage = await TeamMessage.findByPk(message.id, {
      include: [{
        model: Staff,
        as: 'sender',
        attributes: ['id', 'fullName', 'email', 'avatarUrl']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Team message created successfully',
      data: newMessage
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating team message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create team message' 
    });
  }
};

const getTeamMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, priority, unreadOnly } = req.query;
    const offset = (page - 1) * limit;

    // Get user's department
    const userTeamProfile = await TeamMember.findOne({
      where: { staffId: req.user.id }
    });

    // Build where clause
    const where = {
      [Op.or]: [
        { department: null }, // Messages for all departments
        { department: { [Op.contains]: [userTeamProfile?.department] } } // Messages for user's department
      ]
    };

    if (priority) where.priority = priority;

    // Get messages
    const { count, rows: messages } = await TeamMessage.findAndCountAll({
      where,
      include: [{
        model: Staff,
        as: 'sender',
        attributes: ['id', 'fullName', 'email', 'avatarUrl']
      }],
      order: [['created_at', 'DESC']], // <-- Fix: use DB field name
      limit: parseInt(limit),
      offset
    });

    // Get read status for messages
    const messageIds = messages.map(m => m.id);
    const readMessages = await MessageRead.findAll({
      where: {
        messageId: { [Op.in]: messageIds },
        staffId: req.user.id
      },
      attributes: ['messageId']
    });

    const readMessageIds = new Set(readMessages.map(rm => rm.messageId));

    // Add read status to messages
    const messagesWithReadStatus = messages.map(message => ({
      ...message.toJSON(),
      isRead: readMessageIds.has(message.id)
    }));

    // Filter unread only if requested
    const finalMessages = unreadOnly === 'true' 
      ? messagesWithReadStatus.filter(m => !m.isRead)
      : messagesWithReadStatus;

    res.json({
      success: true,
      data: finalMessages,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching team messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch team messages' 
    });
  }
};

const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await MessageRead.findOrCreate({
      where: {
        messageId: id,
        staffId: req.user.id
      },
      defaults: {
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark message as read' 
    });
  }
};

// Chat Rooms
// --- AUTO-CREATE OR FIND DIRECT CHAT ROOM FOR USER ---
const getOrCreateDirectChatRoom = async (userId) => {
  // Find or create a "General" chat room for all users
  let room = await ChatRoom.findOne({
    where: { type: 'group', name: 'General', isActive: true }
  });
  if (!room) {
    room = await ChatRoom.create({
      name: 'General',
      description: 'General chat for all users',
      type: 'group',
      isActive: true,
      createdBy: userId
    });
  }
  // Ensure user is a member
  let member = await ChatRoomMember.findOne({
    where: { roomId: room.id, staffId: userId }
  });
  if (!member) {
    await ChatRoomMember.create({
      roomId: room.id,
      staffId: userId,
      isAdmin: false
    });
  }
  return room;
};

// --- OVERRIDE getChatRooms TO ALWAYS RETURN GENERAL CHAT ---
const getChatRooms = async (req, res) => {
  try {
    // Always ensure user is in the General chat room
    const generalRoom = await getOrCreateDirectChatRoom(req.user.id);

    // Only return the General chat room for now
    const chatRooms = await ChatRoom.findAll({
      where: {
        isActive: true,
        id: generalRoom.id
      },
      include: [
        {
          model: Staff,
          as: 'members',
          attributes: ['id', 'fullName', 'email', 'avatarUrl']
        },
        {
          model: ChatMessage,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [{
            model: Staff,
            as: 'sender',
            attributes: ['id', 'fullName']
          }]
        }
      ]
    });

    // Get unread counts
    const roomsWithUnread = await Promise.all(chatRooms.map(async (room) => {
      const member = await ChatRoomMember.findOne({
        where: { roomId: room.id, staffId: req.user.id }
      });

      let unreadCount = 0;
      if (member) {
        unreadCount = await ChatMessage.count({
          where: {
            roomId: room.id,
            created_at: { [Op.gt]: member.lastReadAt || member.joinedAt },
            senderId: { [Op.ne]: req.user.id }
          }
        });
      }

      return {
        ...room.toJSON(),
        unreadCount,
        lastMessage: room.messages[0] || null
      };
    }));

    res.json({
      success: true,
      data: roomsWithUnread
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat rooms' 
    });
  }
};

const createChatRoom = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description, type, memberIds, department } = req.body;

    const chatRoom = await ChatRoom.create({
      name,
      description,
      type,
      department,
      createdBy: req.user.id
    }, { transaction });

    // Add creator as admin member
    await ChatRoomMember.create({
      roomId: chatRoom.id,
      staffId: req.user.id,
      isAdmin: true
    }, { transaction });

    // Add other members
    if (memberIds && memberIds.length > 0) {
      const memberPromises = memberIds.map(staffId => 
        ChatRoomMember.create({
          roomId: chatRoom.id,
          staffId,
          isAdmin: false
        }, { transaction })
      );
      await Promise.all(memberPromises);
    }

    await transaction.commit();

    const newRoom = await ChatRoom.findByPk(chatRoom.id, {
      include: [{
        model: Staff,
        as: 'members',
        attributes: ['id', 'fullName', 'email', 'avatarUrl']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Chat room created successfully',
      data: newRoom
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating chat room:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create chat room' 
    });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is member of the room
    const isMember = await ChatRoomMember.findOne({
      where: { roomId, staffId: req.user.id }
    });

    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not a member of this chat room' 
      });
    }

    const { count, rows: messages } = await ChatMessage.findAndCountAll({
      where: { 
        roomId,
        isDeleted: false 
      },
      include: [
        {
          model: Staff,
          as: 'sender',
          attributes: ['id', 'fullName', 'email', 'avatarUrl']
        },
        {
          model: ChatMessage,
          as: 'replyTo',
          include: [{
            model: Staff,
            as: 'sender',
            attributes: ['id', 'fullName']
          }]
        }
      ],
      order: [['created_at', 'ASC']], // <-- Fix: ASC for oldest to newest
      limit: parseInt(limit),
      offset
    });

    // Update last read
    await ChatRoomMember.update(
      { lastReadAt: new Date() },
      { where: { roomId, staffId: req.user.id } }
    );

    res.json({
      success: true,
      data: messages, // Already in chronological order
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat messages' 
    });
  }
};

// Employee Surveys
const createSurvey = async (req, res) => {
  try {
    const { title, description, closesAt, anonymousOnly } = req.body;

    const survey = await EmployeeSurvey.create({
      title,
      description,
      closesAt,
      anonymousOnly,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: survey
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create survey' 
    });
  }
};

const getSurveys = async (req, res) => {
  try {
    const { active } = req.query;
    
    const where = {};
    if (active === 'true') {
      where.isActive = true;
      where[Op.or] = [
        { closesAt: null },
        { closesAt: { [Op.gt]: new Date() } }
      ];
    }

    const surveys = await EmployeeSurvey.findAll({
      where,
      include: [{
        model: Staff,
        as: 'creator',
        attributes: ['id', 'fullName']
      }],
      order: [['created_at', 'DESC']] // <-- Fix: use DB field name
    });

    // Get response counts
    const surveysWithCounts = await Promise.all(surveys.map(async (survey) => {
      const responseCount = await SurveyResponse.count({
        where: { surveyId: survey.id }
      });

      // Check if current user has responded (only for non-anonymous surveys)
      let hasResponded = false;
      if (!survey.anonymousOnly) {
        hasResponded = await SurveyResponse.count({
          where: { 
            surveyId: survey.id,
            staffId: req.user.id 
          }
        }) > 0;
      }

      return {
        ...survey.toJSON(),
        responseCount,
        hasResponded
      };
    }));

    res.json({
      success: true,
      data: surveysWithCounts
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch surveys' 
    });
  }
};

// Helper: Emit to all admins/superadmins online
function notifyAdmins(io, event, payload) {
  if (!io) return;
  io.sockets.sockets.forEach(socket => {
    const user = socket.user;
    if (user && ['admin', 'superadmin'].includes(user.role)) {
      socket.emit(event, payload);
    }
  });
}

// --- Survey Response: Notify admins online ---
const submitSurveyResponse = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { responseText, category, sentiment } = req.body;

    // Validate required field
    if (!responseText || typeof responseText !== 'string' || !responseText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    const survey = await EmployeeSurvey.findByPk(surveyId);
    if (!survey || !survey.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'Survey not found or inactive' 
      });
    }

    // Check if survey is closed
    if (survey.closesAt && new Date(survey.closesAt) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Survey has closed' 
      });
    }

    // Only allow one response per user for non-anonymous surveys
    if (!survey.anonymousOnly) {
      const existing = await SurveyResponse.findOne({
        where: { surveyId, staffId: req.user.id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a response to this survey'
        });
      }
    }

    // Create response
    const responseData = {
      surveyId,
      responseText,
      category: category || null,
      sentiment: sentiment || null,
      isAnonymous: survey.anonymousOnly
    };
    if (!survey.anonymousOnly) {
      responseData.staffId = req.user.id;
    }
    const response = await SurveyResponse.create(responseData);

    // Notify admins/superadmins online via socket.io
    const io = req.app.get('io');
    notifyAdmins(io, 'survey:new-response', {
      surveyId,
      response: {
        id: response.id,
        responseText: response.responseText,
        sentiment: response.sentiment,
        createdAt: response.createdAt,
        staffId: response.staffId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Survey response submitted successfully',
      data: {
        id: response.id,
        createdAt: response.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit survey response' 
    });
  }
};

// --- Survey Update: Email all employees ---
const updateSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { title, description, closesAt, anonymousOnly } = req.body;
    const survey = await EmployeeSurvey.findByPk(surveyId);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    await survey.update({ title, description, closesAt, anonymousOnly });

    // Fetch all team members with a valid email
    const teamMembers = await TeamMember.findAll({
      where: { email: { [Op.ne]: null } },
      attributes: ['email', 'fullName']
    });

    // Send email to all team members
    await Promise.allSettled(
      teamMembers.map(member =>
        sendEmail({
          to: member.email,
          template: null,
          subject: `Survey Updated: ${survey.title}`,
          data: {
            name: member.fullName,
            message: `The survey "${survey.title}" has been updated. Please check and respond if you haven't already.`
          }
        })
      )
    );

    res.json({
      success: true,
      message: 'Survey updated and notifications sent to all team members'
    });
  } catch (error) {
    console.error('Error updating survey:', error);
    res.status(500).json({ success: false, message: 'Failed to update survey' });
  }
};

const getSurveyResponses = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Find the survey
    const survey = await EmployeeSurvey.findByPk(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Only allow admin, superadmin, or the survey creator to view responses
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    const isCreator = survey.createdBy === req.user.id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view survey responses'
      });
    }

    // Fetch responses
    const responses = await SurveyResponse.findAll({
      where: { surveyId },
      include: survey.anonymousOnly ? [] : [{
        model: Staff,
        as: 'respondent',
        attributes: ['id', 'fullName', 'department']
      }],
      order: [['created_at', 'DESC']]
    });

    // Group by sentiment
    const sentimentGroups = {};
    responses.forEach(response => {
      const sentiment = response.sentiment || 'neutral';
      if (!sentimentGroups[sentiment]) {
        sentimentGroups[sentiment] = [];
      }
      sentimentGroups[sentiment].push(response);
    });

    res.json({
      success: true,
      data: {
        survey,
        responses,
        sentimentGroups,
        totalResponses: responses.length
      }
    });
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch survey responses'
    });
  }
};

// Survey Templates
const createSurveyTemplate = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Questions are required' });
    }
    const template = await SurveyTemplate.create({
      title,
      description,
      questions,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    console.error('Error creating survey template:', error);
    res.status(500).json({ success: false, message: 'Failed to create survey template' });
  }
};

const getSurveyTemplates = async (req, res) => {
  try {
    const templates = await SurveyTemplate.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching survey templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch survey templates' });
  }
};

const deleteSurveyTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await SurveyTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    await template.destroy();
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting survey template:', error);
    res.status(500).json({ success: false, message: 'Failed to delete survey template' });
  }
};

module.exports = {
  // Team Messages
  createTeamMessage,
  getTeamMessages,
  markMessageAsRead,
  
  // Chat
  getChatRooms,
  createChatRoom,
  getChatMessages,
  
  // Surveys
  createSurvey,
  getSurveys,
  submitSurveyResponse,
  updateSurvey,
  getSurveyResponses,

  // Survey Templates
  createSurveyTemplate,
  getSurveyTemplates,
  deleteSurveyTemplate,
};