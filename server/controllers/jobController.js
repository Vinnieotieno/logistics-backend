const { Job, JobApplication, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op, sequelize, col, fn } = require('sequelize');
const slugify = require('slugify');
const { sendEmail } = require('../utils/email');

// Get all jobs with filtering and pagination (admin)
const getJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      department, 
      jobType, 
      location,
      published, 
      closed, // <-- add closed param
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { requirements: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filter by department
    if (department) {
      whereClause.department = { [Op.iLike]: `%${department}%` };
    }
    
    // Filter by job type
    if (jobType) {
      whereClause.jobType = jobType;
    }
    
    // Filter by location
    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }
    
    // Filter by published status
    if (published !== undefined) {
      whereClause.isPublished = published === 'true';
    }

    // Filter by closed status
    if (closed !== undefined) {
      if (closed === 'true') {
        whereClause.isClosed = true;
      } else if (closed === 'false') {
        whereClause.isClosed = false;
      }
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'jobCreator', // changed from 'creator'
        attributes: ['id', 'fullName', 'email']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Defensive: ensure jobCreator is present
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await JobApplication.count({
          where: { jobId: job.id }
        });
        const recentApplications = await JobApplication.findAll({
          where: { jobId: job.id },
          order: [['createdAt', 'DESC']],
          limit: 3,
          attributes: ['id', 'name', 'email', 'status', 'createdAt']
        });
        const jobObj = job.toJSON();
        if (!jobObj.jobCreator) {
          jobObj.jobCreator = { id: null, fullName: '', email: '' };
        }
        return {
          ...jobObj,
          applicationCount,
          recentApplications
        };
      })
    );

    res.json({
      success: true,
      data: {
        jobs: jobsWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching jobs', 
      error: error.message 
    });
  }
};

// Get all published jobs (public)
const getPublicJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      department, 
      jobType, 
      location,
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    
    let whereClause = { isPublished: true, isClosed: false };

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { requirements: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filter by department
    if (department) {
      whereClause.department = { [Op.iLike]: `%${department}%` };
    }
    
    // Filter by job type
    if (jobType) {
      whereClause.jobType = jobType;
    }
    
    // Filter by location
    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Filter out jobs past deadline
    const now = new Date();
    const filteredJobs = jobs.filter(job =>
      !job.applicationDeadline || new Date(job.applicationDeadline) >= now
    );

    res.json({
      success: true,
      data: {
        jobs: filteredJobs,
        pagination: {
          total: filteredJobs.length,
          page: parseInt(page),
          pages: Math.ceil(filteredJobs.length / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching public jobs', 
      error: error.message 
    });
  }
};

// Get single job by ID or slug (admin)
const getJob = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const whereClause = isNaN(identifier) 
      ? { slug: identifier } 
      : { id: parseInt(identifier) };

    const job = await Job.findOne({
      where: whereClause,
      include: [{
        model: User,
        as: 'jobCreator', // changed from 'creator'
        attributes: ['id', 'fullName', 'email']
      }]
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    // Get application statistics for this job
    const applicationStats = await JobApplication.findAll({
      where: { jobId: job.id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    const applications = await JobApplication.findAll({
      where: { jobId: job.id },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'email', 'status', 'createdAt']
    });

    res.json({
      success: true,
      data: {
        ...job.toJSON(),
        applicationStats: applicationStats.map(stat => ({
          status: stat.status,
          count: parseInt(stat.dataValues.count)
        })),
        recentApplications: applications
      }
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching job', 
      error: error.message 
    });
  }
};

// Get single published job by ID or slug (public)
const getPublicJob = async (req, res) => {
  try {
    const { identifier } = req.params;
    const whereClause = isNaN(identifier)
      ? { slug: identifier, isPublished: true, isClosed: false }
      : { id: parseInt(identifier), isPublished: true, isClosed: false };

    const job = await Job.findOne({
      where: whereClause
    });

    // Check deadline
    if (!job || (job.applicationDeadline && new Date(job.applicationDeadline) < new Date())) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching public job', 
      error: error.message 
    });
  }
};

// Create new job
const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const {
      title,
      department,
      location,
      jobType,
      description,
      requirements,
      responsibilities,
      applicationDeadline,
      isPublished,
      isClosed // <-- allow isClosed from req.body, but default to false
    } = req.body;

    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });

    // Check if slug already exists
    const existingJob = await Job.findOne({ where: { slug } });
    if (existingJob) {
      return res.status(400).json({ 
        success: false, 
        message: 'A job with this title already exists' 
      });
    }

    const allowedJobTypes = ['full-time', 'part-time', 'contract', 'internship'];
    let jobTypeValue = allowedJobTypes.includes(jobType) ? jobType : null;

    const job = await Job.create({
      title,
      slug,
      department,
      location,
      jobType: jobTypeValue,
      description,
      requirements,
      responsibilities,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      isPublished: isPublished || false,
      isClosed: typeof isClosed === 'boolean' ? isClosed : false,
      createdBy: req.user.id
    });

    // Fetch the created job with creator info
    const createdJob = await Job.findByPk(job.id, {
      include: [{
        model: User,
        as: 'jobCreator', // changed from 'creator'
        attributes: ['id', 'fullName', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: createdJob
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating job', 
      error: error.message 
    });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    const {
      title,
      department,
      location,
      jobType,
      description,
      requirements,
      responsibilities,
      applicationDeadline,
      isPublished
    } = req.body;

    // Generate new slug if title changed
    let slug = job.slug;
    if (title !== job.title) {
      slug = slugify(title, { lower: true, strict: true });
      
      // Check if new slug already exists
      const existingJob = await Job.findOne({ 
        where: { 
          slug, 
          id: { [Op.ne]: id } 
        } 
      });
      
      if (existingJob) {
        return res.status(400).json({ 
          success: false, 
          message: 'A job with this title already exists' 
        });
      }
    }

    const allowedJobTypes = ['full-time', 'part-time', 'contract', 'internship'];
    let jobTypeValue = allowedJobTypes.includes(jobType) ? jobType : job.jobType;

    await job.update({
      title,
      slug,
      department,
      location,
      jobType: jobTypeValue,
      description,
      requirements,
      responsibilities,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      isPublished: isPublished !== undefined ? isPublished : job.isPublished
    });

    // Fetch updated job with creator info
    const updatedJob = await Job.findByPk(job.id, {
      include: [{
        model: User,
        as: 'jobCreator', // changed from 'creator'
        attributes: ['id', 'fullName', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating job', 
      error: error.message 
    });
  }
};

// Toggle job published status
const togglePublished = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    await job.update({
      isPublished: !job.isPublished
    });

    res.json({
      success: true,
      message: `Job ${job.isPublished ? 'published' : 'unpublished'} successfully`,
      data: { isPublished: job.isPublished }
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error toggling job status', 
      error: error.message 
    });
  }
};

// Close job (admin)
const closeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.update({ isClosed: true });

    res.json({
      success: true,
      message: 'Job closed successfully',
      data: { id: job.id, isClosed: true }
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing job',
      error: error.message
    });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    await job.destroy();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting job', 
      error: error.message 
    });
  }
};

// Apply to job (public endpoint)
const applyToJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return the first validation error message for clarity
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0]?.msg || 'Invalid input',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, email, phone, coverLetter, portfolioUrl } = req.body;

    const job = await Job.findByPk(id);
    if (!job || !job.isPublished || job.isClosed) {
      return res.status(400).json({ 
        success: false, 
        message: 'The application period has been closed.' 
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({ 
        success: false, 
        message: 'The application period has been closed.' 
      });
    }

    // Check if user has already applied
    const existingApplication = await JobApplication.findOne({
      where: { jobId: job.id, email }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied for this position' 
      });
    }

    // Handle resume upload (ensure Multer is configured as .single('resume'))
    let resumeUrl = null;
    if (req.file) {
      // Serve resume from /uploads, ensure uploads is statically served in app.js
      resumeUrl = `${process.env.API_URL?.replace(/\/$/, '') || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    const application = await JobApplication.create({
      jobId: job.id,
      name,
      email,
      phone,
      coverLetter,
      resumeUrl,
      portfolioUrl,
      status: 'pending'
    });

    // Send confirmation email to applicant
    await sendApplicationConfirmation(application, job);

    // Send notification email to HR/admin
    await sendApplicationNotification(application, job);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. We will review your application and get back to you soon.',
      data: {
        id: application.id,
        jobTitle: job.title,
        status: application.status,
        submittedAt: application.createdAt
      }
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting application', 
      error: error.message 
    });
  }
};

// Get job applications with filtering
const getApplications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      jobId, 
      status, 
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
        { coverLetter: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filter by job
    if (jobId) {
      whereClause.jobId = jobId;
    }
    
    // Filter by status
    if (status) {
      whereClause.status = status;
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

    const { count, rows: applications } = await JobApplication.findAndCountAll({
      where: whereClause,
      include: [{
        model: Job,
        as: 'job',
        attributes: ['id', 'title', 'department', 'location', 'jobType']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'coverLetter',
        'resumeUrl',
        'portfolioUrl',
        'status',
        'createdAt'
      ]
    });

    // Ensure resumeUrl is a full URL and not null/empty
    const apiUrl = process.env.API_URL?.replace(/\/$/, '') || 'http://localhost:5000';
    const appsWithResumeUrl = applications.map(app => {
      let resumeUrl = app.resumeUrl;
      if (resumeUrl && !resumeUrl.startsWith('http')) {
        // Only append if not already a full URL
        resumeUrl = `${apiUrl}/uploads/${resumeUrl.replace(/^.*[\\/]/, '')}`;
      }
      return { ...app.toJSON(), resumeUrl: resumeUrl || null };
    });

    res.json({
      success: true,
      data: {
        applications: appsWithResumeUrl,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applications', 
      error: error.message 
    });
  }
};

// Update application status and schedule interview
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, interviewDateTime } = req.body;

    const application = await JobApplication.findByPk(id, {
      include: [{
        model: Job,
        as: 'job',
        attributes: ['title', 'department']
      }]
    });

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    const oldStatus = application.status;
    await application.update({ status, notes });

    // Send status update email if status changed
    if (oldStatus !== status) {
      // Send interview invitation if status is "interview"
      if (status === "interview") {
        await sendInterviewInvitation(application, application.job, interviewDateTime);
      } else {
        await sendApplicationStatusUpdate(application, oldStatus, status);
      }
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating application status', 
      error: error.message 
    });
  }
};

// Schedule interview for all pending/shortlisted applications for a job
const scheduleInterviewForJob = async (req, res) => {
  try {
    const { id } = req.params; // job id
    const { interviewDateTime, notes } = req.body;

    // Find all pending/shortlisted applications for this job
    const applications = await JobApplication.findAll({
      where: {
        jobId: id,
        status: { [Op.in]: ['pending', 'shortlisted'] }
      },
      include: [{
        model: Job,
        as: 'job'
      }]
    });

    if (!applications.length) {
      return res.status(404).json({
        success: false,
        message: 'No pending or shortlisted applications found for this job.'
      });
    }

    // Update status and send emails
    await Promise.all(applications.map(async (application) => {
      await application.update({ status: 'interview', notes });
      await sendInterviewInvitation(application, application.job, interviewDateTime);
    }));

    res.json({
      success: true,
      message: `Interview invitations sent to ${applications.length} applicants.`,
      updated: applications.length
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling interview',
      error: error.message
    });
  }
};

// Bulk update application statuses
const bulkUpdateApplicationStatus = async (req, res) => {
  try {
    const { applicationIds, status, notes } = req.body;
    if (!Array.isArray(applicationIds) || !status) {
      return res.status(400).json({ success: false, message: 'applicationIds (array) and status are required.' });
    }

    // Only update applications that are currently pending or shortlisted
    const updated = await JobApplication.update(
      { status, notes },
      {
        where: {
          id: { [Op.in]: applicationIds },
          status: { [Op.in]: ['pending', 'shortlisted'] }
        }
      }
    );

    res.json({
      success: true,
      message: `Updated ${updated[0]} applications to status "${status}".`
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application statuses',
      error: error.message
    });
  }
};

// Get job statistics
const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.count();
    const publishedJobs = await Job.count({ where: { isPublished: true } });
    const draftJobs = await Job.count({ where: { isPublished: false } });
    
    const totalApplications = await JobApplication.count();
    const pendingApplications = await JobApplication.count({ 
      where: { status: 'pending' } 
    });
    const hiredApplications = await JobApplication.count({ 
      where: { status: 'hired' } 
    });

    // Applications by department (fix: group by both job.department and job.id)
    const applicationsByDepartment = await JobApplication.findAll({
      include: [{
        model: Job,
        as: 'job',
        attributes: ['id', 'department']
      }],
      attributes: [
        'jobId',
        [col('job.department'), 'department'], // <-- use col here
        [fn('COUNT', col('JobApplication.id')), 'count'] // <-- use fn, col here
      ],
      group: ['jobId', 'job.id', 'job.department'],
      order: [[fn('COUNT', col('JobApplication.id')), 'DESC']]
    });

    // Recent application trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applicationTrend = await JobApplication.findAll({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']]
    });

    res.json({
      success: true,
      data: {
        jobs: {
          total: totalJobs || 0,
          published: publishedJobs || 0,
          drafts: draftJobs || 0
        },
        applications: {
          total: totalApplications || 0,
          pending: pendingApplications || 0,
          hired: hiredApplications || 0,
          hireRate: totalApplications > 0 ? ((hiredApplications / totalApplications) * 100).toFixed(1) : 0
        },
        departmentStats: (applicationsByDepartment || []).map(item => ({
          department: item.get('department') || item.job?.department || 'Unknown',
          count: parseInt(item.get('count')) || 0
        })),
        applicationTrend: (applicationTrend || []).map(item => ({
          date: item.dataValues.date,
          count: parseInt(item.dataValues.count) || 0
        }))
      }
    });
  } catch (error) {
    console.error('JobController Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching job statistics', 
      error: error.message 
    });
  }
};

// Helper functions for email notifications
const sendApplicationConfirmation = async (application, job) => {
  try {
    await sendEmail({
      to: application.email,
      subject: `Application Received - ${job.title}`,
      template: 'application-confirmation',
      data: {
        applicantName: application.name,
        jobTitle: job.title,
        department: job.department,
        applicationId: application.id,
        companyName: process.env.COMPANY_NAME || 'Globeflight Worldwide Express'
      }
    });
  } catch (error) {
    console.error('Error sending application confirmation:', error);
  }
};

const sendApplicationNotification = async (application, job) => {
  try {
    const hrEmails = process.env.HR_EMAILS 
      ? process.env.HR_EMAILS.split(',') 
      : [process.env.ADMIN_EMAIL];

    const emailPromises = hrEmails.map(hrEmail => 
      sendEmail({
        to: hrEmail.trim(),
        subject: `New Job Application - ${job.title}`,
        template: 'application-notification',
        data: {
          applicantName: application.name,
          applicantEmail: application.email,
          jobTitle: job.title,
          department: job.department,
          applicationId: application.id,
          adminUrl: `${process.env.ADMIN_URL}/jobs/applications/${application.id}`,
          resumeUrl: application.resumeUrl
        }
      })
    );

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error sending application notification:', error);
  }
};

const sendApplicationStatusUpdate = async (application, oldStatus, newStatus) => {
  try {
    let subject = `Application Update - ${application.job.title}`;
    let template = 'application-status-update';

    // Customize email based on status
    if (newStatus === 'hired') {
      subject = 'Congratulations! You Have Been Hired';
      template = 'application-hired';
    } else if (newStatus === 'rejected') {
      subject = 'Application Status Update';
      template = 'application-rejected';
    }

    await sendEmail({
      to: application.email,
      subject: subject,
      template: template,
      data: {
        applicantName: application.name,
        jobTitle: application.job.title,
        department: application.job.department,
        oldStatus: oldStatus,
        newStatus: newStatus,
        notes: application.notes,
        companyName: process.env.COMPANY_NAME || 'Globeflight Worldwide Express'
      }
    });
  } catch (error) {
    console.error('Error sending application status update:', error);
  }
};

// Helper: send interview invitation with date/time
const sendInterviewInvitation = async (application, job, interviewDateTime) => {
  try {
    // Format date/time for email
    let dateStr = interviewDateTime
      ? new Date(interviewDateTime).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '[Please await further communication for your interview date]';

    await sendEmail({
      to: application.email,
      subject: `Interview Invitation - ${job.title}`,
      template: null,
      data: {},
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1>Globeflight Worldwide Express</h1>
            <h2>Interview Invitation</h2>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${application.name},</p>
            <p>We are pleased to invite you for an interview for the <strong>${job.title}</strong> position.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Interview Details:</h3>
              <p><strong>Date & Time:</strong> ${dateStr}</p>
              <p><strong>Location:</strong> Globeflight Worldwide Express, Nairobi, Nextgen Mall, Suite 39/40</p>
              <p><strong>Department:</strong> ${job.department}</p>
            </div>
            <p>Please bring your original documents and arrive at least 10 minutes before your scheduled time.</p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br>HR Team<br>Globeflight Worldwide Express</p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending interview invitation:', error);
  }
};

module.exports = {
  getJobs,
  getPublicJobs,
  getJob,
  getPublicJob,
  createJob,
  updateJob,
  togglePublished,
  deleteJob,
  applyToJob,
  getApplications,
  updateApplicationStatus,
  scheduleInterviewForJob,
  bulkUpdateApplicationStatus,
  getJobStats,
  closeJob,
};