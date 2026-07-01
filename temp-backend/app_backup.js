// --- Stateless CSRF & Backend Mock API Interceptor ---
(function() {
  const originalFetch = window.fetch;
  const mockUser = {
    id: "demo-user-123",
    email: "demo@aios.com",
    name: "Demo Premium User",
    gender: "Male",
    profession: "Business Owner",
    date_of_birth: "1995-01-01",
    plan_type: "Premium",
    trial_started_at: new Date().toISOString(),
    trial_expires_at: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
    trial_days_remaining: 3,
    is_coupon: false
  };

  window.fetch = function (url, options = {}) {
    const urlString = String(url);
    if (urlString.includes('/api/')) {
      console.log(`[Mock API Interceptor] Intercepted: ${urlString}`);
      
      let responseBody = { success: true };
      
      if (urlString.includes('/api/auth/me') || urlString.includes('/api/auth/profile')) {
        responseBody = { success: true, user: mockUser };
      } else if (urlString.includes('/api/auth/status') || urlString.includes('/api/auth/kinde-session')) {
        responseBody = { authenticated: true, user: mockUser };
      } else if (urlString.includes('/api/auth/login')) {
        responseBody = { success: true, hasDetails: true, user: mockUser, message: "Logged in successfully" };
      } else if (urlString.includes('/api/auth/signup')) {
        responseBody = { success: true, message: "Registration successful. A verification code has been sent to your email." };
      } else if (urlString.includes('/api/auth/verify-otp') || urlString.includes('/api/auth/verify-email')) {
        responseBody = { success: true, message: "Email verified successfully.", user: mockUser };
      } else if (urlString.includes('/api/auth/update-profile')) {
        let parsed = {};
        try { parsed = JSON.parse(options.body || '{}'); } catch(e) {}
        const updated = { ...mockUser, name: parsed.full_name || mockUser.name, gender: parsed.gender || mockUser.gender, profession: parsed.profession || mockUser.profession, date_of_birth: parsed.date_of_birth || mockUser.date_of_birth };
        responseBody = { success: true, profile: { id: updated.id, email: updated.email, full_name: updated.name, date_of_birth: updated.date_of_birth, gender: updated.gender, profession: updated.profession, plan_type: "Premium" } };
      } else if (urlString.includes('/api/auth/logout')) {
        responseBody = { success: true, message: "Logged out successfully." };
      } else if (urlString.includes('/api/auth/forgot-password') || urlString.includes('/api/auth/reset-password')) {
        responseBody = { success: true, message: "Action completed successfully." };
      } else if (urlString.includes('/api/config')) {
        responseBody = { razorpayKeyId: 'rzp_test_mockKey123' };
      } else if (urlString.includes('/api/create-order')) {
        responseBody = { success: true, orderId: 'order_mock123', amount: 9900 };
      } else if (urlString.includes('/api/verify-payment')) {
        responseBody = { success: true, message: "Payment verified successfully." };
      } else if (urlString.includes('/api/videos')) {
        responseBody = {
          success: true,
          buildVideos: [
            "AAA_eng.mp4", "AAA_hindi.mp4", "AI_Nursery_Rhyme_Engine_eng.mp4", "AI_Nursery_Rhyme_Engine_hindi.mp4",
            "AI_Video_Ad_Pipeline_eng.mp4", "AI_Video_Ad_Pipeline_hindi.mp4", "Content_Engine_eng.mp4", "Content_Engine_hindi.mp4",
            "Drop-Servicing_Sprint_eng.mp4", "Drop-Servicing_Sprint_hindi.mp4", "Inbound_Voice_AI_Studio_eng.mp4", "Inbound_Voice_AI_Studio_hindi.mp4",
            "Managed_Creator_Network_eng.mp4", "Managed_Creator_Network_hindi.mp4", "Motion_Script_Compiler_eng.mp4", "Motion_Script_Compiler_hindi.mp4",
            "SaaS_eng.mp4", "SaaS_hindi.mp4"
          ],
          exploreVideos: [
            "part1_eng.mp4", "part1_hindi.mp4", "part2_eng.mp4", "part2_hindi.mp4", "part3_eng.mp4", "part3_hindi.mp4",
            "part4_eng.mp4", "part4_hindi.mp4", "part5_eng.mp4", "part5_hindi.mp4"
          ]
        };
      } else if (urlString.includes('/api/market-data')) {
        responseBody = {
          "NASDAQ": { "price": 19000, "change": 1.2 },
          "SP500": { "price": 5400, "change": 0.8 },
          "BTC": { "price": 65000, "change": -2.3 },
          "ETH": { "price": 3500, "change": -1.5 },
          "Gold": { "price": 2300, "change": 0.4 },
          "USDINR": { "price": 83.5, "change": 0.1 },
          "_valuations": {
            "NVDA": { "price": 125.0, "change": 1.25, "capUsd": 3.0, "capInr": 250.0 },
            "MSFT": { "price": 420.0, "change": -0.42, "capUsd": 3.1, "capInr": 258.0 },
            "AAPL": { "price": 210.0, "change": 0.85, "capUsd": 3.2, "capInr": 267.0 },
            "GOOGL": { "price": 175.0, "change": -1.15, "capUsd": 2.1, "capInr": 175.0 }
          },
          "_calendar": [
            { "date": "JUL 12", "title": "US CPI Inflation Release", "desc": "Directly influences global interest rates & valuations" },
            { "date": "JUL 28", "title": "Big Tech Earnings Season", "desc": "NVIDIA, Google, Microsoft report AI investment yields" },
            { "date": "AUG 10", "title": "Global AI Governance Summit", "desc": "Standards on safety and commercial licensing released" }
          ],
          "_trends": [
            { "title": "Programmatic SEO & Directory Sites", "growth": "+42.0% CAGR", "desc": "AI-generated regional catalog sites driving zero-cost incoming lead lists." },
            { "title": "Generative Support Orchestration", "growth": "+64.5% CAGR", "desc": "Replacing traditional support staff pools with LLM agent ticket resolution pipelines." }
          ]
        };
      } else if (urlString.includes('/api/business-news')) {
        responseBody = [
          { "title": "AI Agents Set to Transform Enterprise Automation in 2026", "link": "#", "pubDate": new Date().toISOString(), "source": "TechNews" },
          { "title": "Startups Leverage Programmatic SEO for Hyper-Growth", "link": "#", "pubDate": new Date().toISOString(), "source": "BizVenture" },
          { "title": "How LLMs are Restructuring Customer Support Pipelines", "link": "#", "pubDate": new Date().toISOString(), "source": "SaaSReview" },
          { "title": "NVIDIA Releases Next-Generation Custom Inference Chips", "link": "#", "pubDate": new Date().toISOString(), "source": "InferenceWeekly" }
        ];
      } else if (urlString.includes('/api/prompt/generate-aios-prompt')) {
        let parsed = {};
        try { parsed = JSON.parse(options.body || '{}'); } catch(e) {}
        responseBody = {
          success: true,
          prompt: "An award-winning cinematic scene: " + (parsed.userInput || "AI-OS custom prompt template"),
          quota: { "remaining": "unlimited", "limit": "unlimited" }
        };
      } else if (urlString.includes('/api/strategist/chat')) {
        let parsed = {};
        try { parsed = JSON.parse(options.body || '{}'); } catch(e) {}
        const mode = parsed.mode || 'compile';
        if (mode === 'chat') {
          responseBody = {
            success: true,
            reply: `I received your follow-up query: "<strong>${parsed.userInput}</strong>". As your corporate consultant, I recommend launching the automation sequences immediately.`,
            quota: { "remaining": "unremaining", "limit": "unlimited" }
          };
        } else {
          responseBody = {
            success: true,
            analysis: `Strategic diagnostics for "${parsed.businessName || 'Your Business'}": Identified customer-acquisition scale bottleneck. Transitioning to automated outbound sequences is highly recommended.`,
            opportunities: "1. AAA Lead Chatbots: Sell custom lead-booking chatbots to local dentist or wellness offices.<br>2. Programmatic Landing Pages: Package automated directory templates targeting regional search strings.<br>3. CRM Sync flows: Charge ₹25,000 setups to link checkout webhooks to sales spreadsheets.",
            automation: "Set up Make.com webhooks: Trigger on Stripe checkout capture --> parse variables via OpenAI GPT-4 API --> generate a PDF client contract --> draft email with document sign link and email template via Resend API.",
            marketing: "Focus on cold outbound campaign workflows. Scrape directories for target contacts (marketing managers). Send a highly structured 3-part email template showing how customer retention bots improve signup rates by 40%.",
            leads: "Acquire a directory list using scrapers. Filter target companies with >₹5M ARR. Schedule email sequencing (Smartreach/Instantly) targeting 30 contacts daily. Track open rates (target >60%) and reply rates (target >8%).",
            revenue: "Shift billing from hourly packages to outcomes. Introduce setup retainers (₹50,000) plus a 10% commission on all monthly conversions generated, increasing customer lifetime value (LTV) by 2.5x.",
            plan: "<strong>Days 1-30 (Launch Phase)</strong>:<br>- Build landing portfolio presenting live chatbot mockups.<br>- Vett contractors and establish freelancer relationships.<br><br><strong>Days 31-60 (Scale Phase)</strong>:<br>- Run Instantly campaigns contacting 40 leads daily.<br>- Conduct 5-minute video Loom audits for warm replies.<br><br><strong>Days 61-90 (Optimization Phase)</strong>:<br>- Close 3 retainers.<br>- Deploy WhatsApp booking automations and upsell retainer maintenance plans.",
            quota: { "remaining": "unlimited", "limit": "unlimited" }
          };
        }
      }

      return Promise.resolve(new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      options.headers = options.headers || {};
      const match = document.cookie.match(new RegExp('(^| )aios_csrf=([^;]+)'));
      const token = match ? match[2] : '';
      if (token) {
        if (options.headers instanceof Headers) {
          options.headers.set('X-CSRF-Token', token);
        } else {
          options.headers['X-CSRF-Token'] = token;
        }
      }
    }
    return originalFetch(url, options);
  };
})();

// --- Client-side Session Cache Helper ---
const ClientCache = {
  get(key) {
    try {
      const data = sessionStorage.getItem(`aios_cache_${key}`);
      if (!data) return null;
      const { value, expiresAt } = JSON.parse(data);
      if (Date.now() > expiresAt) {
        sessionStorage.removeItem(`aios_cache_${key}`);
        return null;
      }
      return value;
    } catch (e) {
      return null;
    }
  },
  set(key, value, ttlMs = 5 * 60 * 1000) {
    try {
      const data = JSON.stringify({ value, expiresAt: Date.now() + ttlMs });
      sessionStorage.setItem(`aios_cache_${key}`, data);
    } catch (e) {}
  }
};

// --- Client-side Anonymized Analytics ---
const Analytics = {
  logEvent(eventName, eventDetails = {}) {
    console.log(`[Analytics Event] ${eventName}`, eventDetails);
  }
};

/* ==========================================================================
   KRONOS // APP ARCHITECTURE & INTERACTIVE CONTROLS
   ========================================================================== */

// --- Global App Context ---
const state = {
  theme: 'dark',
  activeFilter: 'all',
  activePlaygroundReset: null,
  audioContext: null,
  currentProgress: 0,
  targetProgress: 0,
  
  // Phase 2 Workspace State Variables
  viewMode: 'grid',          // 'grid', 'list', 'category'
  sortOption: 'default',     // 'default', 'name-asc', 'name-desc', 'price-low', 'difficulty'
  showFavoritesOnly: false,
  comparisonList: [],         // array of tool IDs (max 3)
  
  // Authentication & Analytics State
  user: {
    id: "demo-user-123",
    email: "demo@aios.com",
    name: "Demo Premium User",
    gender: "Male",
    profession: "Business Owner",
    date_of_birth: "1995-01-01",
    plan_type: "Premium",
    trial_started_at: new Date().toISOString(),
    trial_expires_at: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
    trial_days_remaining: 3,
    is_coupon: false
  },
  analytics: {
    compileRoadmapClicks: 0,
    loginAttempts: 0,
    emailSignIns: 0,
    couponRedemptions: 0,
    roadmapUnlockRate: 0
  }
};

// --- DOM References ---
const roadSvg = document.getElementById('road-svg');
const roadBgPath = document.getElementById('road-bg-path');
const roadFillPath = document.getElementById('road-fill-path');
const roadDividerPath = document.getElementById('road-divider-path');
const roadProgressPath = document.getElementById('road-progress-path');
const roadTraveler = document.getElementById('road-traveler');
const timelineContainer = document.querySelector('.timeline-container');
const themeToggleBtn = document.getElementById('theme-toggle');
const detailDrawer = document.getElementById('detail-drawer');
const drawerCloseBtn = document.getElementById('drawer-close-btn');
const drawerCloseOverlay = document.getElementById('drawer-close-overlay');
const filterBtns = document.querySelectorAll('.filter-nav .filter-btn');
const timelineRows = document.querySelectorAll('.timeline-row');
const inspectBtns = document.querySelectorAll('.inspect-btn');
const toastEl = document.getElementById('toast');

// --- New Navigation & Directory DOM References ---
const libraryGrid = document.getElementById('library-grid');
const librarySearch = document.getElementById('library-search');
const libraryFilterChipsContainer = document.getElementById('library-filter-chips');
const categoryExplorerList = document.getElementById('category-explorer-list');
const categoryActiveName = document.getElementById('category-active-name');
const categoryActiveCount = document.getElementById('category-active-count');
const categoryToolsGrid = document.getElementById('category-tools-grid');

// Phase 2 Controls & Modal DOM References
const viewGridBtn = document.getElementById('view-grid-btn');
const viewListBtn = document.getElementById('view-list-btn');
const viewCatBtn = document.getElementById('view-cat-btn');
const librarySort = document.getElementById('library-sort');
const libraryFavoritesToggle = document.getElementById('library-favorites-toggle');
const compareStatusWrap = document.getElementById('compare-status-wrap');
const compareCount = document.getElementById('compare-count');
const compareTriggerBtn = document.getElementById('compare-trigger-btn');
const compareClearBtn = document.getElementById('compare-clear-btn');

const comparisonOverlay = document.getElementById('comparison-overlay');
const comparisonCloseOverlay = document.getElementById('comparison-close-overlay');
const comparisonCloseBtn = document.getElementById('comparison-close-btn');
const comparisonTable = document.getElementById('comparison-table');

const industriesList = [
  "Everyday Personal Tasks",
  "Customer Service & Communication",
  "Healthcare & Life Sciences",
  "Finance & Banking",
  "Business Operations & Productivity",
  "Manufacturing & Industry",
  "Transportation & Logistics",
  "Retail & Ecommerce",
  "Education & Research",
  "Creative & Media Industries",
  "Agriculture & Environment",
  "Security, Law & Energy"
];

// ==========================================================================
// 1. WINDING ROAD PATH GENERATION
// ==========================================================================

function drawRoad() {
  if (!timelineContainer || !roadSvg) return;

  const containerRect = timelineContainer.getBoundingClientRect();
  const width = containerRect.width;
  const height = containerRect.height;
  
  // Set viewport width/height attributes for SVG scale mapping
  roadSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
  const isMobile = window.innerWidth <= 1024;
  const amplitude = isMobile ? 12 : 75; // Road bend amplitude
  
  // Gather active (visible) anchor points
  const activePoints = [];
  
  // Start at the top center
  activePoints.push({
    x: width / 2,
    y: 0,
    side: 'center'
  });
  
  // Find visible rows and their anchors
  const currentRows = document.querySelectorAll('.timeline-row');
  currentRows.forEach((row) => {
    if (row.classList.contains('filtered-out')) return;
    
    const anchor = row.querySelector('.timeline-dot-anchor');
    if (!anchor) return;
    
    const anchorRect = anchor.getBoundingClientRect();
    const x = anchorRect.left - containerRect.left + anchorRect.width / 2;
    const y = anchorRect.top - containerRect.top + anchorRect.height / 2;
    const side = row.classList.contains('left') ? 'left' : 'right';
    
    activePoints.push({ x, y, side });
  });
  
  // End at the bottom center
  activePoints.push({
    x: width / 2,
    y: height,
    side: 'center'
  });
  
  // Apply Winding Shifts (curves wave away from the occupied card sides)
  const adjustedPoints = activePoints.map((p) => {
    if (p.side === 'left') {
      return { x: p.x + amplitude, y: p.y };
    } else if (p.side === 'right') {
      return { x: p.x - amplitude, y: p.y };
    }
    return { x: p.x, y: p.y };
  });

  if (adjustedPoints.length < 2) return;
  
  // Compose SVG Bezier Path
  let d = `M ${adjustedPoints[0].x} ${adjustedPoints[0].y}`;
  
  for (let i = 0; i < adjustedPoints.length - 1; i++) {
    const p0 = adjustedPoints[i];
    const p1 = adjustedPoints[i + 1];
    const dy = p1.y - p0.y;
    
    // Tension points to curve road vertically
    const cp1x = p0.x;
    const cp1y = p0.y + dy * 0.48;
    const cp2x = p1.x;
    const cp2y = p1.y - dy * 0.48;
    
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  
  // Set calculated paths
  roadBgPath.setAttribute('d', d);
  roadFillPath.setAttribute('d', d);
  roadDividerPath.setAttribute('d', d);
  roadProgressPath.setAttribute('d', d);
  
  // Re-trigger scroll update to snap traveler dot and progress line to the fresh path
  updateScrollProgress();
}

// ==========================================================================
// 2. SCROLL ANIME & TRAVELER TRACKING
// ==========================================================================

function renderRoadProgress(progress) {
  if (!roadProgressPath || !roadTraveler) return;
  const totalLength = roadProgressPath.getTotalLength();
  if (totalLength === 0) return;
  
  // Draw progress line
  roadProgressPath.style.strokeDasharray = totalLength;
  roadProgressPath.style.strokeDashoffset = totalLength * (1 - progress);
  
  // Place Traveler Dot along SVG path
  const point = roadProgressPath.getPointAtLength(progress * totalLength);
  roadTraveler.style.left = `${point.x}px`;
  roadTraveler.style.top = `${point.y}px`;
}

function updateScrollProgress() {
  if (!timelineContainer) return;
  
  const winHeight = window.innerHeight;
  const scrollTop = window.scrollY;
  const timelineTop = timelineContainer.offsetTop;
  const timelineHeight = timelineContainer.offsetHeight;
  
  // Calculate relative progress (trigger point: horizontal line in center of screen)
  const triggerPoint = scrollTop + winHeight / 2;
  let progress = (triggerPoint - timelineTop) / timelineHeight;
  state.targetProgress = Math.max(0, Math.min(1, progress));
}

function smoothScrollLoop() {
  const ease = 0.12; // smooth interpolation factor
  const diff = state.targetProgress - state.currentProgress;
  
  // Only update if there is a noticeable difference to save CPU
  if (Math.abs(diff) > 0.0001) {
    state.currentProgress += diff * ease;
    renderRoadProgress(state.currentProgress);
  } else if (state.currentProgress !== state.targetProgress) {
    state.currentProgress = state.targetProgress;
    renderRoadProgress(state.currentProgress);
  }
  
  requestAnimationFrame(smoothScrollLoop);
}

// ==========================================================================
// 3. CARD INTERACTION GLOW & INTERSECTION OBSERVER
// ==========================================================================

function setupCardInteractions() {
  const cards = document.querySelectorAll('.timeline-card');
  const lang = getActiveLanguage();
  
  // Mouse Glow Spotlight Effect
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });
  });

  // Intersection Observer for scroll reveal
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  cards.forEach(card => revealObserver.observe(card));

  // Next Lesson buttons smooth scroll
  const nextLessonBtns = document.querySelectorAll('.next-lesson-btn');
  nextLessonBtns.forEach(btn => {
    // Prevent duplicate binding
    if (btn.getAttribute('data-bound')) return;
    btn.setAttribute('data-bound', 'true');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIdx = parseInt(btn.getAttribute('data-next-idx'));
      const nextAnchor = document.getElementById(`anchor-${nextIdx}`);
      if (nextAnchor) {
        nextAnchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Find the next card and trigger a temporary highlight/glow pulse
        const nextCard = nextAnchor.parentElement.querySelector('.timeline-card');
        if (nextCard) {
          nextCard.classList.add('highlight-pulse');
          setTimeout(() => {
            nextCard.classList.remove('highlight-pulse');
          }, 2000);
        }
      } else {
        // finished last card
        showToast(lang === "Hindi" ? "बधाई हो! आपने पाठ्यक्रम पूरा कर लिया है!" : "Congratulations! You completed the learning journey!");
      }
    });
  });

  // Quiz Option buttons interaction
  const optionBtns = document.querySelectorAll('.edu-quiz-option-btn');
  optionBtns.forEach(btn => {
    if (btn.getAttribute('data-bound')) return;
    btn.setAttribute('data-bound', 'true');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cardId = btn.getAttribute('data-card-id');
      const optIdx = parseInt(btn.getAttribute('data-opt-idx'));
      const correctIdx = parseInt(btn.getAttribute('data-correct-idx'));
      
      const container = btn.parentElement;
      const buttons = container.querySelectorAll('.edu-quiz-option-btn');
      
      buttons.forEach(b => {
        b.disabled = true;
        b.style.cursor = 'not-allowed';
        b.style.opacity = '0.6';
      });
      
      buttons.forEach((b, idx) => {
        if (idx === correctIdx) {
          b.style.background = 'rgba(46, 204, 113, 0.2)';
          b.style.borderColor = '#2ecc71';
          b.style.color = '#2ecc71';
          b.innerHTML += ' (✅ Correct)';
        } else if (idx === optIdx) {
          b.style.background = 'rgba(231, 76, 60, 0.2)';
          b.style.borderColor = '#e74c3c';
          b.style.color = '#e74c3c';
          b.innerHTML += ' (❌ Incorrect)';
        }
      });
      
      const cardData = window.exploringAIRoadmap ? window.exploringAIRoadmap.find(c => c.id === cardId) : null;
      if (cardData && cardData.checkpoint && cardData.checkpoint.explanation) {
        const feedbackDiv = document.getElementById(`feedback-${cardId}`);
        if (feedbackDiv) {
          const explanationText = cardData.checkpoint.explanation[lang] || cardData.checkpoint.explanation["English"];
          const isCorrect = (optIdx === correctIdx);
          feedbackDiv.style.display = 'block';
          feedbackDiv.style.padding = '10px';
          feedbackDiv.style.borderRadius = '6px';
          feedbackDiv.style.marginTop = '12px';
          
          if (isCorrect) {
            feedbackDiv.style.background = 'rgba(46, 204, 113, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(46, 204, 113, 0.2)';
            feedbackDiv.style.color = '#2ecc71';
            feedbackDiv.innerHTML = `<strong>Correct!</strong> ${explanationText}`;
          } else {
            feedbackDiv.style.background = 'rgba(231, 76, 60, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(231, 76, 60, 0.2)';
            feedbackDiv.style.color = '#ff6b6b';
            feedbackDiv.innerHTML = `<strong>Not quite!</strong> ${explanationText}`;
          }
        }
      }
    });
  });
}

// ==========================================================================
// 4. TIMELINE NODE FILTERING
// ==========================================================================

function filterNodes(category) {
  state.activeFilter = category;
  
  const currentRows = document.querySelectorAll('.timeline-row');
  currentRows.forEach(row => {
    const rowCategory = row.getAttribute('data-category');
    
    if (category === 'all' || rowCategory === category) {
      row.classList.remove('filtered-out');
      // If the row was previously hidden, make sure card animates in
      const card = row.querySelector('.timeline-card');
      if (card && !card.classList.contains('visible')) {
        card.classList.add('visible');
      }
    } else {
      row.classList.add('filtered-out');
    }
  });

  // Animate the road restructuring smoothly
  document.querySelectorAll('.road-bg, .road-fill, .road-divider, .road-progress').forEach(path => {
    path.style.transition = 'd 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  });
  
  // Draw updated road path
  drawRoad();
  
  // Remove transition overrides after animation finishes to prevent lag on scroll
  setTimeout(() => {
    document.querySelectorAll('.road-bg, .road-fill, .road-divider, .road-progress').forEach(path => {
      path.style.transition = '';
    });
  }, 650);
}

// ==========================================================================
// 5. DETAIL DRAWER & PLAYGROUND ENGINE
// ==========================================================================

function showToast(message) {
  let finalMsg = message;
  if (state.translations && state.translations.roadmap && state.translations.roadmap.toast) {
    const toastMap = state.translations.roadmap.toast;
    const keyMap = {
      "Added to favorites": "addedFav",
      "Removed from favorites": "removedFav",
      "JSON Prompt generated locally! Proceed to Step 2.": "localGen",
      "JSON Prompt copied to clipboard!": "copied",
      "Copied JSON prompt to clipboard!": "copied",
      "Workflow completed successfully!": "completed",
      "Copied specifications to clipboard!": "specCopied",
      "Master Prompt copied! Opening ChatGPT...": "masterCopied",
      "JSON Prompt generated via Llama 3.3 successfully!": "llamaSuccess",
      "Generated static JSON prompt (Offline Fallback)": "offlineGen",
      "Voice recording canceled.": "voiceCanceled",
      "Removed from comparison": "removedCompare",
      "Cannot compare more than 3 tools simultaneously.": "compareLimit",
      "Added to comparison": "addedCompare"
    };
    const key = keyMap[message];
    if (key && toastMap[key]) {
      finalMsg = toastMap[key];
    }
  }
  toastEl.textContent = finalMsg;
  toastEl.classList.add('active');
  setTimeout(() => {
    toastEl.classList.remove('active');
  }, 2500);
}

function getRecommendedAlternatives(tool, limit = 3) {
  return toolsData
    .filter(t => t.id !== tool.id)
    .map(t => {
      let score = 0;
      if (t.category === tool.category) score += 10;
      if (t.industries && tool.industries) {
        const commonIndustries = t.industries.filter(ind => tool.industries.includes(ind));
        score += commonIndustries.length * 3;
      }
      if (t.taskTags && tool.taskTags) {
        const commonTags = t.taskTags.filter(tag => tool.taskTags.includes(tag));
        score += commonTags.length * 2;
      }
      return { tool: t, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.tool);
}

function openDrawer(nodeIdx, isEduNode = false, eduNodeData = null) {
  const data = isEduNode ? eduNodeData : toolsData[nodeIdx];
  if (!data) return;

  // Clean previous playground hooks
  if (state.activePlaygroundReset) {
    state.activePlaygroundReset();
    state.activePlaygroundReset = null;
  }

  // Populate basic text details
  document.getElementById('drawer-node-id').textContent = data.id;
  const lang = getActiveLanguage();
  const isEdu = data.id && data.id.startsWith("EDU_");

  if (isEdu) {
    document.getElementById('drawer-title').textContent = data.title[lang] || data.title["English"];
    document.getElementById('drawer-category').textContent = "EDUCATIONAL NODE";
  } else {
    document.getElementById('drawer-title').textContent = data.title;
    document.getElementById('drawer-category').textContent = data.category;
  }
  
  // Format description along with workflow sequence instructions
  const descEl = document.getElementById('drawer-desc');
  let descHTML = '';
  
  if (isEdu) {
    const summaryVal = data.summary[lang] || data.summary["English"] || "";
    const explanationVal = data.explanation[lang] || data.explanation["English"] || "";
    const examplesList = data.examples[lang] || data.examples["English"] || [];
    const keyPointsList = data.keyConcepts[lang] || data.keyConcepts["English"] || [];
    const mythRealityVal = data.myth_vs_reality[lang] || data.myth_vs_reality["English"] || {};
    const rememberVal = data.remember[lang] || data.remember["English"] || "";
    
    descHTML = `
      <div class="edu-card-container">
        <div class="edu-summary-box" style="margin-bottom: 16px; padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent-color); background: rgba(var(--accent-color), 0.08); display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.25rem;">💡</span>
          <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0; line-height: 1.4;">${summaryVal}</div>
        </div>
        <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 16px;">${explanationVal}</p>
        
        <div style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-primary); text-transform: uppercase; margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-weight: 700;">🌟 Real-Life Examples</div>
        <ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin-bottom: 16px;">
          ${examplesList.map(ex => `<li>${ex}</li>`).join('')}
        </ul>
        
        <div style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-primary); text-transform: uppercase; margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-weight: 700;">📌 Key Points</div>
        <ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin-bottom: 16px;">
          ${keyPointsList.map(c => `<li>${c}</li>`).join('')}
        </ul>
        
        <div style="margin-bottom: 16px; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02);">
          <div style="margin-bottom: 8px; color: #ff6b6b; font-size: 0.85rem;">
            <strong>❌ Myth:</strong> ${mythRealityVal.myth || ""}
          </div>
          <div style="color: #2ecc71; font-size: 0.85rem;">
            <strong>✅ Reality:</strong> ${mythRealityVal.reality || ""}
          </div>
        </div>
        
        <div style="padding: 12px; border-radius: 8px; border: 1px dashed rgba(230, 126, 34, 0.4); background: rgba(230, 126, 34, 0.05); color: var(--text-primary);">
          <div style="font-weight: 700; color: #e67e22; font-size: 0.85rem; margin-bottom: 4px;">🧠 Remember:</div>
          <p style="font-size: 0.85rem; margin: 0; font-style: italic; line-height: 1.4;">${rememberVal}</p>
        </div>
      </div>
    `;
  } else {
    descHTML = `<p>${data.description || data.desc}</p>`;
    if (data.instruction && data.instruction.length > 0) {
      descHTML += `
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color);">
          <h5 style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-primary); margin-bottom: 12px; font-weight:700;">WORKFLOW SEQUENCE</h5>
          <ol style="padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
            ${data.instruction.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
      `;
    }
  }
  descEl.innerHTML = descHTML;
  
  // Set Technical Specs
  if (isEdu) {
    document.getElementById('spec-rate').textContent = "1 min";
    document.getElementById('spec-latency').textContent = "0ms";
    document.getElementById('spec-accuracy').textContent = "100%";
    document.getElementById('spec-context').textContent = "N/A";
  } else {
    document.getElementById('spec-rate').textContent = (data.specs && data.specs.rate) || "0 words/s";
    document.getElementById('spec-latency').textContent = (data.specs && data.specs.latency) || "0ms";
    document.getElementById('spec-accuracy').textContent = (data.specs && data.specs.accuracy) || "0%";
    document.getElementById('spec-context').textContent = (data.specs && data.specs.context) || "0k";
  }

  // Re-inject Card Icon in drawer hero with fallback
  const originalCard = document.querySelector(`.timeline-card[data-node="${nodeIdx}"]`);
  const originalIconSvg = originalCard ? originalCard.querySelector('.card-icon').innerHTML : (isEdu ? 'EDU' : (data.icon || ''));
  document.getElementById('drawer-icon').innerHTML = originalIconSvg;

  // Configure deploy/external button link
  const deployBtn = document.getElementById('drawer-link-btn');
  if (isEdu) {
    deployBtn.style.display = 'none';
  } else {
    deployBtn.style.display = 'flex';
    deployBtn.setAttribute('href', data.link || data.officialUrl || '#');
  }

  // Setup interactive playground container
  const playgroundContainer = document.getElementById('playground-container');
  playgroundContainer.innerHTML = ''; // reset

  // Load specific module UI & Handlers
  if (!isEdu && data.playground) {
    mountPlayground(data.playground, playgroundContainer);
  }

  // Render Recommended Alternatives
  const alternativesContainer = document.getElementById('drawer-alternatives');
  if (alternativesContainer) {
    alternativesContainer.innerHTML = '';
    if (!isEdu) {
      const alternatives = getRecommendedAlternatives(data, 3);
      alternatives.forEach(altTool => {
        const altIdx = toolsData.findIndex(t => t.id === altTool.id);
        const altCard = document.createElement('div');
        altCard.className = 'alternative-card';
        altCard.innerHTML = `
          <div class="alternative-card-header">
            <div class="alternative-card-icon">${altTool.icon}</div>
            <h5 class="alternative-card-title">${altTool.name}</h5>
          </div>
          <p class="alternative-card-desc">${altTool.description || altTool.desc}</p>
          <span class="alternative-card-price">${(altTool.pricing || '').replace('$', '₹')}</span>
        `;
        altCard.addEventListener('click', (e) => {
          e.stopPropagation();
          openDrawer(altIdx);
        });
        alternativesContainer.appendChild(altCard);
      });
    }
  }

  // Open Drawer UI
  detailDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // prevent scrolling main timeline when drawer is open
}

function closeDrawer() {
  detailDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // restore scrolling
  
  // Cleanup active audio/animation timers
  if (state.activePlaygroundReset) {
    state.activePlaygroundReset();
    state.activePlaygroundReset = null;
  }
}

function mountPlayground(type, container) {
  switch (type) {
    case 'writer':
      container.innerHTML = `
        <div class="playground-input-group">
          <label for="writer-prompt">Enter abstract concept:</label>
          <textarea id="writer-prompt" class="playground-text-input" placeholder="e.g., A system protocol for scaling nodes across grids."></textarea>
        </div>
        <div class="playground-action-bar">
          <button class="btn btn-primary btn-full" id="writer-btn">Synthesize Documentation</button>
        </div>
        <div class="playground-output-area" id="writer-output" style="display:none; height: 160px;"></div>
      `;
      
      const wBtn = document.getElementById('writer-btn');
      const wOutput = document.getElementById('writer-output');
      const wInput = document.getElementById('writer-prompt');
      let isWriting = false;

      wBtn.addEventListener('click', () => {
        if (isWriting) return;
        
        const concept = wInput.value.trim() || "Dynamic Node Topology";
        wOutput.style.display = 'block';
        wOutput.textContent = '';
        isWriting = true;
        wBtn.disabled = true;
        wBtn.textContent = "Synthesizing...";

        const docOutput = `[SYSTEM STATE: SECURE]\n[COMPILING SEMANTIC AST...]\n\nPROTOCOL // ${concept.toUpperCase().replace(/\s+/g, '_')}\n=======================================\n\n1. ABSTRACT LAYER\n   Initializes distributed state synchronization nodes. Communicates using low-overhead asynchronous buffers.\n\n2. NODE TOPOLOGY\n   Stores local ledger weights across dynamic shards. Scales via active token replication algorithms.\n\n3. LOG INTERFACE\n   Active heartbeats outputting continuous metrics at 100ms intervals.\n\n[STATUS: CORE PIPELINE SYNTHESIZED]`;
        
        let charIdx = 0;
        const interval = setInterval(() => {
          if (charIdx < docOutput.length) {
            wOutput.textContent += docOutput[charIdx];
            wOutput.scrollTop = wOutput.scrollHeight;
            charIdx++;
          } else {
            clearInterval(interval);
            isWriting = false;
            wBtn.disabled = false;
            wBtn.textContent = "Copy Specifications";
            wBtn.classList.remove('btn-primary');
            wBtn.classList.add('btn-secondary');
            
            // Set action to copy on second click
            wBtn.onclick = () => {
              navigator.clipboard.writeText(docOutput);
              showToast("Copied specifications to clipboard!");
            };
          }
        }, 12);

        state.activePlaygroundReset = () => {
          clearInterval(interval);
        };
      });
      break;

    case 'designer':
      container.innerHTML = `
        <div class="playground-input-group">
          <label for="designer-prompt">Describe design layout (monochrome):</label>
          <textarea id="designer-prompt" class="playground-text-input" placeholder="e.g., Abstract wireframe grid network..."></textarea>
        </div>
        <div class="playground-action-bar">
          <button class="btn btn-primary btn-full" id="designer-btn">Generate Pattern</button>
        </div>
        <div class="playground-canvas" id="designer-canvas" style="display:none;"></div>
      `;

      const dBtn = document.getElementById('designer-btn');
      const dCanvas = document.getElementById('designer-canvas');
      const dInput = document.getElementById('designer-prompt');

      dBtn.addEventListener('click', () => {
        dBtn.disabled = true;
        dBtn.textContent = "Drawing Wireframe...";
        dCanvas.style.display = 'flex';
        dCanvas.innerHTML = `<div style="font-family:var(--font-mono); font-size:0.8rem; color:var(--text-secondary);">Rendering grid lines...</div>`;

        setTimeout(() => {
          const promptVal = dInput.value.trim() || "Abstract Grid";
          
          // Generate beautiful complex geometry SVGs
          const svgCode = `
            <svg class="canvas-preview-svg" viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg">
              <style>
                .grid-line { stroke: var(--border-color); stroke-width: 1; stroke-dasharray: 4 4; }
                .bold-line { stroke: var(--text-primary); stroke-width: 1.5; }
                .draw-anim { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawStroke 2s forwards ease-out; }
                @keyframes drawStroke { to { stroke-dashoffset: 0; } }
              </style>
              <rect width="100%" height="100%" fill="var(--bg-color)" />
              <!-- Background grid -->
              <line x1="50" y1="0" x2="50" y2="225" class="grid-line" />
              <line x1="150" y1="0" x2="150" y2="225" class="grid-line" />
              <line x1="250" y1="0" x2="250" y2="225" class="grid-line" />
              <line x1="350" y1="0" x2="350" y2="225" class="grid-line" />
              <line x1="0" y1="50" x2="400" y2="50" class="grid-line" />
              <line x1="0" y1="112" x2="400" y2="112" class="grid-line" />
              <line x1="0" y1="175" x2="400" y2="175" class="grid-line" />
              
              <!-- Structural Shapes -->
              <circle cx="200" cy="112.5" r="75" stroke="var(--text-tertiary)" stroke-width="1" fill="none" class="draw-anim" />
              <rect x="135" y="47.5" width="130" height="130" stroke="var(--text-secondary)" stroke-width="1" fill="none" transform="rotate(45 200 112.5)" class="draw-anim" />
              <circle cx="200" cy="112.5" r="25" stroke="var(--text-primary)" stroke-width="2" fill="none" class="draw-anim" />
              
              <!-- Text element detailing prompt -->
              <text x="20" y="205" font-family="monospace" font-size="8" fill="var(--text-secondary)">SPEC: ${promptVal.toUpperCase().substring(0, 35)} // MOD_01</text>
            </svg>
          `;
          dCanvas.innerHTML = svgCode;
          dBtn.disabled = false;
          dBtn.textContent = "Regenerate Pattern";
        }, 1200);
      });
      break;

    case 'audio':
      container.innerHTML = `
        <div class="playground-input-group">
          <label for="audio-prompt">Voice script to synthesize:</label>
          <textarea id="audio-prompt" class="playground-text-input" placeholder="e.g., Node 03 initialized. Mainframe link established."></textarea>
        </div>
        <div class="playground-action-bar">
          <button class="btn btn-primary btn-full" id="audio-btn">Synthesize Audio</button>
        </div>
        <div class="wave-container" id="audio-wave">
          <div class="wave-bar" style="height: 15px"></div>
          <div class="wave-bar" style="height: 25px"></div>
          <div class="wave-bar" style="height: 40px"></div>
          <div class="wave-bar" style="height: 15px"></div>
          <div class="wave-bar" style="height: 30px"></div>
          <div class="wave-bar" style="height: 45px"></div>
          <div class="wave-bar" style="height: 20px"></div>
          <div class="wave-bar" style="height: 35px"></div>
          <div class="wave-bar" style="height: 25px"></div>
          <div class="wave-bar" style="height: 15px"></div>
        </div>
      `;

      const aBtn = document.getElementById('audio-btn');
      const aWave = document.getElementById('audio-wave');
      let audioPlayTimeout = null;

      aBtn.addEventListener('click', () => {
        aBtn.disabled = true;
        aBtn.textContent = "Processing Voice...";
        
        setTimeout(() => {
          aBtn.textContent = "Playing synthesized feed...";
          aWave.classList.add('playing');
          
          // Sound trigger using browser Web Audio API
          playAudioTelemetry();
          
          audioPlayTimeout = setTimeout(() => {
            aWave.classList.remove('playing');
            aBtn.disabled = false;
            aBtn.textContent = "Re-Synthesize Audio";
          }, 1800);
        }, 800);
      });

      state.activePlaygroundReset = () => {
        clearTimeout(audioPlayTimeout);
        aWave.classList.remove('playing');
      };
      break;

    case 'coder':
      container.innerHTML = `
        <div class="playground-input-group">
          <label for="coder-prompt">Paste legacy code snippet:</label>
          <textarea id="coder-prompt" class="playground-text-input" placeholder="e.g., function check(x) { return x === null ? 0 : x; }"></textarea>
        </div>
        <div class="playground-action-bar">
          <button class="btn btn-primary btn-full" id="coder-btn">Refactor to Strict Typing</button>
        </div>
        <div class="code-diff-container" id="coder-output" style="display:none;"></div>
      `;

      const cBtn = document.getElementById('coder-btn');
      const cOutput = document.getElementById('coder-output');
      const cInput = document.getElementById('coder-prompt');

      cBtn.addEventListener('click', () => {
        cBtn.disabled = true;
        cBtn.textContent = "Compiling AST...";
        cOutput.style.display = 'none';

        setTimeout(() => {
          const rawCode = cInput.value.trim() || "function process(x) { return x + 10; }";
          
          let cleanRefactor = "";
          if (rawCode.includes("function")) {
            cleanRefactor = `
              <div class="diff-line deletion">// Legacy structural JS implementation</div>
              <div class="diff-line deletion">${escapeHTML(rawCode)}</div>
              <div class="diff-line addition">// Helix Coder Refactored (Strict TypeScript)</div>
              <div class="diff-line addition">export const process = (value: number): number => {</div>
              <div class="diff-line addition">  const SYSTEM_OFFSET: number = 10;</div>
              <div class="diff-line addition">  return value + SYSTEM_OFFSET;</div>
              <div class="diff-line addition">};</div>
            `;
          } else {
            cleanRefactor = `
              <div class="diff-line deletion">// Provided raw data input</div>
              <div class="diff-line deletion">${escapeHTML(rawCode)}</div>
              <div class="diff-line addition">// Helix Coder Optimized Flow</div>
              <div class="diff-line addition">export type EnginePayload&lt;T&gt; = {</div>
              <div class="diff-line addition">  timestamp: number;</div>
              <div class="diff-line addition">  payload: T;</div>
              <div class="diff-line addition">  signature: string;</div>
              <div class="diff-line addition">};</div>
            `;
          }

          cOutput.innerHTML = cleanRefactor;
          cOutput.style.display = 'flex';
          cBtn.disabled = false;
          cBtn.textContent = "Re-Refactor Code";
        }, 1000);
      });
      break;

    case 'analytics':
      container.innerHTML = `
        <div class="playground-input-group">
          <label for="analytics-select">Data stream feed:</label>
          <select id="analytics-select" class="playground-text-input" style="height:46px;">
            <option value="realtime">Real-time Telemetry (100ms)</option>
            <option value="daily">Daily Epoch Matrix</option>
            <option value="quadratic">Quadratic Anomaly Model</option>
          </select>
        </div>
        <div class="playground-action-bar">
          <button class="btn btn-primary btn-full" id="analytics-btn">Render Anomaly Chart</button>
        </div>
        <div class="playground-canvas" id="analytics-canvas" style="display:none; height:180px; padding: 12px; align-items:center; justify-content:center;"></div>
      `;

      const anBtn = document.getElementById('analytics-btn');
      const anCanvas = document.getElementById('analytics-canvas');
      const anSelect = document.getElementById('analytics-select');

      anBtn.addEventListener('click', () => {
        anBtn.disabled = true;
        anBtn.textContent = "Computing event matrix...";
        
        setTimeout(() => {
          const points = [];
          for (let i = 0; i <= 8; i++) {
            points.push({
              x: i * 45 + 20,
              y: 140 - Math.random() * 85 - (anSelect.value === 'quadratic' ? (i * i) * 1.5 : 20)
            });
          }
          
          const pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
          const fillD = `${pathD} L ${points[points.length-1].x} 160 L ${points[0].x} 160 Z`;
          
          const svgMarkup = `
            <svg class="analytics-chart-svg" viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg">
              <style>
                .chart-line { stroke: var(--text-primary); stroke-width: 2; fill: none; stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawChartLine 1.8s forwards ease-in-out; }
                .chart-dot { fill: var(--bg-color); stroke: var(--text-primary); stroke-width: 1.5; transform: scale(0); transform-origin: center; animation: popDot 0.4s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes drawChartLine { to { stroke-dashoffset: 0; } }
                @keyframes popDot { to { transform: scale(1); } }
              </style>
              <line x1="20" y1="160" x2="380" y2="160" stroke="var(--border-color)" stroke-width="1" />
              <line x1="20" y1="20" x2="20" y2="160" stroke="var(--border-color)" stroke-width="1" />
              
              <path d="${fillD}" fill="var(--text-primary)" opacity="0.06" />
              <path d="${pathD}" class="chart-line" />
              
              ${points.map((p, index) => `
                <circle cx="${p.x}" cy="${p.y}" r="3.5" class="chart-dot" style="animation-delay: ${index * 0.15}s; transform-origin: ${p.x}px ${p.y}px;" />
              `).join('')}
              
              <text x="25" y="30" font-family="monospace" font-size="8" fill="var(--text-secondary)">MODEL RESPONSE (Grayscale Array): ${anSelect.value.toUpperCase()}</text>
            </svg>
          `;
          anCanvas.innerHTML = svgMarkup;
          anCanvas.style.display = 'flex';
          anBtn.disabled = false;
          anBtn.textContent = "Recalculate Stream";
        }, 900);
      });
      break;

    case 'automation':
      container.innerHTML = `
        <div class="flow-steps">
          <div class="flow-step-item active" data-step="0">
            <span>Listen REST Webhook Hook</span>
            <div class="toggle-switch"></div>
          </div>
          <div class="flow-step-item active" data-step="1">
            <span>Translate raw log content via Apex</span>
            <div class="toggle-switch"></div>
          </div>
          <div class="flow-step-item" data-step="2">
            <span>Refactor structural format via Helix</span>
            <div class="toggle-switch"></div>
          </div>
        </div>
        <div class="playground-action-bar" style="margin-top: 15px;">
          <button class="btn btn-primary btn-full" id="automation-btn">Deploy Automation Loop</button>
        </div>
        <div class="playground-output-area" id="automation-output" style="display:none; font-size: 0.75rem; height: 130px;"></div>
      `;

      const autoBtn = document.getElementById('automation-btn');
      const autoOutput = document.getElementById('automation-output');
      const stepItems = container.querySelectorAll('.flow-step-item');
      
      // Step click activation toggle
      stepItems.forEach(item => {
        item.addEventListener('click', () => {
          item.classList.toggle('active');
        });
      });

      let autoInterval = null;
      
      autoBtn.addEventListener('click', () => {
        autoBtn.disabled = true;
        autoBtn.textContent = "Deploying loop daemon...";
        autoOutput.style.display = 'block';
        autoOutput.textContent = 'Initializing background cron task...\n';

        const logs = [
          "[CRON] Setting intervals at 5000ms.",
          "[DAEMON] Listening to port: 8080.",
          "[TRIGGER] Event intercepted on hook_31.",
          "[PARSING] Launching translation subprocesses...",
          "[OPTIMIZER] Refactoring code payload structure...",
          "[CRON] Successfully completed execution loop.",
          "[STANDBY] Waiting for next event pulse."
        ];

        let lineIdx = 0;
        
        autoInterval = setInterval(() => {
          // Check which step items are active to simulate skipping inactive logs
          if (lineIdx === 3 && !stepItems[1].classList.contains('active')) {
            autoOutput.textContent += "[SKIPPED] Step 2: Content translator is disabled.\n";
            lineIdx += 1;
            return;
          }
          if (lineIdx === 4 && !stepItems[2].classList.contains('active')) {
            autoOutput.textContent += "[SKIPPED] Step 3: Structural optimizer is disabled.\n";
            lineIdx += 1;
            return;
          }

          if (lineIdx < logs.length) {
            autoOutput.textContent += `${logs[lineIdx]}\n`;
            autoOutput.scrollTop = autoOutput.scrollHeight;
            lineIdx++;
          } else {
            clearInterval(autoInterval);
            autoBtn.disabled = false;
            autoBtn.textContent = "Re-Launch Automation";
          }
        }, 700);

        state.activePlaygroundReset = () => {
          clearInterval(autoInterval);
        };
      });
      break;
  }
}

// Helper: Escape code inputs
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Sound synthesize generator
function playAudioTelemetry() {
  try {
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = state.audioContext;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Core sweeping synth oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 1.2);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc.start(now);
    osc.stop(now + 1.2);

    // Accent beep oscillator
    setTimeout(() => {
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      bOsc.connect(bGain);
      bGain.connect(ctx.destination);
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(1200, ctx.currentTime);
      bGain.gain.setValueAtTime(0.04, ctx.currentTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      bOsc.start();
      bOsc.stop(ctx.currentTime + 0.3);
    }, 400);

  } catch (err) {
    console.warn("Web Audio compilation blocked by browser user policy: ", err);
  }
}

// --- i18n (Internationalization) System ---
state.translations = null;

function getNestedTranslation(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function applyTranslations(translations) {
  if (!translations) return;
  
  // Update elements with data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = getNestedTranslation(translations, key);
    if (translation) {
      // If element is a placeholder input/textarea
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        el.innerHTML = translation;
      }
    }
  });

  // Update elements with data-i18n-placeholder specifically
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = getNestedTranslation(translations, key);
    if (translation) {
      el.placeholder = translation;
    }
  });

  // Update elements with data-i18n-title
  const titleElements = document.querySelectorAll('[data-i18n-title]');
  titleElements.forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translation = getNestedTranslation(translations, key);
    if (translation) {
      el.title = translation;
    }
  });
}

async function loadTranslations(lang) {
  const langKey = lang.toLowerCase();
  const fileMap = {
    english: 'en',
    hindi: 'hi',
    hinglish: 'hinglish'
  };
  const fileName = fileMap[langKey] || 'en';
  try {
    const response = await fetch(`/locales/${fileName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load locale file: ${response.statusText}`);
    }
    state.translations = await response.json();
    applyTranslations(state.translations);
    translateLibraryChips();
    
    // Dynamically update parts of the UI that depend on active translations
    updateComparisonUI();
  } catch (err) {
    console.error("Error loading translations:", err);
  }
}

function translateLibraryChips() {
  const libraryFilterChipsContainer = document.getElementById('library-filter-chips');
  if (!libraryFilterChipsContainer) return;
  const chips = libraryFilterChipsContainer.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    const sector = chip.getAttribute('data-chip');
    if (sector === 'all') {
      chip.textContent = (state.translations && state.translations.library && state.translations.library.allSectors) || "All Sectors";
    } else {
      chip.textContent = (state.translations && state.translations.sectors && state.translations.sectors[sector]) || sector;
    }
  });
}

function initTheme() {
  const savedTheme = localStorage.getItem('kronos-theme');
  if (savedTheme) {
    state.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    state.theme = 'light';
  }
  
  document.documentElement.classList.add('theme-transitioning');
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();
  
  // Force layout reflow to apply theme instantly
  document.documentElement.offsetHeight;
  document.documentElement.classList.remove('theme-transitioning');
}

function updateThemeIcon() {
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');
  
  if (state.theme === 'light') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

function toggleTheme() {
  document.documentElement.classList.add('theme-transitioning');
  
  // Force layout reflow to ensure suppression class is computed
  document.documentElement.offsetHeight;
  
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('kronos-theme', state.theme);
  updateThemeIcon();
  
  // Re-draw the road to align colors smoothly
  drawRoad();
  
  // Force layout reflow to paint theme changes instantly
  document.documentElement.offsetHeight;
  
  document.documentElement.classList.remove('theme-transitioning');
}

function setupEventListeners() {
  // Theme Switching
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Wizard reconfiguration trigger
  const reconfigBtn = document.getElementById('reconfigure-btn');
  if (reconfigBtn) {
    reconfigBtn.addEventListener('click', resetWizard);
  }
  
  // Resize Handler (Recalculate road dynamically)
  window.addEventListener('resize', () => {
    // Throttle resize events slightly for high performance
    requestAnimationFrame(drawRoad);
  });
  
  // Scroll Handler (Update progress and traveler)
  window.addEventListener('scroll', updateScrollProgress);
  
  // Filter tabs click binding
  if (filterBtns) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        filterNodes(filter);
      });
    });
  }

  // Slide drawer controls using event delegation on the wrapper container
  // Click anywhere on a timeline-card (or library card) to open drawer
  // EXCEPT when clicking a link, a button, or card-action-btn
  const mainWrapper = document.getElementById('main-content-wrapper');
  if (mainWrapper) {
    mainWrapper.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('.card-action-btn') || e.target.closest('button:not(.inspect-btn)')) {
        return;
      }
      
      const card = e.target.closest('.timeline-card');
      if (card) {
        const nodeIdx = parseInt(card.getAttribute('data-node'));
        if (!isNaN(nodeIdx)) {
          openDrawer(nodeIdx);
        }
      }
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeDrawer);
  }
  if (drawerCloseOverlay) {
    drawerCloseOverlay.addEventListener('click', closeDrawer);
  }

  // Close drawer or comparison overlay with escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (detailDrawer.getAttribute('aria-hidden') === 'false') {
        closeDrawer();
      }
      if (comparisonOverlay && comparisonOverlay.getAttribute('aria-hidden') === 'false') {
        closeComparisonOverlay();
      }
    }
  });

  // --- Phase 2: Explore Library Controls & Actions Event Listeners ---

  // 1. View Mode Toggles
  if (viewGridBtn) {
    viewGridBtn.addEventListener('click', () => {
      [viewGridBtn, viewListBtn, viewCatBtn].forEach(b => b.classList.remove('active'));
      viewGridBtn.classList.add('active');
      state.viewMode = 'grid';
      renderLibraryGrid();
    });
  }

  if (viewListBtn) {
    viewListBtn.addEventListener('click', () => {
      [viewGridBtn, viewListBtn, viewCatBtn].forEach(b => b.classList.remove('active'));
      viewListBtn.classList.add('active');
      state.viewMode = 'list';
      renderLibraryGrid();
    });
  }

  if (viewCatBtn) {
    viewCatBtn.addEventListener('click', () => {
      [viewGridBtn, viewListBtn, viewCatBtn].forEach(b => b.classList.remove('active'));
      viewCatBtn.classList.add('active');
      state.viewMode = 'category';
      renderLibraryGrid();
    });
  }

  // 2. Sorting Selector
  if (librarySort) {
    librarySort.addEventListener('change', (e) => {
      state.sortOption = e.target.value;
      renderLibraryGrid();
    });
  }

  // 3. Favorites Checkbox Toggle
  if (libraryFavoritesToggle) {
    libraryFavoritesToggle.addEventListener('change', (e) => {
      state.showFavoritesOnly = e.target.checked;
      renderLibraryGrid();
    });
  }

  // 4. Compare Actions (Clear & Trigger)
  if (compareClearBtn) {
    compareClearBtn.addEventListener('click', () => {
      state.comparisonList = [];
      updateComparisonUI();
      renderLibraryGrid();
    });
  }

  if (compareTriggerBtn) {
    compareTriggerBtn.addEventListener('click', openComparisonOverlay);
  }

  // 5. Comparison Overlay Close
  if (comparisonCloseBtn) {
    comparisonCloseBtn.addEventListener('click', closeComparisonOverlay);
  }
  if (comparisonCloseOverlay) {
    comparisonCloseOverlay.addEventListener('click', closeComparisonOverlay);
  }

  // 6. Comparison Table Remove Button Delegation
  if (comparisonTable) {
    comparisonTable.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.compare-remove-btn');
      if (removeBtn) {
        const toolId = removeBtn.getAttribute('data-id');
        toggleComparison(toolId);
        
        // Re-render the comparison table
        renderComparisonTable();
        
        // If no more items compared, close modal
        if (state.comparisonList.length === 0) {
          closeComparisonOverlay();
        }
      }
    });
  }

  // 7. Universal Event Delegation for Bookmarking & Comparison selection on card actions
  document.body.addEventListener('click', (e) => {
    const favBtn = e.target.closest('.fav-star');
    const compareBtn = e.target.closest('.compare-check');
    const copyBtn = e.target.closest('.prompt-copy-btn');

    if (favBtn) {
      e.preventDefault();
      e.stopPropagation();
      const toolId = favBtn.getAttribute('data-id');
      const isFav = toggleFavorite(toolId);

      // Toggle active state for all buttons targeting this tool across the whole DOM
      document.querySelectorAll(`.fav-star[data-id="${toolId}"]`).forEach(btn => {
        btn.classList.toggle('active', isFav);
      });

      // If favorites-only view is currently active, we must re-render the Explore Library grid
      if (state.showFavoritesOnly) {
        renderLibraryGrid();
      }

      showToast(isFav ? "Added to favorites" : "Removed from favorites");
    }

    if (compareBtn) {
      e.preventDefault();
      e.stopPropagation();
      const toolId = compareBtn.getAttribute('data-id');
      toggleComparison(toolId);
    }

    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = copyBtn.getAttribute('data-text');
      navigator.clipboard.writeText(textToCopy).then(() => {
        const activeLang = getActiveLanguage();
        const labels = translationDB[activeLang] || translationDB["Hinglish"];
        const originalText = copyBtn.textContent;
        copyBtn.textContent = labels.copied;
        showToast(labels.copied);
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 1500);
      }).catch(err => {
        console.error("Failed to copy: ", err);
      });
    }

  });

  // Accordion Collapsible course modules toggles inside homepage Academy
  const modCards = document.querySelectorAll('#business-academy-section .learn-module-card');
  modCards.forEach(card => {
    const header = card.querySelector('.learn-module-header');
    const body = card.querySelector('.learn-module-body');
    const arrow = card.querySelector('.learn-module-toggle-btn');
    if (header && body && arrow) {
      header.addEventListener('click', () => {
        const isActive = body.style.display === 'block';
        modCards.forEach(c => {
          c.classList.remove('active');
          const b = c.querySelector('.learn-module-body');
          if (b) b.style.display = 'none';
          const a = c.querySelector('.learn-module-toggle-btn');
          if (a) a.textContent = '▲';
        });
        if (!isActive) {
          card.classList.add('active');
          body.style.display = 'block';
          arrow.textContent = '▼';
        }
      });
    }
  });

  // Skip Basics button scrolling redirect
  const skipBasicsBtn = document.getElementById('btn-skip-basics');
  if (skipBasicsBtn) {
    skipBasicsBtn.addEventListener('click', () => {
      const controlsSec = document.getElementById('dashboard-controls');
      if (controlsSec) {
        controlsSec.scrollIntoView({ behavior: 'smooth' });
        const taskSelect = document.getElementById('control-task-select');
        if (taskSelect) taskSelect.focus();
      }
    });
  }

  // Mobile Touch/Tap response enhancements
  const elementsToTap = document.querySelectorAll('.nav-btn-business, .business-popup-opt-btn, .learn-module-header, .btn-submit-quiz, .workspace-dropdown-trigger');
  elementsToTap.forEach(el => {
    el.addEventListener('touchstart', function() {
      el.classList.add('touch-active');
    }, { passive: true });
    el.addEventListener('touchend', function() {
      el.classList.remove('touch-active');
    }, { passive: true });
  });
}



// ==========================================================================
// 7. DYNAMIC ROADMAP COMPILATION & WIZARD
// ==========================================================================

const industrySuggestions = {
  "Content Creation": [
    "Synthesize YouTube viral video workflows",
    "Generate AI copywriting layout scripts",
    "Compile vector schematic brand logo layouts",
    "Animate static cinematic scene concept arts"
  ],
  "Customer Support": [
    "Deploy automated client lead capture pipelines",
    "Train low-latency speech conversation AI agent",
    "Connect Airtable database ticketing backends",
    "Parse customer event signals anomaly graphs"
  ],
  "Education": [
    "Compile peer-reviewed literature study consensus",
    "Build sandbox cloud-ide code testing tutorial",
    "Index student calendar webinar meeting summaries",
    "Refactor legacy programs difficulty modules"
  ],
  "Healthcare": [
    "Extract clinical sequence diagnostic molecular logs",
    "Scan tissue pathology cell-imaging mutations",
    "Map regional virus transmission hotspot risk grids",
    "Draft regulatory contract safety compliance agreements"
  ],
  "Software Development": [
    "Plan directory specifications repository layouts",
    "Suggest inline autocomplete codegen suggested blocks",
    "Debug recursive AST logic debugger terminal fixes",
    "Launch background webhook server trigger cron tasks"
  ]
};

const stepMatchingRules = {
  "Research": {
    tags: ["literature", "papers", "search-engine", "summaries", "academia", "citations", "validation", "search", "consensus"],
    categories: ["ANALYTICS ENGINE", "CREATION ENGINE"]
  },
  "Script Writing": {
    tags: ["copywriting", "writing", "documents", "email", "gemini", "notes", "outline", "refinement"],
    categories: ["CREATION ENGINE"]
  },
  "Image Generation": {
    tags: ["images", "rendering", "vector", "textures", "graphics", "concept-art", "logo", "schematic"],
    categories: ["CREATION ENGINE"]
  },
  "Video Generation": {
    tags: ["video", "animation", "cinematic", "video-synthesis", "motion"],
    categories: ["CREATION ENGINE"]
  },
  "Voice Generation": {
    tags: ["voiceover", "audio", "speech", "waveform", "speech-recognition", "conversational-ai"],
    categories: ["CREATION ENGINE"]
  },
  "Editing": {
    tags: ["editing", "editor", "formatting", "spellcheck", "grammar", "tone", "workspace"],
    categories: ["CREATION ENGINE", "ENGINEERING ENGINE"]
  },
  "Publishing": {
    tags: ["publishing", "automation", "scheduling", "marketing", "crm", "workflow", "launcher"],
    categories: ["ENGINEERING ENGINE", "CREATION ENGINE"]
  },
  "Lead Capture": {
    tags: ["crm", "marketing", "transcription", "meetings", "email", "communication"],
    categories: ["CREATION ENGINE", "ENGINEERING ENGINE"]
  },
  "Conversation AI": {
    tags: ["speech-recognition", "conversational-ai", "voice-search", "speech", "interaction", "meetings"],
    categories: ["CREATION ENGINE", "ENGINEERING ENGINE"]
  },
  "Ticketing": {
    tags: ["workspace", "database", "boards", "tasks", "management", "collaboration", "notes"],
    categories: ["ENGINEERING ENGINE", "CREATION ENGINE"]
  },
  "Analytics": {
    tags: ["analytics", "time-series", "signals", "forecasting", "sales-predictions", "search"],
    categories: ["ANALYTICS ENGINE"]
  },
  "Automation": {
    tags: ["automation", "scheduler", "cron", "agentic", "cybersecurity", "threat-detection", "alerts"],
    categories: ["ENGINEERING ENGINE"]
  },
  "Learning": {
    tags: ["codegen", "autocomplete", "free", "ide-plugin", "cloud-ide", "sandbox", "chat", "documents"],
    categories: ["ENGINEERING ENGINE", "CREATION ENGINE"]
  },
  "Revision": {
    tags: ["workspace", "notes", "indexing", "summaries", "documents", "meetings"],
    categories: ["CREATION ENGINE", "ANALYTICS ENGINE"]
  },
  "Testing": {
    tags: ["complexity", "testing", "refactoring", "validation", "debugging", "ast"],
    categories: ["ENGINEERING ENGINE"]
  },
  "Progress Tracking": {
    tags: ["boards", "tasks", "management", "tracking", "launcher", "utilities"],
    categories: ["ENGINEERING ENGINE"]
  },
  "Data Collection": {
    tags: ["clinical-data", "sequencing", "database", "meetings", "transcription"],
    categories: ["ANALYTICS ENGINE", "ENGINEERING ENGINE"]
  },
  "Diagnosis Support": {
    tags: ["oncology", "pathology", "cell-imaging", "cancer-detection", "biology", "proteins", "molecular-folding", "evidence-based", "consensus"],
    categories: ["ANALYTICS ENGINE"]
  },
  "Analysis": {
    tags: ["genomics", "sequencing", "time-series", "analytics", "signals", "forecasting", "predictive-maintenance"],
    categories: ["ANALYTICS ENGINE"]
  },
  "Documentation": {
    tags: ["compliance", "regulations", "clinical-trials", "contracts", "legal-tech", "legal-drafting", "writing"],
    categories: ["ENGINEERING ENGINE", "CREATION ENGINE"]
  },
  "Reporting": {
    tags: ["analytics", "charts", "presentations", "graphing", "reporting", "crm"],
    categories: ["ANALYTICS ENGINE"]
  },
  "Planning": {
    tags: ["specs", "docs", "copywriting", "documents", "workspace", "boards", "tasks", "notes"],
    categories: ["CREATION ENGINE", "ENGINEERING ENGINE"]
  },
  "Coding": {
    tags: ["editor", "autocomplete", "codegen", "ide-extension", "ide-plugin", "cloud-ide", "sandbox"],
    categories: ["ENGINEERING ENGINE"]
  },
  "Deployment": {
    tags: ["sandbox", "cloud-ide", "hosting", "plc", "industrial-logic", "automation", "scheduler"],
    categories: ["ENGINEERING ENGINE"]
  },
  "Monitoring": {
    tags: ["signals", "anomalies", "time-series", "monitoring", "cybersecurity", "threat-detection", "iot", "sensors"],
    categories: ["ANALYTICS ENGINE", "ENGINEERING ENGINE"]
  }
};

function findOptimalWorkflow(steps, budgetLimit, experienceLevel) {
  const stepCandidates = steps.map(stepName => {
    const candidates = [];
    const rule = stepMatchingRules[stepName] || stepMatchingRules["Research"];
    
    toolsData.forEach(tool => {
      let matchScore = 0;
      if (tool.taskTags) {
        tool.taskTags.forEach(tag => {
          if (rule.tags.includes(tag.toLowerCase())) {
            matchScore += 5;
          }
        });
      }
      if (rule.categories.includes(tool.category)) {
        matchScore += 2;
      }
      
      const titleLower = tool.title.toLowerCase();
      const descLower = (tool.description || tool.desc || "").toLowerCase();
      const stepLower = stepName.toLowerCase();
      if (titleLower.includes(stepLower) || descLower.includes(stepLower)) {
        matchScore += 3;
      }
      
      stepLower.split(" ").forEach(w => {
        if (w.length > 3 && (titleLower.includes(w) || descLower.includes(w))) {
          matchScore += 2;
        }
      });
      
      if (matchScore === 0) return;
      
      let expScore = 0;
      const diff = tool.difficultyLevel || "Intermediate";
      if (experienceLevel === "Beginner") {
        if (diff === "Beginner") expScore = 10;
        else if (diff === "Intermediate") expScore = 5;
        else expScore = 0;
      } else if (experienceLevel === "Intermediate") {
        if (diff === "Intermediate") expScore = 10;
        else if (diff === "Beginner") expScore = 7;
        else expScore = 5;
      } else if (experienceLevel === "Advanced") {
        if (diff === "Advanced") expScore = 10;
        else if (diff === "Intermediate") expScore = 7;
        else expScore = 3;
      }
      
      const baseScore = matchScore + expScore;
      
      if (tool.freeTier || tool.cost === 0) {
        candidates.push({
          tool,
          mode: "Free",
          cost: 0,
          score: baseScore
        });
      }
      
      if (tool.cost > 0) {
        candidates.push({
          tool,
          mode: "Paid",
          cost: tool.cost,
          score: baseScore + 4
        });
      }
    });
    
    return candidates.sort((a, b) => b.score - a.score);
  });

  let bestCombo = null;
  let maxScoreSum = -1;

  function search(stepIdx, currentCombo, currentCost, currentScore) {
    if (stepIdx === steps.length) {
      if (currentCost <= budgetLimit && currentScore > maxScoreSum) {
        maxScoreSum = currentScore;
        bestCombo = [...currentCombo];
      }
      return;
    }

    const candidates = stepCandidates[stepIdx];
    const activeCandidates = candidates.length > 0 ? candidates : 
      toolsData.map(t => ({ tool: t, mode: t.freeTier ? "Free" : "Paid", cost: t.freeTier ? 0 : (t.cost || 0), score: 1 }));

    for (let i = 0; i < activeCandidates.length; i++) {
      const cand = activeCandidates[i];
      if (currentCost + cand.cost > budgetLimit) {
        continue;
      }
      if (currentCombo.some(item => item.tool.id === cand.tool.id)) {
        continue;
      }

      currentCombo.push(cand);
      search(stepIdx + 1, currentCombo, currentCost + cand.cost, currentScore + cand.score);
      currentCombo.pop();
    }
  }

  search(0, [], 0, 0);

  if (!bestCombo) {
    console.warn("No combination found under budget limit, falling back to cheapest.");
    bestCombo = stepCandidates.map(candidates => {
      if (candidates.length > 0) {
        const sortedByCost = [...candidates].sort((a, b) => a.cost - b.cost);
        return sortedByCost[0];
      } else {
        const fallbackTool = toolsData.find(t => t.freeTier) || toolsData[0];
        return { tool: fallbackTool, mode: "Free", cost: 0, score: 1 };
      }
    });
  }

  return bestCombo;
}

const googleDocsTool = {
  id: "TOOL_DOCS",
  title: "Google Docs",
  name: "Google Docs",
  category: "CREATION ENGINE",
  timelineCategory: "creation",
  cost: 0,
  pricing: "Free",
  useCases: ["Script"],
  useCase: ["Script"],
  industries: ["Everyday Personal Tasks"],
  industry: ["Everyday Personal Tasks"],
  desc: "Collaborative word processor for brainstorming, planning, and draft writing.",
  description: "Collaborative word processor for brainstorming, planning, and draft writing.",
  specs: { rate: "Real-time sync", latency: "Sub-10ms", accuracy: "100%", context: "Browser-based workspace" },
  url: "https://docs.google.com",
  link: "https://docs.google.com",
  officialUrl: "https://docs.google.com",
  playground: "writer",
  difficultyLevel: "Beginner",
  recommendedFor: "Everyone",
  freeTier: true,
  taskTags: ["brainstorming", "writing", "drafting", "planning", "collaboration"],
  instruction: [
    "Navigate to Google Docs and create a new document.",
    "Outline your initial concepts, key structural items, and brainstorming notes.",
    "Draft your first content narrative or application requirements document.",
    "Keep this draft open to copy segments into ChatGPT for restructuring."
  ],
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
};

const chatGptTool = {
  id: "TOOL_001",
  title: "ChatGPT",
  name: "ChatGPT",
  category: "CREATION ENGINE",
  timelineCategory: "creation",
  cost: 0,
  pricing: "Freemium",
  useCases: ["Script", "Code"],
  useCase: ["Script", "Code"],
  industries: ["Everyday Personal Tasks", "Creative & Media Industries", "Education & Research", "Business Operations & Productivity"],
  desc: "Conversational model designed for drafting content, code segments, and outlines.",
  description: "Conversational model designed for drafting content, code segments, and outlines.",
  specs: { rate: "120 tokens/s", latency: "60ms", accuracy: "99.2%", context: "128k ctx" },
  url: "https://openai.com",
  link: "https://openai.com",
  officialUrl: "https://openai.com",
  playground: "writer",
  difficultyLevel: "Beginner",
  recommendedFor: "General Users & Content Writers",
  freeTier: true,
  taskTags: ["writing", "chat", "documents", "research", "outline"],
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`
};

const translationDB = {
  English: {
    purpose: "Purpose",
    whyThisTool: "Why This Tool",
    expectedOutput: "Expected Output",
    masterPrompt: "Master Prompt",
    alternativeTools: "Alternative Tools",
    estimatedCost: "Estimated Cost",
    estimatedTime: "Estimated Time",
    starter: "Starter Prompt",
    advanced: "Advanced Prompt",
    professional: "Professional Prompt",
    beginnerExplanation: "Beginner Explanation",
    copyBtn: "Copy Prompt",
    copied: "Copied!",
    free: "Free",
    monthly: "/ mo",
    keyConcepts: "Key Concepts",
    practicalExercise: "Practical Exercise",
    expectedOutcome: "Expected Outcome",
    docsPurpose: "Brainstorming, idea collection, planning and writing first draft.",
    docsWhy: "Google Docs provides a clean, cloud-synchronized writing slate to gather unstructured thoughts, copy resources, and outline the initial copy.",
    docsOutput: "A structured text draft containing raw content outline, research fragments, and core objectives.",
    docsStarterPrompt: "Draft a comprehensive project brief outlining the target goals, core features, and target audience for this project.",
    docsProPrompt: "Construct an exhaustive specifications document for this project, detailing system constraints, content scripts, and modular assets.",
    docsExplanation: "Use Google Docs to dump all your raw ideas, texts, and scripts in one place. It serves as your staging ground before AI processing.",
    chatgptPurpose: "Convert rough notes into structured JSON prompts, workflows and production-ready instructions.",
    chatgptWhy: "ChatGPT excels at logical reasoning, parsing text structure, and formatting raw outlines into optimized prompts for downstream creative tools.",
    chatgptOutput: "Structured XML/JSON system specs, formatted prompts, and precise instruction sets for specialized engines.",
    chatgptStarterPrompt: "I will provide you my raw project notes. Format them into structured guidelines and optimized instructions.",
    chatgptProPrompt: "Analyze the provided project specification draft. Break it down into modular JSON instructions and generate high-density prompts for other generative AI models.",
    chatgptExplanation: "Paste your Google Docs draft here and ask ChatGPT to refine it. It acts as the orchestrator of your automated workflow."
  },
  Hindi: {
    purpose: "उद्देश्य (Purpose)",
    whyThisTool: "यही टूल क्यों (Why This Tool)",
    expectedOutput: "अपेक्षित आउटपुट (Expected Output)",
    masterPrompt: "मास्टर प्रॉम्प्ट (Master Prompt)",
    alternativeTools: "वैकल्पिक टूल्स (Alternative Tools)",
    estimatedCost: "अनुमानित खर्च (Estimated Cost)",
    estimatedTime: "अनुमानित समय (Estimated Time)",
    starter: "शुरुआती प्रॉम्प्ट (Starter)",
    advanced: "उन्नत प्रॉम्प्ट (Advanced)",
    professional: "प्रोफेशनल प्रॉम्प्ट (Professional)",
    beginnerExplanation: "शुरुआती गाइड (Explanation)",
    copyBtn: "प्रॉम्प्ट कॉपी करें",
    copied: "कॉपी हुआ!",
    free: "मुफ़्त",
    monthly: "/ महीना",
    keyConcepts: "मुख्य अवधारणाएँ (Key Concepts)",
    practicalExercise: "व्यावहारिक अभ्यास (Exercise)",
    expectedOutcome: "अपेक्षित परिणाम (Outcome)",
    docsPurpose: "ब्रेनस्टॉर्मिंग, आइडिया कलेक्शन, प्लानिंग और पहला ड्राफ्ट लिखना।",
    docsWhy: "गूगल डॉक्स बिना किसी रुकावट के विचारों को क्लाउड पर सुरक्षित रूप से लिखने और ड्राफ्ट तैयार करने की सुविधा देता है।",
    docsOutput: "एक व्यवस्थित पाठ ड्राफ्ट जिसमें परियोजना की रूपरेखा, शोध के अंश और मुख्य उद्देश्य शामिल हों।",
    docsStarterPrompt: "इस प्रोजेक्ट के मुख्य लक्ष्यों, आवश्यक फीचर्स और लक्षित दर्शकों की रूपरेखा तैयार करते हुए एक प्रोजेक्ट ब्रीफ लिखें।",
    docsProPrompt: "सिस्टम की सीमाओं, कंटेंट स्क्रिप्ट और आवश्यक संपत्तियों का विवरण देते हुए इस प्रोजेक्ट के लिए एक विस्तृत विनिर्देश दस्तावेज़ तैयार करें।",
    docsExplanation: "अपने सभी कच्चे विचारों, टेक्स्ट और स्क्रिप्ट को एक जगह लिखने के लिए गूगल डॉक्स का उपयोग करें। यह एआई प्रोसेसिंग से पहले आपका मुख्य स्टेजिंग प्लेटफॉर्म है।",
    chatgptPurpose: "कच्चे नोट्स को व्यवस्थित JSON प्रॉम्प्ट, वर्कफ़्लो और उत्पादन के लिए तैयार निर्देशों में बदलना।",
    chatgptWhy: "चैटजीपीटी तार्किक तर्क करने, टेक्स्ट संरचना को समझने और अन्य एआई टूल्स के लिए प्रॉम्प्ट को अनुकूलित करने में उत्कृष्ट है।",
    chatgptOutput: "व्यवस्थित XML/JSON विनिर्देश, अनुकूलित प्रॉम्प्ट और विशिष्ट इंजनों के लिए सटीक निर्देश सेट।",
    chatgptStarterPrompt: "मैं आपको अपने कच्चे प्रोजेक्ट नोट्स प्रदान करूँगा। उन्हें व्यवस्थित दिशानिर्देशों और अनुकूलित निर्देशों में बदलें।",
    chatgptProPrompt: "प्रदान किए गए प्रोजेक्ट विनिर्देश ड्राफ्ट का विश्लेषण करें। इसे मॉड्यूलर निर्देशों में तोड़ें और अन्य एआई मॉडल के लिए प्रॉम्प्ट जनरेट करें।",
    chatgptExplanation: "अपने गूगल डॉक्स ड्राफ्ट को यहाँ पेस्ट करें और चैटजीपीटी से इसे बेहतर बनाने के लिए कहें। यह आपके वर्कफ़्लो को नियंत्रित करता है।"
  },
  Hinglish: {
    purpose: "Purpose (काम क्या है)",
    whyThisTool: "Why This Tool (यही टूल क्यों)",
    expectedOutput: "Expected Output (नतीजा क्या मिलेगा)",
    masterPrompt: "Master Prompt (कॉपी करने योग्य प्रॉम्प्ट्स)",
    alternativeTools: "Alternative Tools (दुसरे टूल्स)",
    estimatedCost: "Estimated Cost (अनुमानित खर्च)",
    estimatedTime: "Estimated Time (समय कितना लगेगा)",
    starter: "Starter Prompt (शुरुआती प्रॉम्प्ट)",
    advanced: "Advanced Prompt (मीडियम प्रॉम्प्ट)",
    professional: "Professional Prompt (प्रोफेशनल प्रॉम्प्ट)",
    beginnerExplanation: "Beginner Explanation (आसान हिंदी में समझें)",
    copyBtn: "Prompt Copy karein",
    copied: "Copied!",
    free: "Free",
    monthly: "/ month",
    keyConcepts: "Key Concepts",
    practicalExercise: "Practical Exercise",
    expectedOutcome: "Expected Outcome (नतीजा)",
    docsPurpose: "Brainstorming, ideas collect karna, planning aur first draft likhna.",
    docsWhy: "Google Docs ek cloud-based writing board deta hai jisme bina distraction ke ideas likhe aur save kiye ja sakte hain.",
    docsOutput: "Ek clear text draft jisme project ka outline, research aur core details hon.",
    docsStarterPrompt: "Is project ke main goals, features aur target audience ko define karte hue ek summary draft likho.",
    docsProPrompt: "Is project ke specifications ka deep document banao, jisme hardware requirements, constraints aur workflows mentioned hon.",
    docsExplanation: "Google Docs par sabse pehle apne saare ideas ek jagah likh lo. Yeh aapka raw draft zone hai jahan se hum data copy karenge.",
    chatgptPurpose: "Rough notes ko structured JSON prompts, workflows aur production-ready instructions me convert karna.",
    chatgptWhy: "ChatGPT aapke raw draft ko optimize karke specific instructions aur prompts me badal deta hai jo dusre AI tools ko samajh aaye.",
    chatgptOutput: "Formatted prompts, dynamic instructions aur custom JSON/XML config parameters.",
    chatgptStarterPrompt: "Main aapko raw notes dunga. Aap inko structured project outline aur detailed commands me translate karein.",
    chatgptProPrompt: "Niche diye gaye specifications ko analyze karein aur tasks ke liye customized system prompt banakar modular JSON templates generate karein.",
    chatgptExplanation: "Apne Google Docs ke draft ko yahan paste karke ChatGPT se prompts nikalwayein, jo dusre engines ko input dene me kaam aayenge."
  }
};

const stepsTranslation = {
  English: {
    "Google Docs": "Google Docs",
    "ChatGPT": "ChatGPT",
    "Image Generator": "Image Generator",
    "Video Generator": "Video Generator",
    "Voice Generator": "Voice Generator",
    "Video Editor": "Video Editor",
    "Publishing Tool": "Publishing Tool",
    "Upscaler": "Upscaler",
    "Editor": "Editor",
    "Cursor": "Cursor",
    "GitHub Copilot": "GitHub Copilot",
    "Testing Tool": "Testing Tool",
    "Deployment Tool": "Deployment Tool",
    "Lovable": "Lovable",
    "Bolt": "Bolt.new",
    "Deployment Platform": "Deployment Platform",
    "Suno": "Suno AI",
    "Audio Enhancement Tool": "Audio Enhancement Tool",
    "Distribution Tool": "Distribution Tool",
    "Design Tool": "Design Tool",
    "Monetization Tool": "Monetization Tool",
    "Marketing Tool": "Marketing Tool",
    "Collaboration Tool": "Collaboration Tool",
    "Automation Tool": "Automation Tool",
    "Earning Platform": "Earning Platform",
    "Agent Creator": "Agent Creator",
    "Browser Agent": "Browser Agent",
    "Integration Platform": "Integration Platform",
    "Logo Generator": "Logo Generator",
    "Color Palette Designer": "Color Palette Designer",
    "Layout Designer": "Layout Designer",
    "Branding Assistant": "Branding Assistant",
    "Text Reader": "Text Reader",
    "Voice Cloning": "Voice Cloning",
    "EHR System": "EHR System",
    "IoT Platform": "IoT Platform",
    "IoT Design": "IoT Design",
    "Predictive Maintenance": "Predictive Maintenance"
  },
  Hindi: {
    "Google Docs": "गूगल डॉक्स (Google Docs)",
    "ChatGPT": "चैटजीपीटी (ChatGPT)",
    "Image Generator": "इमेज जनरेटर (Image Generator)",
    "Video Generator": "वीडियो जनरेटर (Video Generator)",
    "Voice Generator": "वॉयस जनरेटर (Voice Generator)",
    "Video Editor": "वीडियो एडिटर (Video Editor)",
    "Publishing Tool": "पब्लिशिंग टूल (Publishing Tool)",
    "Upscaler": "इमेज अपस्केलर (Upscaler)",
    "Editor": "डिजाइन एडिटर (Editor)",
    "Cursor": "कर्सर कोड एडिटर (Cursor)",
    "GitHub Copilot": "गिटहब कोपायलट (GitHub Copilot)",
    "Testing Tool": "टेस्टिंग टूल (Testing Tool)",
    "Deployment Tool": "डिप्लॉयमेंट टूल (Deployment Tool)",
    "Lovable": "लवेबल ऐप बिल्डर (Lovable)",
    "Bolt": "बोल्ट ऐप निर्माता (Bolt.new)",
    "Deployment Platform": "क्लाउड डिप्लॉयमेंट (Deployment Platform)",
    "Suno": "सुनो म्यूजिक एआई (Suno AI)",
    "Audio Enhancement Tool": "ऑडियो एनहांसर (Audio Enhancement Tool)",
    "Distribution Tool": "म्यूजिक डिस्ट्रीब्यूशन (Distribution Tool)",
    "Design Tool": "डिजाइन टूल (Design Tool)",
    "Monetization Tool": "कमाई का माध्यम (Monetization)",
    "Marketing Tool": "मार्केटिंग टूल (Marketing Tool)",
    "Collaboration Tool": "टीम कोलैबोरेशन (Collaboration)",
    "Automation Tool": "ऑटोमेशन टूल (Automation Tool)",
    "Earning Platform": "कमाई का प्लेटफार्म (Earning Platform)",
    "Agent Creator": "एआई एजेंट निर्माता (Agent Creator)",
    "Browser Agent": "ब्राउज़र एजेंट (Browser Agent)",
    "Integration Platform": "सिस्टम एकीकरण (Integration Platform)",
    "Logo Generator": "लोगो जनरेटर (Logo Generator)",
    "Color Palette Designer": "कलर पैलेट डिजाइनर (Color Palette Designer)",
    "Layout Designer": "लेआउट डिजाइनर (Layout Designer)",
    "Branding Assistant": "ब्रांडिंग असिस्टेंट (Branding Assistant)",
    "Text Reader": "टेक्स्ट रीडर (Text Reader)",
    "Voice Cloning": "वॉयस क्लोनिंग (Voice Cloning)",
    "EHR System": "मेडिकल रिकॉर्ड सिस्टम (EHR System)",
    "IoT Platform": "आईओटी प्लेटफार्म (IoT Platform)",
    "IoT Design": "आईओटी डिजाइन (IoT Design)",
    "Predictive Maintenance": "पूर्वानुमानित रखरखाव (Predictive Maintenance)"
  },
  Hinglish: {
    "Google Docs": "Google Docs (प्लानिंग)",
    "ChatGPT": "ChatGPT (प्रॉम्प्ट मेकर)",
    "Image Generator": "Image Generator (इमेज जनरेटर)",
    "Video Generator": "Video Generator (वीडियो जनरेटर)",
    "Voice Generator": "Voice Generator (वॉयस जनरेटर)",
    "Video Editor": "Video Editor (वीडियो एडिटर)",
    "Publishing Tool": "Publishing Tool (पब्लिशिंग टूल)",
    "Upscaler": "Upscaler (क्वालिटी बढ़ाएं)",
    "Editor": "Editor (फाइनल चेंजेस)",
    "Cursor": "Cursor IDE (कोडिंग एडिटर)",
    "GitHub Copilot": "GitHub Copilot (ऑटो-कम्पलीट)",
    "Testing Tool": "Testing Tool (एरर चेकर)",
    "Deployment Tool": "Deployment Tool (लाइव करें)",
    "Lovable": "Lovable (फुल-स्टैक बिल्डर)",
    "Bolt": "Bolt.new (रैपिड प्रोटोटाइप)",
    "Deployment Platform": "Deployment Platform (होस्टिंग)",
    "Suno": "Suno AI (म्यूजिक मेकर)",
    "Audio Enhancement Tool": "Audio Enhancement Tool (आवाज़ साफ़ करें)",
    "Distribution Tool": "Distribution Tool (मार्केट में भेजें)",
    "Design Tool": "Design Tool (डिजाइन मेकर)",
    "Monetization Tool": "Monetization Tool (कमाई का टूल)",
    "Marketing Tool": "Marketing Tool (मार्केटिंग टूल)",
    "Collaboration Tool": "Collaboration Tool (टीम कोऑर्डिनेशन)",
    "Automation Tool": "Automation Tool (ऑटोमेशन टूल)",
    "Earning Platform": "Earning Platform (कमाई का तरीका)",
    "Agent Creator": "Agent Creator (एजेंट मेकर)",
    "Browser Agent": "Browser Agent (वेब एजेंट)",
    "Integration Platform": "Integration Platform (सिस्टम सिंक)",
    "Logo Generator": "Logo Generator (लोगो मेकर)",
    "Color Palette Designer": "Color Palette Designer (कलर थीम्स)",
    "Layout Designer": "Layout Designer (लेआउट मेकर)",
    "Branding Assistant": "Branding Assistant (ब्रांड मैनेजर)",
    "Text Reader": "Text Reader (टेक्स्ट टू स्पीच)",
    "Voice Cloning": "Voice Cloning (आवाज़ क्लोन करना)",
    "EHR System": "EHR System (मेडिकल फाइल्स)",
    "IoT Platform": "IoT Platform (सेंसर सिंक)",
    "IoT Design": "IoT Design (हार्डवेयर डिजाइन)",
    "Predictive Maintenance": "Predictive Maintenance (मशीन चेक)"
  }
};

const officialTasksMappings = {
  "Design and Prototype Hardware": {
    recommended_tool: "Flux AI",
    reason: "Excellent for industrial design concepts, PCB visualization, product ideation and hardware renders.",
    official_link: "https://flux.ai",
    quick_guide: "Describe your hardware idea in ChatGPT to generate a JSON prompt, then use that prompt in Flux AI to visualize your concept."
  },
  "Generate a Complete AI Video": {
    recommended_tool: "Flow AI",
    reason: "Best for cinematic AI video generation with prompt-based workflows.",
    official_link: "https://labs.google/fx/tools/flow",
    quick_guide: "Generate a JSON prompt using ChatGPT and paste it into Flow AI for professional video generation."
  },
  "Generate Professional AI Images": {
    recommended_tool: "Flow AI",
    reason: "Supports high-quality image generation with structured prompts.",
    official_link: "https://labs.google/fx/tools/flow",
    quick_guide: "Use ChatGPT to create a JSON prompt and generate images directly in Flow AI."
  },
  "Create Digital Designs Using AI": {
    recommended_tool: "Canva AI",
    reason: "Best for presentations, social media posts, banners, posters and marketing creatives.",
    official_link: "https://www.canva.com/ai-image-generator/",
    quick_guide: "Generate a design prompt and create editable graphics inside Canva AI."
  },
  "Build Software Using AI": {
    recommended_tool: "Antigravity 2.0",
    reason: "Agentic coding environment capable of building complete applications.",
    official_link: "https://antigravity.dev",
    quick_guide: [
      "Visit the official website.",
      "Download the desktop version for Windows/macOS/Linux.",
      "Install the application.",
      "Open Antigravity.",
      "Paste the generated master prompt.",
      "Allow the agent to generate and edit the project."
    ]
  },
  "Build Android Application": {
    recommended_tool: "Android Studio",
    reason: "Official Android development environment from Google.",
    official_link: "https://developer.android.com/studio",
    quick_guide: [
      "Download Android Studio from the official website.",
      "Install using the default setup.",
      "Launch Android Studio.",
      "Open or create a new project.",
      "Use the generated prompt with your preferred AI coding assistant."
    ]
  },
  "Monetize AI Skills": {
    recommended_tool: "Fiverr",
    reason: "One of the largest marketplaces for selling AI services and digital work.",
    official_link: "https://www.fiverr.com",
    alternative_tools: [
      {
        "name": "Upwork",
        "link": "https://www.upwork.com"
      },
      {
        "name": "Contra",
        "link": "https://contra.com"
      }
    ],
    quick_guide: "Create a professional portfolio, publish AI service listings and start acquiring clients."
  },
  "Create Music Using AI": {
    recommended_tool: "Suno AI",
    reason: "Industry-leading AI music generation platform.",
    official_link: "https://suno.com",
    quick_guide: "Generate a structured music prompt and create complete songs with lyrics and vocals."
  },
  "Generate Professional Voice Over": {
    recommended_tool: "ElevenLabs",
    reason: "High-quality multilingual AI voice synthesis.",
    official_link: "https://elevenlabs.io",
    quick_guide: "Generate a voice-over script and paste it into ElevenLabs for natural speech generation."
  },
  "Build a Brand Using AI": {
    recommended_tool: "Pomello by Google",
    reason: "AI-assisted branding, ideation and creative workflow generation.",
    official_link: "https://labs.google",
    quick_guide: "Generate brand strategy, naming ideas and visual identity prompts before creating assets."
  },
  "Build a Personal AI Assistant": {
    recommended_tool: "Antigravity 2.0",
    reason: "Supports autonomous multi-agent development and local execution.",
    official_link: "https://antigravity.dev",
    quick_guide: [
      "Download Antigravity desktop from the official website.",
      "Install and launch the application.",
      "Paste the generated AI assistant prompt.",
      "Allow the agent to create, test and refine the assistant automatically."
    ]
  }
};

const taskToolMatrix = {
  "Exploring AI": ["ChatGPT", "Gemini", "Claude", "Perplexity", "NotebookLM"],
  "Generate a Complete AI Video": ["Flow AI"],
  "Generate Professional AI Images": ["Flow AI"],
  "Create Digital Designs Using AI": ["Canva AI"],
  "Build Software Using AI": ["Antigravity 2.0"],
  "Build Android Application": ["Android Studio"],
  "Monetize AI Skills": ["Fiverr"],
  "Create Music Using AI": ["Suno AI"],
  "Generate Professional Voice Over": ["ElevenLabs"],
  "Build a Brand Using AI": ["Pomello by Google"],
  "Build a Personal AI Assistant": ["Antigravity 2.0"],
  "Design and Prototype Hardware": ["Flux AI"]
};

const topAIToolsDatabase = {
  "LLMs": ["ChatGPT", "Claude", "Gemini", "Perplexity", "NotebookLM"],
  "Coding": ["Claude", "Cursor", "GitHub Copilot", "Windsurf", "Antigravity 2.0", "Codeium"],
  "Video": ["Flow AI", "Google Veo", "Runway", "Kling AI", "Pika", "Luma Dream Machine"],
  "Image": ["Midjourney", "Google Imagen", "Adobe Firefly", "Flux", "Ideogram", "Canva AI"],
  "Voice": ["ElevenLabs", "PlayHT", "Murf AI"],
  "Music": ["Suno", "AIVA", "Udio"],
  "Design": ["Canva AI", "Adobe Firefly", "Figma AI", "Ideogram"],
  "Productivity": ["Notion AI", "Motion", "Reclaim", "Zapier", "ClickUp AI"]
};

const toolSelectionRules = {
  "Beginner": {
    "priority": "Ease of use",
    "workflowLength": "Detailed",
    "toolComplexity": "Low"
  },
  "Intermediate": {
    "priority": "Balance",
    "workflowLength": "Moderate",
    "toolComplexity": "Medium"
  },
  "Advanced": {
    "priority": "Performance",
    "workflowLength": "Concise",
    "toolComplexity": "High"
  }
};

const optionToMatrixKey = {
  "Exploring AI": "Exploring AI",
  "Generating Video": "Generate a Complete AI Video",
  "Generating Images": "Generate Professional AI Images",
  "Designing": "Create Digital Designs Using AI",
  "Coding": "Build Software Using AI",
  "Building Apps": "Build Android Application",
  "Tips to Earn Money": "Monetize AI Skills",
  "Music Making": "Create Music Using AI",
  "Voice Over Generation": "Generate Professional Voice Over",
  "Brand Building": "Build a Brand Using AI",
  "Personal AI Building": "Build a Personal AI Assistant",
  "Hardware Building": "Design and Prototype Hardware"
};

function generateDynamicWorkflow(goalText, budgetLimit, experienceLevel) {
  const taskKey = optionToMatrixKey[goalText] || goalText;
  let candidates = taskToolMatrix[taskKey] || taskToolMatrix["Generate a Complete AI Video"];
  
  if (taskKey === "Exploring AI") {
    let filteredCandidates = [...candidates];
    let finalWorkflow = [];
    for (let cName of filteredCandidates) {
      finalWorkflow.push(findToolForStep(cName, budgetLimit, goalText, experienceLevel));
    }
    return finalWorkflow;
  }
  
  // Filter out any existing Google Docs or ChatGPT references to prevent duplicates
  let otherCandidates = candidates.filter(name => {
    const lower = name.toLowerCase();
    return lower !== "google docs" && lower !== "chatgpt" && lower !== "google documents";
  });
  
  // Optionally filter other general tools if experience level is Advanced
  if (experienceLevel === "Advanced") {
    if (otherCandidates.length > 2) {
      otherCandidates = otherCandidates.filter(name => {
        const lower = name.toLowerCase();
        return lower !== "gemini" && lower !== "google gemini";
      });
    }
  }

  let finalCandidates = [...otherCandidates];
  let finalWorkflow = [];
  let categoriesSeen = new Set();
  
  for (let cName of finalCandidates) {
    const resolved = findToolForStep(cName, budgetLimit, goalText, experienceLevel);
    const toolObj = resolved.tool;
    
    // Determine category classification group to deduplicate overlapping types
    let group = toolObj.category;
    if (toolObj.taskTags && toolObj.taskTags.includes("video")) group = "video";
    else if (toolObj.taskTags && toolObj.taskTags.includes("image")) group = "image";
    else if (toolObj.taskTags && (toolObj.taskTags.includes("voiceover") || toolObj.taskTags.includes("audio-to-text"))) group = "voice";
    else if (toolObj.taskTags && toolObj.taskTags.includes("music")) group = "music";
    
    if (!categoriesSeen.has(group)) {
      categoriesSeen.add(group);
      finalWorkflow.push(resolved);
    }
  }
  
  return finalWorkflow;
}

function findToolForStep(stepName, budgetLimit, goal = '', experienceLevel = 'Intermediate') {
  const nameLower = stepName.toLowerCase();
  const findByName = (name) => toolsData.find(t => t.name.toLowerCase() === name.toLowerCase()) || toolsData.find(t => t.title.toLowerCase() === name.toLowerCase());

  if (nameLower.includes("docs") || nameLower === "google docs" || nameLower === "google documents") {
    return { tool: googleDocsTool, mode: "Free", cost: 0 };
  }
  if (nameLower === "chatgpt") {
    return { tool: chatGptTool, mode: "Free", cost: 0 };
  }

  let matchedTool = null;

  // 1. Music Generation
  if (nameLower.includes("music") || nameLower.includes("suno") || nameLower.includes("udio") || nameLower.includes("song")) {
    if (budgetLimit === 0) {
      matchedTool = findByName("Suno"); // Suno has free tier
    } else if (budgetLimit <= 20) {
      matchedTool = findByName("Suno"); // Suno basic plan
    } else if (budgetLimit <= 500) {
      matchedTool = findByName("Suno") || findByName("Udio");
    } else {
      matchedTool = findByName("Suno") || findByName("Udio");
    }
  }

  // 2. Video Generation
  else if (nameLower.includes("video") || nameLower.includes("runway") || nameLower.includes("luma") || nameLower.includes("sora") || nameLower.includes("pika") || nameLower.includes("vidu") || nameLower.includes("veo") || nameLower.includes("flow")) {
    if (budgetLimit === 0) {
      matchedTool = findByName("Flow AI"); // Free tier
    } else if (budgetLimit <= 20) {
      matchedTool = findByName("CapCut"); // Free/cheap tier video tools
    } else if (budgetLimit <= 500) {
      matchedTool = findByName("Kling AI") || findByName("Pika");
    } else if (budgetLimit <= 1000) {
      matchedTool = findByName("Runway ML") || findByName("Luma Dream Machine");
    } else {
      matchedTool = findByName("OpenAI Sora") || findByName("Google Veo");
    }
  }

  // 3. Image Generation
  else if (nameLower.includes("image") || nameLower.includes("midjourney") || nameLower.includes("flux") || nameLower.includes("leonardo") || nameLower.includes("spectra") || nameLower.includes("ideogram") || nameLower.includes("imagen") || nameLower.includes("firefly") || nameLower.includes("graphic")) {
    if (budgetLimit === 0) {
      matchedTool = findByName("Google Imagen") || findByName("Leonardo AI"); // Free tier options
    } else if (budgetLimit <= 20) {
      matchedTool = findByName("Canva AI"); // Starter tier
    } else if (budgetLimit <= 500) {
      matchedTool = findByName("Flux") || findByName("Ideogram"); // Professional tier
    } else if (budgetLimit <= 1000) {
      matchedTool = findByName("Midjourney"); // Advanced tier
    } else {
      matchedTool = findByName("Adobe Firefly"); // Enterprise tier
    }
  }

  // 4. Voice Generation
  else if (nameLower.includes("voice") || nameLower.includes("elevenlabs") || nameLower.includes("playht") || nameLower.includes("resemble") || nameLower.includes("speech") || nameLower.includes("vocalise")) {
    if (budgetLimit === 0) {
      matchedTool = findByName("PlayHT"); // Free tier option
    } else if (budgetLimit <= 20) {
      matchedTool = findByName("ElevenLabs"); // ElevenLabs Starter
    } else if (budgetLimit <= 500) {
      matchedTool = findByName("ElevenLabs"); // Creator plan
    } else {
      matchedTool = findByName("ElevenLabs") || findByName("WellSaid Labs");
    }
  }

  // 5. Coding & Software Development
  else if (nameLower.includes("code") || nameLower.includes("coding") || nameLower.includes("dev") || nameLower.includes("cursor") || nameLower.includes("copilot") || nameLower.includes("replit") || nameLower.includes("windsurf")) {
    if (budgetLimit === 0) {
      matchedTool = findByName("GitHub Copilot Free") || findByName("Codeium"); // Free tools
    } else if (budgetLimit <= 20) {
      matchedTool = findByName("Cursor Free"); // Starter tier
    } else if (budgetLimit <= 500) {
      matchedTool = findByName("GitHub Copilot"); // Professional tier
    } else if (budgetLimit <= 1000) {
      matchedTool = findByName("Cursor Pro") || findByName("Windsurf"); // Advanced tier
    } else {
      matchedTool = findByName("Antigravity 2.0"); // Enterprise tier
    }
  }

  // 6. App Builder
  else if (nameLower.includes("app") || nameLower.includes("apk") || nameLower.includes("android") || nameLower.includes("project") || nameLower.includes("build")) {
    if (budgetLimit === 0) {
      matchedTool = findByName("Android Studio");
    } else if (budgetLimit <= 20) {
      matchedTool = findByName("Bolt.new");
    } else if (budgetLimit <= 1000) {
      matchedTool = findByName("Lovable");
    } else {
      matchedTool = findByName("Antigravity 2.0");
    }
  }

  // 7. Automation & Integration
  else if (nameLower.includes("automation") || nameLower.includes("zapier") || nameLower.includes("lindy") || nameLower.includes("webhook") || nameLower.includes("integration")) {
    if (budgetLimit === 0) {
      matchedTool = findByName("Lindy");
    } else if (budgetLimit <= 1000) {
      matchedTool = findByName("Zapier");
    } else {
      matchedTool = findByName("Zapier AI Agents");
    }
  }

  // Fallback to name search in dataset
  if (!matchedTool) {
    matchedTool = findByName(stepName);
  }
  if (!matchedTool) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === nameLower || t.title.toLowerCase() === nameLower);
  }
  if (!matchedTool) {
    matchedTool = toolsData.find(t => t.name.toLowerCase().includes(nameLower) || t.title.toLowerCase().includes(nameLower));
  }
  if (!matchedTool) {
    matchedTool = toolsData[0];
  }

  // Calculate pricing values
  let mode = "Free";
  let cost = 0;
  
  if (budgetLimit > 0 && matchedTool.cost > 0 && matchedTool.cost <= budgetLimit) {
    mode = "Paid";
    cost = matchedTool.cost;
  } else {
    mode = (matchedTool.cost === 0 || (matchedTool.pricing && matchedTool.pricing.toLowerCase().includes("free"))) ? "Free" : "Paid";
    cost = mode === "Free" ? 0 : matchedTool.cost;
  }

  return { tool: matchedTool, mode, cost };
}

function getUniversalPromptForTool(toolName, category, tags) {
  const t = toolName.toLowerCase();
  const cat = (category || "").toUpperCase();
  const tgs = tags || [];

  const isVideoGen = cat.includes("CREATION") && (tgs.includes("video") || tgs.includes("animation"));
  const isImageGen = cat.includes("CREATION") && (tgs.includes("images") || tgs.includes("graphics") || tgs.includes("image") || tgs.includes("logo") || tgs.includes("design"));
  const isAudioGen = cat.includes("CREATION") && (tgs.includes("voiceover") || tgs.includes("audio") || tgs.includes("speech"));
  const isMusicGen = cat.includes("CREATION") && (tgs.includes("music") || tgs.includes("music-generation") || tgs.includes("lyrics"));
  const isCoding = cat.includes("ENGINEERING") || tgs.includes("codegen") || tgs.includes("coding") || tgs.includes("builder") || tgs.includes("editor") || tgs.includes("refactoring");

  if (isVideoGen) {
    return `[ROLE]: Expert AI Video Director & Prompt Engineer.
[OBJECTIVE]: Generate a visually stunning, coherent, and motion-consistent video clip for the user's project.
[USER PROJECT/REQUIREMENTS]:
===
[REPLACE WITH YOUR VIDEO CONCEPT, SCENE SCRIPT, OR STORYBOARD HIGHLIGHTS]
===
[VISUAL STYLE & CONFIGURATION]:
- Style: Cinematic, high visual fidelity, photorealistic details, 8k resolution.
- Camera Movement: Dynamic tracking shot, steady panning, or dramatic zoom.
- Lighting: Realistic reflections, volumetric lighting, consistent shadows.
- Physical Consistency: Natural movements, fluid character animation, matching environment physics.
[INSTRUCTION]: Read the user project, format it into a descriptive video generation command, and optimize engine weights for motion consistency.`;
  }

  if (isImageGen) {
    return `[ROLE]: Master Prompt Engineer for Text-to-Image Generation.
[OBJECTIVE]: Construct a high-density, descriptive prompt for generating premium, production-quality visual assets.
[USER IMAGE REQUIREMENT]:
===
[REPLACE WITH YOUR IMAGE DESCRIPTION, DESIGN STYLE, OR SCENE DETAILS]
===
[ARTISTIC DIRECTION & ATTRIBUTES]:
- Composition: Golden ratio framing, extreme close-up or wide-angle view, hyper-detailed textures.
- Lighting: Volumetric god rays, soft studio lighting, high contrast chiaroscuro.
- Resolution Descriptors: Photorealistic, octane render, 8k resolution, crisp focus.
- Exclude: Deformed limbs, double text, blurry artifacts.
[INSTRUCTION]: Translate the user concept into a single, cohesive, highly descriptive prompt to maximize visual output quality.`;
  }

  if (isAudioGen) {
    return `[ROLE]: Professional Voice Over Artist & Sound Engineer.
[OBJECTIVE]: Structure text script variables and voice synthesis instructions for realistic, expressive, and human-like voice synthesis.
[USER SCRIPT & TONE]:
===
[REPLACE WITH YOUR VOICE OVER SCRIPT, VOICE TYPE (MALE/FEMALE), AND SPECIFIC TONE EMOTIONS]
===
[ACOUSTIC STYLE & PROMPT CONFIGURATION]:
- Vocal Character: Clear enunciation, natural pacing, professional voiceover narration.
- Tone/Mood: Dynamic emotional response, high fidelity voice cloning setup, no audio clipping.
[INSTRUCTION]: Format the script with appropriate pause markers [pause], emotional tags, and emphasis indicators for synthesis.`;
  }

  if (isMusicGen) {
    return `[ROLE]: Chart-Topping AI Music Producer & Composer.
[OBJECTIVE]: Write matching lyrics, structural song layouts, and instrumentation prompts for premium AI music generation.
[USER LYRICS / GENRE OBJECTIVE]:
===
[REPLACE WITH YOUR SONG TOPIC, LYRICS DRAFT, OR GENRE FOCUS (e.g. CYBERPUNK SYNTHWAVE, ACCOUSTIC BALLAD)]
===
[SONG STRUCTURE & STYLE DETAILS]:
- Structure: [Verse 1] -> [Chorus] -> [Verse 2] -> [Chorus] -> [Bridge] -> [Outro].
- Musical Style: High tempo syncopation, vibrant synth lines, or clean acoustic guitar riffs.
[INSTRUCTION]: Compile the song details and output structure tags and genre descriptions optimized for music generation models.`;
  }

  if (isCoding) {
    return `[ROLE]: Principal AI Software Architect & Senior Code Assistant.
[OBJECTIVE]: Write modular, production-grade source code, microcontroller sketches, or hardware configurations based on project specifications.
[USER CODING SPECIFICATIONS]:
===
[REPLACE WITH YOUR PROGRAM REQUIREMENTS, API BEHAVIORS, SENSOR TYPES, OR BUG DETAILS]
===
[TECHNICAL CONSTRAINTS & PATTERNS]:
- Design Pattern: Clean architecture, modular interfaces, object-oriented or structured code.
- Error Handling: Robust try-catch logs, boundary checks, zero leaks.
- Language/Framework: Use the most suitable standards (e.g. modern C++, Python, Javascript, Assembly, or Verilog HDL).
[INSTRUCTION]: Analyze the requirements, map database connections, write clean optimized code files, and provide instructions for testing and compiling.`;
  }

  return `[ROLE]: Expert AI Assistant, Copywriter, & Strategic Planner.
[OBJECTIVE]: Analyze information, write copy, compile research, or draft distribution plans according to the user's objective.
[USER GOAL/OBJECTIVE]:
===
[REPLACE WITH YOUR WORK DETAILS, ARTICLE OUTLINE, MARKETING STRATEGY, OR EARNING TARGET]
===
[GUIDELINES & CONSTRAINTS]:
- Tone: Professional, structured, persuasive, clear, and highly engaging.
- Output Format: Modular headings, markdown lists, clean sections, actionable guidelines.
[INSTRUCTION]: Process the inputs, verify citations if researching, write professional copy, and layout execution steps.`;
}

function generatePrompts(toolName, goal, lang) {
  const t = toolName.toLowerCase();
  const goalLower = (goal || "").toLowerCase();
  
  const matchedTool = toolsData.find(x => x.name.toLowerCase() === t) || {};
  const universalPrompt = getUniversalPromptForTool(toolName, matchedTool.category, matchedTool.taskTags);
  
  let starter = "";
  let advanced = "";
  let pro = "";
  let exp = "";
  let purpose = "";
  let why = "";
  let expectedOutput = "";
  let cost = "Free";
  let time = "30 mins";
  let alternatives = "";
  
  const labels = translationDB[lang] || translationDB["Hinglish"];

  // Category classification
  const isAudio = ["voice over generation", "music making", "help in music editing", "audio processing"].includes(goalLower);
  const isEngineering = ["coding", "hardware building"].includes(goalLower);
  const isMediaPublishing = ["writing work", "brand building", "generating video"].includes(goalLower);

  if (isAudio) {
    cost = "Free / paid options";
    time = "45 mins";
    alternatives = "boAt Nirvanaa Space (Celestial White), Sennheiser HD, Beyerdynamic DT";
    if (lang === "English") {
      purpose = `Process high-quality audio files using ${toolName} with boAt Nirvanaa Space (Celestial White) monitoring.`;
      why = `Optimizes frequency response curves matching V-curve sound profiles and handles active noise cancellation workflows.`;
      expectedOutput = `Cleaned and mixed WAV/MP3 files ready for audio monitoring.`;
      starter = `Set up a basic project in ${toolName} for ${goal} using active noise cancellation to clear background noise.`;
      advanced = `Configure V-curve sound profiles on ${toolName} to optimize the audio for ${goal}, verifying with active noise cancellation.`;
      pro = `Establish an advanced audio monitoring pipeline in ${toolName} for ${goal}. Prioritize boAt Nirvanaa Space (Celestial White) references, tune V-curve sound profiles, and execute active noise cancellation workflows for studio mastering.`;
      exp = `Ensure your playback device is set to boAt Nirvanaa Space (Celestial White). Activate noise cancellation and monitor the output levels.`;
    } else if (lang === "Hindi") {
      purpose = `boAt Nirvanaa Space (Celestial White) मॉनिटरिंग के साथ ${toolName} का उपयोग करके उच्च गुणवत्ता वाली ऑडियो फाइलें प्रोसेस करना।`;
      why = `यह V-curve साउंड प्रोफाइल के साथ फ्रीक्वेंसी रिस्पॉन्स को ऑप्टिमाइज़ करता है और एक्टिव नॉइज़ कैंसलेशन वर्कफ़्लो को संभालता है।`;
      expectedOutput = `साफ और मिक्स की गई WAV/MP3 फाइलें जो ऑडियो मॉनिटरिंग के लिए तैयार हैं।`;
      starter = `बैकग्राउंड नॉइज़ को साफ़ करने के लिए एक्टिव नॉइज़ कैंसलेशन का उपयोग करके ${goal} के लिए ${toolName} में एक बुनियादी प्रोजेक्ट सेट करें।`;
      advanced = `${goal} के लिए ऑडियो को ऑप्टिमाइज़ करने के लिए ${toolName} पर V-curve साउंड प्रोफाइल कॉन्फ़िगर करें, और एक्टिव नॉइज़ कैंसलेशन के साथ इसे सत्यापित करें।`;
      pro = `${goal} के लिए ${toolName} में एक उन्नत ऑडियो मॉनिटरिंग पाइपलाइन स्थापित करें। boAt Nirvanaa Space (Celestial White) संदर्भों को प्राथमिकता दें, V-curve साउंड प्रोफाइल को ट्यून करें, और स्टूडियो मास्टरिंग के लिए एक्टिव नॉइज़ कैंसलेशन वर्कफ़्लो निष्पादित करें।`;
      exp = `सुनिश्चित करें कि आपका प्लेबैक डिवाइस boAt Nirvanaa Space (Celestial White) पर सेट है। नॉइज़ कैंसलेशन सक्रिय करें और आउटपुट स्तरों की निगरानी करें।`;
    } else {
      purpose = `${toolName} aur boAt Nirvanaa Space (Celestial White) monitoring ke sath high-quality audio files process karna.`;
      why = `Yeh V-curve sound profile ke sath frequency response optimize karta hai aur active noise cancellation workflows handle karta hai.`;
      expectedOutput = `Clean aur mixed WAV/MP3 files jo audio monitoring ke liye ready hain.`;
      starter = `${toolName} me ${goal} ke liye basic project setup karein, aur background noise clear karne ke liye active noise cancellation use karein.`;
      advanced = `${toolName} par V-curve sound profiles configure karein taaki ${goal} ka audio optimize ho, aur active noise cancellation se test karein.`;
      pro = `${toolName} me ${goal} ke liye advanced audio monitoring pipeline banayein. boAt Nirvanaa Space (Celestial White) reference use karein, V-curve sound profiles tune karein, aur studio mastering ke liye active noise cancellation workflows run karein.`;
      exp = `Apne playback device ko boAt Nirvanaa Space (Celestial White) par set karein. Noise cancellation on karein aur output levels monitor karein.`;
    }
  } else if (isEngineering) {
    cost = "Free / open source";
    time = "1 hour";
    alternatives = "Arduino IDE, VS Code, ModelSim, Keil uVision";
    if (lang === "English") {
      purpose = `Develop program code, hardware descriptions, or microcontroller routines using ${toolName}.`;
      why = `Supports Verilog HDL, 8086 Assembly, and Arduino sensor integration scripts.`;
      expectedOutput = `Operational source code files, Verilog modules, or microcontroller sketches.`;
      starter = `Create a simple Arduino sensor integration sketch in ${toolName} for ${goal} that reads data from analog pin A0:\n\`\`\`cpp\nvoid setup() { Serial.begin(9600); }\nvoid loop() { int value = analogRead(A0); Serial.println(value); delay(500); }\n\`\`\``;
      advanced = `Write an 8086 Assembly routine in ${toolName} for ${goal} to perform a basic register data transfer and interrupt execution:\n\`\`\`assembly\nMOV AX, 2000H\nMOV DS, AX\nMOV AL, [0010H]\nADD AL, 05H\nMOV [0012H], AL\nINT 21H\n\`\`\``;
      pro = `Design a complete system for ${goal} combining a Verilog HDL module with Arduino sensor integration in ${toolName}. Verilog example:\n\`\`\`verilog\nmodule sensor_processor(clk, rst, sensor_in, alarm);\n  input clk, rst;\n  input [7:0] sensor_in;\n  output reg alarm;\n  always @(posedge clk) begin\n    if (rst) alarm <= 0;\n    else alarm <= (sensor_in > 8'd150) ? 1 : 0;\n  end\nendmodule\n\`\`\``;
      exp = `Compile and debug code. For microcontroller projects, upload the sketch via the Arduino IDE.`;
    } else if (lang === "Hindi") {
      purpose = `${toolName} का उपयोग करके प्रोग्राम कोड, हार्डवेयर विवरण, या माइक्रोकंट्रोलर रूटीन विकसित करना।`;
      why = `यह Verilog HDL, 8086 Assembly, और Arduino सेंसर इंटीग्रेशन स्क्रिप्ट का समर्थन करता है।`;
      expectedOutput = `परिचालन योग्य सोर्स कोड फ़ाइलें, Verilog मॉड्यूल, या माइक्रोकंट्रोलर स्केच।`;
      starter = `${goal} के लिए ${toolName} में एक साधारण Arduino सेंसर इंटीग्रेशन स्केच बनाएं जो एनालॉग पिन A0 से डेटा पढ़ता है:\n\`\`\`cpp\nvoid setup() { Serial.begin(9600); }\nvoid loop() { int value = analogRead(A0); Serial.println(value); delay(500); }\n\`\`\``;
      advanced = `${goal} के लिए ${toolName} में बुनियादी रजिस्टर डेटा ट्रांसफर और इंटरप्ट निष्पादन करने के लिए एक 8086 Assembly रूटीन लिखें:\n\`\`\`assembly\nMOV AX, 2000H\nMOV DS, AX\nMOV AL, [0010H]\nADD AL, 05H\nMOV [0012H], AL\nINT 21H\n\`\`\``;
      pro = `${goal} के लिए ${toolName} में Arduino सेंसर इंटीग्रेशन के साथ एक Verilog HDL मॉड्यूल को संयोजित करने वाला एक संपूर्ण सिस्टम डिज़ाइन करें। Verilog उदाहरण:\n\`\`\`verilog\nmodule sensor_processor(clk, rst, sensor_in, alarm);\n  input clk, rst;\n  input [7:0] sensor_in;\n  output reg alarm;\n  always @(posedge clk) begin\n    if (rst) alarm <= 0;\n    else alarm <= (sensor_in > 8'd150) ? 1 : 0;\n  end\nendmodule\n\`\`\``;
      exp = `Verilog सिमुलेशन को संकलित करके और Arduino IDE के माध्यम से भौतिक सेंसर आउटपुट का परीक्षण करके निष्पादन प्रवाह को सत्यापित करें।`;
    } else {
      purpose = `${toolName} use karke program code, hardware descriptions, ya microcontroller routines develop karna.`;
      why = `Yeh Verilog HDL, 8086 Assembly, aur Arduino sensor integration scripts support karta hai.`;
      expectedOutput = `Working source code files, Verilog modules, ya microcontroller sketches.`;
      starter = `${goal} ke liye ${toolName} me simple Arduino sensor integration sketch banayein jo analog pin A0 se data read kare:\n\`\`\`cpp\nvoid setup() { Serial.begin(9600); }\nvoid loop() { int value = analogRead(A0); Serial.println(value); delay(500); }\n\`\`\``;
      advanced = `${goal} ke liye ${toolName} me register data transfer aur interrupt handling perform karne ke liye 8086 Assembly routine likhein:\n\`\`\`assembly\nMOV AX, 2000H\nMOV DS, AX\nMOV AL, [0010H]\nADD AL, 05H\nMOV [0012H], AL\nINT 21H\n\`\`\``;
      pro = `${goal} ke liye ${toolName} me Arduino sensor integration ke sath Verilog HDL module combine karke complete system design karein. Verilog code:\n\`\`\`verilog\nmodule sensor_processor(clk, rst, sensor_in, alarm);\n  input clk, rst;\n  input [7:0] sensor_in;\n  output reg alarm;\n  always @(posedge clk) begin\n    if (rst) alarm <= 0;\n    else alarm <= (sensor_in > 8'd150) ? 1 : 0;\n  end\nendmodule\n\`\`\``;
      exp = `Verilog simulations compile karke aur Arduino IDE ke help se sensor outputs verify karke flow check karein.`;
    }
  } else if (isMediaPublishing) {
    cost = "Freemium / Paid options";
    time = "1.5 hours";
    alternatives = "Amazon KDP, Suno AI, Flow AI, Canva";
    if (lang === "English") {
      purpose = `Produce and publish digital media content, eBooks, or marketing materials using ${toolName}.`;
      why = `Optimizes eBook publishing workflows, independent publishing pathways, and Suno AI soundtrack creation.`;
      expectedOutput = `Formatted eBook manuscripts, Flow AI cinematic trailer storyboards, and Suno AI background audio tracks.`;
      starter = `Generate an eBook layout outline for ${goal} suitable for self-publishing platforms and independent publishing pathways.`;
      advanced = `Draft a storyboard script for a Flow AI cinematic trailer workflow to market ${goal} online.`;
      pro = `Develop a comprehensive media launch strategy for ${goal} using ${toolName}. Format manuscript for eBook publishing workflows, define independent publishing pathways, configure Flow AI cinematic trailer timelines, and generate matching Suno AI soundtracks.`;
      exp = `Upload formatted files to KDP, render video tracks using Flow AI, and bundle audio tracks generated from Suno AI.`;
    } else if (lang === "Hindi") {
      purpose = `${toolName} का उपयोग करके डिजिटल मीडिया सामग्री, ई-बुक्स, या मार्केटिंग सामग्री का उत्पादन और प्रकाशन करना।`;
      why = `यह ई-बुक प्रकाशन वर्कफ़्लो, स्वतंत्र प्रकाशन मार्गों और Suno AI साउंडट्रैक निर्माण को अनुकूलित करता है।`;
      expectedOutput = `फ़ॉर्मेट की गई ई-बुक पांडुलिपियां, Flow AI सिनेमाई ट्रेलर स्टोरीबोर्ड, और Suno AI बैकग्राउंड ऑडियो ट्रैक।`;
      starter = `सेल्फ-पब्लिशिंग प्लेटफॉर्म और स्वतंत्र प्रकाशन मार्गों (independent publishing pathways) के लिए उपयुक्त ${goal} के लिए एक ई-बुक लेआउट रूपरेखा तैयार करें।`;
      advanced = `${goal} को ऑनलाइन मार्केट करने के लिए Flow AI सिनेमाई ट्रेलर वर्कफ़्लो के लिए एक स्टोरीबोर्ड स्क्रिप्ट का ड्राफ्ट तैयार करें।`;
      pro = `${toolName} का उपयोग करके ${goal} के लिए एक व्यापक मीडिया लॉन्च रणनीति विकसित करें। ई-बुक प्रकाशन वर्कफ़्लो के लिए पांडुलिपि को फ़ॉर्मेट करें, स्वतंत्र प्रकाशन मार्गों को परिभाषित करें, Flow AI सिनेमाई ट्रेलर समयसीमा को कॉन्फ़िगर करें, और मिलान वाले Suno AI साउंडट्रैक जनरेट करें।`;
      exp = `KDP पर फ़ॉर्मेट की गई फ़ाइलें अपलोड करें, Flow AI का उपयोग करके वीडियो ट्रैक रेंडर करें, और Suno AI से जनरेट किए गए ऑडियो ट्रैक को बंडल करें।`;
    } else {
      purpose = `${toolName} use karke digital media content, eBooks, ya marketing assets produce aur publish karna.`;
      why = `Yeh eBook publishing workflows, independent publishing pathways aur Suno AI soundtrack creation ko optimize karta hai.`;
      expectedOutput = `Formatted eBook layouts, Flow AI cinematic trailer scripts, aur Suno AI background tracks.`;
      starter = `${goal} ke liye eBook layout outline generate karein jo self-publishing platforms aur independent publishing pathways ke liye suitable ho.`;
      advanced = `${goal} ko online promote karne ke liye Flow AI cinematic trailer workflow ka storyboard script draft karein.`;
      pro = `${toolName} ke sath ${goal} ke liye media launch strategy design karein. Manuscript ko eBook publishing ke liye format karein, independent publishing pathways specify karein, Flow AI cinematic trailer timelines set karein, aur matching Suno AI soundtracks generate karein.`;
      exp = `Formatted files ko KDP par upload karein, Flow AI se video tracks render karein, aur Suno AI ke audio tracks compile karein.`;
    }
  } else {
    if (t.includes("docs")) {
      purpose = labels.docsPurpose;
      why = labels.docsWhy;
      expectedOutput = labels.docsOutput;
      starter = labels.docsStarterPrompt + ` [Goal: ${goal}]`;
      advanced = labels.docsStarterPrompt + ` [Advanced Setup for Goal: ${goal}]`;
      pro = labels.docsProPrompt + ` [Goal: ${goal}]`;
      exp = labels.docsExplanation;
      cost = labels.free;
      time = lang === "English" ? "20 mins" : lang === "Hindi" ? "20 मिनट" : "20 mins";
      alternatives = "Microsoft Word, Notion";
    } else if (t.includes("chatgpt")) {
      purpose = labels.chatgptPurpose;
      why = labels.chatgptWhy;
      expectedOutput = labels.chatgptOutput;
      starter = labels.chatgptStarterPrompt + ` [Goal: ${goal}]`;
      advanced = labels.chatgptStarterPrompt + ` [Advanced Context for Goal: ${goal}]`;
      pro = labels.chatgptProPrompt + ` [Goal: ${goal}]`;
      exp = labels.chatgptExplanation;
      cost = labels.free;
      time = lang === "English" ? "15 mins" : lang === "Hindi" ? "15 मिनट" : "15 mins";
      alternatives = "Google Gemini, Claude";
    } else {
      cost = "Free / paid options";
      time = "1 hour";
      
      if (t.includes("midjourney") || t.includes("flux") || t.includes("leonardo") || t.includes("image") || t.includes("spectra") || t.includes("ideogram")) {
        alternatives = "Flux, Midjourney, Stable Diffusion";
        cost = "$10 - $20 / mo";
        if (lang === "English") {
          purpose = "Create stunning visual assets and graphics.";
          why = `${toolName} generates production-quality visual styles from textual descriptions.`;
          expectedOutput = "High-resolution JPG/PNG graphic files.";
          starter = `Generate a realistic image for ${goal}, clean composition, raw style.`;
          advanced = `Produce an artistic digital painting for ${goal}, featuring detailed contrast and hyper-detailed texturing.`;
          pro = `Generate a cinematic, hyper-detailed render for ${goal}, photorealistic, dramatic lighting, shot on 35mm lens, 8k resolution.`;
          exp = "Provide clear descriptions of elements, colors, and camera styles.";
        } else if (lang === "Hindi") {
          purpose = "शानदार विज़ुअल आर्ट और ग्राफिक्स बनाना।";
          why = `${toolName} टेक्स्ट विवरण से व्यावसायिक गुणवत्ता वाली छवियां बनाता है।`;
          expectedOutput = "उच्च रिज़ॉल्यूशन वाली JPG/PNG फ़ाइलें।";
          starter = `${goal} के लिए एक वास्तविक छवि बनाएं, साफ़ संरचना, स्पष्ट विवरण।`;
          advanced = `${goal} के लिए विस्तृत कंट्रास्ट और हाइपर-डिटेल्ड टेक्सचरिंग वाली एक कलात्मक डिजिटल पेंटिंग बनाएं।`;
          pro = `${goal} के लिए एक सिनेमाई, अत्यधिक विस्तृत रेंडर, नाटकीय प्रकाश व्यवस्था, 35 मिमी लेंस, 8k रिज़ॉल्यूशन।`;
          exp = "चित्र के तत्वों, रंगों और कैमरा शैली का स्पष्ट विवरण प्रदान करें।";
        } else {
          purpose = "High-quality visual graphics aur illustrations design karna.";
          why = `${toolName} textual description se creative visual designs generate karta hai.`;
          expectedOutput = "High-resolution JPG/PNG photo assets.";
          starter = `Create an image representing ${goal}, dynamic colors, simple layout.`;
          advanced = `Develop an abstract aesthetic concept art representing ${goal}, detailed shaders, octane render.`;
          pro = `Generate a hyper-realistic cinematic photo of ${goal}, photorealistic, 8k render, depth of field, studio lighting.`;
          exp = "Prompt me image ke elements, theme aur camera angle ko describe karein.";
        }
      } else if (t.includes("video") || t.includes("runway") || t.includes("luma") || t.includes("sora") || t.includes("pika") || t.includes("vidu") || t.includes("veo")) {
        alternatives = "Runway, Sora, Luma, Pika";
        cost = "Freemium / $15 / mo";
        if (lang === "English") {
          purpose = "Animate image keyframes into dynamic video clips.";
          why = "Translates static concept frames into smooth, motion-consistent cinematic video.";
          expectedOutput = "4-second MP4 motion clips.";
          starter = `Animate the scene for ${goal} showing smooth camera panning.`;
          advanced = `Animate static frames for ${goal} using dynamic zoom-in effects and physical environment motion.`;
          pro = `Generate a cinematic slow-motion sequence for ${goal}, fluid movement, detailed textures, realistic physics, 4k resolution.`;
          exp = "Keep animation prompts focused on motion, cameras, and physical actions.";
        } else if (lang === "Hindi") {
          purpose = "स्थिर छवियों को चलती हुई सिनेमाई क्लिप्स में बदलना।";
          why = "स्थिर फ़्रेमों को सहज, गति-संगत सिनेमाई वीडियो में अनुवादित करता है।";
          expectedOutput = "4-सेकंड की MP4 वीडियो क्लिप्स।";
          starter = `${goal} के लिए सीन को घुमाते हुए कैमरे के साथ एनिमेट करें।`;
          advanced = `गतिशील ज़ूम-इन प्रभावों और भौतिक पर्यावरण गति का उपयोग करके ${goal} के लिए स्थिर फ़्रेमों को एनिमेट करें।`;
          pro = `${goal} के लिए एक सिनेमाई धीमी गति का क्रम, तरल गति, विस्तृत बनावट, यथार्थवादी भौतिकी, 4k रिज़ॉल्यूशन।`;
          exp = "एनिमेशन प्रॉम्प्ट को मुख्य रूप से गति, कैमरे के कोण और भौतिक क्रियाओं पर केंद्रित रखें।";
        } else {
          purpose = "Static frames ko clean high-motion videos me convert karna.";
          why = "Yeh static photos ko motion-consistent smooth cinematic frames me convert karta hai.";
          expectedOutput = "4-second timeline MP4 video files.";
          starter = `Animate this frame for ${goal} with soft camera rotation.`;
          advanced = `Render intermediate frame animations for ${goal} with structural motion control.`;
          pro = `Generate high-motion cinema tracking shot for ${goal}, hyper-detailed, slow motion, clean animation output.`;
          exp = "Camera speed, motion directions aur zoom values prompts me likhein.";
        }
      } else if (t.includes("voice") || t.includes("elevenlabs") || t.includes("playht") || t.includes("resemble") || t.includes("speechify") || t.includes("wellsaid") || t.includes("vocalise")) {
        alternatives = "ElevenLabs, Murf, PlayHT";
        cost = "$5 - $22 / mo";
        if (lang === "English") {
          purpose = "Synthesize realistic voice narration tracks.";
          why = "Converts draft scripts into natural sounding human speech with dynamic emotion.";
          expectedOutput = "High-fidelity WAV/MP3 sound files.";
          starter = `Generate a warm narrator voiceover reading the script for ${goal}.`;
          advanced = `Synthesize custom emotional narration voiceover for ${goal}, adjusting energy levels and stress marks.`;
          pro = `Synthesize an authoritative, professional voiceover for ${goal}, medium pace, clear enunciation, natural pauses, optimized for advertising.`;
          pro = `Design an enterprise integration schema for ${goal}, handling exception loops, caching, and analytics outputs.`;
          exp = "Access settings and connect API keys to sync with external platforms.";
        } else if (lang === "Hindi") {
          purpose = `उन्नत मशीन मॉडलों का उपयोग करके ${goal} के कार्यों को अनुकूलित करना।`;
          why = "कार्यकुशलता बढ़ाने के लिए परिचालन कार्यों को स्वचालित करता है।";
          expectedOutput = "संसाधित डेटा आउटपुट या स्वचालित कार्य क्रियाएं।";
          starter = `${goal} को स्वचालित करने के लिए सेटिंग्स को कॉन्फ़िगर और डिप्लॉय करें।`;
          advanced = `${goal} के लिए उप-कार्य निष्पादनों को समन्वित करने के लिए अनुकूलन लूप तैनात करें।`;
          pro = `${goal} के लिए एक एंटरप्राइज एकीकरण योजना डिज़ाइन करें, जो अपवाद लूप और कैशिंग को संभाल सके।`;
          exp = "बाहरी प्लेटफ़ॉर्म के साथ सिंक करने के लिए सेटिंग्स तक पहुँचें और एपीआई कुंजियाँ कनेक्ट करें।";
        } else {
          purpose = `Advanced models ki madad se ${goal} ke steps automate aur optimize karna.`;
          why = "Yeh steps ko programmatic rule base se automate karke efficiency badhata hai.";
          expectedOutput = "Automated workflows aur compiled data.";
          starter = `Set up automated actions for ${goal} using dynamic configuration.`;
          advanced = `Configure scheduled automation triggers to route files for ${goal}.`;
          pro = `Integrate industrial API hooks to sync ${goal} workflow, log operations, keep dashboards updated.`;
          exp = "Connect keys aur parameters specify karke database sync set karein.";
        }
      }
    }
  }

  return { starter, advanced, pro, exp, purpose, why, expectedOutput, cost, time, alternatives, universalPrompt };
}

function getActiveLanguage() {
  const controlSelect = document.getElementById('control-lang-select');
  return controlSelect ? controlSelect.value : 'Hinglish';
}

const appGuidesData = {
  "Android Studio Installation": {
    title: { English: "Android Studio Installation", Hindi: "एंड्रॉइड स्टूडियो स्थापना", Hinglish: "Android Studio Installation" },
    explanation: {
      English: "Comprehensive guide to download and install Android Studio. Double-click the installer executable and proceed with the setup wizard configurations.",
      Hindi: "एंड्रॉइड स्टूडियो डाउनलोड और इंस्टॉल करने के लिए विस्तृत गाइड। इंस्टॉलर एक्ज़ीक्यूटेबल पर डबल-क्लिक करें और सेटअप विज़ार्ड कॉन्फ़िगरेशन के साथ आगे बढ़ें।",
      Hinglish: "Android Studio ko download aur install karne ki guide. Installer exe file par double-click karein aur setup wizard follow karein."
    },
    visualFlow: "[Download Installer] ──> [Choose Setup Options] ──> [Install IDE Core] ──> [First Launch Welcome Screen]",
    prerequisite: { English: "Local computer with minimum 8GB RAM.", Hindi: "न्यूनतम 8GB रैम वाला स्थानीय कंप्यूटर।", Hinglish: "Minimum 8GB RAM wala local computer." },
    keyConcepts: { English: ["IDE path paths", "Java Virtual Machine configuration"], Hindi: ["आईडीई पथ", "जावा वर्चुअल मशीन कॉन्फ़िगरेशन"], Hinglish: ["IDE paths setups", "Java Virtual Machine settings"] },
    commonMistakes: { English: ["Installing on slow storage partition."], Hindi: ["धीमी स्टोरेज पर इंस्टॉल करना।"], Hinglish: ["Slow storage partition par install karna."] },
    applications: { English: ["Setting up Android IDE"], Hindi: ["एंड्रॉइड आईडीई सेट करना"], Hinglish: ["Android IDE setup karna"] },
    exercises: { English: "Download Android Studio installer from developer.android.com and complete wizard.", Hindi: "developer.android.com से एंड्रॉइड स्टूडियो इंस्टॉलर डाउनलोड करें और विज़ार्ड पूरा करें।", Hinglish: "Official portal se Android Studio installer run karke wizard setup complete karein." },
    outcome: { English: "Android Studio Welcome window successfully displayed.", Hindi: "एंड्रॉइड स्टूडियो स्वागत विंडो प्रदर्शित हुई।", Hinglish: "Android Studio welcome window screens display ho jayegi." },
    checkpoint: {
      question: { English: "What is the recommended minimum RAM to run Android Studio?", Hindi: "एंड्रॉइड स्टूडियो को चलाने के लिए अनुशंसित न्यूनतम रैम क्या है?", Hinglish: "Android Studio ko run karne ke liye minimum kitne RAM ki need hoti hai?" },
      options: { English: ["2 GB", "4 GB", "8 GB", "16 GB"], Hindi: ["2 जीबी", "4 जीबी", "8 जीबी", "16 जीबी"], Hinglish: ["2 GB", "4 GB", "8 GB", "16 GB"] },
      correct: 2,
      explanation: { English: "Android Studio requires at least 8GB RAM to run build tools and emulators smoothly.", Hindi: "बिल्ड टूल्स और एमुलेटर को सुचारू रूप से चलाने के लिए कम से कम 8GB रैम की आवश्यकता होती है।", Hinglish: "build tools aur emulators ko run karne ke liye minimum 8GB RAM recommended hai." }
    }
  },
  "Environment Setup": {
    title: { English: "Environment & SDK Setup", Hindi: "वातावरण और एसडीके सेटअप", Hinglish: "Environment & SDK Setup" },
    explanation: {
      English: "Launch Android SDK Manager to download SDK platforms and build tools. Setup ANDROID_HOME environment variable for compilation paths.",
      Hindi: "एसडीके प्लेटफॉर्म और बिल्ड टूल्स डाउनलोड करने के लिए एंड्रॉइड एसडीके मैनेजर लॉन्च करें। कंपाइलेशन पाथ के लिए ANDROID_HOME वेरिएबल सेट करें।",
      Hinglish: "SDK Manager se platforms resources download karein aur environment me ANDROID_HOME paths variables set karein."
    },
    visualFlow: "[Open SDK Manager] ──> [Select SDK Platforms] ──> [Download Build Tools] ──> [Set System Env Paths]",
    prerequisite: { English: "Android Studio installed successfully.", Hindi: "एंड्रॉइड स्टूडियो सफलतापूर्वक इंस्टॉल होना चाहिए।", Hinglish: "Android Studio installation completed." },
    keyConcepts: { English: ["SDK API levels", "Path environment variables"], Hindi: ["एसडीके एपीआई स्तर", "पथ पर्यावरण वेरिएबल्स"], Hinglish: ["SDK API levels configurations", "System variable PATH paths"] },
    commonMistakes: { English: ["Mismatched SDK versions.", "Incorrect environment path."], Hindi: ["बेमेल एसडीके संस्करण।", "गलत पर्यावरण पथ।"], Hinglish: ["Different SDK versions conflict.", "Variable PATH syntax errors."] },
    applications: { English: ["Preparing compilation tools"], Hindi: ["कंपाइलेशन टूल्स को तैयार करना"], Hinglish: ["Compiling environment setup tools"] },
    exercises: { English: "Open SDK Manager and download Android 13/14 SDK Platform and Build Tools.", Hindi: "एसडीके मैनेजर खोलें और एंड्रॉइड 13/14 एसडीके प्लेटफॉर्म और बिल्ड टूल्स डाउनलोड करें।", Hinglish: "SDK Manager API settings open karke build tools update check verify karein." },
    outcome: { English: "SDK paths correctly loaded and environment variables verified.", Hindi: "एसडीके पथ लोड किए गए और पर्यावरण वेरिएबल्स सत्यापित किए गए।", Hinglish: "SDK components download update verified." },
    checkpoint: {
      question: { English: "Which environment variable defines the root location of Android SDK?", Hindi: "एंड्रॉइड एसडीके के रूट स्थान को परिभाषित करने के लिए किस वेरिएबल का उपयोग किया जाता है?", Hinglish: "Android SDK root path register karne ke liye kis variable name ka use hota hai?" },
      options: { English: ["ANDROID_SDK_ROOT", "ANDROID_HOME", "SDK_PATH", "ANDROID_DIR"], Hindi: ["ANDROID_SDK_ROOT", "ANDROID_HOME", "SDK_PATH", "ANDROID_DIR"], Hinglish: ["ANDROID_SDK_ROOT", "ANDROID_HOME", "SDK_PATH", "ANDROID_DIR"] },
      correct: 1,
      explanation: { English: "ANDROID_HOME is the standard variable used by build engines like Gradle to locate SDK installations.", Hindi: "ANDROID_HOME बिल्ड इंजन (जैसे ग्रैडल) द्वारा एसडीके का पता लगाने के लिए उपयोग किया जाने वाला मानक वेरिएबल है।", Hinglish: "ANDROID_HOME standard variable hai jo system Gradle builds use karte hain SDK locate karne ke liye." }
    }
  },
  "Project Creation": {
    title: { English: "First Project Template Setup", Hindi: "प्रथम प्रोजेक्ट टेम्पलेट सेटअप", Hinglish: "First Project Template Setup" },
    explanation: {
      English: "Create a new project using the Empty Activity template. Sync project parameters with the Gradle build scripts.",
      Hindi: "खाली गतिविधि टेम्पलेट का उपयोग करके एक नया प्रोजेक्ट बनाएं। ग्रैडल बिल्ड स्क्रिप्ट के साथ प्रोजेक्ट मापदंडों को सिंक करें।",
      Hinglish: "New Project Wizard se Empty Activity select karke app compile karein aur Gradle dependency sync complete check verify karein."
    },
    visualFlow: "[New Project Wizard] ──> [Select Empty Activity] ──> [Set Package Name & Language] ──> [Gradle Sync]",
    prerequisite: { English: "Android SDK installed.", Hindi: "एंड्रॉइड एसडीके इंस्टॉल होना चाहिए।", Hinglish: "Android SDK configuration completed." },
    keyConcepts: { English: ["Android project structures", "Gradle build scripts"], Hindi: ["एंड्रॉइड प्रोजेक्ट संरचना", "ग्रैडल बिल्ड स्क्रिप्ट"], Hinglish: ["Android project folder structures", "build.gradle script setups"] },
    commonMistakes: { English: ["Interrupting Gradle build sync."], Hindi: ["ग्रैडल बिल्ड सिंक को बीच में रोकना।"], Hinglish: ["Gradle sync background process cancel karna."] },
    applications: { English: ["Initializing application structures"], Hindi: ["एप्लिकेशन संरचना शुरू करना"], Hinglish: ["Application template bootstrapping"] },
    exercises: { English: "Create an Empty Activity project named 'MyFirstApp' and verify it builds successfully.", Hindi: "'MyFirstApp' नाम से एक खाली गतिविधि प्रोजेक्ट बनाएं और सत्यापित करें कि यह सफलतापूर्वक बनता है।", Hinglish: "'MyFirstApp' project compile check verify setup sync finish." },
    outcome: { English: "Project template loaded without sync errors.", Hindi: "प्रोजेक्ट टेम्पलेट बिना सिंक त्रुटियों के लोड हो गया।", Hinglish: "Clean project folders ready for development." },
    checkpoint: {
      question: { English: "What script file manages app dependencies and compilation options in Android Studio?", Hindi: "एंड्रॉइड स्टूडियो में ऐप की निर्भरता और कंपाइलेशन विकल्पों को कौन सी फ़ाइल संभालती है?", Hinglish: "Dependencies aur libraries management kis file configuration settings me save hoti hai?" },
      options: { English: ["AndroidManifest.xml", "build.gradle", "settings.json", "MainActivity.java"], Hindi: ["AndroidManifest.xml", "build.gradle", "settings.json", "MainActivity.java"], Hinglish: ["AndroidManifest.xml", "build.gradle", "settings.json", "MainActivity.java"] },
      correct: 1,
      explanation: { English: "Gradle build scripts (build.gradle) manage dependencies, compilation options, and packaging configurations.", Hindi: "ग्रैडल बिल्ड स्क्रिप्ट (build.gradle) लाइब्रेरी निर्भरता और कंपाइलेशन सेटिंग्स को नियंत्रित करती हैं।", Hinglish: "build.gradle configurations script control handles libraries settings updates." }
    }
  },
  "Development": {
    title: { English: "Android App Development", Hindi: "एंड्रॉइड ऐप डेवलपमेंट", Hinglish: "Android App Development" },
    explanation: {
      English: "Design user interface views using XML layouts. Bind layout elements in Java or Kotlin controller files and write functional action logic.",
      Hindi: "एक्सएमएल लेआउट का उपयोग करके यूजर इंटरफेस व्यू डिजाइन करें। जावा या कोटलिन कंट्रोलर फ़ाइलों में लेआउट तत्वों को बांधें और कार्यात्मक एक्शन लॉजिक लिखें।",
      Hinglish: "XML me UI layout design prepare karein aur Java/Kotlin script controller files me code logica set click actions logic code bind karein."
    },
    visualFlow: "[XML Layout Design] ──> [Bind Views in Code] ──> [Implement Event Listeners] ──> [Business Logic]",
    prerequisite: { English: "Project Gradle sync completed.", Hindi: "प्रोजेक्ट ग्रैडल सिंक पूरा होना चाहिए।", Hinglish: "Project gradle sync status verify complete." },
    keyConcepts: { English: ["XML layout attributes", "Activity controller bindings"], Hindi: ["एक्सएमएल लेआउट विशेषताएँ", "गतिविधि नियंत्रक बाइंडिंग"], Hinglish: ["XML constraints layouts attributes", "Activity bindings hooks logic"] },
    commonMistakes: { English: ["Using wrong layout view IDs."], Hindi: ["गलत लेआउट व्यू आईडी का उपयोग करना।"], Hinglish: ["Wrong view ID query reference code crashes."] },
    applications: { English: ["Coding Android screen controls"], Hindi: ["एंड्रॉइड स्क्रीन नियंत्रण कोडिंग"], Hinglish: ["Coding interactive screen elements configurations"] },
    exercises: { English: "Add a Button widget in your layout, set an ID, and log a console message when it is clicked.", Hindi: "अपने लेआउट में एक बटन विजेट जोड़ें, एक आईडी सेट करें, और क्लिक होने पर एक कंसोल संदेश लॉग करें।", Hinglish: "xml me Button create karke click listener set verify and check message run." },
    outcome: { English: "Button interactions register clicks correctly.", Hindi: "बटन इंटरैक्शन क्लिक को सही ढंग से पंजीकृत करते हैं।", Hinglish: "Action triggers working check outputs." },
    checkpoint: {
      question: { English: "Which file describes package permissions, entry activities, and metadata for an Android app?", Hindi: "भौतिक अनुमतियों और प्रवेश गतिविधियों का वर्णन करने वाली फ़ाइल कौन सी है?", Hinglish: "Permissions target features register verify karne wali file kaun si hai?" },
      options: { English: ["build.gradle", "AndroidManifest.xml", "MainActivity.kt", "strings.xml"], Hindi: ["build.gradle", "AndroidManifest.xml", "MainActivity.kt", "strings.xml"], Hinglish: ["build.gradle", "AndroidManifest.xml", "MainActivity.kt", "strings.xml"] },
      correct: 1,
      explanation: { English: "AndroidManifest.xml contains all permissions, components (activities, services), and launch parameters metadata.", Hindi: "AndroidManifest.xml में ऐप की अनुमतियाँ, गतिविधियाँ, सेवाएँ और बुनियादी मेटाडेटा शामिल हैं।", Hinglish: "AndroidManifest.xml permissions target components entry details manifest register check." }
    }
  },
  "Testing (Android)": {
    title: { English: "Emulation & Local Testing", Hindi: "एमुलेशन और स्थानीय परीक्षण", Hinglish: "Emulation & Local Testing" },
    explanation: {
      English: "Start the AVD virtual device simulator. Deploy your application instantly and review compiler logs and error outputs in the Logcat window.",
      Hindi: "एवीडी वर्चुअल डिवाइस सिम्युलेटर शुरू करें। तुरंत अपना एप्लिकेशन तैनात करें और लॉगकैट विंडो में कंपाइलर लॉग और त्रुटि आउटपुट की समीक्षा करें।",
      Hinglish: "AVD configure device launch screen run click deploy emulator verify inspect Logcat outputs logs warnings."
    },
    visualFlow: "[Launch AVD Emulator] ──> [Click Run App (Shift+F10)] ──> [Build & Install APK] ──> [Inspect Logcat Logs]",
    prerequisite: { English: "Compilation without code errors.", Hindi: "कोड त्रुटियों के बिना कंपाइलेशन होना चाहिए।", Hinglish: "App logic code compiles cleanly." },
    keyConcepts: { English: ["AVD virtual setups", "Logcat debugger outputs"], Hindi: ["एवीडी वर्चुअल सेटअप", "लॉगकैट डिबगर आउटपुट"], Hinglish: ["AVD layouts simulators profiles", "Logcat search filters warnings"] },
    commonMistakes: { English: ["Not enabling VT-x virtualization in system BIOS."], Hindi: ["सिस्टम बायोस में VT-x वर्चुअलाइजेशन सक्षम न करना।"], Hinglish: ["System BIOS VT-x options parameters disabled status."] },
    applications: { English: ["Debugging runtime app exceptions"], Hindi: ["रनटाइम ऐप त्रुटियों को डिबग करना"], Hinglish: ["Debugging runtime layout variables failures"] },
    exercises: { English: "Launch AVD, run application, and confirm click output registers in Logcat log lists.", Hindi: "एवीडी लॉन्च करें, एप्लिकेशन चलाएं, और पुष्टि करें कि क्लिक आउटपुट लॉगकैट लॉग सूची में पंजीकृत होता है।", Hinglish: "AVD launch karke run compile application log status button clicks monitoring screen check verify." },
    outcome: { English: "Application runs successfully on emulator screen.", Hindi: "एप्लिकेशन एमुलेटर स्क्रीन पर सफलतापूर्वक चलता है।", Hinglish: "App visual test output interactive emulator launch checks." },
    checkpoint: {
      question: { English: "Which window utility inside Android Studio is used to view debug log outputs and crash reports?", Hindi: "डिबग लॉग आउटपुट और क्रैश रिपोर्ट देखने के लिए किस यूटिलिटी का उपयोग किया जाता है?", Hinglish: "Android Studio me application prints stack traces aur debug monitoring console check kya hai?" },
      options: { English: ["Device File Explorer", "Gradle Console", "Logcat", "SDK Manager"], Hindi: ["डिवाइस फ़ाइल एक्सप्लोरर", "ग्रैडल कंसोल", "लॉगकैट", "एसडीके मैनेजर"], Hinglish: ["Device File Explorer", "Gradle Console", "Logcat", "SDK Manager"] },
      correct: 2,
      explanation: { English: "Logcat is the developer utility that displays log statements, stack traces, and runtime exceptions.", Hindi: "लॉगकैट रनटाइम समस्याओं, डिबग स्टेटमेंट और क्रैश रिपोर्ट की निगरानी के लिए उपयोग किया जाता है।", Hinglish: "Logcat runtime debug alerts exceptions logs display check console panel tool." }
    }
  },
  "APK Generation": {
    title: { English: "Build & Release APK Generation", Hindi: "बिल्ड और रिलीज़ एपीके जनरेशन", Hinglish: "Build & Release APK Generation" },
    explanation: {
      English: "Compile production bundles using keystore certifications. Generate signed APK files optimized for physical side-loading installations.",
      Hindi: "कीस्टोर प्रमाणपत्रों का उपयोग करके उत्पादन बंडल संकलित करें। भौतिक साइड-लोडिंग स्थापनाओं के लिए अनुकूलित हस्ताक्षरित एपीके फ़ाइलें जनरेट करें।",
      Hinglish: "Generate Signed APK utility settings configure keystore profiles password setup verify targets release APK compile build."
    },
    visualFlow: "[Select Build Menu] ──> [Generate Signed APK] ──> [Create Keystore Credentials] ──> [Locate APK File]",
    prerequisite: { English: "Local emulator tests pass successfully.", Hindi: "स्थानीय एमुलेटर परीक्षण सफलतापूर्वक पास होने चाहिए।", Hinglish: "App local emulation validation tests passed." },
    keyConcepts: { English: ["Signed keystore files", "Release build variants optimization"], Hindi: ["हस्ताक्षरित कीस्टोर फाइलें", "रिलीज़ बिल्ड वेरिएंट अनुकूलन"], Hinglish: ["Keystore properties verify keys", "Release builds variables parameters signature schemes"] },
    commonMistakes: { English: ["Losing release keystore passwords."], Hindi: ["रिलीज़ कीस्टोर पासवर्ड भूल जाना या खोना।"], Hinglish: ["Keystore files config lost paths credentials updates ignore."] },
    applications: { English: ["Generating side-load ready installer files"], Hindi: ["साइड-लोड रेडी इंस्टॉलर फाइलें बनाना"], Hinglish: ["Compiling installable distribution packages files checks"] },
    exercises: { English: "Execute Generate Signed APK setup wizard, create a temporary test keystore and build release APK.", Hindi: "हस्ताक्षरित एपीके जनरेट करें विज़ार्ड निष्पादित करें, एक परीक्षण कीस्टोर बनाएं और रिलीज़ एपीके बनाएं।", Hinglish: "Generate Signed APK build release keystores key setup compile run locate folder files verify." },
    outcome: { English: "Signed production release APK package compiled in build outputs directory.", Hindi: "हस्ताक्षरित रिलीज़ एपीके बंडल आउटपुट निर्देशिका में सफलतापूर्वक संकलित हुआ।", Hinglish: "Release APK folder compiled locate path files check." },
    checkpoint: {
      question: { English: "Which file format is standard for distributing and installing native applications on Android devices?", Hindi: "देशी अनुप्रयोगों को वितरित और स्थापित करने के लिए कौन सा फ़ाइल स्वरूप मानक है?", Hinglish: "Android phone installable installer check executable compilation target output format kya hota hai?" },
      options: { English: [".ipa file", ".apk file", ".exe file", ".zip file"], Hindi: [".ipa फ़ाइल", ".apk फ़ाइल", ".exe फ़ाइल", ".zip फ़ाइल"], Hinglish: [".ipa file", ".apk file", ".exe file", ".zip file"] },
      correct: 1,
      explanation: { English: "An .apk (Android Package) file is the compilation package used to distribute and install native apps on devices.", Hindi: ".apk एंड्रॉइड पर ऐप्स वितरित और स्थापित करने के लिए उपयोग किया जाने वाला पैकेज प्रारूप है।", Hinglish: ".apk file native package representation compile executable format standard check." }
    }
  },
  "Deployment": {
    title: { English: "App Deployment", Hindi: "ऐप परिनियोजन (Deployment)", Hinglish: "App Deployment" },
    explanation: {
      English: "Publish or sideload your application packages. Setup distribution tracks (Internal Testing vs Production) inside the developer portal.",
      Hindi: "अपने एप्लिकेशन पैकेज प्रकाशित या साइडलोड करें। डेवलपर पोर्टल के भीतर वितरण ट्रैक स्थापित करें।",
      Hinglish: "App packages release publish ya local phone me load karein, aur console dashboard par test tracks setup check karein."
    },
    visualFlow: "[Signed APK File] ──> [Google Play Console Upload] ──> [Internal Testing Track] ──> [Production Rollout]",
    prerequisite: { English: "Release APK package built successfully.", Hindi: "रिलीज़ एपीके बंडल तैयार होना चाहिए।", Hinglish: "Signed release APK generated." },
    keyConcepts: { English: ["Developer console listings", "Release rollout tracks"], Hindi: ["डेवलपर कंसोल लिस्टिंग", "रिलीज़ रोलआउट ट्रैक"], Hinglish: ["Play Console settings", "Internal/Closed testing tracks options"] },
    commonMistakes: { English: ["Uploading debug builds.", "Exceeding layout package size thresholds."], Hindi: ["डिबग बिल्ड अपलोड करना।", "पैकेज साइज सीमाओं को पार करना।"], Hinglish: ["Debug mode apps upload check fail.", "Target API targets mismatch console reject."] },
    applications: { English: ["Publishing mobile apps globally"], Hindi: ["वैश्विक स्तर पर मोबाइल ऐप प्रकाशित करना"], Hinglish: ["Deploying Android application modules"] },
    exercises: { English: "Sideload the generated APK onto a physical Android device and verify it launches correctly.", Hindi: "उत्पन्न एपीके को एक भौतिक एंड्रॉइड डिवाइस पर साइडलोड करें और सत्यापित करें कि यह सही ढंग से लॉन्च होता है।", Hinglish: "APK file local system phone me transfer karke layout launch and runs check verification pass." },
    outcome: { English: "Native application running on target test hardware.", Hindi: "देशी एप्लिकेशन लक्षित परीक्षण हार्डवेयर पर काम कर रहा है।", Hinglish: "Working native install test pass." },
    checkpoint: {
      question: { English: "Which console portal is the official channel to deploy apps publicly to the Google Play Store?", Hindi: "गूगल प्ले स्टोर पर सार्वजनिक रूप से ऐप्स तैनात करने का आधिकारिक चैनल कौन सा है?", Hinglish: "Android apps Play Store par publish karne ka main portal board kya hai?" },
      options: { English: ["Google Cloud Console", "Firebase Console", "Google Play Console", "Android SDK Manager"], Hindi: ["गूगल क्लाउड कंसोल", "फायरबेस कंसोल", "गूगल प्ले कंसोल", "एंड्रॉइड एसडीके मैनेजर"], Hinglish: ["Google Cloud Console", "Firebase Console", "Google Play Console", "Android SDK Manager"] },
      correct: 2,
      explanation: { English: "Google Play Console is the official publisher dashboard to manage app submissions, reviews, and updates.", Hindi: "गूगल प्ले कंसोल ऐप सबमिशन, रिव्यू और स्टोर अपडेट को प्रबंधित करने का आधिकारिक डेवलपर डैशबोर्ड है।", Hinglish: "Google Play Console distribution publisher board portal hai." }
    }
  },
  "Download Antigravity 2.0": {
    title: { English: "Download Antigravity 2.0", Hindi: "एंटीग्रेविटी 2.0 डाउनलोड करें", Hinglish: "Download Antigravity 2.0" },
    explanation: {
      English: "Access official DeepMind repositories. Select target package structures corresponding to OS configurations.",
      Hindi: "आधिकारिक डीपमाइंड रिपॉजिटरी तक पहुंचें। ओएस विनिर्देशों के अनुसार लक्ष्य पैकेज डाउनलोड करें।",
      Hinglish: "DeepMind portal releases site select variables binaries zip package path download save configure."
    },
    visualFlow: "[Navigate Releases Site] ──> [Select Windows Package] ──> [Initiate Secure Download] ──> [Extract Zip]",
    prerequisite: { English: "Stable internet connection.", Hindi: "स्थिर इंटरनेट कनेक्शन होना चाहिए।", Hinglish: "Active internet connectivity path links." },
    keyConcepts: { English: ["Binary package extraction", "SHA-256 validation checksums"], Hindi: ["बाइनरी पैकेज निष्कर्षण", "SHA-256 सत्यापन चेकसम"], Hinglish: ["Binary layouts structure zip", "SHA-256 integrity hash verification check"] },
    commonMistakes: { English: ["Downloading wrong OS target package versions."], Hindi: ["गलत ओएस लक्ष्य पैकेज संस्करणों को डाउनलोड करना।"], Hinglish: ["Different platforms compatibility check choose wrong paths files."] },
    applications: { English: ["Acquiring baseline agent platform files"], Hindi: ["बुनियादी एजेंट प्लेटफॉर्म फाइलें प्राप्त करना"], Hinglish: ["Retrieving standalone execution files models checks"] },
    exercises: { English: "Navigate to releases portal, download local executable archive, and extract files.", Hindi: "रिलीज़ पोर्टल पर जाएं, स्थानीय निष्पादन योग्य संग्रह डाउनलोड करें और फ़ाइलें निकालें।", Hinglish: "Download folder zip file paths local target directory unzip setup inspect check." },
    outcome: { English: "Extracted standalone binary workspace folder ready.", Hindi: "निकाला गया बाइनरी वर्कस्पेस फोल्डर तैयार।", Hinglish: "Extracted executable contents ready verification check sync." },
    checkpoint: {
      question: { English: "Which security validation check proves a downloaded file has not been modified by third parties?", Hindi: "कौन सी सुरक्षा सत्यापन जांच साबित करती है कि डाउनलोड की गई फ़ाइल में बदलाव नहीं किया गया है?", Hinglish: "Downloaded installer modification packages validation parameters matching ke liye kya use check system standard check compile hai?" },
      options: { English: ["SHA-256 verification hash", "Disk check utilities", "File zip extensions format", "System restore points"], Hindi: ["SHA-256 सत्यापन हैश", "डिस्क चेक यूटिलिटीज", "फाइल ज़िप एक्सटेंशन प्रारूप", "सिस्टम रीस्टोर पॉइंट"], Hinglish: ["SHA-256 verification hash", "Disk check utilities", "File zip extensions format", "System restore points"] },
      correct: 0,
      explanation: { English: "A cryptographic hash check (SHA-256) matches file fingerprints to ensure they have not been modified or corrupted.", Hindi: "क्रिप्टोग्राफिक हैश चेक (SHA-256) फ़ाइल फिंगरप्रिंट का मिलान करता है ताकि यह सुनिश्चित हो सके कि इसे बदला नहीं गया है।", Hinglish: "SHA-256 checksum hashes verify check download files validity integrity checks." }
    }
  },
  "Installation": {
    title: { English: "Antigravity 2.0 Installation", Hindi: "एंटीग्रेविटी 2.0 Installation", Hinglish: "Antigravity 2.0 Installation" },
    explanation: {
      English: "Configure local environments and paths. Execute install command lines to register system variables.",
      Hindi: "स्थानीय वातावरण और पथों को कॉन्फ़िगर करें। सिस्टम वेरिएबल्स को पंजीकृत करने के लिए इंस्टॉलेशन कमांड चलाएं।",
      Hinglish: "Terminal window me cd karke path verify install script file run run execute configure system paths."
    },
    visualFlow: "[Launch Command Prompt] ──> [Cd to extracted folder] ──> [Run installer commands] ──> [Verify Variable paths]",
    prerequisite: { English: "Antigravity zip package extracted.", Hindi: "एंटीग्रेविटी ज़िप पैकेज निकाला हुआ होना चाहिए।", Hinglish: "Unzip contents package target complete." },
    keyConcepts: { English: ["System PATH environment variable paths", "Administrator credentials validation"], Hindi: ["सिस्टम PATH पर्यावरण वेरिएबल पथ", "प्रशासक क्रेडेंशियल सत्यापन"], Hinglish: ["PATH env configuration variable paths", "Terminal admin execute permissions check variables"] },
    commonMistakes: { English: ["Forgetting to restart console session after variable updates."], Hindi: ["वेरिएबल परिवर्तनों के बाद कंसोल सत्र को पुनरारंभ करना भूलना।"], Hinglish: ["PATH variable updates local terminal restart skip check paths fail."] },
    applications: { English: ["Binding CLI tools dynamically across terminal instances"], Hindi: ["टर्मिनल इंस्टेंस में गतिशील रूप से सीएलआई टूल को बांधना"], Hinglish: ["Universal command console execution set checks"] },
    exercises: { English: "Run install script config cmd and query version check info using terminal commands.", Hindi: "इंस्टॉल स्क्रिप्ट चलाएं और टर्मिनल कमांड का उपयोग करके संस्करण जांच जानकारी क्वेरी करें।", Hinglish: "Terminal me target directory access setups scripts run execute version validation query check command." },
    outcome: { English: "System PATH updated and version info outputs verified.", Hindi: "सिस्टम PATH अपडेट हुआ और वर्शन जानकारी आउटपुट सत्यापित हुई।", Hinglish: "PATH verify CLI version validation check pass." },
    checkpoint: {
      question: { English: "What terminal query checks that a command utility path is successfully resolved globally?", Hindi: "कौन सी टर्मिनल क्वेरी जांच करती है कि एक कमांड यूटिलिटी पाथ वैश्विक रूप से सफल है?", Hinglish: "System command target globally access checks verify path command instruction run kya standard check parameter hai?" },
      options: { English: ["systeminfo", "antigravity --version", "dir", "echo %PATH%"], Hindi: ["systeminfo", "antigravity --version", "dir", "echo %PATH%"], Hinglish: ["systeminfo", "antigravity --version", "dir", "echo %PATH%"] },
      correct: 1,
      explanation: { English: "Querying tool --version validates that the system PATH contains the directory of the executable, ensuring global console access.", Hindi: "वर्शन फ़्लैग के साथ क्वेरी करने से सत्यापित होता है कि सिस्टम पाथ में निष्पादन योग्य वस्तु उपलब्ध है।", Hinglish: "version flag query executable CLI variable availability check parameters is correct." }
    }
  },
  "Configuration": {
    title: { English: "System Execution & Configuration", Hindi: "सिस्टम निष्पादन और कॉन्फ़िगरेशन", Hinglish: "System Execution & Configuration" },
    explanation: {
      English: "Configure key config files. Register credentials configurations and network values for the agent loop processes.",
      Hindi: "मुख्य कॉन्फ़िगरेशन फ़ाइलें सेट करें। एजेंट लूप प्रक्रियाओं के लिए क्रेडेंशियल और नेटवर्क मान दर्ज करें।",
      Hinglish: "config.json config parameters settings secure API developer key access save config files verify loop checks."
    },
    visualFlow: "[Open config.json] ──> [Inject Developer API keys] ──> [Save config specifications] ──> [Validate credentials]",
    prerequisite: { English: "Antigravity cli globally accessible.", Hindi: "एंटीग्रेविटी सीएलआई वैश्विक रूप से सुलभ होनी चाहिए।", Hinglish: "Antigravity cli environment PATH successfully." },
    keyConcepts: { English: ["JSON structure configurations", "External API authentication tokens configuration"], Hindi: ["JSON संरचना कॉन्फ़िगरेशन", "बाहरी एपीआई प्रमाणीकरण टोकन कॉन्फ़िगरेशन"], Hinglish: ["JSON syntax rules verification", "Secure environment API values configurations variables"] },
    commonMistakes: { English: ["JSON comma formatting errors.", "Exposing keys publicly."], Hindi: ["JSON कॉमा फ़ॉर्मेटिंग त्रुटियाँ।", "कुंजियों को सार्वजनिक रूप से उजागर करना।"], Hinglish: ["Invalid JSON syntax comma brackets.", "API key strings commit track public repository check leaks."] },
    applications: { English: ["Protecting development credentials keys"], Hindi: ["विकास क्रेडेंशियल कुंजियों की सुरक्षा करना"], Hinglish: ["Credentials parameters configurations setup security checks"] },
    exercises: { English: "Edit config.json file, configure port parameter to 8080 and input mockup credentials.", Hindi: "config.json फ़ाइल संपादित करें, पोर्ट पैरामीटर को 8080 पर कॉन्फ़िगर करें और मॉक क्रेडेंशियल दर्ज करें।", Hinglish: "config.json file custom values edit save config check validations formatting errors." },
    outcome: { English: "Configurations loaded cleanly with no syntax errors.", Hindi: "कॉन्फ़िगरेशन बिना सिंटैक्स त्रुटियों के सफलतापूर्वक लोड हुआ।", Hinglish: "Secure configurations structures parsed correctly check." },
    checkpoint: {
      question: { English: "Which format structure syntax is commonly used in Antigravity config files?", Hindi: "एंटीग्रेविटी कॉन्फ़िगरेशन फ़ाइलों में आमतौर पर किस प्रारूप संरचना सिंटैक्स का उपयोग किया जाता है?", Hinglish: "Antigravity settings parameter files save targets structure syntax kya standard format check hai?" },
      options: { English: ["XML format", "JSON format", "CSV format", "INI format"], Hindi: ["XML प्रारूप", "JSON प्रारूप", "CSV प्रारूप", "INI प्रारूप"], Hinglish: ["XML format", "JSON format", "CSV format", "INI format"] },
      correct: 1,
      explanation: { English: "JSON (JavaScript Object Notation) is the standard lightweight format for structured configuration key-value storage.", Hindi: "JSON कॉन्फ़िगरेशन और डेटा विनिमय के लिए सबसे लोकप्रिय हल्के वजन वाला प्रारूप है।", Hinglish: "JSON format configuration specifications save systems key value parameters values support handles." }
    }
  },
  "Build Personal AI": {
    title: { English: "First AI Agent Setup", Hindi: "प्रथम एआई एजेंट सेटअप", Hinglish: "First AI Agent Setup" },
    explanation: {
      English: "Define agent behavior prompt and system parameters. Mount local filesystem context directories and bind system commands to create your first personal assistant.",
      Hindi: "एजेंट व्यवहार प्रॉम्प्ट और सिस्टम मापदंडों को परिभाषित करें। अपने पहले व्यक्तिगत सहायक को बनाने के लिए स्थानीय फ़ाइल सिस्टम संदर्भ निर्देशिका को माउंट करें और सिस्टम कमांड को बाँधें।",
      Hinglish: "Agent system prompts instruct check parameters set karein, aur local folders context load settings verify karke agent profile register karein."
    },
    visualFlow: "[Define Agent Behavior] ──> [Mount Context Folder] ──> [Bind Command Tools] ──> [Save Agent Blueprint]",
    prerequisite: { English: "Antigravity configuration verified.", Hindi: "एंटीग्रेविटी कॉन्फ़िगरेशन सत्यापित होनी चाहिए।", Hinglish: "Antigravity config verified successfully." },
    keyConcepts: { English: ["Agent system prompts rules", "Context files index mappings", "Command tools execution limits"], Hindi: ["एजेंट सिस्टम प्रॉम्प्ट नियम", "संदर्भ फ़ाइलें इंडेक्स मैपिंग", "कमांड टूल्स निष्पादन सीमा"], Hinglish: ["Agent instruction boundaries", "Context directories indexing", "Tool executions permissions"] },
    commonMistakes: { English: ["Writing too broad instructions.", "Mounting huge folder systems without exclusions."], Hindi: ["बहुत व्यापक निर्देश लिखना।", "बिना बहिष्करण के विशाल फ़ोल्डर सिस्टम को माउंट करना।"], Hinglish: ["Too vague guidelines parameters.", "Large recursive database mount without index pruning."] },
    applications: { English: ["Building specialized personal email assistants"], Hindi: ["विशिष्ट व्यक्तिगत ईमेल सहायक बनाना"], Hinglish: ["Setting up automated workspace agents"] },
    exercises: { English: "Write a config profile defining an agent that reads a text folder and returns bullet summaries.", Hindi: "एक कॉन्फ़िगरेशन प्रोफ़ाइल लिखें जो एक एजेंट को परिभाषित करती है जो टेक्स्ट फ़ोल्डर पढ़ता है और बुलेट सारांश देता है।", Hinglish: "Agent profile config document parameters write out bullet summary function verify save." },
    outcome: { English: "Agent blueprint saved and registered successfully.", Hindi: "एजेंट ब्लूप्रिंट सहेजा गया और सफलतापूर्वक पंजीकृत किया गया।", Hinglish: "Working agent registered model status pass." },
    checkpoint: {
      question: { English: "Which component defines the identity, bounds, and behaviors of your personal AI agent?", Hindi: "कौन सा घटक आपके व्यक्तिगत एआई एजेंट की पहचान, सीमाओं और व्यवहारों को परिभाषित करता है?", Hinglish: "Personal agent ke features, rules aur behaviors ko control karne wala main instructions parameter kya hota hai?" },
      options: { English: ["The GPU cooling hardware configurations", "The system prompt blueprint instructions", "The storage directory size limits", "The compiler script libraries"], Hindi: ["जीपीयू कूलिंग हार्डवेयर कॉन्फ़िगरेशन", "सिस्टम प्रॉम्प्ट ब्लूप्रिंट निर्देश", "स्टोरेज निर्देशिका आकार सीमा", "कंपाइलर स्क्रिप्ट लाइब्रेरी"], Hinglish: ["The GPU cooling hardware configurations", "The system prompt blueprint instructions", "The storage directory size limits", "The compiler script libraries"] },
      correct: 1,
      explanation: { English: "The system prompt blueprint defines who the agent is, what tools it can use, and the rules it must follow.", Hindi: "सिस्टम प्रॉम्प्ट ब्लूप्रिंट एजेंट की पहचान, उसके उपलब्ध उपकरण और उसके नियमों को परिभाषित करता है।", Hinglish: "System prompt instructions agent runtime constraints aur identity parameters decide karti hain." }
    }
  },
  "Testing (Antigravity)": {
    title: { English: "AI Agent Sandbox Testing", Hindi: "एआई एजेंट सैंडबॉक्स परीक्षण", Hinglish: "AI Agent Sandbox Testing" },
    explanation: {
      English: "Launch the dry-run console terminal and query the personal assistant with mock developer actions to verify execution flow and compliance.",
      Hindi: "ड्राय-रन कंसोल टर्मिनल लॉन्च करें और निष्पादन प्रवाह और अनुपालन को सत्यापित करने के लिए मॉक डेवलपर क्रियाओं के साथ व्यक्तिगत सहायक से पूछताछ करें।",
      Hinglish: "Interactive dry run console trigger query input test commands verify tool executions profiles logs."
    },
    visualFlow: "[Launch CLI Sandbox] ──> [Query Agent: 'read folder'] ──> [Inspect Tool Calls] ──> [Validate Output Text]",
    prerequisite: { English: "Agent setup completed successfully.", Hindi: "एजेंट सेटअप सफलतापूर्वक पूरा होना चाहिए।", Hinglish: "Agent profile successfully saved." },
    keyConcepts: { English: ["CLI dry-runs commands", "Tool call parameters logging", "Output compliance checks"], Hindi: ["सीएलआई ड्राय-रन कमांड", "टूल कॉल पैरामीटर लॉगिंग", "आउटपुट अनुपालन जांच"], Hinglish: ["CLI test modes", "Tool call validations parsing", "Output verification rules"] },
    commonMistakes: { English: ["Skipping logs inspections.", "Running dangerous commands without sandbox boundaries."], Hindi: ["लॉग्स के निरीक्षण को छोड़ना।", "सैंडबॉक्स सीमाओं के बिना खतरनाक कमांड चलाना।"], Hinglish: ["Execution log logs bypass check.", "Dangerous shell tools execute without local boundaries restrictions."] },
    applications: { English: ["Testing execution safety before active deployments"], Hindi: ["सक्रिय परिनियोजन से पहले निष्पादन सुरक्षा का परीक्षण करना"], Hinglish: ["Validating agent action chains integrity checks"] },
    exercises: { English: "Trigger a chat command query, check the logs, and verify tool usage.", Hindi: "एक चैट कमांड क्वेरी ट्रिगर करें, लॉग की जांच करें और टूल उपयोग सत्यापित करें।", Hinglish: "Chat script trigger command check logs outputs verify matches expected logs." },
    outcome: { English: "Compliant agent behavior shown in command logs.", Hindi: "कमांड लॉग में अनुपालन एजेंट व्यवहार प्रदर्शित हुआ।", Hinglish: "Valid agent loops logs display output verified." },
    checkpoint: {
      question: { English: "Why is it important to perform CLI sandbox dry-runs on new agent configurations?", Hindi: "नए एजेंट कॉन्फ़िगरेशन पर सीएलआई सैंडबॉक्स ड्राय-रन चलाना क्यों महत्वपूर्ण है?", Hinglish: "New agent configurations ko CLI dry run mode me run verify check karna kyu crucial hai?" },
      options: { English: ["To download external libraries", "To verify tool usage safety and instruction compliance before actual deployment", "To check internet network adapter speeds", "To delete cache files"], Hindi: ["बाहरी लाइब्रेरी डाउनलोड करने के लिए", "वास्तविक परिनियोजन से पहले टूल उपयोग सुरक्षा और निर्देश अनुपालन को सत्यापित करने के लिए", "इंटरनेट नेटवर्क एडाप्टर गति की जांच करने के लिए", "कैश फाइलें हटाने के लिए"], Hinglish: ["To download external libraries", "To verify tool usage safety and instruction compliance before actual deployment", "To check internet network adapter speeds", "To delete cache files"] },
      correct: 1,
      explanation: { English: "Testing in a sandbox ensures the agent interprets instructions and uses tools safely without causing unintended actions.", Hindi: "सैंडबॉक्स में परीक्षण यह सुनिश्चित करता है कि एजेंट निर्देशों की सही व्याख्या करता है और अनपेक्षित क्रियाओं के बिना सुरक्षित रूप से उपकरणों का उपयोग करता है।", Hinglish: "Sandbox validation runtime checks perform karke secure tool behavior guarantee karta hai." }
    }
  },
  "Optimization": {
    title: { English: "Agent Performance Tuning", Hindi: "एजेंट प्रदर्शन ट्यूनिंग", Hinglish: "Agent Performance Tuning" },
    explanation: {
      English: "Measure execution latency parameters, prune redundant context directory maps, and adjust temperature configurations for high-speed local processing.",
      Hindi: "निष्पादन विलंबता मापदंडों को मापें, अनावश्यक संदर्भ निर्देशिका मानचित्रों को छाँटें, और उच्च गति स्थानीय प्रसंस्करण के लिए तापमान कॉन्फ़िगरेशन को समायोजित करें।",
      Hinglish: "Execution latency time log measure check redundant files prune config limits adjust temperature values check optimize."
    },
    visualFlow: "[Track Latency Logs] ──> [Refine Instruction Limits] ──> [Prune Database Indices] ──> [Optimize Output speeds]",
    prerequisite: { English: "Sandbox validations passed.", Hindi: "सैंडबॉक्स सत्यापन सफल होना चाहिए।", Hinglish: "Agent sandbox dry run tests passed." },
    keyConcepts: { English: ["Token latency benchmarks", "Context window optimizations", "Temperature and penalty settings"], Hindi: ["टोकन विलंबता बेंचमार्क", "संदर्भ विंडो अनुकूलन", "तापमान और दंड सेटिंग्स"], Hinglish: ["Token generation speed latency", "Context window size adjustments", "Temperature and frequency penalties parameters"] },
    commonMistakes: { English: ["Leaving huge unindexed files in context paths.", "Setting temperature to maximum, causing hallucinations."], Hindi: ["संदर्भ पथों में विशाल गैर-अनुक्रमित फ़ाइलें छोड़ना।", "तापमान को अधिकतम पर सेट करना, जिससे मतिभ्रम (hallucination) होता है।"], Hinglish: ["Huge raw files ignore context paths.", "Temperature values extreme high hallucinations outputs check failure."] },
    applications: { English: ["Improving response latency and cohesion"], Hindi: ["प्रतिक्रिया विलंबता और सामंजस्य में सुधार"], Hinglish: ["Speeding up localized processing agents"] },
    exercises: { English: "Clean out unused documentation files from context paths and evaluate changes in query latencies.", Hindi: "संदर्भ पथों से अप्रयुक्त दस्तावेज़ीकरण फ़ाइलें साफ़ करें और क्वेरी विलंबता में परिवर्तनों का मूल्यांकन करें।", Hinglish: "Unused context documents prune query execution time query performance verify check check." },
    outcome: { English: "Optimized response latencies and clean coherent responses.", Hindi: "इष्टतम प्रतिक्रिया विलंबता और स्पष्ट सुसंगत प्रतिक्रियाएँ।", Hinglish: "High speed runtime response output results pass check." },
    checkpoint: {
      question: { English: "What configuration parameters adjust response randomness vs repetitiveness in Antigravity?", Hindi: "एंटीग्रेविटी में प्रतिक्रिया की यादृच्छिकता बनाम दोहराव को कौन से मापदंड समायोजित करते हैं?", Hinglish: "Output answers repetitive na ho aur balance randomness bani rahe, iske liye kya params adjust hote hain?" },
      options: { English: ["The system power adapters settings", "The temperature and frequency penalty configurations", "The hard disk storage partition", "The screen resolution limits"], Hindi: ["सिस्टम पावर एडाप्टर सेटिंग्स", "तापमान और आवृत्ति दंड कॉन्फ़िगरेशन", "हार्ड डिस्क स्टोरेज विभाजन", "स्क्रीन रिज़ॉल्यूशन सीमाएँ"], Hinglish: ["The system power adapters settings", "The temperature and frequency penalty configurations", "The hard disk storage partition", "The screen resolution limits"] },
      correct: 1,
      explanation: { English: "Temperature adjusts randomness, while frequency/presence penalties help prevent repetitive text patterns.", Hindi: "तापमान यादृच्छिकता (randomness) को समायोजित करता है, जबकि आवृत्ति/उपस्थिति दंड दोहराव वाले टेक्स्ट पैटर्न को रोकने में मदद करते हैं।", Hinglish: "Temperature output creativity adjust karti hai aur frequency penalty repetitiveness restrict karti hai." }
    }
  }
};

function resolveGuideKey(stepName, toolName) {
  if (!stepName) return '';
  const s = stepName.toLowerCase();
  const t = (toolName || '').toLowerCase();
  
  if (s.includes("android studio installation") || s.includes("एंड्रॉइड स्टूडियो") || s.includes("install")) {
    if (s.includes("download") || s.includes("antigravity")) {
      // skip
    } else {
      return "Android Studio Installation";
    }
  }
  if (s.includes("download antigravity") || s.includes("एंटीग्रेविटी 2.0 डाउनलोड") || s.includes("antigravity 2.0 download")) {
    return "Download Antigravity 2.0";
  }
  if (s.includes("environment") || s.includes("एसडीके सेटअप") || s.includes("sdk")) {
    return "Environment Setup";
  }
  if (s.includes("project creation") || s.includes("प्रोजेक्ट सेटअप") || s.includes("template setup")) {
    return "Project Creation";
  }
  if (s.includes("development") || s.includes("डेवलपमेंट") || s.includes("app development")) {
    return "Development";
  }
  if (s.includes("apk") || s.includes("एपीके")) {
    return "APK Generation";
  }
  if (s.includes("deployment") || s.includes("परिनियोजन") || s.includes("live")) {
    return "Deployment";
  }
  if (s.includes("installation") || s.includes("स्थापना")) {
    return "Installation";
  }
  if (s.includes("configuration") || s.includes("कॉन्फ़िगरेशन")) {
    return "Configuration";
  }
  if (s.includes("build personal ai") || s.includes("एजेंट सेटअप") || s.includes("first ai agent")) {
    return "Build Personal AI";
  }
  if (s.includes("optimization") || s.includes("अनुकूलन") || s.includes("optimize")) {
    return "Optimization";
  }
  if (s.includes("testing") || s.includes("परीक्षण") || s.includes("emulation")) {
    if (t.includes("android")) {
      return "Testing (Android)";
    } else {
      return "Testing (Antigravity)";
    }
  }
  
  if (appGuidesData[stepName]) return stepName;
  return stepName;
}

function getToolEducationalData(tool, lang, stepName = '') {
  const isCreation = tool.category === "CREATION ENGINE";
  const isEngineering = tool.category === "ENGINEERING ENGINE";
  const isAnalytics = tool.category === "ANALYTICS ENGINE";
  
  const mappedStepKey = resolveGuideKey(stepName, tool.name);
  
  if (appGuidesData[mappedStepKey]) {
    const gd = appGuidesData[mappedStepKey];
    const targetTitle = gd.title[lang] || gd.title["English"];
    const targetExplanation = gd.explanation[lang] || gd.explanation["English"];
    const targetVisualFlow = gd.visualFlow;
    const targetPrerequisite = gd.prerequisite[lang] || gd.prerequisite["English"];
    const targetKeyConcepts = gd.keyConcepts[lang] || gd.keyConcepts["English"];
    const targetCommonMistakes = gd.commonMistakes[lang] || gd.commonMistakes["English"];
    const targetApplications = gd.applications[lang] || gd.applications["English"];
    const targetExercises = gd.exercises[lang] || gd.exercises["English"];
    const targetOutcome = gd.outcome[lang] || gd.outcome["English"];
    const targetCheckpoint = gd.checkpoint;
    
    return {
      explanation: targetExplanation,
      summary: targetExplanation.substring(0, 100) + '...',
      visualFlow: targetVisualFlow,
      examples: targetApplications,
      keyConcepts: targetKeyConcepts,
      commonMistakes: targetCommonMistakes,
      applications: targetApplications,
      reading: ["Official tool documentation", "Standard tutorial references"],
      prerequisite: targetPrerequisite,
      exercises: targetExercises,
      outcome: targetOutcome,
      checkpoint: targetCheckpoint
    };
  }
  
  const name = tool.name;
  let explanation = "";
  let summary = "";
  let visualFlow = "";
  let examples = [];
  let keyConcepts = [];
  let commonMistakes = [];
  let applications = [];
  let reading = [];
  let prerequisite = "";
  let exercises = "";
  let outcome = "";
  let checkpoint = null;

  if (isCreation) {
    explanation = `${name} utilizes advanced generative modeling networks (such as transformers or diffusion decoders) to translate semantic specifications into clean high-fidelity creative outputs.`;
    summary = `A powerful AI generative engine that helps you create scripts, code, graphics, or audio in seconds.`;
    visualFlow = `[Text Prompt input] ──> [Generative Decoder Net] ──> [Denoising/Synthesis Layer] ──> [High-Fidelity Media Asset]`;
    examples = ["Generating marketing copies and articles", "Producing custom structural visual designs for campaigns"];
    keyConcepts = ["Generative output thresholds", "Prompt tuning context bounds", "Feature seed randomness controls"];
    commonMistakes = ["Writing very short, abstract prompts with vague constraints.", "Expecting exact structural replication without parameter calibration."];
    applications = ["Rapid content drafting workflows", "Automating baseline asset generations"];
    reading = ["Modern Generative Systems Guides on huggingface.co", "Prompt Engineering guides for media publishers"];
    prerequisite = "Basic conceptual outline of your creative targets.";
    exercises = `Build a detailed 3-paragraph prompt describing your target scenario and execute it in ${name} to inspect output consistency.`;
    outcome = "A clean production asset or draft structured according to your custom rules.";
    checkpoint = {
      question: {
        English: `What controls the direct balance between model adherence to the prompt vs creative variety?`,
        Hindi: `प्रॉम्प्ट के प्रति मॉडल के जुड़ाव और रचनात्मक विविधता के बीच सीधे संतुलन को कौन नियंत्रित करता है?`,
        Hinglish: `Model ke prompt adherence aur creative variety ke beech ka balance kaun handle karta hai?`
      },
      options: {
        English: ["The GPU computing hardware limit", "Parameter values like CFG Scale or Temperature settings", "The internet connection bandrate", "The storage layout file size"],
        Hindi: ["जीपीयू कंप्यूटिंग हार्डवेयर सीमा", "सीएफजी स्केल या तापमान सेटिंग्स जैसे पैरामीटर मान", "इंटरनेट कनेक्शन बैंडरेट", "स्टोरेज लेआउट फ़ाइल आकार"],
        Hinglish: ["Processor hardware speed limits", "CFG Scale aur Temperature settings parameters", "Internet connection bandwidth", "Local system storage cache files"]
      },
      correct: 1,
      explanation: {
        English: "CFG Scale and Temperature adjust how closely the neural network conforms to prompt features vs exploring creative alternative paths.",
        Hindi: "सीएफजी स्केल और तापमान समायोजित करते हैं कि न्यूरल नेटवर्क प्रॉम्प्ट फीचर्स के कितने करीब रहता है बनाम रचनात्मक वैकल्पिक रास्तों की खोज करता है।",
        Hinglish: "CFG Scale aur Temperature parameters determine karte hain ki outputs prompt se kitna matching hoga aur kitna creative random variations aayenge."
      }
    };
  } else if (isEngineering) {
    explanation = `${name} leverages intelligent code analysis, API logic generation, and automated loops to accelerate software, hardware integration, or task orchestration workflows.`;
    summary = `An engineering automation system designed to structure code, program scripts, or run scheduling loops.`;
    visualFlow = `[Active Project Files] ──> [Context Compiler / RAG Analysis] ──> [Code completion / Action daemon] ──> [Running Pipeline]`;
    examples = ["Autogenerating boilerplate classes and functions", "Structuring timeline logic triggers for scheduled data syncs"];
    keyConcepts = ["Context window boundaries", "Automated syntax validation loops", "Logic compiler constraints"];
    commonMistakes = ["Blindly running code completions without performing syntax inspections.", "Failing to document boundaries for database connections."];
    applications = ["Accelerating coding speeds in complex environments", "Automating standard schedule operations"];
    reading = ["Cloud IDE integrations and RAG tutorials", "Best practices in AI-assisted software developments"];
    prerequisite = "Understanding baseline logic, compiler scripts, and task paths.";
    exercises = `Write a broken code segment, trigger the refactoring module of ${name}, and compare its performance to manual optimization.`;
    outcome = "Refactored, cleanly structured script modules passing syntax validations.";
    checkpoint = {
      question: {
        English: `Why is it critical to audit source code completions generated by tools like ${name}?`,
        Hindi: `जैसी एआई कोडिंग प्रणालियों द्वारा जनरेट किए गए सोर्स कोड ऑडिट करना क्यों महत्वपूर्ण है?`,
        Hinglish: `AI software codegen tools dwara generated completions ko verify aur test karna kyu jaruri hai?`
      },
      options: {
        English: [
          "AI models never generate functional code syntax.",
          "Generated segments might introduce security bugs or outdated API dependencies.",
          "The system deletes your files if they are not validated.",
          "Only human code is accepted by modern compilers."
        ],
        Hindi: [
          "एआई मॉडल कभी भी कार्यात्मक कोड सिंटैक्स उत्पन्न नहीं करते हैं।",
          "जनरेट किए गए कोड सुरक्षा बग या पुराने एपीआई निर्भरता पेश कर सकते हैं।",
          "यदि वे मान्य नहीं हैं तो सिस्टम आपकी फ़ाइलों को हटा देता है।",
          "आधुनिक कंपाइलरों द्वारा केवल मानव कोड ही स्वीकार किया जाता है।"
        ],
        Hinglish: [
          "AI outputs compile nahi ho sakte.",
          "Generated segments me security loops, bugs ya deprecated libraries reference ho sakti hain.",
          "Valid check na hone par local codebase delete ho jata hai.",
          "Modern coding standards non-human codes block kar dete hain."
        ]
      },
      correct: 1,
      explanation: {
        English: "AI coding tools optimize for statistical syntax sequence, meaning they can output insecure patterns or refer to deprecated libraries if unverified.",
        Hindi: "एआई कोडिंग टूल्स सांख्यिकीय सिंटैक्स अनुक्रम के लिए अनुकूलित होते हैं, जिसका अर्थ है कि वे असुरक्षित पैटर्न आउटपुट कर सकते हैं यदि वे सत्यापित नहीं हैं।",
        Hinglish: "AI code auto-complete syntax probability par compile karta hai, isliye isme bug patterns hone ke chances kafi badh jate hain."
      }
    };
  } else {
    explanation = `${name} utilizes advanced statistics, time-series anomaly checkers, and vector embeddings to sweep datasets, extract core semantics, and forecast operational trends.`;
    summary = `An analytical data sweep system providing real-time data analysis, summaries, and forecasts.`;
    visualFlow = `[Raw Event stream data] ──> [Statistical Anomaly Classifier] ──> [Telemetry Metric graphs] ──> [Actionable System Forecasts]`;
    examples = ["Scanning clinical logs to map diagnostic signals", "Forecasting project timelines using historical metrics"];
    keyConcepts = ["Statistical classifier boundaries", "Vector representation maps", "Real-time telemetry streams"];
    commonMistakes = ["Assuming correlation is causation in statistical trends.", "Injecting unstructured, noisy raw datasets without sorting files first."];
    applications = ["Detecting exceptions in operational databases", "Filing research summaries with citations"];
    reading = ["Time-series analytics tutorials", "Introduction to data analysis and vector math"];
    prerequisite = "Access to structured event logs or database files.";
    exercises = `Upload a raw dataset sample into ${name}, run the metrics summary, and isolate the top outlier coordinates.`;
    outcome = "Detailed anomaly tables or semantic forecast charts outlining key system metrics.";
    checkpoint = {
      question: {
        English: `What is the core purpose of a statistical anomaly classifier in systems like ${name}?`,
        Hindi: `जैसी प्रणालियों में सांख्यिकीय विसंगति (anomaly) क्लासिफायर का मुख्य उद्देश्य क्या है?`,
        Hinglish: `Telemetry tools me anomaly classifiers ka primary roll kya hota hai?`
      },
      options: {
        English: [
          "To delete logs automatically after 30 days",
          "To identify data points that deviate significantly from standard operational patterns",
          "To translate English texts to other formats",
          "To download files from standard web sites"
        ],
        Hindi: [
          "30 दिनों के बाद स्वचालित रूप से लॉग हटाने के लिए।",
          "उन डेटा बिंदुओं की पहचान करना जो मानक परिचालन पैटर्न से काफी भिन्न हैं।",
          "अंग्रेजी ग्रंथों का अन्य प्रारूपों में अनुवाद करना।",
          "मानक वेबसाइटों से फाइलें डाउनलोड करना।"
        ],
        Hinglish: [
          "Database logs delete karna.",
          "Normal pattern behavior se mismatch hone wale data spikes ko trace aur filter karna.",
          "Language parameters ko convert aur format karna.",
          "Online web page elements download link generate karna."
        ]
      },
      correct: 1,
      explanation: {
        English: "Anomaly classifiers evaluate deviations from statistical baselines to alert operators about outliers or potential bugs.",
        Hindi: "विसंगति क्लासिफायर सांख्यिकीय आधार रेखाओं से विचलन का मूल्यांकन करते हैं ताकि ऑपरेटरों को विसंगतियों या संभावित बग के बारे में सचेत किया जा सके।",
        Hinglish: "Anomaly parameters check karte hain ki data flow normal line me hai ya high variations values standard lines cross kar rahi hain."
      }
    };
  }

  if (lang === "Hindi") {
    explanation = `यह टूल (${name}) इस क्षेत्र के सैद्धांतिक सिद्धांतों, आर्किटेक्चरल डिज़ाइनों और व्यावहारिक कार्यान्वयन मापदंडों को कवर करता है।`;
    summary = `एक कुशल एआई सिस्टम जो कार्यों को स्वचालित करने और निर्णय लेने में मदद करता है।`;
    prerequisite = "इस कार्य से संबंधित बुनियादी समझ।";
    exercises = `अपनी आवश्यकताओं के अनुसार ${name} में एक छोटा प्रोजेक्ट सेट करें और उसके आउटपुट की समीक्षा करें।`;
    outcome = "एक व्यवस्थित आउटपुट या व्यावहारिक परिणाम जो आपके द्वारा निर्धारित नियमों के अनुकूल हो।";
  } else if (lang === "Hinglish") {
    explanation = `${name} advanced algorithms aur mathematical representations use karke system flows aur output targets compile karta hai.`;
    summary = `Ek smart AI system jo aapke workflows ko speed aur clean logic ke sath automate karta hai.`;
    prerequisite = "Basic computing rules aur project setup ka knowledge.";
    exercises = `Apne target workflow me ${name} configure karein aur iske visual feedback ya outputs check karein.`;
    outcome = "Working model outputs, structured data templates ya code fragments.";
  }

  return {
    explanation,
    summary,
    visualFlow,
    examples,
    keyConcepts,
    commonMistakes,
    applications,
    reading,
    prerequisite,
    exercises,
    outcome,
    checkpoint
  };
}

function regenerateActiveRoadmap() {
  const section = document.getElementById('roadmap-builder-section');
  if (!isUserAuthenticated() || (state.user && !state.user.plan_type)) {
    if (section) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = 'block';

  const selectedGoal = state.goalText;
  if (!selectedGoal) return;
  
  const budgetLimit = (state.budgetLimit !== undefined && state.budgetLimit !== null) ? state.budgetLimit : 100;
  const activeLang = getActiveLanguage();
  
  if (selectedGoal === "Exploring AI") {
    const educationWorkflow = exploringAIRoadmap.map(node => {
      return {
        tool: node,
        mode: "Free",
        cost: 0,
        score: 10
      };
    });
    
    const stepsList = exploringAIRoadmap.map((node, idx) => {
      return node.title[activeLang] || node.title["English"];
    });

    const sectionSubtitle = document.querySelector('#roadmap-builder-section .section-subtitle');
    if (sectionSubtitle) {
      let text = "";
      if (activeLang === "English") {
        text = `AI Learning Curriculum compiled. <strong>40 Interactive Topics</strong> mapped. Current Layer: <strong>All Levels</strong>.`;
      } else if (activeLang === "Hindi") {
        text = `एआई लर्निंग पाठ्यक्रम तैयार। <strong>40 इंटरेक्टिव विषय</strong> मैप किए गए। वर्तमान स्तर: <strong>सभी स्तर</strong>।`;
      } else {
        text = `AI Learning Curriculum compiled. <strong>40 Interactive Topics</strong> mapped. Level: <strong>All Levels</strong>.`;
      }
      sectionSubtitle.innerHTML = text;
    }
    
    renderRoadmap(educationWorkflow, stepsList);
  } else {
    const fullWorkflow = generateDynamicWorkflow(selectedGoal, budgetLimit, state.selectedExperience || 'Intermediate');
    
    const trans = stepsTranslation[activeLang] || stepsTranslation["Hinglish"];
    const stepsList = fullWorkflow.map(item => {
      const toolName = item.tool.name || item.tool.title;
      return trans[toolName] || toolName;
    });
    
    const sectionSubtitle = document.querySelector('#roadmap-builder-section .section-subtitle');
    if (sectionSubtitle) {
      const totalCost = fullWorkflow.reduce((sum, item) => sum + item.cost, 0);
      
      let text = "";
      if (activeLang === "English") {
        text = `Custom-compiled <strong>${selectedGoal}</strong> toolchain for goal: <em>"${selectedGoal}"</em>.<br>Budget: <strong>₹${totalCost} / mo</strong> used of ₹${budgetLimit} threshold. Language: <strong>${activeLang}</strong>.`;
      } else if (activeLang === "Hindi") {
        text = `लक्ष्य के लिए कस्टम-कंपाइल की गई <strong>${selectedGoal}</strong> टूलचेन: <em>"${selectedGoal}"</em>.<br>बजट: ₹${budgetLimit} की सीमा में से <strong>₹${totalCost} / महीना</strong> उपयोग किया गया। भाषा: <strong>${activeLang}</strong>।`;
      } else {
        text = `Custom-compiled <strong>${selectedGoal}</strong> toolchain for goal: <em>"${selectedGoal}"</em>.<br>Budget: ₹${budgetLimit} key limit me se <strong>₹${totalCost} / month</strong> use hua. Language: <strong>${activeLang}</strong>.`;
      }
      sectionSubtitle.innerHTML = text;
    }
    
    renderRoadmap(fullWorkflow, stepsList);
  }
}

function initDashboardControls() {
  const taskSelect = document.getElementById('control-task-select');
  const budgetSelect = document.getElementById('control-budget-select');
  const workflowSelect = document.getElementById('control-workflow-select');
  const langSelect = document.getElementById('control-lang-select');
  const compileBtn = document.getElementById('control-compile-btn');

  function handleModeChange(skipRegen = false) {
    if (!taskSelect || !budgetSelect || !workflowSelect) return;
    
    // Reset state step indices on mode change
    state.activeStepIndex = 0;
    state.quickStartStep = 1;
    state.userIdeaDescription = '';
    state.compiledQuickStartPrompt = '';
    
    if (taskSelect.value === "Exploring AI") {
      // Auto-select "₹0 Free" (value: "0")
      budgetSelect.value = "0";
      budgetSelect.disabled = true;
      if (budgetSelect.parentElement) {
        budgetSelect.parentElement.setAttribute('title', "Exploring AI uses a fixed Beginner learning path.");
      }
      
      // Auto-select "Beginner" (value: "Beginner")
      workflowSelect.value = "Beginner";
      workflowSelect.disabled = true;
      if (workflowSelect.parentElement) {
        workflowSelect.parentElement.setAttribute('title', "Exploring AI uses a fixed Beginner learning path.");
      }
      
      // Set variables in state
      state.goalText = "Exploring AI";
      state.budgetLimit = 0;
      state.selectedExperience = "Beginner";
      
      if (!skipRegen) {
        // Generate Exploring AI learning roadmap immediately
        regenerateActiveRoadmap();
        setTimeout(() => {
          drawRoad();
        }, 150);
      }
    } else {
      // Re-enable Budget selector
      budgetSelect.disabled = false;
      if (budgetSelect.parentElement) {
        budgetSelect.parentElement.removeAttribute('title');
      }
      
      // Re-enable Experience selector
      workflowSelect.disabled = false;
      if (workflowSelect.parentElement) {
        workflowSelect.parentElement.removeAttribute('title');
      }
      
      // Update state with selected values
      state.goalText = taskSelect.value;
      state.budgetLimit = parseInt(budgetSelect.value);
      state.selectedExperience = workflowSelect.value;
    }
  }

  if (taskSelect) {
    taskSelect.addEventListener('change', () => {
      handleModeChange(false);
    });
  }

  // Helper to compile roadmap directly
  function compileRoadmapDirectly(goal, format = 'text') {
    state.roadmapFormat = format;
    state.goalText = goal;
    if (state.goalText !== "Exploring AI") {
      state.analytics.compileRoadmapClicks++;
    }
    
    let bVal = 100;
    if (budgetSelect) {
      const selVal = budgetSelect.value;
      bVal = parseInt(selVal);
    }
    state.budgetLimit = bVal;
    
    state.selectedExperience = workflowSelect ? workflowSelect.value : 'Intermediate';
    
    // Reset active indices on compilation execution
    state.activeStepIndex = 0;
    state.quickStartStep = 1;
    state.userIdeaDescription = '';
    state.compiledQuickStartPrompt = '';
    
    regenerateActiveRoadmap();
    
    const targetSection = document.getElementById('roadmap-builder-section');
    if (targetSection) {
      const offset = 72;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = targetSection.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    
    setTimeout(() => {
      drawRoad();
    }, 350);
  }

  if (compileBtn) {
    compileBtn.addEventListener('click', () => {
      if (!isUserAuthenticated()) {
        const authOverlay = document.getElementById('auth-modal-overlay');
        if (authOverlay) authOverlay.style.display = 'flex';
        showToast("Please login first to compile your roadmap.", "warning");
        return;
      }
      if (state.user && !state.user.plan_type) {
        showPricingModal(true);
        showToast("Please select a plan to access roadmap features.", "warning");
        return;
      }
      
      const goal = taskSelect ? taskSelect.value : 'Exploring AI';
      
      if (goal === "Exploring AI") {
        const choiceModal = document.getElementById('video-roadmap-choice-modal');
        if (choiceModal) {
          choiceModal.style.display = 'flex';
        }
      } else {
        compileRoadmapDirectly(goal, 'text');
      }
    });
  }

  // Bind Choice Modal Buttons
  const choiceModal = document.getElementById('video-roadmap-choice-modal');
  const btnChoiceText = document.getElementById('btn-choice-text');
  const btnChoiceVideo = document.getElementById('btn-choice-video');
  const btnCloseChoice = document.getElementById('btn-close-choice');

  if (choiceModal && btnChoiceText && btnChoiceVideo && btnCloseChoice) {
    btnChoiceText.addEventListener('click', () => {
      choiceModal.style.display = 'none';
      compileRoadmapDirectly('Exploring AI', 'text');
    });

    btnChoiceVideo.addEventListener('click', () => {
      choiceModal.style.display = 'none';
      
      const isPremium = isUserAuthenticated() && state.user && (state.user.plan_type === 'Premium' || state.user.plan_type === 'Trial Premium' || state.user.plan_type === 'Trial');
      if (!isPremium) {
        showToast("Upgrade to Premium or start trial to watch Video Roadmaps.", "warning");
        showPricingModal(true);
      } else {
        compileRoadmapDirectly('Exploring AI', 'video');
      }
    });

    btnCloseChoice.addEventListener('click', () => {
      choiceModal.style.display = 'none';
    });
  }

  if (taskSelect && budgetSelect && workflowSelect && langSelect) {
    // Restore language selection from localStorage
    const savedLang = localStorage.getItem('aios_language') || 'English';
    langSelect.value = savedLang;
    
    // Initial load of translations asynchronously
    loadTranslations(savedLang).then(() => {
      handleModeChange(true);
      setTimeout(() => {
        regenerateActiveRoadmap();
        drawRoad();
        renderLibraryGrid();
        renderCategoryExplorer();
        initCategoryExplorerSection();
      }, 150);
    });

    langSelect.addEventListener('change', async (e) => {
      const selectedLang = e.target.value;
      localStorage.setItem('aios_language', selectedLang);
      await loadTranslations(selectedLang);
      
      // Update UI components reactively
      regenerateActiveRoadmap();
      renderLibraryGrid();
      renderCategoryExplorer();
      initCategoryExplorerSection();
      setTimeout(() => {
        drawRoad();
      }, 150);
    });
  }
}

function getMasterPromptTemplate(goalText) {
  const templates = {
    image: "You are an expert photographer and prompt engineer. Generate a production-ready JSON prompt for Google Imagine using the user's description. Output only valid JSON.",
    video: "You are an expert cinematic director. Generate a production-ready JSON prompt for Flow AI based on the user's description. Output only valid JSON.",
    website: "You are an expert full-stack developer. Generate a production-ready JSON prompt for an AI coding agent using the user's description. Output only valid JSON.",
    logo: "You are an expert brand designer. Generate a premium minimalist JSON prompt for logo generation based on the user's description. Output only valid JSON.",
    app: "You are an expert mobile app architect. Generate a production-ready JSON prompt based on the user's description. Output only valid JSON."
  };

  const goalLower = (goalText || "").toLowerCase();
  if (goalLower.includes("video") || goalLower.includes("movie")) {
    return templates.video;
  }
  if (goalLower.includes("image") || goalLower.includes("photo") || goalLower.includes("picture")) {
    return templates.image;
  }
  if (goalLower.includes("code") || goalLower.includes("software") || goalLower.includes("assistant") || goalLower.includes("personal ai")) {
    return templates.website;
  }
  if (goalLower.includes("logo") || goalLower.includes("design") || goalLower.includes("brand")) {
    return templates.logo;
  }
  if (goalLower.includes("app") || goalLower.includes("android")) {
    return templates.app;
  }
  
  // Fallbacks for other specific tasks
  if (goalLower.includes("music") || goalLower.includes("audio") || goalLower.includes("voice")) {
    return `You are an expert audio producer. Generate a production-ready JSON prompt for voice/music synthesis based on the user's description. Output only valid JSON.`;
  }
  if (goalLower.includes("write") || goalLower.includes("content") || goalLower.includes("copy")) {
    return `You are an expert copywriter and editor. Generate a production-ready JSON prompt for drafting content based on the user's description. Output only valid JSON.`;
  }
  if (goalLower.includes("hardware") || goalLower.includes("prototype")) {
    return `You are an expert hardware architect. Generate a production-ready JSON prompt for hardware design based on the user's description. Output only valid JSON.`;
  }

  return `You are an expert AI system architect. Generate a production-ready JSON prompt based on the user's description. Output only valid JSON.`;
}

function generateLocalJSONPrompt(goalText, description) {
  const goalLower = (goalText || "").toLowerCase();
  const desc = (description || "").trim() || "A creative futuristic project";
  
  const jsonPrompt = {
    ai_system: "AI-OS Optimized Prompt",
    timestamp: new Date().toISOString(),
    parameters: {
      temperature: 0.7,
      max_tokens: 1000,
      format: "JSON"
    },
    prompt_payload: {}
  };
  
  if (goalLower.includes("video") || goalLower.includes("movie")) {
    jsonPrompt.prompt_payload = {
      tool: "Flow AI / Video-FX",
      style: "Cinematic, cinematic lighting, ultra-realistic, 8k resolution, highly detailed, photorealistic",
      camera_movement: "Slow panning dynamic shot, tracking shot, depth of field",
      subject: desc,
      motion_speed: "Normal",
      aspect_ratio: "16:9",
      fps: 30,
      aesthetic_override: {
        neon_glow: "enabled",
        volumetric_smoke: "enabled"
      }
    };
  } else if (goalLower.includes("image") || goalLower.includes("photo") || goalLower.includes("picture")) {
    jsonPrompt.prompt_payload = {
      tool: "Google Imagen / Image-FX",
      style: "Hyper-realistic, photorealistic, professional photography, soft lighting, sharp focus",
      subject: desc,
      aspect_ratio: "1:1",
      camera: "85mm lens, f/1.8 aperture",
      render_settings: {
        resolution: "4K",
        contrast: "high"
      }
    };
  } else if (goalLower.includes("code") || goalLower.includes("software") || goalLower.includes("assistant") || goalLower.includes("personal ai") || goalLower.includes("website") || goalLower.includes("web")) {
    jsonPrompt.prompt_payload = {
      tool: "AI Coding Assistant",
      language: "JavaScript / HTML / CSS",
      framework: "Vanilla JS / TailwindCSS",
      project_concept: desc,
      ui_style: "Premium Dark Mode, glassmorphism, responsive, micro-animations",
      components: [
        "Header Navigation",
        "Hero section with dynamic visualizer",
        "Feature cards grid",
        "Interactive dashboard interface",
        "Footer with links"
      ],
      ux_requirements: {
        font_family: "Outfit, Inter, sans-serif",
        color_scheme: "HSL purple/blue dark gradient",
        animations: "smooth hover transitions, keyframe fades"
      }
    };
  } else if (goalLower.includes("logo") || goalLower.includes("design") || goalLower.includes("brand")) {
    jsonPrompt.prompt_payload = {
      tool: "Vector Graphic AI",
      design_type: "Minimalist, flat vector, modern tech logo",
      brand_concept: desc,
      palette: ["Deep Violet", "Electric Cyan", "Dark Slate"],
      typography_style: "Sans-serif, geometric, futuristic font",
      elements: "Clean geometry, abstract logo mark, high contrast background"
    };
  } else if (goalLower.includes("app") || goalLower.includes("android")) {
    jsonPrompt.prompt_payload = {
      tool: "Android / Flutter AI builder",
      app_type: "Mobile application",
      features: [
        "User authentication flow",
        "Interactive database dashboard",
        "Real-time push notifications",
        "Offline-first synchronization"
      ],
      description: desc,
      theme: "Material Design 3, dynamic color theme matching user wallpaper",
      architecture: "Clean architecture, MVVM pattern"
    };
  } else {
    jsonPrompt.prompt_payload = {
      tool: "General AI Assistant",
      task_description: desc,
      goal: goalText,
      instructions: [
        "Generate a highly detailed response based on the task description.",
        "Include actionable step-by-step instructions.",
        "Provide code or text templates where appropriate.",
        "Refine layout to be visually balanced."
      ]
    };
  }
  
  return JSON.stringify(jsonPrompt, null, 2);
}


function renderRoadmap(optimalWorkflow, steps) {
  const listContainer = document.querySelector('.timeline-list');
  const timelineContainer = document.querySelector('.timeline-container');
  const roadSvgContainer = document.querySelector('.road-svg-container');
  const roadmapUxContainer = document.querySelector('.roadmap-ux-container');
  
  // Clean up any old locks first
  removeRoadmapLock();
  
  if (state.goalText === "Exploring AI") {
    if (state.roadmapFormat === 'video') {
      // Hide SVG and timeline elements that are not needed
      if (roadSvgContainer) roadSvgContainer.style.display = 'none';
      if (timelineContainer) timelineContainer.style.display = 'block';
      if (roadmapUxContainer) roadmapUxContainer.style.display = 'none';
      
      // Clear any card deck elements
      const recContainer = document.getElementById('recommended-tool-container');
      const qsContainer = document.getElementById('quick-start-container');
      const deckContainer = document.getElementById('step-deck-container');
      if (recContainer) recContainer.innerHTML = '';
      if (qsContainer) qsContainer.innerHTML = '';
      if (deckContainer) deckContainer.innerHTML = '';
      
      if (!listContainer) return;
      listContainer.innerHTML = '';
      
      // Determine language
      const vLang = localStorage.getItem('aios_video_roadmap_lang') || 'eng';

      const translations = {
        eng: {
          headerTitle: "🎥 Video Roadmap Masterclass",
          headerSubtitle: "Ordered 5-part learning curriculum (Premium Active)",
          langLabel: "Language:",
          badge: "Premium Video Lecture",
          parts: [
            {
              part: 1,
              title: "Part 01: Introduction to AI Systems",
              desc: "Understand how neural nets process language tokens, context windows, and operational constraints. Learn the differences between prompt engineering and model fine-tuning, and when to apply them.",
              duration: "10:17"
            },
            {
              part: 2,
              title: "Part 02: Advanced Reasoning Engines",
              desc: "Master step-by-step rationalization, systemic chain-of-thought engineering, and multi-agent loops. Build workflows that allow LLMs to self-correct and execute complex reasoning sequences.",
              duration: "10:49"
            },
            {
              part: 3,
              title: "Part 03: Multimodal Generation Systems",
              desc: "Harness generative text-to-video interpolation, structural image rendering, and audio vectors. Master control nets, IP-adapters, and temporal consistency in AI cinematic creation.",
              duration: "09:39"
            },
            {
              part: 4,
              title: "Part 04: Autonomous Agents & MCPs",
              desc: "Build local tool-calling frameworks using Model Context Protocol hosts and server integrations. Connect databases, external APIs, and local systems directly to LLM runtimes safely.",
              duration: "09:00"
            },
            {
              part: 5,
              title: "Part 05: Scaling AI Workflows",
              desc: "Optimize high-volume batch runs, database caching architectures, and server load thresholds. Learn cost reduction tactics, latency mitigation, and deployment scaling rules.",
              duration: "10:26"
            }
          ]
        },
        hindi: {
          headerTitle: "🎥 वीडियो रोडमैप मास्टरक्लास",
          headerSubtitle: "क्रमबद्ध 5-भाग का शिक्षण पाठ्यक्रम (प्रीमियम सक्रिय)",
          langLabel: "भाषा:",
          badge: "प्रीमियम वीडियो लेक्चर",
          parts: [
            {
              part: 1,
              title: "भाग 01: एआई सिस्टम्स का परिचय",
              desc: "समझें कि न्यूरल नेटवर्क कैसे लैंग्वेज टोकन, कॉन्टेक्स्ट विंडो और ऑपरेशनल बाधाओं को प्रोसेस करते हैं। प्रॉम्प्ट इंजीनियरिंग और मॉडल फाइन-ट्यूनिंग के बीच अंतर सीखें।",
              duration: "08:32"
            },
            {
              part: 2,
              title: "भाग 02: एडवांस रीजनिंग इंजन",
              desc: "स्टेप-बाय-स्टेप तर्कसंगतता, सिस्टेमिक चेन-ऑफ-थॉट इंजीनियरिंग और मल्टी-एजेंट लूप्स में महारत हासिल करें। ऐसे वर्कफ्लो बनाएं जो एलएलएम को खुद को सुधारने में मदद करें।",
              duration: "13:15"
            },
            {
              part: 3,
              title: "भाग 03: मल्टीमॉडल जनरेशन सिस्टम्स",
              desc: "जेनरेटिव टेक्स्ट-टू-वीडियो इंटरपोलेशन, स्ट्रक्चरल इमेज रेंडरिंग और ऑडियो वेक्टर्स का उपयोग करें। एआई सिनेमाई निर्माण में कंट्रोल नेट और टेम्पोरल कंसिस्टेंसी सीखें।",
              duration: "07:28"
            },
            {
              part: 4,
              title: "भाग 04: ऑटोनॉमस एजेंट्स और एमसीपी",
              desc: "मॉडल कॉन्टेक्स्ट प्रोटोकॉल होस्ट और सर्वर इंटीग्रेशन का उपयोग करके लोकल टूल-कॉलिंग फ्रेमवर्क बनाएं। डेटाबेस और बाहरी एपीआई को सुरक्षित रूप से जोड़ें।",
              duration: "08:59"
            },
            {
              part: 5,
              title: "भाग 05: एआई वर्कफ्लो को स्केल करना",
              desc: "हाई-वॉल्यूम बैच रन, डेटाबेस कैशिंग आर्किटेक्चर और सर्वर लोड थ्रेशोल्ड को ऑप्टिमाइज़ करें। लागत में कमी और लेटेंसी को कम करने के नियम सीखें।",
              duration: "07:44"
            }
          ]
        }
      };

      const langData = translations[vLang] || translations.eng;

      const playlistWrapper = document.createElement('div');
      playlistWrapper.style.cssText = 'display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 800px; margin: 0 auto;';

      const playlistHeader = document.createElement('div');
      playlistHeader.className = 'video-playlist-header';
      playlistHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; margin-bottom: 8px; font-family: "Space Grotesk", monospace;';
      playlistHeader.innerHTML = `
        <div>
          <h3 style="color: #fff; margin: 0; font-size: 1.15rem;">${langData.headerTitle}</h3>
          <span style="font-size: 0.78rem; color: var(--text-secondary);">${langData.headerSubtitle}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-size: 0.78rem; color: rgba(255,255,255,0.6);">${langData.langLabel}</span>
          <button class="video-playlist-lang-btn ${vLang === 'eng' ? 'active' : ''}" data-lang="eng" style="padding: 6px 12px; border-radius: 6px; border: 1px solid ${vLang === 'eng' ? '#2EC5FF' : 'rgba(255,255,255,0.1)'}; background: ${vLang === 'eng' ? 'rgba(46,197,255,0.15)' : 'transparent'}; color: ${vLang === 'eng' ? '#2EC5FF' : '#fff'}; font-size: 0.78rem; cursor: pointer; transition: all 0.2s;">English 🇺🇸</button>
          <button class="video-playlist-lang-btn ${vLang === 'hindi' ? 'active' : ''}" data-lang="hindi" style="padding: 6px 12px; border-radius: 6px; border: 1px solid ${vLang === 'hindi' ? '#2EC5FF' : 'rgba(255,255,255,0.1)'}; background: ${vLang === 'hindi' ? 'rgba(46,197,255,0.15)' : 'transparent'}; color: ${vLang === 'hindi' ? '#2EC5FF' : '#fff'}; font-size: 0.78rem; cursor: pointer; transition: all 0.2s;">Hindi 🇮🇳</button>
        </div>
      `;
      playlistWrapper.appendChild(playlistHeader);
      
      // Bind language buttons
      playlistHeader.querySelectorAll('.video-playlist-lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const selected = e.target.getAttribute('data-lang');
          localStorage.setItem('aios_video_roadmap_lang', selected);
          renderRoadmap(optimalWorkflow, steps); // Re-render
        });
      });
      
      langData.parts.forEach(p => {
        const rowEl = document.createElement('div');
        rowEl.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(18, 18, 22, 0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; transition: all 0.2s; cursor: pointer;';
        rowEl.addEventListener('mouseenter', () => {
          rowEl.style.borderColor = 'rgba(46, 197, 255, 0.4)';
          rowEl.style.transform = 'translateY(-2px)';
        });
        rowEl.addEventListener('mouseleave', () => {
          rowEl.style.borderColor = 'rgba(255,255,255,0.06)';
          rowEl.style.transform = 'none';
        });
        
        rowEl.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; flex: 1; padding-right: 20px;">
            <strong style="color: #fff; font-size: 0.95rem; font-family: 'Space Grotesk', monospace;">${p.title}</strong>
            <span style="font-size: 0.8rem; color: rgba(255,255,255,0.6); line-height: 1.4;">${p.desc}</span>
            <span style="font-size: 0.75rem; color: #00D084; font-family: 'Space Grotesk', monospace;">⏱️ ${p.duration} • ${langData.badge}</span>
          </div>
          <button style="width: 42px; height: 42px; border-radius: 50%; background: rgba(46, 197, 255, 0.1); border: 1px solid rgba(46, 197, 255, 0.3); color: #2EC5FF; display: flex; align-items: center; justify-content: center; font-size: 1rem; cursor: pointer; transition: all 0.2s; flex-shrink: 0;">
            ▶
          </button>
        `;
        
        rowEl.addEventListener('click', () => {
          let filename = `part${p.part}_${vLang}.mp4`;
          if (state.discoveredVideos && state.discoveredVideos.explore && state.discoveredVideos.explore.length > 0) {
            const matched = state.discoveredVideos.explore.find(f => f.toLowerCase() === filename.toLowerCase());
            if (matched) filename = matched;
          }
          const videoPath = `https://media.ai-os.in/explore/${filename}`;
          window.playPremiumVideo(videoPath, `Exploring AI - ${p.title}`);
        });
        
        playlistWrapper.appendChild(rowEl);
      });
      
      listContainer.appendChild(playlistWrapper);
      
      // Clean up road traveler positions
      const rSvg = document.getElementById('road-svg');
      const rTrav = document.getElementById('road-traveler');
      if (rSvg) rSvg.style.display = 'none';
      if (rTrav) rTrav.style.display = 'none';
      return;
    }

    // Show original detailed timeline layout exactly as it existed before
    if (timelineContainer) timelineContainer.style.display = 'block';
    if (roadSvgContainer) roadSvgContainer.style.display = 'block';
    if (roadmapUxContainer) roadmapUxContainer.style.display = 'none';
    
    // Clear any card deck elements
    const recContainer = document.getElementById('recommended-tool-container');
    const qsContainer = document.getElementById('quick-start-container');
    const deckContainer = document.getElementById('step-deck-container');
    if (recContainer) recContainer.innerHTML = '';
    if (qsContainer) qsContainer.innerHTML = '';
    if (deckContainer) deckContainer.innerHTML = '';
    
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    if (!optimalWorkflow || optimalWorkflow.length === 0) {
      const noNodesTitle = (state.translations && state.translations.roadmap && state.translations.roadmap.noNodes) || "NO NODES COMPILED";
      const noNodesDesc = (state.translations && state.translations.roadmap && state.translations.roadmap.noNodesDesc) || "No systems match your criteria. Expand your budget threshold or alter your goal target.";
      const reconfigureBtn = (state.translations && state.translations.roadmap && state.translations.roadmap.reconfigure) || "Re-configure Target";
      
      listContainer.innerHTML = `
        <div class="timeline-row left" style="grid-template-columns: 1fr; text-align: center; justify-content: center; padding-top: 100px;">
          <div class="timeline-card visible" style="margin: 0 auto; max-width: 500px;">
            <h2 class="card-title">${noNodesTitle}</h2>
            <p class="card-desc">${noNodesDesc}</p>
            <button class="btn btn-primary btn-full" onclick="resetWizard()">${reconfigureBtn}</button>
          </div>
        </div>
      `;
      document.getElementById('road-svg').style.display = 'none';
      document.getElementById('road-traveler').style.display = 'none';
      return;
    }
    
    document.getElementById('road-svg').style.display = 'block';
    document.getElementById('road-traveler').style.display = 'block';

    optimalWorkflow.forEach((item, index) => {
      const tool = item.tool;
      const originalIndex = toolsData.findIndex(t => t.id === tool.id);
      const isLeft = index % 2 === 0;
      const sideClass = isLeft ? 'left' : 'right';
      
      const rowEl = document.createElement('div');
      rowEl.className = `timeline-row ${sideClass}`;
      rowEl.setAttribute('data-category', tool.timelineCategory);
      
      const anchorHTML = `<div class="timeline-dot-anchor" id="anchor-${index}"></div>`;
      const spacerHTML = `<div class="timeline-spacer"></div>`;
      const isFav = isFavorite(tool.id);
      const isCompared = state.comparisonList.includes(tool.id);
      
      const stepName = steps[index];
      const stepIndex = index + 1;
      
      // Basic plan check: if Exploring AI and Basic user and index >= 10, blur this row
      if (isUserAuthenticated() && state.user && state.user.plan_type === 'Basic' && index >= 10) {
        rowEl.classList.add('locked-preview-blur');
      }

      const cardHTML = `
        <div class="timeline-card" data-node="${originalIndex}">
          ${createCardHTML(tool, originalIndex, isFav, isCompared, true, stepName, stepIndex, item.cost, item.mode)}
        </div>
      `;
      
      if (isLeft) {
        rowEl.innerHTML = anchorHTML + cardHTML + spacerHTML;
      } else {
        rowEl.innerHTML = spacerHTML + anchorHTML + cardHTML;
      }
      
      listContainer.appendChild(rowEl);
    });
    
    // Append premium upgrade card banner for Basic users at the bottom of the timeline list
    if (isUserAuthenticated() && state.user && state.user.plan_type === 'Basic') {
      const bannerEl = document.createElement('div');
      bannerEl.className = 'timeline-row left';
      bannerEl.style.gridTemplateColumns = '1fr';
      bannerEl.style.justifyContent = 'center';
      bannerEl.style.padding = '40px 0';
      bannerEl.innerHTML = `
        <div class="timeline-card premium-upgrade-card" style="margin: 0 auto; max-width: 500px; text-align: center; border: 2px dashed #7f00ff; background: rgba(127, 0, 255, 0.05); padding: 30px; border-radius: 16px; box-shadow: 0 0 20px rgba(127,0,255,0.2);">
          <div style="font-size: 2rem; margin-bottom: 12px;">🌟</div>
          <h3 style="font-family: var(--font-title); font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Unlock Remaining 30 Lessons</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">Upgrade to Premium for ₹99/month to access the complete 40-step AI learning curriculum.</p>
          <button class="btn btn-primary" id="btn-timeline-upgrade" style="background: linear-gradient(135deg, #ff007f, #7f00ff); border: none; box-shadow: 0 0 15px rgba(127, 0, 255, 0.4); animation: premiumPulse 2.5s infinite alternate; width: 100%; justify-content: center;">Upgrade To Premium</button>
        </div>
      `;
      listContainer.appendChild(bannerEl);
      
      // Bind button
      setTimeout(() => {
        const upBtn = document.getElementById('btn-timeline-upgrade');
        if (upBtn) upBtn.addEventListener('click', showPricingModal);
      }, 50);
    }

    setupCardInteractions();
    
    // Draw the road path dynamically
    setTimeout(() => {
      drawRoad();
    }, 50);
    
    if (!isUserAuthenticated()) {
      applyRoadmapLock();
    }
    return;
  }
  
  // Otherwise, hide timeline layout and show Card-based layout
  if (timelineContainer) timelineContainer.style.display = 'none';
  if (roadSvgContainer) roadSvgContainer.style.display = 'none';
  if (roadmapUxContainer) roadmapUxContainer.style.display = 'block';

  const resolvedTaskKey = optionToMatrixKey[state.goalText] || state.goalText;
  const mapping = officialTasksMappings[resolvedTaskKey];
  if (mapping) {
    renderPremiumToolCard(mapping);
    if (!isUserAuthenticated()) {
      applyRoadmapLock();
    }
    return;
  }

  // 1. Populate the Recommended Tool Card
  const recContainer = document.getElementById('recommended-tool-container');
  if (recContainer) {
    const bestToolObj = optimalWorkflow[0] ? optimalWorkflow[0].tool : null;
    const bestToolName = bestToolObj ? bestToolObj.name : 'N/A';
    
    let difficultyKey = 'medium';
    if (state.selectedExperience === 'Beginner') difficultyKey = 'easy';
    else if (state.selectedExperience === 'Advanced') difficultyKey = 'advanced';
    
    const difficulty = (state.translations && state.translations.roadmap && state.translations.roadmap[difficultyKey]) || difficultyKey;
    const estTime = bestToolObj ? (bestToolObj.time || '15 mins') : '10 mins';
    
    const bestToolLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.bestTool) || "⭐ Best Tool";
    const difficultyLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.difficulty) || "⏱ Difficulty";
    const estTimeLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.estimatedTime) || "⚡ Estimated Time";
    
    recContainer.innerHTML = `
      <div class="recommended-tool-card">
        <div class="recommended-tool-field">
          <span class="recommended-tool-label">${bestToolLabel}</span>
          <span class="recommended-tool-value accent-val">${bestToolName}</span>
        </div>
        <div class="recommended-tool-field">
          <span class="recommended-tool-label">${difficultyLabel}</span>
          <span class="recommended-tool-value" style="text-transform: capitalize;">${difficulty}</span>
        </div>
        <div class="recommended-tool-field">
          <span class="recommended-tool-label">${estTimeLabel}</span>
          <span class="recommended-tool-value">${estTime}</span>
        </div>
      </div>
    `;
  }
  
  // 2. Populate the Quick Start Card
  const qsContainer = document.getElementById('quick-start-container');
  if (qsContainer) {
    const activeQS = state.quickStartStep || 1;
    const bestToolObj = optimalWorkflow[0] ? optimalWorkflow[0].tool : null;
    
    const qsTitle = (state.translations && state.translations.quickStartCard && state.translations.quickStartCard.title) || "⚡ Quick Start";
    const qsSubtitle = (state.translations && state.translations.quickStartCard && state.translations.quickStartCard.subtitle) || "Complete your task in just 3 simple steps.";
    const step1Title = (state.translations && state.translations.quickStartCard && state.translations.quickStartCard.step1Title) || "Describe Your Idea";
    const step1Desc = (state.translations && state.translations.quickStartCard && state.translations.quickStartCard.step1Desc) || "Enter details of what you want to create.";
    const step1Placeholder = (state.translations && state.translations.quickStartCard && state.translations.quickStartCard.step1Placeholder) || "Describe your idea (e.g. futuristic cyberpunk city)...";
    const step2Title = (state.translations && state.translations.quickStartCard && state.translations.quickStartCard.step2Title) || "Copy Generated JSON";
    const step2Desc = (state.translations && state.translations.quickStartCard && state.translations.quickStartCard.step2Desc) || "Copy the generated prompt.";
    const step3Title = (state.translations && state.translations.quickStartCard && state.translations.quickStartCard.step3Title) || "Generate";
    const step3Desc = (state.translations && state.translations.quickStartCard && state.translations.quickStartCard.step3Desc) || "Open the recommended AI tool and paste the JSON.";
    
    const genPromptBtnText = (state.translations && state.translations.roadmap && state.translations.roadmap.genPromptBtn) || "✨ Generate JSON Prompt";
    const copyBtnText = (state.translations && state.translations.roadmap && state.translations.roadmap.copyBtn) || "📋 Copy JSON";
    const openToolText = (state.translations && state.translations.openTool) || "🚀 Open Tool";
    
    qsContainer.innerHTML = `
      <div class="quick-start-card">
        <div class="quick-start-header">
          <h3 class="quick-start-title">${qsTitle}</h3>
          <p class="quick-start-subtitle">${qsSubtitle}</p>
        </div>
        <div class="quick-start-steps">
          <!-- Step 1 -->
          <div class="quick-start-step ${activeQS === 1 ? 'active' : ''}">
            <span class="quick-start-step-num">01</span>
            <span class="quick-start-step-title">${step1Title}</span>
            <p class="quick-start-step-desc">${step1Desc}</p>
            <div class="prompt-idea-input-wrapper">
              <textarea class="prompt-idea-textarea" id="qs-idea-input" placeholder="${step1Placeholder}">${state.userIdeaDescription || ''}</textarea>
              <button class="btn btn-primary quick-start-action-btn" id="qs-btn-step1">${genPromptBtnText}</button>
            </div>
          </div>
          
          <!-- Step 2 -->
          <div class="quick-start-step ${activeQS === 2 ? 'active' : ''}">
            <span class="quick-start-step-num">02</span>
            <span class="quick-start-step-title">${step2Title}</span>
            <p class="quick-start-step-desc">${step2Desc}</p>
            ${activeQS === 2 && state.generatedJSONPrompt ? `
              <div class="json-prompt-box-wrapper">
                <pre class="json-prompt-display"><code>${escapeHTML(state.generatedJSONPrompt)}</code></pre>
              </div>
            ` : ''}
            <button class="btn btn-secondary quick-start-action-btn" id="qs-btn-step2" ${activeQS < 2 ? 'disabled' : ''}>${copyBtnText}</button>
          </div>
          
          <!-- Step 3 -->
          <div class="quick-start-step ${activeQS === 3 ? 'active' : ''}">
            <span class="quick-start-step-num">03</span>
            <span class="quick-start-step-title">${step3Title}</span>
            <p class="quick-start-step-desc">${step3Desc}</p>
            <button class="btn btn-secondary quick-start-action-btn" id="qs-btn-step3" ${activeQS < 3 ? 'disabled' : ''}>${openToolText}</button>
          </div>
        </div>
      </div>
    `;
    
    // Bind Quick Start Step 1 Button
    const btn1 = document.getElementById('qs-btn-step1');
    if (btn1) {
      btn1.addEventListener('click', () => {
        if (!isUserAuthenticated()) {
          const authOverlay = document.getElementById('auth-modal-overlay');
          if (authOverlay) authOverlay.style.display = 'flex';
          showToast("Authentication required. Please sign in to compile your roadmap.", "error");
          return;
        }
        if (!checkPromptLimit()) return;

        const inputArea = document.getElementById('qs-idea-input');
        const desc = inputArea ? inputArea.value.trim() : '';
        state.userIdeaDescription = desc;
        
        // Generate local JSON prompt
        const localJSON = generateLocalJSONPrompt(state.goalText, desc);
        state.generatedJSONPrompt = localJSON;
        
        // Also set the fallback compiled prompt
        const template = getMasterPromptTemplate(state.goalText);
        const compiled = `${template}\n\nUser Description: "${desc || 'a beautiful creative project'}"\n\nOutput only valid JSON.`;
        state.compiledQuickStartPrompt = compiled;
        
        incrementPromptLimit();
        showToast("JSON Prompt generated locally! Proceed to Step 2.");
        state.quickStartStep = 2;
        renderRoadmap(optimalWorkflow, steps);
      });
    }
    
    // Bind Quick Start Step 2 Button
    const btn2 = document.getElementById('qs-btn-step2');
    if (btn2) {
      btn2.addEventListener('click', () => {
        const promptToCopy = state.generatedJSONPrompt || state.compiledQuickStartPrompt || getMasterPromptTemplate(state.goalText);
        navigator.clipboard.writeText(promptToCopy);
        showToast("JSON Prompt copied to clipboard!");
        state.quickStartStep = 3;
        renderRoadmap(optimalWorkflow, steps);
      });
    }
    
    // Bind Quick Start Step 3 Button
    const btn3 = document.getElementById('qs-btn-step3');
    if (btn3) {
      btn3.addEventListener('click', () => {
        const toolUrl = bestToolObj ? (bestToolObj.officialUrl || bestToolObj.link || bestToolObj.url) : '#';
        window.open(toolUrl, '_blank');
      });
    }
  }

  // 3. Populate the Step-by-Step Card Deck
  const deckContainer = document.getElementById('step-deck-container');
  if (deckContainer) {
    deckContainer.innerHTML = '';
    
    if (!optimalWorkflow || optimalWorkflow.length === 0) {
      const noNodesTitle = (state.translations && state.translations.roadmap && state.translations.roadmap.noNodes) || "NO NODES COMPILED";
      const noNodesDesc = (state.translations && state.translations.roadmap && state.translations.roadmap.noNodesDesc) || "No systems match your criteria. Expand your budget threshold or alter your goal target.";
      const reconfigureBtn = (state.translations && state.translations.roadmap && state.translations.roadmap.reconfigure) || "Re-configure Target";
      
      deckContainer.innerHTML = `
        <div class="step-card">
          <h2 class="step-card-title">${noNodesTitle}</h2>
          <p class="step-card-desc">${noNodesDesc}</p>
          <button class="btn btn-primary" onclick="resetWizard()">${reconfigureBtn}</button>
        </div>
      `;
      return;
    }
    
    if (state.activeStepIndex === undefined || state.activeStepIndex >= optimalWorkflow.length) {
      state.activeStepIndex = 0;
    }
    
    const activeIndex = state.activeStepIndex;
    const currentItem = optimalWorkflow[activeIndex];
    const tool = currentItem.tool;
    const originalIndex = toolsData.findIndex(t => t.id === tool.id);
    const stepName = steps[activeIndex];
    const stepNumber = activeIndex + 1;
    const totalSteps = optimalWorkflow.length;
    
    let iconHTML = tool.icon || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`;
    const isEdu = tool.id && tool.id.startsWith("EDU_");
    if (isEdu) {
      iconHTML = `<span style="font-family:var(--font-mono); font-size:0.75rem; font-weight:700; color:var(--text-primary);">EDU</span>`;
    }
    
    const titleText = isEdu ? (tool.title[getActiveLanguage()] || tool.title["English"]) : tool.name;
    let descText = '';
    if (isEdu) {
      descText = tool.summary[getActiveLanguage()] || tool.summary["English"];
    } else {
      const mappedStepKey = resolveGuideKey(stepName, tool.name);
      if (appGuidesData[mappedStepKey]) {
        descText = appGuidesData[mappedStepKey].explanation[getActiveLanguage()] || appGuidesData[mappedStepKey].explanation["English"];
      } else {
        descText = tool.description || tool.desc || `Execute actions in ${tool.name} interface.`;
      }
    }
    
    if (descText.length > 120) {
      descText = descText.substring(0, 117) + '...';
    }
    
    const inspectNodeText = (state.translations && state.translations.inspectNode) || "✨ Inspect Node";
    const openGoogleDocsText = (state.translations && state.translations.openGoogleDocs) || "🚀 Open Google Docs";
    const genPromptBtnText = (state.translations && state.translations.roadmap && state.translations.roadmap.genPromptBtn) || "✨ Generate JSON Prompt";
    const openToolText = (state.translations && state.translations.openTool) || "🚀 Open Tool";
    
    let primaryActionBtnHTML = '';
    if (isEdu) {
      primaryActionBtnHTML = `<button class="btn btn-primary step-card-action-btn" id="deck-action-inspect">${inspectNodeText}</button>`;
    } else {
      if (tool.id === "TOOL_DOCS") {
        primaryActionBtnHTML = `<button class="btn btn-primary step-card-action-btn" id="deck-action-open">${openGoogleDocsText}</button>`;
      } else if (tool.id === "TOOL_001") {
        primaryActionBtnHTML = `<button class="btn btn-primary step-card-action-btn" id="deck-action-open">${genPromptBtnText}</button>`;
      } else {
        primaryActionBtnHTML = `<button class="btn btn-primary step-card-action-btn" id="deck-action-open">${openToolText}</button>`;
      }
    }
    
    const progressPercent = Math.round(((activeIndex + 1) / totalSteps) * 100);
    
    let stepOfText = (state.translations && state.translations.roadmap && state.translations.roadmap.stepDeck && state.translations.roadmap.stepDeck.stepOf) || "Step {current} of {total}";
    stepOfText = stepOfText.replace("{current}", stepNumber).replace("{total}", totalSteps);
    
    const prevText = (state.translations && state.translations.roadmap && state.translations.roadmap.stepDeck && state.translations.roadmap.stepDeck.prev) || "← Previous";
    const nextText = (state.translations && state.translations.roadmap && state.translations.roadmap.stepDeck && state.translations.roadmap.stepDeck.next) || "➡ Continue";
    const finishText = (state.translations && state.translations.roadmap && state.translations.roadmap.stepDeck && state.translations.roadmap.stepDeck.finish) || "Finish";
    
    deckContainer.innerHTML = `
      <div class="step-card">
        <div class="step-card-header">
          <div class="step-card-meta">
            <span class="step-card-badge">${stepOfText}</span>
            <span class="step-card-tool">${tool.name}</span>
          </div>
          <div class="step-card-icon">${iconHTML}</div>
        </div>
        <h3 class="step-card-title">${titleText}</h3>
        <p class="step-card-desc">${descText}</p>
        
        <div class="step-card-actions">
          ${primaryActionBtnHTML}
        </div>
        
        <div class="step-card-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="progress-meta">
            <span>Progress</span>
            <span>${progressPercent}%</span>
          </div>
        </div>
        
        <div class="step-card-nav">
          <button class="btn btn-secondary btn-small" id="deck-btn-prev" ${activeIndex === 0 ? 'disabled' : ''}>${prevText}</button>
          <button class="btn btn-primary btn-small" id="deck-btn-next">${activeIndex === totalSteps - 1 ? finishText : nextText}</button>
        </div>
      </div>
    `;
    
    const prevBtn = document.getElementById('deck-btn-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.activeStepIndex > 0) {
          state.activeStepIndex--;
          renderRoadmap(optimalWorkflow, steps);
        }
      });
    }
    
    const nextBtn = document.getElementById('deck-btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.activeStepIndex < totalSteps - 1) {
          if (!isUserAuthenticated()) {
            const authOverlay = document.getElementById('auth-modal-overlay');
            if (authOverlay) authOverlay.style.display = 'flex';
            showToast("Please sign in to access the remaining steps of the roadmap.", "error");
            return;
          }
          state.activeStepIndex++;
          renderRoadmap(optimalWorkflow, steps);
        } else {
          showToast("Workflow completed successfully!");
        }
      });
    }
    
    const actionOpen = document.getElementById('deck-action-open');
    if (actionOpen) {
      actionOpen.addEventListener('click', () => {
        if (tool.id === "TOOL_001") {
          const template = getMasterPromptTemplate(state.goalText);
          navigator.clipboard.writeText(template);
          showToast("Master Prompt copied! Opening ChatGPT...");
          window.open('https://chatgpt.com', '_blank');
        } else {
          const toolUrl = tool.officialUrl || tool.link || tool.url || '#';
          window.open(toolUrl, '_blank');
        }
      });
    }
    
    const actionInspect = document.getElementById('deck-action-inspect');
    if (actionInspect) {
      actionInspect.addEventListener('click', () => {
        if (isEdu) {
          openDrawer(-1, true, tool);
        } else {
          openDrawer(originalIndex);
        }
      });
    }
  }

  if (!isUserAuthenticated()) {
    applyRoadmapLock();
  }
}

function renderPremiumToolCard(mapping) {
  const recContainer = document.getElementById('recommended-tool-container');
  const qsContainer = document.getElementById('quick-start-container');
  const deckContainer = document.getElementById('step-deck-container');
  
  if (qsContainer) qsContainer.innerHTML = '';
  if (deckContainer) deckContainer.innerHTML = '';
  
  if (!recContainer) return;

  const isLocked = !isUserAuthenticated();
  if (isLocked) {
    recContainer.innerHTML = `
      <div class="premium-tool-card">
        <div class="premium-tool-card-header">
          <div class="best-tool-badge">🔒 LOCKED PREMIUM TOOL</div>
          <h2 class="premium-tool-name">Locked Premium Tool</h2>
        </div>
        <div class="premium-tool-card-body">
          <div class="info-section">
            <h4 class="info-title">Why This Tool</h4>
            <p class="info-text">Please sign in or enter a valid coupon code to unlock premium tool recommendation reasons.</p>
          </div>
          <div class="info-section">
            <h4 class="info-title">Quick Start Guide</h4>
            <p class="info-text">Please sign in or enter a valid coupon code to unlock premium quick start execution guides.</p>
          </div>
          <div class="prompt-generation-section">
            <h4 class="info-title">Generate Master JSON Prompt</h4>
            <p class="prompt-desc-label">Please sign in or enter a valid coupon code to unlock the AI prompt generator.</p>
          </div>
        </div>
        <div class="premium-tool-card-footer">
          <button class="btn btn-primary btn-full-width" onclick="showPricingModal()">Unlock Premium Access</button>
        </div>
      </div>
    `;
    return;
  }
  
  const resolvedTaskKey = optionToMatrixKey[state.goalText] || state.goalText;
  
  // Use active translation if available
  let reasonText = mapping.reason;
  let quickGuideText = mapping.quick_guide;
  if (state.translations && state.translations.premiumTasks && state.translations.premiumTasks[resolvedTaskKey]) {
    const ptTrans = state.translations.premiumTasks[resolvedTaskKey];
    if (ptTrans.reason) reasonText = ptTrans.reason;
    if (ptTrans.quick_guide) quickGuideText = ptTrans.quick_guide;
  }
  
  let guideHTML = '';
  if (Array.isArray(quickGuideText)) {
    guideHTML = `
      <ol class="guide-steps-list">
        ${quickGuideText.map(step => `<li>${step}</li>`).join('')}
      </ol>
    `;
  } else {
    guideHTML = `<p class="info-text">${quickGuideText}</p>`;
  }
  
  let alternativesHTML = '';
  const altToolsLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.altTools) || "Alternative Tools";
  if (mapping.alternative_tools && mapping.alternative_tools.length > 0) {
    alternativesHTML = `
      <div class="info-section">
        <h4 class="info-title">${altToolsLabel}</h4>
        <div class="alternatives-wrapper">
          ${mapping.alternative_tools.map(alt => `
            <a href="${alt.link}" target="_blank" rel="noopener" class="alternative-pill">
              <span>${alt.name}</span> ↗
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  const bestToolLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.bestTool) || "⭐ BEST RECOMMENDED TOOL";
  const officialWebLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.officialWeb) || "Official Website:";
  const whyThisToolLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.whyThisTool) || "Why This Tool";
  const quickStartLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.quickStart) || "Quick Start Guide";
  const genPromptHeaderLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.genPromptHeader) || "Generate Master JSON Prompt";
  const genPromptDescLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.genPromptDesc) || "Describe your custom requirements below to generate the structured JSON payload:";
  const textareaPlaceholderLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.textareaPlaceholder) || "Enter your custom details here (e.g., build a portfolio web app with dark mode)...";
  const voiceBtnTitleLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.voiceBtnTitle) || "Speak your idea (Local Speech Recognition)";
  const listeningLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.listening) || "LISTENING...";
  const cancelLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.cancel) || "Cancel";
  const retryLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.retry) || "Retry";
  const genPromptBtnLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.genPromptBtn) || "✨ Generate JSON Prompt";
  const generatedPromptLabelText = (state.translations && state.translations.roadmap && state.translations.roadmap.generatedPromptLabel) || "GENERATED JSON PROMPT (READY TO COPY)";
  const copyBtnLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.copyBtn) || "📋 Copy JSON";
  const intentBadgeLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.intentBadge) || "⚡ INTENT UNDERSTOOD";
  const jsonBadgeLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.jsonBadge) || "✓ PRODUCTION-READY JSON";
  let openToolBtnLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.openToolBtn) || "🚀 Open Official Tool ({toolName})";
  openToolBtnLabel = openToolBtnLabel.replace("{toolName}", mapping.recommended_tool);

  recContainer.innerHTML = `
    <div class="premium-tool-card">
      <div class="premium-tool-card-header">
        <div class="best-tool-badge">${bestToolLabel}</div>
        <h2 class="premium-tool-name">${mapping.recommended_tool}</h2>
        <div class="premium-tool-link-wrapper">
          <span class="info-title" style="margin-bottom:0; letter-spacing:0.05em;">${officialWebLabel}</span>
          <a href="${mapping.official_link}" target="_blank" rel="noopener" class="premium-tool-link">${mapping.official_link} ↗</a>
        </div>
      </div>
      
      <div class="premium-tool-card-body">
        <div class="info-section">
          <h4 class="info-title">${whyThisToolLabel}</h4>
          <p class="info-text">${reasonText}</p>
        </div>
        
        <div class="info-section">
          <h4 class="info-title">${quickStartLabel}</h4>
          ${guideHTML}
        </div>
        
        ${alternativesHTML}
        
        <div class="prompt-generation-section">
          <h4 class="info-title">${genPromptHeaderLabel}</h4>
          <p class="prompt-desc-label">${genPromptDescLabel}</p>
          
          <div class="premium-prompt-wrapper">
            <textarea id="premium-prompt-desc" class="premium-prompt-textarea" style="padding-right: 48px;" placeholder="${textareaPlaceholderLabel}">${state.userIdeaDescription || ''}</textarea>
            <button id="btn-voice-input" class="voice-input-btn" title="${voiceBtnTitleLabel}">
              <svg class="mic-icon" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <div id="voice-recording-status" class="voice-status-panel" style="display: none;">
            <div class="voice-status-header">
              <span class="status-indicator-dot"></span>
              <span class="status-text">${listeningLabel}</span>
            </div>
            <div class="voice-waveform">
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
            </div>
            <div id="voice-live-transcript" class="voice-live-transcript">"Live transcript will appear here..."</div>
            <div class="voice-actions">
              <button id="btn-voice-cancel" class="btn btn-secondary btn-small" style="padding: 4px 8px; font-size: 0.75rem;">${cancelLabel}</button>
              <button id="btn-voice-retry" class="btn btn-secondary btn-small" style="padding: 4px 8px; font-size: 0.75rem; display: none;">${retryLabel}</button>
            </div>
          </div>
          
          <div class="prompt-actions-row">
            <button id="btn-generate-premium-json" class="btn btn-primary">${genPromptBtnLabel}</button>
          </div>

          <div id="premium-json-output-wrapper" class="premium-json-output-wrapper" style="display: ${state.generatedJSONPrompt ? 'block' : 'none'};">
            <div class="json-header-row" style="flex-direction: column; align-items: flex-start; gap: 6px;">
              <div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
                <span class="json-box-label">${generatedPromptLabelText}</span>
                <button id="btn-copy-premium-json" class="btn btn-secondary btn-small" style="padding: 4px 8px; font-size: 0.75rem;">${copyBtnLabel}</button>
              </div>
              <div class="json-header-indicators">
                <span class="indicator-badge badge-intent">${intentBadgeLabel}</span>
                <span class="indicator-badge badge-json-ready">${jsonBadgeLabel}</span>
              </div>
            </div>
            <pre class="premium-json-display"><code>${escapeHTML(state.generatedJSONPrompt || '')}</code></pre>
          </div>
        </div>
      </div>

      <div class="premium-tool-card-footer">
        <a href="${mapping.official_link}" target="_blank" rel="noopener" class="btn btn-primary btn-full-width" id="btn-open-premium-tool" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>${openToolBtnLabel}</span>
        </a>
      </div>
    </div>
  `;
  
  // Bind Generate Button
  const genBtn = document.getElementById('btn-generate-premium-json');
  if (genBtn) {
    genBtn.addEventListener('click', async () => {
      if (!isUserAuthenticated()) {
        const authOverlay = document.getElementById('auth-modal-overlay');
        if (authOverlay) authOverlay.style.display = 'flex';
        showToast("Authentication required. Please sign in to access premium prompts.", "error");
        return;
      }
      if (!checkPromptLimit()) return;
      
      const textarea = document.getElementById('premium-prompt-desc');
      const desc = textarea ? textarea.value.trim() : '';
      state.userIdeaDescription = desc;
      
      const originalHTML = genBtn.innerHTML;
      genBtn.disabled = true;
      
      const genPromptLoadingText = (state.translations && state.translations.roadmap && state.translations.roadmap.genPromptLoading) || "⏳ Generating JSON via Llama...";
      genBtn.innerHTML = `<span>${genPromptLoadingText}</span>`;
      
      try {
        const taskNameMap = {
          "Generating Video": "Generate AI Video",
          "Generating Images": "Generate AI Images",
          "Designing": "Create Digital Designs",
          "Coding": "Build Software",
          "Building Apps": "Build Android Application",
          "Brand Building": "Build Brand",
          "Personal AI Building": "Build Personal AI Assistant",
          "Music Making": "Create Music",
          "Voice Over Generation": "Generate Voice Over",
          "Hardware Building": "Design Hardware",
          "Tips to Earn Money": "Monetize AI Skills"
        };
        const backendTaskName = taskNameMap[state.goalText] || state.goalText;

        const headers = {
          'Content-Type': 'application/json'
        };
        if (state.user && state.user.token) {
          headers['Authorization'] = `Bearer ${state.user.token}`;
        }

        const response = await fetch('/api/prompt/generate-aios-prompt', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            taskName: backendTaskName,
            userInput: desc || "A creative project concept"
          })
        });
        
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED_ERROR');
        }
        
        if (!response.ok) {
          throw new Error('Server returned error status: ' + response.status);
        }
        
        const data = await response.json();
        if (data.success && data.prompt) {
          const jsonStr = JSON.stringify(data.prompt, null, 2);
          state.generatedJSONPrompt = jsonStr;
          
          incrementPromptLimit();
          const outputWrapper = document.getElementById('premium-json-output-wrapper');
          if (outputWrapper) {
            outputWrapper.style.display = 'block';
            const codeEl = outputWrapper.querySelector('pre code');
            if (codeEl) codeEl.textContent = jsonStr;
          }
          showToast("JSON Prompt generated via Llama 3.3 successfully!");
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        if (err.message === 'UNAUTHORIZED_ERROR') {
          showToast("Authentication required. Please sign in to access premium prompts.", "error");
          const authOverlay = document.getElementById('auth-modal-overlay');
          if (authOverlay) authOverlay.style.display = 'flex';
          return;
        }
        
        console.warn('[Prompt Generator API Fail] Falling back to local prompt engine:', err.message);
        
        // Local fallback
        const jsonStr = generateLocalJSONPrompt(state.goalText, desc);
        state.generatedJSONPrompt = jsonStr;
        
        incrementPromptLimit();
        const outputWrapper = document.getElementById('premium-json-output-wrapper');
        if (outputWrapper) {
          outputWrapper.style.display = 'block';
          const codeEl = outputWrapper.querySelector('pre code');
          if (codeEl) codeEl.textContent = jsonStr;
        }
        showToast("Generated static JSON prompt (Offline Fallback)");
      } finally {
        genBtn.disabled = false;
        genBtn.innerHTML = originalHTML;
      }
    });
  }
  
  // Bind Copy Button
  const copyBtn = document.getElementById('btn-copy-premium-json');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const promptToCopy = state.generatedJSONPrompt || generateLocalJSONPrompt(state.goalText, state.userIdeaDescription || '');
      navigator.clipboard.writeText(promptToCopy).then(() => {
        showToast("Copied JSON prompt to clipboard!");
      }).catch(err => {
        console.error("Failed to copy JSON: ", err);
      });
    });
  }
  
  // Bind Voice Input
  const micBtn = document.getElementById('btn-voice-input');
  const statusPanel = document.getElementById('voice-recording-status');
  const liveTranscript = document.getElementById('voice-live-transcript');
  const cancelBtn = document.getElementById('btn-voice-cancel');
  const retryBtn = document.getElementById('btn-voice-retry');
  const promptTextArea = document.getElementById('premium-prompt-desc');
  
  let recognition = null;
  let isRecording = false;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  function initSpeechRecognition() {
    if (!SpeechRecognition) {
      if (micBtn) micBtn.style.display = 'none'; // Hide if not supported
      return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Set language locale dynamically based on target language select dropdown
    const langSelect = document.getElementById('control-lang-select');
    const selectedLang = langSelect ? langSelect.value : 'Hinglish';
    if (selectedLang === 'English') {
      recognition.lang = 'en-US';
    } else if (selectedLang === 'Hindi') {
      recognition.lang = 'hi-IN';
    } else {
      // Hinglish / Mixed
      recognition.lang = 'hi-IN'; // best dynamic parser
    }
    
    recognition.onstart = () => {
      isRecording = true;
      if (micBtn) micBtn.classList.add('recording');
      if (statusPanel) {
        statusPanel.style.display = 'flex';
        statusPanel.classList.add('recording');
        const headerText = statusPanel.querySelector('.status-text');
        
        const listeningText = (state.translations && state.translations.roadmap && state.translations.roadmap.listening) || "LISTENING...";
        if (headerText) headerText.textContent = listeningText;
      }
      
      const speakNowText = (state.translations && state.translations.roadmap && state.translations.roadmap.speakNow) || "Speak your idea now...";
      if (liveTranscript) liveTranscript.textContent = '"' + speakNowText + '"';
      if (cancelBtn) cancelBtn.style.display = 'inline-block';
      if (retryBtn) retryBtn.style.display = 'none';
    };
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const combined = finalTranscript || interimTranscript;
      if (liveTranscript && combined) {
        liveTranscript.textContent = `"${combined}"`;
      }
      
      // Update text area on final output
      if (finalTranscript && promptTextArea) {
        const prevVal = promptTextArea.value.trim();
        promptTextArea.value = prevVal ? `${prevVal} ${finalTranscript}` : finalTranscript;
        state.userIdeaDescription = promptTextArea.value;
      }
    };
    
    recognition.onerror = (event) => {
      console.error('[Web Speech Error]:', event.error);
      isRecording = false;
      if (micBtn) micBtn.classList.remove('recording');
      if (statusPanel) {
        statusPanel.classList.remove('recording');
        const headerText = statusPanel.querySelector('.status-text');
        if (headerText) headerText.textContent = `ERROR: ${event.error.toUpperCase()}`;
      }
      if (cancelBtn) cancelBtn.style.display = 'none';
      if (retryBtn) retryBtn.style.display = 'inline-block';
    };
    
    recognition.onend = () => {
      isRecording = false;
      if (micBtn) micBtn.classList.remove('recording');
      if (statusPanel) {
        statusPanel.classList.remove('recording');
        const headerText = statusPanel.querySelector('.status-text');
        
        const stoppedText = (state.translations && state.translations.stopped) || "STOPPED";
        if (headerText) headerText.textContent = stoppedText;
      }
      if (cancelBtn) cancelBtn.style.display = 'none';
      if (retryBtn) retryBtn.style.display = 'inline-block';
    };
  }
  
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (!recognition) {
        initSpeechRecognition();
      }
      
      if (isRecording) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          initSpeechRecognition();
          recognition.start();
        }
      }
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (recognition) {
        recognition.abort();
      }
      if (statusPanel) {
        statusPanel.style.display = 'none';
      }
      if (liveTranscript) {
        liveTranscript.textContent = '';
      }
      showToast("Voice recording canceled.");
    });
  }
  
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (!recognition) {
        initSpeechRecognition();
      }
      try {
        recognition.start();
      } catch (e) {
        initSpeechRecognition();
        recognition.start();
      }
    });
  }
}

window.resetWizard = function() {
  const wizardOverlay = document.getElementById('wizard-overlay');
  const mainWrapper = document.getElementById('main-content-wrapper');
  
  if (mainWrapper) mainWrapper.classList.remove('active');
  if (wizardOverlay) {
    wizardOverlay.style.opacity = '1';
    wizardOverlay.style.visibility = 'visible';
  }
  document.body.style.overflow = 'hidden';
  
  window.scrollTo(0, 0);
};

// ==========================================================================
// Phase 2: Favorites & Bookmarking Management
// ==========================================================================

function getFavorites() {
  try {
    const favs = localStorage.getItem('ai-os-favorites');
    return favs ? JSON.parse(favs) : [];
  } catch (e) {
    return [];
  }
}

function toggleFavorite(toolId) {
  let favs = getFavorites();
  const idx = favs.indexOf(toolId);
  let isFav = false;
  if (idx > -1) {
    favs.splice(idx, 1);
  } else {
    favs.push(toolId);
    isFav = true;
  }
  localStorage.setItem('ai-os-favorites', JSON.stringify(favs));
  return isFav;
}

function isFavorite(toolId) {
  return getFavorites().includes(toolId);
}

// ==========================================================================
// Phase 2: Tool Comparison System
// ==========================================================================

function toggleComparison(toolId) {
  const index = state.comparisonList.indexOf(toolId);
  if (index > -1) {
    state.comparisonList.splice(index, 1);
    showToast("Removed from comparison");
  } else {
    if (state.comparisonList.length >= 3) {
      showToast("Cannot compare more than 3 tools simultaneously.");
      return;
    }
    state.comparisonList.push(toolId);
    showToast("Added to comparison");
  }
  updateComparisonUI();
}

function updateComparisonUI() {
  const count = state.comparisonList.length;
  if (compareCount) {
    compareCount.textContent = count;
  }
  
  if (compareStatusWrap) {
    if (count > 0) {
      compareStatusWrap.style.display = 'flex';
    } else {
      compareStatusWrap.style.display = 'none';
    }
  }

  const compareTextLabel = document.getElementById('compare-text-label');
  if (compareTextLabel) {
    const selectedLabel = (state.translations && state.translations.library && state.translations.library.selected) || "SELECTED";
    compareTextLabel.innerHTML = `<span id="compare-count">${count}</span>/3 ${selectedLabel}`;
  }
  
  // Update all compare buttons across the DOM
  document.querySelectorAll('.compare-check').forEach(btn => {
    const btnId = btn.getAttribute('data-id');
    const isCompared = state.comparisonList.includes(btnId);
    btn.classList.toggle('active', isCompared);
  });
}

function openComparisonOverlay() {
  if (state.comparisonList.length === 0) return;
  
  renderComparisonTable();
  
  if (comparisonOverlay) {
    comparisonOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeComparisonOverlay() {
  if (comparisonOverlay) {
    comparisonOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function renderComparisonTable() {
  if (!comparisonTable) return;
  
  const selectedTools = state.comparisonList.map(id => toolsData.find(t => t.id === id)).filter(Boolean);
  
  if (selectedTools.length === 0) {
    comparisonTable.innerHTML = '<tr><td style="text-align: center; padding: 40px; color: var(--text-secondary);">No tools selected for comparison.</td></tr>';
    return;
  }
  
  let html = '';
  
  // Row 1: Header (Title, Logo, Remove button)
  html += `<tr><th>Tool</th>`;
  selectedTools.forEach(tool => {
    html += `
      <td>
        <div class="compare-card-header">
          <div class="compare-logo">${tool.icon}</div>
          <div class="compare-title">${tool.title}</div>
          <button class="compare-remove-btn" data-id="${tool.id}">Remove</button>
        </div>
      </td>
    `;
  });
  html += `</tr>`;
  
  // Row 2: Pricing
  html += `<tr><th>Pricing</th>`;
  selectedTools.forEach(tool => {
    html += `<td><strong>${(tool.pricing || `₹${tool.cost}`).replace('$', '₹')}</strong><br><small>${tool.freeTier ? 'Free Tier Available' : 'Premium Only'}</small></td>`;
  });
  html += `</tr>`;
  
  // Row 3: Industry Sectors
  html += `<tr><th>Sectors</th>`;
  selectedTools.forEach(tool => {
    const sectors = tool.industries ? tool.industries.join(', ') : (tool.industry ? (Array.isArray(tool.industry) ? tool.industry.join(', ') : tool.industry) : 'N/A');
    html += `<td>${sectors}</td>`;
  });
  html += `</tr>`;
  
  // Row 4: Difficulty Level
  html += `<tr><th>Difficulty</th>`;
  selectedTools.forEach(tool => {
    html += `<td>${tool.difficultyLevel || 'Intermediate'}</td>`;
  });
  html += `</tr>`;
  
  // Row 5: Recommended For
  html += `<tr><th>Recommended For</th>`;
  selectedTools.forEach(tool => {
    html += `<td>${tool.recommendedFor || 'N/A'}</td>`;
  });
  html += `</tr>`;
  
  // Row 6: Description
  html += `<tr><th>Description</th>`;
  selectedTools.forEach(tool => {
    html += `<td>${tool.description || tool.desc}</td>`;
  });
  html += `</tr>`;
  
  // Row 7: Task Tags
  html += `<tr><th>Task Tags</th>`;
  selectedTools.forEach(tool => {
    const tagsHTML = tool.taskTags ? tool.taskTags.map(tag => `<span class="card-badge" style="margin-right: 4px; margin-bottom: 4px; display: inline-block;">${tag}</span>`).join('') : 'None';
    html += `<td>${tagsHTML}</td>`;
  });
  html += `</tr>`;
  
  // Row 8: Official Website Link
  html += `<tr><th>Official Site</th>`;
  selectedTools.forEach(tool => {
    html += `
      <td>
        <a href="${tool.officialUrl || tool.link}" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.8rem; width: 100%; justify-content: center; display: inline-flex; align-items: center; gap: 8px;">
          <span>Visit Website</span>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-left: 6px;">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
      </td>
    `;
  });
  html += `</tr>`;
  
  comparisonTable.innerHTML = html;
}

// ==========================================================================
// Phase 2: Unified Card Render Template
// ==========================================================================

function createCardHTML(tool, originalIndex, isFav, isCompared, isTimeline = false, stepName = '', stepIndex = 0, effectiveCost = null, effectiveMode = '') {
  const isLocked = !isUserAuthenticated() || (state.user && state.user.plan_type === 'Basic' && isTimeline && stepIndex > 10);
  if (isLocked) {
    return `
      <div class="timeline-card-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px;">
        <div class="card-icon" style="background: rgba(255,255,255,0.05); color: #777; width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">🔒</div>
        <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
          <span class="timeline-step-badge">STEP ${stepIndex} // LOCKED</span>
          <span class="card-number" style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.12em; color: var(--text-secondary); text-transform: uppercase;">
            ${tool.id} // PREMIUM LOCK
          </span>
        </div>
      </div>
      <div class="timeline-card-body" style="padding: 24px;">
        <h3 class="card-title" style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">Locked Premium Node</h3>
        <p class="card-desc" style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary); margin-bottom: 16px;">This step is locked. Please upgrade to Premium or log in to unlock this node.</p>
        <button class="btn btn-primary" onclick="showPricingModal()" style="width: 100%; justify-content: center;">Unlock Premium Access</button>
      </div>
    `;
  }

  let costStr = '';
  if (effectiveCost !== null) {
    costStr = effectiveCost === 0 ? 'FREE TIER' : `₹${effectiveCost} / mo`;
  } else {
    costStr = tool.cost === 0 ? 'FREE TIER' : `₹${tool.cost} / mo`;
  }

  const isEdu = tool.id && tool.id.startsWith("EDU_");
  const lang = getActiveLanguage();
  const labels = translationDB[lang] || translationDB["Hinglish"];
  
  let titleText = tool.title;
  let descText = tool.desc || tool.description;
  let difficulty = tool.difficultyLevel || "Intermediate";
  let time = "30 mins";
  let prerequisite = "None";
  let visualFlow = "";
  let examples = [];
  let keyConcepts = [];
  let commonMistakes = [];
  let applications = [];
  let reading = [];
  let exercises = "";
  let outcome = "";
  let checkpoint = null;
  let starter = "";
  let advanced = "";
  let pro = "";
  let eduData = {};

  if (isEdu) {
    titleText = tool.title ? (tool.title[lang] || tool.title["English"]) : "";
    descText = tool.summary ? (tool.summary[lang] || tool.summary["English"]) : "";
    difficulty = tool.difficulty || "Beginner";
    time = tool.time || "1 min";
    prerequisite = tool.prerequisite ? (tool.prerequisite[lang] || tool.prerequisite["English"]) : "None";
    
    visualFlow = tool.visualFlow || "";
    examples = tool.examples ? (tool.examples[lang] || tool.examples["English"] || []) : [];
    keyConcepts = tool.keyConcepts ? (tool.keyConcepts[lang] || tool.keyConcepts["English"] || []) : [];
    commonMistakes = tool.commonMistakes ? (tool.commonMistakes[lang] || tool.commonMistakes["English"] || []) : [];
    applications = tool.applications ? (tool.applications[lang] || tool.applications["English"] || []) : [];
    reading = tool.reading ? (tool.reading[lang] || tool.reading["English"] || []) : [];
    exercises = tool.exercises ? (tool.exercises[lang] || tool.exercises["English"] || "") : "";
    outcome = tool.outcome ? (tool.outcome[lang] || tool.outcome["English"] || "") : "";
    checkpoint = tool.checkpoint;
    
    starter = tool.starterPrompt || "";
    advanced = tool.advancedPrompt || "";
    pro = tool.proPrompt || "";
  } else {
    eduData = getToolEducationalData(tool, lang, stepName);
    const promptDetails = generatePrompts(tool.name, state.goalText || '', lang);
    
    const mappedStepKey = resolveGuideKey(stepName, tool.name);
    
    if (appGuidesData[mappedStepKey]) {
      const gd = appGuidesData[mappedStepKey];
      titleText = gd.title[lang] || gd.title["English"];
      descText = gd.explanation[lang] || gd.explanation["English"];
    } else {
      titleText = tool.title;
      descText = tool.desc || tool.description;
    }
    
    difficulty = tool.difficultyLevel || "Intermediate";
    time = promptDetails.time || "30 mins";
    prerequisite = eduData.prerequisite;
    
    visualFlow = eduData.visualFlow;
    examples = eduData.examples;
    keyConcepts = eduData.keyConcepts;
    commonMistakes = eduData.commonMistakes;
    applications = eduData.applications;
    reading = eduData.reading;
    exercises = eduData.exercises;
    outcome = eduData.outcome;
    checkpoint = eduData.checkpoint;
    
    starter = promptDetails.starter;
    advanced = promptDetails.advanced;
    pro = promptDetails.pro;
  }

  const badgeOrNumber = isTimeline 
    ? `
      <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
        <span class="timeline-step-badge">STEP ${stepIndex} // ${isEdu ? 'EDUCATIONAL' : stepName.toUpperCase()}</span>
        <span class="card-number" style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.12em; color: var(--text-secondary); text-transform: uppercase;">
          ${tool.id} // ${isEdu ? 'LEARNING NODE' : costStr} ${effectiveMode ? '(' + effectiveMode + ')' : ''}
        </span>
      </div>
      `
    : `
      <div class="card-badges">
        <span class="card-badge price-badge">${tool.cost === 0 ? 'FREE' : `₹${tool.cost}`}</span>
        ${tool.industries ? tool.industries.map(ind => `<span class="card-badge industry-badge">${ind}</span>`).join('') : ''}
      </div>
    `;

  let detailsHTML = '';
  if (isTimeline) {
    if (isEdu) {
      // Clean educational roadmap timeline representation for "Exploring AI"
      const summaryVal = tool.summary[lang] || tool.summary["English"] || "";
      const explanationVal = tool.explanation[lang] || tool.explanation["English"] || "";
      const examplesList = tool.examples[lang] || tool.examples["English"] || [];
      const keyPointsList = tool.keyConcepts[lang] || tool.keyConcepts["English"] || [];
      const mythRealityVal = tool.myth_vs_reality[lang] || tool.myth_vs_reality["English"] || {};
      const rememberVal = tool.remember[lang] || tool.remember["English"] || "";
      
      const labelsHeader = {
        English: {
          examples: "Real-Life Examples",
          keyPoints: "Key Points",
          myth: "Myth",
          reality: "Reality",
          remember: "Remember",
          continue: "Continue to Next Lesson",
          difficulty: "Level",
          time: "Read Time"
        },
        Hindi: {
          examples: "वास्तविक उदाहरण",
          keyPoints: "मुख्य बिंदु",
          myth: "भ्रम",
          reality: "सच्चाई",
          remember: "याद रखें",
          continue: "अगले पाठ पर जाएं",
          difficulty: "स्तर",
          time: "पढ़ने का समय"
        },
        Hinglish: {
          examples: "Real-Life Examples",
          keyPoints: "Key Points",
          myth: "Myth",
          reality: "Reality",
          remember: "Remember",
          continue: "Continue to Next Lesson",
          difficulty: "Level",
          time: "Read Time"
        }
      };
      
      const cardLabels = labelsHeader[lang] || labelsHeader["Hinglish"];

      let quizHTML = '';
      if (checkpoint) {
        const checkQuestion = checkpoint.question[lang] || checkpoint.question["English"];
        const checkOptions = checkpoint.options[lang] || checkpoint.options["English"] || [];
        
        quizHTML = `
          <div class="edu-quiz-box" id="quiz-${tool.id}" style="margin-top: 20px; padding: 14px; border-radius: 10px; border: 1px solid var(--border-color); background: rgba(var(--accent-color), 0.02);">
            <div class="edu-quiz-title" style="font-weight: 700; font-size: 0.85rem; margin-bottom: 8px; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
              <span>📝</span> <span>Quick Checkpoint Quiz:</span>
            </div>
            <div class="edu-quiz-question" style="font-size: 0.85rem; margin-bottom: 12px; line-height: 1.4; color: var(--text-primary); font-weight: 600;">${checkQuestion}</div>
            <div class="edu-quiz-options" style="display: flex; flex-direction: column; gap: 8px;">
              ${checkOptions.map((opt, oIdx) => `
                <button class="edu-quiz-option-btn" data-card-id="${tool.id}" data-opt-idx="${oIdx}" data-correct-idx="${checkpoint.correct}" style="width: 100%; text-align: left; padding: 10px 12px; font-size: 0.8rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--input-bg); color: var(--text-primary); cursor: pointer; transition: all 0.2s;">
                  ${opt}
                </button>
              `).join('')}
            </div>
            <div class="edu-quiz-feedback" id="feedback-${tool.id}" style="margin-top: 12px; font-size: 0.8rem; line-height: 1.4; display: none;"></div>
          </div>
        `;
      }

      detailsHTML = `
        <div class="edu-card-container" style="text-align: left; display: flex; flex-direction: column; gap: 16px;">
          <!-- Difficulty & Time Badges -->
          <div class="edu-card-header" style="display: flex; gap: 8px; font-family: var(--font-mono); font-size: 0.75rem;">
            <span class="edu-badge-difficulty ${tool.difficulty.toLowerCase()}" style="padding: 4px 10px; border-radius: 12px; font-weight: 600; text-transform: uppercase;">
              ${tool.difficulty}
            </span>
            <span class="edu-badge-time" style="color: var(--text-secondary); background: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 12px; border: 1px solid var(--border-color);">
              ⏱ ${tool.time}
            </span>
          </div>

          <!-- One-Line Summary Box -->
          <div class="edu-summary-box" style="display: flex; gap: 12px; background: rgba(var(--accent-color), 0.08); border-left: 4px solid var(--accent-color); padding: 12px 16px; border-radius: 8px; align-items: center;">
            <span style="font-size: 1.25rem;">💡</span>
            <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0; line-height: 1.4;">${summaryVal}</div>
          </div>

          <!-- Simple Explanation -->
          <div class="edu-explanation-section">
            <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">${explanationVal}</p>
          </div>

          <!-- Examples Grid -->
          <div style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.15em; color: var(--text-primary); text-transform: uppercase; margin-top: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-weight: 700;">
            🌟 ${cardLabels.examples}
          </div>
          <div class="edu-examples-grid" style="display: flex; flex-direction: column; gap: 6px;">
            ${examplesList.map(ex => `
              <div class="edu-example-item" style="display: flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 8px;">
                <span style="font-size: 1rem;">🚀</span>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${ex}</span>
              </div>
            `).join('')}
          </div>

          <!-- Key Points -->
          <div style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.15em; color: var(--text-primary); text-transform: uppercase; margin-top: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-weight: 700;">
            📌 ${cardLabels.keyPoints}
          </div>
          <ul class="edu-keypoints-list" style="padding-left: 20px; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin: 0;">
            ${keyPointsList.map(c => `<li>${c}</li>`).join('')}
          </ul>

          <!-- Myth vs Reality Box -->
          <div class="edu-myth-reality-box" style="padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02);">
            <div class="edu-myth" style="margin-bottom: 8px; color: #ff6b6b; font-size: 0.85rem;">
              <strong>❌ ${cardLabels.myth}:</strong> ${mythRealityVal.myth || ""}
            </div>
            <div class="edu-reality" style="color: #2ecc71; font-size: 0.85rem;">
              <strong>✅ ${cardLabels.reality}:</strong> ${mythRealityVal.reality || ""}
            </div>
          </div>

          <!-- Remember Takeaway Box -->
          <div class="edu-remember-box" style="padding: 12px; border-radius: 8px; border: 1px dashed rgba(230, 126, 34, 0.4); background: rgba(230, 126, 34, 0.05); color: var(--text-primary);">
            <div style="font-weight: 700; color: #e67e22; font-size: 0.85rem; margin-bottom: 4px;">🧠 ${cardLabels.remember}:</div>
            <p style="font-size: 0.85rem; margin: 0; font-style: italic; line-height: 1.4;">${rememberVal}</p>
          </div>

          <!-- Quiz -->
          ${quizHTML}

          <!-- Next Lesson Button -->
          <div class="edu-card-footer" style="margin-top: 12px;">
            <button class="btn btn-primary next-lesson-btn" data-next-idx="${stepIndex}" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>${cardLabels.continue}</span>
            </button>
          </div>
        </div>
      `;
    } else {
      // Standard Roadmap Timeline Node representation (Strictly Practical Execution)
      const whyUseThisTool = tool.desc || tool.description;
      
      const expectedOutputVal = eduData.outcome || "Operational outputs matching project objectives.";
      const expLevel = state.selectedExperience || 'Intermediate';

      // 1. Determine "How To Use It" text based on experience levels
      let howToUseItHTML = '';
      const steps = tool.instruction || ["Navigate to the tool dashboard.", "Login using your account credentials.", "Input your project details.", "Download or export the final results."];

      if (tool.id === "TOOL_DOCS") {
        if (expLevel === "Beginner") {
          howToUseItHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin: 4px 0;">Open Google Docs, create a new document, and write down all your raw ideas, scripts, and requirements in detail to create your raw input source file.</p>`;
        } else if (expLevel === "Advanced") {
          howToUseItHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin: 4px 0; font-style: italic;">Concise: Boot a Google Doc and outline the core ideas/scripts.</p>`;
        } else {
          howToUseItHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin: 4px 0;">Use Google Docs to outline project concepts, scripts, and specifications ready for copywriting and prompt transformation.</p>`;
        }
      } else if (tool.id === "TOOL_001") {
        if (expLevel === "Beginner") {
          howToUseItHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin: 4px 0;">Copy the Universal Master Prompt below. Paste it into ChatGPT, and replace the bracketed placeholder with your Google Docs outline to get structured system specs.</p>`;
        } else if (expLevel === "Advanced") {
          howToUseItHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin: 4px 0; font-style: italic;">Concise: Run your Google Docs specs through ChatGPT with the Universal Master Prompt.</p>`;
        } else {
          howToUseItHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin: 4px 0;">Paste your raw notes from Google Docs into ChatGPT using the Universal Master Prompt to output detailed configuration variables and prompts.</p>`;
        }
      } else {
        if (expLevel === "Beginner") {
          howToUseItHTML = `<ol style="padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin: 6px 0;">
            ${steps.map(step => `<li>${step}</li>`).join('')}
          </ol>`;
        } else if (expLevel === "Advanced") {
          const conciseStep = steps[0] || "Compile and run configurations in the tool interface.";
          howToUseItHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; font-style: italic; margin: 4px 0;">Concise: ${conciseStep} Execute configurations and export outputs.</p>`;
        } else {
          const sliceSteps = steps.slice(0, 3);
          howToUseItHTML = `<ol style="padding-left: 20px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin: 6px 0;">
            ${sliceSteps.map(step => `<li>${step}</li>`).join('')}
          </ol>`;
        }
      }

      // 2. Generate Universal Master Prompt block (except Google Docs)
      let promptHTML = '';
      if (tool.id !== "TOOL_DOCS") {
        const universalPrompt = getUniversalPromptForTool(tool.name, tool.category, tool.taskTags);
        const copyPromptText = labels.copyBtn || "Copy Prompt";
        const universalMasterPromptLabel = labels.masterPrompt || "Universal Master Prompt";
        
        promptHTML = `
          <div class="card-detail-item" style="margin-top: 14px; border-top: 1px solid var(--border-color); padding-top: 12px;">
            <div class="prompt-container">
              <div class="prompt-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="card-detail-label" style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0; text-transform: uppercase;">${universalMasterPromptLabel}</span>
                <button class="prompt-copy-btn" data-text="${escapeHTML(universalPrompt)}" style="padding: 4px 8px; font-size: 0.7rem; border-radius: 4px; background: var(--input-bg); border: 1px solid var(--border-color); color: var(--text-primary); cursor: pointer; transition: all 0.2s;">${copyPromptText}</button>
              </div>
              <pre class="prompt-box" style="font-family: var(--font-mono); font-size: 0.75rem; background: rgba(var(--accent-color), 0.03); padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); overflow-x: auto; color: var(--text-primary); margin: 6px 0; max-height: 150px; overflow-y: auto; white-space: pre-wrap; text-align: left;">${escapeHTML(universalPrompt)}</pre>
            </div>
          </div>
        `;
      }

      const whyThisToolLabel = labels.whyThisTool || "Why Use This Tool";
      const howToUseLabel = (state.translations && state.translations.roadmap && state.translations.roadmap.howToUse) || "How To Use It";
      const expectedOutputLabel = labels.expectedOutput || "Expected Output";

      detailsHTML = `
        <div class="card-details-section" style="text-align: left;">
          <div class="card-detail-item">
            <span class="card-detail-label">${whyThisToolLabel}</span>
            <span class="card-detail-value" style="font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary);">${whyUseThisTool}</span>
          </div>
          <div class="card-detail-item" style="margin-top: 12px;">
            <span class="card-detail-label">${howToUseLabel}</span>
            <div class="card-detail-value">${howToUseItHTML}</div>
          </div>
          <div class="card-detail-item" style="margin-top: 12px;">
            <span class="card-detail-label">${expectedOutputLabel}</span>
            <span class="card-detail-value" style="font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary);">${expectedOutputVal}</span>
          </div>
          ${promptHTML}
        </div>
      `;
    }
  }

  const addFavTitle = (state.translations && state.translations.addFav) || "Add to Favorites";
  const compareTitle = (state.translations && state.translations.compare) || "Compare";

  const actionButtonsHTML = isEdu 
    ? '' 
    : `
    <div class="card-fav-compare-actions">
      <button class="card-action-btn fav-star ${isFav ? 'active' : ''}" title="${addFavTitle}" data-id="${tool.id}">
        ★
      </button>
      <button class="card-action-btn compare-check ${isCompared ? 'active' : ''}" title="${compareTitle}" data-id="${tool.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    </div>
    `;

  const inspectEngineLabel = (state.translations && state.translations.inspectEngine) || "Inspect Engine";

  const footerHTML = isEdu
    ? ''
    : `
    <div class="card-footer">
      <button class="btn btn-secondary inspect-btn">${inspectEngineLabel}</button>
      <a href="${tool.officialUrl || tool.link || '#'}" target="_blank" rel="noopener" class="btn btn-icon" aria-label="External Link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </a>
    </div>
    `;

  return `
    <div class="card-glow"></div>
    ${actionButtonsHTML}
    <div class="card-header">
      <div class="card-icon" style="${isEdu ? 'background: #000; color: #fff; font-family: var(--font-mono); font-size: 0.75rem; font-weight:700;' : ''}">
        ${isEdu ? 'EDU' : tool.icon}
      </div>
      ${badgeOrNumber}
    </div>
    <h2 class="card-title">${titleText}</h2>
    ${!isTimeline ? `<p class="card-desc">${descText}</p>` : ''}
    ${detailsHTML}
    ${footerHTML}
  `;
}

// ==========================================================================
// 8. EXPLORE LIBRARY DIRECTORY
// ==========================================================================

let selectedLibrarySector = 'all';
let librarySearchQuery = '';

function initLibrarySection() {
  if (!libraryGrid) return;
  
  // Search input change handler
  if (librarySearch) {
    librarySearch.addEventListener('input', (e) => {
      librarySearchQuery = e.target.value.toLowerCase();
      renderLibraryGrid();
    });
  }
  
  // Render search filter chips dynamically based on mapped tools
  if (libraryFilterChipsContainer) {
    const allSectorsText = (state.translations && state.translations.library && state.translations.library.allSectors) || "All Sectors";
    libraryFilterChipsContainer.innerHTML = `<button class="filter-chip active" data-chip="all">${allSectorsText}</button>`;
    
    industriesList.forEach(sector => {
      const count = toolsData.filter(t => t.industries && t.industries.includes(sector)).length;
      if (count > 0) {
        const chip = document.createElement('button');
        chip.className = 'filter-chip';
        chip.setAttribute('data-chip', sector);
        
        const translatedSector = (state.translations && state.translations.sectors && state.translations.sectors[sector]) || sector;
        chip.textContent = translatedSector;
        libraryFilterChipsContainer.appendChild(chip);
      }
    });
    
    // Bind click events on chips
    libraryFilterChipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (chip) {
        const chips = libraryFilterChipsContainer.querySelectorAll('.filter-chip');
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedLibrarySector = chip.getAttribute('data-chip');
        renderLibraryGrid();
      }
    });
  }
  
  const btnLibShowMore = document.getElementById('btn-library-show-more');
  if (btnLibShowMore) {
    btnLibShowMore.addEventListener('click', () => {
      const wrapper = document.getElementById('library-grid-wrapper');
      if (wrapper) wrapper.classList.remove('collapsed');
    });
  }
  
  renderLibraryGrid();
}

function renderLibraryGrid() {
  if (!libraryGrid) return;
  libraryGrid.innerHTML = '';
  
  // 1. Filter toolsData dynamically matching queries, sector filters, and favorites
  let filtered = toolsData.filter(tool => {
    const matchSearch = tool.title.toLowerCase().includes(librarySearchQuery) || 
                        tool.desc.toLowerCase().includes(librarySearchQuery) || 
                        (tool.industries && tool.industries.some(ind => ind.toLowerCase().includes(librarySearchQuery))) ||
                        (tool.taskTags && tool.taskTags.some(tag => tag.toLowerCase().includes(librarySearchQuery)));
    
    const matchSector = selectedLibrarySector === 'all' || 
                        (tool.industries && tool.industries.includes(selectedLibrarySector));
                        
    const matchFavorites = !state.showFavoritesOnly || isFavorite(tool.id);
                        
    return matchSearch && matchSector && matchFavorites;
  });
  
  // 2. Sort the filtered tools
  if (state.sortOption === 'name-asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (state.sortOption === 'name-desc') {
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  } else if (state.sortOption === 'price-low') {
    filtered.sort((a, b) => a.cost - b.cost);
  } else if (state.sortOption === 'difficulty') {
    const diffMap = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
    filtered.sort((a, b) => (diffMap[a.difficultyLevel] || 0) - (diffMap[b.difficultyLevel] || 0));
  }
  
  // 3. Render output matching state.viewMode
  if (filtered.length === 0) {
    const noMatchTitle = (state.translations && state.translations.library && state.translations.library.noMatch) || "NO SERVICES MATCH FILTERS";
    const noMatchDesc = (state.translations && state.translations.library && state.translations.library.noMatchDesc) || "Modify search keywords or select a different industry chip.";
    libraryGrid.removeAttribute('style');
    libraryGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; border: 1px dashed var(--border-color); border-radius: 12px; color: var(--text-secondary);">
        <h4 style="font-family: var(--font-mono); font-size: 1rem; color: var(--text-primary); margin-bottom: 8px; text-transform: uppercase;">${noMatchTitle}</h4>
        <p style="font-size: 0.85rem;">${noMatchDesc}</p>
      </div>
    `;
    return;
  }
  
  if (state.viewMode === 'grid') {
    libraryGrid.removeAttribute('style');
    libraryGrid.className = 'library-grid';
    filtered.forEach((tool, idx) => {
      const originalIndex = toolsData.findIndex(t => t.id === tool.id);
      const cardEl = document.createElement('div');
      cardEl.className = 'timeline-card library-item-card visible';
      cardEl.setAttribute('data-node', originalIndex);
      const isFav = isFavorite(tool.id);
      const isCompared = state.comparisonList.includes(tool.id);
      cardEl.innerHTML = createCardHTML(tool, originalIndex, isFav, isCompared, false);
      libraryGrid.appendChild(cardEl);

      // Injected Ads (Code 1 after 4th and 8th tools on Desktop)
      if (window.AdManager && window.innerWidth >= 1200) {
        if (idx === 3) {
          const adCard = window.AdManager.createInlineAdCard('code_1');
          libraryGrid.appendChild(adCard);
          window.AdManager.registerLazyLoad(adCard.querySelector('.ad-content'), 'code_1');
        } else if (idx === 7) {
          const adCard = window.AdManager.createInlineAdCard('code_1');
          libraryGrid.appendChild(adCard);
          window.AdManager.registerLazyLoad(adCard.querySelector('.ad-content'), 'code_1');
        }
      }
    });
  } else if (state.viewMode === 'list') {
    libraryGrid.removeAttribute('style');
    libraryGrid.className = 'library-grid list-view';
    filtered.forEach((tool, idx) => {
      const originalIndex = toolsData.findIndex(t => t.id === tool.id);
      const cardEl = document.createElement('div');
      cardEl.className = 'timeline-card library-item-card visible';
      cardEl.setAttribute('data-node', originalIndex);
      const isFav = isFavorite(tool.id);
      const isCompared = state.comparisonList.includes(tool.id);
      cardEl.innerHTML = createCardHTML(tool, originalIndex, isFav, isCompared, false);
      libraryGrid.appendChild(cardEl);

      // Injected Ads (Code 1 after 4th and 8th tools on Desktop)
      if (window.AdManager && window.innerWidth >= 1200) {
        if (idx === 3) {
          const adCard = window.AdManager.createInlineAdCard('code_1');
          libraryGrid.appendChild(adCard);
          window.AdManager.registerLazyLoad(adCard.querySelector('.ad-content'), 'code_1');
        } else if (idx === 7) {
          const adCard = window.AdManager.createInlineAdCard('code_1');
          libraryGrid.appendChild(adCard);
          window.AdManager.registerLazyLoad(adCard.querySelector('.ad-content'), 'code_1');
        }
      }
    });
  } else if (state.viewMode === 'category') {
    libraryGrid.className = '';
    libraryGrid.style.display = 'flex';
    libraryGrid.style.flexDirection = 'column';
    libraryGrid.style.gap = '40px';
    libraryGrid.style.width = '100%';
    
    // Output grouped by category in exact order of industriesList
    let nonElGroupCount = 0;
    industriesList.forEach(category => {
      const catTools = filtered.filter(tool => tool.industries && tool.industries.includes(category));
      
      if (catTools.length > 0) {
        nonElGroupCount++;
        const groupWrap = document.createElement('div');
        groupWrap.className = 'category-group-wrap';
        const translatedCat = (state.translations && state.translations.sectors && state.translations.sectors[category]) || category;
        const nodeSuffix = (catTools.length === 1) ? "Node" : "Nodes";
        
        groupWrap.innerHTML = `
          <div class="category-group-title">
            <span>${translatedCat}</span>
            <span class="category-group-count">${catTools.length} ${nodeSuffix}</span>
          </div>
          <div class="category-group-grid"></div>
        `;
        
        const gridContainer = groupWrap.querySelector('.category-group-grid');
        
        catTools.forEach(tool => {
          const originalIndex = toolsData.findIndex(t => t.id === tool.id);
          const cardEl = document.createElement('div');
          cardEl.className = 'timeline-card library-item-card visible';
          cardEl.setAttribute('data-node', originalIndex);
          const isFav = isFavorite(tool.id);
          const isCompared = state.comparisonList.includes(tool.id);
          cardEl.innerHTML = createCardHTML(tool, originalIndex, isFav, isCompared, false);
          gridContainer.appendChild(cardEl);
        });
        
        libraryGrid.appendChild(groupWrap);

        // Injected Ads (Code 1 after 1st and 2nd category groups on Desktop)
        if (window.AdManager && window.innerWidth >= 1200) {
          if (nonElGroupCount === 1) {
            const adCard = window.AdManager.createInlineAdCard('code_1');
            libraryGrid.appendChild(adCard);
            window.AdManager.registerLazyLoad(adCard.querySelector('.ad-content'), 'code_1');
          } else if (nonElGroupCount === 2) {
            const adCard = window.AdManager.createInlineAdCard('code_1');
            libraryGrid.appendChild(adCard);
            window.AdManager.registerLazyLoad(adCard.querySelector('.ad-content'), 'code_1');
          }
        }
      }
    });
  }
  
  const wrapper = document.getElementById('library-grid-wrapper');
  if (wrapper) {
    if (filtered.length > 6) {
      wrapper.classList.add('collapsed');
    } else {
      wrapper.classList.remove('collapsed');
    }
  }
  
  setupCardInteractions();
}

// ==========================================================================
// 9. CATEGORY EXPLORER SYSTEM
// ==========================================================================

let activeCategoryName = "Everyday Personal Tasks";

function initCategoryExplorerSection() {
  if (!categoryExplorerList) return;
  
  // Render all 12 categories sidebar options with tool counts
  categoryExplorerList.innerHTML = '';
  industriesList.forEach(sector => {
    const count = toolsData.filter(t => t.industries && t.industries.includes(sector)).length;
    const translatedSector = (state.translations && state.translations.sectors && state.translations.sectors[sector]) || sector;
    
    const li = document.createElement('li');
    li.className = `category-item ${sector === activeCategoryName ? 'active' : ''}`;
    li.setAttribute('data-category', sector);
    li.innerHTML = `
      <span>${translatedSector}</span>
      <span class="category-item-count">${count}</span>
    `;
    
    categoryExplorerList.appendChild(li);
  });
  
  // Click event triggers category reload
  categoryExplorerList.addEventListener('click', (e) => {
    const item = e.target.closest('.category-item');
    if (item) {
      const items = categoryExplorerList.querySelectorAll('.category-item');
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      activeCategoryName = item.getAttribute('data-category');
      renderCategoryExplorer();
    }
  });
  
  const btnCatShowMore = document.getElementById('btn-category-show-more');
  if (btnCatShowMore) {
    btnCatShowMore.addEventListener('click', () => {
      const wrapper = document.getElementById('category-tools-grid-wrapper');
      if (wrapper) wrapper.classList.remove('collapsed');
    });
  }
  
  renderCategoryExplorer();
}

function renderCategoryExplorer() {
  if (!categoryToolsGrid || !categoryActiveName || !categoryActiveCount) return;
  
  const translatedActiveName = (state.translations && state.translations.sectors && state.translations.sectors[activeCategoryName]) || activeCategoryName;
  categoryActiveName.textContent = translatedActiveName;
  categoryToolsGrid.innerHTML = '';
  
  const matched = toolsData.filter(t => t.industries && t.industries.includes(activeCategoryName));
  const nodeSuffix = (matched.length === 1) ? "Node" : "Nodes";
  categoryActiveCount.textContent = `${matched.length} ${nodeSuffix}`;
  
  if (matched.length === 0) {
    const emptyTitle = (state.translations && state.translations.categories && state.translations.categories.emptyTitle) || "No System Nodes Mapped";
    let emptyDesc = (state.translations && state.translations.categories && state.translations.categories.emptyDesc) || "There are no operational automation instances configured for this sector.";
    if (emptyDesc.includes("this sector") || emptyDesc.includes("sector")) {
      emptyDesc = emptyDesc.replace("this sector", translatedActiveName).replace("sector", translatedActiveName);
    }
    categoryToolsGrid.innerHTML = `
      <div class="category-empty-state">
        <h4 class="category-empty-state-title">${emptyTitle}</h4>
        <p class="category-empty-state-desc">${emptyDesc}</p>
      </div>
    `;
    return;
  }
  
  matched.forEach((tool, idx) => {
    const originalIndex = toolsData.findIndex(t => t.id === tool.id);
    const cardEl = document.createElement('div');
    cardEl.className = 'timeline-card library-item-card visible';
    cardEl.setAttribute('data-node', originalIndex);
    const isFav = isFavorite(tool.id);
    const isCompared = state.comparisonList.includes(tool.id);
    cardEl.innerHTML = createCardHTML(tool, originalIndex, isFav, isCompared, false);
    categoryToolsGrid.appendChild(cardEl);

    // Injected Ad (Code 1 after the 2nd card on Desktop)
    if (window.AdManager && window.innerWidth >= 1200 && idx === 1) {
      const adCard = window.AdManager.createInlineAdCard('code_1');
      categoryToolsGrid.appendChild(adCard);
      window.AdManager.registerLazyLoad(adCard.querySelector('.ad-content'), 'code_1');
    }
  });
  
  const wrapper = document.getElementById('category-tools-grid-wrapper');
  if (wrapper) {
    if (matched.length > 6) {
      wrapper.classList.add('collapsed');
    } else {
      wrapper.classList.remove('collapsed');
    }
  }
  
  setupCardInteractions();
}

// ==========================================================================
// 10. SCROLLSPY NAVIGATION SYSTEM
// ==========================================================================

function initNavigation() {
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');
  
  const appHeader = document.querySelector('.app-header');
  const hamburgerToggle = document.getElementById('hamburger-toggle');
  const mainNav = document.querySelector('.main-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');

  function closeMobileMenu() {
    if (hamburgerToggle) hamburgerToggle.classList.remove('active');
    if (mainNav) mainNav.classList.remove('mobile-active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (appHeader) appHeader.classList.remove('menu-active');
  }

  if (hamburgerToggle && mainNav && mobileOverlay) {
    hamburgerToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburgerToggle.classList.toggle('active');
      mainNav.classList.toggle('mobile-active');
      mobileOverlay.classList.toggle('active');
      if (appHeader) appHeader.classList.toggle('menu-active');
    });

    mobileOverlay.addEventListener('click', () => {
      closeMobileMenu();
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        
        // Close menu drawer on mobile link clicks
        closeMobileMenu();

        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          window.removeEventListener('scroll', updateActiveNavLink);
          
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          const offset = 72; // height of fixed header
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = targetSection.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          setTimeout(() => {
            window.addEventListener('scroll', updateActiveNavLink);
          }, 800);
        }
      }
    });
  });
  
  function updateActiveNavLink() {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 120; // threshold offset
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  }
  
  window.addEventListener('scroll', updateActiveNavLink);
}

// --- App Entry point ---
async function initApp() {
  try {
    initTheme();
    setupEventListeners();
    
    // Initialize premium auth gating systems
    await initAuthSystem();
    
    // Start continuous smooth scroll draw tracing loop
    smoothScrollLoop();
    
    // Initialize config overlay wizard
    initDashboardControls();
    
    // Initialize AI-OS platform systems
    initLibrarySection();
    initCategoryExplorerSection();
    initNavigation();

    // Initialize Advertisement Placements
    if (window.AdManager) {
      window.AdManager.init();
    }
    
    // Populate dynamic platform stats
    const activeNodesMetric = document.getElementById('metric-active-nodes');
    if (activeNodesMetric && window.toolsData) {
      activeNodesMetric.textContent = `${window.toolsData.length}+`;
    }
  } catch (err) {
    console.error("Initialization Error: ", err);
    window.myError = err.message + "\nStack: " + err.stack;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// --- Legal Drawer Bindings ---
function openLegalDrawer(type) {
  const overlay = document.getElementById('legal-overlay');
  const modalTitle = document.getElementById('legal-modal-title');
  const modalBody = document.getElementById('legal-modal-body');
  const modalSubtitle = document.getElementById('legal-modal-subtitle');
  
  if (typeof legalData === 'undefined') {
    console.error('legalData is not defined. Ensure legalData.js is loaded.');
    return;
  }
  
  const doc = legalData[type];
  if (!doc) return;
  
  if (modalTitle) modalTitle.textContent = doc.title;
  if (modalSubtitle) modalSubtitle.textContent = `CORPORATE REGULATORY FILE // ${type.toUpperCase()}`;
  
  if (modalBody) {
    let html = '';
    
    // Auto-inherit / auto-inject governing law & jurisdiction section if not present
    const hasJurisdictionSection = doc.sections.some(sec => 
      sec.heading.toLowerCase().includes('governing law') || 
      sec.heading.toLowerCase().includes('jurisdiction')
    );
    
    const sectionsToRender = [...doc.sections];
    
    if (!hasJurisdictionSection) {
      const nextIdx = sectionsToRender.length + 1;
      sectionsToRender.push({
        heading: `${nextIdx}. GOVERNING LAW & EXCLUSIVE JURISDICTION`,
        text: "These Terms, Conditions, Policies, Services, Products, Features, APIs, Content, and all interactions with this platform shall be governed and construed exclusively in accordance with the laws of the Republic of India. By accessing or using this website, the user irrevocably agrees that any dispute, claim, controversy, legal proceeding, arbitration, injunction, recovery action, contractual disagreement, statutory interpretation, tort claim, intellectual property dispute, consumer complaint, or any matter whatsoever arising directly or indirectly out of the use of this platform shall be subject solely and exclusively to the competent courts located in Indore, Madhya Pradesh, India. The user expressly waives any objection relating to territorial jurisdiction, venue inconvenience, or forum selection and agrees not to initiate or maintain any legal proceedings in any other jurisdiction, state, district, or country."
      });
    }
    
    sectionsToRender.forEach(sec => {
      const isGoverningLaw = sec.heading.toLowerCase().includes('governing law') || sec.heading.toLowerCase().includes('jurisdiction');
      const isTerms = (type === 'terms');
      let textContent = sec.text;
      
      // Terms and Conditions displays the clause in bold as requested
      if (isGoverningLaw && isTerms && !textContent.includes('<strong>')) {
        textContent = `<strong>${textContent}</strong>`;
      }
      
      if (isGoverningLaw) {
        html += `
          <div class="legal-section-block highlighted-legal-section">
            <h3>${sec.heading}</h3>
            <p>${textContent}</p>
          </div>
        `;
      } else {
        html += `
          <div class="legal-section-block">
            <h3>${sec.heading}</h3>
            <p>${textContent}</p>
          </div>
        `;
      }
    });
    modalBody.innerHTML = html;
  }
  
  if (overlay) {
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeLegalDrawer() {
  const overlay = document.getElementById('legal-overlay');
  if (overlay) {
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Bind events globally
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('.legal-trigger');
  if (trigger) {
    e.preventDefault();
    const type = trigger.getAttribute('data-legal');
    openLegalDrawer(type);
  }
});

const legalCloseBtn = document.getElementById('legal-close-btn');
if (legalCloseBtn) {
  legalCloseBtn.addEventListener('click', closeLegalDrawer);
}

const legalCloseOverlay = document.getElementById('legal-close-overlay');
if (legalCloseOverlay) {
  legalCloseOverlay.addEventListener('click', closeLegalDrawer);
}

/* ==========================================================================
   AUTHENTICATION & ACCESS LOCK SYSTEM
   ========================================================================== */

const lockTranslations = {
  English: {
    title: "Login For Full Access",
    desc: "Authentication is required to unlock complete system roadmaps, prompt templates, and professional execution guides.",
    signinBtn: "Sign In / Create Account",
    couponBtn: "Access Using Coupon"
  },
  Hindi: {
    title: "पूर्ण एक्सेस के लिए लॉगिन करें",
    desc: "सिस्टम रोडमैप, प्रॉम्ट टेम्पलेट्स और व्यावसायिक मार्गदर्शिकाओं को अनलॉक करने के लिए प्रमाणीकरण आवश्यक है।",
    signinBtn: "लॉगिन / अकाउंट बनाएं",
    couponBtn: "कूपन कोड दर्ज करें"
  },
  Hinglish: {
    title: "Login For Full Access",
    desc: "Complete system roadmaps, prompt templates aur guides ko unlock karne ke liye authentication zaroori hai.",
    signinBtn: "Sign In / Create Account",
    couponBtn: "Access Using Coupon"
  }
};

function applyRoadmapLock() {
  const lang = getActiveLanguage();
  const t = lockTranslations[lang] || lockTranslations["English"];
  
  const timelineContainer = document.querySelector('.timeline-container');
  const roadmapUxContainer = document.querySelector('.roadmap-ux-container');
  
  if (state.goalText === "Exploring AI") {
    if (timelineContainer) timelineContainer.classList.add('locked-preview-blur');
  } else {
    if (roadmapUxContainer) roadmapUxContainer.classList.add('locked-preview-blur');
  }
  
  const section = document.getElementById('roadmap-builder-section');
  if (section) {
    section.classList.add('roadmap-lock-container');
    
    const oldOverlay = document.getElementById('roadmap-lock-overlay');
    if (oldOverlay) oldOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'roadmap-lock-overlay';
    overlay.className = 'roadmap-lock-overlay';
    overlay.innerHTML = `
      <div class="lock-icon" style="font-size: 3rem; margin-bottom: 20px;">🔒</div>
      <h3 style="font-family: var(--font-title); font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em;">${t.title}</h3>
      <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 28px;">${t.desc}</p>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="btn-lock-signin" class="btn btn-primary" style="width: 100%; justify-content: center; gap: 8px;">
          <span>${t.signinBtn}</span>
        </button>
        <button id="btn-lock-coupon" class="btn btn-secondary" style="width: 100%; justify-content: center;">
          <span>${t.couponBtn}</span>
        </button>
      </div>
    `;
    section.appendChild(overlay);
    
    document.getElementById('btn-lock-signin').addEventListener('click', () => {
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) authOverlay.style.display = 'flex';
    });
    document.getElementById('btn-lock-coupon').addEventListener('click', () => {
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) authOverlay.style.display = 'none';
      const couponOverlay = document.getElementById('coupon-modal-overlay');
      if (couponOverlay) couponOverlay.style.display = 'flex';
    });
  }
}

function removeRoadmapLock() {
  const timelineContainer = document.querySelector('.timeline-container');
  const roadmapUxContainer = document.querySelector('.roadmap-ux-container');
  if (timelineContainer) timelineContainer.classList.remove('locked-preview-blur');
  if (roadmapUxContainer) roadmapUxContainer.classList.remove('locked-preview-blur');
  
  const section = document.getElementById('roadmap-builder-section');
  if (section) {
    section.classList.remove('roadmap-lock-container');
  }
  
  const overlay = document.getElementById('roadmap-lock-overlay');
  if (overlay) overlay.remove();
}

let supabaseClient = null;

// Initialize Supabase client
async function initSupabase() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (config.supabaseUrl && config.supabaseAnonKey) {
      supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log("Supabase client initialized successfully.");
      
      // Coupon session check bypassed for static mode
    } else {
      console.warn("Supabase credentials missing from config API.");
    }
  } catch (err) {
    console.error("Failed to initialize Supabase:", err);
  }
}

function isUserAuthenticated() {
  // Check coupon session first
  const couponSession = sessionStorage.getItem('aios_coupon_session');
  if (couponSession) {
    try {
      const user = JSON.parse(couponSession);
      if (user && user.is_coupon) {
        return true;
      }
    } catch (e) {}
  }
  
  // Check user state
  if (state.user && !state.user.is_coupon) {
    return true;
  }
  return false;
}

function checkPromptLimit() {
  if (state.user && state.user.plan_type === 'Basic') {
    const today = new Date().toISOString().split('T')[0];
    const usage = JSON.parse(localStorage.getItem('aios_usage_prompts') || '{"date":"","count":0}');
    if (usage.date === today && usage.count >= 5) {
      showToast("Daily limit of 5 prompts reached for the Basic plan. Please upgrade to Premium.", "error");
      showPricingModal();
      return false;
    }
  }
  return true;
}

function incrementPromptLimit() {
  if (state.user && state.user.plan_type === 'Basic') {
    const today = new Date().toISOString().split('T')[0];
    let usage = JSON.parse(localStorage.getItem('aios_usage_prompts') || '{"date":"","count":0}');
    if (usage.date !== today) {
      usage = { date: today, count: 0 };
    }
    usage.count++;
    localStorage.setItem('aios_usage_prompts', JSON.stringify(usage));
  }
}

function calculateUnlockRate() {
  if (state.analytics.compileRoadmapClicks === 0) return 0;
  const rate = (((state.analytics.emailSignIns || 0) + state.analytics.couponRedemptions) / state.analytics.compileRoadmapClicks) * 100;
  return Math.min(100, Math.round(rate));
}

function updateUserProfileHeader() {
  const container = document.getElementById('user-profile-header');
  if (!container) return;
  
  // Update Premium CTA visibility in the header actions
  const ctaBtn = document.getElementById('btn-upgrade-premium-cta');
  if (ctaBtn) {
    if (state.user && (state.user.plan_type === 'Premium' || state.user.plan_type === 'Trial Premium')) {
      ctaBtn.style.display = 'block';
      ctaBtn.textContent = (state.user.plan_type === 'Trial Premium') ? 'Trial Active' : 'Premium Active';
      ctaBtn.style.background = (state.user.plan_type === 'Trial Premium') ? 'linear-gradient(135deg, #FFD54A, #2EC5FF)' : 'linear-gradient(135deg, #2ecc71, #27ae60)';
      ctaBtn.style.color = (state.user.plan_type === 'Trial Premium') ? '#000' : '#fff';
      ctaBtn.style.boxShadow = (state.user.plan_type === 'Trial Premium') ? '0 0 10px rgba(46, 197, 255, 0.3)' : '0 0 10px rgba(46, 204, 113, 0.3)';
      ctaBtn.style.animation = 'none';
      ctaBtn.onclick = () => {
        if (state.user.plan_type === 'Trial Premium') {
          showPricingModal();
        } else {
          showToast("You are currently on the Premium Plan! Full access unlocked.", "info");
        }
      };
    } else {
      ctaBtn.style.display = 'block';
      ctaBtn.textContent = 'Upgrade To Premium';
      ctaBtn.style.background = 'linear-gradient(135deg, #ff007f, #7f00ff)';
      ctaBtn.style.boxShadow = '0 0 15px rgba(127, 0, 255, 0.4)';
      ctaBtn.style.animation = 'premiumPulse 2.5s infinite alternate';
      ctaBtn.onclick = showPricingModal;
    }
  }
  
  if (isUserAuthenticated()) {
    const nameToDisplay = state.user.name || 'Premium User';
    const avatarToDisplay = state.user.picture || 'https://api.dicebear.com/7.x/bottts/svg';
    const statusText = state.user.plan_type || 'Basic';
    
    let statusClass = '';
    let statusStyle = '';
    let statusDisplay = statusText.toUpperCase();
    
    if (statusText === 'Premium') {
      statusClass = 'premium';
    } else if (statusText === 'Trial Premium' || statusText === 'Trial') {
      statusClass = 'premium-trial';
      statusStyle = 'background: linear-gradient(135deg, #FFD54A 0%, #2EC5FF 100%) !important; color: #000 !important; font-weight: 700;';
      statusDisplay = '✨ PREMIUM TRIAL';
    }
    
    container.innerHTML = `
      <div style="position: relative; display: flex; align-items: center; gap: 12px;">
        <button id="btn-header-profile" class="profile-btn">
          <img src="${avatarToDisplay}" class="profile-avatar" alt="Avatar">
          <span>${nameToDisplay.split(' ')[0]}</span>
        </button>
        <button id="btn-header-logout" class="profile-btn" style="border-radius: 20px; background: rgba(255, 90, 90, 0.12); border: 1px solid rgba(255, 90, 90, 0.3); color: #ff5a5a; font-weight: 700; padding: 8px 16px; cursor: pointer; transition: all 0.2s; font-family: var(--font-mono); font-size: 0.8rem;" onmouseover="this.style.background='rgba(255, 90, 90, 0.2)'" onmouseout="this.style.background='rgba(255, 90, 90, 0.12)'">
          🚪 &nbsp; Logout
        </button>
        <div id="header-profile-dropdown" class="profile-dropdown">
          <div class="profile-dropdown-name">${nameToDisplay}</div>
          <div class="profile-dropdown-email">${state.user.email || ''}</div>
          <div class="profile-dropdown-status ${statusClass}" style="${statusStyle}">${statusDisplay}</div>
          <button id="btn-dropdown-profile" class="profile-dropdown-item" style="width: 100%; text-align: left; background: transparent; border: none; color: #fff; padding: 10px; font-weight: 600; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 8px;">
            👤 <span>My Profile</span>
          </button>
          <a href="https://arproduction050-byte.github.io/A.R.-Publications/" target="_blank" rel="noopener" style="display:flex; align-items:center; gap:8px; padding:10px; color:rgba(255,255,255,0.7); font-size:0.82rem; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
            📖 <span>A.R. Publications</span>
          </a>
          <a href="https://anujrawal05.github.io/apps-by-anujrawal/" target="_blank" rel="noopener" style="display:flex; align-items:center; gap:8px; padding:10px; color:rgba(255,255,255,0.7); font-size:0.82rem; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
            📱 <span>Apps by Anuj</span>
          </a>
          <button id="btn-dropdown-logout" class="profile-dropdown-logout" style="margin-top: 10px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;
    
    // Bind toggle dropdown
    const profileBtn = document.getElementById('btn-header-profile');
    const dropdown = document.getElementById('header-profile-dropdown');
    if (profileBtn && dropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
    }
    
    // Bind profile
    const profileMenuBtn = document.getElementById('btn-dropdown-profile');
    if (profileMenuBtn) {
      profileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.remove('active');
        showProfileModal();
      });
    }
    
    // Bind logout
    const logoutBtn = document.getElementById('btn-dropdown-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logoutUser();
      });
    }
    
    // Bind direct header logout button
    const directLogoutBtn = document.getElementById('btn-header-logout');
    if (directLogoutBtn) {
      directLogoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logoutUser();
      });
    }
  } else {
    container.innerHTML = `
      <button id="btn-header-signin" class="profile-btn" style="border-radius: 20px; background: rgba(255, 255, 255, 0.05); border-color: var(--border-color);">
        🔑 <span>Sign In</span>
      </button>
    `;
    
    const signinBtn = document.getElementById('btn-header-signin');
    if (signinBtn) {
      signinBtn.addEventListener('click', () => {
        const authOverlay = document.getElementById('auth-modal-overlay');
        if (authOverlay) authOverlay.style.display = 'flex';
      });
    }
  }
}

/* ---- Auth Tab Switcher (global so onclick= attribute works) ---- */
function switchAuthTab(tab) {
  const signinForm = document.getElementById('auth-form-signin');
  const signupForm = document.getElementById('auth-form-signup');
  const signinTab = document.getElementById('auth-tab-signin');
  const signupTab = document.getElementById('auth-tab-signup');
  if (!signinForm || !signupForm) return;
  if (tab === 'signin') {
    signinForm.style.display = 'flex';
    signupForm.style.display = 'none';
    if (signinTab) { signinTab.style.background = 'var(--accent-color)'; signinTab.style.color = '#000'; }
    if (signupTab) { signupTab.style.background = 'transparent'; signupTab.style.color = 'var(--text-secondary)'; }
  } else {
    signinForm.style.display = 'none';
    signupForm.style.display = 'flex';
    if (signupTab) { signupTab.style.background = 'var(--accent-color)'; signupTab.style.color = '#000'; }
    if (signinTab) { signinTab.style.background = 'transparent'; signinTab.style.color = 'var(--text-secondary)'; }
  }
}

let authMode = 'signin';

function updateAuthModalUI() {
  // Hide OTP container if any
  const otpSection = document.getElementById('otp-verification-section');
  if (otpSection) otpSection.style.display = 'none';

  const formFields = document.getElementById('auth-form-fields');
  const actionButtons = document.getElementById('auth-action-buttons');
  const couponSection = document.getElementById('auth-coupon-section');
  
  if (formFields) formFields.style.display = 'flex';
  if (actionButtons) actionButtons.style.display = 'flex';
  if (couponSection) couponSection.style.display = 'block';

  const title = document.getElementById('auth-modal-title');
  const desc = document.getElementById('auth-modal-desc');
  const pwdContainer = document.getElementById('auth-password-container');
  const btnSignin = document.getElementById('btn-email-signin');
  const btnSignup = document.getElementById('btn-email-signup');
  const toggleBtn = document.getElementById('btn-toggle-auth-mode');
  const forgotBtn = document.getElementById('btn-forgot-password');
  const errorEl = document.getElementById('auth-modal-error');
  const successEl = document.getElementById('auth-modal-success');

  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';

  if (authMode === 'signin') {
    if (title) title.textContent = 'Access AI-OS';
    if (desc) desc.textContent = 'Securely sign in to access all platform features, timelines, and digital business modules.';
    if (pwdContainer) pwdContainer.style.display = 'block';
    if (btnSignin) { btnSignin.style.display = 'block'; btnSignin.textContent = 'Sign In'; }
    if (btnSignup) btnSignup.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = 'Create Account instead';
    if (forgotBtn) forgotBtn.style.display = 'inline-block';
  } else if (authMode === 'signup') {
    if (title) title.textContent = 'Create Account';
    if (desc) desc.textContent = 'Sign up to start your premium experience and build smart AI workspaces.';
    if (pwdContainer) pwdContainer.style.display = 'block';
    if (btnSignin) btnSignin.style.display = 'none';
    if (btnSignup) { btnSignup.style.display = 'block'; btnSignup.textContent = 'Sign Up'; }
    if (toggleBtn) toggleBtn.textContent = 'Sign In instead';
    if (forgotBtn) forgotBtn.style.display = 'none';
  } else if (authMode === 'forgot') {
    if (title) title.textContent = 'Reset Password';
    if (desc) desc.textContent = 'Enter your email address and we will generate a recovery link.';
    if (pwdContainer) pwdContainer.style.display = 'none';
    if (btnSignin) { btnSignin.style.display = 'block'; btnSignin.textContent = 'Send Reset Link'; }
    if (btnSignup) btnSignup.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = 'Back to Sign In';
    if (forgotBtn) forgotBtn.style.display = 'none';
  }
}

async function handleEmailSignin() {
  const emailEl = document.getElementById('auth-email');
  const passwordEl = document.getElementById('auth-password');
  const errorEl = document.getElementById('auth-modal-error');
  
  const email = emailEl ? emailEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  
  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Please enter email and password.'; errorEl.style.display = 'block'; }
    return;
  }
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      if (errorEl) { errorEl.textContent = data.error || 'Login failed.'; errorEl.style.display = 'block'; }
      return;
    }
    
    state.user = data.user;
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    
    const authOverlay = document.getElementById('auth-modal-overlay');
    if (authOverlay) authOverlay.style.display = 'none';
    
    if (data.hasDetails) {
      updateUserProfileHeader();
      initTrialClock();
      window.location.href = './aios_buisness.html';
      showToast("Logged in successfully!");
    } else {
      showOnboardingModal(data.user);
    }
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
  }
}

async function handleEmailSignup() {
  const emailEl = document.getElementById('auth-email');
  const passwordEl = document.getElementById('auth-password');
  const errorEl = document.getElementById('auth-modal-error');
  
  const email = emailEl ? emailEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  
  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Please enter email and password.'; errorEl.style.display = 'block'; }
    return;
  }
  
  if (password.length < 6) {
    if (errorEl) { errorEl.textContent = 'Password must be at least 6 characters.'; errorEl.style.display = 'block'; }
    return;
  }
  
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      if (errorEl) { errorEl.textContent = data.error || 'Signup failed.'; errorEl.style.display = 'block'; }
      return;
    }
    
    showOtpScreen();
    showToast("Account created successfully! An OTP has been sent to your email.");
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
  }
}

function showOtpScreen() {
  const title = document.getElementById('auth-modal-title');
  const desc = document.getElementById('auth-modal-desc');
  if (title) title.textContent = 'Verify OTP';
  if (desc) desc.textContent = 'A 6-digit verification code has been sent to your email. Enter it below to complete registration.';
  
  const formFields = document.getElementById('auth-form-fields');
  const actionButtons = document.getElementById('auth-action-buttons');
  const couponSection = document.getElementById('auth-coupon-section');
  if (formFields) formFields.style.display = 'none';
  if (actionButtons) actionButtons.style.display = 'none';
  if (couponSection) couponSection.style.display = 'none';
  
  const otpSection = document.getElementById('otp-verification-section');
  if (otpSection) {
    otpSection.style.display = 'flex';
    otpSection.style.flexDirection = 'column';
  }
}

function hideOtpScreen() {
  const otpSection = document.getElementById('otp-verification-section');
  if (otpSection) otpSection.style.display = 'none';
  
  const formFields = document.getElementById('auth-form-fields');
  const actionButtons = document.getElementById('auth-action-buttons');
  const couponSection = document.getElementById('auth-coupon-section');
  if (formFields) formFields.style.display = 'flex';
  if (actionButtons) actionButtons.style.display = 'flex';
  if (couponSection) couponSection.style.display = 'block';
  
  updateAuthModalUI();
}

async function handleVerifyOtp() {
  const codeEl = document.getElementById('auth-otp-code');
  const errorEl = document.getElementById('otp-error-msg');
  const successEl = document.getElementById('otp-success-msg');
  
  const otp = codeEl ? codeEl.value.trim() : '';
  if (!otp) {
    if (errorEl) { errorEl.textContent = 'Please enter the verification code.'; errorEl.style.display = 'block'; }
    return;
  }
  
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
  
  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp })
    });
    
    const data = await res.json();
    if (!res.ok) {
      if (errorEl) { errorEl.textContent = data.error || 'Verification failed.'; errorEl.style.display = 'block'; }
      return;
    }
    
    if (successEl) { successEl.textContent = 'Email verified successfully!'; successEl.style.display = 'block'; }
    
    state.user = data.user;
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    
    setTimeout(() => {
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) authOverlay.style.display = 'none';
      
      if (codeEl) codeEl.value = '';
      if (errorEl) errorEl.style.display = 'none';
      if (successEl) successEl.style.display = 'none';
      hideOtpScreen();
      
      showOnboardingModal(data.user);
      showToast("Email verified successfully! Please complete your profile onboarding.");
    }, 1000);
    
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
  }
}

async function handleForgotPassword() {
  const emailEl = document.getElementById('auth-email');
  const errorEl = document.getElementById('auth-modal-error');
  const successEl = document.getElementById('auth-modal-success');
  
  const email = emailEl ? emailEl.value.trim() : '';
  if (!email) {
    if (errorEl) { errorEl.textContent = 'Please enter your email.'; errorEl.style.display = 'block'; }
    return;
  }
  
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await res.json();
    if (!res.ok) {
      if (errorEl) { errorEl.textContent = data.error || 'Failed to request reset.'; errorEl.style.display = 'block'; }
      return;
    }
    
    if (successEl) {
      successEl.textContent = 'Recovery link sent successfully!';
      successEl.style.display = 'block';
    }
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
  }
}

async function handleSupabaseSession(session, profile = null) {
  const user = session.user;
  try {
    let finalProfile = profile;
    if (!finalProfile) {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        finalProfile = await res.json();
      }
    }
      
    if (!finalProfile || !finalProfile.full_name || !finalProfile.date_of_birth || !finalProfile.gender || !finalProfile.profession) {
      // First time login - trigger onboarding modal
      showOnboardingModal(user);
    } else {
      // User registered - complete sign in
      const isTrial = finalProfile.plan_type === 'Trial Premium';
      const trialExpires = finalProfile.trial_expires_at;
      const diffMs = trialExpires ? new Date(trialExpires).getTime() - Date.now() : 0;
      const remainingDays = diffMs > 0 ? Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))) : 0;
      
      state.user = {
        id: user.id,
        name: finalProfile.full_name,
        email: user.email,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
        gender: finalProfile.gender,
        profession: finalProfile.profession,
        date_of_birth: finalProfile.date_of_birth,
        plan_type: finalProfile.plan_type || 'Basic',
        trial_started_at: finalProfile.trial_started_at || null,
        trial_expires_at: finalProfile.trial_expires_at || null,
        trial_days_remaining: remainingDays,
        token: session.access_token,
        is_coupon: false
      };
      
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
      
      state.analytics.emailSignIns = (state.analytics.emailSignIns || 0) + 1;
      
      hideAuthModals();
      updateUserProfileHeader();
      initTrialClock();
      toggleBusinessSectionView();
      
      const trialUsed = finalProfile.trial_used || (finalProfile.trial_started_at ? true : false);
      const isBasicNow = finalProfile.plan_type === 'Basic' || !finalProfile.plan_type;
      
      if (trialUsed && isBasicNow) {
        showToast("⚠️ Your Premium Trial has ended. Premium features are now locked.", "warning");
        showPricingModal(true);
      } else if (isBasicNow) {
        showPricingModal(true);
      } else {
        regenerateActiveRoadmap();
        showToast(`Welcome back, ${state.user.name}!`);
      }
    }
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
  }
}

let onboardingUser = null;
function showOnboardingModal(user) {
  onboardingUser = user;
  const overlay = document.getElementById('onboarding-modal-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    // Remove closing support for mandatory first-time onboarding
    const closeBtn = overlay.querySelector('.auth-modal-close-btn');
    if (closeBtn) closeBtn.style.display = 'none';
  }
}

async function handleOnboardingSubmit(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('ob-fullname').value.trim();
  const dob = document.getElementById('ob-dob').value;
  const gender = document.getElementById('ob-gender').value;
  const profession = document.getElementById('ob-profession').value;
  
  const cbTerms = document.getElementById('ob-cb-terms').checked;
  const cbPrivacy = document.getElementById('ob-cb-privacy').checked;
  
  const errorEl = document.getElementById('onboarding-error-msg');
  if (errorEl) errorEl.style.display = 'none';
  
  if (!fullName || !dob || !gender || !profession) {
    if (errorEl) {
      errorEl.textContent = 'Please fill out all required fields.';
      errorEl.style.display = 'block';
    }
    return;
  }
  
  if (!cbTerms || !cbPrivacy) {
    if (errorEl) {
      errorEl.textContent = 'You must accept the terms & conditions and privacy policy to continue.';
      errorEl.style.display = 'block';
    }
    return;
  }
  
  try {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: fullName,
        date_of_birth: dob,
        gender: gender,
        profession: profession
      })
    });
    
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Profile update failed.');
    
    // Close onboarding and complete session fetch
    const overlay = document.getElementById('onboarding-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    
    // Trigger Trial Welcome Modal
    const welcomeModal = document.getElementById('trial-welcome-modal-overlay');
    if (welcomeModal) welcomeModal.style.display = 'flex';
    
    // Sync UI with updated profile values
    if (result.profile) {
      const remainingDays = 3; // New trials start with 3 days
      state.user = {
        id: result.profile.id,
        name: result.profile.full_name,
        email: result.profile.email,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.profile.email}`,
        gender: result.profile.gender,
        profession: result.profile.profession,
        date_of_birth: result.profile.date_of_birth,
        plan_type: result.profile.plan_type || 'Trial Premium',
        trial_started_at: result.profile.trial_started_at || new Date().toISOString(),
        trial_expires_at: result.profile.trial_expires_at || new Date(Date.now() + 3*24*60*60*1000).toISOString(),
        trial_days_remaining: remainingDays,
        is_coupon: false
      };
      
      updateUserProfileHeader();
      initTrialClock();
      toggleBusinessSectionView();
    }
    
    showToast("Profile completed successfully!");
  } catch (err) {
    console.error("Onboarding failed:", err.message);
    if (errorEl) {
      errorEl.textContent = 'Onboarding registration failed: ' + err.message;
      errorEl.style.display = 'block';
    }
  }
}

/* ─── Trial Clock ───────────────────────────────────────────────────── */
function isTrialActive() {
  return state.user && (state.user.plan_type === 'Trial Premium' || state.user.plan_type === 'Trial') && state.user.trial_days_remaining > 0;
}

function getTrialRemainingTime() {
  if (!state.user || !state.user.trial_expires_at) return null;
  const now = Date.now();
  const expires = new Date(state.user.trial_expires_at).getTime();
  const diffMs = expires - now;
  if (diffMs <= 0) return null;
  
  const totalHours = diffMs / (1000 * 60 * 60);
  if (totalHours < 24) {
    const hours = Math.ceil(totalHours);
    return { isLastDay: true, text: `${hours} hour${hours !== 1 ? 's' : ''} remaining` };
  } else {
    const days = Math.ceil(totalHours / 24);
    return { isLastDay: false, text: `${days} day${days !== 1 ? 's' : ''} remaining` };
  }
}

function initTrialClock() {
  const banner = document.getElementById('trial-countdown-banner');
  if (!banner) return;
  if (isTrialActive()) {
    const timeRemaining = getTrialRemainingTime();
    let text = "";
    if (timeRemaining) {
      if (timeRemaining.isLastDay) {
        text = `⚠️ <strong>Less than 24 hours remaining</strong> (${timeRemaining.text})! Recommend upgrading before trial expires.`;
      } else {
        text = `🎉 You're currently using your FREE 3-Day Premium Trial (${timeRemaining.text} left).`;
      }
    } else {
      text = `🎉 You're currently using your FREE 3-Day Premium Trial.`;
    }
    
    banner.innerHTML = `<span>${text}</span> <button onclick="showPricingModal();" style="margin-left: 12px; background: linear-gradient(135deg, #00D084, #2EC5FF); border: none; border-radius: 4px; padding: 4px 10px; color: #000; font-family: monospace; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: transform 0.2s;">Upgrade Now</button>`;
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

function closeTrialWelcomeModal() {
  const welcomeModal = document.getElementById('trial-welcome-modal-overlay');
  if (welcomeModal) welcomeModal.style.display = 'none';
  regenerateActiveRoadmap();
}

function showPricingModal(isMandatory = false) {
  // Bypassed for fully free static mode
}

async function handleChooseFreePlan() {
  if (!state.user) return;
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient
      .from('user_profiles')
      .update({ plan_type: 'Basic', updated_at: new Date().toISOString() })
      .eq('id', state.user.id);
      
    if (error) throw error;
    
    state.user.plan_type = 'Basic';
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    
    const pricingOverlay = document.getElementById('pricing-modal-overlay');
    if (pricingOverlay) pricingOverlay.style.display = 'none';
    
    updateUserProfileHeader();
    toggleBusinessSectionView();
    if (window.AdManager) window.AdManager.updateAdVisibility();
    regenerateActiveRoadmap();
    
    showToast("Free Plan activated successfully!");
  } catch (err) {
    showToast("Failed to activate Free Plan: " + err.message, "error");
  }
}

async function handlePremiumUpgrade(planName = 'Premium Monthly', amount = 99) {
  if (!state.user) {
    showToast("Please sign in or use a coupon code to upgrade.", "warning");
    const pricingOverlay = document.getElementById('pricing-modal-overlay');
    if (pricingOverlay) pricingOverlay.style.display = 'none';
    const authOverlay = document.getElementById('auth-modal-overlay');
    if (authOverlay) authOverlay.style.display = 'flex';
    return;
  }
  
  if (state.user.plan_type === 'Premium') {
    showToast("You are already on the Premium Plan!", "info");
    const pricingOverlay = document.getElementById('pricing-modal-overlay');
    if (pricingOverlay) pricingOverlay.style.display = 'none';
    return;
  }
  
  // Load Razorpay config
  let razorpayKey = 'rzp_test_review2026';
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (config.razorpayKeyId) {
      razorpayKey = config.razorpayKeyId;
    }
  } catch (e) {
    console.error("Failed to fetch Razorpay config:", e);
  }

  // Create secure backend order first
  let backendOrderId = null;
  try {
    const orderRes = await fetch('/api/auth/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, planName })
    });
    if (orderRes.ok) {
      const orderData = await orderRes.json();
      if (orderData.success) {
        backendOrderId = orderData.orderId;
      }
    }
  } catch (err) {
    console.error("Failed to create Razorpay order on backend:", err);
  }

  const options = {
    key: razorpayKey,
    amount: amount * 100, // amount in paise
    currency: 'INR',
    order_id: backendOrderId,
    name: 'A.R. Labs',
    description: `AI-OS ${planName} Upgrade`,
    image: 'https://anujrawal05.github.io/AI-OS_by-Anuj/aiso_logo.png',
    handler: async function (response) {
      showToast("Payment Successful! Verifying upgrade with server...", "info");
      await verifyRazorpayPayment(response, planName);
    },
    prefill: {
      name: state.user.name || 'Test User',
      email: state.user.email || 'user@test.com'
    },
    theme: {
      color: '#7f00ff'
    },
    modal: {
      ondismiss: function () {
        showToast("Payment cancelled by user.", "warning");
      }
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    showToast("Failed to initialize Razorpay checkout widget: " + err.message, "error");
  }
}

async function verifyRazorpayPayment(response, planName) {
  try {
    const res = await fetch('/api/auth/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.user.token}`
      },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        planName: planName
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Payment verification failed');
    }

    state.user.plan_type = 'Premium';
    
    if (state.user.is_coupon) {
      const payload = {
        email: state.user.email,
        name: state.user.name,
        plan_type: "Premium",
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        signature: 'AIOS-AUTHENTICATED-COUPON'
      };
      state.user.token = btoa(JSON.stringify(payload));
      sessionStorage.setItem('aios_coupon_session', JSON.stringify(state.user));
    } else {
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    }

    const pricingOverlay = document.getElementById('pricing-modal-overlay');
    if (pricingOverlay) pricingOverlay.style.display = 'none';
    
    updateUserProfileHeader();
    toggleBusinessSectionView();
    if (window.AdManager) window.AdManager.updateAdVisibility();
    regenerateActiveRoadmap();
    
    showToast(`Premium features (${planName}) unlocked successfully!`);
  } catch (err) {
    showToast("Upgrade profile update failed: " + err.message, "error");
  }
}


function showProfileModal() {
  if (!state.user) return;
  
  document.getElementById('pf-email').value = state.user.email || '';
  document.getElementById('pf-fullname').value = state.user.name || '';
  document.getElementById('pf-dob').value = state.user.date_of_birth || '';
  document.getElementById('pf-gender').value = state.user.gender || '';
  document.getElementById('pf-profession').value = state.user.profession || '';
  document.getElementById('pf-plan-display').textContent = state.user.plan_type || 'Basic';
  
  // Set account type and access status
  const accountTypeEl = document.getElementById('pf-account-type-display');
  const accessStatusEl = document.getElementById('pf-access-status-display');
  const isCoupon = !!state.user.is_coupon;
  
  if (isCoupon) {
    if (accountTypeEl) accountTypeEl.textContent = state.user.account_type || 'Premium Coupon User';
    if (accessStatusEl) {
      accessStatusEl.innerHTML = 'Premium';
      accessStatusEl.className = 'badge-access premium-badge';
    }
  } else {
    if (accountTypeEl) accountTypeEl.textContent = 'Email User';
    if (accessStatusEl) {
      const isPremium = state.user.plan_type === 'Premium';
      const isTrial = state.user.plan_type === 'Trial Premium';
      if (isPremium) {
        accessStatusEl.innerHTML = 'Premium';
        accessStatusEl.className = 'badge-access premium-badge';
        accessStatusEl.style = '';
      } else if (isTrial) {
        accessStatusEl.innerHTML = '✨ Premium Trial';
        accessStatusEl.className = 'badge-access premium-badge';
        accessStatusEl.style = 'background: linear-gradient(135deg, #FFD54A 0%, #2EC5FF 100%) !important; color: #000 !important; font-weight: 700; border: none !important;';
      } else {
        accessStatusEl.innerHTML = 'Basic';
        accessStatusEl.className = 'badge-access basic-badge';
        accessStatusEl.style = '';
      }
    }
  }
  
  // Handle hide_profile_editing
  document.getElementById('pf-fullname').disabled = isCoupon;
  document.getElementById('pf-dob').disabled = isCoupon;
  document.getElementById('pf-gender').disabled = isCoupon;
  document.getElementById('pf-profession').disabled = isCoupon;
  
  const saveBtn = document.querySelector('#profile-edit-form button[type="submit"]');
  if (saveBtn) {
    saveBtn.style.display = isCoupon ? 'none' : 'block';
  }
  
  const upgradeBtn = document.getElementById('btn-pf-upgrade');
  if (upgradeBtn) {
    upgradeBtn.style.display = (isCoupon || state.user.plan_type === 'Premium') ? 'none' : 'block';
  }
  
  const overlay = document.getElementById('profile-modal-overlay');
  if (overlay) overlay.style.display = 'flex';
}

async function handleProfileSave(e) {
  e.preventDefault();
  
  if (state.user && state.user.is_coupon) {
    showToast("Profile editing is disabled for coupon sessions.", "error");
    return;
  }
  
  const errorEl = document.getElementById('profile-error-msg');
  if (errorEl) errorEl.style.display = 'none';
  
  const fullName = document.getElementById('pf-fullname').value.trim();
  const dob = document.getElementById('pf-dob').value;
  const gender = document.getElementById('pf-gender').value;
  const profession = document.getElementById('pf-profession').value;
  
  if (!fullName) {
    if (errorEl) {
      errorEl.textContent = 'Name is required.';
      errorEl.style.display = 'block';
    }
    return;
  }
  
  if (state.user.is_coupon) {
    state.user.name = fullName;
    state.user.date_of_birth = dob;
    state.user.gender = gender;
    state.user.profession = profession;
    sessionStorage.setItem('aios_coupon_session', JSON.stringify(state.user));
    
    const overlay = document.getElementById('profile-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    updateUserProfileHeader();
    showToast("Temporary profile updated.");
    return;
  }
  
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient
      .from('user_profiles')
      .update({
        full_name: fullName,
        date_of_birth: dob || null,
        gender: gender || null,
        profession: profession || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', state.user.id);
      
    if (error) throw error;
    
    state.user.name = fullName;
    state.user.date_of_birth = dob;
    state.user.gender = gender;
    state.user.profession = profession;
    
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    
    const overlay = document.getElementById('profile-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    updateUserProfileHeader();
    showToast("Profile settings saved successfully!");
  } catch (err) {
    console.error("Profile update failed:", err.message);
    if (errorEl) {
      errorEl.textContent = 'Save failed: ' + err.message;
      errorEl.style.display = 'block';
    }
  }
}

async function handleCouponLogin(couponCode) {
  const errorEl = document.getElementById('coupon-error-msg');
  if (errorEl) errorEl.style.display = 'none';
  
  const submitBtn = document.getElementById('btn-coupon-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
  }
  
  try {
    const res = await fetch('/api/auth/coupon-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ couponCode })
    });
    
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Invalid access code. Please try again.');
    }
    
    sessionStorage.setItem('aios_coupon_session', JSON.stringify(data.user));
    state.user = data.user;
    
    state.analytics.couponRedemptions++;
    state.analytics.roadmapUnlockRate = calculateUnlockRate();
    
    hideAuthModals();
    updateUserProfileHeader();
    toggleBusinessSectionView();
    if (window.AdManager) window.AdManager.updateAdVisibility();
    regenerateActiveRoadmap();
    
    showToast("Coupon redeemed successfully! Premium access unlocked.");
  } catch (err) {
    console.error("Coupon redemption failed:", err.message);
    if (errorEl) {
      errorEl.textContent = 'Invalid access code. Please try again.';
      errorEl.style.display = 'block';
    } else {
      showToast('Invalid access code. Please try again.', 'error');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Redeem Access Code';
    }
  }
}

async function logoutUser() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {}
  sessionStorage.removeItem('aios_coupon_session');
  localStorage.removeItem('aios_user_profile');
  state.user = null;
  
  hideAuthModals();
  updateUserProfileHeader();
  toggleBusinessSectionView();
  if (window.AdManager) window.AdManager.updateAdVisibility();
  
  if (state.goalText && state.goalText !== "Exploring AI") {
    state.generatedJSONPrompt = '';
    const outputWrapper = document.getElementById('premium-json-output-wrapper');
    if (outputWrapper) outputWrapper.style.display = 'none';
  }
  regenerateActiveRoadmap();
  showToast("Signed out successfully.");
}

function hideAuthModals() {
  const authOverlay = document.getElementById('auth-modal-overlay');
  if (authOverlay) authOverlay.style.display = 'none';
  const couponOverlay = document.getElementById('coupon-modal-overlay');
  if (couponOverlay) couponOverlay.style.display = 'none';
  const pricingOverlay = document.getElementById('pricing-modal-overlay');
  if (pricingOverlay) pricingOverlay.style.display = 'none';
  const profileOverlay = document.getElementById('profile-modal-overlay');
  if (profileOverlay) profileOverlay.style.display = 'none';
  
  const couponInput = document.getElementById('coupon-input');
  if (couponInput) couponInput.value = '';
  const errorEl = document.getElementById('coupon-error-msg');
  if (errorEl) errorEl.style.display = 'none';
}

function toggleBusinessSectionView() {
  // Stubbed out on index.html; managed on separate aios_buisness.html page
}

function initBusinessSimulators() {
  const dbCta = document.getElementById('dashboard-business-banner');
  if (dbCta) {
    dbCta.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = './aios_buisness.html';
    });
  }
}


async function initAuthSystem() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Handle Reset Password action
  const resetAction = urlParams.get('action');
  const resetTokenVal = urlParams.get('token');
  if (resetAction === 'reset-password' && resetTokenVal) {
    const resetOverlay = document.getElementById('reset-password-modal-overlay');
    if (resetOverlay) resetOverlay.style.display = 'flex';
  }

  // Bind Switch Mode button inside the main auth card
  const toggleBtn = document.getElementById('btn-toggle-auth-mode');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (authMode === 'signin') authMode = 'signup';
      else authMode = 'signin';
      updateAuthModalUI();
    });
  }

  // Bind Forgot Password button inside the main auth card
  const forgotBtn = document.getElementById('btn-forgot-password');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', () => {
      authMode = 'forgot';
      updateAuthModalUI();
    });
  }

  // Bind Save Password inside reset overlay
  const btnSubmitReset = document.getElementById('btn-submit-reset-password');
  if (btnSubmitReset) {
    btnSubmitReset.addEventListener('click', async () => {
      const newPasswordEl = document.getElementById('reset-new-password');
      const errorEl = document.getElementById('reset-modal-error');
      const successEl = document.getElementById('reset-modal-success');
      const token = new URLSearchParams(window.location.search).get('token');
      
      const newPassword = newPasswordEl ? newPasswordEl.value : '';
      if (!newPassword || newPassword.length < 6) {
        if (errorEl) { errorEl.textContent = 'Password must be at least 6 characters.'; errorEl.style.display = 'block'; }
        return;
      }
      
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json();
        if (!res.ok) {
          if (errorEl) { errorEl.textContent = data.error || 'Reset failed.'; errorEl.style.display = 'block'; }
          return;
        }
        
        if (errorEl) errorEl.style.display = 'none';
        if (successEl) {
          successEl.textContent = 'Password reset successfully! Redirecting...';
          successEl.style.display = 'block';
        }
        setTimeout(() => {
          const resetOverlay = document.getElementById('reset-password-modal-overlay');
          if (resetOverlay) resetOverlay.style.display = 'none';
          const authOverlay = document.getElementById('auth-modal-overlay');
          if (authOverlay) authOverlay.style.display = 'flex';
        }, 2000);
      } catch (err) {
        if (errorEl) { errorEl.textContent = 'Connection failed.'; errorEl.style.display = 'block'; }
      }
    });
  }

  const resetCloseBtn = document.getElementById('reset-password-modal-close-btn');
  if (resetCloseBtn) {
    resetCloseBtn.addEventListener('click', () => {
      const resetOverlay = document.getElementById('reset-password-modal-overlay');
      if (resetOverlay) resetOverlay.style.display = 'none';
    });
  }

  // Clean URL query parameters to prevent state loop traps
  if (urlParams.has('code') || urlParams.has('state') || urlParams.has('token') || urlParams.has('error')) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.search = '';
    window.history.replaceState({}, document.title, cleanUrl.toString());
  }

  // Session synchronization bypassed for static frontend mode
  console.log("[Static Mode] Session synchronization bypassed. Default Premium User active.");

  // Direct default premium user state session initialization
  
  updateUserProfileHeader();
  toggleBusinessSectionView();
  initBusinessSimulators();
  
  // Initialize Supabase Client dynamically
  try {
    await initSupabase();
  } catch (e) {}

  // Silently restore Supabase session if still valid
  if (supabaseClient) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && !state.user?.is_coupon && state.user?.provider !== 'Kinde Auth') {
        await handleSupabaseSession(session);
      }
    } catch (e) { /* session expired */ }

    // Real-time auth state listener
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (state.user?.provider === 'Kinde Auth') return;
      if (event === 'SIGNED_IN' && session) {
        await handleSupabaseSession(session);
      } else if (event === 'SIGNED_OUT') {
        state.user = null;
        localStorage.removeItem('aios_user_profile');
        updateUserProfileHeader();
        toggleBusinessSectionView();
      }
    });
  }

  // Show trial banner for cached trial sessions
  initTrialClock();

  const authCloseBtn = document.getElementById('auth-modal-close-btn');

  if (authCloseBtn) {
    authCloseBtn.addEventListener('click', () => {
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) authOverlay.style.display = 'none';
    });
  }
  
  const couponCloseBtn = document.getElementById('coupon-modal-close-btn');
  if (couponCloseBtn) {
    couponCloseBtn.addEventListener('click', () => {
      const couponOverlay = document.getElementById('coupon-modal-overlay');
      if (couponOverlay) couponOverlay.style.display = 'none';
    });
  }
  
  const pricingCloseBtn = document.getElementById('pricing-modal-close-btn');
  if (pricingCloseBtn) {
    pricingCloseBtn.addEventListener('click', () => {
      if (state.onboardingPricing) {
        showToast("Please choose a plan to continue.", "warning");
        return;
      }
      const pricingOverlay = document.getElementById('pricing-modal-overlay');
      if (pricingOverlay) pricingOverlay.style.display = 'none';
    });
  }

  const profileCloseBtn = document.getElementById('profile-modal-close-btn');
  if (profileCloseBtn) {
    profileCloseBtn.addEventListener('click', () => {
      const profileOverlay = document.getElementById('profile-modal-overlay');
      if (profileOverlay) profileOverlay.style.display = 'none';
    });
  }
  
  const btnSignin = document.getElementById('btn-email-signin');
  if (btnSignin) {
    btnSignin.addEventListener('click', handleEmailSignin);
  }

  const btnSignup = document.getElementById('btn-email-signup');
  if (btnSignup) {
    btnSignup.addEventListener('click', handleEmailSignup);
  }

  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', handleVerifyOtp);
  }

  const btnBackToAuth = document.getElementById('btn-back-to-auth');
  if (btnBackToAuth) {
    btnBackToAuth.addEventListener('click', hideOtpScreen);
  }

  // Also support Enter key in email/password fields
  ['auth-signin-email','auth-signin-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleEmailSignin(); });
  });
  ['auth-signup-email','auth-signup-password','auth-signup-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleEmailSignup(); });
  });
  
  const btnCouponTrigger = document.getElementById('btn-auth-coupon-trigger');
  if (btnCouponTrigger) {
    btnCouponTrigger.addEventListener('click', () => {
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) authOverlay.style.display = 'none';
      const couponOverlay = document.getElementById('coupon-modal-overlay');
      if (couponOverlay) couponOverlay.style.display = 'flex';
    });
  }
  
  const btnCouponSubmit = document.getElementById('btn-coupon-submit');
  if (btnCouponSubmit) {
    btnCouponSubmit.addEventListener('click', () => {
      const couponInput = document.getElementById('coupon-input');
      const code = couponInput ? couponInput.value.trim() : '';
      if (code) {
        handleCouponLogin(code);
      } else {
        const errorEl = document.getElementById('coupon-error-msg');
        if (errorEl) {
          errorEl.textContent = 'Please enter a coupon code.';
          errorEl.style.display = 'block';
        }
      }
    });
  }

  // Bind Onboarding submit
  const obForm = document.getElementById('onboarding-form');
  if (obForm) {
    obForm.addEventListener('submit', handleOnboardingSubmit);
  }

  // Bind Profile Edit submit
  const pfForm = document.getElementById('profile-edit-form');
  if (pfForm) {
    pfForm.addEventListener('submit', handleProfileSave);
  }

  // Bind pricing modal upgrade and coupon buttons
  const pFree = document.getElementById('btn-pricing-free');
  if (pFree) {
    pFree.addEventListener('click', () => {
      handleChooseFreePlan();
    });
  }

  const pMonthly = document.getElementById('btn-pricing-monthly');
  if (pMonthly) {
    pMonthly.addEventListener('click', () => {
      handlePremiumUpgrade('Premium Monthly', 99);
    });
  }

  const pYearly = document.getElementById('btn-pricing-yearly');
  if (pYearly) {
    pYearly.addEventListener('click', () => {
      handlePremiumUpgrade('Premium Yearly', 999);
    });
  }

  const pfUpgrade = document.getElementById('btn-pf-upgrade');
  if (pfUpgrade) {
    pfUpgrade.addEventListener('click', () => {
      const profileOverlay = document.getElementById('profile-modal-overlay');
      if (profileOverlay) profileOverlay.style.display = 'none';
      showPricingModal();
    });
  }

  const pCoupon = document.getElementById('btn-pricing-coupon');
  if (pCoupon) {
    pCoupon.addEventListener('click', () => {
      if (state.onboardingPricing) {
        showToast("Please choose a plan to continue.", "warning");
        return;
      }
      const pricingOverlay = document.getElementById('pricing-modal-overlay');
      if (pricingOverlay) pricingOverlay.style.display = 'none';
      const couponOverlay = document.getElementById('coupon-modal-overlay');
      if (couponOverlay) couponOverlay.style.display = 'flex';
    });
  }
  
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('header-profile-dropdown');
    const profileBtn = document.getElementById('btn-header-profile');
    if (dropdown && dropdown.classList.contains('active') && profileBtn && !profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
}

// Concept Quiz Verifier for Business Academy
function verifyQuizAnswer(btnElement, radioGroupName, expectedValue, explanationText) {
  const container = btnElement.closest('.learn-quiz-box');
  const feedbackBox = container.querySelector('.quiz-feedback-box');
  const selectedRadio = container.querySelector(`input[name="${radioGroupName}"]:checked`);
  
  if (!selectedRadio) {
    showToast("Please select an option before submitting.", "warning");
    return;
  }
  
  feedbackBox.style.display = 'block';
  btnElement.disabled = true;
  
  container.querySelectorAll(`input[name="${radioGroupName}"]`).forEach(input => {
    input.disabled = true;
  });

  if (selectedRadio.value === expectedValue) {
    feedbackBox.style.background = 'rgba(0, 208, 132, 0.1)';
    feedbackBox.style.border = '1px solid rgba(0, 208, 132, 0.3)';
    feedbackBox.style.color = '#00D084';
    feedbackBox.innerHTML = `<strong>✅ Correct!</strong> ${explanationText}`;
    showToast("Concept check unlocked successfully!");
  } else {
    feedbackBox.style.background = 'rgba(255, 74, 74, 0.1)';
    feedbackBox.style.border = '1px solid rgba(255, 74, 74, 0.3)';
    feedbackBox.style.color = '#ff4a4a';
    feedbackBox.innerHTML = `<strong>❌ Incorrect.</strong> ${explanationText}`;
    showToast("Incorrect answer.", "error");
  }
}

// Downloadable templates client exporter for Business Academy
function downloadTemplate(templateName) {
  const templates = {
    'business_model_canvas': [
      "==================================================",
      "AI-OS BUSINESS PLATFORM - BUSINESS MODEL CANVAS",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "1. VALUE PROPOSITIONS:",
      "   - What value do we deliver to the customer?",
      "   - Which customer problems are we helping to solve?",
      "",
      "2. CUSTOMER SEGMENTS:",
      "   - For whom are we creating value?",
      "   - Who are our most important customers?",
      "",
      "3. CHANNELS:",
      "   - Through which channels do our customer segments want to be reached?",
      "",
      "4. CUSTOMER RELATIONSHIPS:",
      "   - How do we get, keep, and grow customers?",
      "",
      "5. REVENUE STREAMS:",
      "   - For what value are our customers really willing to pay?",
      "   - How do they pay (subscriptions, commissions, transactional)?",
      "",
      "6. KEY RESOURCES:",
      "   - What key assets are required to deliver our value proposition?",
      "",
      "7. KEY ACTIVITIES:",
      "   - What key operations are required to deliver value?",
      "",
      "8. KEY PARTNERS:",
      "   - Who are our key partners and suppliers?",
      "",
      "9. COST STRUCTURE:",
      "   - What are the most important costs inherent in our business model?",
      "   - What are the COGS and OPEX projections?",
      ""
    ].join('\n'),
    
    'marketing_distribution': [
      "==================================================",
      "AI-OS BUSINESS HUB - MARKETING DISTRIBUTION SHEET",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "CHANNEL LIST & OUTREACH METRIC MATRIX:",
      "",
      "1. COLD OUTBOUND OUTREACH (LinkedIn/Email):",
      "   - Daily Volume Goal: 40 highly targeted decision makers",
      "   - Script Outline: [Observation] + [Friction identified] + [Helpful outcome proof] + [Call to Action]",
      "   - Target Conversion Rate: 10% demo booking rate",
      "",
      "2. ORGANIC CONTENT ENGINE (Short Videos / Reels):",
      "   - Weekly Frequency: 3 videos detailing practical automations",
      "   - Target Platform: YouTube Shorts, TikTok, Instagram Reels, LinkedIn Video",
      "",
      "3. PROGRAMMATIC SEO PIPELINE:",
      "   - Niche Keyword Structure: '[Industry] Automation Service in [City Name]'",
      "   - Target Index Volume: 100 pages generated from template directories",
      "",
      "OUTREACH SCHEDULE TIMELINE:",
      "   - Week 1: Lead list creation (scrape directories for 200 qualified companies)",
      "   - Week 2: Send Loom-based video audits to top 40 prospects",
      "   - Week 3: Initiate secondary follow-up loops on positive replies",
      "   - Week 4: Analyze analytics and optimize script variables"
    ].join('\n'),
    
    'onboarding_automation': [
      "==================================================",
      "AI-OS BUSINESS PLATFORM - ONBOARDING WORKFLOW",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "Intake Flow Automations Trigger Mappings (Make.com/Zapier):",
      "",
      "[Trigger event: Stripe/Razorpay Checkout Captured successfully]",
      "  |",
      "  +--> 1. CREATE client row in Supabase database",
      "  |",
      "  +--> 2. GENERATE Google Drive folder labeled '[Client Name] Workspace'",
      "  |",
      "  +--> 3. RENDER custom Service Agreement contract from template",
      "  |      (Fill variables: client_name, date, setup_price, monthly_retainer)",
      "  |",
      "  +--> 4. SEND automated docu-sign proposal link via email",
      "  |",
      "  +--> 5. ALERT team Slack/Discord room: 'New client [Client Name] active!'"
    ].join('\n'),
    
    'pl_ledger': [
      "==================================================",
      "AI-OS BUSINESS HUB - P&L STATEMENT LEDGER SHEET",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "MONTHLY OPERATING SUMMARY:",
      "",
      "REVENUE:",
      "  - Retainer Services: ____________________ (INR/USD)",
      "  - Transaction Fees: ____________________ (INR/USD)",
      "  - Product Licenses: ____________________ (INR/USD)",
      "  - TOTAL REVENUE: ____________________ (A)",
      "",
      "COST OF GOODS SOLD (COGS):",
      "  - Freelancer Payouts: ____________________",
      "  - API Tokens & Compute: __________________",
      "  - Transaction Gateways: __________________",
      "  - TOTAL COGS: ________________________ (B)",
      "",
      "GROSS PROFIT: ________________________ (A - B = C)",
      "",
      "OPERATING EXPENSES (OPEX):",
      "  - Server Hosting: ____________________",
      "  - CRM & Support Subscriptions: _________",
      "  - Domain Registrations: _______________",
      "  - Marketing & Advertising: ____________",
      "  - TOTAL OPEX: ________________________ (D)",
      "",
      "NET OPERATING PROFIT: __________________ (C - D = NET PROFIT)",
      "NET MARGIN: __________________________ (NET PROFIT / TOTAL REVENUE) * 100"
    ].join('\n'),

    'freelance_contract': [
      "==================================================",
      "AI-OS BUSINESS PLATFORM - SERVICE AGREEMENT CONTRACT",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "This agreement is made between [Client Business Name] ('Client') and [Your Business/Agency Name] ('Service Provider').",
      "",
      "1. DESCRIPTION OF SERVICES:",
      "   Service Provider will configure and maintain autonomous operations, custom automation pipelines, and AI systems as detailed in the project specifications.",
      "",
      "2. PAYMENT TERMS:",
      "   - Setup Fee: [Setup Price] INR due upon signature of this agreement.",
      "   - Monthly Support Retainer: [Support Price] INR due on the 1st of each calendar month.",
      "",
      "3. INTELLECTUAL PROPERTY:",
      "   All custom scripts, web structures, and automation flows created specifically for the Client will belong to the Client upon full receipt of payment.",
      "",
      "4. LIMITATION OF LIABILITY:",
      "   Service Provider is not liable for indirect, incidental, or consequential damages resulting from operational tool down-time or third-party API rate adjustments.",
      "",
      "Signed,",
      "Service Provider Signature: ______________________ Date: ___________",
      "Client Signature: _______________________________ Date: ___________"
    ].join('\n')
  };

  const content = templates[templateName];
  if (!content) return;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${templateName}_template.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Business template downloaded successfully!");
}

// Bind methods globally
window.verifyQuizAnswer = verifyQuizAnswer;
window.downloadTemplate = downloadTemplate;

// Load Discovered Videos API
state.discoveredVideos = { build: [], explore: [] };
async function loadDiscoveredVideos() {
  try {
    const res = await fetch('/api/videos');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        state.discoveredVideos.build = data.buildVideos || [];
        state.discoveredVideos.explore = data.exploreVideos || [];
        console.log("Successfully auto-discovered videos:", state.discoveredVideos);
      }
    }
  } catch (e) {
    console.warn("Auto-discovery API offline. Static fallback loaded.", e);
  }
}
loadDiscoveredVideos();

const onboardingForm = document.getElementById('onboarding-form');
if (onboardingForm) {
  onboardingForm.addEventListener('submit', handleOnboardingSubmit);
}

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] Service Worker registered.', reg.scope))
      .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
  });
}
