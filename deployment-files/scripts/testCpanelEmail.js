require('dotenv').config();
const { sendEmail } = require('../server/utils/email');

const testEmail = async () => {
  console.log('Testing cPanel email configuration with these settings:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', 465);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_SECURE:', true);

  try {
    await sendEmail({
      to: process.env.SMTP_USER, // Send to yourself as a test
      subject: 'Test Email from Globeflight System',
      data: {
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Test Email</h2>
            <p>This is a test email to verify the cPanel SMTP configuration.</p>
            <p>If you receive this, the email system is working correctly.</p>
            <p>Time sent: ${new Date().toLocaleString()}</p>
          </div>
        `
      }
    });
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Email test failed:', error);
    process.exit(1);
  }
};

testEmail(); 