const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const https = require('https');
const http = require('http');
const orderRoutes = require('./routes/orders');
const emailRoutes = require('./routes/emails');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/emails', emailRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'ParcelX Backend API is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB (optional for email service)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parcelx', {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');   
})
.catch((error) => {
  console.warn('⚠️ MongoDB connection failed - Email service will still work:', error.message);
  console.log('💡 To fix: Start MongoDB or use MongoDB Atlas cloud database');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ParcelX Backend server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Start cron job to keep server awake (every 14 minutes)
  // Render sleeps after 15 minutes of inactivity
  cron.schedule('*/14 * * * *', () => {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    console.log(`[CRON] Pinging server to keep it awake: ${serverUrl}/api/health`);
    
    // Self-ping to keep the server active
    const url = new URL(`${serverUrl}/api/health`);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    };

    const request = (url.protocol === 'https:' ? https : http).request(options, (response) => {
      if (response.statusCode === 200) {
        console.log(`[CRON] Server ping successful - Status: ${response.statusCode}`);
      } else {
        console.log(`[CRON] Server ping failed - Status: ${response.statusCode}`);
      }
    });

    request.on('error', (error) => {
      console.error(`[CRON] Server ping error:`, error.message);
    });

    request.on('timeout', () => {
      console.error(`[CRON] Server ping timeout`);
      request.destroy();
    });

    request.end();
  }, {
    scheduled: true,
    timezone: "UTC"
  });
  
  console.log('[CRON] Keep-alive cron job started - Server will ping itself every 14 minutes');
});
