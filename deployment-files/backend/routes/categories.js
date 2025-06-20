const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const BlogCategory = require('../models/BlogCategory');
const slugify = require('slugify');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await BlogCategory.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
});

router.post(
  '/',
  auth,
  authorize('admin', 'superadmin'),
  body('name').trim().notEmpty().withMessage('Category name is required'),
  async (req, res) => {
    try {
      const { name } = req.body;
      const slug = slugify(name, { lower: true, strict: true });
      const existing = await BlogCategory.findOne({ where: { slug } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category already exists' });
      }
      const category = await BlogCategory.create({ name, slug });
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
    }
  }
);

module.exports = router;
