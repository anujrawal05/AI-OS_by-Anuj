const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Initialize Supabase Admin Client for database RLS bypass
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing in environment variables. Startup aborted.');
}
const supabaseAdmin = supabaseUrl ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Premium 3-Day Trial Database Management
const TRIALS_FILE = path.join(__dirname, '..', '..', 'data', 'premium_trials.json');

function readTrials() {
  try {
    const dir = path.dirname(TRIALS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(TRIALS_FILE)) {
      fs.writeFileSync(TRIALS_FILE, JSON.stringify({}, null, 2), 'utf8');
    }
    return JSON.parse(fs.readFileSync(TRIALS_FILE, 'utf8'));
  } catch (err) {
    console.error('[premium-trial] Failed to read trials database:', err);
    return {};
  }
}

function writeTrials(data) {
  try {
    fs.writeFileSync(TRIALS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[premium-trial] Failed to write trials database:', err);
  }
}

// Get or initialize trial status for a user
function getOrInitializeTrial(userId, email, currentPlan) {
  if (currentPlan === 'Premium') {
    return {
      plan_type: 'Premium',
      trial_used: true
    };
  }

  const trials = readTrials();
  const key = userId || email;
  if (!key) return null;

  let userTrial = trials[key];
  
  if (!userTrial) {
    const now = new Date();
    const expires = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    
    userTrial = {
      trial_started_at: now.toISOString(),
      trial_expires_at: expires.toISOString(),
      trial_used: true,
      plan_type: 'Trial Premium'
    };
    
    trials[key] = userTrial;
    writeTrials(trials);
    console.log(`[Premium Trial] Activated 3-day trial for user ${key}. Expires: ${userTrial.trial_expires_at}`);
  }

  // Expiry check
  const now = new Date();
  const expiresAt = new Date(userTrial.trial_expires_at);
  if (now > expiresAt && userTrial.plan_type === 'Trial Premium') {
    userTrial.plan_type = 'Basic';
    trials[key] = userTrial;
    writeTrials(trials);
    console.log(`[Premium Trial] Trial expired for user ${key}. Downgraded to Basic.`);
  }

  return userTrial;
}

// Helper to verify token payload
async function verifyTokenPayload(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  
  // 1. Try to verify as a local Coupon Token
  try {
    const jsonStr = Buffer.from(token, 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr);
    if (payload.signature === 'AIOS-AUTHENTICATED-COUPON') {
      if (payload.expiry && Date.now() > payload.expiry) {
        return null;
      }
      return { isCoupon: true, email: payload.email, plan_type: payload.plan_type || 'Premium', name: payload.name };
    }
  } catch (err) {
    // Fail silently and proceed to Supabase token verification
  }

  // 2. Try to verify as a Supabase JWT Token
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        // Retrieve profile database row to get plan_type
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('plan_type')
          .eq('id', user.id)
          .single();
        if (profileError) {
          console.error('[VerifyPayment verifyToken DB Error Object]:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          });
        }
        let effectivePlan = (profile && profile.plan_type) || 'Basic';
        const trialInfo = getOrInitializeTrial(user.id, user.email, effectivePlan);
        return {
          isCoupon: false,
          id: user.id,
          email: user.email,
          plan_type: (trialInfo && trialInfo.plan_type) || effectivePlan
        };
      }
    } catch (err) {
      // Fail silently and return null
    }
  }
  
  return null;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const verifiedUser = await verifyTokenPayload(authHeader);
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Invalid or expired session. Please login again.' });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planName } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planName) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY || '')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed.' });
    }

    // Log the transaction
    const dataDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const paymentsPath = path.join(dataDir, 'payments.json');
    let payments = [];
    if (fs.existsSync(paymentsPath)) {
      try {
        payments = JSON.parse(fs.readFileSync(paymentsPath, 'utf8') || '[]');
      } catch (e) {
        payments = [];
      }
    }
    payments.push({
      email: verifiedUser.email,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      plan: planName,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(paymentsPath, JSON.stringify(payments, null, 2), 'utf8');

    // Update user profile in Supabase to Premium if applicable
    if (!verifiedUser.isCoupon && supabaseAdmin && verifiedUser.id) {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({ plan_type: 'Premium', updated_at: new Date().toISOString() })
        .eq('id', verifiedUser.id);
        
      if (error) {
        console.error('[VerifyPayment DB Error Object]:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error('Database update failed');
      }

      // Also update the local premium trial record to 'Premium'
      try {
        const trials = readTrials();
        const key = verifiedUser.id || verifiedUser.email;
        if (key) {
          if (!trials[key]) trials[key] = {};
          trials[key].plan_type = 'Premium';
          writeTrials(trials);
        }
      } catch (err) {
        console.error('[VerifyPayment] Failed to sync payment to trials DB:', err);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully and premium plan active.',
      plan_type: 'Premium'
    });

  } catch (error) {
    console.error('[VerifyPayment Error]:', error.message);
    return res.status(500).json({ error: 'Internal Server Error. Payment verification failed.' });
  }
};
