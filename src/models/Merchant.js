/**
 * Merchant Model
 * Handles merchant account information
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const merchantSchema = new mongoose.Schema({
  merchantId: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required']
  },
  businessType: {
    type: String,
    enum: ['sole_proprietor', 'partnership', 'corporation', 'llc', 'nonprofit'],
    required: true
  },
  businessEmail: String,
  businessPhone: String,
  website: String,
  
  // Business Address
  businessAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Bank Account Information
  bankAccount: {
    accountHolderName: String,
    accountNumber: String,
    routingNumber: String,
    bankName: String,
    accountType: {
      type: String,
      enum: ['checking', 'savings']
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },

  // Tax Information
  taxId: String,
  taxIdType: {
    type: String,
    enum: ['ein', 'ssn', 'itin']
  },

  // KYC Information
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending',
    index: true
  },
  kycDocument: {
    type: String,
    documentType: String,
    uploadedAt: Date,
    verifiedAt: Date
  },

  // Stripe Account
  stripeAccountId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeOnboardingCompleted: {
    type: Boolean,
    default: false
  },

  // Settlement Details
  settlementSchedule: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  nextSettlementDate: Date,
  minimumSettlementAmount: {
    type: Number,
    default: 100
  },

  // Transaction Settings
  transactionFeePercentage: {
    type: Number,
    default: 2.9
  },
  transactionFeeFixed: {
    type: Number,
    default: 0.30
  },
  monthlyTransactionLimit: {
    type: Number,
    default: 1000000
  },
  dailyTransactionLimit: {
    type: Number,
    default: 100000
  },

  // Volume Statistics
  totalTransactionVolume: {
    type: Number,
    default: 0
  },
  totalTransactions: {
    type: Number,
    default: 0
  },
  averageTransactionAmount: {
    type: Number,
    default: 0
  },
  lastMonthVolume: {
    type: Number,
    default: 0
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspensionReason: String,

  // Contact Information
  primaryContact: {
    name: String,
    email: String,
    phone: String,
    title: String
  },
  supportContact: {
    name: String,
    email: String,
    phone: String
  },

  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    registrationSource: String
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date
});

// Update timestamp
merchantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
merchantSchema.index({ userId: 1, createdAt: -1 });
merchantSchema.index({ kycStatus: 1, isActive: 1 });
merchantSchema.index({ stripeAccountId: 1 });

module.exports = mongoose.model('Merchant', merchantSchema);
