// server/utils/email.js
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

// Create transporter
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 465,
    secure: true, // use SSL/TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      // Required for SSL/TLS
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    }
  };

  console.log('Creating transporter with config:', {
    ...config,
    auth: {
      ...config.auth,
      pass: '********'
    }
  });

  return nodemailer.createTransport(config);
};

// Email templates
const emailTemplates = {
  // Shipment notifications
  'shipment-created': {
    subject: 'Shipment Created - Tracking #{trackingNumber}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>{{companyName}}</h1>
          <h2>Shipment Created</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{name}},</p>
          <p>Your shipment has been successfully created and assigned tracking number <strong>{{shipment.trackingNumber}}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Shipment Details:</h3>
            <p><strong>From:</strong> {{shipment.origin}}</p>
            <p><strong>To:</strong> {{shipment.destination}}</p>
            <p><strong>Service:</strong> {{shipment.serviceType}}</p>
            <p><strong>Weight:</strong> {{shipment.weight}} kg</p>
            <p><strong>CBM:</strong> {{shipment.cbm}} m³</p>
          </div>
          
          <p>You can track your shipment at any time using the link below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{frontendUrl}}/track/{{shipment.trackingNumber}}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Track Your Shipment
            </a>
          </div>
          
          <p>We will keep you updated on your shipment's progress.</p>
          <p>Best regards,<br>{{companyName}} Team</p>
        </div>
      </div>
    `
  },

  'shipment-updated': {
    subject: 'Shipment Update - Tracking #{trackingNumber}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1>{{companyName}}</h1>
          <h2>Shipment Update</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{name}},</p>
          <p>We have an update on your shipment with tracking number <strong>{{shipment.trackingNumber}}</strong>.</p>
          
          <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Latest Update:</h3>
            <p><strong>Status:</strong> {{update.status}}</p>
            {{#if update.location}}<p><strong>Location:</strong> {{update.location}}</p>{{/if}}
            <p><strong>Description:</strong> {{update.description}}</p>
            <p><strong>Updated:</strong> {{formatDate update.createdAt}}</p>
          </div>
          
          <p>Track your shipment for more details:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{frontendUrl}}/track/{{shipment.trackingNumber}}" 
               style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Full Tracking
            </a>
          </div>
          
          <p>Thank you for choosing {{companyName}}.</p>
          <p>Best regards,<br>{{companyName}} Team</p>
        </div>
      </div>
    `
  },

  // Contact form templates
  'contact-notification': {
    subject: 'New Contact Inquiry: {{contact.subject}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1>New Contact Inquiry</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Contact Details:</h2>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> {{contact.name}}</p>
            <p><strong>Email:</strong> {{contact.email}}</p>
            {{#if contact.phone}}<p><strong>Phone:</strong> {{contact.phone}}</p>{{/if}}
            <p><strong>Inquiry Type:</strong> {{inquiryType}}</p>
            {{#if services}}<p><strong>Services of Interest:</strong> {{services}}</p>{{/if}}
            <p><strong>Subject:</strong> {{contact.subject}}</p>
            <p><strong>Submitted:</strong> {{formatDate contact.createdAt}}</p>
          </div>
          
          <h3>Message:</h3>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <p>{{contact.message}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{adminUrl}}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Admin Panel
            </a>
          </div>
        </div>
      </div>
    `
  },

  'contact-auto-reply': {
    subject: 'Thank you for contacting us - We\'ve received your inquiry',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>{{companyName}}</h1>
          <h2>Thank You for Contacting Us</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{name}},</p>
          <p>Thank you for reaching out to us. This email confirms that we have received your inquiry.</p>
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Inquiry Details:</h3>
            <p><strong>Ticket ID:</strong> #{{ticketId}}</p>
            <p><strong>Subject:</strong> {{subject}}</p>
            <p><strong>Submitted:</strong> {{formatDate 'now'}}</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Your Message:</h4>
            <p>{{message}}</p>
          </div>
          
          <p>Our team will review your inquiry and get back to you within 24 hours during business days. If you have an urgent matter, please call us directly.</p>
          
          <p><strong>Contact Information:</strong></p>
          <p>Email: {{supportEmail}}<br>
          Phone: +254 729 341 277<br>
          Business Hours: Monday - Friday, 8:00 AM - 6:00 PM EAT</p>
          
          <p>Thank you for choosing {{companyName}}.</p>
          <p>Best regards,<br>Customer Support Team</p>
        </div>
      </div>
    `
  },

  'contact-reply': {
    subject: 'Re: {{originalSubject}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>{{companyName}}</h1>
          <h2>Response to Your Inquiry</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{name}},</p>
          <p>Thank you for your inquiry. Here is our response:</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            {{replyMessage}}
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <h4>Your Original Message:</h4>
            <p>{{originalMessage}}</p>
          </div>
          
          <p>If you have any further questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>{{companyName}} Team</p>
        </div>
      </div>
    `
  },

  'testimonial-request': {
    subject: 'We Value Your Feedback - Globeflight Testimonial Request',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>Globeflight Worldwide Express</h1>
          <h2>We Value Your Feedback</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear Valued Client,</p>
          <p>Thank you for choosing Globeflight Worldwide Express. We would greatly appreciate your feedback on our services.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="{{link}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Submit Your Testimonial
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="{{link}}">{{link}}</a></p>
          <p>Your feedback helps us improve and serve you better.</p>
          <p>Best regards,<br>Globeflight Worldwide Express Team</p>
        </div>
      </div>
    `
  },

  // Blog notification templates
  'new-blog-post': {
    subject: 'New Blog Post: {{blogTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">{{companyName}}</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 20px; opacity: 0.9;">New Blog Post Published</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello there! 👋</p>
          <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">We've just published a new blog post that we think you'll find interesting. Check it out below!</p>
          
          <div style="background: #f9fafb; border-radius: 12px; overflow: hidden; margin: 25px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            {{#if featuredImage}}
            <div style="height: 200px; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); background-size: cover; background-position: center; position: relative;">
              <img src="{{featuredImage}}" alt="{{blogTitle}}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            {{/if}}
            <div style="padding: 25px;">
              <h3 style="margin: 0 0 15px 0; font-size: 22px; color: #111827; line-height: 1.3;">{{blogTitle}}</h3>
              <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">{{blogDescription}}</p>
              <div style="text-align: center;">
                <a href="{{blogUrl}}" 
                   style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; transition: all 0.3s ease;">
                  Read Full Article →
                </a>
              </div>
            </div>
          </div>
          
          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #166534;">Why you're receiving this email</h4>
            <p style="margin: 0; color: #374151; font-size: 14px;">You're subscribed to our blog newsletter. You'll receive notifications about new posts, updates, and exclusive content.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0 0 15px 0; color: #374151; font-size: 14px;">Stay connected with us:</p>
            <div style="display: flex; justify-content: center; gap: 15px;">
              <a href="#" style="color: #16a34a; text-decoration: none; font-weight: 600;">Website</a>
              <a href="#" style="color: #16a34a; text-decoration: none; font-weight: 600;">LinkedIn</a>
              <a href="#" style="color: #16a34a; text-decoration: none; font-weight: 600;">Twitter</a>
            </div>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 10px 0;">Don't want to receive these emails?</p>
            <a href="{{unsubscribeUrl}}" style="color: #16a34a; text-decoration: none;">Unsubscribe</a>
            <p style="margin: 10px 0 0 0;">{{companyName}} | {{companyAddress}}</p>
          </div>
        </div>
      </div>
    `
  },

  'blog-updated': {
    subject: 'Blog Post Updated: {{blogTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">{{companyName}}</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 20px; opacity: 0.9;">Blog Post Updated</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello there! 👋</p>
          <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">We've updated one of our blog posts with new information and improvements. Here's what's new:</p>
          
          <div style="background: #f9fafb; border-radius: 12px; overflow: hidden; margin: 25px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            {{#if featuredImage}}
            <div style="height: 200px; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); background-size: cover; background-position: center; position: relative;">
              <img src="{{featuredImage}}" alt="{{blogTitle}}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            {{/if}}
            <div style="padding: 25px;">
              <div style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 15px;">
                ✨ Updated
              </div>
              <h3 style="margin: 0 0 15px 0; font-size: 22px; color: #111827; line-height: 1.3;">{{blogTitle}}</h3>
              <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">{{blogDescription}}</p>
              <div style="text-align: center;">
                <a href="{{blogUrl}}" 
                   style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; transition: all 0.3s ease;">
                  Read Updated Article →
                </a>
              </div>
            </div>
          </div>
          
          <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">What's New</h4>
            <p style="margin: 0; color: #374151; font-size: 14px;">We've enhanced this article with additional insights, updated information, and improved formatting for better readability.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <p style="margin: 0 0 15px 0; color: #374151; font-size: 14px;">Stay connected with us:</p>
            <div style="display: flex; justify-content: center; gap: 15px;">
              <a href="#" style="color: #2563eb; text-decoration: none; font-weight: 600;">Website</a>
              <a href="#" style="color: #2563eb; text-decoration: none; font-weight: 600;">LinkedIn</a>
              <a href="#" style="color: #2563eb; text-decoration: none; font-weight: 600;">Twitter</a>
            </div>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 10px 0;">Don't want to receive these emails?</p>
            <a href="{{unsubscribeUrl}}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a>
            <p style="margin: 10px 0 0 0;">{{companyName}} | {{companyAddress}}</p>
          </div>
        </div>
      </div>
    `
  },

  'newsletter-welcome': {
    subject: 'Welcome to Our Newsletter! 🎉',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">{{companyName}}</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 20px; opacity: 0.9;">Welcome to Our Newsletter!</h2>
        </div>
        <div style="padding: 30px;">
          <div style="text-align: center; margin: 20px 0;">
            <div style="width: 80px; height: 80px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <span style="font-size: 40px;">🎉</span>
            </div>
          </div>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello and welcome to our newsletter! 👋</p>
          <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">Thank you for subscribing to stay updated with our latest blog posts, industry insights, and company news.</p>
          
          <div style="background: #f0fdf4; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin: 0 0 15px 0; color: #166534;">What you'll receive:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li style="margin-bottom: 8px;">📝 New blog posts and articles</li>
              <li style="margin-bottom: 8px;">🔄 Updated content and insights</li>
              <li style="margin-bottom: 8px;">💡 Industry trends and tips</li>
              <li style="margin-bottom: 8px;">🎯 Exclusive content and offers</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{blogUrl}}" 
               style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; transition: all 0.3s ease;">
              Explore Our Blog →
            </a>
          </div>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="margin: 0 0 15px 0; color: #374151;">Quick Links</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <a href="#" style="color: #16a34a; text-decoration: none; font-weight: 600;">Latest Posts</a>
              <a href="#" style="color: #16a34a; text-decoration: none; font-weight: 600;">About Us</a>
              <a href="#" style="color: #16a34a; text-decoration: none; font-weight: 600;">Services</a>
              <a href="#" style="color: #16a34a; text-decoration: none; font-weight: 600;">Contact</a>
            </div>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <div style="text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0 0 10px 0;">Need to unsubscribe?</p>
            <a href="{{unsubscribeUrl}}" style="color: #16a34a; text-decoration: none;">Click here to unsubscribe</a>
            <p style="margin: 10px 0 0 0;">{{companyName}} | {{companyAddress}}</p>
          </div>
        </div>
      </div>
    `
  },

  // Job application templates
  'application-confirmation': {
    subject: 'Application Received - {{jobTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0891b2; color: white; padding: 20px; text-align: center;">
          <h1>{{companyName}}</h1>
          <h2>Application Received</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{applicantName}},</p>
          <p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position in our {{department}} department.</p>
          
          <div style="background: #cffafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891b2;">
            <h3>Application Details:</h3>
            <p><strong>Position:</strong> {{jobTitle}}</p>
            <p><strong>Department:</strong> {{department}}</p>
            <p><strong>Application ID:</strong> #{{applicationId}}</p>
            <p><strong>Submitted:</strong> {{formatDate 'now'}}</p>
          </div>
          
          <p>We have received your application and our hiring team will review it carefully. Here's what happens next:</p>
          
          <ol>
            <li><strong>Application Review:</strong> We'll review your resume and cover letter</li>
            <li><strong>Initial Screening:</strong> Qualified candidates will be contacted for a phone/video interview</li>
            <li><strong>Final Interview:</strong> Selected candidates will be invited for a final interview</li>
            <li><strong>Decision:</strong> We'll notify all candidates of our decision</li>
          </ol>
          
          <p>This process typically takes 2-3 weeks. We'll keep you updated on your application status.</p>
          
          <p>If you have any questions about your application or the position, please don't hesitate to contact us.</p>
          
          <p>Thank you again for your interest in {{companyName}}.</p>
          <p>Best regards,<br>Human Resources Team</p>
        </div>
      </div>
    `
  },

  'application-notification': {
    subject: 'New Job Application - {{jobTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1>New Job Application</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Application for {{jobTitle}}</h2>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Applicant Details:</h3>
            <p><strong>Name:</strong> {{applicantName}}</p>
            <p><strong>Email:</strong> {{applicantEmail}}</p>
            <p><strong>Position:</strong> {{jobTitle}}</p>
            <p><strong>Department:</strong> {{department}}</p>
            <p><strong>Application ID:</strong> #{{applicationId}}</p>
          </div>
          
          {{#if resumeUrl}}
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{resumeUrl}}" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Download Resume
            </a>
          </div>
          {{/if}}
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{adminUrl}}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Application
            </a>
          </div>
        </div>
      </div>
    `
  },

  'application-status-update': {
    subject: 'Application Update - {{jobTitle}}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>{{companyName}}</h1>
          <h2>Application Update</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{applicantName}},</p>
          <p>We have an update regarding your application for the <strong>{{jobTitle}}</strong> position.</p>
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3>Status Update:</h3>
            <p><strong>Previous Status:</strong> {{oldStatus}}</p>
            <p><strong>Current Status:</strong> {{newStatus}}</p>
            {{#if notes}}<p><strong>Notes:</strong> {{notes}}</p>{{/if}}
          </div>
          
          <p>We appreciate your patience during our review process.</p>
          
          <p>If you have any questions, please feel free to contact our HR team.</p>
          
          <p>Best regards,<br>{{companyName}} HR Team</p>
        </div>
      </div>
    `
  },

  'application-hired': {
    subject: 'Congratulations! You Have Been Hired',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #22c55e; color: white; padding: 20px; text-align: center;">
          <h1>{{companyName}}</h1>
          <h2>Congratulations, {{applicantName}}!</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{applicantName}},</p>
          <p>
            We are delighted to inform you that you have been <strong>selected for the position of {{jobTitle}}</strong> in our {{department}} department at {{companyName}}.
          </p>
          <div style="background: #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3>Next Steps:</h3>
            <ul>
              <li>Our HR team will contact you soon with your offer letter and onboarding details.</li>
              <li>Please reply to this email to confirm your acceptance.</li>
              <li>If you have any questions, feel free to reach out to us.</li>
            </ul>
          </div>
          <p>
            Welcome to the {{companyName}} family! We look forward to working with you and achieving great things together.
          </p>
          <p>
            Best regards,<br>
            HR Team<br>
            {{companyName}}
          </p>
        </div>
      </div>
    `
  },

  'staff-welcome': {
    subject: 'Welcome to the Team, {{name}}!',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>{{companyName}}</h1>
          <h2>Welcome to the Team!</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear {{name}},</p>
          <p>We are excited to welcome you to the {{companyName}} team as our new <strong>{{role}}</strong> in the <strong>{{department}}</strong> department.</p>
          <p>Your account has been created. You can now log in using your email: <strong>{{email}}</strong>.</p>
          <p>If you have any questions, feel free to reach out to your supervisor or HR.</p>
          <p>We look forward to working with you!</p>
          <p>Best regards,<br>{{companyName}} HR Team</p>
        </div>
      </div>
    `
  }
};

// Register Handlebars helpers
handlebars.registerHelper('formatDate', function(date) {
  if (date === 'now') {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Main send email function
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();
    
    let html = '';
    if (template && emailTemplates[template]) {
      const templateData = emailTemplates[template];
      const compiledTemplate = handlebars.compile(templateData.template);
      html = compiledTemplate(data);
      subject = subject || templateData.subject;
    } else {
      html = data.html || '';
    }

    const mailOptions = {
      from: {
        name: process.env.SENDER_NAME || 'Globeflight Worldwide Express',
        address: process.env.SMTP_USER
      },
      to,
      subject,
      html
    };

    console.log('Sending email with options:', {
      ...mailOptions,
      html: html.length > 100 ? html.substring(0, 100) + '...' : html
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Detailed email error:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      original: error.original
    });
    throw error;
  }
};

// Send bulk emails
const sendBulkEmail = async (recipients, { subject, template, data = {}, attachments = [] }) => {
  const results = [];
  const batchSize = 10; // Send in batches to avoid overwhelming the SMTP server

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (recipient) => {
      try {
        const result = await sendEmail({
          to: recipient.email || recipient,
          subject,
          template,
          data: { ...data, name: recipient.name || '', ...recipient },
          attachments
        });
        
        return {
          email: recipient.email || recipient,
          success: true,
          messageId: result.messageId
        };
      } catch (error) {
        return {
          email: recipient.email || recipient,
          success: false,
          error: error.message
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
};

// Test the email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    const success = await transporter.verify();
    console.log('Email configuration is valid');
    return success;
  } catch (error) {
    console.error('Email configuration error:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
};

// Verify SMTP connection on startup
const verifyTransporter = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('SMTP server is ready to take our messages');
    return true;
  } catch (error) {
    console.error('SMTP connection error:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  testEmailConfig,
  emailTemplates,
  verifyTransporter
};