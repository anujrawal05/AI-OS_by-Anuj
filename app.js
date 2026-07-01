// AI-OS Landing Page Bootstrap
// Powered by A.R. Labs

import { state } from './modules/core.js';
import { showToast, loadTranslations } from './modules/utils.js';
import { initTheme, toggleTheme } from './modules/core.js';
import { initNavigation, setupCardInteractions, openLegalDrawer, closeLegalDrawer } from './modules/ui.js';
import { initAuthSystem, handleEmailSignin, handleEmailSignup, handleVerifyOtp, handleForgotPassword } from './modules/auth.js';
import { initTrialClock, closeTrialWelcomeModal } from './modules/premium.js';

// Heavy modules are loaded dynamically on demand!
async function loadExploreModule() {
  if (!window.exploringAIRoadmap) {
    console.log("[Bootstrap] Lazy loading Explore AI module...");
    const mod = await import('./modules/explore.js');
    await mod.ensureDataLoaded();
  }
}

// Global initialization
async function initApp() {
  // Initialize theme
  initTheme();
  
  // Initialize navigation and scrollspies
  initNavigation();
  
  // Load initial translation package
  try {
    await loadTranslations();
  } catch (e) {
    console.error("Failed to load translations:", e);
  }
  
  // Setup timeline interactions
  setupCardInteractions();
  
  // Initialize Auth System
  await initAuthSystem();
  
  // Initialize Trial Clock countdowns
  initTrialClock();
  
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
  await loadExploreModule();
  if (window.drawRoad) window.drawRoad();
};

window.openDrawer = async function(nodeIdx, isEduNode = false, eduNodeData = null) {
  await loadExploreModule();
  if (window.openDrawer) window.openDrawer(nodeIdx, isEduNode, eduNodeData);
};

window.closeDrawer = async function() {
  await loadExploreModule();
  if (window.closeDrawer) window.closeDrawer();
};

window.regenerateActiveRoadmap = async function() {
  await loadExploreModule();
  if (window.regenerateActiveRoadmap) window.regenerateActiveRoadmap();
};

window.initLibrarySection = async function() {
  await loadExploreModule();
  if (window.initLibrarySection) window.initLibrarySection();
};

window.initCategoryExplorerSection = async function() {
  await loadExploreModule();
  if (window.initCategoryExplorerSection) window.initCategoryExplorerSection();
};

window.toggleFavorite = async function(id) {
  await loadExploreModule();
  if (window.toggleFavorite) window.toggleFavorite(id);
};

window.toggleComparison = async function(id) {
  await loadExploreModule();
  if (window.toggleComparison) window.toggleComparison(id);
};

window.openComparisonOverlay = async function() {
  await loadExploreModule();
  if (window.openComparisonOverlay) window.openComparisonOverlay();
};

window.closeComparisonOverlay = async function() {
  await loadExploreModule();
  if (window.closeComparisonOverlay) window.closeComparisonOverlay();
};

// Check if Service Worker is supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('ServiceWorker registered successfully:', reg.scope))
      .catch(err => console.warn('ServiceWorker registration failed:', err));
  });
}
