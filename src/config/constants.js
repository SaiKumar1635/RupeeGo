/**
 * Application Constants
 * Centralized constants for the application
 */

module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Transaction Status
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    DISPUTED: 'disputed'
  },

  // Payment Status
  PAYMENT_STATUS: {
    CREATED: 'created',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },

  // Refund Status
  REFUND_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    REJECTED: 'rejected'
  },

  // User Roles
  USER_ROLES: {
    USER: 'user',
    MERCHANT: 'merchant',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },

  // Payment Methods
  PAYMENT_METHODS: {
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    DIGITAL_WALLET: 'digital_wallet',
    UPI: 'upi',
    CRYPTOCURRENCY: 'cryptocurrency'
  },

  // Currencies
  CURRENCIES: {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    INR: 'INR',
    JPY: 'JPY'
  },

  // Error Messages
  ERRORS: {
    INVALID_INPUT: 'Invalid input provided',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    CONFLICT: 'Resource already exists',
    VALIDATION_ERROR: 'Validation error',
    PAYMENT_FAILED: 'Payment processing failed',
    PAYMENT_DECLINED: 'Payment was declined',
    INSUFFICIENT_FUNDS: 'Insufficient funds',
    INVALID_CARD: 'Invalid card information',
    TRANSACTION_NOT_FOUND: 'Transaction not found',
    REFUND_FAILED: 'Refund processing failed',
    INTERNAL_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
  },

  // Success Messages
  SUCCESS: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    PAYMENT_CREATED: 'Payment created successfully',
    PAYMENT_VERIFIED: 'Payment verified successfully',
    REFUND_INITIATED: 'Refund initiated successfully',
    LOGGED_IN: 'Logged in successfully',
    LOGGED_OUT: 'Logged out successfully'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1
  },

  // JWT Configuration
  JWT: {
    ALGORITHM: 'HS256',
    TOKEN_EXPIRY: process.env.JWT_EXPIRY || '7d',
    REFRESH_TOKEN_EXPIRY: '30d'
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    AUTH_MAX_REQUESTS: 5,
    PAYMENT_MAX_REQUESTS: 10
  },

  // Transaction Limits
  TRANSACTION_LIMITS: {
    MIN_AMOUNT: parseFloat(process.env.MIN_TRANSACTION_AMOUNT) || 1,
    MAX_AMOUNT: parseFloat(process.env.MAX_TRANSACTION_AMOUNT) || 100000,
    DAILY_LIMIT: 1000000,
    MONTHLY_LIMIT: 10000000
  },

  // Webhook Events
  WEBHOOK_EVENTS: {
    PAYMENT_SUCCESS: 'payment.success',
    PAYMENT_FAILED: 'payment.failed',
    REFUND_INITIATED: 'refund.initiated',
    REFUND_COMPLETED: 'refund.completed',
    REFUND_FAILED: 'refund.failed',
    DISPUTE_CREATED: 'dispute.created',
    DISPUTE_RESOLVED: 'dispute.resolved'
  },

  // Stripe Events
  STRIPE_EVENTS: {
    PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
    PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
    CHARGE_REFUNDED: 'charge.refunded',
    CHARGE_DISPUTE_CREATED: 'charge.dispute.created',
    CHARGE_DISPUTE_RESOLVED: 'charge.dispute.resolved'
  },

  // Validation Rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
    CARD_NUMBER_REGEX: /^\d{13,19}$/,
    CVV_REGEX: /^\d{3,4}$/
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf']
  },

  // Cache TTL (in seconds)
  CACHE_TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600 // 1 hour
  }
};
