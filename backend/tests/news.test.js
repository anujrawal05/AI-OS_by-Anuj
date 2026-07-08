const prisma = require('../src/config/prisma');

async function testNews() {
  const timestamp = Date.now();
  const testEmail = `news_test_${timestamp}@aios.com`;
  const testPassword = "SecretPassword123!";

  console.log(`[Test] Starting News integration test for: ${testEmail}`);

  // Setup user session
  console.log('[Test] Signing up user...');
  const signupRes = await fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, name: 'News Tester' })
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

  // Test 1: FETCH HEADLINES on Trial plan (should succeed)
  console.log('[Test] Fetching general headlines...');
  const newsRes = await fetch('http://localhost:8080/api/news', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });

  if (!newsRes.ok) {
    const text = await newsRes.text();
    throw new Error(`Fetch news on Trial plan failed: ${text}`);
  }
  const newsData = await newsRes.json();
  console.log(`[Test] News fetched successfully. Articles count: ${newsData.articles?.length}`);
  if (!newsData.articles || newsData.articles.length === 0) {
    throw new Error('News headlines list is empty');
  }

  // Test 2: FETCH WITH CATEGORY FILTER
  console.log('[Test] Fetching business headlines category...');
  const bizRes = await fetch('http://localhost:8080/api/news?category=business', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  if (!bizRes.ok) throw new Error('Category filter fetch failed');
  const bizData = await bizRes.json();
  console.log(`[Test] Category filter success. Category retrieved: ${bizData.category}`);
  if (bizData.category !== 'business') {
    throw new Error('Retrieved category value mismatch');
  }

  // Test 3: QUERY SCHEMA VALIDATION ERRORS
  console.log('[Test] Submitting invalid category parameter...');
  const badCategoryRes = await fetch('http://localhost:8080/api/news?category=invalid-niche', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  console.log(`[Test] Invalid category response status: ${badCategoryRes.status}`);
  if (badCategoryRes.status !== 400) {
    throw new Error('Invalid query values must be rejected with HTTP 400');
  }

  // Test 4: SUBSCRIPTION PLAN GATE
  // Force downgrade plan to Free directly in database
  await prisma.subscription.update({
    where: { userId: user.id },
    data: { plan: 'Free', status: 'Active' }
  });
  console.log('[Test] Downgraded plan in DB to Free to check subscription gates...');

  const gatedRes = await fetch('http://localhost:8080/api/news', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  console.log(`[Test] Gated endpoint response status on Free plan: ${gatedRes.status}`);
  if (gatedRes.status !== 403) {
    throw new Error('Free users must be rejected with HTTP 403 from gated news');
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

  console.log('\n🌟 [Test] ALL PHASE 6 NEWS API INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🌟\n');
  process.exit(0);
}

testNews().catch(err => {
  console.error('❌ News test suite failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
