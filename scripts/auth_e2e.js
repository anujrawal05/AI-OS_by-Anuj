const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const results = { steps: [], errors: [] };
  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'E2E Tester';
  const frontend = 'http://localhost:3000';
  const backend = 'http://localhost:3001';

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    results.steps.push({ type: 'console', text: msg.text(), location: msg.location() });
  });

  try {
    // 1. Visit frontend
    await page.goto(frontend, { waitUntil: 'load', timeout: 15000 });
    results.steps.push({ step: 'goto', url: frontend });

    // Wait for auth system to initialize
    await page.waitForTimeout(1200);

    // 2. Open auth modal
    await page.waitForSelector('#btn-header-signin', { timeout: 5000 });
    await page.click('#btn-header-signin');
    results.steps.push({ step: 'open_auth_modal' });

    // Ensure signup mode visible: click toggle to reach signup
    const toggle = await page.$('#btn-toggle-auth-mode');
    if (toggle) await toggle.click();
    await page.waitForSelector('#btn-email-signup', { timeout: 3000 });

    // 3. Fill signup form
    await page.fill('#auth-email', testEmail);
    await page.fill('#auth-password', testPassword);
    await page.fill('#auth-name', testName);
    await page.click('#btn-email-signup');
    results.steps.push({ step: 'signup_submitted', email: testEmail });

    // Wait for OTP screen
    await page.waitForSelector('#otp-verification-section', { timeout: 5000 });

    // 4. Verify OTP via fetch in page (bypass code 123456 allowed in dev)
    const verifyRes = await page.evaluate(async (backend, email) => {
      try {
        const r = await fetch(`${backend}/api/auth/verify-otp`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: '123456' })
        });
        const j = await r.json().catch(()=>null);
        return { status: r.status, body: j };
      } catch (e) { return { error: e.message } }
    }, backend, testEmail);

    results.steps.push({ step: 'verify_otp', result: verifyRes });
    if (!verifyRes || verifyRes.status !== 200) throw new Error('OTP verify failed');

    // 5. Check localStorage user profile
    const profileLocal = await page.evaluate(() => localStorage.getItem('aios_user_profile'));
    results.steps.push({ step: 'local_profile', profile: profileLocal });

    // 6. Logout then Login via UI
    await page.evaluate(() => { if (window.logoutUser) window.logoutUser(); });
    await page.waitForTimeout(500);
    // Open auth modal and ensure signin mode
    await page.click('#btn-header-signin');
    // ensure signin mode (toggle may show signup) ensure toggle text contains 'Create' to go to signup; instead, set by clicking until signin button visible
    const signinBtn = await page.$('#btn-email-signin');
    if (!signinBtn) {
      const tog = await page.$('#btn-toggle-auth-mode'); if (tog) await tog.click();
    }
    await page.fill('#auth-email', testEmail);
    await page.fill('#auth-password', testPassword);
    await page.click('#btn-email-signin');
    results.steps.push({ step: 'login_submitted' });

    // Wait for state.user to be set by frontend; poll localStorage
    await page.waitForFunction(() => !!localStorage.getItem('aios_user_profile'), { timeout: 5000 });
    const postLogin = await page.evaluate(() => localStorage.getItem('aios_user_profile'));
    results.steps.push({ step: 'post_login_profile', profile: postLogin });

    // 7. Show profile modal and update profile
    await page.evaluate(() => { if (window.showProfileModal) window.showProfileModal(); });
    await page.waitForSelector('#pf-fullname', { timeout: 3000 });
    const newFullname = 'E2E Updated';
    await page.fill('#pf-fullname', newFullname);
    // submit form
    await page.click('#profile-edit-form button[type="submit"]');
    // wait for API roundtrip
    await page.waitForTimeout(1000);
    // fetch /api/auth/me to confirm
    const me = await page.evaluate(async (backend) => {
      const r = await fetch(`${backend}/api/auth/me`, { credentials: 'include' });
      const j = await r.json().catch(()=>null);
      return { status: r.status, body: j };
    }, backend);
    results.steps.push({ step: 'profile_update_me', me });

    // 8. Redeem coupon via UI
    await page.evaluate(() => { const cbtn = document.getElementById('btn-auth-coupon-trigger'); if (cbtn) cbtn.click(); });
    await page.waitForSelector('#coupon-input', { timeout: 3000 });
    await page.fill('#coupon-input', 'VIP2026');
    await page.click('#btn-coupon-submit');
    await page.waitForTimeout(1000);
    // Check local state/user
    const afterCoupon = await page.evaluate(() => ({ local: localStorage.getItem('aios_user_profile'), activeCoupon: window.state ? window.state.activeCoupon : null }));
    results.steps.push({ step: 'coupon_redeemed', afterCoupon });

    // 9. Delete account
    // Call handleDeleteAccount via page.evaluate which will show confirm dialog; intercept confirm to return true
    await page.evaluate(() => { window.confirm = () => true; });
    const delRes = await page.evaluate(async (backend) => {
      try {
        const r = await fetch(`${backend}/api/auth/delete-account`, { method: 'POST', credentials: 'include' });
        const j = await r.json().catch(()=>null);
        return { status: r.status, body: j };
      } catch (e) { return { error: e.message } }
    }, backend);
    results.steps.push({ step: 'delete_account', delRes });

    // 10. Verify account removed by calling /api/auth/me and expecting 401 or guest
    const meAfter = await page.evaluate(async (backend) => {
      try {
        const r = await fetch(`${backend}/api/auth/me`, { credentials: 'include' });
        const j = await r.json().catch(()=>null);
        return { status: r.status, body: j };
      } catch (e) { return { error: e.message } }
    }, backend);
    results.steps.push({ step: 'me_after_delete', meAfter });

  } catch (err) {
    results.errors.push(err.message);
    console.error('E2E ERROR', err);
  } finally {
    await browser.close();
    fs.writeFileSync('d:\\auth_e2e_report.json', JSON.stringify(results, null, 2));
    console.log('E2E complete. Report: d:\\auth_e2e_report.json');
  }
})();
