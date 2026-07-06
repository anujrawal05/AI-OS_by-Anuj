// AI-OS Landing Page Bootstrap
// Powered by A.R. Labs

import { state } from './modules/core.js';
import { showToast, loadTranslations } from './modules/utils.js';
import { initTheme, toggleTheme } from './modules/core.js';
import { initNavigation, setupCardInteractions, openLegalDrawer, closeLegalDrawer } from './modules/ui.js';
import { initAuthSystem, handleEmailSignin, handleEmailSignup, handleVerifyOtp, handleForgotPassword } from './modules/auth.js';
import { initTrialClock, closeTrialWelcomeModal } from './modules/premium.js';
import { initMobileUI } from './modules/mobileUI.js';
import { initGamification } from './modules/gamification.js';
import { initDailyDashboard } from './modules/dashboard.js';

let exploreModuleInstance = null;

// Heavy modules are loaded dynamically on demand!
async function loadExploreModule() {
  if (!exploreModuleInstance) {
    exploreModuleInstance = await import('./modules/explore.js');
    await exploreModuleInstance.ensureDataLoaded();
    
    // Automatically bind elements when loaded
    if (exploreModuleInstance.initDashboardControls) exploreModuleInstance.initDashboardControls();
    if (exploreModuleInstance.initLibrarySection) exploreModuleInstance.initLibrarySection();
    if (exploreModuleInstance.initCategoryExplorerSection) exploreModuleInstance.initCategoryExplorerSection();
  }
  return exploreModuleInstance;
}

// Global initialization
async function initApp() {
  // Initialize theme
  initTheme();
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  
  // Initialize navigation and scrollspies
  initNavigation();

  // Initialize mobile-only header/bottom-nav behavior (<=767px)
  initMobileUI();
  
  // Load initial translation package
  try {
    const savedLang = localStorage.getItem('aios_language') || 'English';
    await loadTranslations(savedLang);
  } catch (e) {
    console.error("Failed to load translations:", e);
  }
  
  // Setup timeline interactions
  setupCardInteractions();
  
  // Initialize Auth System
  await initAuthSystem();

  // Initialize Gamification Engine (XP / Levels / Streaks / Coins / Achievements)
  // Must run after auth so the greeting can use the signed-in user's name.
  initGamification();

  // Initialize Daily Dashboard section
  initDailyDashboard();

  // Initialize Trial Clock countdowns
  initTrialClock();
  
  // Register global modal ESC and outside-click controller
  registerGlobalModalController();
  
  // Setup background scroll smooth animation traveler loops
  setTimeout(async () => {
    try {
      await loadExploreModule();
      if (window.smoothScrollLoop) {
        requestAnimationFrame(window.smoothScrollLoop);
      }
    } catch (e) {
      console.warn("Failed to warm up explore module in background:", e);
    }
  }, 1500);
}

// Event handler bindings to entry points
document.addEventListener('DOMContentLoaded', () => {
  initApp().catch(console.error);
});

// Expose event handler functions to the global scope for inline onclick/onchange HTML compatibility
window.toggleTheme = toggleTheme;
window.openLegalDrawer = openLegalDrawer;
window.closeLegalDrawer = closeLegalDrawer;
window.handleEmailSignin = handleEmailSignin;
window.handleEmailSignup = handleEmailSignup;
window.handleVerifyOtp = handleVerifyOtp;
window.handleForgotPassword = handleForgotPassword;
window.closeTrialWelcomeModal = closeTrialWelcomeModal;

// Explore AI lazy loading proxies
window.drawRoad = async function() {
  const mod = await loadExploreModule();
  if (mod && mod.drawRoad) mod.drawRoad();
};

window.openDrawer = async function(nodeIdx, isEduNode = false, eduNodeData = null) {
  const mod = await loadExploreModule();
  if (mod && mod.openDrawer) mod.openDrawer(nodeIdx, isEduNode, eduNodeData);
};

window.closeDrawer = async function() {
  const mod = await loadExploreModule();
  if (mod && mod.closeDrawer) mod.closeDrawer();
};

window.regenerateActiveRoadmap = async function() {
  const mod = await loadExploreModule();
  if (mod && mod.regenerateActiveRoadmap) mod.regenerateActiveRoadmap();
};

window.initLibrarySection = async function() {
  const mod = await loadExploreModule();
  if (mod && mod.initLibrarySection) mod.initLibrarySection();
};

window.initCategoryExplorerSection = async function() {
  const mod = await loadExploreModule();
  if (mod && mod.initCategoryExplorerSection) mod.initCategoryExplorerSection();
};

window.toggleFavorite = async function(id) {
  const mod = await loadExploreModule();
  if (mod && mod.toggleFavorite) mod.toggleFavorite(id);
};

window.toggleComparison = async function(id) {
  const mod = await loadExploreModule();
  if (mod && mod.toggleComparison) mod.toggleComparison(id);
};

window.openComparisonOverlay = async function() {
  const mod = await loadExploreModule();
  if (mod && mod.openComparisonOverlay) mod.openComparisonOverlay();
};

window.closeComparisonOverlay = async function() {
  const mod = await loadExploreModule();
  if (mod && mod.closeComparisonOverlay) mod.closeComparisonOverlay();
};

// Check if Service Worker is supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {})
      .catch(err => console.warn('ServiceWorker registration failed:', err));
  });
}

function registerGlobalModalController() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlays = document.querySelectorAll('.auth-modal-overlay, .journey-modal-overlay, #legal-overlay, #video-roadmap-choice-modal, #premium-lang-modal-overlay, #reset-password-modal-overlay, #coupon-modal-overlay, #trial-welcome-modal-overlay, #onboarding-modal-overlay, #pricing-modal-overlay, #profile-modal-overlay');
      overlays.forEach(overlay => {
        if (overlay.style.display === 'flex' || overlay.style.display === 'block' || overlay.classList.contains('active') || overlay.getAttribute('aria-hidden') === 'false') {
          if (overlay.id === 'onboarding-modal-overlay') return;
          if (overlay.id === 'pricing-modal-overlay') {
            const closeBtn = document.getElementById('pricing-modal-close-btn');
            if (closeBtn && closeBtn.style.display === 'none') return;
          }
          closeModalElement(overlay);
        }
      });
    }
  });

  document.addEventListener('click', (e) => {
    const overlays = document.querySelectorAll('.auth-modal-overlay, .journey-modal-overlay, #legal-overlay, #video-roadmap-choice-modal, #premium-lang-modal-overlay, #reset-password-modal-overlay, #coupon-modal-overlay, #trial-welcome-modal-overlay, #onboarding-modal-overlay, #pricing-modal-overlay, #profile-modal-overlay');
    overlays.forEach(overlay => {
      if (overlay.style.display === 'flex' || overlay.style.display === 'block' || overlay.classList.contains('active') || overlay.getAttribute('aria-hidden') === 'false') {
        const card = overlay.querySelector('.auth-modal-card, .auth-modal, .journey-modal-card, .pricing-hotstar-modal, .legal-modal-card, .profile-modal-scroll-content');
        if (card && e.target === overlay) {
          if (overlay.id === 'onboarding-modal-overlay') return;
          if (overlay.id === 'pricing-modal-overlay') {
            const closeBtn = document.getElementById('pricing-modal-close-btn');
            if (closeBtn && closeBtn.style.display === 'none') return;
          }
          closeModalElement(overlay);
        }
      }
    });
  });
}

function closeModalElement(overlay) {
  if (overlay.id === 'legal-overlay') {
    if (window.closeLegalDrawer) window.closeLegalDrawer();
    else overlay.setAttribute('aria-hidden', 'true');
  } else if (overlay.id === 'trial-welcome-modal-overlay') {
    if (window.closeTrialWelcomeModal) window.closeTrialWelcomeModal();
    else overlay.style.display = 'none';
  } else {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.remove('active');
    }, 200);
  }
}
