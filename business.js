// AI-OS Business Workspace Bootstrap
// Powered by A.R. Labs

import { state } from './modules/core.js';
import { initTheme, toggleTheme } from './modules/core.js';
import { initAuthSystem } from './modules/auth.js';
import { initWorkspaceControls, switchBusinessWorkspace } from './modules/businessUI.js';
import { initMobileUI } from './modules/mobileUI.js';

let learnModuleInstance = null;
async function loadLearnModule() {
  if (!learnModuleInstance) {
    learnModuleInstance = await import('./modules/learn.js');
  }
  return learnModuleInstance;
}

let buildModuleInstance = null;
async function loadBuildModule() {
  if (!buildModuleInstance) {
    buildModuleInstance = await import('./modules/build.js');
  }
  return buildModuleInstance;
}

let expandModuleInstance = null;
async function loadExpandModule() {
  if (!expandModuleInstance) {
    expandModuleInstance = await import('./modules/expand.js');
  }
  return expandModuleInstance;
}

let tutorialsModuleInstance = null;
async function loadTutorialsModule() {
  if (!tutorialsModuleInstance) {
    tutorialsModuleInstance = await import('./modules/tutorials.js');
  }
  return tutorialsModuleInstance;
}

// Each workspace's init*Section() binds addEventListener without removing
// prior listeners, so it must only ever run once per module (mirrors the
// singleton-guarded pattern used by app.js's loadExploreModule). Calling it
// again on every workspace switch stacks duplicate listeners and makes
// toggle-style UI (e.g. the Learn accordion) appear stuck.
let dashboardSectionInitialized = false;
let learnSectionInitialized = false;
let buildSectionInitialized = false;
let expandSectionInitialized = false;

async function loadActiveWorkspaceModules(workspace) {
  if (workspace === 'dashboard') {
    const mod = await loadTutorialsModule();
    if (!dashboardSectionInitialized && mod && mod.initTutorialsSection) {
      mod.initTutorialsSection();
      dashboardSectionInitialized = true;
    }
  } else if (workspace === 'learn') {
    const mod = await loadLearnModule();
    if (!learnSectionInitialized && mod && mod.initLearnSection) {
      mod.initLearnSection();
      learnSectionInitialized = true;
    }
  } else if (workspace === 'build') {
    const mod = await loadBuildModule();
    if (!buildSectionInitialized && mod && mod.initBuildSection) {
      mod.initBuildSection();
      buildSectionInitialized = true;
    }
  } else if (workspace === 'grow') {
    const mod = await loadExpandModule();
    if (!expandSectionInitialized && mod && mod.initExpandSection) {
      mod.initExpandSection();
      expandSectionInitialized = true;
    }
  }
}

// Global initialization
async function initBusiness() {
  // Initialize theme
  initTheme();
  
  // Initialize Auth checks and load sessions
  await initAuthSystem();
  
  // Initialize Workspace selectors and controllers
  initWorkspaceControls();

  // Initialize mobile-only header/bottom-nav behavior (<=767px)
  initMobileUI();

  // Support deep-linking a workspace via ?workspace=... (used by the mobile
  // bottom-nav "Videos" tab on index.html to land directly on Learn/Academy)
  const requestedWorkspace = new URLSearchParams(window.location.search).get('workspace');
  const activeWorkspace = requestedWorkspace || state.activeWorkspace || 'dashboard';
  if (requestedWorkspace) switchBusinessWorkspace(requestedWorkspace);
  await loadActiveWorkspaceModules(activeWorkspace);
  
  // Intercept workspace switches to lazy-load dependencies on transition
  const originalSwitcher = window.switchBusinessWorkspace;
  window.switchBusinessWorkspace = async function(workspace) {
    await loadActiveWorkspaceModules(workspace);
    if (originalSwitcher) originalSwitcher(workspace);
  };
}

// Event handler bindings to entry points
document.addEventListener('DOMContentLoaded', () => {
  initBusiness().catch(console.error);
});

// Expose event handlers globally
window.toggleTheme = toggleTheme;

// Lazy proxies for inline handlers
window.verifyQuizAnswer = async function(quizIdx, answerIndex) {
  const mod = await loadLearnModule();
  if (mod && mod.verifyQuizAnswer) mod.verifyQuizAnswer(quizIdx, answerIndex);
};

window.downloadTemplate = async function(templateKey, category) {
  const mod = await loadLearnModule();
  if (mod && mod.downloadTemplate) mod.downloadTemplate(templateKey, category);
};

window.selectAndCompileBusiness = async function(key) {
  const mod = await loadTutorialsModule();
  if (mod && mod.selectAndCompileBusiness) mod.selectAndCompileBusiness(key);
};

window.handleBusinessVideoPlay = async function(key, videoBaseName, title) {
  const mod = await loadTutorialsModule();
  if (mod && mod.handleBusinessVideoPlay) mod.handleBusinessVideoPlay(key, videoBaseName, title);
};
