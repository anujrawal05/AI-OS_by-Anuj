# 🐛 AI-OS Bug Report
**Website:** https://ai-os-powerd-by-ar-labs.vercel.app  
**Audited:** July 4, 2026

---

## 🔴 CRITICAL — Backend Not Connected

### BUG-001: Backend API returns 404 on all `/api/*` routes
- **Where:** Every backend API call (login, signup, `/api/auth/me`, etc.)
- **Cause:** The `<meta name="api-base-url" content="">` in `index.html` is **blank/empty**. No backend URL is configured.
- **Effect:** The site runs in guest-only mode. Login, signup, premium upgrades, coupon redemption, OTP verification — ALL fail silently or show "Backend not connected" banner.
- **Also:** The `BACKEND_URL=` in `backend/.env` is blank too — password-reset links will point to `http://localhost:8080` instead of the real backend URL.

---

## 🔴 CRITICAL — Login & Auth Issues

### BUG-002: Sign In does nothing when backend is not set
- **Where:** Auth modal → "Sign In" button
- **Cause:** `apiCall('/api/auth/login')` calls a relative URL which hits Vercel static server (404). Error is silently caught and swallowed (`if (err.message === 'No backend') return;`).
- **Effect:** User clicks Sign In, nothing happens. No error message shown.

### BUG-003: Sign Up / Register does nothing
- **Where:** Auth modal → "Sign Up" button
- **Same cause as BUG-002** — `apiCall('/api/auth/signup')` hits 404.

### BUG-004: OTP Verification broken
- **Where:** After signup → OTP screen
- **Cause:** `/api/auth/verify-otp` is unreachable (no backend URL).
- **Effect:** OTP entry screen appears but "Verify OTP" button fails silently.

### BUG-005: No "Resend OTP" button in the UI
- **Where:** OTP verification screen
- **Cause:** The backend has a `resendOtp` endpoint (`/api/auth/resend-otp`) but there is **no Resend OTP button** in the HTML OTP section. Users who don't receive the email are stuck permanently.

### BUG-006: Forgot Password broken — reset link points to localhost
- **Where:** Auth modal → "Forgot Password?" → sends email
- **Cause:** In `backend/.env`, `FRONTEND_URL=` is blank, so the reset link in the email becomes `http://localhost:8080/?action=reset-password&token=...` — a localhost URL sent to production users.
- **Effect:** Password reset emails are sent but the link is **completely useless** in production.

### BUG-007: JWT Secret is hardcoded in source code
- **Where:** `backend/src/controllers/authController.js` line 17 and `backend/src/middleware/authMiddleware.js` line 4
- **Code:** `const JWT_SECRET = process.env.JWT_SECRET || '58198327e33d8ce0bc30d675062c6964';`
- **Risk:** The fallback hardcoded secret is now committed to GitHub — anyone can forge JWT tokens.

### BUG-008: Razorpay Test Keys exposed in source code
- **Where:** `backend/src/controllers/paymentController.js` lines 8–9
- **Code:** `const RAZORPAY_SECRET_KEY = process.env.RAZORPAY_SECRET_KEY || 'S27ABLaRbJzgBUJSrnlhx2DC';`
- **Risk:** Live Razorpay secret key hardcoded and committed to GitHub — major security vulnerability.

### BUG-009: Database credentials exposed in .env committed to GitHub
- **Where:** `backend/.env` line 4
- **Contains:** Full Neon PostgreSQL connection string with username + password (npg_pzs9rGjP3Diy), committed to the public repo.
- **Also:** Brevo API key and email credentials also committed.

### BUG-010: Session cookie `SameSite=None` + `Secure` only works if backend is HTTPS
- **Where:** `backend/src/controllers/authController.js` `setSessionCookie()`
- **Cause:** `NODE_ENV` in `.env` is still set to `development`, so cookies are sent with `SameSite=Lax` even in production, which **blocks cross-origin cookie sending** (Vercel frontend → Railway backend).
- **Effect:** Even if backend URL is set, login cookies will not be sent with subsequent API calls — users will be logged out on every refresh.

### BUG-011: `auth-form-signin` / `auth-form-signup` elements referenced but don't exist in HTML
- **Where:** `modules/auth.js` → `switchAuthTab()` function (lines 153–169)
- **Code:** `document.getElementById('auth-form-signin')` and `document.getElementById('auth-form-signup')`
- **Cause:** The HTML only has a single unified form. These IDs don't exist in `index.html`.
- **Effect:** `switchAuthTab()` silently returns early — tab switching is broken.

### BUG-012: Auth modal toggle mode bug — "forgot" mode not reset when reopening
- **Where:** Auth modal
- **Cause:** `authMode` variable persists in memory. If user opened "Forgot Password" and closed the modal, reopening it shows "Reset Password" instead of "Sign In".
- **Effect:** Users trying to sign in see the wrong form.

---

## 🟠 HIGH — Payment Issues

### BUG-013: Razorpay using TEST keys (`rzp_test_*`) in production
- **Where:** `modules/auth.js` line 674 and `paymentController.js` line 8
- **Code:** `key: 'rzp_test_T4Mr1D3RBNpiEi'`
- **Effect:** Real payments go through test mode — money is NOT collected. Users paying ₹999 will get confirmation but no actual charge happens.

### BUG-014: Premium upgrade crashes if subscription record is missing
- **Where:** `backend/src/controllers/paymentController.js` `createOrder()` lines 39–45
- **Cause:** If `prisma.subscription.findUnique()` returns null, it sends 404 back. But the Razorpay flow on the frontend doesn't handle this error gracefully — the payment modal never opens, no message is shown.

### BUG-015: Coupon code is hardcoded — only `VIP2026` works
- **Where:** `paymentController.js` line 204
- **Code:** `if (code !== 'VIP2026') return 400`
- **Effect:** No coupon management system. Expired/rotated coupons require a full code redeploy.

---

## 🟠 HIGH — Meta / SEO Issues

### BUG-016: OG and Twitter URLs point to GitHub Pages (wrong domain)
- **Where:** `index.html` lines 34, 37, 45, 48
- **Code:** `content="https://anujrawal05.github.io/AI-OS_by-Anuj/"` on all OG/Twitter tags
- **Effect:** Social media shares (WhatsApp, Twitter, LinkedIn) show the old GitHub Pages URL, not the Vercel domain.

### BUG-017: `og:image` points to GitHub Pages — may break on Vercel
- **Where:** `index.html` lines 37, 48
- **Effect:** Open Graph preview image is served from a different domain — may not render correctly in link previews.

---

## 🟡 MEDIUM — UI / Frontend Bugs

### BUG-018: "Explore Business" banner button has no click handler
- **Where:** Homepage → "AI-OS Business" banner at bottom of dashboard controls
- **Code:** `<button class="btn-banner-cta">Explore Business</button>` — no `onclick`, no event listener attached
- **Effect:** Button is completely non-functional.

### BUG-019: `btn-hero-upgrade-cta` referenced but element doesn't exist in `index.html`
- **Where:** `modules/auth.js` line 40 — `document.getElementById('btn-hero-upgrade-cta')`
- **Effect:** Silent null reference. No crash, but hero upgrade CTA state is never updated.

### BUG-020: Profile modal elements assumed to exist — crash if not rendered
- **Where:** `modules/auth.js` `showProfileModal()` lines 512–516
- **Code:** Direct `.value` assignments on `document.getElementById('pf-email')` etc. without null checks
- **Effect:** If the profile modal HTML is not present/loaded, calling `showProfileModal()` throws a TypeError.

### BUG-021: `pf-mobile-theme-toggle` referenced but may not exist
- **Where:** `modules/auth.js` line 536
- **Effect:** `querySelector` returns null silently, but this indicates the mobile profile settings section is incomplete.

### BUG-022: No name field in signup form
- **Where:** Auth modal → Sign Up
- **Cause:** Signup only takes `email` + `password`, but the onboarding modal (shown after OTP verification) requires full name, DOB, gender, profession.
- **Effect:** New users must complete an extra mandatory step that feels disconnected and surprising.

### BUG-023: Onboarding modal has no way to skip
- **Where:** Post-signup onboarding modal (`showOnboardingModal`)
- **Code:** `const closeBtn = overlay.querySelector('.auth-modal-close-btn'); if (closeBtn) closeBtn.style.display = 'none';`
- **Effect:** Close button is deliberately hidden — users are **locked into the modal** with no escape if the API call fails.

### BUG-024: `syncBookmarksFromBackend` called but may not exist
- **Where:** `modules/auth.js` lines 249, 376, 494
- **Code:** `if (window.syncBookmarksFromBackend) window.syncBookmarksFromBackend();`
- **Effect:** This relies on a global function that may or may not be registered. If the bookmarks module loads after auth, it silently fails.

---

## 🟡 MEDIUM — Backend API Issues

### BUG-025: `/api/auth/me` returns 401 with no session but the frontend expects 200
- **Where:** `modules/auth.js` `initAuthSystem()` line 761
- **Cause:** On page load, `apiCall('/api/auth/me')` is called. If no session exists, backend returns 401. Frontend catches this and sets `state.user = null` — correct. BUT if backend is unreachable (404 from Vercel), `apiClient` likely throws "No backend" which also results in `state.user = null`. The distinction between "no backend" and "not logged in" is handled in the same catch block.

### BUG-026: `withBatchTransaction` in login uses factory function but not always consistent
- **Where:** `backend/src/lib/db.js` `withBatchTransaction()` and `authController.js` login line 375
- **Cause:** `withBatchTransaction` expects a function returning a fresh array on every retry, but the session create + user update in login passes a lambda correctly. However, if any retry occurs, the `sessionToken` is reused from the same outer scope — not regenerated — creating potential duplicate session tokens on retry.

### BUG-027: `progressRoutes` mounted at `/api` (no prefix)
- **Where:** `backend/src/app.js` line 53
- **Code:** `app.use('/api', progressRoutes);`
- **Effect:** Progress routes have no sub-prefix, which means any route defined in `progressRoutes` could accidentally shadow other `/api` routes or collide with them.

### BUG-028: No rate limiting on login endpoint
- **Where:** `backend/src/controllers/authController.js` login function
- **Cause:** Account lockout exists after `MAX_FAILED_LOGIN_ATTEMPTS` failures, but there is **no IP-level rate limiting** middleware (e.g., `express-rate-limit`) on the login endpoint.
- **Effect:** Brute-force across multiple accounts from the same IP is unblocked.

### BUG-029: `NODE_ENV=development` in `.env` will be used if not overridden in deployment
- **Where:** `backend/.env` line 2
- **Effect:** If the deployment platform doesn't explicitly set `NODE_ENV=production`, all production safety checks (`SameSite=None`, `secure` cookies, etc.) will be skipped.

---

## 🔵 LOW — Minor Issues

### BUG-030: Service Worker (`sw.js`) may cache stale API responses
- **Where:** `sw.js`
- **Risk:** If the SW caches any `/api/*` responses, stale data could be served to logged-out users.

### BUG-031: `mobile.css` loaded for all users, but only applies `<=767px`
- **Where:** `index.html` line 56 — `media="(max-width: 767px)"`
- **Note:** This is correct behavior but the file is always downloaded; it's just not applied. Minor bandwidth waste on desktop.

### BUG-032: `monthly tips and tricks.html` has a space in its filename
- **Where:** Root directory: `monthly tips and tricks.html`
- **Effect:** URL `https://...vercel.app/monthly tips and tricks.html` will need to be percent-encoded as `monthly%20tips%20and%20tricks.html`. Direct links without encoding will fail on some browsers/servers.

### BUG-033: Footer product links still point to GitHub Pages (`anujrawal05.github.io`)
- **Where:** `index.html` footer lines 559–562
- **Effect:** Clicking "AI-OS" in footer sends users to old GitHub Pages URL instead of the current Vercel deployment.

---

## Summary Table

| # | Severity | Category | Issue |
|---|----------|----------|-------|
| 001 | 🔴 Critical | Backend | Backend URL not configured — all API calls fail |
| 002 | 🔴 Critical | Login | Sign In does nothing |
| 003 | 🔴 Critical | Auth | Sign Up does nothing |
| 004 | 🔴 Critical | Auth | OTP verification broken |
| 005 | 🔴 Critical | Auth | No Resend OTP button |
| 006 | 🔴 Critical | Auth | Forgot Password sends localhost link |
| 007 | 🔴 Critical | Security | JWT secret hardcoded in public GitHub repo |
| 008 | 🔴 Critical | Security | Razorpay secret key hardcoded in public GitHub repo |
| 009 | 🔴 Critical | Security | DB credentials in .env committed to GitHub |
| 010 | 🔴 Critical | Auth | Cookie SameSite blocks cross-origin login |
| 011 | 🟠 High | Auth | Auth tab switch elements missing from HTML |
| 012 | 🟠 High | Auth | Auth mode not reset on modal re-open |
| 013 | 🟠 High | Payment | Razorpay in test mode in production |
| 014 | 🟠 High | Payment | No graceful error on missing subscription |
| 015 | 🟠 High | Payment | Only 1 hardcoded coupon code |
| 016 | 🟠 High | SEO | OG/Twitter URLs point to wrong domain |
| 017 | 🟠 High | SEO | OG image on wrong domain |
| 018 | 🟡 Medium | UI | "Explore Business" button unclickable |
| 019 | 🟡 Medium | UI | Hero upgrade CTA element missing |
| 020 | 🟡 Medium | UI | Profile modal crashes without null checks |
| 021 | 🟡 Medium | UI | Mobile theme toggle element missing |
| 022 | 🟡 Medium | UX | No name field in signup — bad UX |
| 023 | 🟡 Medium | UX | Onboarding modal can't be closed |
| 024 | 🟡 Medium | Frontend | Bookmark sync relies on unregistered global |
| 025 | 🟡 Medium | Backend | `/api/auth/me` 401 vs no-backend not distinguished |
| 026 | 🟡 Medium | Backend | Session token reused on transaction retry |
| 027 | 🟡 Medium | Backend | Progress routes mounted with no sub-prefix |
| 028 | 🟡 Medium | Security | No IP-level rate limiting on login |
| 029 | 🟡 Medium | Backend | `NODE_ENV=development` may leak into production |
| 030 | 🔵 Low | PWA | Service worker may cache stale API data |
| 031 | 🔵 Low | Performance | mobile.css always downloaded even on desktop |
| 032 | 🔵 Low | URL | Filename with spaces breaks direct links |
| 033 | 🔵 Low | Links | Footer links point to old GitHub Pages domain |
