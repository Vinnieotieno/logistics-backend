require('dotenv').config();
const nodemailer = require('nodemailer');

const verifyEmailConfig = async () => {
  try {
    console.log('Testing email configuration with:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'not set');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 465);

    // Create a test account using ethereal.email
    console.log('\nTrying to verify SMTP connection...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      debug: true
    });

    // Verify connection configuration
    const verification = await transporter.verify();
    console.log('\n✅ SMTP connection verified successfully!');
    return verification;
  } catch (error) {
    console.error('\n❌ SMTP connection failed:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      original: error.original
    });
    throw error;
  }
};

verifyEmailConfig()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 