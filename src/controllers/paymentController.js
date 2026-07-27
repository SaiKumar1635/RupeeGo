/**
 * Payment Controller
 * Handles payment-related HTTP requests
 */

const paymentService = require('../services/paymentService');
const logger = require('../config/logger');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { validateAmount } = require('../utils/validators');
const { HTTP_STATUS, ERRORS, SUCCESS, TRANSACTION_LIMITS } = require('../config/constants');

/**
 * Create Payment
 * POST /api/v1/payments/create
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { amount, currency, description, metadata } = req.body;
    const userId = req.user.userId;

    // Validate amount
    const validation = validateAmount(amount, TRANSACTION_LIMITS.MIN_AMOUNT, TRANSACTION_LIMITS.MAX_AMOUNT);
    if (!validation.valid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: validation.error
      });
    }

    // Get user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERRORS.NOT_FOUND
      });
    }

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency: currency || 'USD',
      customerId: user._id.toString(),
      description: description || 'Payment via RupeeGo',
      metadata: metadata || { userId }
    });

    // Create transaction record
    const transaction = new Transaction({
      userId,
      amount,
      currency: currency || 'USD',
      status: 'pending',
      paymentMethod: 'card',
      stripePaymentId: paymentIntent.id,
      description,
      metadata
    });

    await transaction.save();

    logger.info(`Payment created: ${transaction.transactionId}`);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS.PAYMENT_CREATED,
      data: {
        transactionId: transaction.transactionId,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount,
        currency,
        status: transaction.status
      }
    });
  } catch (error) {
    logger.error('Error creating payment:', error);
    next(error);
  }
};

/**
 * Verify Payment
 * POST /api/v1/payments/verify
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERRORS.INVALID_INPUT
      });
    }

    // Get payment intent from Stripe
    const paymentIntent = await paymentService.getPaymentIntent(paymentIntentId);

    // Update transaction
    const transaction = await Transaction.findOne({
      stripePaymentId: paymentIntentId
    });

    if (transaction) {
      if (paymentIntent.status === 'succeeded') {
        transaction.status = 'completed';
        transaction.completedAt = new Date();
      } else if (paymentIntent.status === 'processing') {
        transaction.status = 'processing';
      } else {
        transaction.status = 'failed';
      }

      await transaction.save();
    }

    logger.info(`Payment verified: ${paymentIntentId}`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS.PAYMENT_VERIFIED,
      data: {
        transactionId: transaction?.transactionId,
        status: transaction?.status,
        amount: transaction?.amount,
        currency: transaction?.currency
      }
    });
  } catch (error) {
    logger.error('Error verifying payment:', error);
    next(error);
  }
};

/**
 * Get Payment Details
 * GET /api/v1/payments/:paymentId
 */
exports.getPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.userId;

    const transaction = await Transaction.findOne({
      $or: [
        { transactionId: paymentId },
        { stripePaymentId: paymentId }
      ],
      userId
    });

    if (!transaction) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERRORS.NOT_FOUND
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: transaction.toObject()
    });
  } catch (error) {
    logger.error('Error getting payment:', error);
    next(error);
  }
};

/**
 * List Payments
 * GET /api/v1/payments
 */
exports.listPayments = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error listing payments:', error);
    next(error);
  }
};

module.exports = exports;
