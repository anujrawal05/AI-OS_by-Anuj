# AI-OS Login 500 Error — ACTUAL ROOT CAUSE

## The Real Problem (100% Confirmed)

The **environment variables are NOT SET in your Vercel deployment**.

### What Happens:

1. Request comes in → Vercel calls `/api/index.js`
2. Module loads `backend/src/app.js`
3. `app.js` requires `./lib/db`
4. `db.js` instantiates `new PrismaClient()` which **reads DATABASE_URL from environment**
5. **DATABASE_URL is undefined** → Prisma throws an error during initialization
6. Entire module load fails → Vercel catches it → FUNCTION_INVOCATION_FAILED 500

## Required Environment Variables

Your code requires these to be set in Vercel (Settings → Environment Variables):

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=<64-char-hex-string>
BREVO_API_KEY=xkeysib-...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_SECRET_KEY=...
FRONTEND_URL=https://ai-os-powerd-by-ar-labs.vercel.app
```

Without these, **every API endpoint returns 500**.

## The Fix (2 parts)

### Part 1: Set Environment Variables in Vercel (CRITICAL)
- Go to Vercel Dashboard → Your Project
- Settings → Environment Variables
- Add all 6 required variables above
- Redeploy the project

### Part 2: Improve Error Handling (Code Changes)
- Better initialization error messages
- Graceful fallback for missing DATABASE_URL
- Clear error reporting in logs

