const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const fetch = require('node-fetch');
const orderRoutes = require('./routes/orders');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/orders', orderRoutes);

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
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
    fetch(`${serverUrl}/api/health`)
      .then(response => {
        if (response.ok) {
          console.log(`[CRON] Server ping successful - Status: ${response.status}`);
        } else {
          console.log(`[CRON] Server ping failed - Status: ${response.status}`);
        }
      })
      .catch(error => {
        console.error(`[CRON] Server ping error:`, error.message);
      });
  }, {
    scheduled: true,
    timezone: "UTC"
  });
  
  console.log('[CRON] Keep-alive cron job started - Server will ping itself every 14 minutes');
});
