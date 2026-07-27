/**
 * Payment Service
 * Handles all payment processing with Stripe
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../config/logger');
const Transaction = require('../models/Transaction');
const { TRANSACTION_STATUS } = require('../config/constants');

class PaymentService {
  /**
   * Create a Stripe customer
   */
  async createCustomer(userData) {
    try {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        metadata: {
          userId: userData.userId,
          createdAt: new Date().toISOString()
        }
      });

      logger.info(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(paymentData) {
    try {
      const { amount, currency, customerId, description, metadata } = paymentData;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        customer: customerId,
        description,
        metadata: metadata || {},
        statement_descriptor: 'RUPEEGO PAYMENT',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: process.env.PAYMENT_RETURN_URL || 'https://example.com/payment-return'
      });

      logger.info(`Payment intent confirmed: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  /**
   * Get payment intent details
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  /**
   * Create a refund
   */
  async createRefund(chargeId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        charge: chargeId,
        reason: reason
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);

      logger.info(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event) {
    try {
      const { type, data } = event;

      switch (type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(data.object);
          break;
        default:
          logger.debug(`Unhandled webhook event: ${type}`);
      }

      return { success: true, event: type };
    } catch (error) {
      logger.error('Error processing webhook event:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(paymentIntent) {
    try {
      const transaction = await Transaction.findOne({
        stripePaymentId: paymentIntent.id
      });

      if (transaction) {
        transaction.status = TRANSACTION_STATUS.COMPLETED;
        transaction.completedAt = new Date();
        await transaction.save();
        logger.info(`Transaction completed: ${transaction.transactionId}`);
      }
    } catch (error) {
      logger.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(paymentIntent) {
    try {
      const transaction = await Transaction.findOne({
        stripePaymentId: paymentIntent.id
      });

      if (transaction) {
        transaction.status = TRANSACTION_STATUS.FAILED;
        transaction.errorCode = paymentIntent.last_payment_error?.code;
        transaction.errorMessage = paymentIntent.last_payment_error?.message;
        await transaction.save();
        logger.warn(`Transaction failed: ${transaction.transactionId}`);
      }
    } catch (error) {
      logger.error('Error handling payment failed:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
