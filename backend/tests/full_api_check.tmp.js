// Temporary comprehensive API check (deleted after run)
require('dotenv').config();
const crypto = require('crypto');
const prisma = require('../src/lib/db');
const BASE = 'http://localhost:8080';

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}${extra ? ' -- ' + JSON.stringify(extra) : ''}`); }
}

async function api(path, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  return { status: res.status, data, setCookie: res.headers.get('set-cookie') };
}

async function run() {
  const ts = Date.now();
  const email = `apicheck_${ts}@aios.com`;
  const password = 'SecretPassword123';

  // --- Signup / OTP flow ---
  let r = await api('/api/auth/signup', { method: 'POST', body: { email, password } });
  check('signup returns 200/201', r.status === 200 || r.status === 201, r);

  // duplicate signup
  r = await api('/api/auth/signup', { method: 'POST', body: { email, password } });
  check('duplicate signup rejected (4xx)', r.status >= 400 && r.status < 500, r);

  // resend otp (before verification — should succeed)
  r = await api('/api/auth/resend-otp', { method: 'POST', body: { email } });
  check('resend-otp works pre-verification', r.status === 200, r);

  // wrong otp
  r = await api('/api/auth/verify-otp', { method: 'POST', body: { email, otp: '000000' } });
  check('wrong OTP rejected', r.status >= 400, r);

  // NOTE: login auto-verifies unverified users on correct password (by design),
  // so it intentionally is NOT tested as a rejection path here.

  // right otp from DB
  const dbUser = await prisma.user.findUnique({ where: { email }, include: { emailVerifications: { orderBy: { createdAt: 'desc' } } } });
  const otp = dbUser.emailVerifications[0].code;
  r = await api('/api/auth/verify-otp', { method: 'POST', body: { email, otp } });
  check('correct OTP verifies + sets cookie', r.status === 200 && !!r.setCookie, r);
  let cookie = r.setCookie ? r.setCookie.split(';')[0] : '';

  // resend/verify again after already verified — should be rejected
  r = await api('/api/auth/resend-otp', { method: 'POST', body: { email } });
  check('resend-otp rejected post-verification', r.status === 400, r);

  // --- Login / me / logout ---
  r = await api('/api/auth/login', { method: 'POST', body: { email, password: 'WrongPass123' } });
  check('wrong password rejected 401', r.status === 401, r);

  r = await api('/api/auth/login', { method: 'POST', body: { email, password } });
  check('login works + cookie', r.status === 200 && !!r.setCookie, r);
  cookie = r.setCookie.split(';')[0];

  r = await api('/api/auth/me', { cookie });
  check('GET /me returns user with subscription', r.status === 200 && r.data?.user?.subscription?.plan === 'Trial', r.data);

  r = await api('/api/auth/me');
  check('GET /me without cookie is 401', r.status === 401, r);

  // update profile
  r = await api('/api/auth/update-profile', { method: 'POST', cookie, body: { fullName: 'API Check User' } });
  check('update-profile works', r.status === 200, r);

  // --- Strategist (Trial plan should be allowed) ---
  r = await api('/api/strategist/compile', { method: 'POST', cookie, body: { businessName: 'Acme SaaS', targetAudience: 'Teachers', bottleneck: 'Low lead volume' } });
  check('strategist compile (Trial allowed)', r.status === 200, r);

  r = await api('/api/strategist/chat', { method: 'POST', cookie, body: { userInput: 'hi' } });
  check('strategist chat (Trial allowed)', r.status === 200 && r.data?.quota, r);

  // --- Progress / bookmarks / notifications / support ---
  r = await api('/api/videos/progress', { method: 'POST', cookie, body: { videoFilename: 'test_eng.mp4', progressSeconds: 12.5, isCompleted: false } });
  check('save video progress', r.status === 200, r);

  r = await api('/api/videos/progress', { cookie });
  check('get video progress', r.status === 200, r);

  r = await api('/api/progress/business', { method: 'POST', cookie, body: { stepKey: 'module1_step1', isUnlocked: true, progressPercentage: 50 } });
  check('save business progress', r.status === 200 || r.status === 201, { status: r.status, data: r.data });

  r = await api('/api/progress/business', { cookie });
  check('get business progress', r.status === 200, r);

  r = await api('/api/bookmarks', { method: 'POST', cookie, body: { toolId: 'TOOL_009' } });
  check('toggle bookmark on', (r.status === 200 || r.status === 201) && r.data?.bookmarked === true, r);
  r = await api('/api/bookmarks', { method: 'POST', cookie, body: { toolId: 'TOOL_009' } });
  check('toggle bookmark off', r.status === 200 && r.data?.bookmarked === false, r);
  r = await api('/api/bookmarks', { cookie });
  check('get bookmarks', r.status === 200, r);

  r = await api('/api/notifications', { cookie });
  check('get notifications', r.status === 200, r);
  const notifs = r.data?.notifications || [];
  if (notifs.length) {
    r = await api(`/api/notifications/${notifs[0].id}/read`, { method: 'POST', cookie });
    check('mark notification read', r.status === 200, r);
  }

  r = await api('/api/support/ticket', { method: 'POST', cookie, body: { subject: 'API check ticket', message: 'testing support flow', category: 'General' } });
  check('create support ticket', r.status === 200 || r.status === 201, { status: r.status, data: r.data });

  // --- Forgot / reset password ---
  r = await api('/api/auth/forgot-password', { method: 'POST', body: { email } });
  check('forgot-password accepts', r.status === 200, r);

  // Controller only persists a SHA-256 hash of the raw token (never the raw
  // value), so the raw token can't be recovered from the DB. Mint our own
  // token/hash pair and insert it directly to exercise reset-password deterministically.
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await prisma.passwordReset.create({
    data: { userId: dbUser.id, resetToken: tokenHash, expiresAt: new Date(Date.now() + 3600000) }
  });
  const newPassword = 'NewSecret12345';
  r = await api('/api/auth/reset-password', { method: 'POST', body: { token: rawToken, password: newPassword } });
  check('reset-password works', r.status === 200, r);
  r = await api('/api/auth/login', { method: 'POST', body: { email, password: newPassword } });
  check('login with new password', r.status === 200, r);
  if (r.setCookie) cookie = r.setCookie.split(';')[0];

  // --- Quota: Free plan blocked from strategist ---
  await prisma.subscription.update({ where: { userId: dbUser.id }, data: { plan: 'Free', status: 'Active', currentPeriodEnd: new Date(Date.now() + 86400000) } });
  r = await api('/api/strategist/chat', { method: 'POST', cookie, body: { userInput: 'hi' } });
  check('Free plan blocked from strategist (403)', r.status === 403, r);
  await prisma.subscription.update({ where: { userId: dbUser.id }, data: { plan: 'Trial', status: 'Active' } });

  // --- Admin endpoints as non-admin then admin ---
  r = await api('/api/admin/users', { cookie });
  check('non-admin blocked from admin users (403)', r.status === 403, r);

  await prisma.user.update({ where: { id: dbUser.id }, data: { role: 'Admin' } });
  r = await api('/api/admin/stats', { cookie });
  check('admin stats', r.status === 200 && r.data?.stats, r);
  r = await api('/api/admin/users?page=1&limit=5', { cookie });
  check('admin users list', r.status === 200, r);
  r = await api('/api/admin/payments', { cookie });
  check('admin payments', r.status === 200, r);
  r = await api('/api/admin/audit', { cookie });
  check('admin audit logs', r.status === 200, r);
  r = await api('/api/admin/health', { cookie });
  check('admin health', r.status === 200, r);
  r = await api('/api/admin/tickets', { cookie });
  check('admin tickets', r.status === 200, r);
  const tickets = r.data?.tickets || [];
  if (tickets.length) {
    r = await api('/api/admin/tickets/status', { method: 'POST', cookie, body: { ticketId: tickets[0].id, status: 'Closed' } });
    check('admin update ticket status', r.status === 200, { status: r.status, data: r.data });
  }
  r = await api('/api/admin/users/plan', { method: 'POST', cookie, body: { userId: dbUser.id, plan: 'Premium', durationDays: 30 } });
  check('admin set user plan', r.status === 200, { status: r.status, data: r.data });
  r = await api('/api/admin/users/suspend', { method: 'POST', cookie, body: { userId: dbUser.id, suspend: false } });
  check('admin suspend toggle', r.status === 200, { status: r.status, data: r.data });

  // --- Logout flows ---
  r = await api('/api/auth/logout', { method: 'POST', cookie });
  check('logout works', r.status === 200, r);
  r = await api('/api/auth/me', { cookie });
  check('cookie invalid after logout', r.status === 401, r);

  // login again then logout-all
  r = await api('/api/auth/login', { method: 'POST', body: { email, password: 'NewSecret12345' } });
  if (r.status !== 200) r = await api('/api/auth/login', { method: 'POST', body: { email, password } });
  cookie = r.setCookie ? r.setCookie.split(';')[0] : cookie;
  r = await api('/api/auth/logout-all', { method: 'POST', cookie });
  check('logout-all works', r.status === 200, r);
  r = await api('/api/auth/me', { cookie });
  check('session invalid after logout-all', r.status === 401, r);

  // --- Payment negative case: bad signature ---
  r = await api('/api/auth/login', { method: 'POST', body: { email, password: 'NewSecret12345' } });
  if (r.status !== 200) r = await api('/api/auth/login', { method: 'POST', body: { email, password } });
  cookie = r.setCookie ? r.setCookie.split(';')[0] : cookie;
  r = await api('/api/payments/checkout', { method: 'POST', cookie, body: { planType: 'Premium' } });
  const orderId = r.data?.orderId;
  check('checkout creates order', r.status === 200 && !!orderId, r);
  if (orderId) {
    r = await api('/api/payments/verify', { method: 'POST', cookie, body: { razorpay_order_id: orderId, razorpay_payment_id: 'pay_fake123', razorpay_signature: 'deadbeef' } });
    check('bad payment signature rejected 400', r.status === 400, r);
  }
  r = await api('/api/payments/checkout', { method: 'POST', cookie, body: { planType: 'Enterprise' } });
  check('invalid planType rejected 400', r.status === 400, r);
  r = await api('/api/payments/coupon', { method: 'POST', cookie, body: { couponCode: 'NOTREAL' } });
  check('invalid coupon rejected 400', r.status === 400, r);

  console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
