// server/controllers/blogController.js
const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const BlogComment = require('../models/BlogComment');
const BlogLike = require('../models/BlogLike');
const NewsletterSubscription = require('../models/NewsletterSubscription');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const slugify = require('slugify');
const { sendEmail } = require('../utils/email');
const sequelize = require('../config/database'); // <-- Add this import
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;
const Testimonial = require('../models/Testimonial');

// Get all blogs with filtering, pagination, and search
const getBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      published, 
      featured,
      author,
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = {};
    let includeClause = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'fullName', 'email', 'avatarUrl']
      },
      {
        model: BlogCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }
    ];
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
      // Only add tags search if search is not empty
      if (search.trim()) {
        whereClause[Op.or].push({ tags: { [Op.overlap]: [search.toLowerCase()] } });
      }
    }
    
    // Filter by category
    if (category) {
      whereClause.categoryId = category;
    }
    
    // Filter by published status
    if (published !== undefined) {
      if (published === 'true' || published === true) {
        whereClause.isPublished = true;
      } else if (published === 'false' || published === false) {
        whereClause.isPublished = false;
      }
    }

    // Filter by featured status
    if (featured !== undefined) {
      if (featured === 'true' || featured === true) {
        whereClause.isFeatured = true;
      } else if (featured === 'false' || featured === false) {
        whereClause.isFeatured = false;
      }
    }
    
    // Filter by author
    if (author) {
      whereClause.authorId = author;
    }

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Add comment counts and recent comments
    const blogsWithStats = await Promise.all(
      blogs.map(async (blog) => {
        const commentCount = await BlogComment.count({
          where: { blogId: blog.id, isApproved: true }
        });
        
        const recentComments = await BlogComment.findAll({
          where: { blogId: blog.id, isApproved: true },
          order: [['createdAt', 'DESC']],
          limit: 3,
          attributes: ['id', 'name', 'comment', 'createdAt']
        });

        return {
          ...blog.toJSON(),
          commentCount,
          recentComments
        };
      })
    );

    res.json({
      success: true,
      data: {
        blogs: blogsWithStats,
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
      message: 'Error fetching blogs', 
      error: error.message 
    });
  }
};

// Get public blogs (for frontend)
const getPublicBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 6, 
      category, 
      featured,
      search,
      tags
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = { isPublished: true };
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.contains]: [search.toLowerCase()] } }
      ];
    }
    
    // Filter by category
    if (category) {
      whereClause.categoryId = category;
    }
    
    // Filter by featured status
    if (featured !== undefined) {
      whereClause.isFeatured = featured === 'true';
    }
    
    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      whereClause.tags = { [Op.overlap]: tagArray };
    }

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['fullName', 'avatarUrl']
        },
        {
          model: BlogCategory,
          as: 'category',
          attributes: ['name', 'slug']
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'title', 'slug', 'shortDescription', 'featuredImage', 'readTime', 'likesCount', 'viewsCount', 'publishedAt', 'tags']
    });

    res.json({
      success: true,
      data: {
        blogs,
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
      message: 'Error fetching public blogs', 
      error: error.message 
    });
  }
};

// Get single blog by ID or slug
const getBlog = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const whereClause = isNaN(identifier) 
      ? { slug: identifier } 
      : { id: parseInt(identifier) };

    const blog = await Blog.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'email', 'avatarUrl']
        },
        {
          model: BlogCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'description']
        }
      ]
    });

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }

    // Get comments for this blog
    const comments = await BlogComment.findAll({
      where: { blogId: blog.id, isApproved: true },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'comment', 'createdAt']
    });

    // Increment view count (only if not the author viewing)
    if (!req.user || req.user.id !== blog.authorId) {
      await blog.increment('viewsCount');
    }

    // Get related posts
    const relatedPosts = await Blog.findAll({
      where: {
        categoryId: blog.categoryId,
        id: { [Op.ne]: blog.id },
        isPublished: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 3,
      attributes: ['id', 'title', 'slug', 'featuredImage', 'shortDescription', 'createdAt']
    });

    res.json({
      success: true,
      data: {
        ...blog.toJSON(),
        comments,
        relatedPosts
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blog post', 
      error: error.message 
    });
  }
};

// Get public blog (for frontend)
const getPublicBlog = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const whereClause = isNaN(identifier) 
      ? { slug: identifier, isPublished: true } 
      : { id: parseInt(identifier), isPublished: true };

    const blog = await Blog.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['fullName', 'avatarUrl']
        },
        {
          model: BlogCategory,
          as: 'category',
          attributes: ['name', 'slug']
        }
      ]
    });

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }

    // Get approved comments
    const comments = await BlogComment.findAll({
      where: { blogId: blog.id, isApproved: true },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'name', 'comment', 'createdAt']
    });

    // Increment view count
    await blog.increment('viewsCount');

    // Get related posts
    const relatedPosts = await Blog.findAll({
      where: {
        categoryId: blog.categoryId,
        id: { [Op.ne]: blog.id },
        isPublished: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['fullName']
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit: 3,
      attributes: ['id', 'title', 'slug', 'featuredImage', 'shortDescription', 'readTime', 'publishedAt']
    });

    res.json({
      success: true,
      data: {
        ...blog.toJSON(),
        comments,
        relatedPosts
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching blog post', 
      error: error.message 
    });
  }
};

// Create new blog post
const createBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return the first error message for easier debugging
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0]?.msg || 'Validation error',
        errors: errors.array()
      });
    }

    const {
      title,
      shortDescription,
      content,
      featuredImage,
      categoryId,
      readTime,
      isPublished,
      isFeatured,
      metaTitle,
      metaDescription,
      tags
    } = req.body;

    // Always set imageUrl, even if no image is uploaded
    let imageUrl = featuredImage || '';
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'blogs' });
        imageUrl = result.secure_url;
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        imageUrl = req.file.path;
      }
    }

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ where: { slug } });
    if (existingBlog) {
      return res.status(400).json({ 
        success: false, 
        message: 'A blog post with this title already exists' 
      });
    }

    // Validate category exists
    if (categoryId) {
      const category = await BlogCategory.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid category selected' 
        });
      }
    }

    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags.map(tag => tag.toLowerCase());
    } else if (typeof tags === 'string' && tags.trim() !== '') {
      tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
    }

    const blog = await Blog.create({
      title,
      slug,
      shortDescription,
      content,
      featuredImage: imageUrl, // always set
      authorId: req.user.id,
      categoryId,
      readTime: readTime || calculateReadTime(content),
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription,
      tags: tagsArray,
      publishedAt: isPublished ? new Date() : null
    });

    // Fetch the created blog with relations
    const createdBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: BlogCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    // Send notification to subscribers if blog is published
    if (blog.isPublished) {
      await sendBlogNotificationToSubscribers(blog);
    }

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: createdBlog
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error creating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating blog post', 
      error: error.message 
    });
  }
};

// Update blog post
const updateBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }

    const {
      title,
      shortDescription,
      content,
      featuredImage,
      categoryId,
      readTime,
      isPublished,
      isFeatured,
      metaTitle,
      metaDescription,
      tags
    } = req.body;

    const wasPublished = blog.isPublished;

    // Handle featured image upload
    let imageUrl = featuredImage || blog.featuredImage;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'blogs' });
        imageUrl = result.secure_url;
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        imageUrl = req.file.path;
      }
    }

    // Generate new slug if title changed
    let slug = blog.slug;
    if (title !== blog.title) {
      slug = slugify(title, { lower: true, strict: true });
      
      // Check if new slug already exists
      const existingBlog = await Blog.findOne({ 
        where: { 
          slug, 
          id: { [Op.ne]: id } 
        } 
      });
       
      if (existingBlog) {
        return res.status(400).json({ 
          success: false, 
          message: 'A blog post with this title already exists'  
        });
      }
    }

    // Validate category if provided
    if (categoryId) {
      const category = await BlogCategory.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid category selected' 
        });
      }
    }

    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags.map(tag => tag.toLowerCase());
    } else if (typeof tags === 'string' && tags.trim() !== '') {
      tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase());
    }

    await blog.update({
      title,
      slug,
      shortDescription,
      content,
      featuredImage: imageUrl,
      categoryId,
      readTime: readTime || calculateReadTime(content || blog.content),
      isPublished: isPublished !== undefined ? isPublished : blog.isPublished,
      isFeatured: isFeatured !== undefined ? isFeatured : blog.isFeatured,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription,
      tags: tagsArray,
      publishedAt: (isPublished && !wasPublished) ? new Date() : blog.publishedAt
    });

    // Send notification to subscribers if blog is published and was updated
    if (blog.isPublished) {
      await sendBlogUpdateNotificationToSubscribers(blog);
    }

    // Fetch updated blog with relations
    const updatedBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: BlogCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating blog post', 
      error: error.message 
    });
  }
};

// Toggle blog published status
const togglePublished = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blog post not found' 
      });
    }

    const wasPublished = blog.isPublished;
    await blog.update({
      isPublished: !blog.isPublished,
      publishedAt: (!blog.isPublished && !wasPublished) ? new Date() : blog.publishedAt
    });

    // Send newsletter notification if newly published
    if (!wasPublished && blog.isPublished) {
      await sendBlogNotificationToSubscribers(blog);
    }

    res.json({
      success: true,
      message: `Blog post ${blog.isPublished ? 'published' : 'unpublished'} successfully`,
      data: { isPublished: blog.isPublished }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling blog status', 
      error: error.message 
    });
  }
};

// Delete blog post
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    await blog.destroy();

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blog post',
      error: error.message
    });
  }
};

// Add comment to blog post (public endpoint)
const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, email, comment } = req.body;

    const blog = await Blog.findByPk(id);
    if (!blog || !blog.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const newComment = await BlogComment.create({
      blogId: blog.id,
      name,
      email: email || null, // Make email optional
      comment,
      isApproved: false // Comments need approval by default
    });

    // Notify admin about new comment
    await sendCommentNotification(blog, newComment);

    res.status(201).json({
      success: true,
      message: 'Comment submitted successfully. It will be visible after approval.',
      data: {
        id: newComment.id,
        name: newComment.name,
        comment: newComment.comment,
        createdAt: newComment.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

// Get comments for admin approval
const getComments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      approved,
      blogId
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};

    if (approved !== undefined) {
      whereClause.isApproved = approved === 'true';
    }

    if (blogId) {
      whereClause.blogId = blogId;
    }

    const { count, rows: comments } = await BlogComment.findAndCountAll({
      where: whereClause,
      include: [{
        model: Blog,
        as: 'blog',
        attributes: ['id', 'title', 'slug']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        comments,
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
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// Approve/reject comment
const moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    // Accept both boolean and string 'true'/'false'
    let { approved } = req.body;
    if (typeof approved === 'string') {
      approved = approved === 'true';
    }

    const comment = await BlogComment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await comment.update({ isApproved: approved });

    res.json({
      success: true,
      message: `Comment ${approved ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error moderating comment',
      error: error.message
    });
  }
};

// Like blog post (public endpoint)
const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip;
    const userId = req.user?.id;

    const blog = await Blog.findByPk(id);
    if (!blog || !blog.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if already liked
    const existingLike = await BlogLike.findOne({
      where: {
        blogId: blog.id,
        [Op.or]: [
          { ipAddress },
          ...(userId ? [{ userId }] : [])
        ]
      }
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await blog.decrement('likesCount');

      res.json({
        success: true,
        message: 'Blog post unliked',
        liked: false,
        likesCount: blog.likesCount - 1
      });
    } else {
      // Like
      await BlogLike.create({
        blogId: blog.id,
        ipAddress,
        userId
      });
      await blog.increment('likesCount');

      res.json({
        success: true,
        message: 'Blog post liked',
        liked: true,
        likesCount: blog.likesCount + 1
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking blog post',
      error: error.message
    });
  }
};

// Subscribe to newsletter (public endpoint)
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required'
      });
    }

    const [subscription, created] = await NewsletterSubscription.findOrCreate({
      where: { email },
      defaults: { isActive: true }
    });

    if (!created && subscription.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed'
      });
    }

    if (!created && !subscription.isActive) {
      await subscription.update({ isActive: true });
    }

    // Send welcome email
    await sendWelcomeEmail(email);

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error subscribing to newsletter',
      error: error.message
    });
  }
};

// Unsubscribe from newsletter
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required'
      });
    }

    const subscription = await NewsletterSubscription.findOne({
      where: { email }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscription list'
      });
    }

    if (!subscription.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Email is already unsubscribed'
      });
    }

    await subscription.update({ isActive: false });

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unsubscribing from newsletter',
      error: error.message
    });
  }
};

// Get blog categories
const getCategories = async (req, res) => {
  try {
    const categories = await BlogCategory.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'description']
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// Blog statistics
const getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.count();
    const publishedBlogs = await Blog.count({ where: { isPublished: true } });
    const draftBlogs = await Blog.count({ where: { isPublished: false } });
    const totalComments = await BlogComment.count();
    const pendingComments = await BlogComment.count({ where: { isApproved: false } });
    const totalSubscribers = await NewsletterSubscription.count({ where: { isActive: true } });

    // Get total views and likes
    const blogStats = await Blog.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('views_count')), 'totalViews'],
        [sequelize.fn('SUM', sequelize.col('likes_count')), 'totalLikes'],
        [sequelize.fn('AVG', sequelize.col('views_count')), 'avgViews']
      ]
    });

    res.json({
      success: true,
      data: {
        blogs: {
          total: totalBlogs,
          published: publishedBlogs,
          drafts: draftBlogs
        },
        comments: {
          total: totalComments,
          pending: pendingComments
        },
        engagement: {
          totalViews: parseInt(blogStats.dataValues.totalViews || 0),
          totalLikes: parseInt(blogStats.dataValues.totalLikes || 0),
          avgViews: parseFloat(blogStats.dataValues.avgViews || 0).toFixed(1)
        },
        subscribers: totalSubscribers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog statistics',
      error: error.message
    });
  }
};

// Helper functions
const calculateReadTime = (content) => {
  if (!content) return 5;
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sendBlogNotificationToSubscribers = async (blog) => {
  try {
    const subscribers = await NewsletterSubscription.findAll({
      where: { isActive: true },
      attributes: ['email']
    });

    if (subscribers.length === 0) return;

    const emailData = {
      template: 'new-blog-post',
      subject: `New Blog Post: ${blog.title}`,
      data: {
        blogTitle: blog.title,
        blogDescription: blog.shortDescription,
        blogUrl: `${process.env.FRONTEND_URL}/blog/${blog.slug}`,
        featuredImage: blog.featuredImage,
        companyName: process.env.COMPANY_NAME || 'Globeflight Worldwide Express',
        companyAddress: process.env.COMPANY_ADDRESS || 'Nairobi, Kenya',
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email={{email}}`
      }
    };

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      await Promise.all(
        batch.map(subscriber =>
          sendEmail({
            ...emailData,
            to: subscriber.email,
            data: {
              ...emailData.data,
              unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
            }
          })
        )
      );

      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Error sending blog notifications:', error);
  }
};

const sendCommentNotification = async (blog, comment) => {
  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Comment on: ${blog.title}`,
      template: 'new-comment',
      data: {
        blogTitle: blog.title,
        blogUrl: `${process.env.ADMIN_URL}/blogs/${blog.id}`,
        commenterName: comment.name,
        commenterEmail: comment.email,
        comment: comment.comment
      }
    });
  } catch (error) {
    console.error('Error sending comment notification:', error);
  }
};

const sendWelcomeEmail = async (email) => {
  try {
    await sendEmail({
      to: email,
      subject: 'Welcome to Our Newsletter!',
      template: 'newsletter-welcome',
      data: {
        email,
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`
      }
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

const sendBlogUpdateNotificationToSubscribers = async (blog) => {
  try {
    const subscribers = await NewsletterSubscription.findAll({
      where: { isActive: true },
      attributes: ['email']
    });

    if (subscribers.length === 0) return;

    const emailData = {
      template: 'blog-updated',
      subject: `Blog Post Updated: ${blog.title}`,
      data: {
        blogTitle: blog.title,
        blogDescription: blog.shortDescription,
        blogUrl: `${process.env.FRONTEND_URL}/blog/${blog.slug}`,
        featuredImage: blog.featuredImage,
        companyName: process.env.COMPANY_NAME || 'Globeflight Worldwide Express',
        companyAddress: process.env.COMPANY_ADDRESS || 'Nairobi, Kenya',
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email={{email}}`
      }
    };

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      await Promise.all(
        batch.map(subscriber =>
          sendEmail({
            ...emailData,
            to: subscriber.email,
            data: {
              ...emailData.data,
              unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
            }
          })
        )
      );

      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Error sending blog update notifications:', error);
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

// Get newsletter subscribers (admin)
const getNewsletterSubscribers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status,
      sortBy = 'subscribedAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // Search functionality
    if (search) {
      whereClause.email = { [Op.iLike]: `%${search}%` };
    }
    
    // Filter by status
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'unsubscribed') {
      whereClause.isActive = false;
    }

    // Map sortBy to correct field names
    let actualSortBy = sortBy;
    if (sortBy === 'createdAt') {
      actualSortBy = 'subscribedAt';
    }

    const { count, rows: subscribers } = await NewsletterSubscription.findAndCountAll({
      where: whereClause,
      order: [[actualSortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('BlogController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching newsletter subscribers', 
      error: error.message 
    });
  }
};

// Get newsletter statistics (admin)
const getNewsletterStats = async (req, res) => {
  try {
    const total = await NewsletterSubscription.count();
    const active = await NewsletterSubscription.count({ where: { isActive: true } });
    const unsubscribed = await NewsletterSubscription.count({ where: { isActive: false } });
    
    // This month's subscriptions
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthCount = await NewsletterSubscription.count({
      where: {
        subscribedAt: { [Op.gte]: thisMonth }
      }
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        unsubscribed,
        thisMonth: thisMonthCount
      }
    });
  } catch (error) {
    console.error('BlogController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching newsletter statistics', 
      error: error.message 
    });
  }
};

// Delete newsletter subscriber (admin)
const deleteNewsletterSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await NewsletterSubscription.findByPk(id);
    
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscriber not found' 
      });
    }

    await subscription.destroy();

    res.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('BlogController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting subscriber', 
      error: error.message 
    });
  }
};

// Admin unsubscribe newsletter subscriber
const adminUnsubscribeNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await NewsletterSubscription.findByPk(id);
    
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscriber not found' 
      });
    }

    await subscription.update({
      isActive: false,
      unsubscribedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Subscriber unsubscribed successfully'
    });
  } catch (error) {
    console.error('BlogController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error unsubscribing subscriber', 
      error: error.message 
    });
  }
};

// Admin resubscribe newsletter subscriber
const adminResubscribeNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await NewsletterSubscription.findByPk(id);
    
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscriber not found' 
      });
    }

    await subscription.update({
      isActive: true,
      unsubscribedAt: null
    });

    res.json({
      success: true,
      message: 'Subscriber resubscribed successfully'
    });
  } catch (error) {
    console.error('BlogController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resubscribing subscriber', 
      error: error.message 
    });
  }
};

module.exports = {
  getBlogs,
  getPublicBlogs,
  getBlog,
  getPublicBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublished,
  addComment,
  getComments,
  moderateComment,
  likeBlog,
  subscribeNewsletter,
  unsubscribeNewsletter,
  getCategories,
  getBlogStats,
  getNewsletterSubscribers,
  getNewsletterStats,
  deleteNewsletterSubscriber,
  adminUnsubscribeNewsletter,
  adminResubscribeNewsletter,
  submitPublicTestimonial
};