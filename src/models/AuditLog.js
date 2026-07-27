/**
 * Audit Log Model
 * Tracks all sensitive operations for compliance
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const auditLogSchema = new mongoose.Schema({
  auditId: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },

  // User Information
  userId: {
    type: String,
    index: true
  },
  userRole: String,

  // Action Details
  action: {
    type: String,
    enum: [
      'payment_created',
      'payment_verified',
      'payment_failed',
      'refund_created',
      'refund_processed',
      'user_login',
      'user_logout',
      'user_registered',
      'merchant_approved',
      'merchant_rejected',
      'account_updated',
      'api_key_generated',
      'api_key_revoked',
      'webhook_delivered',
      'webhook_failed',
      'dispute_created',
      'dispute_resolved'
    ],
    required: true,
    index: true
  },

  // Resource Information
  resourceType: {
    type: String,
    enum: ['user', 'transaction', 'refund', 'merchant', 'payment', 'webhook', 'dispute'],
    index: true
  },
  resourceId: {
    type: String,
    index: true
  },

  // Changes
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },

  // Request Information
  ipAddress: String,
  userAgent: String,
  requestMethod: String,
  requestPath: String,
  statusCode: Number,

  // Result
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String,

  // Metadata
  metadata: {
    transactionId: String,
    paymentAmount: Number,
    paymentCurrency: String,
    deviceId: String,
    sessionId: String
  },

  // Compliance
  requiresReview: {
    type: Boolean,
    default: false
  },
  reviewedBy: String,
  reviewedAt: Date,
  reviewNotes: String,

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create indexes for compliance queries
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ success: 1, createdAt: -1 });
auditLogSchema.index({ requiresReview: 1, createdAt: -1 });

// TTL index for compliance retention (7 years)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 220752000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
