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
  comparisonList: []         // array of tool IDs (max 3)
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
  
  const isMobile = window.innerWidth <= 768;
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
  toastEl.textContent = message;
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

function openDrawer(nodeIdx) {
  const data = toolsData[nodeIdx];
  if (!data) return;

  // Clean previous playground hooks
  if (state.activePlaygroundReset) {
    state.activePlaygroundReset();
    state.activePlaygroundReset = null;
  }

  // Populate basic text details
  document.getElementById('drawer-node-id').textContent = data.id;
  document.getElementById('drawer-title').textContent = data.title;
  document.getElementById('drawer-category').textContent = data.category;
  
  // Format description along with workflow sequence instructions
  const descEl = document.getElementById('drawer-desc');
  let descHTML = `<p>${data.description || data.desc}</p>`;
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
  descEl.innerHTML = descHTML;
  
  // Set Technical Specs
  document.getElementById('spec-rate').textContent = data.specs.rate;
  document.getElementById('spec-latency').textContent = data.specs.latency;
  document.getElementById('spec-accuracy').textContent = data.specs.accuracy;
  document.getElementById('spec-context').textContent = data.specs.context;

  // Re-inject Card Icon in drawer hero with fallback
  const originalCard = document.querySelector(`.timeline-card[data-node="${nodeIdx}"]`);
  const originalIconSvg = originalCard ? originalCard.querySelector('.card-icon').innerHTML : (data.icon || '');
  document.getElementById('drawer-icon').innerHTML = originalIconSvg;

  // Configure deploy/external button link
  document.getElementById('drawer-link-btn').setAttribute('href', data.link || data.officialUrl);

  // Setup interactive playground container
  const playgroundContainer = document.getElementById('playground-container');
  playgroundContainer.innerHTML = ''; // reset

  // Load specific module UI & Handlers
  mountPlayground(data.playground, playgroundContainer);

  // Render Recommended Alternatives
  const alternativesContainer = document.getElementById('drawer-alternatives');
  if (alternativesContainer) {
    alternativesContainer.innerHTML = '';
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
        <span class="alternative-card-price">${altTool.pricing}</span>
      `;
      altCard.addEventListener('click', (e) => {
        e.stopPropagation();
        openDrawer(altIdx);
      });
      alternativesContainer.appendChild(altCard);
    });
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

// ==========================================================================
// 6. INITIALIZATION & BINDINGS
// ==========================================================================

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
  themeToggleBtn.addEventListener('click', toggleTheme);

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
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      filterNodes(filter);
    });
  });

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

  drawerCloseBtn.addEventListener('click', closeDrawer);
  drawerCloseOverlay.addEventListener('click', closeDrawer);

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
    professional: "Professional Prompt",
    beginnerExplanation: "Beginner Explanation",
    copyBtn: "Copy Prompt",
    copied: "Copied!",
    free: "Free",
    monthly: "/ mo",
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
    professional: "प्रोफेशनल प्रॉम्प्ट (Professional)",
    beginnerExplanation: "शुरुआती गाइड (Explanation)",
    copyBtn: "प्रॉम्प्ट कॉपी करें",
    copied: "कॉपी हुआ!",
    free: "मुफ़्त",
    monthly: "/ महीना",
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
    professional: "Professional Prompt (प्रोफेशनल प्रॉम्प्ट)",
    beginnerExplanation: "Beginner Explanation (आसान हिंदी में समझें)",
    copyBtn: "Prompt Copy karein",
    copied: "Copied!",
    free: "Free",
    monthly: "/ month",
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

const goalWorkflows = {
  "Generating Video": ["Image Generator", "Video Generator", "Voice Generator", "Video Editor", "Publishing Tool"],
  "Generating Images": ["Image Generator", "Upscaler", "Editor"],
  "Designing": ["Logo Generator", "Color Palette Designer", "Layout Designer", "Editor"],
  "Coding": ["Cursor", "GitHub Copilot", "Testing Tool", "Deployment Tool"],
  "Building Apps": ["Lovable", "Bolt", "Cursor", "Deployment Platform"],
  "Tips to Earn Money": ["Earning Platform", "Monetization Tool", "Marketing Tool", "Automation Tool"],
  "Music Making": ["Suno", "Audio Enhancement Tool", "Distribution Tool"],
  "Voice Over Generation": ["Text Reader", "Voice Generator", "Voice Cloning"],
  "Brand Building": ["Logo Generator", "Branding Assistant", "Marketing Tool", "Collaboration Tool"],
  "Personal AI Building": ["Agent Creator", "Browser Agent", "Integration Platform"],
  "Help in Video Editing": ["Video Editor", "Audio Enhancement Tool", "Publishing Tool"],
  "Help in Music Editing": ["Audio Enhancement Tool", "Distribution Tool", "Collaboration Tool"],
  "Writing Work": ["Google Docs", "ChatGPT", "Editor"],
  "Hardware Building": ["IoT Platform", "IoT Design", "Predictive Maintenance"]
};

function findToolForStep(stepName, budgetLimit) {
  const nameLower = stepName.toLowerCase();
  let matchedTool = null;
  
  if (nameLower.includes("docs")) {
    matchedTool = googleDocsTool;
  } else if (nameLower.includes("chatgpt")) {
    matchedTool = chatGptTool;
  } else if (nameLower.includes("cursor")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "cursor");
  } else if (nameLower.includes("copilot")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase().includes("copilot"));
  } else if (nameLower.includes("lovable")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "lovable");
  } else if (nameLower.includes("bolt")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase().includes("bolt"));
  } else if (nameLower.includes("suno")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "suno");
  } else if (nameLower.includes("lindy")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "lindy");
  } else if (nameLower.includes("simular") || nameLower.includes("browser agent")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase().includes("simular") || t.name.toLowerCase().includes("sai"));
  } else if (nameLower.includes("looka") || nameLower.includes("logo")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "looka");
  } else if (nameLower.includes("khroma") || nameLower.includes("color")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "khroma");
  } else if (nameLower.includes("speechify") || nameLower.includes("reader")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "speechify");
  } else if (nameLower.includes("elevenlabs") || nameLower.includes("voice generator")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "elevenlabs") || toolsData.find(t => t.name.toLowerCase().includes("playht"));
  } else if (nameLower.includes("playht") || nameLower.includes("cloning")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "playht") || toolsData.find(t => t.name.toLowerCase().includes("resemble"));
  } else if (nameLower.includes("resemble")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "resemble");
  } else if (nameLower.includes("descript") || nameLower.includes("editor")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "descript") || toolsData.find(t => t.name.toLowerCase().includes("canva"));
  } else if (nameLower.includes("runway") || nameLower.includes("video generator")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "runway ml") || toolsData.find(t => t.name.toLowerCase().includes("luma"));
  } else if (nameLower.includes("hubspot") || nameLower.includes("marketing")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase().includes("hubspot"));
  } else if (nameLower.includes("zapier") || nameLower.includes("automation")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "zapier") || toolsData.find(t => t.name.toLowerCase().includes("zapier"));
  } else if (nameLower.includes("monday") || nameLower.includes("collaboration")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "monday ai");
  } else if (nameLower.includes("siemens") || nameLower.includes("iot platform")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase().includes("siemens"));
  } else if (nameLower.includes("thingworx") || nameLower.includes("iot design")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase().includes("thingworx") || t.name.toLowerCase().includes("ptc"));
  } else if (nameLower.includes("augury") || nameLower.includes("predictive")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "augury");
  } else if (nameLower.includes("c3.ai")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "c3.ai");
  } else if (nameLower.includes("checkmarx") || nameLower.includes("testing tool")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "checkmarx");
  } else if (nameLower.includes("upscaler")) {
    matchedTool = toolsData.find(t => t.name.toLowerCase() === "leonardo ai");
  }
  
  if (!matchedTool) {
    if (nameLower.includes("image")) {
      matchedTool = toolsData.find(t => t.category === "CREATION ENGINE" && t.taskTags.includes("images")) || toolsData.find(t => t.name.toLowerCase() === "midjourney");
    } else if (nameLower.includes("video")) {
      matchedTool = toolsData.find(t => t.category === "CREATION ENGINE" && t.taskTags.includes("video")) || toolsData.find(t => t.name.toLowerCase().includes("runway"));
    } else if (nameLower.includes("voice") || nameLower.includes("audio")) {
      matchedTool = toolsData.find(t => t.category === "CREATION ENGINE" && t.taskTags.includes("audio")) || toolsData.find(t => t.name.toLowerCase() === "elevenlabs");
    } else if (nameLower.includes("code") || nameLower.includes("dev")) {
      matchedTool = toolsData.find(t => t.category === "ENGINEERING ENGINE" && t.taskTags.includes("codegen")) || toolsData.find(t => t.name.toLowerCase() === "cursor");
    }
  }

  if (!matchedTool) {
    matchedTool = toolsData[0];
  }

  let mode = "Free";
  let cost = 0;
  
  if (budgetLimit > 0 && matchedTool.cost > 0 && matchedTool.cost <= budgetLimit) {
    mode = "Paid";
    cost = matchedTool.cost;
  } else {
    mode = matchedTool.freeTier ? "Free" : "Paid";
    cost = matchedTool.freeTier ? 0 : matchedTool.cost;
  }

  return { tool: matchedTool, mode, cost };
}

function generatePrompts(toolName, goal, lang) {
  const t = toolName.toLowerCase();
  
  let starter = "";
  let pro = "";
  let exp = "";
  let purpose = "";
  let why = "";
  let expectedOutput = "";
  let cost = "Free";
  let time = "30 mins";
  let alternatives = "";
  
  const labels = translationDB[lang] || translationDB["Hinglish"];

  if (t.includes("docs")) {
    purpose = labels.docsPurpose;
    why = labels.docsWhy;
    expectedOutput = labels.docsOutput;
    starter = labels.docsStarterPrompt + ` [Goal: ${goal}]`;
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
        pro = `Generate a cinematic, hyper-detailed render for ${goal}, photorealistic, dramatic lighting, shot on 35mm lens, 8k resolution.`;
        exp = "Provide clear descriptions of elements, colors, and camera styles.";
      } else if (lang === "Hindi") {
        purpose = "शानदार विज़ुअल आर्ट और ग्राफिक्स बनाना।";
        why = `${toolName} टेक्स्ट विवरण से व्यावसायिक गुणवत्ता वाली छवियां बनाता है।`;
        expectedOutput = "उच्च रिज़ॉल्यूशन वाली JPG/PNG फ़ाइलें।";
        starter = `${goal} के लिए एक वास्तविक छवि बनाएं, साफ़ संरचना, स्पष्ट विवरण।`;
        pro = `${goal} के लिए एक सिनेमाई, अत्यधिक विस्तृत रेंडर, नाटकीय प्रकाश व्यवस्था, 35 मिमी लेंस, 8k रिज़ॉल्यूशन।`;
        exp = "चित्र के तत्वों, रंगों और कैमरा शैली का स्पष्ट विवरण प्रदान करें।";
      } else {
        purpose = "High-quality visual graphics aur illustrations design karna.";
        why = `${toolName} textual description se creative visual designs generate karta hai.`;
        expectedOutput = "High-resolution JPG/PNG photo assets.";
        starter = `Create an image representing ${goal}, dynamic colors, simple layout.`;
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
        pro = `Generate a cinematic slow-motion sequence for ${goal}, fluid movement, detailed textures, realistic physics, 4k resolution.`;
        exp = "Keep animation prompts focused on motion, cameras, and physical actions.";
      } else if (lang === "Hindi") {
        purpose = "स्थिर छवियों को चलती हुई सिनेमाई क्लिप्स में बदलना।";
        why = "स्थिर फ़्रेमों को सहज, गति-संगत सिनेमाई वीडियो में अनुवादित करता है।";
        expectedOutput = "4-सेकंड की MP4 वीडियो क्लिप्स।";
        starter = `${goal} के लिए सीन को घुमाते हुए कैमरे के साथ एनिमेट करें।`;
        pro = `${goal} के लिए एक सिनेमाई धीमी गति का क्रम, तरल गति, विस्तृत बनावट, यथार्थवादी भौतिकी, 4k रिज़ॉल्यूशन।`;
        exp = "एनिमेशन प्रॉम्प्ट को मुख्य रूप से गति, कैमरे के कोण और भौतिक क्रियाओं पर केंद्रित रखें।";
      } else {
        purpose = "Static frames ko clean high-motion videos me convert karna.";
        why = "Yeh static photos ko motion-consistent smooth cinematic frames me convert karta hai.";
        expectedOutput = "4-second timeline MP4 video files.";
        starter = `Animate this frame for ${goal} with soft camera rotation.`;
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
        pro = `Synthesize an authoritative, professional voiceover for ${goal}, medium pace, clear enunciation, natural pauses, optimized for advertising.`;
        exp = "Input text scripts with commas and punctuation to control pauses and speech pacing.";
      } else if (lang === "Hindi") {
        purpose = "यथार्थवादी वॉयस नैरेशन ट्रैक तैयार करना।";
        why = "ऑडियो ड्राफ्ट स्क्रिप्ट को गतिशील भावनाओं के साथ प्राकृतिक आवाज में बदलता है।";
        expectedOutput = "उच्च गुणवत्ता वाली WAV/MP3 ऑडियो फ़ाइलें।";
        starter = `${goal} के लिए स्क्रिप्ट को पढ़ते हुए एक वॉयसओवर जनरेट करें।`;
        pro = `${goal} के लिए विज्ञापन के अनुकूल व्यावसायिक वॉयसओवर, मध्यम गति, स्पष्ट उच्चारण, प्राकृतिक ठहराव।`;
        exp = "आवाज के ठहराव और बोलने की गति को नियंत्रित करने के लिए टेक्स्ट में विराम चिह्नों का उपयोग करें।";
      } else {
        purpose = "Clean voiceover dubbing aur narration audios generate karna.";
        why = "Yeh text ko emotional range ke sath realistic human voices me speech convert karta hai.";
        expectedOutput = "High-fidelity WAV/MP3 voice files.";
        starter = `Generate a natural voiceover reading this script: ${goal}.`;
        pro = `Synthesize professional narrator voice for ${goal}, clear accent, balanced pitch, studio quality output.`;
        exp = "Script me commas aur full stops lagayein taaki voice flow natural sound kare.";
      }
    } else if (t.includes("cursor") || t.includes("copilot") || t.includes("code") || t.includes("replit") || t.includes("tabnine") || t.includes("cody") || t.includes("windsurf")) {
      alternatives = "Cursor, GitHub Copilot, VS Code";
      cost = "$20 / mo";
      if (lang === "English") {
        purpose = "Generate code blocks, script files, and refactor lines.";
        why = "Autocompletes statements and explains syntax, accelerating coding speeds.";
        expectedOutput = "Operational program source code files.";
        starter = `Write a script to implement ${goal} using standard libraries.`;
        pro = `Construct a highly optimized, fully typed component for ${goal}, include error handling, unit tests, and performance profiles.`;
        exp = "Provide comments explaining input arguments, return types, and context.";
      } else if (lang === "Hindi") {
        purpose = "कोड ब्लॉक, स्क्रिप्ट फ़ाइलें लिखना और लाइनों को व्यवस्थित करना।";
        why = "यह वाक्यों को पूरा करता है और सिंटैक्स समझाता है, जिससे कोडिंग की गति बढ़ जाती है।";
        expectedOutput = "परिचालन योग्य प्रोग्राम सोर्स कोड फ़ाइलें।";
        starter = `${goal} को लागू करने के लिए एक मानक स्क्रिप्ट लिखें।`;
        pro = `${goal} के लिए अत्यधिक अनुकूलित घटक बनाएं, जिसमें त्रुटि प्रबंधन और यूनिट परीक्षण शामिल हों।`;
        exp = "इनपुट आर्गुमेंट्स, रिटर्न टाइप और संदर्भ को समझाते हुए टिप्पणियां (Comments) लिखें।";
      } else {
        purpose = "Operational code blocks, scripts aur programs write karna.";
        why = "Yeh code blocks auto-complete karta hai aur complex syntax errors explain karta hai.";
        expectedOutput = "Operatable backend/frontend code files.";
        starter = `Write a function to build ${goal} cleanly.`;
        pro = `Generate production-ready code structure for ${goal}, handle edge cases, write test blocks, keep it performant.`;
        exp = "Comments likh kar inputs aur parameters detail me specify karein.";
      }
    } else if (t.includes("lovable") || t.includes("bolt") || t.includes("v0") || t.includes("replit")) {
      alternatives = "Lovable, Bolt.new, v0.dev";
      cost = "Freemium / $20 / mo";
      if (lang === "English") {
        purpose = "Build complete web apps directly from conversational prompts.";
        why = "Generates frontend and backend interfaces, databases, and deployment slots in one tool.";
        expectedOutput = "Fully interactive deployed web app link.";
        starter = `Build a web application for ${goal} with modern dark UI.`;
        pro = `Create a full-stack dashboard for ${goal}, including user authentication, mock database listings, chart analytics, and responsive grid panels.`;
        exp = "Explain step-by-step what components you need and how they interact.";
      } else if (lang === "Hindi") {
        purpose = "संवादात्मक संकेतों से सीधे संपूर्ण वेब ऐप बनाना।";
        why = "यह एक ही टूल में फ्रंटएंड, बैकएंड इंटरफेस, डेटाबेस और होस्टिंग लिंक तैयार करता है।";
        expectedOutput = "पूरी तरह से चालू और होस्ट किया गया वेब ऐप लिंक।";
        starter = `आधुनिक डार्क थीम के साथ ${goal} के लिए एक वेब एप्लीकेशन बनाएं।`;
        pro = `${goal} के लिए एक फुल-स्टैक डैशबोर्ड बनाएं, जिसमें उपयोगकर्ता प्रमाणीकरण, डेटाबेस और चार्ट शामिल हों।`;
        exp = "चरण-दर-चरण समझाएं कि आपको कौन से घटकों की आवश्यकता है और वे कैसे काम करेंगे।";
      } else {
        purpose = "Conversational chat se direct functional web applications banana.";
        why = "Yeh full-stack layout, database aur cloud deployment single prompt se manage karta hai.";
        expectedOutput = "Live working web app URL link.";
        starter = `Build a complete application for ${goal} using React and Tailwind.`;
        pro = `Create responsive multi-page dashboard for ${goal}, mock CRUD actions, stats graphs, dark mode toggles.`;
        exp = "Application modules aur database elements ko point-by-point chat me explain karein.";
      }
    } else if (t.includes("suno") || t.includes("aiva") || t.includes("music")) {
      alternatives = "Suno, Udio, AIVA";
      cost = "Freemium / $8 / mo";
      if (lang === "English") {
        purpose = "Generate complete music tracks, instrumentation, and vocals.";
        why = "Transforms lyric sheets and genre tags into broadcast-quality stereo music audio.";
        expectedOutput = "High-quality MP3 audio music tracks.";
        starter = `Generate a song about ${goal} in dynamic style.`;
        pro = `Synthesize a high-fidelity stereo track for ${goal}, electronic elements, crisp vocals, studio production master.`;
        exp = "Specify genre tags (e.g. ambient, cinematic, synthwave) and lyrics outlines.";
      } else if (lang === "Hindi") {
        purpose = "संगीत ट्रैक, वाद्ययंत्र और गायन तैयार करना।";
        why = "गीत और संगीत की शैली के आधार पर प्रसारण-गुणवत्ता वाला संगीत ऑडियो बनाता है।";
        expectedOutput = "उच्च गुणवत्ता वाले MP3 ऑडियो संगीत ट्रैक।";
        starter = `गतिशील शैली में ${goal} के बारे में एक गीत बनाएं।`;
        pro = `${goal} के लिए एक उच्च-गुणवत्ता वाला स्टीरियो ट्रैक, इलेक्ट्रॉनिक बीट्स, स्पष्ट स्वर, स्टूडियो प्रोडक्शन मास्टर।`;
        exp = "संगीत की शैली (जैसे एम्बिएंट, सिनेमाई, सिंथवेव) और गीतों की रूपरेखा निर्दिष्ट करें।";
      } else {
        purpose = "Lyrics aur genre input se high-fidelity music aur vocal audio tracks generate karna.";
        why = "Yeh dynamic genre descriptions ko studio-mastered vocal stereo tracks me render karta hai.";
        expectedOutput = "Broadcast-quality MP3 sound files.";
        starter = `Generate a song about ${goal} in pop rock style.`;
        pro = `Synthesize a synthwave instrumental track for ${goal}, deep basslines, modular synths, clear melodies.`;
        exp = "Genre keywords (jaise lo-fi, progressive house, synthwave) prompts me include karein.";
      }
    } else {
      alternatives = "Similar AI engines in Explore Library";
      if (lang === "English") {
        purpose = `Optimize tasks for ${goal} using advanced machine models.`;
        why = "Automates operational tasks to increase workflow efficiency.";
        expectedOutput = "Processed data outputs or automated task actions.";
        starter = `Configure and deploy settings to automate ${goal}.`;
        pro = `Design an enterprise integration schema for ${goal}, handling exception loops, caching, and analytics outputs.`;
        exp = "Access settings and connect API keys to sync with external platforms.";
      } else if (lang === "Hindi") {
        purpose = `उन्नत मशीन मॉडलों का उपयोग करके ${goal} के कार्यों को अनुकूलित करना।`;
        why = "कार्यकुशलता बढ़ाने के लिए परिचालन कार्यों को स्वचालित करता है।";
        expectedOutput = "संसाधित डेटा आउटपुट या स्वचालित कार्य क्रियाएं।";
        starter = `${goal} को स्वचालित करने के लिए सेटिंग्स को कॉन्फ़िगर और डिप्लॉय करें।`;
        pro = `${goal} के लिए एक एंटरप्राइज एकीकरण योजना डिज़ाइन करें, जो अपवाद लूप और कैशिंग को संभाल सके।`;
        exp = "बाहरी प्लेटफ़ॉर्म के साथ सिंक करने के लिए सेटिंग्स तक पहुँचें और एपीआई कुंजियाँ कनेक्ट करें।";
      } else {
        purpose = `Advanced models ki madad se ${goal} ke steps automate aur optimize karna.`;
        why = "Yeh steps ko programmatic rule base se automate karke efficiency badhata hai.";
        expectedOutput = "Automated workflows aur compiled data.";
        starter = `Set up automated actions for ${goal} using dynamic configuration.`;
        pro = `Integrate industrial API hooks to sync ${goal} workflow, log operations, keep dashboards updated.`;
        exp = "Connect keys aur parameters specify karke database sync set karein.";
      }
    }
  }

  return { starter, pro, exp, purpose, why, expectedOutput, cost, time, alternatives };
}

function getActiveLanguage() {
  const wizardSelect = document.getElementById('wizard-lang-select');
  const headerSelect = document.getElementById('header-lang-select');
  return wizardSelect ? wizardSelect.value : (headerSelect ? headerSelect.value : 'Hinglish');
}

function syncLanguageSelectors() {
  const wizardSelect = document.getElementById('wizard-lang-select');
  const headerSelect = document.getElementById('header-lang-select');
  
  if (wizardSelect && headerSelect) {
    wizardSelect.addEventListener('change', (e) => {
      headerSelect.value = e.target.value;
      if (state.goalText) {
        regenerateActiveRoadmap();
      }
    });
    headerSelect.addEventListener('change', (e) => {
      wizardSelect.value = e.target.value;
      if (state.goalText) {
        regenerateActiveRoadmap();
      }
    });
  }
}

function regenerateActiveRoadmap() {
  const selectedGoal = state.goalText;
  if (!selectedGoal) return;
  
  const budgetLimit = state.budgetLimit || 100;
  
  if (selectedGoal === "Exploring the World of AI") {
    renderLearningJourney();
  } else {
    const specSteps = goalWorkflows[selectedGoal] || goalWorkflows["Generating Video"];
    
    // Construct prefix tools (Google Docs and ChatGPT)
    const prefixTools = [
      findToolForStep("Google Docs", budgetLimit),
      findToolForStep("ChatGPT", budgetLimit)
    ];
    
    // Map specialized tools
    const specTools = specSteps.map(s => findToolForStep(s, budgetLimit));
    const fullWorkflow = [...prefixTools, ...specTools];
    
    // Construct steps labels matching translations
    const activeLang = getActiveLanguage();
    const trans = stepsTranslation[activeLang] || stepsTranslation["Hinglish"];
    
    const stepsList = [
      trans["Google Docs"] || "Google Docs",
      trans["ChatGPT"] || "ChatGPT",
      ...specSteps.map(s => trans[s] || s)
    ];
    
    const sectionSubtitle = document.querySelector('#roadmap-builder-section .section-subtitle');
    if (sectionSubtitle) {
      const totalCost = fullWorkflow.reduce((sum, item) => sum + item.cost, 0);
      const activeBudgetBtn = document.querySelector('.budget-tier-btn.active');
      
      let text = "";
      if (activeLang === "English") {
        text = `Custom-compiled <strong>${selectedGoal}</strong> toolchain for goal: <em>"${selectedGoal}"</em>.<br>Budget: <strong>$${totalCost} / mo</strong> used of $${budgetLimit} threshold. Language: <strong>${activeLang}</strong>.`;
      } else if (activeLang === "Hindi") {
        text = `लक्ष्य के लिए कस्टम-कंपाइल की गई <strong>${selectedGoal}</strong> टूलचेन: <em>"${selectedGoal}"</em>.<br>बजट: $${budgetLimit} की सीमा में से <strong>$${totalCost} / महीना</strong> उपयोग किया गया। भाषा: <strong>${activeLang}</strong>।`;
      } else {
        text = `Custom-compiled <strong>${selectedGoal}</strong> toolchain for goal: <em>"${selectedGoal}"</em>.<br>Budget: $${budgetLimit} key limit me se <strong>$${totalCost} / month</strong> use hua. Language: <strong>${activeLang}</strong>.`;
      }
      sectionSubtitle.innerHTML = text;
    }
    
    renderRoadmap(fullWorkflow, stepsList);
  }
}

function renderLearningJourney() {
  const listContainer = document.querySelector('.timeline-list');
  if (!listContainer) return;
  
  const roadSvg = document.getElementById('road-svg');
  const roadTraveler = document.getElementById('road-traveler');
  if (roadSvg) roadSvg.style.display = 'none';
  if (roadTraveler) roadTraveler.style.display = 'none';
  
  const activeLang = getActiveLanguage();
  
  let headerTitle = "Exploring the World of AI";
  let headerDesc = "Navigate the full expanse of artificial intelligence through structured learning pillars.";
  let futureTitle = "Future of AI";
  let futureDesc = "The horizon belongs to Agentic Workflows, Autonomous Swarms, and Multimodal World Models. Keep testing, keep building.";
  
  if (activeLang === "Hindi") {
    headerTitle = "एआई की दुनिया की खोज (Exploring the World of AI)";
    headerDesc = "व्यवस्थित शिक्षा स्तंभों के माध्यम से कृत्रिम बुद्धिमत्ता (AI) के पूर्ण क्षेत्र को समझें।";
    futureTitle = "एआई का भविष्य (Future of AI)";
    futureDesc = "भविष्य एजेंटिक वर्कफ़्लो, स्वायत्त प्रणालियों और मल्टीमॉडल विश्व मॉडलों का है। परीक्षण करते रहें, निर्माण करते रहें।";
  } else if (activeLang === "Hinglish") {
    headerTitle = "Exploring the World of AI";
    headerDesc = "Structured learning categories ki madad se Artificial Intelligence ki poori space ko explore karein.";
    futureTitle = "Future of AI";
    futureDesc = "Agla frontier Agentic Workflows, Autonomous AI Swarms aur Multimodal Systems ka hai. Naye tools explore karein aur code karte rahein.";
  }

  const freeTools = toolsData.filter(t => t.freeTier || t.cost === 0).slice(0, 4);
  const paidTools = toolsData.filter(t => !t.freeTier && t.cost > 0).slice(0, 4);
  const studentTools = toolsData.filter(t => t.industries && t.industries.includes("Education & Research")).slice(0, 4);
  const businessTools = toolsData.filter(t => t.industries && t.industries.includes("Business Operations & Productivity")).slice(0, 4);
  const creativeTools = toolsData.filter(t => t.industries && t.industries.includes("Creative & Media Industries")).slice(0, 4);
  const devTools = toolsData.filter(t => t.taskTags && (t.taskTags.includes("codegen") || t.taskTags.includes("autocomplete") || t.taskTags.includes("code"))).slice(0, 4);
  const startupTools = toolsData.filter(t => t.industries && (t.industries.includes("Finance & Banking") || t.industries.includes("Transportation & Logistics"))).slice(0, 4);

  const sectionsData = [
    {
      title: activeLang === "English" ? "What is AI" : activeLang === "Hindi" ? "एआई क्या है?" : "What is AI?",
      desc: activeLang === "English" ? "Artificial Intelligence represents neural networks trained on high-density datasets to resolve logical, visual, and operational queries." : 
            activeLang === "Hindi" ? "कृत्रिम बुद्धिमत्ता (AI) उच्च-घनत्व डेटासेट पर प्रशिक्षित तंत्रिका नेटवर्क (neural networks) का प्रतिनिधित्व करती है जो तार्किक और परिचालन प्रश्नों को हल करती है।" :
            "Artificial Intelligence ka matlab neural networks aur deep learning models hain jo complex tasks, automation aur analysis ko easily solve karte hain.",
      tools: []
    },
    {
      title: activeLang === "English" ? "Best Free AI Tools" : activeLang === "Hindi" ? "सर्वश्रेष्ठ मुफ़्त एआई टूल्स" : "Best Free AI Tools",
      desc: activeLang === "English" ? "Start immediately without subscription costs using production-grade open endpoints." : 
            activeLang === "Hindi" ? "बिना किसी सशुल्क सदस्यता के व्यावसायिक-श्रेणी के ओपन एंडपॉइंट्स का उपयोग करके तुरंत शुरुआत करें।" :
            "Bina subscription cost ke industry-grade free platforms aur sandbox editors ka maza lein.",
      tools: freeTools
    },
    {
      title: activeLang === "English" ? "Best Paid AI Tools" : activeLang === "Hindi" ? "सर्वश्रेष्ठ सशुल्क एआई टूल्स" : "Best Paid AI Tools",
      desc: activeLang === "English" ? "Premium workflows and generative outputs unlocking advanced compute and parameter models." : 
            activeLang === "Hindi" ? "प्रीमियम वर्कफ़्लो और जनरेटिव आउटपुट जो उन्नत कंप्यूटिंग और बड़े पैरामीटर मॉडल की शक्ति का उपयोग करते हैं।" :
            "Top performance aur premium features wale professional tools jo advanced models use karte hain.",
      tools: paidTools
    },
    {
      title: activeLang === "English" ? "AI for Students" : activeLang === "Hindi" ? "छात्रों के लिए एआई" : "AI for Students",
      desc: activeLang === "English" ? "Accelerate learning, literature sweeps, thesis outline drafts, and interactive explanations." : 
            activeLang === "Hindi" ? "सीखने की प्रक्रिया को तेज़ करें, शोध पत्रों का अध्ययन करें और इंटरैक्टिव स्पष्टीकरण प्राप्त करें।" :
            "Study helper tools jo learning curves, notes summaries aur coding validation ko aasan banate hain.",
      tools: studentTools
    },
    {
      title: activeLang === "English" ? "AI for Businesses" : activeLang === "Hindi" ? "व्यवसायों के लिए एआई" : "AI for Businesses",
      desc: activeLang === "English" ? "Enhance team tracking, CRM ticket automation, audit logs, and meeting telemetries." : 
            activeLang === "Hindi" ? "टीम ट्रैकिंग, सीआरएम टिकट ऑटोमेशन और मीटिंग के विवरणों को स्वचालित और व्यवस्थित करें।" :
            "Operations, data tracking aur automatic ticket replies se corporate team productivity badhayein.",
      tools: businessTools
    },
    {
      title: activeLang === "English" ? "AI for Content Creators" : activeLang === "Hindi" ? "क्रिएटर्स के लिए एआई" : "AI for Content Creators",
      desc: activeLang === "English" ? "Animate video clips, dub script narration waveforms, and design graphic concept arts." : 
            activeLang === "Hindi" ? "वीडियो क्लिप्स एनिमेट करें, स्क्रिप्ट नैरेशन डब करें और ग्राफिक्स डिज़ाइन करें।" :
            "Cinematic scenes animate karein, script writing automate karein aur vocal audio overlays add karein.",
      tools: creativeTools
    },
    {
      title: activeLang === "English" ? "AI for Developers" : activeLang === "Hindi" ? "डेवलपर्स के लिए एआई" : "AI for Developers",
      desc: activeLang === "English" ? "Autogenerate block statements, setup cloud-ide sandboxes, and inspect dynamic scripts." : 
            activeLang === "Hindi" ? "कोड ब्लॉक जनरेट करें, क्लाउड सैंडबॉक्स सेट करें और डायनामिक स्क्रिप्ट का परीक्षण करें।" :
            "IDE autocomplete extensions, sandbox rapid application builders aur operatable code builders.",
      tools: devTools
    },
    {
      title: activeLang === "English" ? "AI for Startups" : activeLang === "Hindi" ? "स्टार्टअप्स के लिए एआई" : "AI for Startups",
      desc: activeLang === "English" ? "Construct multi-agent trigger cron chains and optimize logistics route schedules." : 
            activeLang === "Hindi" ? "मल्टी-एजेंट शेड्यूलिंग और लॉजिस्टिक्स रूटिंग वर्कफ़्लो को स्वचालित करें।" :
            "Autonomous multi-agent workflows, API integrations aur dynamic operations automation modules.",
      tools: startupTools
    }
  ];

  let html = `
    <div class="learning-journey-container">
      <div class="learning-journey-header">
        <h1 class="learning-journey-title">${headerTitle}</h1>
        <p class="learning-journey-subtitle">${headerDesc}</p>
      </div>
      
      <div class="learning-grid">
  `;

  sectionsData.forEach(section => {
    let toolsHTML = '';
    if (section.tools.length > 0) {
      toolsHTML = `
        <div class="learning-card-tools">
          ${section.tools.map(tool => {
            const originalIdx = toolsData.findIndex(t => t.id === tool.id);
            return `<span class="learning-tool-badge" data-node="${originalIdx}">${tool.name}</span>`;
          }).join('')}
        </div>
      `;
    }
    
    html += `
      <div class="learning-card">
        <h3 class="learning-card-title">${section.title}</h3>
        <p class="learning-card-desc">${section.desc}</p>
        ${toolsHTML}
      </div>
    `;
  });

  html += `
        <div class="learning-card learning-journey-future-card">
          <h3 class="learning-card-title">${futureTitle}</h3>
          <p class="learning-card-desc">${futureDesc}</p>
        </div>
      </div>
    </div>
  `;

  listContainer.innerHTML = html;
  
  const badges = listContainer.querySelectorAll('.learning-tool-badge');
  badges.forEach(badge => {
    badge.addEventListener('click', (e) => {
      const idx = parseInt(badge.getAttribute('data-node'));
      if (!isNaN(idx)) {
        openDrawer(idx);
      }
    });
  });
}

function initWizard() {
  const wizardOverlay = document.getElementById('wizard-overlay');
  const submitBtn = document.getElementById('wizard-submit');
  const mainWrapper = document.getElementById('main-content-wrapper');

  const expBtns = document.querySelectorAll('.exp-opt-btn');
  expBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      expBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const budgetBtns = document.querySelectorAll('.budget-tier-btn');
  budgetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      budgetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  syncLanguageSelectors();

  document.body.style.overflow = 'hidden';

  submitBtn.addEventListener('click', () => {
    const goalSelect = document.getElementById('wizard-goal-select');
    const selectedGoal = goalSelect ? goalSelect.value : 'Exploring the World of AI';

    const activeExpBtn = document.querySelector('.exp-opt-btn.active');
    const selectedExperience = activeExpBtn ? activeExpBtn.getAttribute('data-exp') : 'Intermediate';

    const activeBudgetBtn = document.querySelector('.budget-tier-btn.active');
    const budgetLimit = activeBudgetBtn ? parseInt(activeBudgetBtn.getAttribute('data-budget')) : 100;

    state.goalText = selectedGoal;
    state.selectedExperience = selectedExperience;
    state.budgetLimit = budgetLimit;
    
    regenerateActiveRoadmap();

    wizardOverlay.style.opacity = '0';
    setTimeout(() => {
      wizardOverlay.style.visibility = 'hidden';
    }, 800);
    mainWrapper.classList.add('active');
    document.body.style.overflow = '';

    setTimeout(() => {
      drawRoad();
    }, 150);
  });
}

function renderRoadmap(optimalWorkflow, steps) {
  const listContainer = document.querySelector('.timeline-list');
  if (!listContainer) return;
  
  listContainer.innerHTML = '';
  
  if (!optimalWorkflow || optimalWorkflow.length === 0) {
    listContainer.innerHTML = `
      <div class="timeline-row left" style="grid-template-columns: 1fr; text-align: center; justify-content: center; padding-top: 100px;">
        <div class="timeline-card visible" style="margin: 0 auto; max-width: 500px;">
          <h2 class="card-title">NO NODES COMPILED</h2>
          <p class="card-desc">No systems match your criteria. Expand your budget threshold or alter your goal target.</p>
          <button class="btn btn-primary btn-full" onclick="resetWizard()">Re-configure Target</button>
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
  
  setupCardInteractions();
}

window.resetWizard = function() {
  const wizardOverlay = document.getElementById('wizard-overlay');
  const mainWrapper = document.getElementById('main-content-wrapper');
  
  mainWrapper.classList.remove('active');
  wizardOverlay.style.opacity = '1';
  wizardOverlay.style.visibility = 'visible';
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
    html += `<td><strong>${tool.pricing || `$${tool.cost}`}</strong><br><small>${tool.freeTier ? 'Free Tier Available' : 'Premium Only'}</small></td>`;
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
  let costStr = '';
  if (effectiveCost !== null) {
    costStr = effectiveCost === 0 ? 'FREE TIER' : `$${effectiveCost} / mo`;
  } else {
    costStr = tool.cost === 0 ? 'FREE TIER' : `$${tool.cost} / mo`;
  }
  
  const badgeOrNumber = isTimeline 
    ? `
      <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
        <span class="timeline-step-badge">STEP ${stepIndex} // ${stepName.toUpperCase()}</span>
        <span class="card-number" style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.12em; color: var(--text-secondary); text-transform: uppercase;">
          ${tool.id} // ${costStr} ${effectiveMode ? '(' + effectiveMode + ')' : ''}
        </span>
      </div>
      `
    : `
      <div class="card-badges">
        <span class="card-badge price-badge">${tool.cost === 0 ? 'FREE' : `$${tool.cost}`}</span>
        ${tool.industries ? tool.industries.map(ind => `<span class="card-badge industry-badge">${ind}</span>`).join('') : ''}
      </div>
    `;

  let detailsHTML = '';
  if (isTimeline) {
    const lang = getActiveLanguage();
    const labels = translationDB[lang] || translationDB["Hinglish"];
    const details = generatePrompts(tool.name, state.goalText || '', lang);
    
    detailsHTML = `
      <div class="card-details-section">
        <!-- Purpose -->
        <div class="card-detail-item">
          <span class="card-detail-label">${labels.purpose}</span>
          <span class="card-detail-value">${details.purpose}</span>
        </div>
        
        <!-- Why This Tool -->
        <div class="card-detail-item">
          <span class="card-detail-label">${labels.whyThisTool}</span>
          <span class="card-detail-value">${details.why}</span>
        </div>
        
        <!-- Expected Output -->
        <div class="card-detail-item">
          <span class="card-detail-label">${labels.expectedOutput}</span>
          <span class="card-detail-value">${details.expectedOutput}</span>
        </div>
        
        <!-- Master Prompt block -->
        <div class="card-detail-item">
          <span class="card-detail-label">${labels.masterPrompt}</span>
          
          <!-- Starter Prompt -->
          <div class="prompt-container">
            <div class="prompt-header">
              <span class="card-detail-label" style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0; text-transform: uppercase;">${labels.starter}</span>
              <button class="prompt-copy-btn" data-text="${escapeHTML(details.starter)}">${labels.copyBtn}</button>
            </div>
            <div class="prompt-box">${escapeHTML(details.starter)}</div>
          </div>
          
          <!-- Professional Prompt -->
          <div class="prompt-container" style="margin-top: 8px;">
            <div class="prompt-header">
              <span class="card-detail-label" style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0; text-transform: uppercase;">${labels.professional}</span>
              <button class="prompt-copy-btn" data-text="${escapeHTML(details.pro)}">${labels.copyBtn}</button>
            </div>
            <div class="prompt-box">${escapeHTML(details.pro)}</div>
          </div>
          
          <!-- Beginner Explanation -->
          <div style="margin-top: 8px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
            <strong style="color: var(--text-primary); font-family: var(--font-mono); font-size: 0.7rem; text-transform: uppercase;">${labels.beginnerExplanation}:</strong> ${details.exp}
          </div>
        </div>
        
        <!-- Alternative Tools -->
        <div class="card-detail-item">
          <span class="card-detail-label">${labels.alternativeTools}</span>
          <span class="card-detail-value">${details.alternatives}</span>
        </div>
        
        <!-- Estimated Cost & Time -->
        <div style="display: flex; gap: 20px; margin-top: 4px;">
          <div class="card-detail-item" style="flex: 1;">
            <span class="card-detail-label">${labels.estimatedCost}</span>
            <span class="card-detail-value" style="font-weight: 600;">${details.cost}</span>
          </div>
          <div class="card-detail-item" style="flex: 1;">
            <span class="card-detail-label">${labels.estimatedTime}</span>
            <span class="card-detail-value" style="font-weight: 600;">${details.time}</span>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="card-glow"></div>
    <div class="card-fav-compare-actions">
      <button class="card-action-btn fav-star ${isFav ? 'active' : ''}" title="Add to Favorites" data-id="${tool.id}">
        ★
      </button>
      <button class="card-action-btn compare-check ${isCompared ? 'active' : ''}" title="Compare" data-id="${tool.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    </div>
    <div class="card-header">
      <div class="card-icon">
        ${tool.icon}
      </div>
      ${badgeOrNumber}
    </div>
    <h2 class="card-title">${tool.title}</h2>
    <p class="card-desc">${tool.desc}</p>
    ${detailsHTML}
    <div class="card-footer">
      <button class="btn btn-secondary inspect-btn">Inspect Engine</button>
      <a href="${tool.officialUrl || tool.link || '#'}" target="_blank" rel="noopener" class="btn btn-icon" aria-label="External Link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </a>
    </div>
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
    libraryFilterChipsContainer.innerHTML = `<button class="filter-chip active" data-chip="all">All Sectors</button>`;
    
    industriesList.forEach(sector => {
      const count = toolsData.filter(t => t.industries && t.industries.includes(sector)).length;
      if (count > 0) {
        const chip = document.createElement('button');
        chip.className = 'filter-chip';
        chip.setAttribute('data-chip', sector);
        chip.textContent = sector;
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
    libraryGrid.removeAttribute('style');
    libraryGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; border: 1px dashed var(--border-color); border-radius: 12px; color: var(--text-secondary);">
        <h4 style="font-family: var(--font-mono); font-size: 1rem; color: var(--text-primary); margin-bottom: 8px; text-transform: uppercase;">NO SERVICES MATCH FILTERS</h4>
        <p style="font-size: 0.85rem;">Modify search keywords or select a different industry chip.</p>
      </div>
    `;
    return;
  }
  
  if (state.viewMode === 'grid') {
    libraryGrid.removeAttribute('style');
    libraryGrid.className = 'library-grid';
    filtered.forEach(tool => {
      const originalIndex = toolsData.findIndex(t => t.id === tool.id);
      const cardEl = document.createElement('div');
      cardEl.className = 'timeline-card library-item-card visible';
      cardEl.setAttribute('data-node', originalIndex);
      const isFav = isFavorite(tool.id);
      const isCompared = state.comparisonList.includes(tool.id);
      cardEl.innerHTML = createCardHTML(tool, originalIndex, isFav, isCompared, false);
      libraryGrid.appendChild(cardEl);
    });
  } else if (state.viewMode === 'list') {
    libraryGrid.removeAttribute('style');
    libraryGrid.className = 'library-grid list-view';
    filtered.forEach(tool => {
      const originalIndex = toolsData.findIndex(t => t.id === tool.id);
      const cardEl = document.createElement('div');
      cardEl.className = 'timeline-card library-item-card visible';
      cardEl.setAttribute('data-node', originalIndex);
      const isFav = isFavorite(tool.id);
      const isCompared = state.comparisonList.includes(tool.id);
      cardEl.innerHTML = createCardHTML(tool, originalIndex, isFav, isCompared, false);
      libraryGrid.appendChild(cardEl);
    });
  } else if (state.viewMode === 'category') {
    libraryGrid.className = '';
    libraryGrid.style.display = 'flex';
    libraryGrid.style.flexDirection = 'column';
    libraryGrid.style.gap = '40px';
    libraryGrid.style.width = '100%';
    
    // Output grouped by category in exact order of industriesList
    industriesList.forEach(category => {
      const catTools = filtered.filter(tool => tool.industries && tool.industries.includes(category));
      
      if (catTools.length > 0) {
        const groupWrap = document.createElement('div');
        groupWrap.className = 'category-group-wrap';
        
        groupWrap.innerHTML = `
          <div class="category-group-title">
            <span>${category}</span>
            <span class="category-group-count">${catTools.length} Node${catTools.length === 1 ? '' : 's'}</span>
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
      }
    });
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
    
    const li = document.createElement('li');
    li.className = `category-item ${sector === activeCategoryName ? 'active' : ''}`;
    li.setAttribute('data-category', sector);
    li.innerHTML = `
      <span>${sector}</span>
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
  
  renderCategoryExplorer();
}

function renderCategoryExplorer() {
  if (!categoryToolsGrid || !categoryActiveName || !categoryActiveCount) return;
  
  categoryActiveName.textContent = activeCategoryName;
  categoryToolsGrid.innerHTML = '';
  
  const matched = toolsData.filter(t => t.industries && t.industries.includes(activeCategoryName));
  categoryActiveCount.textContent = `${matched.length} Node${matched.length === 1 ? '' : 's'}`;
  
  if (matched.length === 0) {
    categoryToolsGrid.innerHTML = `
      <div class="category-empty-state">
        <h4 class="category-empty-state-title">No System Nodes Mapped</h4>
        <p class="category-empty-state-desc">There are no operational automation instances configured for the ${activeCategoryName} sector.</p>
      </div>
    `;
    return;
  }
  
  matched.forEach(tool => {
    const originalIndex = toolsData.findIndex(t => t.id === tool.id);
    const cardEl = document.createElement('div');
    cardEl.className = 'timeline-card library-item-card visible';
    cardEl.setAttribute('data-node', originalIndex);
    const isFav = isFavorite(tool.id);
    const isCompared = state.comparisonList.includes(tool.id);
    cardEl.innerHTML = createCardHTML(tool, originalIndex, isFav, isCompared, false);
    categoryToolsGrid.appendChild(cardEl);
  });
  
  setupCardInteractions();
}

// ==========================================================================
// 10. SCROLLSPY NAVIGATION SYSTEM
// ==========================================================================

function initNavigation() {
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
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
function initApp() {
  try {
    initTheme();
    setupEventListeners();
    
    // Start continuous smooth scroll draw tracing loop
    smoothScrollLoop();
    
    // Initialize config overlay wizard
    initWizard();
    
    // Initialize AI-OS platform systems
    initLibrarySection();
    initCategoryExplorerSection();
    initNavigation();
    
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
