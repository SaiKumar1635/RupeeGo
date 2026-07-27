/**
 * Refund Model
 * Handles refund records and tracking
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const refundSchema = new mongoose.Schema({
  refundId: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  merchantId: String,
  
  // Refund Amount
  amount: {
    type: Number,
    required: [true, 'Refund amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    default: 'USD'
  },

  // Original Transaction Details
  originalAmount: Number,
  originalTransactionId: String,
  stripePaymentId: String,
  stripeRefundId: {
    type: String,
    unique: true,
    sparse: true
  },

  // Refund Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'rejected'],
    default: 'pending',
    index: true
  },

  // Refund Reason
  reason: {
    type: String,
    enum: [
      'requested_by_customer',
      'duplicate',
      'fraudulent',
      'product_not_received',
      'product_unacceptable',
      'general'
    ],
    required: true
  },
  reasonDescription: String,

  // Refund Details
  initiatedBy: {
    type: String,
    enum: ['customer', 'merchant', 'admin'],
    default: 'customer'
  },
  initiatedByUserId: String,

  // Refund Processing
  processingFee: {
    type: Number,
    default: 0
  },
  netRefundAmount: Number,
  processingNotes: String,
  errorCode: String,
  errorMessage: String,

  // Timeline
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,

  // Metadata
  metadata: {
    orderId: String,
    invoiceId: String,
    customNotes: String,
    tags: [String]
  },

  // Dispute Information
  disputeId: String,
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeStatus: String,

  // Audit Trail
  auditLog: [{
    timestamp: Date,
    action: String,
    changedBy: String,
    details: String
  }],

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate net refund amount
refundSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('processingFee')) {
    this.netRefundAmount = this.amount - (this.processingFee || 0);
  }
  this.updatedAt = Date.now();
  next();
});

// Create indexes
refundSchema.index({ transactionId: 1, createdAt: -1 });
refundSchema.index({ userId: 1, createdAt: -1 });
refundSchema.index({ status: 1, createdAt: -1 });
refundSchema.index({ stripeRefundId: 1 });

module.exports = mongoose.model('Refund', refundSchema);
