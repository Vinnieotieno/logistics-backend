// server/controllers/dashboardController.js
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { 
  User, 
  Service, 
  Blog, 
  BlogCategory,
  BlogComment,
  BlogLike,
  Shipment, 
  TrackingUpdate,
  Contact, 
  Job, 
  JobApplication, 
  Testimonial,
  NewsletterSubscription
} = require('../models');

// Get dashboard statistics with enhanced data
const getDashboardStats = async (req, res) => {
  try {
    // Get current date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Basic counts
    const [
      totalUsers,
      activeUsers,
      totalServices,
      publishedServices,
      totalBlogs,
      publishedBlogs,
      featuredBlogs,
      totalShipments,
      activeShipments,
      deliveredShipments,
      totalContacts,
      unreadContacts,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      publishedTestimonials,
      totalTestimonials,
      totalSubscribers,
      activeSubscribers
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      Service.count(),
      Service.count({ where: { isPublished: true } }),
      Blog.count(),
      Blog.count({ where: { isPublished: true } }),
      Blog.count({ where: { isPublished: true, isFeatured: true } }),
      Shipment.count(),
      Shipment.count({ where: { status: { [Op.in]: ['pending', 'collected', 'in-transit'] } } }),
      Shipment.count({ where: { status: 'delivered' } }),
      Contact.count(),
      Contact.count({ where: { isRead: false } }),
      Job.count(),
      Job.count({ where: { isPublished: true, isClosed: false } }),
      JobApplication.count(),
      JobApplication.count({ where: { status: 'pending' } }),
      Testimonial.count({ where: { isPublished: true } }),
      Testimonial.count(),
      NewsletterSubscription.count(),
      NewsletterSubscription.count({ where: { isActive: true } })
    ]);

    // Recent activity counts (last 30 days)
    const [
      recentShipments,
      recentContacts,
      recentApplications,
      recentBlogs,
      recentUsers,
      recentComments
    ] = await Promise.all([
      Shipment.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Contact.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      JobApplication.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Blog.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      BlogComment.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } })
    ]);

    // Weekly trends
    const weeklyShipments = await Shipment.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // Revenue/financial data
    const financialData = await Shipment.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('declared_value')), 'totalValue'],
        [sequelize.fn('AVG', sequelize.col('declared_value')), 'avgValue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalShipments']
      ],
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
        declaredValue: { [Op.gt]: 0 }
      }
    });

    // Top performing content
    const topBlogs = await Blog.findAll({
      where: { isPublished: true },
      order: [['viewsCount', 'DESC'], ['likesCount', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'slug', 'viewsCount', 'likesCount', 'readTime', 'createdAt'],
      include: [{
        model: BlogCategory,
        as: 'category',
        attributes: ['name', 'slug']
      }]
    });

    // Most engaged users
    const activeShippers = await Shipment.findAll({
      attributes: [
        'created_by',
        [sequelize.fn('COUNT', sequelize.col('Shipment.id')), 'shipmentCount']
      ],
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
      group: ['created_by', 'shipmentCreator.id', 'shipmentCreator.full_name'],
      order: [[sequelize.fn('COUNT', sequelize.col('Shipment.id')), 'DESC']],
      limit: 5,
      include: [{
        model: User,
        as: 'shipmentCreator',
        attributes: ['id', 'fullName']
      }]
    });

    // Shipment status distribution
    const shipmentStatusDistribution = await Shipment.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status'],
      order: [[sequelize.fn('COUNT', sequelize.col('status')), 'DESC']]
    });

    // Blog engagement stats
    const blogEngagement = await Blog.findOne({
      where: { isPublished: true },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('views_count')), 'totalViews'],
        [sequelize.fn('SUM', sequelize.col('likes_count')), 'totalLikes'],
        [sequelize.fn('AVG', sequelize.col('read_time')), 'avgReadTime']
      ]
    });

    // Popular services
    const popularServices = await Service.findAll({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'slug', 'createdAt']
    });

    // Growth percentages (compare with last month)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const [lastMonthShipments, lastMonthContacts, lastMonthBlogs] = await Promise.all([
      Shipment.count({ 
        where: { 
          createdAt: { 
            [Op.gte]: lastMonthStart, 
            [Op.lte]: lastMonthEnd 
          } 
        } 
      }),
      Contact.count({ 
        where: { 
          createdAt: { 
            [Op.gte]: lastMonthStart, 
            [Op.lte]: lastMonthEnd 
          } 
        } 
      }),
      Blog.count({ 
        where: { 
          createdAt: { 
            [Op.gte]: lastMonthStart, 
            [Op.lte]: lastMonthEnd 
          } 
        } 
      })
    ]);

    const [currentMonthShipments, currentMonthContacts, currentMonthBlogs] = await Promise.all([
      Shipment.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Contact.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
      Blog.count({ where: { createdAt: { [Op.gte]: startOfMonth } } })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          users: { 
            total: totalUsers,
            active: activeUsers,
            new: recentUsers
          },
          services: { 
            total: totalServices, 
            published: publishedServices 
          },
          blogs: { 
            total: totalBlogs, 
            published: publishedBlogs,
            featured: featuredBlogs 
          },
          shipments: { 
            total: totalShipments, 
            active: activeShipments,
            delivered: deliveredShipments 
          },
          contacts: { 
            total: totalContacts, 
            unread: unreadContacts 
          },
          jobs: { 
            total: totalJobs, 
            active: activeJobs 
          },
          applications: { 
            total: totalApplications,
            pending: pendingApplications 
          },
          testimonials: { 
            published: publishedTestimonials,
            total: totalTestimonials 
          },
          subscribers: {
            total: totalSubscribers,
            active: activeSubscribers
          }
        },
        recentActivity: {
          shipments: recentShipments,
          contacts: recentContacts,
          applications: recentApplications,
          blogs: recentBlogs,
          users: recentUsers,
          comments: recentComments
        },
        trends: {
          weeklyShipments: weeklyShipments.map(item => ({
            date: item.dataValues.date,
            count: parseInt(item.dataValues.count)
          }))
        },
        financial: {
          totalValue: parseFloat(financialData?.dataValues?.totalValue || 0),
          avgValue: parseFloat(financialData?.dataValues?.avgValue || 0),
          shipmentsWithValue: parseInt(financialData?.dataValues?.totalShipments || 0)
        },
        topContent: {
          blogs: topBlogs.map(blog => ({
            id: blog.id,
            title: blog.title,
            slug: blog.slug,
            viewsCount: blog.viewsCount,
            likesCount: blog.likesCount,
            readTime: blog.readTime,
            category: blog.category,
            createdAt: blog.createdAt
          })),
          services: popularServices
        },
        distributions: {
          shipmentStatus: shipmentStatusDistribution.map(item => ({
            status: item.status,
            count: parseInt(item.dataValues.count)
          }))
        },
        engagement: {
          blog: {
            totalViews: parseInt(blogEngagement?.dataValues?.totalViews || 0),
            totalLikes: parseInt(blogEngagement?.dataValues?.totalLikes || 0),
            avgReadTime: parseFloat(blogEngagement?.dataValues?.avgReadTime || 0)
          }
        },
        activeUsers: {
          topShippers: activeShippers.map(item => ({
            user: item.shipmentCreator,
            shipmentCount: parseInt(item.dataValues.shipmentCount)
          }))
        },
        growth: {
          shipments: {
            current: currentMonthShipments,
            previous: lastMonthShipments,
            percentage: lastMonthShipments > 0 
              ? ((currentMonthShipments - lastMonthShipments) / lastMonthShipments * 100).toFixed(1)
              : 0
          },
          contacts: {
            current: currentMonthContacts,
            previous: lastMonthContacts,
            percentage: lastMonthContacts > 0 
              ? ((currentMonthContacts - lastMonthContacts) / lastMonthContacts * 100).toFixed(1)
              : 0
          },
          blogs: {
            current: currentMonthBlogs,
            previous: lastMonthBlogs,
            percentage: lastMonthBlogs > 0 
              ? ((currentMonthBlogs - lastMonthBlogs) / lastMonthBlogs * 100).toFixed(1)
              : 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard statistics', 
      error: error.message 
    });
  }
};

// Get recent activity with enhanced details
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20, type = 'all' } = req.query;
    const parsedLimit = parseInt(limit);

    // Build where clause for type filter
    const whereClause = {};
    if (type !== 'all') {
      // Type-specific filtering will be handled per model
    }

    // Get recent activities from different modules
    const [
      recentShipments, 
      recentContacts, 
      recentApplications, 
      recentBlogs,
      recentComments,
      recentTrackingUpdates
    ] = await Promise.all([
      type === 'all' || type === 'shipment' ? Shipment.findAll({
        order: [['createdAt', 'DESC']],
        limit: type === 'shipment' ? parsedLimit : Math.ceil(parsedLimit / 6),
        attributes: ['id', 'trackingNumber', 'senderName', 'receiverName', 'status', 'origin', 'destination', 'createdAt'],
        include: [{
          model: User,
          as: 'shipmentCreator',
          attributes: ['fullName']
        }]
      }) : [],
      type === 'all' || type === 'contact' ? Contact.findAll({
        order: [['createdAt', 'DESC']],
        limit: type === 'contact' ? parsedLimit : Math.ceil(parsedLimit / 6),
        attributes: ['id', 'name', 'email', 'subject', 'isRead', 'createdAt']
      }) : [],
      type === 'all' || type === 'application' ? JobApplication.findAll({
        order: [['createdAt', 'DESC']],
        limit: type === 'application' ? parsedLimit : Math.ceil(parsedLimit / 6),
        attributes: ['id', 'name', 'email', 'status', 'createdAt'],
        include: [{
          model: Job,
          as: 'job',
          attributes: ['title', 'department', 'location']
        }]
      }) : [],
      type === 'all' || type === 'blog' ? Blog.findAll({
        order: [['createdAt', 'DESC']],
        limit: type === 'blog' ? parsedLimit : Math.ceil(parsedLimit / 6),
        attributes: ['id', 'title', 'slug', 'isPublished', 'isFeatured', 'viewsCount', 'likesCount', 'createdAt'],
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['fullName']
          },
          {
            model: BlogCategory,
            as: 'category',
            attributes: ['name']
          }
        ]
      }) : [],
      type === 'all' || type === 'comment' ? BlogComment.findAll({
        order: [['createdAt', 'DESC']],
        limit: type === 'comment' ? parsedLimit : Math.ceil(parsedLimit / 6),
        attributes: ['id', 'name', 'email', 'comment', 'isApproved', 'createdAt'],
        include: [{
          model: Blog,
          as: 'blog',
          attributes: ['title', 'slug']
        }]
      }) : [],
      type === 'all' || type === 'tracking' ? TrackingUpdate.findAll({
        order: [['createdAt', 'DESC']],
        limit: type === 'tracking' ? parsedLimit : Math.ceil(parsedLimit / 6),
        attributes: ['id', 'status', 'location', 'description', 'createdAt'],
        include: [
          {
            model: Shipment,
            as: 'shipment',
            attributes: ['trackingNumber']
          },
          {
            model: User,
            as: 'updatedByUser',
            attributes: ['fullName']
          }
        ]
      }) : []
    ]);

    // Combine and format activities
    const activities = [
      ...recentShipments.map(item => ({
        type: 'shipment',
        id: item.id,
        title: `New shipment created`,
        description: `${item.senderName} → ${item.receiverName} (${item.origin} to ${item.destination})`,
        metadata: {
          trackingNumber: item.trackingNumber,
          status: item.status,
          creator: item.shipmentCreator?.fullName,
          route: `${item.origin} → ${item.destination}`
        },
        createdAt: item.createdAt
      })),
      ...recentContacts.map(item => ({
        type: 'contact',
        id: item.id,
        title: `New contact inquiry`,
        description: item.subject || 'General inquiry',
        metadata: {
          name: item.name,
          email: item.email,
          isRead: item.isRead
        },
        createdAt: item.createdAt
      })),
      ...recentApplications.map(item => ({
        type: 'application',
        id: item.id,
        title: `New job application`,
        description: `${item.name} applied for ${item.job?.title}`,
        metadata: {
          applicant: item.name,
          email: item.email,
          status: item.status,
          jobTitle: item.job?.title,
          department: item.job?.department,
          location: item.job?.location
        },
        createdAt: item.createdAt
      })),
      ...recentBlogs.map(item => ({
        type: 'blog',
        id: item.id,
        title: `Blog post ${item.isPublished ? 'published' : 'created'}`,
        description: item.title,
        metadata: {
          author: item.author?.fullName,
          category: item.category?.name,
          views: item.viewsCount,
          likes: item.likesCount,
          isPublished: item.isPublished,
          isFeatured: item.isFeatured,
          slug: item.slug
        },
        createdAt: item.createdAt
      })),
      ...recentComments.map(item => ({
        type: 'comment',
        id: item.id,
        title: `New comment ${item.isApproved ? 'approved' : 'pending'}`,
        description: `${item.name} commented on "${item.blog?.title}"`,
        metadata: {
          commenter: item.name,
          email: item.email,
          blogTitle: item.blog?.title,
          blogSlug: item.blog?.slug,
          isApproved: item.isApproved,
          excerpt: item.comment.substring(0, 100) + (item.comment.length > 100 ? '...' : '')
        },
        createdAt: item.createdAt
      })),
      ...recentTrackingUpdates.map(item => ({
        type: 'tracking',
        id: item.id,
        title: `Tracking update`,
        description: `${item.shipment?.trackingNumber}: ${item.status}`,
        metadata: {
          trackingNumber: item.shipment?.trackingNumber,
          status: item.status,
          location: item.location,
          description: item.description,
          updatedBy: item.updatedByUser?.fullName
        },
        createdAt: item.createdAt
      }))
    ];

    // Sort by creation date and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const limitedActivities = activities.slice(0, parsedLimit);

    res.json({
      success: true,
      data: limitedActivities,
      meta: {
        total: activities.length,
        limit: parsedLimit,
        type: type
      }
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recent activity', 
      error: error.message 
    });
  }
};

// Get analytics data with more detailed insights
const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    let dateFrom = new Date();
    let groupByFormat = '%Y-%m-%d'; // Default daily grouping
    
    switch (period) {
      case '7d':
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case '30d':
        dateFrom.setDate(dateFrom.getDate() - 30);
        break;
      case '90d':
        dateFrom.setDate(dateFrom.getDate() - 90);
        groupByFormat = '%Y-%u'; // Weekly grouping for 90 days
        break;
      case '1y':
        dateFrom.setFullYear(dateFrom.getFullYear() - 1);
        groupByFormat = '%Y-%m'; // Monthly grouping for 1 year
        break;
      default:
        dateFrom.setDate(dateFrom.getDate() - 30);
    }

    // Shipments analytics
    const shipmentAnalytics = await Shipment.findAll({
      where: { createdAt: { [Op.gte]: dateFrom } },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'shipments'],
        [sequelize.fn('SUM', sequelize.col('declared_value')), 'totalValue'],
        [sequelize.fn('AVG', sequelize.col('weight')), 'avgWeight'],
        [sequelize.fn('SUM', sequelize.col('cbm')), 'totalCBM'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('created_by'))), 'uniqueUsers']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // Contact analytics
    const contactAnalytics = await Contact.findAll({
      where: { createdAt: { [Op.gte]: dateFrom } },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'contacts'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN is_read = true THEN 1 END')), 'read'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN is_read = false THEN 1 END')), 'unread']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // Blog analytics
    const blogAnalytics = await Blog.findAll({
      where: { 
        createdAt: { [Op.gte]: dateFrom },
        isPublished: true 
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'blogs'],
        [sequelize.fn('SUM', sequelize.col('views_count')), 'totalViews'],
        [sequelize.fn('SUM', sequelize.col('likes_count')), 'totalLikes'],
        [sequelize.fn('AVG', sequelize.col('read_time')), 'avgReadTime']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // User activity analytics
    const userAnalytics = await User.findAll({
      where: { createdAt: { [Op.gte]: dateFrom } },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'newUsers'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN is_active = true THEN 1 END')), 'activeUsers']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // Job application analytics
    const applicationAnalytics = await JobApplication.findAll({
      where: { createdAt: { [Op.gte]: dateFrom } },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'applications'],
        'status'
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at')), 'status'],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // Service performance (engagement metrics if available)
    const servicePerformance = await Service.findAll({
      where: { isPublished: true },
      attributes: ['id', 'title', 'slug', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Category performance
    const categoryPerformance = await BlogCategory.findAll({
      attributes: [
        'id',
        'name',
        'slug',
        [sequelize.fn('COUNT', sequelize.col('blogs.id')), 'blogCount'],
        [sequelize.fn('SUM', sequelize.col('blogs.views_count')), 'totalViews'],
        [sequelize.fn('SUM', sequelize.col('blogs.likes_count')), 'totalLikes']
      ],
      include: [{
        model: Blog,
        as: 'blogs',
        attributes: [],
        where: { isPublished: true },
        required: false
      }],
      group: ['BlogCategory.id', 'BlogCategory.name', 'BlogCategory.slug'],
      order: [[sequelize.fn('COUNT', sequelize.col('blogs.id')), 'DESC']]
    });

    // Geographic distribution (if location data is available)
    const geographicData = await Shipment.findAll({
      where: { createdAt: { [Op.gte]: dateFrom } },
      attributes: [
        'destination',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['destination'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          from: dateFrom,
          to: new Date()
        },
        analytics: {
          shipments: shipmentAnalytics.map(item => ({
            date: item.dataValues.date,
            shipments: parseInt(item.dataValues.shipments),
            totalValue: parseFloat(item.dataValues.totalValue || 0),
            avgWeight: parseFloat(item.dataValues.avgWeight || 0),
            totalCBM: parseFloat(item.dataValues.totalCBM || 0),
            uniqueUsers: parseInt(item.dataValues.uniqueUsers || 0)
          })),
          contacts: contactAnalytics.map(item => ({
            date: item.dataValues.date,
            contacts: parseInt(item.dataValues.contacts),
            read: parseInt(item.dataValues.read || 0),
            unread: parseInt(item.dataValues.unread || 0)
          })),
          blogs: blogAnalytics.map(item => ({
            date: item.dataValues.date,
            blogs: parseInt(item.dataValues.blogs),
            totalViews: parseInt(item.dataValues.totalViews || 0),
            totalLikes: parseInt(item.dataValues.totalLikes || 0),
            avgReadTime: parseFloat(item.dataValues.avgReadTime || 0)
          })),
          users: userAnalytics.map(item => ({
            date: item.dataValues.date,
            newUsers: parseInt(item.dataValues.newUsers),
            activeUsers: parseInt(item.dataValues.activeUsers || 0)
          })),
          applications: applicationAnalytics.reduce((acc, item) => {
            const date = item.dataValues.date;
            if (!acc[date]) {
              acc[date] = { date, total: 0, pending: 0, approved: 0, rejected: 0 };
            }
            acc[date].total += parseInt(item.dataValues.applications);
            acc[date][item.status] = parseInt(item.dataValues.applications);
            return acc;
          }, {})
        },
        performance: {
          services: servicePerformance,
          categories: categoryPerformance.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            blogCount: parseInt(cat.dataValues.blogCount || 0),
            totalViews: parseInt(cat.dataValues.totalViews || 0),
            totalLikes: parseInt(cat.dataValues.totalLikes || 0)
          }))
        },
        geographic: {
          topDestinations: geographicData.map(item => ({
            destination: item.destination,
            count: parseInt(item.dataValues.count)
          }))
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
};

// Get real-time notifications/alerts
const getNotifications = async (req, res) => {
  try {
    const notifications = [];

    // Check for unread contacts
    const unreadContacts = await Contact.count({ where: { isRead: false } });
    if (unreadContacts > 0) {
      notifications.push({
        type: 'info',
        title: 'Unread Contacts',
        message: `You have ${unreadContacts} unread contact inquiries`,
        link: '/admin/contacts',
        priority: 'medium'
      });
    }

    // Check for pending job applications
    const pendingApplications = await JobApplication.count({ where: { status: 'pending' } });
    if (pendingApplications > 0) {
      notifications.push({
        type: 'warning',
        title: 'Pending Applications',
        message: `${pendingApplications} job applications awaiting review`,
        link: '/admin/applications',
        priority: 'high'
      });
    }

    // Check for draft blogs older than 7 days
    const oldDrafts = await Blog.count({
      where: {
        isPublished: false,
        createdAt: { [Op.lte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });
    if (oldDrafts > 0) {
      notifications.push({
        type: 'info',
        title: 'Draft Blogs',
        message: `${oldDrafts} draft blogs older than 7 days`,
        link: '/admin/blogs',
        priority: 'low'
      });
    }

    // Check for inactive users
    const inactiveUsers = await User.count({
      where: {
        isActive: false,
        role: { [Op.ne]: 'superadmin' }
      }
    });
    if (inactiveUsers > 0) {
      notifications.push({
        type: 'warning',
        title: 'Inactive Users',
        message: `${inactiveUsers} users are currently inactive`,
        link: '/admin/users',
        priority: 'medium'
      });
    }

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notifications', 
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getAnalytics,
  getNotifications
};