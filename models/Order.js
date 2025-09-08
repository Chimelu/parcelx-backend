const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    // required: true,
    unique: true,
    uppercase: true
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  shipping: {
    from: {
      type: String,
      required: true,
      trim: true
    },
    to: {
      type: String,
      required: true,
      trim: true
    },
    expectedDelivery: {
      type: Date,
      required: true
    }
  },
  package: {
    type: {
      type: String,
      required: true,
      enum: ['Electronics', 'Clothing', 'Documents', 'Fragile', 'Other'],
      default: 'Other'
    },
    weight: {
      type: String,
      required: true,
      trim: true
    },
    dimensions: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    },
    specialInstructions: {
      type: String,
      trim: true,
      default: ''
    }
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true  
    },
    location: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    proofOfDelivery: {
      type: {
        type: String,
        enum: ['image', 'signature', 'text']
      },
      url: String,
      alt: String,
      content: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate tracking ID if not provided
orderSchema.pre('save', function(next) {
  if (!this.trackingId) {
    this.trackingId = 'PX' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
orderSchema.index({ trackingId: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
