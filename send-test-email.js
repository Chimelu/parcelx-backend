// Test script to send email to ezeoguinechimelu@gmail.com
const emailService = require('./services/emailService');

// Set environment variables
process.env.ZOHO_EMAIL = 'admin@parcelx.org';
process.env.ZOHO_APP_PASSWORD = 'Parcelx@1';

async function sendTestEmail() {
  console.log('📧 Sending test email to ezeoguinechimelu@gmail.com...');
  
  try {
    const result = await emailService.sendEmail({
      to: 'ezeoguinechimelu@gmail.com',
      subject: 'Test Email from ParcelX API',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">🎉 Hello from ParcelX!</h1>
          <p>This is a test email sent from the ParcelX backend API.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, the email service is working correctly! ✅</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent from ParcelX Backend API using Zoho SMTP
          </p>
        </div>
      `,
      isHtml: true
    });
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Recipient:', result.recipient);
    } else {
      console.log('❌ Email failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

sendTestEmail();
