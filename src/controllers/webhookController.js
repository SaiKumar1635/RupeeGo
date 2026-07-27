/**
 * Webhook Controller
 * Handles webhook events from Stripe
 */

const paymentService = require('../services/paymentService');
const logger = require('../config/logger');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Handle Stripe Webhook
 * POST /api/v1/webhooks/stripe
 */
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      logger.warn('Webhook received without signature');
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Missing signature'
      });
    }

    // Verify webhook signature
    let event;
    try {
      event = paymentService.verifyWebhookSignature(req.body, signature);
    } catch (error) {
      logger.error('Webhook signature verification failed:', error.message);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Process webhook event
    await paymentService.processWebhookEvent(event);

    logger.info(`Webhook processed: ${event.type}`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Webhook processed successfully',
      event: event.type
    });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    next(error);
  }
};

/**
 * Register Webhook
 * POST /api/v1/webhooks/register
 */
exports.registerWebhook = async (req, res, next) => {
  try {
    const { url, events } = req.body;
    const userId = req.user.userId;

    if (!url || !events || !Array.isArray(events)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid webhook configuration'
      });
    }

    try {
      new URL(url);
    } catch (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid webhook URL'
      });
    }

    logger.info(`Webhook registered for user: ${userId}`);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Webhook registered successfully',
      data: {
        url,
        events,
        isActive: true
      }
    });
  } catch (error) {
    logger.error('Error registering webhook:', error);
    next(error);
  }
};

/**
 * List Webhooks
 * GET /api/v1/webhooks
 */
exports.listWebhooks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    logger.info(`Webhooks listed for user: ${userId}`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: []
    });
  } catch (error) {
    logger.error('Error listing webhooks:', error);
    next(error);
  }
};

module.exports = exports;
