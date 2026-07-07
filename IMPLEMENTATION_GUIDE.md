# AI-OS Login Fix — Complete Implementation Guide

## Problem Summary

Your website returns **HTTP 500 "FUNCTION_INVOCATION_FAILED"** on every API call, including login, because **environment variables are not set in your Vercel deployment**.

---

## Root Cause

When any API request comes in:
1. Vercel calls `/api/index.js`
2. This loads your Express backend (`backend/src/app.js`)
3. The backend tries to initialize Prisma database client
4. Prisma reads `DATABASE_URL` from environment variables
5. **If `DATABASE_URL` is not set → Prisma crashes**
6. **All modules fail to load → 500 error for every request**

---

## The Fix (3 Steps)

### ⚡ STEP 1: Deploy Fixed Code to GitHub
Run these commands in your project root to apply the fixes:

```bash
# Copy fixed files over the broken ones
cp ./backend/src/lib/db.js ./backend/src/lib/db.js.backup
cp db-FIXED.js ./backend/src/lib/db.js

cp ./backend/src/config/env.js ./backend/src/config/env.js.backup
cp env-FIXED.js ./backend/src/config/env.js

cp ./api/index.js ./api/index.js.backup
cp api-index-FIXED.js ./api/index.js

# Commit and push
git add backend/src/lib/db.js backend/src/config/env.js api/index.js
git commit -m "Fix: Improve error handling for missing environment variables"
git push origin main
```

**What These Changes Do:**
- ✅ Better error messages when env vars are missing
- ✅ Graceful fallback instead of hard crash
- ✅ Clear hints about what needs to be set in Vercel
- ✅ Better logging in Vercel Deployment Logs

---

### 🔑 STEP 2: Set Environment Variables in Vercel (CRITICAL!)

1. **Go to Vercel Dashboard** → Your Project (`ai-os-powerd-by-ar-labs`)
2. **Click Settings** (top tab)
3. **Click Environment Variables** (left sidebar)
4. **Add all 6 required variables:**

| Variable Name | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:...` | Your Neon PostgreSQL connection string |
| `JWT_SECRET` | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Secret key for login tokens (min 32 chars) |
| `BREVO_API_KEY` | `xkeysib-...` | Your Brevo API key (from Brevo dashboard) |
| `RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` | Your Razorpay public key |
| `RAZORPAY_SECRET_KEY` | `...` | Your Razorpay secret key |
| `FRONTEND_URL` | `https://ai-os-powerd-by-ar-labs.vercel.app` | Your deployed frontend URL |

**Important:** Select all three environments when adding:
- ☑️ Production
- ☑️ Preview  
- ☑️ Development

5. **Click "Save"**

---

### 🚀 STEP 3: Redeploy on Vercel

**Option A (Automatic):**
- Vercel automatically redeploys when you push code to GitHub
- Once you push the fixed files, it will build and deploy
- Wait 2-3 minutes for the new deployment

**Option B (Manual Redeploy):**
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Find the latest successful deployment
4. Click the **⋯ (three dots)** menu
5. Click **Redeploy** (this forces it to use the new env vars)

---

## Verification

Once deployed, test the login:

1. **Visit** https://ai-os-powerd-by-ar-labs.vercel.app
2. **Try to login** (you should no longer see 500 error)
3. **Check browser console** for any new errors
4. **Check Vercel Logs** for detailed errors:
   - Vercel Dashboard → Deployments → Latest → Logs
   - Look for "DATABASE_URL" or "Prisma" errors

---

## Files Changed

```
backend/src/lib/db.js
├─ Added: DATABASE_URL validation before Prisma init
├─ Added: Safe logging fallback if logger fails
├─ Added: Clear error messages for missing database
└─ Added: Graceful error handling

backend/src/config/env.js
├─ Improved: Error messages tell users to check Vercel settings
├─ Added: Detect if running in Vercel
└─ Changed: Don't force exit in serverless (let request handler deal with it)

api/index.js
├─ Added: Try/catch around app loading
├─ Added: Error endpoint that explains what went wrong
└─ Added: Better error messages in 500 responses
```

---

## Troubleshooting

### "Still Getting 500?"

1. **Make sure you set ALL 6 environment variables** (not just DATABASE_URL)
2. **Verify environment variables in Vercel:**
   - Go to Settings → Environment Variables
   - Confirm all variables show ✓ (checkmark)
3. **Redeploy after setting variables:**
   - Vercel doesn't automatically use new env vars from old builds
   - Need to Redeploy (or push new code)
4. **Check Vercel Logs:**
   - Dashboard → Deployments → Latest → Logs
   - Scroll to see the actual error message

### "Database Connection Fails?"

If you see errors like "Cannot connect to database":
- Verify `DATABASE_URL` is correct (copy from Neon dashboard)
- Make sure Neon database is active (not suspended)
- Check if your IP is whitelisted in Neon (usually is by default)

### "JWT_SECRET Too Short?"

If you get a validation error:
- Generate a proper secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- It must be at least 32 characters
- Use the full output

---

## What Each Environment Variable Does

- **DATABASE_URL**: PostgreSQL connection string to your Neon database
- **JWT_SECRET**: Secret key used to sign login tokens (secure random string)
- **BREVO_API_KEY**: Email sending API key (required for OTP emails)
- **RAZORPAY_KEY_ID & RAZORPAY_SECRET_KEY**: Payment processing (test or live keys)
- **FRONTEND_URL**: Used for password reset email links back to your site

---

## Next Steps

After login is fixed, you should also:

1. ✅ Check that **OTP verification emails** send (Brevo might need sender verification)
2. ✅ Run through complete **signup → OTP → login flow**
3. ✅ Verify **payment flow** works (Razorpay)
4. ✅ Check other pages load correctly
5. ✅ Review the **Website Audit** for additional improvements

---

## Questions?

- 📖 See **DEPLOY_VERCEL.md** in your repo for more deployment details
- 🐛 Check **Vercel Logs** (most detailed error info)
- 🔍 Enable **Prisma debug logging** by adding `log: ['query', 'error']` to PrismaClient in db.js
