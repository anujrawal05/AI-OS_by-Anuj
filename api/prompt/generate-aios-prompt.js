const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : null;

// Initialize Supabase Admin Client for database RLS bypass
const supabaseAdmin = (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : null;

const dailyPromptLimitCache = {};

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
      "Generate a complete Suno AI compatible natural English music prompt as a JSON object with a single 'prompt' key.",
      "Do NOT use structured nested JSON formatting. Generate only a single key 'prompt' whose value is a high-quality descriptive paragraph.",
      "Understand user intent automatically.",
      "Detect mood, genre, instruments, vocals and atmosphere.",
      "Improve the user's idea creatively while preserving the original meaning.",
      "Return only one polished English prompt suitable for Suno AI in the 'prompt' field.",
      "Example output format: { \"prompt\": \"Create an emotional cinematic Hindi pop song with soft piano, atmospheric synths, deep male vocals, uplifting chorus and modern electronic production inspired by hope and ambition.\" }"
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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Helper to verify token payload
  async function verifyTokenPayload(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    
    // 1. Try to verify as local Coupon Token
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
      // Ignore and proceed to Supabase JWT verification
    }

    // 2. Try to verify as Supabase JWT Token
    if (supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          // Fetch plan type from public.user_profiles
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .select('plan_type')
            .eq('id', user.id)
            .single();
          if (profileError) {
            console.error('[VerifyToken DB Error Object]:', {
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
        console.error('[Function VerifyToken] Supabase validation failed:', err.message);
      }
    }
    
    return null;
  }

  try {
    // Server-side verification
    const authHeader = req.headers.authorization;
    const verifiedUser = await verifyTokenPayload(authHeader);
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Authentication required. Please log in or enter a valid coupon code to unlock AI-OS premium services.' });
    }

    // Enforce daily prompt limit checks for Basic users
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
      console.error('[Prompt Function] Error: OPENROUTER_API_KEY is not defined in env');
      return res.status(500).json({ error: 'OpenRouter API key is not configured.' });
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

    if (resultText.startsWith('```')) {
      resultText = resultText.replace(/^```(?:json)?\n?/i, '');
      resultText = resultText.replace(/\n?```$/i, '');
      resultText = resultText.trim();
    }

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(resultText);
    } catch (parseError) {
      console.warn('[Prompt Function] JSON Parse Error. Raw content:', resultText);
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
    console.error('[Prompt Function] API error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to generate dynamic prompt.', 
      details: error.response?.data || error.message 
    });
  }
};
