require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static files from root directory
app.use(express.static(__dirname));

// Register Config Route
const configHandler = require('./api/config');
app.get('/api/config', configHandler);

// Initialize Supabase Client
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Initialize Supabase Admin Client for database RLS bypass
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing in environment variables. Startup aborted.');
}
const supabaseAdmin = supabaseUrl ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Daily Prompt Limit Cache for Basic users
const dailyPromptLimitCache = {};

// Authentication Endpoints
const couponLoginHandler = require('./api/auth/coupon-login');
const verifyPaymentHandler = require('./api/auth/verify-payment');

app.post('/api/auth/coupon-login', couponLoginHandler);
app.post('/api/auth/verify-payment', verifyPaymentHandler);

// Dynamic Video Auto-Discovery API
app.get('/api/videos', (req, res) => {
  try {
    const fs = require('fs');
    const buildDir = path.join(__dirname, 'build tutorial');
    const exploreDir = path.join(__dirname, 'explore AI');
    
    let buildVideos = [];
    if (fs.existsSync(buildDir)) {
      buildVideos = fs.readdirSync(buildDir).filter(file => file.endsWith('.mp4'));
    }
    
    let exploreVideos = [];
    if (fs.existsSync(exploreDir)) {
      exploreVideos = fs.readdirSync(exploreDir).filter(file => file.endsWith('.mp4'));
    }
    
    res.json({
      success: true,
      buildVideos,
      exploreVideos
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



// Custom Email/Password Login Endpoint
app.post('/api/auth/email-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!supabase) {
      return res.status(500).json({ error: 'Database service is not configured on the server.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[Login Auth Error Object]:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return res.status(400).json({ error: error.message });
    }

    if (data && data.user) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return res.status(200).json({
        user: data.user,
        session: data.session,
        profile: profile || null
      });
    }

    return res.status(400).json({ error: 'Authentication failed.' });
  } catch (err) {
    console.error('[Login Endpoint Error]:', err.message);
    return res.status(500).json({ error: err.message || 'Internal Server Error.' });
  }
});

// Custom Profile Fetch Endpoint
app.get('/api/auth/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const token = authHeader.split(' ')[1];
    if (!supabase) {
      return res.status(500).json({ error: 'Database service is not configured on the server.' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid session.' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[Profile Fetch Error Object]:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      });
    }

    return res.status(200).json(profile || null);
  } catch (err) {
    console.error('[Profile Fetch Endpoint Error]:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Custom Profile Update Endpoint
app.post('/api/auth/update-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const token = authHeader.split(' ')[1];
    if (!supabase) {
      return res.status(500).json({ error: 'Database service is not configured on the server.' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }

    const { full_name, date_of_birth, gender, profession, plan_type, trial_started_at } = req.body;

    const profileData = {
      id: user.id,
      email: user.email,
      full_name: full_name,
      date_of_birth: date_of_birth,
      gender: gender,
      profession: profession,
      updated_at: new Date().toISOString()
    };

    if (plan_type !== undefined) profileData.plan_type = plan_type;
    if (trial_started_at !== undefined) profileData.trial_started_at = trial_started_at;

    let { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert(profileData);

    // Graceful fallback if trial_started_at column does not exist in database
    if (profileError && (profileError.message.includes('trial_started_at') || profileError.message.includes('column'))) {
      console.warn('[Update Profile Fallback] trial_started_at column missing/failed, retrying upsert without it...');
      delete profileData.trial_started_at;
      const retry = await supabaseAdmin
        .from('user_profiles')
        .upsert(profileData);
      profileError = retry.error;
    }

    if (profileError) {
      console.error('[Update Profile Error Object]:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      });
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({
      success: true,
      profile: profileData
    });
  } catch (err) {
    console.error('[Update Profile Endpoint Error]:', err.message);
    return res.status(500).json({ error: err.message || 'Internal Server Error.' });
  }
});

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
          console.error('[VerifyToken Profile Error Object]:', {
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
      console.error('[VerifyToken] Supabase validation failed:', err.message);
    }
  }
  
  return null;
}

// Route: AI JSON Prompt Generator
app.post('/api/prompt/generate-aios-prompt', async (req, res) => {
  try {
    // Server-side verification
    const authHeader = req.headers.authorization;
    const verifiedUser = await verifyTokenPayload(authHeader);
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Authentication required. Please log in or enter a valid coupon code to unlock AI-OS premium services.' });
    }

    // Daily Limit Enforcements for Basic user plan
    if (verifiedUser.plan_type === 'Basic') {
      const today = new Date().toISOString().split('T')[0];
      const limitKey = `${verifiedUser.id || verifiedUser.email}_${today}`;
      const count = dailyPromptLimitCache[limitKey] || 0;
      if (count >= 5) {
        return res.status(403).json({ error: 'Daily limit of 5 prompts reached for the Basic plan. Please upgrade to Premium for unlimited access.' });
      }
      dailyPromptLimitCache[limitKey] = count + 1;
    }

    const { taskName, userInput } = req.body;
    
    if (!taskName) {
      return res.status(400).json({ error: 'Missing taskName in request body.' });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.error('[Prompt Server] Error: OPENROUTER_API_KEY is not defined in .env');
      return res.status(500).json({ error: 'OpenRouter API key is not configured on the server.' });
    }

    const globalSystemInstruction = [
      "You are an expert AI Prompt Engineer.",
      "Understand the user's intent instead of literally rewriting the input.",
      "The user may write in Hindi, English, Hinglish or any mixed language.",
      "Automatically detect the language.",
      "Always understand the objective first.",
      "Add professional creativity while preserving the user's core idea.",
      "Expand scenes naturally.",
      "Improve lighting, camera angles, composition, realism and cinematic quality.",
      "Never change the user's subject.",
      "Never ask follow-up questions.",
      "Output ONLY valid JSON.",
      "Never output markdown.",
      "Never output explanations."
    ].join('\n');

    // Mappings for standard roadmaps
    const taskRoadmaps = {
      "Generate AI Images": {
        system_prompt: [
          "You are an award-winning photographer and prompt engineer.",
          "Generate a highly detailed JSON prompt for professional image generation.",
          "Automatically improve composition.",
          "Improve lighting.",
          "Improve camera angle.",
          "Improve realism.",
          "Add subtle environmental storytelling.",
          "Maintain user's subject."
        ],
        example: {
          "user_input": "A cat is flying",
          "ai_understanding": "User wants a realistic image of a flying cat.",
          "expanded_scene": "A fluffy orange cat gracefully flying through bright white clouds during golden hour with cinematic sunlight, dynamic fur movement, volumetric lighting and ultra realistic details."
        }
      },
      "Generate AI Video": {
        system_prompt: [
          "You are a Hollywood director.",
          "Generate a cinematic JSON prompt.",
          "Automatically create multiple shots.",
          "Add smooth transitions.",
          "Add camera movement.",
          "Add environmental animation.",
          "Maintain original story."
        ],
        example: {
          "user_input": "A cat is flying",
          "ai_understanding": "User wants a video of a flying cat.",
          "expanded_scene": [
            "Cat jumps from rooftop.",
            "Clouds appear.",
            "Cat begins flying.",
            "Camera follows from below.",
            "Birds cross frame.",
            "Golden sunlight illuminates the fur.",
            "Wide aerial cinematic ending."
          ]
        }
      },
      "Create Music": {
        system_prompt: [
          "You are a Grammy-winning music producer.",
          "Generate a complete Suno AI compatible music prompt.",
          "Understand user intent automatically.",
          "Detect mood, genre, instruments, vocals and atmosphere.",
          "Improve the user's idea creatively while preserving the original meaning.",
          "Return a JSON object with a single key 'prompt' containing only one polished English prompt suitable for Suno AI.",
          "Do not generate structured JSON fields for BPM/instruments, just output the final prompt paragraph inside the 'prompt' key."
        ],
        example: {
          "prompt": "Create an emotional cinematic Hindi pop song with soft piano, atmospheric synths, deep male vocals, uplifting chorus and modern electronic production inspired by hope and ambition."
        }
      },
      "Generate Voice Over": {
        system_prompt: [
          "You are an expert voice director.",
          "Automatically improve punctuation.",
          "Improve pauses.",
          "Improve emphasis.",
          "Generate natural speaking style."
        ]
      },
      "Create Digital Designs": {
        system_prompt: [
          "You are a senior graphic designer.",
          "Generate premium design JSON.",
          "Improve layout.",
          "Improve typography.",
          "Improve hierarchy.",
          "Improve color balance."
        ]
      },
      "Build Software": {
        system_prompt: [
          "You are a senior software architect.",
          "Understand the application idea.",
          "Generate a complete AI coding agent JSON prompt.",
          "Automatically define architecture.",
          "Automatically define folder structure.",
          "Automatically define UI.",
          "Automatically define APIs.",
          "Automatically define deployment."
        ]
      },
      "Build Android Application": {
        system_prompt: [
          "You are an Android architect.",
          "Generate complete Android application JSON prompt.",
          "Automatically define screens.",
          "Automatically define navigation.",
          "Automatically define database.",
          "Automatically define UI components."
        ]
      },
      "Build Brand": {
        system_prompt: [
          "You are a global branding agency.",
          "Generate branding JSON.",
          "Create identity.",
          "Create positioning.",
          "Create tagline.",
          "Create logo direction.",
          "Create color palette.",
          "Create marketing tone."
        ]
      },
      "Build Personal AI Assistant": {
        system_prompt: [
          "You are an expert AI systems engineer.",
          "Generate complete autonomous assistant JSON prompt.",
          "Define memory.",
          "Define tools.",
          "Define workflow.",
          "Define personality.",
          "Define integrations."
        ]
      },
      "Design Hardware": {
        system_prompt: [
          "You are an industrial designer.",
          "Generate hardware visualization JSON.",
          "Improve materials.",
          "Improve engineering realism.",
          "Improve render quality."
        ]
      },
      "Monetize AI Skills": {
        system_prompt: [
          "You are a business strategist.",
          "Generate execution roadmap JSON.",
          "Suggest services.",
          "Suggest pricing.",
          "Suggest portfolio.",
          "Suggest client acquisition strategy."
        ]
      }
    };

    const config = taskRoadmaps[taskName] || { system_prompt: ["Generate a professional AI JSON prompt based on user description."] };
    const rules = config.system_prompt.join('\n');
    const exampleStr = config.example ? `Example configuration:\n${JSON.stringify(config.example, null, 2)}` : '';

    const systemPromptContent = `${globalSystemInstruction}\n\nTask-Specific Prompt Engineering Guidelines:\n${rules}\n\n${exampleStr}\n\nResponse Requirement:\nReturn ONLY valid raw JSON structure. Do NOT wrap inside markdown blocks. Do NOT output explanations or thinking text.`;

    const openRouterResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPromptContent },
          { role: 'user', content: userInput || 'A creative project concept' }
        ],
        temperature: 0.8,
        top_p: 0.95,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );

    let resultText = openRouterResponse?.data?.choices?.[0]?.message?.content || '';
    resultText = resultText.trim();

    // Strip markdown blocks if returned by any chance
    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```(?:json)?\n?/i, '');
      resultText = resultText.replace(/\n?```$/i, '');
      resultText = resultText.trim();
    }

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(resultText);
    } catch (parseError) {
      console.warn('[Prompt Server] JSON Parse Error. Raw content:', resultText);
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedJSON = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('LLM output could not be parsed as valid JSON: ' + resultText);
      }
    }

    let finalPrompt = parsedJSON;
    if (parsedJSON && typeof parsedJSON === 'object') {
      if (parsedJSON.prompt) finalPrompt = parsedJSON.prompt;
      else if (parsedJSON.suno_prompt) finalPrompt = parsedJSON.suno_prompt;
    }

    return res.status(200).json({
      success: true,
      prompt: finalPrompt
    });

  } catch (error) {
    console.error('[Prompt Server] API error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to generate dynamic prompt.', 
      details: error.response?.data || error.message 
    });
  }
});

// Route: A.R. Business Strategist Chat API
app.post('/api/strategist/chat', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const verifiedUser = await verifyTokenPayload(authHeader);
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Authentication required. Please log in or enter a valid coupon code to unlock AI-OS premium services.' });
    }

    if (verifiedUser.plan_type !== 'Premium' && verifiedUser.plan_type !== 'Trial') {
      return res.status(403).json({ error: 'Upgrade to Premium to consult A.R. Business Strategist.' });
    }

    const { mode, userInput, businessName, targetAudience, bottleneck, context, history } = req.body;
    
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      console.warn('[Strategist Server] OpenRouter API key not configured. Using fallback templates.');
      if (mode === 'chat') {
        return res.status(200).json({ reply: `I received your query: "${userInput}". Our live AI systems are currently offline. Please configure your OpenRouter API key.` });
      }
      return res.status(200).json(getFallbackStrategy(businessName || userInput));
    }

    const currentMode = mode || 'compile';

    if (currentMode === 'compile') {
      const name = businessName || 'My Startup';
      const audience = targetAudience || 'General Consumers';
      const bn = bottleneck || 'Acquisition/Sales';

      const systemPromptContent = [
        "You are an elite corporate advisory partner, ultra-pro venture capital consultant, fractional CMO, and hyper-practical systems advisor.",
        "Your goal is to deliver deep, customized business value that explicitly handles the user's specific typed responses.",
        "Your advice must feel hyper-vetted, elite, and premium, making the user feel their investment is a massive arbitrage deal.",
        "",
        "CRITICAL QUALITY TARGETS:",
        "- NEVER output generic or superficial advice like 'identify the target audience' or 'offer free tutorials'.",
        "- ALL generated steps must contain precise tool stack choices (e.g., specific SaaS names, APIs), specific outreach copy frameworks, exact timeline steps, and actionable unit economics (costs, prices, conversions).",
        "- Render every tab pane element using tailored bullet lists with HTML line breaks (<br>) and clear bold headers (<strong>) for beautiful UI formatting.",
        "",
        "Output ONLY valid JSON containing exactly these 7 keys:",
        "1. 'analysis': Strategic diagnostics of the business, identified bottlenecks, and recommendations.",
        "2. 'opportunities': A list of exactly 3 highly actionable, specific business opportunities/monetization strategies.",
        "3. 'automation': Exact Make.com, Zapier, or API webhook trigger/action steps for operations.",
        "4. 'marketing': The organic and outbound marketing distribution channels, client outreach copy ideas, and direct funnel design.",
        "5. 'leads': Scraper inputs, lead filters, cold email volume recommendations, and expected conversion metrics.",
        "6. 'revenue': Concrete pricing structures (retainers, setup fees, outcome cuts) and operational cost/margin calculations.",
        "7. 'plan': Step-by-step milestone execution roadmap mapping Days 1-30 (Launch), Days 31-60 (Scale), and Days 61-90 (Optimize).",
        "Return ONLY a raw JSON object. Do NOT wrap inside markdown blocks. Do NOT output explanations or thinking text."
      ].join('\n');

      const userPrompt = `Develop a customized enterprise roadmap for my business:\nBusiness Name/Niche/Offer: ${name}\nTarget Audience/Avatar: ${audience}\nBottleneck: ${bn}`;

      const openRouterResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemPromptContent },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      let resultText = openRouterResponse?.data?.choices?.[0]?.message?.content || '';
      resultText = resultText.trim();

      if (resultText.startsWith('```')) {
        resultText = resultText.replace(/^```(?:json)?\n?/i, '');
        resultText = resultText.replace(/\n?```$/i, '');
        resultText = resultText.trim();
      }

      const parsedJSON = JSON.parse(resultText);
      return res.status(200).json(parsedJSON);

    } else {
      // mode === 'chat' (Follow-up chat answers)
      if (!userInput) {
        return res.status(400).json({ error: 'Missing userInput in request body.' });
      }

      const bizName = context?.businessName || 'N/A';
      const bizAudience = context?.targetAudience || 'N/A';
      const bizBottleneck = context?.bottleneck || 'N/A';
      const compiledStrategy = context?.strategy ? JSON.stringify(context.strategy, null, 2) : 'No compiled roadmap yet.';

      const systemPromptContent = [
        "You are an elite corporate advisory partner, ultra-pro venture capital consultant, fractional CMO, and hyper-practical systems advisor.",
        "You are answering a user's follow-up question regarding their business profile and compiled roadmap.",
        `User Profile:\n- Business Offer: ${bizName}\n- Target Audience: ${bizAudience}\n- Current Bottleneck: ${bizBottleneck}`,
        `Compiled Strategy Roadmap:\n${compiledStrategy}`,
        "",
        "CRITICAL QUALITY TARGETS:",
        "- NEVER output generic or superficial advice. Be highly specific, technical, and concrete.",
        "- Output answers in clean HTML format using line breaks (<br>) and bold text (<strong>) where appropriate.",
        "- Keep responses punchy, professional, and actionable."
      ].join('\n');

      const messages = [{ role: 'system', content: systemPromptContent }];
      
      // Inject previous logs/history if present
      if (Array.isArray(history)) {
        history.forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }

      messages.push({ role: 'user', content: userInput });

      const openRouterResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages,
          temperature: 0.7,
          max_tokens: 2048
        },
        {
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      const resultText = openRouterResponse?.data?.choices?.[0]?.message?.content || '';
      return res.status(200).json({ reply: resultText.trim() });
    }

  } catch (error) {
    console.error('[Strategist Server] Error:', error.message);
    if (req.body && req.body.mode === 'chat') {
      return res.status(200).json({ reply: "I failed to process your question due to a backend connection timeout. Please try again." });
    }
    return res.status(200).json(getFallbackStrategy(req.body ? (req.body.businessName || 'Business') : 'Business'));
  }
});

function getFallbackStrategy(text) {
  const lowText = text.toLowerCase();
  
  let analysis = `Based on your request "${text}", our diagnostics identify a customer-acquisition scale bottleneck. Your cost-of-acquisition (CAC) is disproportionately high due to manual prospecting. Transitioning to automated outbound sequences on LinkedIn is highly recommended.`;
  let opportunities = "1. AAA Lead Chatbots: Sell custom lead-booking chatbots to local dentist or wellness offices.<br>2. Programmatic Landing Pages: Package automated directory templates targeting regional search strings.<br>3. CRM Sync flows: Charge ₹25,000 setups to link checkout webhooks to sales spreadsheets.";
  let automation = "Set up Make.com webhooks: Trigger on Stripe checkout capture --> parse variables via OpenAI GPT-4 API --> generate a PDF client contract --> draft email with document sign link and email template via Resend API.";
  let marketing = "Focus on cold outbound campaign workflows. Scrape directories for target contacts (marketing managers). Send a highly structured 3-part email template showing how customer retention bots improve signup rates by 40%.";
  let leads = "Acquire a directory list using scrapers. Filter target companies with >₹5M ARR. Schedule email sequencing (Smartreach/Instantly) targeting 30 contacts daily. Track open rates (target >60%) and reply rates (target >8%).";
  let revenue = "Shift billing from hourly packages to outcomes. Introduce setup retainers (₹50,000) plus a 10% commission on all monthly conversions generated, increasing customer lifetime value (LTV) by 2.5x.";
  let plan = "<strong>Days 1-30 (Launch Phase)</strong>:<br>- Build landing portfolio presenting live chatbot mockups.<br>- Vett contractors and establish freelancer relationships.<br><br><strong>Days 31-60 (Scale Phase)</strong>:<br>- Run Instantly campaigns contacting 40 leads daily.<br>- Conduct 5-minute video Loom audits for warm replies.<br><br><strong>Days 61-90 (Optimization Phase)</strong>:<br>- Close 3 retainers.<br>- Deploy WhatsApp booking automations and upsell retainer maintenance plans.";

  if (lowText.includes('traffic') || lowText.includes('leads') || lowText.includes('visitor')) {
    analysis = "Traffic bottlenecks indicate lack of distribution diversification. Organic short-video channels and Programmatic SEO lists yield high organic conversions with zero operational advertising budget.";
    opportunities = "1. YouTube Shorts/TikTok video series explaining 'How dentists waste 10 hours weekly'.<br>2. Search directory landing pages.";
    marketing = "Leverage organic value tutorials. Embed template downloads directly in user bio links.";
  } else if (lowText.includes('conversion') || lowText.includes('sell') || lowText.includes('sales')) {
    analysis = "Conversion drops mean poor value validation or bad offer positioning. Tying rates to clear warranties (e.g. 'pay only if leads book') increases trust.";
    opportunities = "Embed interactive conversational chats on client sites to answer queries in under 10 seconds.";
  } else if (lowText.includes('scale') || lowText.includes('expand')) {
    analysis = "Scaling requires founder separation. Automate raw delivery using contractors and focus 100% of weekly time optimizing the client acquisition funnel.";
  }

  return {
    analysis,
    opportunities,
    automation,
    marketing,
    leads,
    revenue,
    plan
  };
}

// Proxy endpoint for live financial market data
app.get('/api/market-data', async (req, res) => {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;
  const symbolsMap = {
    'NIFTY': '^NSEI',
    'SENSEX': '^BSESN',
    'NASDAQ': '^IXIC',
    'SP500': '^GSPC',
    'BTC': 'BTC-USD',
    'ETH': 'ETH-USD',
    'Gold': 'GC-F',
    'USDINR': 'USDINR=X',
    'NVDA': 'NVDA',
    'MSFT': 'MSFT',
    'AAPL': 'AAPL',
    'GOOGL': 'GOOGL'
  };

  const results = {};

  if (finnhubApiKey) {
    try {
      const finnhubSymbols = {
        'NASDAQ': 'IXIC',
        'SP500': 'GSPC',
        'BTC': 'BINANCE:BTCUSDT',
        'ETH': 'BINANCE:ETHUSDT',
        'Gold': 'GC=F',
        'USDINR': 'USDINR=X',
        'NVDA': 'NVDA',
        'MSFT': 'MSFT',
        'AAPL': 'AAPL',
        'GOOGL': 'GOOGL'
      };

      const promises = Object.entries(finnhubSymbols).map(async ([key, sym]) => {
        try {
          const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubApiKey}`, { timeout: 4000 });
          const q = response.data;
          if (q && q.c !== undefined && q.c !== 0) {
            const price = q.c;
            const changePercent = q.dp !== undefined ? q.dp : (q.pc ? ((price - q.pc) / q.pc) * 100 : 0);
            return [key, { price: parseFloat(price.toFixed(2)), change: parseFloat(changePercent.toFixed(2)) }];
          }
        } catch (err) {}
        return [key, null];
      });

      const resList = await Promise.all(promises);
      for (const [key, val] of resList) {
        if (val) {
          results[key] = val;
        }
      }
    } catch (e) {
      console.warn('[Finnhub API] Failed to fetch data:', e.message);
    }
  }

  // Fallback to Yahoo Finance for missing or all indices/stock/crypto symbols
  const missingKeys = Object.keys(symbolsMap).filter(k => !results[k]);
  if (missingKeys.length > 0) {
    const promises = missingKeys.map(async (key) => {
      const sym = symbolsMap[key];
      try {
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 5000
        });
        const result = response.data?.chart?.result?.[0];
        if (result) {
          const meta = result.meta;
          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose || price;
          const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
          return [key, {
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(changePercent.toFixed(2))
          }];
        }
      } catch (err) {}
      return [key, null];
    });

    const resList = await Promise.all(promises);
    for (const [key, val] of resList) {
      if (val) {
        results[key] = val;
      }
    }
  }

  // Verify if we got any valid data
  if (Object.keys(results).length === 0) {
    return res.status(503).json({ error: 'Live market data temporarily unavailable' });
  }

  // Calculate valuations
  const outstandingShares = {
    'NVDA': 24.6e9,
    'MSFT': 7.43e9,
    'AAPL': 15.2e9,
    'GOOGL': 12.2e9
  };

  const usdinrRate = results['USDINR'] ? results['USDINR'].price : 83.5;

  const valuations = {};
  ['NVDA', 'MSFT', 'AAPL', 'GOOGL'].forEach(sym => {
    const data = results[sym];
    if (data) {
      const price = data.price;
      const capUsd = (price * outstandingShares[sym]) / 1e12; // in Trillion USD
      const capInr = capUsd * usdinrRate; // in Trillion INR
      valuations[sym] = {
        price: price,
        change: data.change,
        capUsd: parseFloat(capUsd.toFixed(2)),
        capInr: parseFloat(capInr.toFixed(2))
      };
    } else {
      const fallbackPrices = { 'NVDA': 125.0, 'MSFT': 420.0, 'AAPL': 210.0, 'GOOGL': 175.0 };
      const fallbackChanges = { 'NVDA': 1.25, 'MSFT': -0.42, 'AAPL': 0.85, 'GOOGL': -1.15 };
      const price = fallbackPrices[sym];
      const capUsd = (price * outstandingShares[sym]) / 1e12;
      const capInr = capUsd * usdinrRate;
      valuations[sym] = {
        price: price,
        change: fallbackChanges[sym],
        capUsd: parseFloat(capUsd.toFixed(2)),
        capInr: parseFloat(capInr.toFixed(2))
      };
    }
  });

  results['_valuations'] = valuations;

  // Dynamic calendar events
  const today = new Date();
  const currentMonth = today.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleString('en-US', { month: 'short' }).toUpperCase();
  
  const cpiDay = 12;
  const cpiMonthName = today.getDate() > cpiDay ? nextMonth : currentMonth;

  const earnDay = 28;
  const earnMonthName = today.getDate() > earnDay ? nextMonth : currentMonth;

  results['_calendar'] = [
    { date: `${cpiMonthName} ${cpiDay}`, title: "US CPI Inflation Release", desc: "Directly influences global interest rates & valuations" },
    { date: `${earnMonthName} ${earnDay}`, title: "Big Tech Earnings Season", desc: "NVIDIA, Google, Microsoft report AI investment yields" },
    { date: `${nextMonth} 10`, title: "Global AI Governance Summit", desc: "Standards on safety and commercial licensing released" }
  ];

  // Dynamic trends
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const pSeoFluctuation = (dayOfYear % 5) * 0.5;
  const genSupportFluctuation = (dayOfYear % 7) * 0.3;
  
  results['_trends'] = [
    { title: "Programmatic SEO & Directory Sites", growth: `+${(42.0 + pSeoFluctuation).toFixed(1)}% CAGR`, desc: "AI-generated regional catalog sites driving zero-cost incoming lead lists." },
    { title: "Generative Support Orchestration", growth: `+${(64.5 + genSupportFluctuation).toFixed(1)}% CAGR`, desc: "Replacing traditional support staff pools with LLM agent ticket resolution pipelines." }
  ];

  return res.status(200).json(results);
});

// Proxy endpoint for live business and AI news
app.get('/api/business-news', async (req, res) => {
  const newsApiKey = process.env.NEWS_API_KEY;
  let articles = null;

  if (newsApiKey) {
    try {
      const response = await axios.get(`https://newsapi.org/v2/everything?q=artificial+intelligence+business+startups&language=en&sortBy=publishedAt&pageSize=8&apiKey=${newsApiKey}`, { timeout: 5000 });
      if (response.data && response.data.articles) {
        articles = response.data.articles.map(art => ({
          title: art.title,
          link: art.url,
          pubDate: art.publishedAt,
          source: art.source?.name || 'NewsAPI'
        }));
      }
    } catch (err) {
      console.warn('[NewsAPI] Failed to fetch news:', err.message);
    }
  }

  // Fallback: Fetch Google News RSS feed and parse
  if (!articles || articles.length === 0) {
    try {
      const response = await axios.get('https://news.google.com/rss/search?q=AI+business+startups+technology&hl=en-US&gl=US&ceid=US:en', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 6000
      });
      const xml = response.data;
      const items = [];
      const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
      for (const match of matches) {
        const content = match[1];
        let title = (content.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
        let link = (content.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '';
        let pubDate = (content.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
        let source = (content.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || '';
        
        title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&');
        items.push({
          title,
          link,
          pubDate,
          source
        });
        if (items.length >= 8) break;
      }
      articles = items;
    } catch (err) {
      console.warn('[Google News RSS Fallback] Failed to fetch/parse RSS:', err.message);
    }
  }

  if (!articles || articles.length === 0) {
    return res.status(503).json({ error: 'Live news feed temporarily unavailable' });
  }

  return res.status(200).json(articles);
});

// Wildcard fallback for frontend routing (if any)

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Only listen when running locally as a standalone process
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AI-OS execution platform running on http://localhost:${PORT}`);
    console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  });
}

module.exports = app;
