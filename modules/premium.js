// Premium Subscriptions, Limits & Roadmap Locks for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';
import { getActiveLanguage } from './ui.js';

const lockTranslations = {
  English: {
    title: "Login For Full Access",
    desc: "Authentication is required to unlock full interactive roadmaps, specifications templates, and educational instructions.",
    signinBtn: "Sign In / Create Account",
    couponBtn: "Access Using Coupon"
  },
  Hindi: {
    title: "पूर्ण पहुंच के लिए लॉगिन करें",
    desc: "पूर्ण रोडमैप, स्पेसिफिकेशन टेम्पलेट और शैक्षिक निर्देशों को अनलॉक करने के लिए प्रमाणीकरण आवश्यक है।",
    signinBtn: "लॉगिन करें / खाता बनाएं",
    couponBtn: "कूपन का उपयोग करें"
  },
  Hinglish: {
    title: "Login For Full Access",
    desc: "Complete system roadmaps, prompt templates aur guides ko unlock karne ke liye authentication zaroori hai.",
    signinBtn: "Sign In / Create Account",
    couponBtn: "Access Using Coupon"
  }
};

export function isTrialActive() {
  return state.user && state.user.subscription && state.user.subscription.plan === 'Trial' && new Date(state.user.subscription.currentPeriodEnd) > new Date();
}

export function getTrialRemainingTime() {
  if (!state.user || !state.user.subscription || !state.user.subscription.currentPeriodEnd) return null;
  const now = Date.now();
  const expires = new Date(state.user.subscription.currentPeriodEnd).getTime();
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

export function initTrialClock() {
  const banner = document.getElementById('trial-countdown-banner');
  if (!banner) return;
  if (isTrialActive()) {
    const timeRemaining = getTrialRemainingTime();
    let text = "";
    if (timeRemaining) {
      if (timeRemaining.isLastDay) {
        text = `⚠️ <strong>Less than 24 hours remaining</strong> (${timeRemaining.text})! Recommend upgrading before trial expires.`;
      } else {
        text = `🎉 You're currently using your FREE 3-Day Premium Trial (${timeRemaining.text}).`;
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

export function closeTrialWelcomeModal() {
  const welcomeModal = document.getElementById('trial-welcome-modal-overlay');
  if (welcomeModal) welcomeModal.style.display = 'none';
  if (window.regenerateActiveRoadmap) {
    window.regenerateActiveRoadmap();
  }
}

export function checkPromptLimit() {
  // Always returns true because limits are bypassed in fully premium unlocked static mode
  return true;
}

export function incrementPromptLimit() {
  // Limit increments bypassed for static premium mode
}

export function applyRoadmapLock() {
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

export function removeRoadmapLock() {
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

// Global exposure for backwards compatibility
window.isTrialActive = isTrialActive;
window.getTrialRemainingTime = getTrialRemainingTime;
window.initTrialClock = initTrialClock;
window.closeTrialWelcomeModal = closeTrialWelcomeModal;
window.checkPromptLimit = checkPromptLimit;
window.incrementPromptLimit = incrementPromptLimit;
window.applyRoadmapLock = applyRoadmapLock;
window.removeRoadmapLock = removeRoadmapLock;
