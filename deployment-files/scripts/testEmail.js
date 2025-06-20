require('dotenv').config();
const { sendEmail } = require('../server/utils/email');

const testEmail = async () => {
  try {
    console.log('Testing email configuration with:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'not set');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 465);

    await sendEmail({
      to: process.env.SMTP_USER, // Send to yourself
      template: 'testimonial-request',
      data: {
        link: 'http://example.com/test'
      }
    });

    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    console.error('Detailed error:', JSON.stringify(error, null, 2));
  }
};

testEmail(); 