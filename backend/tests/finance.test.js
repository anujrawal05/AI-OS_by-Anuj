const prisma = require('../src/config/prisma');

async function testFinance() {
  const timestamp = Date.now();
  const testEmail = `fin_test_${timestamp}@aios.com`;
  const testPassword = "SecretPassword123!";

  console.log(`[Test] Starting Finance integration test for: ${testEmail}`);

  // Setup user session
  console.log('[Test] Signing up user...');
  const signupRes = await fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, name: 'Finance Tester' })
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
  console.log('[Test] User verified. Active plan: Trial.');

  // Test 1: FETCH STOCKS on Trial plan (should succeed)
  console.log('[Test] Fetching AAPL stock quote...');
  const stockRes = await fetch('http://localhost:8080/api/finance/quote?symbol=AAPL', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });

  if (!stockRes.ok) {
    const text = await stockRes.text();
    throw new Error(`Fetch quote on Trial plan failed: ${text}`);
  }
  const stockData = await stockRes.json();
  console.log(`[Test] AAPL quote retrieved successfully. Current Price: ${stockData.quote.c}`);
  if (stockData.quote.c === undefined || stockData.quote.pc === undefined) {
    throw new Error('AAPL quote numbers missing in response');
  }

  // Test 2: FETCH CRYPTO tickers (should resolve and succeed)
  console.log('[Test] Fetching BTC crypto quote...');
  const cryptoRes = await fetch('http://localhost:8080/api/finance/quote?symbol=BTC', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  if (!cryptoRes.ok) throw new Error('Crypto quote fetch failed');
  const cryptoData = await cryptoRes.json();
  console.log(`[Test] Crypto quote retrieved successfully: Symbol: ${cryptoData.symbol}, Price: ${cryptoData.quote.c}`);
  if (cryptoData.quote.c === undefined || cryptoData.quote.dp === undefined) {
    throw new Error('Crypto quote numbers missing in response');
  }

  // Test 3: SCHEMA VALIDATION ERRORS
  console.log('[Test] Submitting missing symbol query...');
  const badQueryRes = await fetch('http://localhost:8080/api/finance/quote', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  console.log(`[Test] Missing symbol response status: ${badQueryRes.status}`);
  if (badQueryRes.status !== 400) {
    throw new Error('Missing symbol query should return HTTP 400 Bad Request');
  }

  // Test 4: SUBSCRIPTION PLAN GATE
  // Force downgrade plan to Free directly in database
  await prisma.subscription.update({
    where: { userId: user.id },
    data: { plan: 'Free', status: 'Active' }
  });
  console.log('[Test] Downgraded plan in DB to Free to check subscription gates...');

  const gatedRes = await fetch('http://localhost:8080/api/finance/quote?symbol=AAPL', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  console.log(`[Test] Gated endpoint response status on Free plan: ${gatedRes.status}`);
  if (gatedRes.status !== 403) {
    throw new Error('Free users must be rejected with HTTP 403 from gated quotes');
  }
  const gatedData = await gatedRes.json();
  if (!gatedData.subscriptionRequired) {
    throw new Error('Response should report subscriptionRequired as true');
  }
  console.log('[Test] Subscription plan gate validated.');

  // Clean up user
  console.log('[Test] Purging test user account...');
  await prisma.user.delete({ where: { id: user.id } });
  console.log('[Test] Test user cleaned.');

  console.log('\n🌟 [Test] ALL PHASE 7 FINANCE API INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🌟\n');
  process.exit(0);
}

testFinance().catch(err => {
  console.error('❌ Finance test suite failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
