## Setup Guide

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 4.4
- Stripe Account

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/SaiKumar1635/RupeeGo.git
cd RupeeGo
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

**Database Configuration:**
```
MONGODB_URI=mongodb://localhost:27017/rupeego
MONGODB_TEST_URI=mongodb://localhost:27017/rupeego-test
```

**Server Configuration:**
```
NODE_ENV=development
PORT=5000
HOST=localhost
```

**Stripe Configuration:**
```
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**JWT Configuration:**
```
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRY=7d
```

**Encryption Configuration:**
```
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

#### 4. Start MongoDB

Using Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Or start your local MongoDB service.

#### 5. Run the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### Verify Installation

Check health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-07-27T...",
  "uptime": 12.345,
  "environment": "development"
}
```

### API Documentation

#### Health Check
- **Endpoint:** `GET /health`
- **No authentication required**

#### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh JWT token

#### Payment Endpoints
- `POST /api/v1/payments/create` - Create payment
- `GET /api/v1/payments/:paymentId` - Get payment details
- `POST /api/v1/payments/verify` - Verify payment
- `GET /api/v1/payments` - List payments

#### Webhook Endpoints
- `POST /api/v1/webhooks/stripe` - Handle Stripe webhook
- `POST /api/v1/webhooks/register` - Register webhook
- `GET /api/v1/webhooks` - List webhooks

### Setting Up Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add new endpoint: `https://your-domain.com/api/v1/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`

4. Copy webhook signing secret and add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Testing Stripe Webhooks Locally

Use Stripe CLI to forward webhooks to localhost:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

### Database Schema

The application uses MongoDB with the following main collections:

**Users Collection:**
- userId, email, firstName, lastName, phone
- passwordHash, role, isVerified
- profile, merchantInfo, kycStatus
- createdAt, updatedAt

**Transactions Collection:**
- transactionId, userId, amount, currency
- status, paymentMethod
- stripePaymentId, stripeCustomerId
- metadata, billing, shipping
- refunds, createdAt, completedAt

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/unit/auth.test.js
```

### Troubleshooting

**MongoDB Connection Issues:**
```bash
# Check if MongoDB is running
mongosh

# Or using Docker
docker ps | grep mongodb
```

**Stripe API Errors:**
- Verify STRIPE_SECRET_KEY is correct
- Check Stripe account is in test mode for development
- Ensure webhook signing secret matches

**Port Already in Use:**
```bash
# Change port in .env
PORT=5001

# Or kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**JWT Token Issues:**
- Ensure JWT_SECRET is set in .env
- Check token expiry time

### Logging

Logs are stored in `./logs/` directory:
- `app.log` - All logs
- `error.log` - Error logs only

Change log level in `.env`:
```
LOG_LEVEL=debug  # debug, info, warn, error
```

### Production Deployment

1. **Set environment to production:**
```bash
NODE_ENV=production
```

2. **Use MongoDB Atlas for cloud database:**
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rupeego
```

3. **Use strong JWT secret:**
```bash
openssl rand -base64 32
```

4. **Use strong encryption key:**
```bash
openssl rand -base64 32
```

5. **Deploy using PM2:**
```bash
npm install -g pm2

pm2 start src/index.js --name "rupeego"
pm2 save
pm2 startup
```

6. **Set up HTTPS (required for payment processing)**

7. **Configure CORS origin:**
```
CORS_ORIGIN=https://yourdomain.com
```

### Support

For issues or questions:
1. Check logs in `./logs/` directory
2. Review API documentation
3. Check Stripe webhook status
4. Review MongoDB connection

### Next Steps

1. Implement authentication controllers
2. Implement transaction controllers
3. Implement refund logic
4. Set up email notifications
5. Implement admin dashboard
6. Add rate limiting
7. Add fraud detection
