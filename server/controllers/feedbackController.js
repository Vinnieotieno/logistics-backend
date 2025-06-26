const { Feedback } = require('../models');
const { Op } = require('sequelize');

// Submit website feedback (public endpoint)
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment, feedbackType, userAgent, pageUrl } = req.body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating is required and must be between 1-5' 
      });
    }

    // Basic spam protection - check for recent feedback from same IP
    const clientIP = req.ip || req.connection.remoteAddress;
    const recentFeedback = await Feedback.findOne({
      where: {
        clientIP,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      }
    });

    if (recentFeedback) {
      return res.status(429).json({ 
        success: false, 
        message: 'Please wait a few minutes before submitting another feedback' 
      });
    }

    // Create feedback record
    const feedback = await Feedback.create({
      rating,
      comment: comment || '',
      feedbackType: feedbackType || 'general',
      userAgent: userAgent || req.get('User-Agent'),
      pageUrl: pageUrl || req.get('Referer') || 'unknown',
      clientIP,
      isProcessed: false
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        id: feedback.id,
        rating: feedback.rating,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting feedback', 
      error: error.message 
    });
  }
};

// Get all feedback (admin only)
const getAllFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, feedbackType, processed } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (rating) where.rating = rating;
    if (feedbackType) where.feedbackType = feedbackType;
    if (processed !== undefined) where.isProcessed = processed === 'true';

    const { count, rows: feedback } = await Feedback.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching feedback', 
      error: error.message 
    });
  }
};

// Get feedback statistics
const getFeedbackStats = async (req, res) => {
  try {
    const totalFeedback = await Feedback.count();
    const processedFeedback = await Feedback.count({ where: { isProcessed: true } });
    const unprocessedFeedback = await Feedback.count({ where: { isProcessed: false } });

    // Average rating
    const avgRatingResult = await Feedback.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating']
      ],
      raw: true
    });

    const avgRating = avgRatingResult && avgRatingResult.avgRating
      ? parseFloat(avgRatingResult.avgRating).toFixed(1)
      : "0.0";

    // Rating distribution
    const ratingDistribution = await Feedback.findAll({
      attributes: [
        'rating',
        [require('sequelize').fn('COUNT', require('sequelize').col('rating')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']]
    });

    // Feedback type distribution
    const typeDistribution = await Feedback.findAll({
      attributes: [
        'feedbackType',
        [require('sequelize').fn('COUNT', require('sequelize').col('feedbackType')), 'count']
      ],
      group: ['feedbackType'],
      order: [['count', 'DESC']]
    });

    // Recent feedback (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFeedback = await Feedback.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totals: {
          total: totalFeedback,
          processed: processedFeedback,
          unprocessed: unprocessedFeedback,
          recent: recentFeedback
        },
        avgRating,
        ratingDistribution: ratingDistribution.map(item => ({
          rating: item.rating,
          count: parseInt(item.dataValues.count)
        })),
        typeDistribution: typeDistribution.map(item => ({
          type: item.feedbackType,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching feedback statistics', 
      error: error.message 
    });
  }
};

// Mark feedback as processed
const markAsProcessed = async (req, res) => {
  try {
    const { id } = req.params;
    const { processed, adminNotes } = req.body;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    await feedback.update({
      isProcessed: processed !== undefined ? processed : true,
      adminNotes: adminNotes || feedback.adminNotes,
      processedAt: processed ? new Date() : null,
      processedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating feedback', 
      error: error.message 
    });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    await feedback.destroy();

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting feedback', 
      error: error.message 
    });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackStats,
  markAsProcessed,
  deleteFeedback
}; 