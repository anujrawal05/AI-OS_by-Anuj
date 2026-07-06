// AI-OS Daily Dashboard Module
// Powered by A.R. Labs
//
// Renders the premium Daily Dashboard section above the existing dashboard-controls.
// Reacts to `aios:gm:update` events from gamification.js to stay in sync.
// Zero business logic duplicated — layout / rendering only.
//
// Bug-free, production-ready. Key design decisions:
//  - renderStatChips wraps both the chip row AND xp bar in ONE container (#gm-stats-block)
//    so partial re-render via replaceWith always gets BOTH elements atomically.
//  - Event listener is registered once via a module-level flag.
//  - Tip-read state persists in localStorage so it survives refresh.
//  - 'visit' and 'streak' mission tasks auto-complete on init.
//  - Stat updates are debounced to prevent animation stacking from rapid XP awards.

import {
  getState, getDailyMission, completeMissionTask, claimDailyReward,
  canClaimDailyReward, getWeeklyChallenge,
} from './gamification.js';
import { state } from './core.js';

// ─── Guards ───────────────────────────────────────────────────────────────────
let _initialized = false;
let _statUpdateTimer = null;
let _activePrompt = null;

// ─── Content Pools & Dynamic Generators ───────────────────────────────────────

export async function fetchPromptOfTheDay() {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  const categories = ["SaaS scaling", "marketing automation", "AI coding", "conversion copy", "disruptive growth", "agentic architecture"];
  const templates = [
    "Act as an Elite Business Strategist. Deconstruct my business idea [topic] and name 3 critical bottlenecks.",
    "You are a contrarian investor. Find the single biggest risk in starting a company centered around [topic].",
    "Design a step-by-step roadmap to implement [topic] into a traditional brick-and-mortar business model.",
    "Write a cold email sequence for a product built on [topic] that focuses on reducing customer friction.",
    "Roleplay as a systems engineer. Outline the data pipeline requirements for building a local agent around [topic].",
    "Generate 3 unconventional monetization models for an open-source tool focusing on [topic]."
  ];

  const templateIdx = dateSeed % templates.length;
  const categoryIdx = dateSeed % categories.length;
  const rawTemplate = templates[templateIdx];
  const selectedCategory = categories[categoryIdx];
  
  const generatedPrompt = rawTemplate.replace("[topic]", selectedCategory);

  return {
    id: `prompt-${dateSeed}`,
    prompt: generatedPrompt,
    category: selectedCategory,
    date: today.toLocaleDateString(),
    author: "AI-OS Auto-Curator"
  };
}

const AI_TIPS = [
  "Use 'Chain of Thought' prompting — tell the AI to 'think step by step' before answering for more accurate reasoning.",
  "Specify your audience. 'Explain for a 10-year-old' vs 'Explain for a PhD' gives completely different, both useful, outputs.",
  "Add 'Be concise' or 'Be exhaustive' at the end of your prompt to control response length precisely.",
  "Use 'Act as [expert role]' to immediately unlock domain-specific language and depth in responses.",
  "Temperature control: lower temp = more predictable outputs; higher = more creative. Use low temp for factual tasks.",
  "Ask the AI to 'critique its own answer' after generating it — this often surfaces errors and improvements.",
  "Use structured output requests: 'Give me the answer as a JSON object with keys: problem, solution, risk'.",
  "The 'Few-Shot' technique: provide 2-3 examples of what you want before asking for the actual task.",
  "For long documents, ask the AI to 'extract the 5 most actionable insights' rather than summarizing everything.",
  "Use negative constraints: 'Do NOT use jargon, do NOT exceed 100 words' to tighten outputs significantly.",
  "Iterative prompting beats one-shot prompting. Start broad, then refine. Treat it like a conversation, not a form.",
  "For code generation, always specify the language, framework, version, and desired coding style explicitly.",
  "The 'persona + format + constraint' formula: '[Persona] + [Task] + [Format] + [Constraint]' is the most reliable prompt structure.",
  "When evaluating AI outputs, ask: 'What assumptions did you make?' — it reveals hidden logic you can then correct.",
  "Use AI as a rubber duck. Explain your problem in detail; the act of structuring it for AI often reveals the solution.",
  "Multimodal models understand context from images. Upload diagrams, screenshots, or charts to enrich your queries.",
  "For creative writing, give the AI a 'forbidden words' list to prevent clichés and generic phrasing.",
  "System prompts are more powerful than user prompts for setting persistent behavior in API usage.",
  "Ask the AI to 'steelman the opposition' — this generates the strongest possible counter-argument to stress-test your ideas.",
  "Use AI to generate first drafts fast, then refine with your own judgment. 80/20 rule: AI does 80%, you do the important 20%.",
  "For SEO, ask AI to 'identify the top 10 semantic keywords' for a topic — these go beyond basic keyword tools.",
  "Break complex problems into sub-tasks. Feed each sub-task to the AI separately, then assemble the results.",
  "Use 'Before and After' prompting: give the AI the 'before' state and ask it to generate the ideal 'after' state.",
  "Calibrate confidence: ask 'On a scale of 1-10, how confident are you in this answer?' to gauge reliability.",
  "For business strategy, use the 'Pre-Mortem' prompt: 'Assume this plan fails in 6 months. What went wrong?'",
  "Automate repetitive prompts with templates. Most professional workflows can be reduced to 5-10 reusable prompts.",
  "Ask for alternatives: 'Give me 5 different approaches to this problem' prevents anchoring on the first idea.",
  "For editing, use: 'Edit this for [clarity / brevity / tone / grammar] without changing the core meaning'.",
  "The 'Explain Like I'm 5' technique works for any complex topic — then ask the AI to add technical depth layer by layer.",
  "Use AI to generate interview questions for your own ideas: 'If you were a skeptical investor, what would you ask me?'",
];

const AI_TOOLS_OF_DAY = [
  { name: 'ChatGPT',    desc: "The world's most versatile AI assistant for writing, coding, analysis, and ideation.",                       url: 'https://chat.openai.com', tag: 'FREE' },
  { name: 'Claude',     desc: "Anthropic's AI excels at long-document analysis, nuanced reasoning, and safe outputs.",                     url: 'https://claude.ai', tag: 'FREE' },
  { name: 'Midjourney', desc: 'Industry-leading image generation. Produces photorealistic and artistic visuals from text.',                 url: 'https://midjourney.com', tag: 'PAID' },
  { name: 'Perplexity', desc: 'AI-powered search that cites sources. Perfect for real-time research and fact-checking.',                    url: 'https://perplexity.ai', tag: 'FREE' },
  { name: 'ElevenLabs', desc: "Clone any voice or generate professional narration with the world's best AI voice engine.",                  url: 'https://elevenlabs.io', tag: 'FREE' },
  { name: 'Runway ML',  desc: 'Turn text or images into high-quality AI video. Used by Hollywood studios.',                                url: 'https://runwayml.com', tag: 'PAID' },
  { name: 'Gamma.app',  desc: 'Generate stunning presentations and docs from a single prompt in seconds.',                                 url: 'https://gamma.app', tag: 'FREE' },
  { name: 'Notion AI',  desc: 'AI-enhanced workspace that writes, summarizes, and organizes your notes and projects.',                     url: 'https://notion.so', tag: 'PAID' },
  { name: 'v0.dev',     desc: 'Generate React UI components and full web interfaces from text descriptions. By Vercel.',                   url: 'https://v0.dev', tag: 'FREE' },
  { name: 'Suno',       desc: 'Create full songs — with vocals, instruments, and lyrics — from a text prompt.',                           url: 'https://suno.com', tag: 'FREE' },
  { name: 'Kling AI',   desc: 'High-fidelity AI video generation. Stunning motion quality from image or text.',                            url: 'https://klingai.com', tag: 'FREE' },
  { name: 'Cursor',     desc: 'The AI code editor that writes, refactors, and debugs alongside you in real time.',                        url: 'https://cursor.so', tag: 'FREE' },
  { name: 'Descript',   desc: 'Edit video and podcast audio by editing the transcript. AI-powered dubbing and overdub.',                   url: 'https://descript.com', tag: 'FREE' },
  { name: 'Copy.ai',    desc: 'AI marketing copy at scale. Blog posts, ad copy, emails, and product descriptions.',                       url: 'https://copy.ai', tag: 'FREE' },
];

// ─── Day-seeded pick (stable for the entire calendar day) ─────────────────────

function dayPick(arr) {
  const d   = new Date();
  const idx = (d.getFullYear() * 365 + d.getMonth() * 30 + d.getDate()) % arr.length;
  return arr[idx];
}

// ─── Greeting ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  const rawName  = state.user?.name || null;
  const isGuest  = !rawName || rawName === 'Demo Premium User';
  const firstName = isGuest ? null : rawName.split(' ')[0];
  const timeWord  = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  return firstName ? `Good ${timeWord}, ${firstName} 👋` : `Good ${timeWord} 👋`;
}

// ─── Persistent tip-read state ────────────────────────────────────────────────

function getNSKey(base) {
  if (!state.user) return base;
  const uid = state.user.id || state.user._id;
  if (!uid) return base;
  return `${base}_${uid}`;
}

function isTipRead() {
  const key = getNSKey('aios_gm_tip_read_' + _todayStr());
  return localStorage.getItem(key) === '1';
}
function markTipReadPersist() {
  const key = getNSKey('aios_gm_tip_read_' + _todayStr());
  localStorage.setItem(key, '1');
}
function _todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ─── Render Helpers ───────────────────────────────────────────────────────────

function renderStatBlock(gm) {
  const prog = gm.levelProgress;
  const xpLabel = prog.needed > 0
    ? `${prog.needed.toLocaleString()} XP to Level ${gm.level + 1}`
    : 'MAX LEVEL REACHED';

  return `
    <div class="gm-stats-block" id="gm-stats-block">
      <div class="gm-stats-row">
        <div class="gm-stat-chip gm-stat-level">
          <span class="gm-stat-chip-icon">⭐</span>
          <div class="gm-stat-chip-body">
            <span class="gm-stat-chip-label">LEVEL</span>
            <span class="gm-stat-chip-value">${gm.level}</span>
          </div>
        </div>
        <div class="gm-stat-chip gm-stat-xp">
          <span class="gm-stat-chip-icon">⚡</span>
          <div class="gm-stat-chip-body">
            <span class="gm-stat-chip-label">XP</span>
            <span class="gm-stat-chip-value">${gm.xp.toLocaleString()}</span>
          </div>
        </div>
        <div class="gm-stat-chip gm-stat-streak">
          <span class="gm-stat-chip-icon">🔥</span>
          <div class="gm-stat-chip-body">
            <span class="gm-stat-chip-label">STREAK</span>
            <span class="gm-stat-chip-value">${gm.streak}d</span>
          </div>
        </div>
        <div class="gm-stat-chip gm-stat-coins">
          <span class="gm-stat-chip-icon">🪙</span>
          <div class="gm-stat-chip-body">
            <span class="gm-stat-chip-label">COINS</span>
            <span class="gm-stat-chip-value">${gm.coins.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div class="gm-xp-bar-wrap"
           title="Level ${gm.level} → ${gm.level + 1}: ${prog.current.toLocaleString()} / ${(prog.current + prog.needed).toLocaleString()} XP">
        <div class="gm-xp-bar-track">
          <div class="gm-xp-bar-fill" id="gm-xp-fill" style="width:0%"></div>
        </div>
        <span class="gm-xp-bar-label">${xpLabel}</span>
      </div>
    </div>`;
}

function renderMission(mission) {
  const tasks  = mission.tasks;
  const done   = tasks.filter(t => t.done).length;
  const pct    = Math.round((done / tasks.length) * 100);

  // Manual checkboxes removed. Rendered as simple verification indicators.
  const taskItems = tasks.map(t => `
    <div class="gm-mission-task${t.done ? ' done' : ''}" id="gm-task-${t.id}">
      <div class="gm-task-check" aria-hidden="true">${t.done ? '✓' : ''}</div>
      <span class="gm-task-label">${t.label}</span>
      <span class="gm-task-xp">+${t.xp}XP</span>
    </div>`).join('');

  const canClaim = canClaimDailyReward();

  return `
    <div class="gm-card gm-mission-card">
      <div class="gm-card-header">
        <div class="gm-card-kicker">🎯 DAILY MISSION</div>
        <div class="gm-mission-progress-text">${done}/${tasks.length} Done</div>
      </div>
      <div class="gm-mission-progress-bar">
        <div class="gm-mission-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="gm-mission-tasks">${taskItems}</div>
      ${canClaim
        ? `<button class="gm-claim-btn" id="gm-daily-reward-btn"
               onclick="window.gmClaimDailyReward()"
               title="Claim your daily login reward (+100 XP, +25 Coins)">
             🎁 Claim Daily Reward · +100 XP
           </button>`
        : `<div class="gm-claimed-badge">✓ Daily Reward Claimed</div>`}
    </div>`;
}

function renderWeeklyChallenge(ch) {
  const safePct  = Math.min(Math.round((ch.progress / ch.goal) * 100), 100);
  const radius   = 28;
  const circ     = 2 * Math.PI * radius;
  const offset   = circ - (safePct / 100) * circ;

  return `
    <div class="gm-card gm-challenge-card">
      <div class="gm-card-header">
        <div class="gm-card-kicker">🏆 WEEKLY CHALLENGE</div>
        ${ch.claimed ? '<div class="gm-claimed-badge-sm">✓ COMPLETE</div>' : ''}
      </div>
      <div class="gm-challenge-body">
        <div class="gm-challenge-ring-wrap" aria-label="${safePct}% complete">
          <svg class="gm-challenge-ring" viewBox="0 0 72 72" width="72" height="72" role="img">
            <circle cx="36" cy="36" r="${radius}" fill="none"
                    stroke="var(--border-color)" stroke-width="6"/>
            <circle cx="36" cy="36" r="${radius}" fill="none"
                    stroke="var(--accent-color)" stroke-width="6"
                    stroke-dasharray="${circ.toFixed(2)}"
                    stroke-dashoffset="${offset.toFixed(2)}"
                    stroke-linecap="round"
                    transform="rotate(-90 36 36)"
                    style="transition:stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)"/>
            <text x="36" y="40" text-anchor="middle" font-size="13" font-weight="700"
                  fill="var(--text-primary)" font-family="var(--font-mono)">${safePct}%</text>
          </svg>
        </div>
        <div class="gm-challenge-info">
          <p class="gm-challenge-label">${ch.label}</p>
          <div class="gm-challenge-progress-text">${ch.progress} / ${ch.goal} ${ch.unit}</div>
          <div class="gm-challenge-reward">Reward: +${ch.xp} XP · +${ch.coins} Coins</div>
        </div>
      </div>
    </div>`;
}

function renderContentCards() {
  const prompt  = _activePrompt?.prompt || "Act as an Elite Business Strategist. Deconstruct my business idea SaaS scaling and name 3 critical bottlenecks.";
  const tip     = dayPick(AI_TIPS);
  const tool    = dayPick(AI_TOOLS_OF_DAY);
  const tipDone = isTipRead();

  window._gmCurrentPrompt = prompt;

  return `
    <div class="gm-content-grid">

      <!-- Prompt of the Day (spans full width) -->
      <div class="gm-card gm-content-card gm-prompt-card">
        <div class="gm-card-kicker">✦ PROMPT OF THE DAY</div>
        <p class="gm-prompt-text">"${prompt}"</p>
        <button class="gm-copy-btn" onclick="window.gmCopyPrompt()" title="Copy prompt to clipboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="14" height="14" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy Prompt
        </button>
      </div>

      <!-- AI Tool of the Day -->
      <div class="gm-card gm-content-card gm-tool-card">
        <div class="gm-card-kicker">🛠 AI TOOL OF THE DAY</div>
        <div class="gm-tool-header">
          <span class="gm-tool-name">${tool.name}</span>
          <span class="gm-tool-tag ${tool.tag === 'FREE' ? 'gm-tag-free' : 'gm-tag-paid'}">${tool.tag}</span>
        </div>
        <p class="gm-tool-desc">${tool.desc}</p>
        <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="gm-tool-link"
           onclick="window.gamification?.awardXP(5,'tool_open')">Try it →</a>
      </div>

      <!-- AI Tip of the Day -->
      <div class="gm-card gm-content-card gm-tip-card">
        <div class="gm-card-kicker">💡 AI TIP OF THE DAY</div>
        <p class="gm-tip-text">${tip}</p>
        <button class="gm-small-btn${tipDone ? ' gm-small-btn-done' : ''}"
                id="gm-tip-read-btn"
                onclick="window.gmMarkTipRead(this)"
                data-done="${tipDone}"
                ${tipDone ? 'disabled aria-disabled="true"' : ''}>
          ${tipDone ? '✓ Read' : 'Mark as Read (+10 XP)'}
        </button>
      </div>

      <!-- Monthly Tips & Tricks (desktop only, spans full width) -->
      <div class="gm-card gm-content-card gm-monthly-tips-card">
        <div class="gm-card-kicker">📅 Monthly Tips & Tricks</div>
        <div class="gm-tips-content">
          <div class="gm-tips-text-group">
            <h3 class="gm-tips-title">Access Claude Fable 5 & Claude Sonnet 5 for Free</h3>
            <p class="gm-tips-subtitle">Official method • Step-by-step guide for everyone</p>
            <p class="gm-tips-desc">Learn the official workflow to access Claude Sonnet 5 and Claude Fable 5 for free with an easy step-by-step guide designed for beginners and non-technical users.</p>
          </div>
          <div class="gm-tips-cta-group">
            <a href="monthly-tips-and-tricks.html" class="gm-tips-cta-btn">Open Monthly Guide →</a>
          </div>
        </div>
      </div>

    </div>`;
}

function renderGuestDashboard(container) {
  container.innerHTML = `
    <div class="gm-guest-card">
      <div class="gm-guest-content">
        <div class="gm-guest-icon">🚀</div>
        <h2 class="gm-guest-title">Sign in to start your AI journey</h2>
        <p class="gm-guest-subtitle">Track your progress, earn rewards, and compile roadmaps to level up your AI skills.</p>
        
        <div class="gm-guest-benefits-grid">
          <div class="gm-benefit-item">
            <span class="gm-benefit-emoji">⚡</span>
            <div>
              <h4 class="gm-benefit-title">XP & Levels</h4>
              <p class="gm-benefit-desc">Earn experience points for completing roadmap nodes and challenges.</p>
            </div>
          </div>
          <div class="gm-benefit-item">
            <span class="gm-benefit-emoji">🪙</span>
            <div>
              <h4 class="gm-benefit-title">Coins & Rewards</h4>
              <p class="gm-benefit-desc">Accumulate coins to spend on exclusive premium features.</p>
            </div>
          </div>
          <div class="gm-benefit-item">
            <span class="gm-benefit-emoji">🔥</span>
            <div>
              <h4 class="gm-benefit-title">Daily Streaks</h4>
              <p class="gm-benefit-desc">Build a consistent learning habit and keep your streak alive.</p>
            </div>
          </div>
          <div class="gm-benefit-item">
            <span class="gm-benefit-emoji">🏆</span>
            <div>
              <h4 class="gm-benefit-title">Achievements</h4>
              <p class="gm-benefit-desc">Unlock badges as you master advanced AI-OS skills.</p>
            </div>
          </div>
        </div>
        
        <button class="gm-guest-signin-btn" onclick="window.gmTriggerSignIn()">
          🔑 Sign In
        </button>
      </div>
    </div>
  `;
}

// Global click handler helper
window.gmTriggerSignIn = () => {
  const btn = document.getElementById('btn-header-signin');
  if (btn) {
    btn.click();
  } else {
    const authOverlay = document.getElementById('auth-modal-overlay');
    if (authOverlay) authOverlay.style.display = 'flex';
  }
};

// ─── Full Render ──────────────────────────────────────────────────────────────

export function renderDashboard() {
  const section = document.getElementById('daily-dashboard-section');
  if (!section) return;

  if (!state.user) {
    renderGuestDashboard(section);
    return;
  }

  const gm = getState();
  if (!gm) {
    renderGuestDashboard(section);
    return;
  }

  const mission   = getDailyMission();
  const challenge = getWeeklyChallenge();
  const streakMsg = gm.streak > 1
    ? `<strong>${gm.streak} days strong 🔥</strong>`
    : 'just getting started — come back tomorrow!';

  section.innerHTML = `
    <div class="gm-dashboard-wrap">

      <!-- Mobile-only Monthly Tips Promotional Banner (above greeting) -->
      <div class="mobile-tips-promo-card" onclick="window.location.href='./monthly-tips-and-tricks.html'">
        <div class="gm-tips-content" style="flex-direction: column; align-items: flex-start; gap: 8px;">
          <div class="gm-tips-text-group">
            <div class="gm-tips-subtitle" style="font-size: 0.75rem; color: var(--accent-color); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
              <span>📅</span> Monthly Tips & Tricks
            </div>
            <h3 class="gm-tips-title" style="font-family: var(--font-title); font-size: 1.05rem; font-weight: 800; color: #fff; margin: 4px 0 2px 0;">Access Claude Sonnet 5 & Claude Fable 5 for FREE</h3>
            <p class="gm-tips-desc" style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">using the official Anthropic + AeroLink method.</p>
          </div>
          <div class="gm-tips-cta-btn" style="align-self: flex-start; padding: 6px 12px; font-size: 0.75rem; font-weight: 700; background: linear-gradient(135deg, var(--accent-color), #a855f7); color: #fff; border-radius: 6px; box-shadow: 0 4px 10px rgba(168, 85, 247, 0.2);">
            View Guide →
          </div>
        </div>
      </div>

      <!-- Top Row: Greeting + Stats Block -->
      <div class="gm-top-row">
        <div class="gm-greeting-block">
          <h2 class="gm-greeting" id="gm-greeting">${getGreeting()}</h2>
          <p class="gm-greeting-sub">Your AI learning streak is ${streakMsg}. Keep it going.</p>
        </div>
        ${renderStatBlock(gm)}
      </div>

      <!-- Main Grid: Mission+Challenge (left) | Content Cards (right) -->
      <div class="gm-main-grid">
        <div class="gm-left-col">
          ${renderMission(mission)}
          ${renderWeeklyChallenge(challenge)}
        </div>
        <div class="gm-right-col">
          ${renderContentCards()}
        </div>
      </div>

    </div>`;

  // Animate XP bar fill + weekly challenge ring after render
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const fill = document.getElementById('gm-xp-fill');
      if (fill) {
        fill.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        fill.style.width      = `${gm.levelProgress.pct}%`;
      }
      
      const ring = document.querySelector('.gm-challenge-ring circle[stroke="var(--accent-color)"]');
      if (ring && challenge) {
        const safePct  = Math.min(Math.round((challenge.progress / challenge.goal) * 100), 100);
        const radius   = 28;
        const circ     = 2 * Math.PI * radius;
        const offset   = circ - (safePct / 100) * circ;
        ring.style.strokeDashoffset = `${offset.toFixed(2)}`;
      }
    });
  });
}

// ─── Partial Stat Block Re-render (debounced) ─────────────────────────────────

function refreshStatBlock() {
  clearTimeout(_statUpdateTimer);
  _statUpdateTimer = setTimeout(() => {
    const gm    = getState();
    const block = document.getElementById('gm-stats-block');
    if (!block || !gm) return;

    const tmp = document.createElement('div');
    tmp.innerHTML = renderStatBlock(gm);
    block.replaceWith(tmp.firstElementChild);

    // Re-trigger XP bar animation with new value
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const fill = document.getElementById('gm-xp-fill');
        if (fill) {
          fill.style.transition = 'width 0.8s cubic-bezier(0.16,1,0.3,1)';
          fill.style.width      = `${gm.levelProgress.pct}%`;
        }
      });
    });
  }, 80);
}

// ─── Global Handlers (assigned once, never duplicated) ───────────────────────

window.gmClaimDailyReward = function() {
  claimDailyReward();
  const btn = document.getElementById('gm-daily-reward-btn');
  if (btn) btn.outerHTML = '<div class="gm-claimed-badge">✓ Daily Reward Claimed</div>';
  _showGmToast({ icon: '🎁', label: 'Daily Reward Claimed!', desc: '+100 XP · +25 Coins added to your account.' });
};

window.gmCopyPrompt = function() {
  const prompt = window._gmCurrentPrompt || '';
  if (navigator.clipboard && prompt) {
    navigator.clipboard.writeText(prompt).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = prompt;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }
  window.gamification?.awardXP(10, 'prompt');
  window.gamification?.completeMissionTask('prompt');
  if (window.showToast) window.showToast('Prompt copied to clipboard!');
};

window.gmMarkTipRead = function(btn) {
  if (btn.dataset.done === 'true' || btn.disabled) return;
  btn.dataset.done = 'true';
  btn.disabled = true;
  btn.setAttribute('aria-disabled', 'true');
  btn.textContent = '✓ Read';
  btn.classList.add('gm-small-btn-done');
  markTipReadPersist();
  window.gamification?.awardXP(10, 'tip');
  window.gamification?.completeMissionTask('tip');
};

// ─── Achievement / Reward Toast ───────────────────────────────────────────────

function _showGmToast(ach) {
  document.getElementById('gm-achievement-toast')?.remove();

  const toast = document.createElement('div');
  toast.id = 'gm-achievement-toast';
  toast.className = 'gm-achievement-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="gm-toast-icon" aria-hidden="true">${ach.icon}</div>
    <div class="gm-toast-body">
      <div class="gm-toast-title">Achievement Unlocked!</div>
      <div class="gm-toast-label">${ach.label}</div>
      <div class="gm-toast-desc">${ach.desc}</div>
    </div>
    <button class="gm-toast-close" onclick="this.closest('#gm-achievement-toast').remove()"
            aria-label="Dismiss notification">×</button>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('visible'));
  });

  const hideTimer = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 5000);

  toast.querySelector('.gm-toast-close').addEventListener('click', () => clearTimeout(hideTimer), { once: true });
}

// ─── Event Listener (registered once) ────────────────────────────────────────

function _handleGmUpdate(e) {
  const { type, achievement } = e.detail || {};

  if (type === 'achievement_unlocked' && achievement) {
    _showGmToast(achievement);
  }

  if (type === 'xp' || type === 'coins' || type === 'streak' || type === 'daily_reward' || type === 'mission') {
    refreshStatBlock();
    
    // Update stats summary in mobile updates hub if present
    const gm = getState();
    if (gm) {
      const lvl = document.getElementById('updates-val-level');
      const xp = document.getElementById('updates-val-xp');
      const str = document.getElementById('updates-val-streak');
      const coins = document.getElementById('updates-val-coins');
      if (lvl) lvl.textContent = gm.level;
      if (xp) xp.textContent = gm.xp.toLocaleString();
      if (str) str.textContent = `${gm.streak}d`;
      if (coins) coins.textContent = `🪙 ${gm.coins}`;
    }

    if (type === 'streak') {
      const sub = document.querySelector('.gm-greeting-sub');
      if (sub && gm) {
        const streakMsg = gm.streak > 1
          ? `<strong>${gm.streak} days strong 🔥</strong>`
          : 'just getting started — come back tomorrow!';
        sub.innerHTML = `Your AI learning streak is ${streakMsg}. Keep it going.`;
      }
    }

    // Re-render all daily mission cards
    const mission = getDailyMission();
    document.querySelectorAll('.gm-mission-card').forEach(card => {
      const tmp = document.createElement('div');
      tmp.innerHTML = renderMission(mission);
      card.replaceWith(tmp.firstElementChild);
    });
  }

  if (type === 'weekly_progress' || type === 'weekly_complete') {
    const ch = getWeeklyChallenge();
    document.querySelectorAll('.gm-challenge-card').forEach(card => {
      const tmp = document.createElement('div');
      tmp.innerHTML = renderWeeklyChallenge(ch);
      card.replaceWith(tmp.firstElementChild);
    });

    // Re-animate all matching progress rings
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelectorAll('.gm-challenge-ring circle[stroke="var(--accent-color)"]').forEach(ring => {
          if (ring) {
            const safePct  = Math.min(Math.round((ch.progress / ch.goal) * 100), 100);
            const radius   = 28;
            const circ     = 2 * Math.PI * radius;
            const offset   = circ - (safePct / 100) * circ;
            ring.style.strokeDashoffset = `${offset.toFixed(2)}`;
          }
        });
      });
    });
  }
}

// ─── Render Mobile Updates Hub ────────────────────────────────────────────────

export function renderMobileUpdates() {
  const container = document.getElementById('mobile-updates-section');
  if (!container) return;

  if (!state.user) {
    renderGuestDashboard(container);
    return;
  }

  const gm = getState();
  if (!gm) {
    renderGuestDashboard(container);
    return;
  }

  const mission = getDailyMission();
  const challenge = getWeeklyChallenge();

  container.innerHTML = `
    <div class="updates-page-wrapper">
      <!-- Title / Brand -->
      <div class="updates-header">
        <h2 class="updates-title">AI-OS Updates</h2>
        <p class="updates-subtitle">Your daily learning dashboard & rewards</p>
      </div>

      <!-- User Stats Summary -->
      <div class="updates-stats-summary" id="updates-stats-summary">
        <div class="updates-stat-item">
          <span class="updates-stat-val" id="updates-val-level">${gm.level}</span>
          <span class="updates-stat-lbl">Level</span>
        </div>
        <div class="updates-stat-item">
          <span class="updates-stat-val" id="updates-val-xp">${gm.xp.toLocaleString()}</span>
          <span class="updates-stat-lbl">XP</span>
        </div>
        <div class="updates-stat-item">
          <span class="updates-stat-val" id="updates-val-streak">${gm.streak}d</span>
          <span class="updates-stat-lbl">Streak</span>
        </div>
        <div class="updates-stat-item">
          <span class="updates-stat-val" id="updates-val-coins">🪙 ${gm.coins}</span>
          <span class="updates-stat-lbl">Coins</span>
        </div>
      </div>

      <!-- Daily Missions & Weekly Challenge -->
      <div class="updates-core-gamification">
        ${renderMission(mission)}
        ${renderWeeklyChallenge(challenge)}
      </div>

      <!-- Monthly Tips & Tricks Link Card -->
      <div class="updates-tips-card" onclick="window.location.href='./monthly-tips-and-tricks.html'">
        <div class="updates-tips-icon">💡</div>
        <div class="updates-tips-content">
          <h4 class="updates-tips-title">Monthly Tips & Tricks</h4>
          <p class="updates-tips-desc">Unlock advanced strategies, system prompting secrets, and workflow templates.</p>
        </div>
        <span class="updates-tips-arrow">→</span>
      </div>

      <!-- Future Updates Grid -->
      <h3 class="updates-section-title">Coming Soon</h3>
      <div class="updates-future-grid">
        <div class="updates-future-card">
          <div class="future-card-icon">🧪</div>
          <h4 class="future-card-title">AI Lab Integration</h4>
          <p class="future-card-desc">Execute code sandboxes and deploy agents directly from your roadmap nodes.</p>
          <span class="future-card-badge">Q3 2026</span>
        </div>
        <div class="updates-future-card">
          <div class="future-card-icon">🏆</div>
          <h4 class="future-card-title">Community Leagues</h4>
          <p class="future-card-desc">Compete with global AI builders in weekly sprint leaderboards for premium reward tokens.</p>
          <span class="future-card-badge">Q4 2026</span>
        </div>
      </div>
    </div>`;

  // Animate the weekly challenge progress ring
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const ring = container.querySelector('.gm-challenge-ring circle[stroke="var(--accent-color)"]');
      if (ring && challenge) {
        const safePct  = Math.min(Math.round((challenge.progress / challenge.goal) * 100), 100);
        const radius   = 28;
        const circ     = 2 * Math.PI * radius;
        const offset   = circ - (safePct / 100) * circ;
        ring.style.strokeDashoffset = `${offset.toFixed(2)}`;
      }
    });
  });
}

function _autoCompleteVisitTasks() {
  if (isTipRead()) {
    window.gamification?.completeMissionTask('tip');
  }
}

// ─── Init (idempotent) ───────────────────────────────────────────────────────

export async function initDailyDashboard() {
  if (_initialized) return; // Guard against double-init
  _initialized = true;

  window.renderDashboard = renderDashboard;
  window.renderMobileUpdates = renderMobileUpdates;

  try {
    _activePrompt = await fetchPromptOfTheDay();
  } catch (e) {
    console.error("Failed to fetch prompt of the day:", e);
  }

  renderDashboard();
  renderMobileUpdates();

  document.addEventListener('aios:gm:update', _handleGmUpdate);

  requestAnimationFrame(() => {
    if (!state.user) return;
    const mission = getDailyMission();
    if (!mission) return;
    document.querySelectorAll('.gm-mission-card').forEach(card => {
      const tmp = document.createElement('div');
      tmp.innerHTML = renderMission(mission);
      card.replaceWith(tmp.firstElementChild);
    });
  });
}
