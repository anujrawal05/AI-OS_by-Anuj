// Tutorials Grid & Playlist Player for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';
import { isUserAuthenticated } from './auth.js';
import { showPricingModal } from './ui.js';
import { playVideoWithPlayer } from './video.js';

export async function loadDiscoveredVideos() {
  state.discoveredVideos.build = [
    "AAA_eng.mp4", "AAA_hindi.mp4",
    "AI_Nursery_Rhyme_Engine_eng.mp4", "AI_Nursery_Rhyme_Engine_hindi.mp4",
    "AI_Video_Ad_Pipeline_eng.mp4", "AI_Video_Ad_Pipeline_hindi.mp4",
    "Content_Engine_eng.mp4", "Content_Engine_hindi.mp4",
    "Drop-Servicing_Sprint_eng.mp4", "Drop-Servicing_Sprint_hindi.mp4",
    "Inbound_Voice_AI_Studio_eng.mp4", "Inbound_Voice_AI_Studio_hindi.mp4",
    "Managed_Creator_Network_eng.mp4", "Managed_Creator_Network_hindi.mp4",
    "Motion_Script_Compiler_eng.mp4", "Motion_Script_Compiler_hindi.mp4",
    "SaaS_eng.mp4", "SaaS_hindi.mp4"
  ];
  state.discoveredVideos.explore = [
    "part1_eng.mp4", "part1_hindi.mp4",
    "part2_eng.mp4", "part2_hindi.mp4",
    "part3_eng.mp4", "part3_hindi.mp4",
    "part4_eng.mp4", "part4_hindi.mp4",
    "part5_eng.mp4", "part5_hindi.mp4"
  ];
  console.log("[Static Video Discovery] Seeded static videos list:", state.discoveredVideos);
}

export function renderBusinessCardsGrid() {
  const container = document.getElementById('business-cards-grid');
  if (!container) return;
  
  const models = [
    { key: 'agency', icon: '🤖', subtitle: 'Automate boring tasks and emails for local businesses.', video: 'AAA' },
    { key: 'dropservicing', icon: '💼', subtitle: 'Broker premium digital services and outsource to contractors.', video: 'Drop-Servicing_Sprint' },
    { key: 'micro-saas', icon: '⚡', subtitle: 'Launch simple single-purpose tools with monthly subscriptions.', video: 'SaaS' },
    { key: 'creator', icon: '📸', subtitle: 'Build an audience and monetize with templates and sponsorships.', video: 'Content_Engine' },
    { key: 'agency_video_ad', icon: '🎥', subtitle: 'Turn static product photos into high-converting video ads.', video: 'AI_Video_Ad_Pipeline' },
    { key: 'creator_zackd_shorts', icon: '🎬', subtitle: 'Produce viral 3D shorts and bizarre facts videos using AI.', video: 'Motion_Script_Compiler' },
    { key: 'agency_voice_ai', icon: '📞', subtitle: 'Deploy smart voice agents to answer phones for local clinics.', video: 'Inbound_Voice_AI_Studio' },
    { key: 'creator_managed_network', icon: '🤝', subtitle: 'Manage social creators and secure brand sponsorships.', video: 'Managed_Creator_Network' },
    { key: 'creator_kids_animation', icon: '👶', subtitle: 'Produce automated animated children\'s songs and rhymes.', video: 'AI_Nursery_Rhyme_Engine' }
  ];

  container.innerHTML = models.map(m => {
    const idea = launchpadIdeas[m.key];
    const profitRange = idea.retail.profit;
    
    return `
      <div class="business-catalog-card" data-key="${m.key}">
        <div class="card-glow-effect"></div>
        <div class="card-header-row">
          <div class="card-icon-wrapper">${m.icon}</div>
          <span class="card-profit-badge">${profitRange.split(' /')[0]}</span>
        </div>
        <h4 class="card-business-title">${idea.title}</h4>
        <p class="card-business-subtitle">${m.subtitle}</p>
        
        <div class="card-actions-row">
          <button class="card-btn-compile" onclick="selectAndCompileBusiness('${m.key}')">
            <span>Configure</span> ⚙️
          </button>
          <button class="card-btn-video" onclick="handleBusinessVideoPlay('${m.key}', '${m.video}', '${idea.title}')">
            <span>Watch Video</span> ▶
          </button>
        </div>
      </div>
    `;
  }).join('');
}

export function showLanguageSelectionPopup(videoBaseName, title) {
  let modal = document.getElementById('premium-lang-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'premium-lang-modal-overlay';
    modal.className = 'auth-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5,5,8,0.9); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 10000; opacity: 0; transition: opacity 0.2s ease;';
    
    modal.innerHTML = `
      <div class="auth-modal" style="width: 90%; max-width: 400px; background: #0A0A0C; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); text-align: center; font-family: 'Outfit', sans-serif;">
        <span style="font-size: 2.2rem; display: block; margin-bottom: 12px;">🌐</span>
        <h3 style="font-family: 'Space Grotesk', monospace; color: #fff; margin-bottom: 8px; font-weight: 700; font-size: 1.15rem;" id="premium-lang-modal-title">Select Tutorial Language</h3>
        <p style="color: rgba(255,255,255,0.6); font-size: 0.8rem; line-height: 1.5; margin-bottom: 24px;">This premium lecture contains audio tracks in both Hindi and English. Please select your preference.</p>
        
        <div style="display: flex; gap: 12px;">
          <button id="btn-lang-hindi" class="btn btn-secondary btn-full" style="flex: 1; padding: 14px; font-weight: 700; font-family: 'Space Grotesk', monospace; border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); color: #fff; border-radius: 8px; cursor: pointer; transition: all 0.2s;">हिंदी 🇮🇳</button>
          <button id="btn-lang-english" class="btn btn-primary btn-full" style="flex: 1; padding: 14px; font-weight: 700; font-family: 'Space Grotesk', monospace; background: linear-gradient(135deg, #00D084 0%, #2EC5FF 100%); border: none; color: #000; border-radius: 8px; cursor: pointer; transition: all 0.2s;">English 🇺🇸</button>
        </div>
        
        <button id="btn-lang-close" style="background: transparent; border: none; color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-top: 20px; text-decoration: underline; cursor: pointer;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  document.getElementById('premium-lang-modal-title').textContent = `Select Language: ${title}`;

  modal.style.display = 'flex';
  void modal.offsetWidth;
  modal.style.opacity = '1';

  const closePopup = () => {
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; }, 200);
  };

  const btnHindi = document.getElementById('btn-lang-hindi');
  const btnEnglish = document.getElementById('btn-lang-english');
  const btnClose = document.getElementById('btn-lang-close');

  btnHindi.onclick = () => {
    closePopup();
    playVideoForLanguage('hindi');
  };

  btnEnglish.onclick = () => {
    closePopup();
    playVideoForLanguage('eng');
  };

  btnClose.onclick = closePopup;
  modal.onclick = (e) => {
    if (e.target === modal) closePopup();
  };

  function playVideoForLanguage(lang) {
    let filename = `${videoBaseName}_${lang}.mp4`;
    if (state.discoveredVideos && state.discoveredVideos.build && state.discoveredVideos.build.length > 0) {
      const matched = state.discoveredVideos.build.find(f => f.toLowerCase() === filename.toLowerCase());
      if (matched) filename = matched;
    }
    const videoPath = `https://media.ai-os.in/build/${filename}`;
    window.playPremiumVideo(videoPath, `${title} (${lang === 'eng' ? 'English' : 'Hindi'})`);
  }
}

export function initTutorialsSection() {
  loadDiscoveredVideos();
}

// Expose functions to global namespace for dynamic buttons
window.selectAndCompileBusiness = function(key) {
  const select = document.getElementById('blueprint-model-select');
  if (select) {
    select.value = key;
    const configPanel = document.querySelector('.blueprint-workspace');
    if (configPanel) {
      configPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const compileBtn = document.getElementById('btn-compile-blueprint');
    if (compileBtn) compileBtn.click();
  }
};

window.handleBusinessVideoPlay = function(key, videoBaseName, title) {
  if (!isUserAuthenticated()) {
    document.getElementById('auth-modal-overlay').style.display = 'flex';
    showToast("Please login first to watch business tutorials.", "warning");
    return;
  }
  
  const isPremium = state.user && state.user.subscription && (state.user.subscription.plan === 'Premium' || state.user.subscription.plan === 'Trial');
  if (!isPremium) {
    showToast("Upgrade to Premium or start trial to watch tutorials.", "warning");
    showPricingModal(true);
    return;
  }

  showLanguageSelectionPopup(videoBaseName, title);
};

window.loadDiscoveredVideos = loadDiscoveredVideos;
window.renderBusinessCardsGrid = renderBusinessCardsGrid;
window.showLanguageSelectionPopup = showLanguageSelectionPopup;
window.initTutorialsSection = initTutorialsSection;
