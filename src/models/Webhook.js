/**
 * Webhook Model
 * Tracks webhook events and their delivery status
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const webhookSchema = new mongoose.Schema({
  webhookId: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  
  // Webhook Registration
  userId: {
    type: String,
    index: true
  },
  merchantId: String,
  url: {
    type: String,
    required: [true, 'Webhook URL is required']
  },
  events: [{
    type: String,
    enum: [
      'payment.success',
      'payment.failed',
      'refund.initiated',
      'refund.completed',
      'refund.failed',
      'dispute.created',
      'dispute.resolved',
      'transaction.updated'
    ]
  }],

  // Webhook Delivery
  isActive: {
    type: Boolean,
    default: true
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },

  // Delivery Attempts
  deliveryAttempts: [{
    timestamp: Date,
    statusCode: Number,
    response: String,
    error: String
  }],
  totalAttempts: {
    type: Number,
    default: 0
  },
  successfulAttempts: {
    type: Number,
    default: 0
  },
  failedAttempts: {
    type: Number,
    default: 0
  },

  // Webhook Payload
  event: {
    type: String,
    required: true
  },
  eventId: String,
  payload: mongoose.Schema.Types.Mixed,
  signature: String,

  // Event Reference
  referenceType: {
    type: String,
    enum: ['transaction', 'refund', 'dispute', 'payment']
  },
  referenceId: String,

  // Retry Information
  nextRetryAt: Date,
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 5
  },
  retryInterval: {
    type: Number,
    default: 300000 // 5 minutes
  },

  // Response Information
  lastResponse: {
    statusCode: Number,
    headers: mongoose.Schema.Types.Mixed,
    body: String
  },
  lastError: String,

  // Audit
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  sentAt: Date
});

// Update timestamp
webhookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
webhookSchema.index({ userId: 1, createdAt: -1 });
webhookSchema.index({ event: 1, createdAt: -1 });
webhookSchema.index({ deliveryStatus: 1, nextRetryAt: 1 });
webhookSchema.index({ referenceId: 1 });

module.exports = mongoose.model('Webhook', webhookSchema);
