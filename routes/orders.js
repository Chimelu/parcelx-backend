const express = require('express');
const Order = require('../models/Order');
const emailService = require('../services/emailService');

const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'shipping.from': { $regex: search, $options: 'i' } },
        { 'shipping.to': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// Get order by tracking ID (Public endpoint)
router.get('/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    const order = await Order.findOne({ 
      trackingId: trackingId.toUpperCase() 
    });

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found with this tracking ID' 
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order by tracking ID error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// Get single order by ID (trackingId or MongoDB ObjectId)
router.get('/:id', async (req, res) => {
  try {
    let order;
    
    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(req.params.id);
    } else {
      // Otherwise, treat it as a trackingId
      order = await Order.findOne({ trackingId: req.params.id.toUpperCase() });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      shipping,
      package: packageInfo,
      timeline = []
    } = req.body;

    // Validate required fields
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return res.status(400).json({ 
        message: 'Customer information is required' 
      });
    }

    if (!shipping?.from || !shipping?.to || !shipping?.expectedDelivery) {
      return res.status(400).json({ 
        message: 'Shipping information is required' 
      });
    }

    if (!packageInfo?.weight || !packageInfo?.dimensions || !packageInfo?.value) {
      return res.status(400).json({ 
        message: 'Package information is required' 
      });
    }

    // Create initial timeline if not provided
    const initialTimeline = timeline.length > 0 ? timeline : [{
      status: 'Order Placed',
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      location: shipping.from,
      completed: true
    }];

    const order = new Order({
      customer,
      shipping,
      package: packageInfo,
      timeline: initialTimeline
    });

    await order.save();

    // Send order confirmation email to customer
    try {
      const emailResult = await emailService.sendOrderConfirmation({
        customerEmail: customer.email,
        trackingId: order.trackingId,
        status: 'Order Created',
        items: [`Package from ${shipping.from} to ${shipping.to}`]
      });

      console.log(`📧 Order confirmation email sent to ${customer.email}:`, emailResult.success ? 'Success' : 'Failed');
      
      // Add email status to response
      if (!emailResult.success) {
        console.warn(`⚠️ Email failed for order ${order.trackingId}:`, emailResult.message);
      }
    } catch (emailError) {
      console.error(`❌ Email error for order ${order.trackingId}:`, emailError.message);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
      emailSent: true
    });
  } catch (error) {
    console.error('Create order error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Order with this tracking ID already exists' });
    } else {
      res.status(500).json({ message: 'Server error while creating order' });
    }
  }
});

// Update order (trackingId or MongoDB ObjectId)
router.put('/:id', async (req, res) => {
  try {
    const {
      customer,
      shipping,
      package: packageInfo,
      timeline
    } = req.body;

    let order;
    
    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(req.params.id);
    } else {
      // Otherwise, treat it as a trackingId
      order = await Order.findOne({ trackingId: req.params.id.toUpperCase() });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Store previous timeline to detect status changes
    const previousTimeline = order.timeline;
    
    // Update fields if provided
    if (customer) order.customer = { ...order.customer, ...customer };
    if (shipping) order.shipping = { ...order.shipping, ...shipping };
    if (packageInfo) order.package = { ...order.package, ...packageInfo };
    if (timeline) order.timeline = timeline;

    order.updatedAt = new Date();
    await order.save();

    // Check if timeline was updated and send status update email
    if (timeline && timeline.length > 0) {
      const latestStatus = timeline[timeline.length - 1];
      const hasNewStatus = previousTimeline.length !== timeline.length || 
                          previousTimeline[previousTimeline.length - 1]?.status !== latestStatus.status;

      if (hasNewStatus && latestStatus.status) {
        try {
          const emailResult = await emailService.sendStatusUpdate({
            customerEmail: order.customer.email,
            trackingId: order.trackingId,
            status: latestStatus.status,
            location: latestStatus.location || order.shipping.to,
            timestamp: latestStatus.date || new Date().toISOString()
          });

          console.log(`📧 Status update email sent to ${order.customer.email}:`, emailResult.success ? 'Success' : 'Failed');
          
          if (!emailResult.success) {
            console.warn(`⚠️ Status update email failed for order ${order.trackingId}:`, emailResult.message);
          }
        } catch (emailError) {
          console.error(`❌ Status update email error for order ${order.trackingId}:`, emailError.message);
          // Don't fail the order update if email fails
        }
      }
    }

    res.json({
      message: 'Order updated successfully',
      order,
      statusUpdateEmailSent: timeline ? true : false
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error while updating order' });
  }
});

// Update order timeline (trackingId or MongoDB ObjectId)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, location, notes, date } = req.body;

    let order;
    
    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(req.params.id);
    } else {
      // Otherwise, treat it as a trackingId
      order = await Order.findOne({ trackingId: req.params.id.toUpperCase() });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add new timeline entry
    const newTimelineEntry = {
      status: status,
      date: date ? new Date(date) : new Date(),
      time: new Date().toLocaleTimeString(),
      location: location || order.shipping.to,
      completed: status === 'Delivered'
    };

    if (notes) {
      newTimelineEntry.notes = notes;
    }

    order.timeline.push(newTimelineEntry);
    order.updatedAt = new Date();

    await order.save();

    res.json({
      message: 'Timeline updated successfully',
      order
    });
  } catch (error) {
    console.error('Update timeline error:', error);
    res.status(500).json({ message: 'Server error while updating timeline' });
  }
});

// Delete order (trackingId or MongoDB ObjectId)
router.delete('/:id', async (req, res) => {
  try {
    let order;
    
    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(req.params.id);
    } else {
      // Otherwise, treat it as a trackingId
      order = await Order.findOne({ trackingId: req.params.id.toUpperCase() });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(order._id);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error while deleting order' });
  }
});

// Get order statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('trackingId customer.name timeline createdAt');

    // Get timeline-based statistics
    const timelineStats = await Order.aggregate([
      { $unwind: '$timeline' },
      {
        $group: {
          _id: '$timeline.status',
          count: { $sum: 1 }
        }
      }
    ]);

    const timelineCounts = timelineStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      totalOrders,
      timelineCounts,
      recentOrders
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;
