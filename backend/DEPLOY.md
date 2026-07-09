# Railway Deployment Guide — AI-OS Backend

## Step 1: Go to Railway
Visit https://railway.app and sign in.

## Step 2: Create New Project
Click **New Project** → **Deploy from GitHub Repo** → Select `AI-OS_by-Anuj`

## Step 3: Set Root Directory
When Railway asks for the root directory, set it to: `backend`

## Step 4: Set Environment Variables
In Railway dashboard → Your Service → **Variables** tab, add ALL of these:

```
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://your_db_user:your_db_password@your_db_host/your_db_name?sslmode=require
JWT_SECRET=your_jwt_secret_here
BREVO_API_KEY=your_brevo_api_key_here
EMAIL_FROM=arproduction050@gmail.com
EMAIL_FROM_NAME=AI-OS
FRONTEND_URL=https://ai-os-powerd-by-ar-labs.vercel.app
CORS_ALLOWED_ORIGINS=https://ai-os-powerd-by-ar-labs.vercel.app
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_SECRET_KEY=your_razorpay_secret_key_here
COUPON_CODES=VIP2026
```

## Step 5: Deploy
Click **Deploy** — Railway will run `npm install` then `npx prisma generate` then start with `node src/server.js`

## Step 6: Get Your Backend URL
After deploy succeeds, Railway shows a URL like:
`https://ai-os-backend-production.up.railway.app`

## Step 7: Update Frontend
Copy that URL and update TWO files in the repo:

### index.html (line ~13):
```html
<meta name="api-base-url" content="YOUR_RAILWAY_URL_HERE">
```

### aios_buisness.html (line ~18):
```html
<meta name="api-base-url" content="YOUR_RAILWAY_URL_HERE">
```

Also update index.html meta:
```html
<meta name="razorpay-key-id" content="rzp_test_T4Mr1D3RBNpiEi">
```

## Step 8: Verify
Test the health endpoint: `https://YOUR_RAILWAY_URL/health`
Should return: `{"status":"ok","timestamp":"..."}`

Test the ready endpoint: `https://YOUR_RAILWAY_URL/ready`
Should return: `{"status":"ready","database":"connected"}`

## Troubleshooting
- **"Cannot find module @prisma/client"**: Railway didn't run `prisma generate`. Add env var `NIXPACKS_BUILD_CMD=npm install && npx prisma generate`
- **"Failed to fetch" on frontend**: The Railway URL in the meta tag is wrong. Double-check step 7.
- **Login works but session lost on refresh**: `NODE_ENV` is not set to `production`. Cookies won't be `SameSite=None`.
- **CORS error in console**: The frontend origin isn't in the CORS list. Add it to `CORS_ALLOWED_ORIGINS` env var.
