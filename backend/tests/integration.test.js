require('dotenv').config();
const crypto = require('crypto');
const prisma = require('../src/lib/db');

async function runTests() {
  const timestamp = Date.now();
  const testEmail = `v2_test_${timestamp}@aios.com`;
  const testPassword = "SecretPassword123";

  console.log(`[Test] Starting AI-OS v2 Features integration test. Email: ${testEmail}`);

  // 1. Signup & Verification to establish basic user session
  await fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });

  const dbUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { emailVerifications: true }
  });
  const otpCode = dbUser.emailVerifications[0].code;

  const verifyRes = await fetch('http://localhost:8080/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, otp: otpCode })
  });

  const verifyData = await verifyRes.json();
  const cookiesHeader = verifyRes.headers.get('set-cookie');
  const authCookie = cookiesHeader.split(';')[0];
  const userId = verifyData.user.id;
  console.log(`[Test] Session initialized for user ID: ${userId}`);

  // Verify that new user was granted one-time 3-day Premium Trial
  const subUser = await prisma.subscription.findUnique({ where: { userId } });
  console.log('[Test] Verify initial subscription state:', subUser);
  if (subUser.plan !== 'Trial' || subUser.status !== 'Active') {
    throw new Error("One-time Premium Trial was not granted to new user");
  }

  // 2. Test Passive Subscription Downgrade
  console.log('[Test] Setting subscription currentPeriodEnd into past to test passive downgrade...');
  await prisma.subscription.update({
    where: { userId },
    data: { currentPeriodEnd: new Date(Date.now() - 1000) } // 1s ago
  });

  const meRes = await fetch('http://localhost:8080/api/auth/me', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  const meData = await meRes.json();
  console.log('[Test] Profile query after expiry:', meData.user.subscription);
  if (meData.user.subscription.plan !== 'Free' || meData.user.subscription.status !== 'Expired') {
    throw new Error("Passive downgrade did not execute upon subscription expiry");
  }

  // 3. Test Coupon Redeeming
  console.log('[Test] Redeeming VIP2026 promo coupon...');
  const couponRes = await fetch('http://localhost:8080/api/payments/coupon', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ couponCode: 'VIP2026' })
  });
  const couponData = await couponRes.json();
  console.log('[Test] Coupon response:', couponData);
  if (couponData.plan_type !== 'Premium') {
    throw new Error("Coupon redemption failed to activate Premium subscription");
  }

  // 4. Test Razorpay order creation
  console.log('[Test] Requesting Razorpay checkout order...');
  const orderRes = await fetch('http://localhost:8080/api/payments/checkout', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ planType: 'Premium' }) // Defaults to Monthly (₹99)
  });
  const orderData = await orderRes.json();
  console.log('[Test] Razorpay Order response:', orderData);
  if (!orderRes.ok || !orderData.orderId || orderData.finalAmount !== 101.40) {
    throw new Error("Razorpay checkout order creation failed or amount is incorrect");
  }

  console.log('[Test] Requesting Razorpay checkout order for Yearly...');
  const orderResYearly = await fetch('http://localhost:8080/api/payments/checkout', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ planType: 'Premium', billingCycle: 'Yearly' })
  });
  const orderDataYearly = await orderResYearly.json();
  console.log('[Test] Razorpay Order (Yearly) response:', orderDataYearly);
  if (!orderResYearly.ok || !orderDataYearly.orderId || orderDataYearly.finalAmount !== 1023.15) {
    throw new Error("Razorpay yearly checkout order creation failed or amount is incorrect");
  }

  // 5. Test payment signature verification
  const orderId = orderData.orderId;
  const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
  const text = `${orderId}|${paymentId}`;
  const mockSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'S27ABLaRbJzgBUJSrnlhx2DC')
    .update(text)
    .digest('hex');

  console.log('[Test] Sending payment gateway verification payload...');
  const payVerifyRes = await fetch('http://localhost:8080/api/payments/verify', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: mockSignature
    })
  });
  const payVerifyData = await payVerifyRes.json();
  console.log('[Test] Payment Verification Response:', payVerifyData);
  if (!payVerifyRes.ok || payVerifyData.plan_type !== 'Premium') {
    throw new Error("Payment signature verification upgrade process failed");
  }

  // 6. Test daily usage quota limits and AI strategist chat
  console.log('[Test] Querying AI strategist chat...');
  const chatRes = await fetch('http://localhost:8080/api/strategist/chat', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput: 'What tools should I use for SaaS?' })
  });
  const chatData = await chatRes.json();
  console.log('[Test] AI chat response (with remaining quota):', chatData);
  if (!chatRes.ok || !chatData.quota) {
    throw new Error("AI strategist request or quota parsing failed");
  }

  // 7. Video Progress Tracking
  console.log('[Test] Saving video progress payload...');
  const progRes = await fetch('http://localhost:8080/api/videos/progress', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoFilename: 'AAA_eng.mp4', progressSeconds: 199.50, isCompleted: true })
  });
  const progData = await progRes.json();
  console.log('[Test] Save Video Progress response:', progData);
  if (!progRes.ok) throw new Error("Saving video progress failed");

  // 8. Bookmarks Toggle
  console.log('[Test] Bookmarking tool ID TOOL_002...');
  const bookmarkRes = await fetch('http://localhost:8080/api/bookmarks', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ toolId: 'TOOL_002' })
  });
  const bookmarkData = await bookmarkRes.json();
  console.log('[Test] Bookmark response:', bookmarkData);
  if (!bookmarkRes.ok) throw new Error("Toggling bookmark failed");

  console.log('\n🌟 [Test] AI-OS V2 FEATURES LIFECYCLE TESTS COMPLETED SUCCESSFULLY! 🌟');
  process.exit(0);
}

runTests().catch(err => {
  console.error('[Test Error] V2 Features integration tests failed:', err);
  process.exit(1);
});
