const express = require('express');
const emailService = require('../services/emailService');
const router = express.Router();

/**
 * POST /api/emails/send
 * Send a custom email with subject, body, and recipient
 * 
 * Request Body:
 * {
 *   "to": "recipient@example.com",
 *   "subject": "Email Subject",
 *   "body": "Email body content (HTML or plain text)",
 *   "isHtml": true (optional, default: true)
 * }
 */
router.post('/send', async (req, res) => {
  try {
    const { to, subject, body, isHtml = true } = req.body;

    // Validate required fields
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, and body are required',
        required: ['to', 'subject', 'body']
      });
    }

    // Send email
    const result = await emailService.sendEmail({
      to,
      subject,
      body,
      isHtml
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: result.recipient,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.message,
        code: result.error
      });
    }

  } catch (error) {
    console.error('Email API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * POST /api/emails/order-confirmation
 * Send order confirmation email
 * 
 * Request Body:
 * {
 *   "customerEmail": "customer@example.com",
 *   "trackingId": "PKG123456789",
 *   "status": "Confirmed",
 *   "items": ["Item 1", "Item 2"]
 * }
 */
router.post('/order-confirmation', async (req, res) => {
  try {
    const { customerEmail, trackingId, status, items } = req.body;

    // Validate required fields
    if (!customerEmail || !trackingId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerEmail, trackingId, and status are required',
        required: ['customerEmail', 'trackingId', 'status']
      });
    }

    // Send order confirmation email
    const result = await emailService.sendOrderConfirmation({
      customerEmail,
      trackingId,
      status,
      items
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Order confirmation email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: result.recipient,
          trackingId: trackingId,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send order confirmation email',
        error: result.message,
        code: result.error
      });
    }

  } catch (error) {
    console.error('Order confirmation email API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * POST /api/emails/status-update
 * Send status update email
 * 
 * Request Body:
 * {
 *   "customerEmail": "customer@example.com",
 *   "trackingId": "PKG123456789",
 *   "status": "In Transit",
 *   "location": "New York, NY",
 *   "timestamp": "2024-01-15T10:30:00Z"
 * }
 */
router.post('/status-update', async (req, res) => {
  try {
    const { customerEmail, trackingId, status, location, timestamp } = req.body;

    // Validate required fields
    if (!customerEmail || !trackingId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerEmail, trackingId, and status are required',
        required: ['customerEmail', 'trackingId', 'status']
      });
    }

    // Send status update email
    const result = await emailService.sendStatusUpdate({
      customerEmail,
      trackingId,
      status,
      location,
      timestamp
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Status update email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: result.recipient,
          trackingId: trackingId,
          status: status,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send status update email',
        error: result.message,
        code: result.error
      });
    }

  } catch (error) {
    console.error('Status update email API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/emails/test
 * Test email service connectivity
 */
router.get('/test', async (req, res) => {
  try {
    // Test email service by sending a test email to a specified address
    const testEmail = req.query.to || process.env.TEST_EMAIL;
    
    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address required. Provide ?to=email@example.com or set TEST_EMAIL environment variable'
      });
    }

    const result = await emailService.sendEmail({
      to: testEmail,
      subject: 'ParcelX Email Service Test',
      body: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2c3e50;">🧪 Email Service Test</h2>
          <p>This is a test email from ParcelX backend service.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Status:</strong> Email service is working correctly! ✅</p>
        </div>
      `,
      isHtml: true
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          messageId: result.messageId,
          recipient: result.recipient,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Test email failed',
        error: result.message,
        code: result.error
      });
    }

  } catch (error) {
    console.error('Email test API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
