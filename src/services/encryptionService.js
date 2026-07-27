/**
 * Encryption Service
 * Handles data encryption and decryption
 */

const crypto = require('crypto');
const logger = require('../config/logger');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.key = crypto
      .createHash('sha256')
      .update(process.env.ENCRYPTION_KEY || 'default-key')
      .digest();
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Encryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedText) {
    try {
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw error;
    }
  }

  /**
   * Generate random token
   */
  generateToken(length = 32) {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      logger.error('Token generation error:', error);
      throw error;
    }
  }

  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber) {
    try {
      if (!cardNumber || cardNumber.length < 4) {
        return '****';
      }
      const lastFour = cardNumber.slice(-4);
      return `****-****-****-${lastFour}`;
    } catch (error) {
      logger.error('Card masking error:', error);
      throw error;
    }
  }
}

module.exports = new EncryptionService();
