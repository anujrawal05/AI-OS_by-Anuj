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

### 4.3 Get Video Progress Logs
- **Method**: `GET`
- **Path**: `/api/videos/progress`
- **Access**: Session-User
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "logs": [
      {
        "id": "v-uuid",
        "videoFilename": "AAA_eng.mp4",
        "progressSeconds": "142.5",
        "isCompleted": false
      }
    ]
  }
  ```

---

## 📈 4A. Business Progress & Bookmarks (`/api`)

### 4A.1 Save Business Progress
- **Method**: `POST`
- **Path**: `/api/progress/business`
- **Access**: Session-User
- **Request Body**:
  ```json
  {
    "stepKey": "expansion_marketing",
    "isUnlocked": true,
    "progressPercentage": 50
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "progress": {
      "id": "b-uuid",
      "stepKey": "expansion_marketing",
      "isUnlocked": true,
      "progressPercentage": 50
    }
  }
  ```

---

### 4A.2 Get Business Progress Logs
- **Method**: `GET`
- **Path**: `/api/progress/business`
- **Access**: Session-User
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "logs": [
      {
        "id": "b-uuid",
        "stepKey": "expansion_marketing",
        "isUnlocked": true,
        "progressPercentage": 50
      }
    ]
  }
  ```

---

### 4A.3 Toggle Bookmark
- **Method**: `POST`
- **Path**: `/api/bookmarks`
- **Access**: Session-User
- **Request Body**:
  ```json
  {
    "toolId": "TOOL_002"
  }
  ```
- **Response**: `200 OK` (if removed) or `201 Created` (if added)
  ```json
  {
    "success": true,
    "bookmarked": true,
    "bookmark": {
      "id": "bm-uuid",
      "toolId": "TOOL_002"
    }
  }
  ```

---

### 4A.4 Get Active Bookmarks
- **Method**: `GET`
- **Path**: `/api/bookmarks`
- **Access**: Session-User
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "bookmarks": [
      {
        "id": "bm-uuid",
        "toolId": "TOOL_002"
      }
    ]
  }
  ```

---

## 🔔 4B. Notifications Inbox (`/api`)

### 4B.1 Get Notifications
- **Method**: `GET`
- **Path**: `/api/notifications`
- **Access**: Session-User
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "notifications": [
      {
        "id": "n-uuid",
        "title": "Welcome to premium",
        "message": "Thank you for upgrading.",
        "isRead": false,
        "createdAt": "2026-07-01T12:00:00Z"
      }
    ]
  }
  ```

---

### 4B.2 Mark Notification As Read
- **Method**: `POST`
- **Path**: `/api/notifications/:id/read`
- **Access**: Session-User
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

## 🎟️ 6. Support & Admin Module (`/api/support`, `/api/admin`)

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
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "ticketId": "tick-uuid-9923"
  }
  ```

---

### 6.2 Get Admin Dashboard Stats
- **Method**: `GET`
- **Path**: `/api/admin/stats`
- **Access**: Admin
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "stats": {
      "totalUsers": 120,
      "activePremium": 45,
      "activeTrial": 15,
      "totalRevenue": 44955.00,
      "dailyAIPrompts": 320
    }
  }
  ```

---

### 6.3 Get Admin User Directory (Search/Filter/Paginate)
- **Method**: `GET`
- **Path**: `/api/admin/users`
- **Access**: Admin
- **Query Params**:
  - `page`: default 1
  - `limit`: default 10
  - `search`: search term matching email
  - `role`: filter by User or Admin
  - `plan`: filter by Free, Trial, or Premium
  - `suspended`: true or false
  - `sortBy`: field to sort (e.g. createdAt, email)
  - `sortOrder`: asc or desc
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "users": [...],
    "pagination": { "page": 1, "limit": 10, "total": 120, "totalPages": 12 }
  }
  ```

---

### 6.4 Manual User Plan Override
- **Method**: `POST`
- **Path**: `/api/admin/users/plan`
- **Access**: Admin
- **Request Body**:
  ```json
  {
    "userId": "u-uuid-1234",
    "plan": "Premium",
    "durationDays": 30
  }
  ```
- **Response**: `200 OK`

---

### 6.5 Toggle User Suspension
- **Method**: `POST`
- **Path**: `/api/admin/users/suspend`
- **Access**: Admin
- **Request Body**:
  ```json
  {
    "userId": "u-uuid-1234",
    "suspend": true
  }
  ```
- **Response**: `200 OK`

---

### 6.6 Dispatch Notification Broadcast
- **Method**: `POST`
- **Path**: `/api/admin/broadcast`
- **Access**: Admin
- **Request Body**:
  ```json
  {
    "title": "Maintenance Window",
    "message": "System will undergo maintenance tonight."
  }
  ```
- **Response**: `201 Created`

---

### 6.7 Query Operational Audit Logs
- **Method**: `GET`
- **Path**: `/api/admin/audit`
- **Access**: Admin
- **Query Params**: `page`, `limit`, `action` (e.g. LOGIN, SIGNUP), `userId`
- **Response**: `200 OK`

---

### 6.8 Query System Health Diagnostics
- **Method**: `GET`
- **Path**: `/api/admin/health`
- **Access**: Admin
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "health": {
      "uptime": 124.50,
      "memory": { ... },
      "cpu": 8,
      "platform": "linux",
      "database": "Connected"
    }
  }
  ```

---

## 🚦 7. System Monitoring & Probes (Public)

### 7.1 Liveness Check
- **Method**: `GET`
- **Path**: `/health`
- **Access**: Public
- **Response**: `200 OK`
  ```json
  {
    "status": "ok",
    "timestamp": "2026-07-01T12:00:00.000Z"
  }
  ```

---

### 7.2 Readiness Check
- **Method**: `GET`
- **Path**: `/ready`
- **Access**: Public
- **Response**: `200 OK` (when DB answers) or `503 Service Unavailable`
  ```json
  {
    "status": "ready",
    "database": "connected"
  }
  ```
