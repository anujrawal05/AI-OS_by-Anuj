require('dotenv').config();
const crypto = require('crypto');
const prisma = require('../src/lib/db');
const { generatePrompt, requestAICompletion } = require('../src/services/aiService');

async function runTests() {
  const timestamp = Date.now();
  const testEmail = `admin_test_${timestamp}@aios.com`;
  const testPassword = "SecretPassword123";

  console.log(`[Test AI/Admin] Starting integration tests. Email: ${testEmail}`);

  // --- PART 1: TEST AI SERVICE LAYER ---
  console.log('[Test AI] Calling generatePrompt service...');
  const promptResult = await generatePrompt(null, "Translate this to Hindi: Hello!");
  console.log('[Test AI] Prompt Generator Response:', promptResult);
  if (!promptResult || !promptResult.text) {
    throw new Error("AI core completion returned null payload text");
  }
  
  if (promptResult.promptTokens === undefined || promptResult.completionTokens === undefined) {
    throw new Error("AI Core failed to calculate estimated usage tokens");
  }

  // --- PART 2: HEALTH & READINESS ENDPOINTS ---
  console.log('[Test Monitoring] Querying unauthenticated /ready endpoint...');
  const readyRes = await fetch('http://localhost:8080/ready');
  const readyData = await readyRes.json();
  console.log('[Test Monitoring] Ready Response:', readyData);
  if (!readyRes.ok || readyData.status !== 'ready') {
    throw new Error("Readiness status probe check failed");
  }

  // --- PART 3: TEST ADMIN GATES & FLOWS ---
  // Create a user
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

  // Verify that regular user is blocked from admin dashboard
  console.log('[Test Admin] Verifying regular user is blocked from stats...');
  const blockedRes = await fetch('http://localhost:8080/api/admin/stats', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });
  console.log('[Test Admin] Blocked response status:', blockedRes.status);
  if (blockedRes.status !== 403) {
    throw new Error("Gate failed to prevent non-admin from querying admin endpoint");
  }

  // Elevate user role to Admin in database
  console.log('[Test Admin] Elevating test user to Admin role in DB...');
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'Admin' }
  });

  // Re-fetch user details to verify role token
  const verifyAdminRes = await fetch('http://localhost:8080/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, otp: otpCode }) // code works again because we already validated but test script uses it to re-login, wait: verifyOtp marks code as used!
  });
  
  // Wait, let's login instead since verifyOtp code is already used!
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });
  const loginCookiesHeader = loginRes.headers.get('set-cookie');
  const adminCookie = loginCookiesHeader.split(';')[0];

  // Fetch Dashboard Stats as Admin
  console.log('[Test Admin] Requesting dashboard stats...');
  const statsRes = await fetch('http://localhost:8080/api/admin/stats', {
    method: 'GET',
    headers: { 'Cookie': adminCookie, 'Content-Type': 'application/json' }
  });
  const statsData = await statsRes.json();
  console.log('[Test Admin] Stats response payload:', statsData);
  if (!statsRes.ok || !statsData.stats) {
    throw new Error("Admin dashboard stats loading failed");
  }

  // Fetch User Directory with search and pagination
  console.log('[Test Admin] Fetching paginated user directory list...');
  const usersRes = await fetch('http://localhost:8080/api/admin/users?limit=5&page=1&sortBy=createdAt&sortOrder=desc', {
    method: 'GET',
    headers: { 'Cookie': adminCookie, 'Content-Type': 'application/json' }
  });
  const usersData = await usersRes.json();
  console.log('[Test Admin] Users response pagination data:', usersData.pagination);
  if (!usersRes.ok || !usersData.users) {
    throw new Error("Admin query for user directory failed");
  }

  // Send Broadcast Alert Notification
  console.log('[Test Admin] Dispatching broadcast notifications...');
  const broadcastRes = await fetch('http://localhost:8080/api/admin/broadcast', {
    method: 'POST',
    headers: { 'Cookie': adminCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Maintenance Window', message: 'System updates will occur tonight.' })
  });
  const broadcastData = await broadcastRes.json();
  console.log('[Test Admin] Broadcast Response:', broadcastData);
  if (!broadcastRes.ok) {
    throw new Error("Admin broadcast notification failed");
  }

  // Query System Health Monitor
  console.log('[Test Admin] Querying system diagnostics...');
  const healthRes = await fetch('http://localhost:8080/api/admin/health', {
    method: 'GET',
    headers: { 'Cookie': adminCookie, 'Content-Type': 'application/json' }
  });
  const healthData = await healthRes.json();
  console.log('[Test Admin] Diagnostics Response:', healthData.health);
  if (!healthRes.ok || healthData.health.database !== 'Connected') {
    throw new Error("Diagnostics reporting database status as unhealthy");
  }

  console.log('\n🌟 [Test AI/Admin] INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🌟');
  process.exit(0);
}

runTests().catch(err => {
  console.error('[Test Error] Integration tests failed:', err);
  process.exit(1);
});
