const crypto = require('crypto');
const prisma = require('../src/config/prisma');

async function testAuth() {
  const timestamp = Date.now();
  const testEmail = `auth_test_${timestamp}@aios.com`;
  const testPassword = "SecretPassword123!";
  
  console.log(`[Test] Starting Auth lifecycle integration test for: ${testEmail}`);

  // 1. SIGNUP
  console.log('[Test] Sending signup request...');
  const signupRes = await fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, name: 'Test User' })
  });
  
  if (!signupRes.ok) {
    const text = await signupRes.text();
    throw new Error(`Signup failed with status ${signupRes.status}: ${text}`);
  }
  console.log('[Test] Signup request accepted.');

  // Query Database to extract OTP
  const user = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { emailVerifications: true }
  });

  if (!user) {
    throw new Error('User not found in PostgreSQL after signup');
  }
  const otpCode = user.emailVerifications[0].code;
  console.log(`[Test] OTP extracted from database: ${otpCode}`);

  // 2. VERIFY OTP
  console.log('[Test] Submitting verify-otp request...');
  const verifyRes = await fetch('http://localhost:8080/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, otp: otpCode, name: 'Test User' })
  });

  if (!verifyRes.ok) {
    const text = await verifyRes.text();
    throw new Error(`Verify OTP failed with status ${verifyRes.status}: ${text}`);
  }

  const verifyData = await verifyRes.json();
  const cookiesHeader = verifyRes.headers.get('set-cookie');
  if (!cookiesHeader) {
    throw new Error('Set-Cookie header missing in verify-otp response');
  }
  const authCookie = cookiesHeader.split(';')[0];
  console.log('[Test] OTP verification successful. Session cookie acquired.');

  // 3. GET ACTIVE PROFILE (/me)
  console.log('[Test] Querying user profile /me...');
  const meRes = await fetch('http://localhost:8080/api/auth/me', {
    method: 'GET',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' }
  });

  if (!meRes.ok) {
    throw new Error(`GET /me failed: ${meRes.status}`);
  }
  const meData = await meRes.json();
  console.log(`[Test] Profile query returned successfully. Verified: ${meData.user.isVerified}`);
  if (!meData.user.isVerified) {
    throw new Error('User verified status must be true');
  }

  // Verify defaults provisioning (Phase 3 models check)
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  const preferences = await prisma.userPreference.findUnique({ where: { userId: user.id } });
  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } });
  const trial = await prisma.trial.findUnique({ where: { userId: user.id } });
  const promptUsage = await prisma.promptUsage.findUnique({ where: { userId: user.id } });

  console.log('[Test] Verifying base user default records creation...');
  if (!profile || !preferences || !subscription || !trial || !promptUsage) {
    throw new Error('Defaults provisioning failed. One or more tables are missing user entry.');
  }
  console.log('[Test] Defaults verification complete (all tables populated).');

  // 4. UPDATE PROFILE
  console.log('[Test] Sending update profile request...');
  const updateRes = await fetch('http://localhost:8080/api/auth/update-profile', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Updated User Name', gender: 'Female', profession: 'Developer' })
  });

  if (!updateRes.ok) {
    const text = await updateRes.text();
    throw new Error(`Update profile failed: ${updateRes.status}: ${text}`);
  }
  const updateData = await updateRes.json();
  console.log(`[Test] Profile updated. Name: ${updateData.profile.name}`);
  if (updateData.profile.name !== 'Updated User Name') {
    throw new Error('Updated profile properties did not persist');
  }

  // 5. FORGOT PASSWORD
  console.log('[Test] Sending forgot-password request...');
  const forgotRes = await fetch('http://localhost:8080/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });

  if (!forgotRes.ok) {
    throw new Error(`Forgot password failed: ${forgotRes.status}`);
  }
  console.log('[Test] Forgot password processed.');

  // Provision mock password token mapping to verify submission
  const mockResetToken = crypto.randomBytes(32).toString('hex');
  const mockTokenHash = crypto.createHash('sha256').update(mockResetToken).digest('hex');
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      resetToken: mockTokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  });
  console.log('[Test] Mock reset token injected into Database.');

  // 6. RESET PASSWORD
  const newPassword = "NewSecretPassword456!";
  console.log('[Test] Submitting reset-password request...');
  const resetRes = await fetch('http://localhost:8080/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: mockResetToken, password: newPassword })
  });

  if (!resetRes.ok) {
    const text = await resetRes.text();
    throw new Error(`Reset password failed: ${resetRes.status}: ${text}`);
  }
  console.log('[Test] Password reset successful.');

  // 7. LOGIN WITH NEW CREDENTIALS
  console.log('[Test] Logging in with new credentials...');
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: newPassword })
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    throw new Error(`Login failed with status ${loginRes.status}: ${text}`);
  }

  const loginCookiesHeader = loginRes.headers.get('set-cookie');
  if (!loginCookiesHeader) {
    throw new Error('Session cookie missing on new login response');
  }
  const newAuthCookie = loginCookiesHeader.split(';')[0];
  console.log('[Test] Login successful. Authenticated.');

  // 8. LOGOUT
  console.log('[Test] Sending logout request...');
  const logoutRes = await fetch('http://localhost:8080/api/auth/logout', {
    method: 'POST',
    headers: { 'Cookie': newAuthCookie, 'Content-Type': 'application/json' }
  });

  if (!logoutRes.ok) {
    throw new Error(`Logout failed: ${logoutRes.status}`);
  }
  console.log('[Test] Logout successful.');

  // Verify access is blocked
  const meAfterLogout = await fetch('http://localhost:8080/api/auth/me', {
    method: 'GET',
    headers: { 'Cookie': newAuthCookie, 'Content-Type': 'application/json' }
  });
  console.log(`[Test] Profile query status after logout: ${meAfterLogout.status}`);
  if (meAfterLogout.status !== 401) {
    throw new Error('Access should be rejected (401) after session logout');
  }

  // Login again to delete
  console.log('[Test] Authenticating session once more to test account purging...');
  const reloginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: newPassword })
  });
  const finalAuthCookie = reloginRes.headers.get('set-cookie').split(';')[0];

  // 9. DELETE ACCOUNT
  console.log('[Test] Sending delete-account request...');
  const deleteRes = await fetch('http://localhost:8080/api/auth/delete-account', {
    method: 'POST',
    headers: { 'Cookie': finalAuthCookie, 'Content-Type': 'application/json' }
  });

  if (!deleteRes.ok) {
    throw new Error(`Account deletion failed: ${deleteRes.status}`);
  }
  console.log('[Test] Account purged successfully.');

  // Verify DB cascading deletions
  const userCheck = await prisma.user.findUnique({ where: { email: testEmail } });
  const profileCheck = await prisma.profile.findFirst({ where: { userId: user.id } });
  const sessionCheck = await prisma.session.findFirst({ where: { userId: user.id } });

  if (userCheck || profileCheck || sessionCheck) {
    throw new Error('Cascading purge did not clear dependent tables completely.');
  }
  console.log('[Test] Verified cascading purges of profiles and sessions in database.');

  console.log('\n🌟 [Test] ALL PHASE 2 & 3 AUTHENTICATION TESTS COMPLETED SUCCESSFULLY! 🌟\n');
  process.exit(0);
}

testAuth().catch(err => {
  console.error('❌ Integration test failure:', err.message);
  console.error(err.stack);
  process.exit(1);
});
