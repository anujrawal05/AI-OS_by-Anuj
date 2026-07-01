// AI-OS Landing Page Bootstrap
// Powered by A.R. Labs

import { state } from './modules/core.js';
import { showToast, loadTranslations } from './modules/utils.js';
import { initTheme, toggleTheme } from './modules/core.js';
import { initNavigation, setupCardInteractions, openLegalDrawer, closeLegalDrawer } from './modules/ui.js';
import { initAuthSystem, handleEmailSignin, handleEmailSignup, handleVerifyOtp, handleForgotPassword } from './modules/auth.js';
import { initTrialClock, closeTrialWelcomeModal } from './modules/premium.js';

let exploreModuleInstance = null;

// Heavy modules are loaded dynamically on demand!
async function loadExploreModule() {
  if (!exploreModuleInstance) {
    console.log("[Bootstrap] Lazy loading Explore AI module...");
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
      .then(reg => console.log('ServiceWorker registered successfully:', reg.scope))
      .catch(err => console.warn('ServiceWorker registration failed:', err));
  });
}
