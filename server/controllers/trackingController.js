const Shipment = require('../models/Shipment');
const TrackingUpdate = require('../models/TrackingUpdate');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../models'); // <-- Use your Sequelize instance
const { sendEmail } = require('../utils/email');
const { generateTrackingNumber, calculateCBM } = require('../utils/helpers');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

// Create new shipment
const createShipment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const {
      senderName,
      senderEmail,
      senderPhone,
      senderAddress,
      receiverName,
      receiverEmail,
      receiverPhone,
      receiverAddress,
      packageDescription,
      packageName,
      numberOfPackages,
      isDangerousGood,
      unNumber,
      weight,
      dimensions, // Format: "length x width x height"
      declaredValue,
      serviceType,
      origin,
      destination,
      mode,
      note // <-- Add note from req.body
    } = req.body;

    // Generate unique tracking number
    const trackingNumber = await generateTrackingNumber();

    // Calculate CBM from dimensions
    const cbm = calculateCBM(dimensions);

    const shipment = await Shipment.create({
      trackingNumber,
      senderName,
      senderEmail,
      senderPhone,
      senderAddress,
      receiverName,
      receiverEmail,
      receiverPhone,
      receiverAddress,
      packageDescription,
      packageName,
      numberOfPackages,
      isDangerousGood,
      unNumber,
      weight: parseFloat(weight),
      dimensions,
      cbm,
      declaredValue: parseFloat(declaredValue),
      serviceType,
      origin,
      destination,
      status: 'pending',
      createdBy: req.user.id,
      mode
    });

    // Create initial tracking update
    await TrackingUpdate.create({
      shipmentId: shipment.id,
      status: 'pending',
      location: origin,
      description: note || 'Shipment created and awaiting pickup', 
      updatedBy: req.user.id
    });

    // Send confirmation emails
    await Promise.all([
      sendShipmentNotification(shipment, 'created', 'sender'),
      sendShipmentNotification(shipment, 'created', 'receiver')
    ]);

    // Fetch created shipment with relations
    const createdShipment = await Shipment.findByPk(shipment.id, {
      include: [
        {
          model: User,
          as: 'shipmentCreator',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: TrackingUpdate,
          as: 'updates',
          include: [{
            model: User,
            as: 'updatedByUser', 
            attributes: ['id', 'fullName']
          }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: createdShipment
    });
  } catch (error) {
    console.error('Error in createShipment:', error); // <-- Add error logging
    res.status(500).json({ 
      success: false, 
      message: 'Error creating shipment', 
      error: error.message 
    });
  }
};

// Get all shipments with filtering and pagination
const getShipments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      dateFrom, 
      dateTo,
      origin,
      destination,
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // Search functionality
    if (search && search.trim() !== "") {
      whereClause[Op.or] = [
        { trackingNumber: { [Op.like]: `%${search}%` } },
        { senderName: { [Op.like]: `%${search}%` } },
        { receiverName: { [Op.like]: `%${search}%` } },
        { senderEmail: { [Op.like]: `%${search}%` } },
        { receiverEmail: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filter by status
    if (status && status.trim() !== "") {
      whereClause.status = status;
    }
    
    // Filter by origin
    if (origin && origin.trim() !== "") {
      whereClause.origin = { [Op.like]: `%${origin}%` };
    }
    
    // Filter by destination
    if (destination && destination.trim() !== "") {
      whereClause.destination = { [Op.like]: `%${destination}%` };
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

    const { count, rows: shipments } = await Shipment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'shipmentCreator',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: TrackingUpdate,
          as: 'updates',
          include: [{
            model: User,
            as: 'updatedByUser',
            attributes: ['id', 'fullName']
          }],
          limit: 3
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        shipments,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getShipments:', error); // Add error logging for debugging
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching shipments', 
      error: error.message 
    });
  }
};

// Get single shipment by tracking number or ID
const getShipment = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const whereClause = isNaN(identifier) 
      ? { trackingNumber: identifier } 
      : { id: parseInt(identifier) };

    const shipment = await Shipment.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'shipmentCreator',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: TrackingUpdate,
          as: 'updates',
          include: [{
            model: User,
            as: 'updatedByUser', 
            attributes: ['id', 'fullName']
          }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!shipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shipment not found' 
      });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching shipment', 
      error: error.message 
    });
  }
};

// Update shipment details
const updateShipment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const shipment = await Shipment.findByPk(id);

    if (!shipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shipment not found' 
      });
    }

    const {
      senderName,
      senderEmail,
      senderPhone,
      senderAddress,
      receiverName,
      receiverEmail,
      receiverPhone,
      receiverAddress,
      packageDescription,
      packageName,
      numberOfPackages,
      isDangerousGood,
      unNumber,
      weight,
      dimensions,
      declaredValue,
      serviceType,
      origin,
      destination,
      mode
    } = req.body;

    // Recalculate CBM if dimensions changed
    const cbm = dimensions !== shipment.dimensions 
      ? calculateCBM(dimensions) 
      : shipment.cbm;

    await shipment.update({
      senderName,
      senderEmail,
      senderPhone,
      senderAddress,
      receiverName,
      receiverEmail,
      receiverPhone,
      receiverAddress,
      packageDescription,
      packageName,
      numberOfPackages,
      isDangerousGood,
      unNumber,
      weight: weight ? parseFloat(weight) : shipment.weight,
      dimensions,
      cbm,
      declaredValue: declaredValue ? parseFloat(declaredValue) : shipment.declaredValue,
      serviceType,
      origin,
      destination,
      mode
    });

    // Fetch updated shipment
    const updatedShipment = await Shipment.findByPk(shipment.id, {
      include: [
        {
          model: User,
          as: 'shipmentCreator',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: TrackingUpdate,
          as: 'updates',
          include: [{
            model: User,
            as: 'updatedByUser',
            attributes: ['id', 'fullName']
          }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Shipment updated successfully',
      data: updatedShipment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating shipment', 
      error: error.message 
    });
  }
};

// Add tracking update
const addTrackingUpdate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    // Add latitude and longitude here
    const { status, location, description, latitude, longitude } = req.body;

    const shipment = await Shipment.findByPk(id);
    if (!shipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shipment not found' 
      });
    }

    // Create tracking update, include latitude and longitude
    const trackingUpdate = await TrackingUpdate.create({
      shipmentId: shipment.id,
      status,
      location,
      description,
      updatedBy: req.user.id,
      latitude: latitude || null,
      longitude: longitude || null
    });

    // Update shipment status
    await shipment.update({ status });

    // Fetch the update with user info
    const createdUpdate = await TrackingUpdate.findByPk(trackingUpdate.id, {
      include: [{
        model: User,
        as: 'updatedByUser', 
        attributes: ['id', 'fullName']
      }]
    });

    // Send notification emails
    await Promise.all([
      sendShipmentNotification(shipment, 'updated', 'sender', createdUpdate),
      sendShipmentNotification(shipment, 'updated', 'receiver', createdUpdate)
    ]);

    res.status(201).json({
      success: true,
      message: 'Tracking update added successfully',
      data: createdUpdate
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error adding tracking update', 
      error: error.message 
    });
  }
};

// Public tracking (no authentication required)
const publicTrackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const shipment = await Shipment.findOne({
      where: { trackingNumber },
      attributes: [
        'id', 'trackingNumber', 'status', 'origin', 'destination',
        'packageDescription', 'weight', 'dimensions', 'cbm',
        'serviceType', 'createdAt'
      ],
      include: [{
        model: TrackingUpdate,
        as: 'updates',
        attributes: [
          'status',
          'location',
          'description',
          'createdAt',
          'latitude',     
          'longitude'    
        ],
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!shipment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tracking number not found' 
      });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error tracking shipment', 
      error: error.message 
    });
  }
};

// Get tracking statistics
const getTrackingStats = async (req, res) => {
  try {
    const totalShipments = await Shipment.count();
    const pendingShipments = await Shipment.count({ where: { status: 'pending' } });
    const inTransitShipments = await Shipment.count({ where: { status: 'in-transit' } });
    const deliveredShipments = await Shipment.count({ where: { status: 'delivered' } });

    // Calculate total CBM and weight
    const totals = await Shipment.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('cbm')), 'totalCBM'],
        [sequelize.fn('SUM', sequelize.col('weight')), 'totalWeight'],
        [sequelize.fn('AVG', sequelize.col('cbm')), 'avgCBM'],
        [sequelize.fn('AVG', sequelize.col('weight')), 'avgWeight']
      ]
    });

    const dataValues = totals && totals.dataValues ? totals.dataValues : {};

    res.json({
      success: true,
      data: {
        shipments: {
          total: totalShipments,
          pending: pendingShipments,
          inTransit: inTransitShipments,
          delivered: deliveredShipments
        },
        totals: {
          totalCBM: parseFloat(dataValues.totalCBM || 0).toFixed(4),
          totalWeight: parseFloat(dataValues.totalWeight || 0).toFixed(2),
          avgCBM: parseFloat(dataValues.avgCBM || 0).toFixed(4),
          avgWeight: parseFloat(dataValues.avgWeight || 0).toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tracking statistics',
      error: error.message
    });
  }
};

// Delete shipment
const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByPk(id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Delete all tracking updates for this shipment
    await TrackingUpdate.destroy({ where: { shipmentId: shipment.id } });

    // Delete the shipment itself
    await shipment.destroy();

    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting shipment',
      error: error.message
    });
  }
};

// Download Waybill PDF
const downloadWaybill = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByPk(id, {
      include: [{
        model: TrackingUpdate,
        as: 'updates',
        order: [['createdAt', 'DESC']]
      }]
    });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Path to your logo (adjust as needed)
    const logoPath = path.join(__dirname, '../../uploads/globeflight-logo.png');

    // Set landscape layout
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=waybill-${shipment.trackingNumber}.pdf`);
      res.send(pdfData);
    });

    // --- Header with Logo and Company Name ---
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 120 });
    }
    doc
      .fontSize(28)
      .fillColor('#86c517')
      .font('Helvetica-Bold')
      .text('GlobeFlight Worldwide Express', 0, 40, { align: 'center', characterSpacing: 1.5 });
    doc.moveDown(2);

    // --- Main Box ---
    doc
      .rect(40, 100, 755, 200)
      .stroke('#86c517');

    // --- From Section ---
    doc
      .fontSize(12)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text('From :', 50, 110);
    doc
      .font('Helvetica')
      .text(`Name      : ${shipment.senderName || ''}`, 60, 130)
      .text(`Address   : ${shipment.senderAddress || ''}`, 60, 150, { width: 300 })
      .text(`Phone     : ${shipment.senderPhone || ''}`, 60, 170);

    // --- Date ---
    doc
      .font('Helvetica')
      .text(`Date: ${new Date().toLocaleDateString()}`, 700, 110);

    // --- To Section ---
    doc
      .font('Helvetica-Bold')
      .text('To :', 50, 200);
    doc
      .font('Helvetica')
      .text(`Name      : ${shipment.receiverName || ''}`, 60, 220)
      .text(`Address   : ${shipment.receiverAddress || ''}`, 60, 240, { width: 300 })
      .text(`Phone     : ${shipment.receiverPhone || ''}`, 60, 260);

    // --- Policy Section ---
    doc
      .font('Helvetica-Bold')
      .fillColor('#86c517')
      .text('Policy:', 400, 110);
    doc
      .font('Helvetica')
      .fillColor('#000')
      .text(
        'All shipments are subject to GlobeFlight terms and conditions. Please visit our website or contact customer service for more information.',
        400, 130, { width: 300 }
      );

    // --- Package Details ---
    doc
      .font('Helvetica-Bold')
      .fillColor('#86c517')
      .text('Package Details:', 400, 180);
    doc
      .font('Helvetica')
      .fillColor('#000')
      .text(`Weight        : ${shipment.weight || '-'} kg`, 410, 200)
      .text(`Dimensions    : ${shipment.dimensions || '-'}`, 410, 215)
      .text(`Contents      : ${shipment.packageDescription || '-'}`, 410, 230)
      .text(`Value         : ${shipment.declaredValue || '-'}`, 410, 245)
      .text(`Origin        : ${shipment.origin || '-'}`, 410, 260)
      .text(`Country Origin: ${shipment.origin || '-'}`, 410, 275);

    // --- Express Service Bar ---
    doc
      .rect(40, 320, 755, 35)
      .fill('#86c517');
    doc
      .fillColor('#fff')
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Express Service', 0, 330, { align: 'center' });

    // --- Tracking Number Box ---
    doc
      .rect(40, 370, 755, 70)
      .stroke('#86c517');
    doc
      .fontSize(14)
      .fillColor('#000')
      .font('Helvetica-Bold')
      .text('Tracking Number :', 60, 390)
      .font('Helvetica')
      .fontSize(20)
      .text(shipment.trackingNumber, 220, 387);

    // --- Barcode (simple text representation) ---
    doc
      .font('Courier-Bold')
      .fontSize(20)
      .fillColor('#222')
      .text('| | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | |', 60, 420);

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate waybill PDF' });
  }
};

// Download Invoice PDF
const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByPk(id, {
      include: [{
        model: TrackingUpdate,
        as: 'updates',
        order: [['createdAt', 'DESC']]
      }]
    });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${shipment.trackingNumber}.pdf`);
      res.send(pdfData);
    });

    doc.fontSize(18).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Tracking Number: ${shipment.trackingNumber}`);
    doc.text(`Sender: ${shipment.senderName} (${shipment.senderEmail || ''})`);
    doc.text(`Receiver: ${shipment.receiverName} (${shipment.receiverEmail || ''})`);
    doc.text(`Origin: ${shipment.origin}`);
    doc.text(`Destination: ${shipment.destination}`);
    doc.text(`Service: ${shipment.serviceType}`);
    doc.text(`Weight: ${shipment.weight} kg`);
    doc.text(`Declared Value: ${shipment.declaredValue}`);
    doc.text(`Status: ${shipment.status}`);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate invoice PDF' });
  }
};

// Helper function to send shipment notifications
const sendShipmentNotification = async (shipment, type, recipient, update = null) => {
  try {
    const email = recipient === 'sender' ? shipment.senderEmail : shipment.receiverEmail;
    const name = recipient === 'sender' ? shipment.senderName : shipment.receiverName;

    if (!email) return;

    let subject, template;

    switch (type) {
      case 'created':
        subject = `Shipment Created - Tracking #${shipment.trackingNumber}`;
        template = 'shipment-created';
        break;
      case 'updated':
        subject = `Shipment Update - Tracking #${shipment.trackingNumber}`;
        template = 'shipment-updated';
        break;
      default:
        return;
    }

    const emailData = {
      to: email,
      subject,
      template,
      data: {
        name,
        shipment,
        update,
        recipient
      }
    };

    await sendEmail(emailData);
  } catch (error) {
    console.error('Error sending shipment notification:', error);
  }
};

module.exports = {
  createShipment,
  getShipments,
  getShipment,
  updateShipment,
  addTrackingUpdate,
  publicTrackShipment,
  getTrackingStats,
  deleteShipment,
  downloadWaybill,
  downloadInvoice,
};