# AI-OS Website Audit
**Site:** https://ai-os-powerd-by-ar-labs.vercel.app
**Date:** 7 Jul 2026

---

## 🔴 Critical Issue: Login returns HTTP 500 — ROOT CAUSE FOUND

Your login error is not isolated to login. I tested every API route on the site directly, and **every single `/api/*` endpoint returns `500 FUNCTION_INVOCATION_FAILED`** — including a URL that doesn't even exist (`/api/this-route-does-not-exist-xyz`) and a GET request to `/api/auth/login` with the wrong HTTP method.

Test results:
| Endpoint | Method | Status | Response |
|---|---|---|---|
| `/api/auth/login` | POST | 500 | `FUNCTION_INVOCATION_FAILED` |
| `/api/auth/signup` | POST | 500 | `FUNCTION_INVOCATION_FAILED` |
| `/api/auth/session`, `/api/auth/me` | GET | 500 | `FUNCTION_INVOCATION_FAILED` |
| `/api/health`, `/api/status`, `/api/dashboard`, `/api/roadmaps`, `/api/tools`, `/api/user/me` | GET | 500 | `FUNCTION_INVOCATION_FAILED` |
| `/api/does-not-exist` (fake route) | GET | 500 | `FUNCTION_INVOCATION_FAILED` |

**Why this matters:** `FUNCTION_INVOCATION_FAILED` is Vercel's generic error meaning the serverless function **crashed before it could even run your route logic** — this happens at cold start, at the top level of the code, before your `login`/`signup`/etc. handlers execute. Since *every* API route fails identically (even a nonexistent one), the crash is happening in shared code that all API functions load — not in the login logic itself.

### Most likely causes (in order of probability)
1. **Missing or misconfigured environment variable(s) in Vercel's Production settings** — e.g. `DATABASE_URL`, `MONGODB_URI`, `JWT_SECRET`, `NEXTAUTH_SECRET`. A common mistake is setting env vars only for "Preview"/"Development" and forgetting "Production" in Vercel → Project → Settings → Environment Variables.
2. **A shared `lib/db.js` (or similar) file throws at import time** — e.g. `new PrismaClient()`, a `mongoose.connect()` call, or `new URL(process.env.DATABASE_URL)` executed at module scope. If the env var is `undefined`, this throws immediately and crashes every function that imports it (which is all of them, since Next.js API routes typically share this import).
3. **Database itself is unreachable from Vercel** — e.g. your DB host (Supabase/Neon/Mongo Atlas/etc.) IP allow-list doesn't include Vercel's dynamic serverless IPs, or the DB project is paused/sleeping (common on free tiers).
4. **A broken dependency/build artifact** — e.g. a native Node module (bcrypt, etc.) not compatible with Vercel's Node runtime, or a stale build that didn't rebuild after a `package.json` change.
5. **Prisma-specific:** if using Prisma, forgetting to run `prisma generate` in the Vercel build step (missing `postinstall` script) will crash any function that imports the Prisma client.

### How to confirm & fix (do this first — takes 5 minutes)
1. Go to your **Vercel Dashboard → your project → Deployments → (latest) → Functions/Logs tab**, or run `vercel logs <deployment-url>` if you have the CLI. Trigger the login once more, then look at the real-time function log — it will show the exact stack trace and error message (e.g. "DATABASE_URL is not defined" or a connection timeout). This will tell us the exact culprit in under a minute.
2. Go to **Project → Settings → Environment Variables** and confirm every variable your backend needs is present **and checked for "Production"** (not just Preview/Development).
3. If you use a database, confirm it's not paused/sleeping and that Vercel's IPs are allow-listed (or allow-list is set to "allow all" if using a serverless-friendly DB like Neon/Supabase/PlanetScale).
4. If you use Prisma: confirm `package.json` has `"postinstall": "prisma generate"` (or it's in the Vercel build command), and that `DATABASE_URL` is valid in Production.
5. Redeploy after fixing, then retest with: `curl -i https://ai-os-powerd-by-ar-labs.vercel.app/api/health` (or any simple API route) — it should return 200, not 500.

**If you share the Vercel function log output (or grant me access to your Vercel/GitHub account as a connection), I can pinpoint the exact line and fix the code directly instead of guessing between these 5 causes.**

---

## Other Findings

### SEO / Discoverability
- ❌ **`robots.txt` missing** (404) — search engines have no crawl guidance.
- ❌ **`sitemap.xml` missing** (404) — hurts indexing of pages like Roadmaps, Explore Tools, Categories.
- ❌ **No canonical URL tag** on the homepage.
- ⚠️ **No `<h1>` on the homepage** — hurts SEO structure and accessibility; search engines and screen readers rely on a clear H1.
- ✅ Title tag and meta description are present and reasonable.
- ✅ Open Graph title tag present (worth expanding to include `og:description`, `og:image`, `twitter:card` for better link previews on social/WhatsApp shares).

### Security Headers
Checked response headers on the homepage:
- ✅ `Strict-Transport-Security` present (good, enforces HTTPS).
- ❌ **`Content-Security-Policy` missing** — leaves you more exposed to XSS/injection attacks.
- ❌ **`X-Frame-Options` missing** — site can be embedded in an iframe on another domain (clickjacking risk), especially risky given you have a login form.
- ❌ **`X-Content-Type-Options: nosniff` missing**.
- ❌ **`Referrer-Policy` missing**.
- ❌ **`Permissions-Policy` missing**.

These are quick wins — typically a few lines in `next.config.js` (`headers()` function) or a `vercel.json` `headers` block.

### Reliability / Error Handling
- The raw Vercel crash page (`FUNCTION_INVOCATION_FAILED`) is shown directly to users/API consumers instead of a friendly error message. Once the root cause above is fixed, still wrap API handlers in try/catch to return clean JSON errors (e.g. `{ error: "Something went wrong, please try again." }` with status 500) rather than exposing a raw platform crash trace.
- No visible `/api/health` endpoint working — recommended once fixed, keep a lightweight health check for future monitoring/uptime alerts.

---

## 📋 Implementation Plan (Prioritized)

### P0 — Do immediately (site is effectively non-functional for logged-in features)
1. **Diagnose & fix the 500 on all API routes.**
   - Pull Vercel function logs for the failing invocation to get the exact error/stack trace.
   - Verify all required environment variables exist and are enabled for "Production" in Vercel settings.
   - Verify the database is reachable (not paused, correct connection string, IP allow-list correct).
   - If using Prisma, verify `prisma generate` runs on build.
   - Redeploy and confirm `/api/health` (or any API route) returns 200.
2. **Add error handling** in API routes so future failures return clean JSON, not a raw platform crash page.

### P1 — This week
3. Add security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) via `next.config.js` or `vercel.json`.
4. Add `robots.txt` and `sitemap.xml`.
5. Add a canonical `<link>` tag and an `<h1>` to the homepage for SEO/accessibility.

### P2 — Nice to have / polish
6. Expand Open Graph/Twitter card meta tags (`og:description`, `og:image`, `twitter:card`) for better link-sharing previews.
7. Set up basic uptime monitoring (e.g. a scheduled check hitting `/api/health`) so future outages like this are caught proactively rather than discovered by users trying to log in.

---

## Next Step
The fastest path to actually *fixing* (not just diagnosing) the 500 error is to see the real server-side stack trace. Two options:
- **You paste me the Vercel function log** for the failing request, or
- **Grant me a connection to your Vercel/GitHub account**, and I'll pull the logs and source directly and apply the fix.
