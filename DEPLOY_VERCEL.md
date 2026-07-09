# Vercel Serverless Backend Deployment Guide

Since you are only using **Neon** (for database) and **Brevo** (for emails), you do not need Railway or any separate server hosting. The Express backend has been configured to deploy and run directly on **Vercel** as Serverless Functions.

---

## 🛠️ Step 1: Add Environment Variables on Vercel

1. Go to your **Vercel Dashboard** and click on your project `ai-os-powerd-by-ar-labs`.
2. Go to **Settings** → **Environment Variables**.
3. Add the following environment variables (make sure to select all environments: Production, Preview, Development):

| Variable Key | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:...` | Your Neon database connection string |
| `JWT_SECRET` | `58198327e33d8ce0bc30d675062c6964` | A secure random string for signing login tokens |
| `BREVO_API_KEY` | `xkeysib-...` | Your Brevo SMTP API key |
| `EMAIL_FROM` | `arproduction050@gmail.com` | Verified sender email in Brevo |
| `EMAIL_FROM_NAME` | `AI-OS` | Sender display name |
| `FRONTEND_URL` | `https://ai-os-powerd-by-ar-labs.vercel.app` | Your Vercel frontend URL |
| `RAZORPAY_KEY_ID` | `rzp_test_T4Mr1D3RBNpiEi` | Razorpay public key (or live key) |
| `RAZORPAY_SECRET_KEY` | `S27ABLaRbJzgBUJSrnlhx2DC` | Razorpay secret key (or live key) |
| `COUPON_CODES` | `VIP2026` | Comma-separated list of active promo codes |

---

## 🚀 Step 2: Redeploy on Vercel

Since the configurations have been pushed to GitHub:
1. Vercel will automatically start a new build.
2. If it is already built, go to your Vercel Project → **Deployments** tab, click the latest deployment, and click **Redeploy** to ensure the new environment variables are loaded.

---

## ⚡ Why This is Better:
- **No CORS Issues**: The frontend and backend run on the exact same domain (`/api/*` routing), eliminating CORS preflight errors completely.
- **No Cookie Blocks**: Browsers natively allow same-origin HttpOnly cookies without requiring complex cross-site `SameSite=None` attributes.
- **Zero Cost Hosting**: Vercel Serverless Functions are free and scale automatically.
