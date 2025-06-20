# Deployment Guide - Contact Form Integration

## Overview
This guide covers the deployment of the contact form integration for Globeflight Worldwide Express. The system includes both a backend API and frontend forms that work together to handle customer inquiries.

## Backend Setup

### 1. Environment Configuration
Create a `.env` file in the root directory with the following settings:

```env
# Email Configuration
SMTP_HOST=mail.globeflight.co.ke
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=service@globeflight.co.ke
SMTP_PASS=Snzu3j@254
SENDER_NAME=Globeflight Worldwide Express
SENDER_EMAIL=service@globeflight.co.ke

# Admin Configuration
ADMIN_EMAIL=service@globeflight.co.ke
ADMIN_EMAILS=service@globeflight.co.ke,cs@globeflight.co.ke
SUPPORT_EMAIL=cs@globeflight.co.ke

# Company Information
COMPANY_NAME=Globeflight Worldwide Express
COMPANY_ADDRESS=NEXTGEN MALL, 3rd Floor, Suite 39/40, Mombasa Road, Nairobi

# URLs
FRONTEND_URL=https://globeflight.co.ke
ADMIN_URL=https://admin.globeflight.co.ke

# Database Configuration
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_secure_jwt_secret

# Super Admin Credentials
SUPER_ADMIN_EMAIL=admin@globeflight.co.ke
SUPER_ADMIN_PASSWORD=your_secure_password

# Environment
NODE_ENV=production
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Run migrations
npm run migrate

# Seed initial data (if needed)
npm run seed
```

### 4. Test Email Configuration
```bash
node scripts/testEmail.js
```

### 5. Start the Server
```bash
npm start
```

## Frontend Setup

### 1. Environment Configuration
Create environment files in the `Globeflight-Kenya` directory:

**For Development (.env.development):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_EMAIL_API_ENDPOINT=http://localhost:5000/email-api
```

**For Production (.env.production):**
```env
VITE_API_URL=https://globeflight.co.ke/api
VITE_EMAIL_API_ENDPOINT=https://globeflight.co.ke/email-api
```

### 2. Install Dependencies
```bash
cd Globeflight-Kenya
npm install
```

### 3. Build for Production
```bash
npm run build
```

## API Endpoints

### Contact Form Submission
- **POST** `/api/contacts/public` - Main contact form endpoint
- **POST** `/email-api` - Legacy endpoint for frontend compatibility

### Request Format
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "+254700000000",
  "services": ["airFreight", "seaFreight"],
  "inquiryType": "quote",
  "message": "I need a quote for shipping..."
}
```

### Response Format
```json
{
  "success": true,
  "message": "Your inquiry has been submitted successfully. We will get back to you soon.",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Quote Inquiry - airFreight, seaFreight",
    "createdAt": "2025-06-20T00:48:17.316Z"
  }
}
```

## Email Notifications

### Admin Notifications
When a contact form is submitted, emails are sent to:
- `service@globeflight.co.ke`
- `cs@globeflight.co.ke`

### Customer Auto-Reply
Customers receive an automatic confirmation email with:
- Confirmation of their inquiry
- Ticket ID for reference
- Expected response time
- Contact information

## Testing

### Test Contact Form API
```bash
curl -X POST http://localhost:5000/api/contacts/public \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobileNumber": "+254700000000",
    "services": ["airFreight"],
    "inquiryType": "quote",
    "message": "This is a test message"
  }'
```

### Test Email API
```bash
curl -X POST http://localhost:5000/email-api \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Email API Test",
    "email": "test2@example.com",
    "mobileNumber": "+254700000001",
    "services": ["seaFreight"],
    "inquiryType": "support",
    "message": "Testing the email-api endpoint"
  }'
```

## Features Implemented

### ContactForm.jsx
- ✅ Full contact form with validation
- ✅ Service selection checkboxes
- ✅ Inquiry type radio buttons
- ✅ Mobile number field
- ✅ Message textarea
- ✅ Form submission to backend API
- ✅ Success/error toast notifications
- ✅ Loading states

### Hero.jsx
- ✅ Quick contact form
- ✅ Email and message fields
- ✅ Form submission to backend API
- ✅ Success/error handling
- ✅ Toast notifications

### Backend Integration
- ✅ Contact model with all required fields
- ✅ API endpoints for form submission
- ✅ Email notifications to admin and customer service
- ✅ Auto-reply emails to customers
- ✅ Rate limiting and spam protection
- ✅ Validation and error handling
- ✅ Database storage of inquiries

## Security Features

- Rate limiting (5 minutes between submissions from same email)
- Input validation and sanitization
- CORS configuration for allowed origins
- Helmet.js security headers
- Environment variable protection

## Monitoring

### Admin Dashboard
- View all contact inquiries
- Mark as read/unread
- Reply to inquiries
- Export data to CSV
- Statistics and analytics

### Email Logs
- All emails are logged with message IDs
- Error handling and retry logic
- SMTP connection verification

## Troubleshooting

### Email Issues
1. Check SMTP configuration in `.env`
2. Verify email credentials
3. Test with `node scripts/testEmail.js`
4. Check server logs for SMTP errors

### API Issues
1. Verify server is running on correct port
2. Check CORS configuration
3. Validate request format
4. Check database connection

### Frontend Issues
1. Verify environment variables are set
2. Check API endpoint URLs
3. Validate form data format
4. Check browser console for errors

## Support

For technical support or questions about the contact form integration, please contact the development team or refer to the server logs for detailed error information. 