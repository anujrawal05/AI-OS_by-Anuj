const prisma = require('../src/config/prisma');

async function testAI() {
  const timestamp = Date.now();
  const testEmail = `ai_test_${timestamp}@aios.com`;
  const testPassword = "SecretPassword123!";

  console.log(`[Test] Starting AI strategist integration test for: ${testEmail}`);

  // Setup user session
  console.log('[Test] Signing up user...');
  const signupRes = await fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, name: 'AI Tester' })
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

  // Test 1: COMPILE STRATEGY (allowed on Trial plan)
  console.log('[Test] Requesting SaaS strategy compilation...');
  const compileRes = await fetch('http://localhost:8080/api/strategist/compile', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'My AI Agency',
      targetAudience: 'Real Estate Agents',
      bottleneck: 'Cold outreach replies are too low'
    })
  });

  if (!compileRes.ok) {
    const text = await compileRes.text();
    throw new Error(`Compile strategy failed: status ${compileRes.status}: ${text}`);
  }
  const compileData = await compileRes.json();
  console.log(`[Test] Compilation success. Quota Remaining: ${compileData.quota.remaining}`);
  if (!compileData.analysis || !compileData.opportunities) {
    throw new Error('Analysis output fields are missing in compilation');
  }

  // Test 2: CHAT STRATEGIST (gated on Trial - should be rejected with HTTP 403)
  console.log('[Test] Checking chat endpoint rejection on Trial plan...');
  const chatFailRes = await fetch('http://localhost:8080/api/strategist/chat', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput: 'Hello Red Teamer' })
  });
  console.log(`[Test] Chat rejection status: ${chatFailRes.status}`);
  if (chatFailRes.status !== 403) {
    throw new Error('Trial users must be blocked (403) from AI chat assistant');
  }

  // Upgrade user subscription manually in DB
  await prisma.subscription.update({
    where: { userId: user.id },
    data: { plan: 'Premium', status: 'Active' }
  });
  console.log('[Test] Upgraded user in DB to Premium plan to run chat tests.');

  // Test 3: CHAT STRATEGIST (Standard JSON)
  console.log('[Test] Sending chat request (JSON format)...');
  const chatRes = await fetch('http://localhost:8080/api/strategist/chat', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput: 'Is standard cold emailing dead?' })
  });

  if (!chatRes.ok) {
    const text = await chatRes.text();
    throw new Error(`Chat JSON failed with status ${chatRes.status}: ${text}`);
  }
  const chatData = await chatRes.json();
  console.log(`[Test] Chat JSON success. Quota Remaining: ${chatData.quota.remaining}`);
  if (!chatData.reply) throw new Error('Assistant reply text is missing');

  // Test 4: CHAT STRATEGIST (SSE Streaming)
  console.log('[Test] Sending chat request (SSE streaming)...');
  const chatStreamRes = await fetch('http://localhost:8080/api/strategist/chat', {
    method: 'POST',
    headers: { 
      'Cookie': authCookie, 
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream' 
    },
    body: JSON.stringify({ userInput: 'Tell me about the underground drift strategy', stream: true })
  });

  if (!chatStreamRes.ok) {
    throw new Error(`Chat stream failed with status: ${chatStreamRes.status}`);
  }

  console.log('[Test] Parsing incoming streaming SSE chunks...');
  const reader = chatStreamRes.body;
  const decoder = new TextDecoder('utf-8');
  let streamReply = '';
  let done = false;

  for await (const chunk of reader) {
    const text = typeof chunk === 'string' ? chunk : decoder.decode(chunk);
    const lines = text.split('\n');
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;
      if (cleanLine.startsWith('data: ')) {
        const data = JSON.parse(cleanLine.slice(6));
        if (data.chunk) {
          streamReply += data.chunk;
        }
        if (data.done) {
          done = true;
          console.log(`[Test] Stream finished. Quota Remaining: ${data.quota.remaining}`);
        }
      }
    }
  }

  console.log('[Test] Stream response snippet:');
  console.log(streamReply.slice(0, 150) + '...');
  if (!done || !streamReply) {
    throw new Error('Streaming failed to send chunks or complete event');
  }

  // Test 5: DAILY QUOTA LIMIT BLOCK
  console.log('[Test] Triggering daily usage limits block...');
  
  // Set count to 99 in database (Premium limit is 100)
  await prisma.promptUsage.update({
    where: { userId: user.id },
    data: { promptCount: 99 }
  });

  // Call compile strategy (100th request - should succeed)
  console.log('[Test] Making 100th compile request...');
  const compile100 = await fetch('http://localhost:8080/api/strategist/compile', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Limit Tester',
      targetAudience: 'SaaS Owners',
      bottleneck: 'Capacity blocks'
    })
  });
  if (!compile100.ok) throw new Error('100th request compile failed');

  // Call compile strategy (101st request - should be blocked)
  console.log('[Test] Making 101st compile request...');
  const compile101 = await fetch('http://localhost:8080/api/strategist/compile', {
    method: 'POST',
    headers: { 'Cookie': authCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Limit Tester 2',
      targetAudience: 'SaaS Owners',
      bottleneck: 'Capacity blocks'
    })
  });

  console.log(`[Test] 101st request status: ${compile101.status}`);
  if (compile101.status !== 429) {
    throw new Error('101st request should be blocked with HTTP 429 Daily limit reached');
  }
  const compile101Data = await compile101.json();
  if (!compile101Data.quotaExceeded) {
    throw new Error('Response should mark quotaExceeded as true');
  }
  console.log('[Test] Quota limits block validated.');

  // Clean up user
  console.log('[Test] Purging test user account...');
  await prisma.user.delete({ where: { id: user.id } });
  console.log('[Test] Test user cleaned.');

  console.log('\n🌟 [Test] ALL PHASE 5 AI INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🌟\n');
  process.exit(0);
}

testAI().catch(err => {
  console.error('❌ AI strategist test suite failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
