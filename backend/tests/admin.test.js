const prisma = require('../src/config/prisma');

async function testAdmin() {
  const timestamp = Date.now();
  const testEmail = `admin_test_${timestamp}@aios.com`;
  const testPassword = "SecretPassword123!";

  console.log(`[Test] Starting Admin Dashboard integration test for: ${testEmail}`);

  // Setup user session
  console.log('[Test] Signing up user...');
  const signupRes = await fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, name: 'Admin Tester' })
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
  console.log('[Test] User verified. Active role: User.');

  // Test 1: REQUIRE ADMIN GUARD check (should fail on standard User role)
  console.log('[Test] Accessing stats endpoint with User role...');
  const statsFailRes = await fetch('http://localhost:8080/api/admin/stats', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  console.log(`[Test] User access status: ${statsFailRes.status}`);
  if (statsFailRes.status !== 403) {
    throw new Error('Admin routes must block User accounts with HTTP 403 Forbidden');
  }

  // Force upgrade user role to Admin directly in database
  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'Admin' }
  });
  console.log('[Test] Upgraded user role in DB to Admin.');

  // Test 2: FETCH STATS (should succeed on Admin role)
  console.log('[Test] Fetching dashboard stats...');
  const statsRes = await fetch('http://localhost:8080/api/admin/stats', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  if (!statsRes.ok) {
    const text = await statsRes.text();
    throw new Error(`Fetch dashboard stats failed: ${text}`);
  }
  const statsData = await statsRes.json();
  console.log(`[Test] Stats retrieved. Total Users: ${statsData.stats.totalUsers}, Revenue: ${statsData.stats.totalRevenue}`);
  if (statsData.stats.totalUsers === undefined || statsData.stats.totalRevenue === undefined) {
    throw new Error('Stats properties missing in response');
  }

  // Test 3: INSPECT SYSTEM HEALTH
  console.log('[Test] Inspecting host system health...');
  const healthRes = await fetch('http://localhost:8080/api/admin/health', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  if (!healthRes.ok) throw new Error('System health check failed');
  const healthData = await healthRes.json();
  console.log(`[Test] Health stats: Platform: ${healthData.health.platform}, DB: ${healthData.health.database}`);
  if (healthData.health.database !== 'Connected') {
    throw new Error('Database status should be Connected');
  }

  // Test 4: SEARCH / FILTER / PAGINATE USERS
  console.log('[Test] Paginated search users query...');
  const usersRes = await fetch('http://localhost:8080/api/admin/users?limit=5', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  if (!usersRes.ok) throw new Error('Paginated users query failed');
  const usersData = await usersRes.json();
  console.log(`[Test] Users listed: count: ${usersData.users.length}, Total: ${usersData.pagination.total}`);
  if (usersData.users.length === 0) {
    throw new Error('Users list should contain at least the test user');
  }

  // Test 5: UPDATE USER TIER RESTful
  console.log('[Test] Changing plan tier of user to Premium...');
  const tierRes = await fetch(`http://localhost:8080/api/admin/users/${user.id}/tier`, {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'Premium' })
  });
  if (!tierRes.ok) throw new Error('Tier upgrade request failed');
  const tierData = await tierRes.json();
  console.log(`[Test] Plan tier upgrade verified: Plan: ${tierData.subscription.plan}, Status: ${tierData.subscription.status}`);
  if (tierData.subscription.plan !== 'Premium') {
    throw new Error('Plan should have changed to Premium');
  }

  // Test 6: DISPATCH ALERTS BROADCAST
  console.log('[Test] Sending system broadcast alerts...');
  const broadcastRes = await fetch('http://localhost:8080/api/admin/broadcast', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Scheduled Maintenance',
      message: 'System upgrade scheduled for 02:00 AM UTC'
    })
  });
  if (broadcastRes.status !== 201) throw new Error(`Broadcast failed with status: ${broadcastRes.status}`);
  const broadcastData = await broadcastRes.json();
  console.log(`[Test] Broadcast processed successfully: ${broadcastData.message}`);

  // Test 7: SUSPEND USER ACCOUNT (RESTful)
  console.log('[Test] Suspending user account...');
  const suspendRes = await fetch(`http://localhost:8080/api/admin/users/${user.id}/suspend`, {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  if (!suspendRes.ok) throw new Error('Account suspension request failed');
  const suspendData = await suspendRes.json();
  console.log(`[Test] Account suspension confirmed: Suspended: ${suspendData.user.suspended}`);
  if (!suspendData.user.suspended) {
    throw new Error('Suspended field must be true');
  }

  // Clean up user
  console.log('[Test] Purging test user account...');
  await prisma.user.delete({ where: { id: user.id } });
  console.log('[Test] Test user cleaned.');

  console.log('\n🌟 [Test] ALL PHASE 9 ADMIN DASHBOARD INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🌟\n');
  process.exit(0);
}

testAdmin().catch(err => {
  console.error('❌ Admin test suite failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
