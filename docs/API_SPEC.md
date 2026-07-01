# API Specification Document - AI-OS v2

This document details the REST API specifications for all feature modules of the **AI-OS v2** ecosystem.

---

## 🔒 Security Gate Definitions
- **Public**: Accessible without credentials.
- **Session-User**: Requires a valid `session_token` in cookies or authorization headers.
- **Premium-User**: Requires active premium subscription status (`plan_type = 'Premium'`).
- **Admin**: Restricted to administrators (`role = 'Admin'`).

---

## 📂 1. Auth Module (`/api/auth`)

### 1.1 Signup
- **Method**: `POST`
- **Path**: `/api/auth/signup`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Validation**:
  - `email`: Valid address format.
  - `password`: Minimum 8 characters.
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "OTP verification code sent to email."
  }
  ```
- **Error Codes**:
  - `400 Bad Request`: Invalid payload parameters.
  - `409 Conflict`: Email already exists.

---

### 1.2 Verify OTP
- **Method**: `POST`
- **Path**: `/api/auth/verify-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "session_token": "eyJhbGciOi...",
    "user": {
      "id": "u-uuid-1234",
      "email": "user@example.com",
      "plan_type": "Trial"
    }
  }
  ```
- **Error Codes**:
  - `401 Unauthorized`: Invalid or expired OTP code.

---

### 1.3 Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "session_token": "eyJhbGciOi...",
    "user": {
      "id": "u-uuid-1234",
      "email": "user@example.com",
      "plan_type": "Premium"
    }
  }
  ```
- **Error Codes**:
  - `401 Unauthorized`: Bad password.
  - `404 Not Found`: Email not registered.

---

### 1.4 Forgot Password
- **Method**: `POST`
- **Path**: `/api/auth/forgot-password`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Reset instructions sent to your email."
  }
  ```

---

### 1.5 Reset Password
- **Method**: `POST`
- **Path**: `/api/auth/reset-password`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "token": "reset-uuid-token",
    "password": "NewSecurePassword123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Password reset completed successfully."
  }
  ```

---

### 1.6 Logout
- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Access**: Session-User
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Session invalidated."
  }
  ```

---

## 👤 2. Profile & Preferences Module (`/api/profile`)

### 2.1 Get Profile
- **Method**: `GET`
- **Path**: `/api/auth/profile`
- **Access**: Session-User
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "profile": {
      "name": "Jane Doe",
      "date_of_birth": "1994-05-15",
      "gender": "Female",
      "profession": "Developer",
      "preferences": {
        "theme": "Dark",
        "language": "English"
      }
    }
  }
  ```

---

### 2.2 Update Profile
- **Method**: `POST`
- **Path**: `/api/auth/update-profile`
- **Access**: Session-User
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "date_of_birth": "1994-05-15",
    "gender": "Female",
    "profession": "Product Architect"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Profile updated successfully."
  }
  ```

---

### 2.3 List Device Sessions
- **Method**: `GET`
- **Path**: `/api/auth/sessions`
- **Access**: Session-User
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "sessions": [
      {
        "id": "sess-uuid-99",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-07-01T12:00:00Z"
      }
    ]
  }
  ```

---

## 🤖 3. AI Strategist Consults (`/api/strategist`)

### 3.1 Compile Strategic Analysis Matrix
- **Method**: `POST`
- **Path**: `/api/strategist/compile`
- **Access**: Premium-User
- **Request Body**:
  ```json
  {
    "businessName": "My SaaS Startup",
    "targetAudience": "Ecommerce Brands",
    "bottleneck": "Customer Retention"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "analysis": "Based on input data...",
    "opportunities": "1. Opportunity A...",
    "automation": "Trigger Stripe capture...",
    "marketing": "Run targeted ads...",
    "leads": "Filter profiles...",
    "revenue": "Retain model pricing...",
    "plan": "Days 1-30: Setup..."
  }
  ```

---

### 3.2 Strategist Conversational Chat
- **Method**: `POST`
- **Path**: `/api/strategist/chat`
- **Access**: Premium-User
- **Request Body**:
  ```json
  {
    "userInput": "What tool stack is ideal for this opportunities list?",
    "history": [
      { "role": "user", "content": "Analyze my startup." },
      { "role": "assistant", "content": "Opportunity list compiled." }
    ]
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "reply": "I recommend Make.com for visual webhooks, OpenAI for parsing models..."
  }
  ```

---

## 📹 4. Progress Tracker & Video APIs (`/api/videos`)

### 4.1 List Discovered Videos
- **Method**: `GET`
- **Path**: `/api/videos`
- **Access**: Session-User
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "buildVideos": ["AAA_eng.mp4", "AAA_hindi.mp4", "..."],
    "exploreVideos": ["part1_eng.mp4", "..."]
  }
  ```

---

### 4.2 Save Video Progress State
- **Method**: `POST`
- **Path**: `/api/videos/progress`
- **Access**: Session-User
- **Request Body**:
  ```json
  {
    "videoFilename": "AAA_eng.mp4",
    "progressSeconds": 142.50,
    "isCompleted": false
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true
  }
  ```

---

## 💳 5. Billing & Payment Gateway (`/api/payments`)

### 5.1 Create Gateway Checkout Order
- **Method**: `POST`
- **Path**: `/api/payments/checkout`
- **Access**: Session-User
- **Request Body**:
  ```json
  {
    "planType": "Premium"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "orderId": "order_Hj23dF45...",
    "amount": 999.00,
    "currency": "INR"
  }
  ```

---

### 5.2 Verify Gateway Signature
- **Method**: `POST`
- **Path**: `/api/payments/verify`
- **Access**: Session-User
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_Hj23dF45",
    "razorpay_payment_id": "pay_Kk3d2d",
    "razorpay_signature": "sig_abc123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "plan_type": "Premium"
  }
  ```

---

### 5.3 Redeem Access Coupon Code
- **Method**: `POST`
- **Path**: `/api/payments/coupon`
- **Access**: Session-User
- **Request Body**:
  ```json
  {
    "couponCode": "VIP2026"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "plan_type": "Premium"
  }
  ```

---

## 🎟️ 6. Support & Admin Logs (`/api/support`, `/api/admin`)

### 6.1 Create Support Ticket
- **Method**: `POST`
- **Path**: `/api/support/ticket`
- **Access**: Session-User
- **Request Body**:
  ```json
  {
    "subject": "Payment failed but debited",
    "message": "My payment went through but status is still trial."
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "ticketId": "tick-uuid-9923"
  }
  ```

---

### 6.2 Get Admin Operational Logs
- **Method**: `GET`
- **Path**: `/api/admin/logs`
- **Access**: Admin
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "logs": [
      {
        "id": "log-uuid-1",
        "action_name": "USER_BAN",
        "details": { "user_id": "u-12" },
        "created_at": "2026-07-01T22:00:00Z"
      }
    ]
  }
  ```
