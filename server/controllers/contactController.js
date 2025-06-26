// server/controllers/contactController.js
const Contact = require('../models/Contact');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
const { sendEmail } = require('../utils/email');

// Get all contact inquiries with filtering and pagination
const getContacts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      isRead, 
      dateFrom, 
      dateTo,
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filter by read status
    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true';
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contacts', 
      error: error.message 
    });
  }
};

// Get single contact by ID
const getContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact inquiry not found' 
      });
    }

    // Mark as read when viewed
    if (!contact.isRead) {
      await contact.update({ isRead: true });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contact', 
      error: error.message 
    });
  }
};

// Create new contact inquiry (public endpoint)
const createContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      name, 
      email, 
      mobileNumber, 
      services = [], 
      inquiryType, 
      message 
    } = req.body;

    // Check for spam - basic rate limiting by email
    const recentContact = await Contact.findOne({
      where: {
        email,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      }
    });

    if (recentContact) {
      return res.status(429).json({ 
        success: false, 
        message: 'Please wait a few minutes before submitting another inquiry' 
      });
    }

    // Create subject from inquiry type and services
    let subject = inquiryType ? `${inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry` : 'General Inquiry';
    if (services.length > 0) {
      subject += ` - ${services.join(', ')}`;
    }

    const contact = await Contact.create({
      name,
      email,
      phone: mobileNumber, // Map mobileNumber to phone field
      subject,
      message,
      isRead: false
    });

    // Send notification email to admin and customer service
    await sendContactNotification(contact, { services, inquiryType });

    // Send auto-reply to user
    await sendContactAutoReply(contact);

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully. We will get back to you soon.',
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting contact inquiry', 
      error: error.message 
    });
  }
};

// Reply to contact inquiry
const replyToContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { replyMessage, subject: replySubject } = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact inquiry not found' 
      });
    }

    // Send reply email
    await sendContactReply(contact, replyMessage, replySubject);

    // Update contact with reply timestamp
    await contact.update({ 
      repliedAt: new Date(),
      isRead: true 
    });

    res.json({
      success: true,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error sending reply', 
      error: error.message 
    });
  }
};

// Mark contact as read/unread
const toggleReadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact inquiry not found' 
      });
    }

    await contact.update({ isRead: !contact.isRead });

    res.json({
      success: true,
      message: `Contact marked as ${contact.isRead ? 'read' : 'unread'}`,
      data: { isRead: contact.isRead }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating read status', 
      error: error.message 
    });
  }
};

// Delete contact inquiry
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByPk(id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact inquiry not found' 
      });
    }

    await contact.destroy();

    res.json({
      success: true,
      message: 'Contact inquiry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting contact', 
      error: error.message 
    });
  }
};

// Bulk operations for contacts
const bulkUpdateContacts = async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid contact IDs are required' 
      });
    }

    let updateData = {};
    
    switch (action) {
      case 'mark-read':
        updateData.isRead = true;
        break;
      case 'mark-unread':
        updateData.isRead = false;
        break;
      case 'delete':
        await Contact.destroy({
          where: { id: { [Op.in]: ids } }
        });
        return res.json({
          success: true,
          message: `${ids.length} contact inquiries deleted successfully`
        });
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid action' 
        });
    }

    const [updatedCount] = await Contact.update(updateData, {
      where: { id: { [Op.in]: ids } }
    });

    res.json({
      success: true,
      message: `${updatedCount} contact inquiries updated successfully`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error performing bulk operation', 
      error: error.message 
    });
  }
};

// Get contact statistics
const getContactStats = async (req, res) => {
  try {
    const totalContacts = await Contact.count();
    const unreadContacts = await Contact.count({ 
      where: { isRead: false } 
    });
    const repliedContacts = await Contact.count({ 
      where: { repliedAt: { [Op.not]: null } } 
    });

    // Get contacts by date for chart data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const contactsByDate = await Contact.findAll({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']]
    });

    // Get most common subjects
    const commonSubjects = await Contact.findAll({
      attributes: [
        'subject',
        [Sequelize.fn('COUNT', Sequelize.col('subject')), 'count']
      ],
      where: {
        subject: { [Op.not]: null }
      },
      group: ['subject'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('subject')), 'DESC']],
      limit: 5
    });

    // Average response time (for replied contacts)
    const responseTimeQuery = await Contact.findAll({
      where: {
        repliedAt: { [Op.not]: null }
      },
      attributes: [
        [Sequelize.fn('AVG', 
          Sequelize.literal('EXTRACT(EPOCH FROM (replied_at - created_at))')
        ), 'avgResponseTimeSeconds']
      ]
    });

    const avgResponseTimeHours = responseTimeQuery[0]?.dataValues?.avgResponseTimeSeconds 
      ? (responseTimeQuery[0].dataValues.avgResponseTimeSeconds / 3600).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totals: {
          total: totalContacts,
          unread: unreadContacts,
          replied: repliedContacts,
          responseRate: totalContacts > 0 ? ((repliedContacts / totalContacts) * 100).toFixed(1) : 0
        },
        chartData: contactsByDate.map(item => ({
          date: item.dataValues.date,
          count: parseInt(item.dataValues.count)
        })),
        commonSubjects: commonSubjects.map(item => ({
          subject: item.subject,
          count: parseInt(item.dataValues.count)
        })),
        avgResponseTime: `${avgResponseTimeHours} hours`
      }
    });
  } catch (error) {
    console.error('Error in getContactStats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contact statistics', 
      error: error.message 
    });
  }
};

// Export contacts to CSV
const exportContacts = async (req, res) => {
  try {
    const { 
      dateFrom, 
      dateTo, 
      isRead 
    } = req.query;

    let whereClause = {};
    
    // Filter by read status
    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true';
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    const contacts = await Contact.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'name', 'email', 'phone', 'subject', 
        'message', 'isRead', 'repliedAt', 'createdAt'
      ]
    });

    // Convert to CSV format
    const csvHeaders = [
      'ID', 'Name', 'Email', 'Phone', 'Subject', 
      'Message', 'Status', 'Replied At', 'Created At'
    ];

    const csvRows = contacts.map(contact => [
      contact.id,
      `"${contact.name}"`,
      contact.email,
      contact.phone || '',
      `"${contact.subject || ''}"`,
      `"${contact.message.replace(/"/g, '""')}"`, // Escape quotes in message
      contact.isRead ? 'Read' : 'Unread',
      contact.repliedAt ? contact.repliedAt.toISOString() : '',
      contact.createdAt.toISOString()
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="contacts_export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error exporting contacts', 
      error: error.message 
    });
  }
};

// Helper functions for email notifications
const sendContactNotification = async (contact, { services, inquiryType }) => {
  try {
    // Get admin emails from environment variables with proper filtering
    let adminEmails = [];
    if (process.env.ADMIN_EMAILS) {
      adminEmails = process.env.ADMIN_EMAILS.split(',').filter(email => email && email.trim());
    }
    
    // Add default admin email if not in the list
    const defaultAdminEmail = process.env.ADMIN_EMAIL || 'service@globeflight.co.ke';
    if (!adminEmails.includes(defaultAdminEmail)) {
      adminEmails.push(defaultAdminEmail);
    }
    
    // Add customer service email
    const customerServiceEmail = 'cs@globeflight.co.ke';
    const allRecipients = [...adminEmails, customerServiceEmail].filter(email => email && email.trim());

    console.log('Sending notifications to:', allRecipients);

    const emailPromises = allRecipients.map(adminEmail => 
      sendEmail({
        to: adminEmail.trim(),
        subject: `New Contact Inquiry: ${inquiryType ? inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1) + ' Inquiry' : 'General Inquiry'}`,
        template: 'contact-notification',
        data: {
          contact: {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            subject: contact.subject,
            message: contact.message,
            createdAt: contact.createdAt
          },
          adminUrl: `${process.env.ADMIN_URL || 'http://globeflight.co.ke/admin'}/contacts/${contact.id}`,
          services: services.join(', '),
          inquiryType: inquiryType ? inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1) : 'General'
        }
      })
    );

    await Promise.all(emailPromises);
    console.log('Contact notifications sent successfully');
  } catch (error) {
    console.error('Error sending contact notification:', error);
  }
};

const sendContactAutoReply = async (contact) => {
  try {
    await sendEmail({
      to: contact.email,
      subject: 'Thank you for contacting us - We\'ve received your inquiry',
      template: 'contact-auto-reply',
      data: {
        name: contact.name,
        subject: contact.subject,
        message: contact.message,
        ticketId: contact.id,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL,
        companyName: process.env.COMPANY_NAME || 'Globeflight World Express'
      }
    });
  } catch (error) {
    console.error('Error sending contact auto-reply:', error);
  }
};

const sendContactReply = async (contact, replyMessage, replySubject) => {
  try {
    const subject = replySubject || `Re: ${contact.subject || 'Your inquiry'}`;
    
    await sendEmail({
      to: contact.email,
      subject: subject,
      template: 'contact-reply',
      data: {
        name: contact.name,
        originalSubject: contact.subject,
        originalMessage: contact.message,
        replyMessage: replyMessage,
        ticketId: contact.id,
        supportEmail: process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL,
        companyName: process.env.COMPANY_NAME || 'WorldWings Logistics'
      }
    });
  } catch (error) {
    console.error('Error sending contact reply:', error);
    throw error; // Re-throw to handle in controller
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  replyToContact,
  toggleReadStatus,
  deleteContact,
  bulkUpdateContacts,
  getContactStats,
  exportContacts
};