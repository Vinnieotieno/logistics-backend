const Testimonial = require('../models/Testimonial');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');
const sequelize = require('../config/database');
const { fn, col } = require('sequelize');

// Get all testimonials with filtering and pagination
const getTestimonials = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      published, 
      rating,
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { position: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filter by published status
    if (published !== undefined) {
      whereClause.isPublished = published === 'true';
    }
    
    // Filter by rating
    if (rating) {
      whereClause.rating = parseInt(rating);
    }

    const { count, rows: testimonials } = await Testimonial.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        testimonials,
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
      message: 'Error fetching testimonials', 
      error: error.message 
    });
  }
};

// Get public testimonials (published only)
const getPublicTestimonials = async (req, res) => {
  try {
    const { limit = 10, rating } = req.query;
    
    let whereClause = { isPublished: true };
    
    if (rating) {
      whereClause.rating = { [Op.gte]: parseInt(rating) };
    }

    const testimonials = await Testimonial.findAll({
      where: whereClause,
      order: [['rating', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      attributes: ['id', 'name', 'position', 'company', 'content', 'avatarUrl', 'rating', 'createdAt']
    });

    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching testimonials', 
      error: error.message 
    });
  }
};

// Get single testimonial
const getTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Testimonial not found' 
      });
    }

    res.json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching testimonial', 
      error: error.message 
    });
  }
};

// Create new testimonial
const createTestimonial = async (req, res) => {
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
      position,
      company,
      content,
      rating,
      isPublished
    } = req.body;

    // Handle avatar upload
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = req.file.path; // Cloudinary URL
    }

    const testimonial = await Testimonial.create({
      name,
      position,
      company,
      content,
      avatarUrl,
      rating: rating || 5,
      isPublished: isPublished || false
    });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating testimonial', 
      error: error.message 
    });
  }
};

// Update testimonial
const updateTestimonial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Testimonial not found' 
      });
    }

    const {
      name,
      position,
      company,
      content,
      rating,
      isPublished
    } = req.body;

    // Handle avatar upload
    let avatarUrl = testimonial.avatarUrl;
    if (req.file) {
      avatarUrl = req.file.path; // Cloudinary URL
    }

    await testimonial.update({
      name,
      position,
      company,
      content,
      avatarUrl,
      rating: rating !== undefined ? rating : testimonial.rating,
      isPublished: isPublished !== undefined ? isPublished : testimonial.isPublished
    });

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating testimonial', 
      error: error.message 
    });
  }
};

// Toggle testimonial published status
const togglePublished = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Testimonial not found' 
      });
    }

    await testimonial.update({
      isPublished: !testimonial.isPublished
    });

    res.json({
      success: true,
      message: `Testimonial ${testimonial.isPublished ? 'published' : 'unpublished'} successfully`,
      data: { isPublished: testimonial.isPublished }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling testimonial status', 
      error: error.message 
    });
  }
};

// Delete testimonial
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Testimonial not found' 
      });
    }

    await testimonial.destroy();

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting testimonial', 
      error: error.message 
    });
  }
};

// Get testimonial statistics
const getTestimonialStats = async (req, res) => {
  try {
    const totalTestimonials = await Testimonial.count();
    const publishedTestimonials = await Testimonial.count({ 
      where: { isPublished: true } 
    });
    const draftTestimonials = await Testimonial.count({ 
      where: { isPublished: false } 
    });

    // Rating distribution
    const ratingDistribution = await Testimonial.findAll({
      where: { isPublished: true },
      attributes: [
        'rating',
        [fn('COUNT', col('rating')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']]
    });

    // Average rating
    const avgRatingResult = await Testimonial.findOne({
      where: { isPublished: true },
      attributes: [
        [fn('AVG', col('rating')), 'avgRating']
      ],
      raw: true
    });

    const avgRating = avgRatingResult && avgRatingResult.avgRating
      ? parseFloat(avgRatingResult.avgRating).toFixed(1)
      : "0.0";

    res.json({
      success: true,
      data: {
        total: totalTestimonials,
        published: publishedTestimonials,
        drafts: draftTestimonials,
        avgRating,
        ratingDistribution: ratingDistribution.map(item => ({
          rating: item.rating,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching testimonial statistics', 
      error: error.message 
    });
  }
};

// Send testimonial request email
const requestTestimonialEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    // Generate a unique token
    const token = crypto.randomBytes(24).toString('hex');
    
    // Construct link
    const link = `${process.env.FRONTEND_URL || 'http://globeflight.co.ke/admin'}/testimonial/submit?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email with the correct format
    await sendEmail({
      to: email,
      template: 'testimonial-request',
      data: {
        link
      }
    });

    res.json({ 
      success: true, 
      message: 'Testimonial request has been sent successfully.' 
    });
  } catch (error) {
    console.error('Error sending testimonial request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send testimonial request. Please try again.',
      error: error.message 
    });
  }
};

// Public testimonial submission (from client)
const submitPublicTestimonial = async (req, res) => {
  try {
    const { name, position, company, content, rating, email, improvement, consent } = req.body;
    // Optionally: verify token/email if you store tokens
    if (!name || !content || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    // Save improvement and consent if model supports it
    const testimonial = await Testimonial.create({
      name,
      position,
      company,
      content,
      rating: rating || 5,
      isPublished: false,
      improvement: improvement || '',
      consent: consent === true || consent === 'true'
    });
    res.json({ success: true, message: 'Thank you for your feedback! Your testimonial will be reviewed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting testimonial', error: error.message });
  }
};

module.exports = {
  getTestimonials,
  getPublicTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  togglePublished,
  deleteTestimonial,
  getTestimonialStats,
  requestTestimonialEmail,
  submitPublicTestimonial
};
