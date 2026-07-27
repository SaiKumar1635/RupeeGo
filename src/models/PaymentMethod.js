/**
 * PaymentMethod Model
 * Stores saved payment methods for users
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const encryptionService = require('../services/encryptionService');

const paymentMethodSchema = new mongoose.Schema({
  paymentMethodId: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },

  // Payment Method Type
  type: {
    type: String,
    enum: ['card', 'bank_account', 'digital_wallet'],
    required: true
  },

  // Card Details (encrypted)
  card: {
    cardNumber: String, // Last 4 digits only
    cardBrand: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover']
    },
    expiryMonth: Number,
    expiryYear: Number,
    cardholderName: String,
    cvv: String, // Never stored, only for verification
  },

  // Bank Account Details (encrypted)
  bankAccount: {
    accountNumber: String, // Last 4 digits only
    routingNumber: String,
    accountHolderName: String,
    bankName: String,
    accountType: {
      type: String,
      enum: ['checking', 'savings']
    }
  },

  // Digital Wallet
  digitalWallet: {
    walletType: {
      type: String,
      enum: ['apple_pay', 'google_pay', 'paypal']
    },
    walletToken: String,
    walletEmail: String
  },

  // Payment Method Status
  isDefault: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Stripe Integration
  stripePaymentMethodId: String,
  stripeCustomerId: String,

  // Verification
  verificationMethod: String,
  verifiedAt: Date,
  verificationCode: String,

  // Usage Statistics
  timesUsed: {
    type: Number,
    default: 0
  },
  totalAmountUsed: {
    type: Number,
    default: 0
  },
  lastUsedAt: Date,
  lastUsedFor: String,

  // Billing Address
  billingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Metadata
  metadata: {
    nickname: String,
    tags: [String],
    notes: String
  },

  // Security
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: Date,

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date
});

// Hash card number before saving
paymentMethodSchema.pre('save', function(next) {
  if (this.isModified('card.cardNumber') && this.card.cardNumber && this.card.cardNumber.length > 4) {
    this.card.cardNumber = this.card.cardNumber.slice(-4);
  }
  this.updatedAt = Date.now();
  next();
});

// Create indexes
paymentMethodSchema.index({ userId: 1, isActive: 1, isDefault: 1 });
paymentMethodSchema.index({ stripePaymentMethodId: 1 });
paymentMethodSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
