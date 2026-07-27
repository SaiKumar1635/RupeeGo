# RupeeGo API Documentation

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.rupeego.com/api/v1
```

## Authentication

All endpoints (except public ones) require JWT authentication via `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Get JWT Token
**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d",
    "user": {
      "userId": "user_123",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

---

## Payment Endpoints

### 1. Create Payment Intent
Create a new payment for processing.

**Endpoint:** `POST /payments/create`

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 99.99,
  "currency": "USD",
  "description": "Order #12345",
  "metadata": {
    "orderId": "order_123",
    "customerId": "cust_456"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "transactionId": "txn_1234567890",
    "paymentIntentId": "pi_1234567890",
    "clientSecret": "pi_1234567890_secret_abcdef",
    "amount": 99.99,
    "currency": "USD",
    "status": "pending"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "Invalid amount",
  "code": "INVALID_AMOUNT"
}
```

---

### 2. Verify Payment
Verify payment status after client-side processing.

**Endpoint:** `POST /payments/verify`

**Authentication:** Required

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "transactionId": "txn_1234567890",
    "status": "completed",
    "amount": 99.99,
    "currency": "USD",
    "completedAt": "2026-07-27T10:30:00Z"
  }
}
```

---

### 3. Get Payment Details
Retrieve details of a specific payment.

**Endpoint:** `GET /payments/:paymentId`

**Authentication:** Required

**Path Parameters:**
- `paymentId` (string, required) - Transaction ID or Payment Intent ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_1234567890",
    "userId": "user_123",
    "amount": 99.99,
    "currency": "USD",
    "status": "completed",
    "paymentMethod": "card",
    "description": "Order #12345",
    "createdAt": "2026-07-27T10:00:00Z",
    "completedAt": "2026-07-27T10:30:00Z",
    "metadata": {
      "orderId": "order_123"
    }
  }
}
```

---

### 4. List Payments
Retrieve a paginated list of user's payments.

**Endpoint:** `GET /payments`

**Authentication:** Required

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number
- `limit` (integer, optional, default: 20) - Items per page
- `status` (string, optional) - Filter by status: pending, completed, failed

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "transactionId": "txn_1234567890",
      "amount": 99.99,
      "currency": "USD",
      "status": "completed",
      "createdAt": "2026-07-27T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Refund Endpoints

### 1. Create Refund
Initiate a refund for a completed payment.

**Endpoint:** `POST /refunds/create`

**Authentication:** Required

**Request Body:**
```json
{
  "transactionId": "txn_1234567890",
  "amount": 50.00,
  "reason": "requested_by_customer",
  "reasonDescription": "Customer requested partial refund"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Refund initiated successfully",
  "data": {
    "refundId": "ref_1234567890",
    "transactionId": "txn_1234567890",
    "amount": 50.00,
    "status": "processing",
    "initiatedAt": "2026-07-27T10:45:00Z"
  }
}
```

---

### 2. Get Refund Details
Retrieve details of a specific refund.

**Endpoint:** `GET /refunds/:refundId`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "refundId": "ref_1234567890",
    "transactionId": "txn_1234567890",
    "amount": 50.00,
    "status": "succeeded",
    "reason": "requested_by_customer",
    "initiatedAt": "2026-07-27T10:45:00Z",
    "completedAt": "2026-07-27T11:00:00Z"
  }
}
```

---

### 3. List Refunds
Get list of refunds for user.

**Endpoint:** `GET /refunds`

**Authentication:** Required

**Query Parameters:**
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 20)
- `status` (string, optional) - pending, processing, succeeded, failed

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "refundId": "ref_1234567890",
      "amount": 50.00,
      "status": "succeeded",
      "createdAt": "2026-07-27T10:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

---

## Webhook Endpoints

### 1. Register Webhook
Register a webhook URL for event notifications.

**Endpoint:** `POST /webhooks/register`

**Authentication:** Required

**Request Body:**
```json
{
  "url": "https://yourdomain.com/webhooks/payments",
  "events": [
    "payment.success",
    "payment.failed",
    "refund.completed"
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Webhook registered successfully",
  "data": {
    "webhookId": "wh_1234567890",
    "url": "https://yourdomain.com/webhooks/payments",
    "events": ["payment.success", "payment.failed", "refund.completed"],
    "isActive": true,
    "createdAt": "2026-07-27T10:00:00Z"
  }
}
```

---

### 2. List Webhooks
Get all registered webhooks.

**Endpoint:** `GET /webhooks`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "webhookId": "wh_1234567890",
      "url": "https://yourdomain.com/webhooks/payments",
      "events": ["payment.success", "payment.failed"],
      "isActive": true,
      "totalAttempts": 150,
      "successfulAttempts": 148,
      "failedAttempts": 2
    }
  ]
}
```

---

### 3. Stripe Webhook Handler
Handle incoming webhook events from Stripe.

**Endpoint:** `POST /webhooks/stripe`

**Authentication:** Not required (Stripe signature verification)

**Headers:**
```
Stripe-Signature: t=<timestamp>,v1=<signature>
```

**Event Types Handled:**
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed
- `charge.dispute.created` - Dispute initiated

---

## Merchant Endpoints

### 1. Get Merchant Profile
Retrieve merchant account details.

**Endpoint:** `GET /merchants/profile`

**Authentication:** Required (Merchant role)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "merchantId": "merchant_123",
    "businessName": "Your Business Inc.",
    "businessType": "corporation",
    "kycStatus": "approved",
    "stripeAccountId": "acct_1234567890",
    "totalTransactionVolume": 50000.00,
    "totalTransactions": 250,
    "settlementSchedule": "daily",
    "nextSettlementDate": "2026-07-28T00:00:00Z",
    "isActive": true
  }
}
```

---

### 2. Update Merchant Profile
Update merchant account information.

**Endpoint:** `PUT /merchants/profile`

**Authentication:** Required (Merchant role)

**Request Body:**
```json
{
  "businessName": "Updated Business Name",
  "businessPhone": "+1234567890",
  "website": "https://yourbusiness.com",
  "settlementSchedule": "weekly"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "merchantId": "merchant_123",
    "businessName": "Updated Business Name",
    "updatedAt": "2026-07-27T11:00:00Z"
  }
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid request",
  "code": "INVALID_REQUEST",
  "details": {
    "field": "amount",
    "message": "Amount must be greater than 0"
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "requestId": "req_1234567890"
}
```

---

## Rate Limiting

- **Default:** 100 requests per minute per user
- **Authenticated:** 1000 requests per minute per user
- **Webhook:** 10000 requests per minute

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1627389600
```

---

## Pagination

Paginated endpoints return:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2026-07-27T10:30:00Z
```

---

## Webhook Events

### Payment Events
```json
{
  "event": "payment.success",
  "timestamp": "2026-07-27T10:30:00Z",
  "data": {
    "transactionId": "txn_1234567890",
    "amount": 99.99,
    "currency": "USD",
    "status": "completed"
  }
}
```

### Refund Events
```json
{
  "event": "refund.completed",
  "timestamp": "2026-07-27T11:00:00Z",
  "data": {
    "refundId": "ref_1234567890",
    "transactionId": "txn_1234567890",
    "amount": 50.00",
    "status": "succeeded"
  }
}
```

---

## Testing API Locally

### Using cURL

```bash
# Create payment
curl -X POST http://localhost:5000/api/v1/payments/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "currency": "USD",
    "description": "Test payment"
  }'

# Get payment details
curl -X GET http://localhost:5000/api/v1/payments/txn_123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# List payments
curl -X GET "http://localhost:5000/api/v1/payments?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the Postman collection from `docs/postman-collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:5000/api/v1
   - `jwt_token`: Your JWT token
3. Run requests

---

## Support

For API issues:
1. Check request format and headers
2. Review error codes and messages
3. Check rate limiting status
4. Contact support@rupeego.com
