const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Initialize Supabase Admin Client for database RLS bypass
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabaseAdmin = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;

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
        return {
          isCoupon: false,
          id: user.id,
          email: user.email,
          plan_type: (profile && profile.plan_type) || 'Basic'
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
