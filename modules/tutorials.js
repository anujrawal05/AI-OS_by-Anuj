// Tutorials Grid & Playlist Player for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';
import { isUserAuthenticated } from './auth.js';
import { showPricingModal } from './ui.js';
import { playVideoWithPlayer } from './video.js';
import { completeMissionTask } from './gamification.js';

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
    playVideoWithPlayer(videoPath, `${title} (${lang === 'eng' ? 'English' : 'Hindi'})`);
    
    // Complete daily mission task for watching/playing lessons
    completeMissionTask('learn');
  }
}

export async function loadLiveBusinessNews() {
  const loadingEl = document.getElementById('news-data-loading');
  const errorEl = document.getElementById('news-data-error');
  const contentEl = document.getElementById('news-data-content');
  
  if (!contentEl) return;

  try {
    const mockArticles = [
      { title: "OpenAI releases o3-mini — outperforms o1 at half the cost", source: "OpenAI", link: "https://news.google.com" },
      { title: "Google DeepMind's Gemini 2.5 Pro scores #1 on coding benchmarks", source: "Google", link: "https://news.google.com" },
      { title: "Anthropic raises $4B, targets AI safety research acceleration", source: "Anthropic", link: "https://news.google.com" },
      { title: "AI agents now autonomously completing browser tasks at 80% success", source: "Research", link: "https://news.google.com" },
      { title: "Google Cloud Announces $2B AI Accelerator Pool for Seed Startups", source: "TechCrunch", link: "https://news.google.com" },
      { title: "Llama 3.3 Fine-tuning Benchmarks Reveal 40% Operational Cost Reductions", source: "VentureBeat", link: "https://news.google.com" },
      { title: "Outbound Agentic Workflows Replace Traditional Call Center Pools", source: "Bloomberg", link: "https://news.google.com" },
      { title: "Make.com Raises $150M Series C to Expand Enterprise Automation Integrations", source: "TechNews", link: "https://news.google.com" }
    ];
    
    contentEl.innerHTML = '';
    mockArticles.forEach(art => {
      const item = document.createElement('a');
      item.href = art.link;
      item.target = '_blank';
      item.rel = 'noopener';
      item.className = 'news-item';
      item.style.display = 'block';
      item.style.textDecoration = 'none';
      
      const pubTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      item.innerHTML = `
        <div class="news-item-meta" style="display:flex; justify-content:space-between; margin-bottom: 4px; font-family:var(--font-mono); font-size:0.75rem;">
          <span class="news-source" style="color:var(--bus-primary); font-weight:700;">${art.source}</span>
          <span class="news-time" style="color:var(--bus-text-secondary);">${pubTime}</span>
        </div>
        <h4 class="news-item-title" style="color:#fff; font-size:0.82rem; line-height:1.4; margin:0; font-weight:600;">${art.title}</h4>
      `;
      contentEl.appendChild(item);
    });

    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';

  } catch (err) {
    console.error("News load failed:", err.message);
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
  }
}

export function initTutorialsSection() {
  loadDiscoveredVideos();
  loadLiveBusinessNews();
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
    const authOverlay = document.getElementById('auth-modal-overlay');
    if (authOverlay) {
      authOverlay.style.display = 'flex';
      authOverlay.style.opacity = '1';
    }
    showToast("Please login first to watch business tutorials.", "warning");
    return;
  }
  
  const isPremium = state.user && (
    state.user.plan_type === 'Premium' || 
    state.user.plan_type === 'Trial' ||
    state.user.subscription?.plan === 'Premium' ||
    state.user.subscription?.plan === 'Trial'
  );
  if (!isPremium) {
    showToast("Upgrade to Premium or start trial to watch tutorials.", "warning");
    showPricingModal(true);
    return;
  }

  showLanguageSelectionPopup(videoBaseName, title);
};

window.loadDiscoveredVideos = loadDiscoveredVideos;
window.showLanguageSelectionPopup = showLanguageSelectionPopup;
window.initTutorialsSection = initTutorialsSection;
window.loadLiveBusinessNews = loadLiveBusinessNews;
