// Email Configuration for Globeflight
// Copy these settings to your .env file

module.exports = {
  // Email Configuration
  SMTP_HOST: 'mail.globeflight.co.ke',
  SMTP_PORT: 465,
  SMTP_SECURE: true,
  SMTP_USER: 'service@globeflight.co.ke',
  SMTP_PASS: 'Snzu3j@254',
  SENDER_NAME: 'Globeflight Worldwide Express',
  SENDER_EMAIL: 'service@globeflight.co.ke',

  // Admin Configuration
  ADMIN_EMAIL: 'service@globeflight.co.ke',
  ADMIN_EMAILS: 'service@globeflight.co.ke,cs@globeflight.co.ke',
  SUPPORT_EMAIL: 'cs@globeflight.co.ke',

  // Company Information
  COMPANY_NAME: 'Globeflight Worldwide Express',
  COMPANY_ADDRESS: 'NEXTGEN MALL, 3rd Floor, Suite 39/40, Mombasa Road, Nairobi',

  // URLs
  FRONTEND_URL: 'https://globeflight.co.ke',
  ADMIN_URL: 'https://admin.globeflight.co.ke',

  // Environment
  NODE_ENV: 'production'
};

/*
To use these settings, create a .env file in the root directory with the following content:

SMTP_HOST=mail.globeflight.co.ke
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=service@globeflight.co.ke
SMTP_PASS=Snzu3j@254
SENDER_NAME=Globeflight Worldwide Express
SENDER_EMAIL=service@globeflight.co.ke
ADMIN_EMAIL=service@globeflight.co.ke
ADMIN_EMAILS=service@globeflight.co.ke,cs@globeflight.co.ke
SUPPORT_EMAIL=cs@globeflight.co.ke
COMPANY_NAME=Globeflight Worldwide Express
COMPANY_ADDRESS=NEXTGEN MALL, 3rd Floor, Suite 39/40, Mombasa Road, Nairobi
FRONTEND_URL=https://globeflight.co.ke
ADMIN_URL=https://admin.globeflight.co.ke
NODE_ENV=production
*/ 