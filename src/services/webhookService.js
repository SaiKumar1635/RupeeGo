/**
 * Webhook Service
 * Manages webhook operations and event handling
 */

const axios = require('axios');
const logger = require('../config/logger');

class WebhookService {
  /**
   * Send webhook notification
   */
  async sendWebhook(webhookUrl, eventType, payload, retries = 3) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': eventType,
        'X-Webhook-Timestamp': new Date().toISOString()
      };

      const data = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: payload
      };

      let attempt = 0;
      while (attempt < retries) {
        try {
          const response = await axios.post(webhookUrl, data, {
            headers,
            timeout: 10000
          });

          if (response.status === 200 || response.status === 201) {
            logger.info(`Webhook sent successfully: ${eventType}`);
            return { success: true, status: response.status };
          }
        } catch (error) {
          attempt++;
          if (attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000;
            logger.warn(`Webhook retry attempt ${attempt}/${retries} in ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to send webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build webhook payload
   */
  buildPaymentPayload(transaction) {
    return {
      transactionId: transaction.transactionId,
      userId: transaction.userId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      timestamp: transaction.createdAt
    };
  }
}

module.exports = new WebhookService();
