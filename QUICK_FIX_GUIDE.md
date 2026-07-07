# AI-OS Login Fix — Quick Fix Guide

## What You Need to Do (3 Simple Steps)

---

## STEP 1: Fix Your Code Locally

Copy & paste these corrected files into your project:

### File 1: `backend/src/lib/db.js`

**Replace the entire file with this:**

```javascript
const { PrismaClient } = require('@prisma/client');

// Safe logger that works even if imports fail
const safeLog = (level, msg, meta = {}, stack = '') => {
  const ts = new Date().toISOString();
  const metaStr = Object.keys(meta || {}).length ? ` | Meta: ${JSON.stringify(meta)}` : '';
  const prefix = `[${ts}] [${level}]`;
  const fullMsg = `${prefix} ${msg}${metaStr}`;
  
  if (level === 'ERROR') {
    console.error(fullMsg);
    if (stack) console.error(stack);
  } else {
    console.log(fullMsg);
  }
};

let prisma;

// Validate DATABASE_URL before attempting connection
if (!process.env.DATABASE_URL) {
  safeLog('ERROR', '[Database] CRITICAL: DATABASE_URL environment variable is not set!', {
    hint: 'Set DATABASE_URL in your Vercel Environment Variables. Example: postgresql://user:pass@host/db?sslmode=require'
  });
  
  // Create a mock client that fails gracefully instead of crashing
  prisma = {
    user: {},
    $transaction: () => Promise.reject(new Error('Database not configured: DATABASE_URL not set')),
    $queryRaw: () => Promise.reject(new Error('Database not configured: DATABASE_URL not set')),
    $disconnect: () => Promise.resolve()
  };
} else {
  try {
    if (process.env.NODE_ENV === 'production') {
      prisma = new PrismaClient();
    } else {
      // Prevent multiple instances of Prisma Client in development during hot-reloads
      if (!global.prisma) {
        global.prisma = new PrismaClient({
          log: ['error', 'warn']
        });
      }
      prisma = global.prisma;
    }
    safeLog('INFO', '[Database] Prisma Client initialized successfully');
  } catch (err) {
    safeLog('ERROR', '[Database] Failed to initialize Prisma Client', { error: err.message }, err.stack);
    throw err;
  }
}

// Retry logic for transient database errors
const TRANSIENT_TX_ERROR_PATTERN = /Transaction (API error|not found)/i;
const MAX_ATTEMPTS = 3;

function isTransientTransactionError(err) {
  return !!err && typeof err.message === 'string' && TRANSIENT_TX_ERROR_PATTERN.test(err.message);
}

async function retryOnTransientError(attemptFn) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await attemptFn();
    } catch (err) {
      if (!isTransientTransactionError(err) || attempt === MAX_ATTEMPTS) {
        throw err;
      }
      safeLog('WARN', `[DB] Transient pooler transaction error, retrying (attempt ${attempt}/${MAX_ATTEMPTS})`, { message: err.message });
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
  }
}

function withTransaction(callback, options) {
  if (!prisma.$transaction) {
    return Promise.reject(new Error('Transactions not available: Database not configured'));
  }
  return retryOnTransientError(() => prisma.$transaction(callback, options));
}

function withBatchTransaction(operationsFactory) {
  if (!prisma.$transaction) {
    return Promise.reject(new Error('Transactions not available: Database not configured'));
  }
  return retryOnTransientError(() => prisma.$transaction(operationsFactory()));
}

prisma.withTransaction = withTransaction;
prisma.withBatchTransaction = withBatchTransaction;

module.exports = prisma;
```

---

### File 2: `backend/src/config/env.js`

**Replace the entire file with this:**

```javascript
const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_SECRET',
  'BREVO_API_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_SECRET_KEY',
  'FRONTEND_URL'
];

function validateEnv() {
  const missing = [];

  for (const envVar of REQUIRED_ENV) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    missing.push('JWT_SECRET (must be at least 32 characters)');
  }

  if (process.env.BACKEND_URL && !/^https?:\/\//i.test(process.env.BACKEND_URL)) {
    console.error('[Env Validation Failure] BACKEND_URL must be an absolute URL starting with http:// or https://');
    process.exit(1);
  }

  // Allow test running to skip full env restrictions for localized tests if database is mockable,
  // but fail for standard environments
  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    console.error(`[Env Validation Failure] Missing required environment variables: ${missing.join(', ')}`);
    console.error('\n⚠️  DEPLOYMENT FIX: Set these in Vercel → Project Settings → Environment Variables:');
    missing.forEach(v => {
      console.error(`  - ${v}`);
    });
    console.error('\n  See DEPLOY_VERCEL.md for detailed instructions.\n');
    
    // Don't force exit in serverless — let the request handler deal with it
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }

  // Warn if NODE_ENV is not production — cross-origin cookies will break
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.warn('[Env Warning] NODE_ENV is not "production". Session cookies will use SameSite=Lax which BREAKS cross-origin login on deployed Vercel site. Set NODE_ENV=production in your deployment platform environment variables.');
  }

  console.log('[Env Validation] Environment check completed.');
  return {
    isValid: missing.length === 0,
    missing
  };
}

module.exports = {
  validateEnv,
  REQUIRED_ENV
};
```

---

### File 3: `api/index.js`

**Replace the entire file with this:**

```javascript
require('dotenv').config();

let app;
let initError = null;

try {
  // Load backend Express app for Vercel Serverless Functions
  app = require('../backend/src/app');
} catch (err) {
  // Capture initialization error and return it in error responses
  initError = {
    message: err.message,
    stack: err.stack,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? '***set***' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? '***set***' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL ? 'yes' : 'no'
    }
  };
  
  console.error('[API Init Error] Failed to load Express app:', err.message);
  console.error(err.stack);
  
  // Create a minimal error handler
  const express = require('express');
  app = express();
  
  app.use((req, res) => {
    res.status(500).json({
      error: 'Backend initialization failed',
      message: initError.message,
      hint: 'Check that all required environment variables are set: DATABASE_URL, JWT_SECRET, BREVO_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_SECRET_KEY, FRONTEND_URL',
      details: process.env.VERCEL ? 'See Vercel Deployment Logs for full stack trace' : initError.stack
    });
  });
}

// Export Express app for Vercel Serverless Functions
module.exports = app;
```

---

## STEP 2: Commit & Push to GitHub

```bash
git add backend/src/lib/db.js backend/src/config/env.js api/index.js
git commit -m "Fix: Improve error handling for missing environment variables"
git push origin main
```

Wait 1-2 minutes for Vercel to automatically redeploy.

---

## STEP 3: Set Environment Variables in Vercel ⚡ **CRITICAL**

This is the most important step. Without this, login will still fail.

### Go to Vercel Dashboard:

1. **Visit** https://vercel.com/dashboard
2. **Click** on your project `ai-os-powerd-by-ar-labs`
3. **Click** Settings (top tab)
4. **Click** Environment Variables (left sidebar)

### Add these 6 variables:

Copy each value and paste it into Vercel:

| Variable Name | Value | How to Get |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Copy from your Neon dashboard (Settings → Connection) |
| `JWT_SECRET` | Run this in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Copy the output (64 char hex string) |
| `BREVO_API_KEY` | `xkeysib-...` | From Brevo dashboard → SMTP & API → API keys |
| `RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` | From Razorpay dashboard → Settings → API Keys |
| `RAZORPAY_SECRET_KEY` | `...` | From Razorpay dashboard → Settings → API Keys (Secret) |
| `FRONTEND_URL` | `https://ai-os-powerd-by-ar-labs.vercel.app` | Your deployed frontend URL |

### Important: 
- **Select all 3 environments:** ☑️ Production, ☑️ Preview, ☑️ Development
- **Click Save** after each variable
- **Don't forget FRONTEND_URL** — it's needed for password reset emails

---

## STEP 4: Redeploy on Vercel

Option A (Automatic):
- Vercel will auto-redeploy when code is pushed
- Wait 2-3 minutes

Option B (Manual):
1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the latest deployment
3. Click the ⋯ (three dots) menu → Redeploy

---

## ✅ Test It!

1. Visit https://ai-os-powerd-by-ar-labs.vercel.app
2. Try to login
3. Should no longer see 500 error! 🎉

If still broken:
- Check Vercel logs: Deployments → Latest → Logs
- Make sure all 6 env vars are set in Vercel
- Make sure you redeployed after setting env vars

---

## Need Help?

Check Vercel Logs for the actual error:
- Go to Vercel Dashboard → Deployments → Latest → Logs
- Scroll through the output
- Look for error messages with "DATABASE_URL", "JWT_SECRET", or "Prisma"

That will tell you exactly what's missing!
