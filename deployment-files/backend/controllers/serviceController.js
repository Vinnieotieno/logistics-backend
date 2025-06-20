const Service = require('../models/Service');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const slugify = require('slugify');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

// Get all services with pagination and filtering (admin)
const getServices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      published, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (published !== undefined) {
      whereClause.isPublished = published === 'true';
    }

    const { count, rows: services } = await Service.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'serviceCreator', // changed from 'creator'
        attributes: ['id', 'fullName', 'email']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        services,
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
      message: 'Error fetching services', 
      error: error.message 
    });
  }
};

// Get all published services (public)
const getPublicServices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = { isPublished: true };
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: services } = await Service.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 'title', 'slug', 'shortDescription', 'description', 'keyBenefits',
        'imageUrl', 'galleryUrls', 'metaTitle', 'metaDescription', 'createdAt', 'updatedAt', 'faq' // <-- add 'faq'
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        services,
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
      message: 'Error fetching public services', 
      error: error.message 
    });
  }
};

// Get single service by ID or slug (admin)
const getService = async (req, res) => {
  try {
    const { id } = req.params;
    const whereClause = isNaN(id) 
      ? { slug: id } 
      : { id: parseInt(id) };

    const service = await Service.findOne({
      where: whereClause,
      include: [{
        model: User,
        as: 'serviceCreator', // changed from 'creator'
        attributes: ['id', 'fullName', 'email', 'avatarUrl']
      }]
    });

    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching service', 
      error: error.message 
    });
  }
};

// Get single published service by ID or slug (public)
const getPublicService = async (req, res) => {
  try {
    const { identifier } = req.params;
    const whereClause = isNaN(identifier)
      ? { slug: identifier, isPublished: true }
      : { id: parseInt(identifier), isPublished: true };

    const service = await Service.findOne({
      where: whereClause,
      attributes: [
        'id', 'title', 'slug', 'shortDescription', 'description', 'keyBenefits',
        'imageUrl', 'galleryUrls', 'metaTitle', 'metaDescription', 'createdAt', 'updatedAt', 'faq' // <-- add 'faq'
      ]
    });

    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching public service', 
      error: error.message 
    });
  }
};

// Create new service
const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create a service'
      });
    }

    let {
      title,
      shortDescription,
      description,
      keyBenefits,
      galleryUrls,
      isPublished,
      metaTitle,
      metaDescription,
      imageUrl,
      faq // <-- add faq
    } = req.body;

    if (typeof keyBenefits === 'string') keyBenefits = keyBenefits.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof galleryUrls === 'string') galleryUrls = galleryUrls.split(',').map(s => s.trim()).filter(Boolean);

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'services' });
        imageUrl = result.secure_url;
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const slug = slugify(title, { lower: true, strict: true });

    const existingService = await Service.findOne({ where: { slug } });
    if (existingService) {
      return res.status(400).json({ 
        success: false, 
        message: 'A service with this title already exists' 
      });
    }

    // Parse FAQ if it's a string
    if (typeof faq === 'string') {
      try {
        faq = JSON.parse(faq);
      } catch {
        faq = [];
      }
    }

    const createdBy = req.user.id;

    const service = await Service.create({
      title,
      slug,
      shortDescription,
      description,
      keyBenefits: Array.isArray(keyBenefits) ? keyBenefits : [],
      imageUrl,
      galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
      isPublished: isPublished || false,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription,
      createdBy,
      faq: Array.isArray(faq) ? faq : [],
    });

    const createdService = await Service.findByPk(service.id, {
      include: [{
        model: User,
        as: 'serviceCreator', // changed from 'creator'
        attributes: ['id', 'fullName', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: createdService
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating service', 
      error: error.message 
    });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }

    let {
      title,
      shortDescription,
      description,
      keyBenefits,
      galleryUrls,
      isPublished,
      metaTitle,
      metaDescription,
      imageUrl,
      faq // <-- add faq
    } = req.body;

    if (typeof keyBenefits === 'string') keyBenefits = keyBenefits.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof galleryUrls === 'string') galleryUrls = galleryUrls.split(',').map(s => s.trim()).filter(Boolean);

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'services' });
        imageUrl = result.secure_url;
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    let slug = service.slug;
    if (title && title !== service.title) {
      slug = slugify(title, { lower: true, strict: true });
      const existingService = await Service.findOne({ 
        where: { 
          slug, 
          id: { [Op.ne]: id } 
        } 
      });
      if (existingService) {
        return res.status(400).json({ 
          success: false, 
          message: 'A service with this title already exists' 
        });
      }
    }

    // Parse FAQ if it's a string
    if (typeof faq === 'string') {
      try {
        faq = JSON.parse(faq);
      } catch {
        faq = [];
      }
    }

    await service.update({
      title,
      slug,
      shortDescription,
      description,
      keyBenefits: Array.isArray(keyBenefits) ? keyBenefits : service.keyBenefits,
      imageUrl: imageUrl || service.imageUrl,
      galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : service.galleryUrls,
      isPublished: isPublished !== undefined ? isPublished : service.isPublished,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription,
      faq: Array.isArray(faq) ? faq : service.faq,
    });

    const updatedService = await Service.findByPk(service.id, {
      include: [{
        model: User,
        as: 'serviceCreator', // changed from 'creator'
        attributes: ['id', 'fullName', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating service', 
      error: error.message 
    });
  }
};

// Toggle service published status
const togglePublished = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }

    await service.update({
      isPublished: !service.isPublished
    });

    res.json({
      success: true,
      message: `Service ${service.isPublished ? 'published' : 'unpublished'} successfully`,
      data: { isPublished: service.isPublished }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling service status', 
      error: error.message 
    });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Service not found' 
      });
    }

    await service.destroy();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting service', 
      error: error.message 
    });
  }
};

// Bulk operations
const bulkUpdateServices = async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid service IDs are required' 
      });
    }

    let updateData = {};
    switch (action) {
      case 'publish':
        updateData.isPublished = true;
        break;
      case 'unpublish':
        updateData.isPublished = false;
        break;
      case 'delete':
        await Service.destroy({
          where: { id: { [Op.in]: ids } }
        });
        return res.json({
          success: true,
          message: `${ids.length} services deleted successfully`
        });
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid action' 
        });
    }

    const [updatedCount] = await Service.update(updateData, {
      where: { id: { [Op.in]: ids } }
    });

    res.json({
      success: true,
      message: `${updatedCount} services updated successfully`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error performing bulk operation', 
      error: error.message 
    });
  }
};

// Get service statistics
const getServiceStats = async (req, res) => {
  try {
    const totalServices = await Service.count();
    const publishedServices = await Service.count({ 
      where: { isPublished: true } 
    });
    const draftServices = await Service.count({ 
      where: { isPublished: false } 
    });

    res.json({
      success: true,
      data: {
        total: totalServices,
        published: publishedServices,
        drafts: draftServices
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching service statistics', 
      error: error.message 
    });
  }
};

module.exports = {
  getServices,
  getPublicServices,
  getService,
  getPublicService,
  createService,
  updateService,
  togglePublished,
  deleteService,
  bulkUpdateServices,
  getServiceStats
};