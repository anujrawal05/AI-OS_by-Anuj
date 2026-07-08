const crypto = require('crypto');
const prisma = require('../src/config/prisma');

async function testPayments() {
  const timestamp = Date.now();
  const testEmail = `pay_test_${timestamp}@aios.com`;
  const testPassword = "SecretPassword123!";

  console.log(`[Test] Starting Payment integration test for: ${testEmail}`);

  // Setup user session
  console.log('[Test] Signing up user...');
  const signupRes = await fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, name: 'Pay Tester' })
  });
  if (!signupRes.ok) throw new Error('Signup failed');

  const user = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { emailVerifications: true }
  });
  const otpCode = user.emailVerifications[0].code;

  console.log('[Test] Verifying user OTP...');
  const verifyRes = await fetch('http://localhost:8080/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, otp: otpCode })
  });
  if (!verifyRes.ok) throw new Error('OTP Verification failed');

  const cookiesHeader = verifyRes.headers.get('set-cookie');
  const authCookie = cookiesHeader.split(';')[0];
  console.log('[Test] User verified and session initialized.');

  // Test 1: GET GATEWAY KEY
  console.log('[Test] Fetching Razorpay Key ID...');
  const keyRes = await fetch('http://localhost:8080/api/payments/key', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  if (!keyRes.ok) throw new Error('Failed to fetch gateway key');
  const keyData = await keyRes.json();
  console.log(`[Test] Gateway Key retrieved: ${keyData.key}`);

  // Test 2: COUPON REDEMPTION
  console.log('[Test] Redeeming coupon code VIP2026...');
  const couponRes = await fetch('http://localhost:8080/api/payments/coupon', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ couponCode: 'VIP2026' })
  });
  if (!couponRes.ok) {
    const text = await couponRes.text();
    throw new Error(`Coupon redemption failed: ${text}`);
  }
  const couponData = await couponRes.json();
  console.log('[Test] Coupon Redemption success. Plan: ' + couponData.plan_type);
  if (couponData.plan_type !== 'Premium') {
    throw new Error('Coupon should upgrade plan to Premium');
  }

  // Force downgrade plan in DB to test order creation & signature upgrade flow
  await prisma.subscription.update({
    where: { userId: user.id },
    data: { plan: 'Free', status: 'Active' }
  });
  console.log('[Test] Downgraded plan in DB to Free for signature flow validation.');

  // Test 3: CREATE GATEWAY ORDER
  console.log('[Test] Requesting checkout order creation...');
  const checkoutRes = await fetch('http://localhost:8080/api/payments/checkout', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ planType: 'Premium' })
  });
  if (!checkoutRes.ok) {
    const text = await checkoutRes.text();
    throw new Error(`Checkout order creation failed: ${text}`);
  }
  const checkoutData = await checkoutRes.json();
  console.log(`[Test] Gateway Order created. ID: ${checkoutData.orderId}, Amount: ${checkoutData.amount}`);
  if (!checkoutData.orderId) throw new Error('OrderId missing in checkout response');

  // Test 4: SIGNATURE VERIFICATION
  const orderId = checkoutData.orderId;
  const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
  const text = `${orderId}|${paymentId}`;
  
  const secret = process.env.RAZORPAY_KEY_SECRET || 'S27ABLaRbJzgBUJSrnlhx2DC';
  const mockSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  console.log('[Test] Submitting payment signature verification...');
  const verifyPayRes = await fetch('http://localhost:8080/api/payments/verify', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: mockSignature
    })
  });

  if (!verifyPayRes.ok) {
    const text = await verifyPayRes.text();
    throw new Error(`Signature verification failed: ${text}`);
  }
  const verifyPayData = await verifyPayRes.json();
  console.log(`[Test] Signature verified. User Plan Upgraded to: ${verifyPayData.plan_type}`);
  if (verifyPayData.plan_type !== 'Premium') {
    throw new Error('Upgrade plan should be Premium');
  }

  // Force downgrade plan in DB to test Webhook upgrade flow
  await prisma.subscription.update({
    where: { userId: user.id },
    data: { plan: 'Free', status: 'Active' }
  });
  
  // Create another order for Webhook capture
  const checkoutRes2 = await fetch('http://localhost:8080/api/payments/checkout', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ planType: 'Premium' })
  });
  const checkoutData2 = await checkoutRes2.json();
  const orderId2 = checkoutData2.orderId;
  const paymentId2 = `pay_${crypto.randomBytes(8).toString('hex')}`;

  // Test 5: WEBHOOK CALLBACK
  const webhookBody = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: paymentId2,
          order_id: orderId2,
          amount: 999.00
        }
      }
    }
  };

  const webhookPayload = JSON.stringify(webhookBody);
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || secret;
  const webhookSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(webhookPayload)
    .digest('hex');

  console.log('[Test] Triggering payment captured webhook callback...');
  const webhookRes = await fetch('http://localhost:8080/api/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': webhookSignature
    },
    body: webhookPayload
  });

  if (!webhookRes.ok) {
    const text = await webhookRes.text();
    throw new Error(`Webhook trigger failed with status ${webhookRes.status}: ${text}`);
  }
  console.log('[Test] Webhook accepted.');

  // Validate active subscription plan inside PostgreSQL
  const finalSub = await prisma.subscription.findUnique({
    where: { userId: user.id }
  });
  console.log(`[Test] DB verification after webhook: Plan: ${finalSub.plan} - Status: ${finalSub.status}`);
  if (finalSub.plan !== 'Premium' || finalSub.status !== 'Active') {
    throw new Error('Webhook failed to upgrade user subscription to Premium');
  }

  // Clean up user
  console.log('[Test] Purging test user account...');
  await prisma.user.delete({ where: { id: user.id } });
  console.log('[Test] Test user cleaned.');

  console.log('\n🌟 [Test] ALL PHASE 4 PAYMENT INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🌟\n');
  process.exit(0);
}

testPayments().catch(err => {
  console.error('❌ Payments test suite failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
