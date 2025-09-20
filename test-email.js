/**
 * Test script for email functionality
 * Run with: node test-email.js
 */

const emailService = require('./services/emailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test 1: Basic email sending
  console.log('Test 1: Sending basic email...');
  const basicEmailResult = await emailService.sendEmail({
    to: process.env.TEST_EMAIL || 'test@example.com',
    subject: 'Test Email from ParcelX',
    body: '<h1>Test Email</h1><p>This is a test email from ParcelX backend service.</p>',
    isHtml: true     
  });

  console.log('Basic email result:', basicEmailResult);
  console.log('---\n');

  // Test 2: Order confirmation email
  console.log('Test 2: Sending order confirmation email...');
  const orderResult = await emailService.sendOrderConfirmation({
    customerEmail: process.env.TEST_EMAIL || 'test@example.com',
    trackingId: 'TEST123456789',
    status: 'Confirmed',
    items: ['Test Package 1', 'Test Package 2']
  });

  console.log('Order confirmation result:', orderResult);
  console.log('---\n');

  // Test 3: Status update email
  console.log('Test 3: Sending status update email...');
  const statusResult = await emailService.sendStatusUpdate({
    customerEmail: process.env.TEST_EMAIL || 'test@example.com',
    trackingId: 'TEST123456789',
    status: 'In Transit',
    location: 'Test Location, NY',
    timestamp: new Date().toISOString()
  });

  console.log('Status update result:', statusResult);
  console.log('---\n');

  console.log('✅ Email service testing completed!');
  console.log('\n📋 Setup Instructions:');
  console.log('1. Set ZOHO_EMAIL and ZOHO_APP_PASSWORD in your environment variables');
  console.log('2. Set TEST_EMAIL to your test email address');
  console.log('3. Run: node test-email.js');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEmailService().catch(console.error);
}

module.exports = testEmailService;
