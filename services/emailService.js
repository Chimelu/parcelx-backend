const nodemailer = require('nodemailer');

/**
 * Email Service for Zoho SMTP
 * Handles sending emails using Zoho's SMTP servers
 */
class EmailService {   
  constructor() {
    // Zoho SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.com',
      port: 465, // Use port 587 for TLS or 465 for SSL
      secure: true, // true for 465, false for other ports
      auth: {
        user: "admin@parcelx.org", // Your Zoho email address
        pass: "Parcelx@1"    
        //  Your Zoho app-specific password
      },
      // ZOHO_EMAIL=admin@parcelx.org
// ZOHO_APP_PASSWORD=Parcelx@1
    
    });   

    // Verify connection configuration
    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Zoho SMTP connection verified successfully');
    } catch (error) {  
      console.error('❌ Zoho SMTP connection failed:', error.message);
      console.log(process.env.ZOHO_EMAIL, process.env.ZOHO_APP_PASSWORD);
      console.error('Please check your Zoho email credentials in environment variables');
    }
  }

  /**
   * Send email with subject, body, and recipient
   * @param {Object} emailData - Email data object
   * @param {string} emailData.to - Recipient email address
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.body - Email body (HTML or plain text)
   * @param {string} [emailData.from] - Sender email (optional, uses default from env)
   * @param {boolean} [emailData.isHtml] - Whether body is HTML (default: true)
   * @returns {Promise<Object>} - Result object with success status and message
   */
  async sendEmail({ to, subject, body, from, isHtml = true }) {
    try {
      // Validate required fields
      if (!to || !subject || !body) {
        throw new Error('Missing required fields: to, subject, and body are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        throw new Error('Invalid recipient email format');
      }

      // Email options
      const mailOptions = {
        from: from || process.env.ZOHO_EMAIL, // Use environment variable as default sender
        to: to,
        subject: subject,
        [isHtml ? 'html' : 'text']: body
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Email sent successfully to ${to}`);
      console.log(`📧 Message ID: ${result.messageId}`);
      
      return {
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        recipient: to
      };

    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      
      return {
        success: false,
        message: error.message,
        error: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Send order confirmation email
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - Result object
   */
  async sendOrderConfirmation(orderData) {
    const { customerEmail, trackingId, status, items } = orderData;
    
    const subject = `ParcelX Order Confirmation - Tracking ID: ${trackingId}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">📦 ParcelX Order Confirmation</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Order Details</h3>
          <p><strong>Tracking ID:</strong> ${trackingId}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Items:</strong> ${items ? items.join(', ') : 'N/A'}</p>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #1976d2;">
            <strong>📋 What's Next?</strong><br>
            Your order has been confirmed and is being processed. You will receive updates as your package moves through our delivery network.
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 14px;">
            Thank you for choosing ParcelX for your delivery needs!<br>
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: customerEmail,
      subject: subject,
      body: htmlBody,
      isHtml: true
    });
  }

  /**
   * Send status update email
   * @param {Object} updateData - Status update data
   * @returns {Promise<Object>} - Result object
   */
  async sendStatusUpdate(updateData) {
    const { customerEmail, trackingId, status, location, timestamp } = updateData;
    
    const subject = `ParcelX Status Update - ${trackingId}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">📦 ParcelX Status Update</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Update Details</h3>
          <p><strong>Tracking ID:</strong> ${trackingId}</p>
          <p><strong>New Status:</strong> <span style="color: #28a745; font-weight: bold;">${status}</span></p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
          ${timestamp ? `<p><strong>Updated:</strong> ${new Date(timestamp).toLocaleString()}</p>` : ''}
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>🔔 Keep Track:</strong><br>
            You can track your package in real-time using the tracking ID above.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: customerEmail,
      subject: subject,
      body: htmlBody,
      isHtml: true
    });
  }
}

// Create and export singleton instance
const emailService = new EmailService();
module.exports = emailService;
