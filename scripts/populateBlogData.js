const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'globeflight_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password'
});

async function populateBlogData() {
  try {
    console.log('Starting to populate blog data...');

    // Insert blog categories
    const categories = [
      { name: 'Logistics & Supply Chain', slug: 'logistics-supply-chain', description: 'Articles about logistics, supply chain management, and industry insights' },
      { name: 'Shipping & Freight', slug: 'shipping-freight', description: 'Information about shipping services, freight forwarding, and international trade' },
      { name: 'Customs & Compliance', slug: 'customs-compliance', description: 'Guidance on customs procedures, compliance requirements, and regulatory updates' },
      { name: 'Industry News', slug: 'industry-news', description: 'Latest news and updates from the logistics and transportation industry' },
      { name: 'Company Updates', slug: 'company-updates', description: 'News and announcements from Globeflight Worldwide Express' },
      { name: 'Tips & Guides', slug: 'tips-guides', description: 'Helpful tips and guides for shipping and logistics' }
    ];

    for (const category of categories) {
      await pool.query(
        'INSERT INTO blog_categories (name, slug, description, is_active) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING',
        [category.name, category.slug, category.description, true]
      );
    }
    console.log('Blog categories inserted successfully');

    // Get the first category ID for blog posts
    const categoryResult = await pool.query('SELECT id FROM blog_categories WHERE slug = $1', ['logistics-supply-chain']);
    const categoryId = categoryResult.rows[0]?.id || 1;

    // Insert sample blog posts
    const blogPosts = [
      {
        title: 'The Future of Logistics: Digital Transformation in Supply Chain Management',
        slug: 'future-of-logistics-digital-transformation',
        shortDescription: 'Discover how digital technologies are revolutionizing the logistics industry and transforming supply chain management for better efficiency and customer satisfaction.',
        content: '<h2>The Digital Revolution in Logistics</h2><p>The logistics industry is undergoing a massive digital transformation that is reshaping how goods are transported, tracked, and delivered worldwide.</p>',
        featuredImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
        categoryId: categoryId,
        readTime: 8,
        isPublished: true,
        isFeatured: true,
        tags: ['logistics', 'digital transformation', 'supply chain', 'technology']
      },
      {
        title: 'Essential Guide to International Shipping Documentation',
        slug: 'essential-guide-international-shipping-documentation',
        shortDescription: 'Master the essential documents required for international shipping and learn how to avoid common pitfalls that can delay your shipments.',
        content: '<h2>Understanding International Shipping Documentation</h2><p>International shipping requires careful attention to documentation to ensure smooth customs clearance and timely delivery.</p>',
        featuredImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2111&q=80',
        categoryId: categoryId,
        readTime: 10,
        isPublished: true,
        isFeatured: false,
        tags: ['shipping', 'documentation', 'international trade', 'customs']
      },
      {
        title: 'Customs Clearance: A Complete Guide for Importers and Exporters',
        slug: 'customs-clearance-complete-guide-importers-exporters',
        shortDescription: 'Navigate the complex world of customs clearance with our comprehensive guide covering procedures, requirements, and best practices for smooth operations.',
        content: '<h2>Understanding Customs Clearance</h2><p>Customs clearance is the process of getting permission from customs authorities to import or export goods.</p>',
        featuredImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        categoryId: categoryId,
        readTime: 12,
        isPublished: true,
        isFeatured: false,
        tags: ['customs', 'clearance', 'import', 'export', 'compliance']
      }
    ];

    for (const post of blogPosts) {
      await pool.query(
        `INSERT INTO blogs (title, slug, short_description, content, featured_image, author_id, category_id, read_time, is_published, is_featured, meta_title, meta_description, tags, published_at, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
         ON CONFLICT (slug) DO NOTHING`,
        [
          post.title,
          post.slug,
          post.shortDescription,
          post.content,
          post.featuredImage,
          1, // author_id (assuming user ID 1 exists)
          post.categoryId,
          post.readTime,
          post.isPublished,
          post.isFeatured,
          post.title,
          post.shortDescription,
          post.tags,
          post.isPublished ? new Date() : null,
          new Date(),
          new Date()
        ]
      );
    }
    console.log('Blog posts inserted successfully');

    // Insert sample comments
    const comments = [
      { blogId: 1, name: 'John Smith', email: 'john.smith@email.com', comment: 'Great article! The insights about AI in logistics are spot on.' },
      { blogId: 1, name: 'Sarah Johnson', email: 'sarah.j@company.com', comment: 'Very informative piece. I especially liked the section about blockchain technology.' },
      { blogId: 2, name: 'Mike Chen', email: 'mike.chen@logistics.com', comment: 'This guide saved me hours of research. The documentation checklist is comprehensive.' }
    ];

    for (const comment of comments) {
      await pool.query(
        'INSERT INTO blog_comments (blog_id, name, email, comment, is_approved, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [comment.blogId, comment.name, comment.email, comment.comment, true, new Date()]
      );
    }
    console.log('Blog comments inserted successfully');

    // Insert sample newsletter subscriptions
    const subscriptions = [
      'john.doe@example.com',
      'jane.smith@company.com',
      'mike.wilson@business.com',
      'sarah.jones@email.com'
    ];

    for (const email of subscriptions) {
      await pool.query(
        'INSERT INTO newsletter_subscriptions (email, is_active, subscribed_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
        [email, true, new Date()]
      );
    }
    console.log('Newsletter subscriptions inserted successfully');

    console.log('Database population completed successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await pool.end();
  }
}

populateBlogData(); 