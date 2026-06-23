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

// Route: AI JSON Prompt Generator
app.post('/api/prompt/generate-aios-prompt', async (req, res) => {
  try {
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
          "Generate structured JSON for AI music generation.",
          "Infer genre, instruments, emotion, BPM and vocal style automatically."
        ]
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

    return res.status(200).json({
      success: true,
      prompt: parsedJSON
    });

  } catch (error) {
    console.error('[Prompt Server] API error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Failed to generate dynamic prompt.', 
      details: error.response?.data || error.message 
    });
  }
});

// Wildcard fallback for frontend routing (if any)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI-OS execution platform running on http://localhost:${PORT}`);
});
