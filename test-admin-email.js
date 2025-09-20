// Test script to simulate admin creating an order and sending emails
const emailService = require('./services/emailService');

// Set environment variables for email service
process.env.ZOHO_EMAIL = 'admin@parcelx.org';
process.env.ZOHO_APP_PASSWORD = 'Parcelx@1';

async function testAdminOrderCreation() {
  console.log('🧪 Testing Admin Order Creation with Email Integration...\n');

  // Simulate creating an order (this would normally be done via POST /api/orders)
  const orderData = {
    customer: {
      name: 'John Doe',
      email: 'ezeoguinechimelu@gmail.com',
      phone: '+1234567890',
      address: '123 Main St, City, Country'
    },
    shipping: {
      from: 'New York, NY',
      to: 'Los Angeles, CA',
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    package: {
      weight: 2.5,
      dimensions: '10x8x6 inches',
      value: 150.00,
      description: 'Electronics Package'
    }
  };

  // Generate a tracking ID
  const trackingId = 'PKG' + Math.random().toString(36).substr(2, 9).toUpperCase();

  console.log('📦 Creating order with tracking ID:', trackingId);
  console.log('📧 Customer email:', orderData.customer.email);

  // Test 1: Send order confirmation email
  console.log('\n1️⃣ Sending order confirmation email...');
  const confirmationResult = await emailService.sendOrderConfirmation({
    customerEmail: orderData.customer.email,
    trackingId: trackingId,
    status: 'Order Created',
    items: [`Package from ${orderData.shipping.from} to ${orderData.shipping.to}`]
  });

  if (confirmationResult.success) {
    console.log('✅ Order confirmation email sent successfully!');
    console.log('📧 Message ID:', confirmationResult.messageId);
  } else {
    console.log('❌ Order confirmation email failed:', confirmationResult.message);
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Send status update email
  console.log('\n2️⃣ Sending status update email...');
  const statusUpdateResult = await emailService.sendStatusUpdate({
    customerEmail: orderData.customer.email,
    trackingId: trackingId,
    status: 'In Transit',
    location: 'Chicago, IL',
    timestamp: new Date().toISOString()
  });

  if (statusUpdateResult.success) {
    console.log('✅ Status update email sent successfully!');
    console.log('📧 Message ID:', statusUpdateResult.messageId);
  } else {
    console.log('❌ Status update email failed:', statusUpdateResult.message);
  }

  console.log('\n🎉 Admin email integration test completed!');
  console.log('\n📋 What happened:');
  console.log('1. Admin created a new order');
  console.log('2. System automatically sent order confirmation email to customer');
  console.log('3. System sent status update email when order status changed');
  console.log('\n💡 In your admin panel, this will happen automatically when:');
  console.log('- Creating new orders via POST /api/orders');
  console.log('- Updating order status via PUT /api/orders/:id');
}

// Run the test
testAdminOrderCreation().catch(console.error);
