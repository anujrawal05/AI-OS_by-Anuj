# AI-OS Deployment Guide

## Backend URL Configuration

Your application supports flexible backend configuration for different deployment scenarios.

### Development Setup

1. **Start Backend Locally**
   ```bash
   cd backend
   npm install
   npm start  # Runs on http://localhost:8080
   ```

2. **Run Frontend**
   ```bash
   npm install
   npm start  # Frontend auto-detects localhost:8080
   ```

### Production Deployment

#### Option 1: Deploy to Railway (Recommended for Node.js backends)
1. Push code to GitHub
2. Connect to Railway: https://railway.app
3. Create new project → GitHub repo
4. Railway auto-detects Node.js backend
5. Set environment variables in Railway dashboard
6. Copy backend URL from Railway (e.g., `https://api-myapp-production.up.railway.app`)
7. Go to Vercel → Settings → Environment Variables
8. Add: `REACT_APP_BACKEND_URL=https://api-myapp-production.up.railway.app`
9. Redeploy frontend on Vercel

#### Option 2: Deploy to Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo
4. Set environment variables
5. Render generates URL
6. Add to Vercel environment variables (same as above)

#### Option 3: Deploy to Heroku (legacy)
1. Push to GitHub
2. Connect Heroku to GitHub
3. Deploy backend service
4. Heroku generates URL
5. Add to Vercel environment variables

### Configuration Priority (Auto-detection order)

1. **Meta tag** (injected at build time)
   ```html
   <meta name="backend-url" content="https://api.example.com">
   ```

2. **Environment variable** (Vercel dashboard)
   ```
   REACT_APP_BACKEND_URL=https://api.example.com
   ```

3. **Development auto-detection**
   - If running on `localhost` → Uses `http://localhost:8080`

4. **Graceful offline mode**
   - Shows user-friendly error if no backend URL found
   - Does not crash the application

### Environment Variables for Vercel

Add these to Vercel Dashboard → Project Settings → Environment Variables:

```
REACT_APP_BACKEND_URL=https://your-backend-url.com
BACKEND_URL=https://your-backend-url.com
```

### Backend Health Check

The system automatically checks if backend is available via:
```
GET {BACKEND_URL}/health
```

If backend doesn't respond, the app shows a helpful error message.

### CORS Configuration

Your backend must allow requests from your frontend domain.

**Express.js Example:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://ai-os-powerd-by-ar-labs.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

### Testing Backend Connection

1. Check browser console for messages:
   - `✓ Backend URL from meta tag: ...`
   - `✓ Backend URL from env: ...`
   - `⚠️ Backend URL not configured...`

2. Network tab: Look for backend API requests
   - Should show requests to your backend URL
   - Check response status codes

3. Open DevTools → Console for detailed logs

### Troubleshooting

**Problem: "Backend unavailable or network error"**
- ✓ Backend is running and accessible?
- ✓ REACT_APP_BACKEND_URL is set in Vercel?
- ✓ Backend CORS allows frontend domain?
- ✓ No typos in backend URL?

**Problem: CORS errors in browser**
- Add frontend domain to backend CORS whitelist
- Use `credentials: true` in both frontend and backend CORS config

**Problem: 404 on backend endpoints**
- Check if backend is actually deployed
- Verify endpoint paths match between frontend and backend
- Check backend server logs for errors

### Production Checklist

- [ ] Backend deployed to Railway/Render/Heroku
- [ ] Backend health check passing (`/health` endpoint)
- [ ] `REACT_APP_BACKEND_URL` set in Vercel
- [ ] Backend CORS configured with frontend domain
- [ ] SSL/HTTPS enabled on both frontend and backend
- [ ] Environment variables secured (never in code)
- [ ] Database migrations run (if applicable)
- [ ] Logging/monitoring configured
- [ ] Tested API calls from production frontend

### Monitoring & Logs

**Vercel Logs:**
- https://vercel.com → Project → Deployments → Logs

**Backend Logs (Railway):**
- https://railway.app → Project → Deployments → Logs

**Error Tracking:**
- Add Sentry DSN to environment variables for error tracking

---

**Next Step:** Deploy backend to Railway/Render, then set `REACT_APP_BACKEND_URL` in Vercel!
