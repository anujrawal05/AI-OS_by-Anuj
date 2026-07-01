// AI-OS Business Workspace Bootstrap
// Powered by A.R. Labs

import { state } from './modules/core.js';
import { initTheme, toggleTheme } from './modules/core.js';
import { initAuthSystem } from './modules/auth.js';
import { initWorkspaceControls } from './modules/businessUI.js';

// Lazy loading feature modules on demand when sections are entered
async function loadLearnModule() {
  if (!window.initLearnSection) {
    console.log("[Business Bootstrap] Lazy loading Learn module...");
    await import('./modules/learn.js');
  }
}

async function loadBuildModule() {
  if (!window.initBuildSection) {
    console.log("[Business Bootstrap] Lazy loading Build module...");
    await import('./modules/build.js');
  }
}

async function loadExpandModule() {
  if (!window.initExpandSection) {
    console.log("[Business Bootstrap] Lazy loading Expand module...");
    await import('./modules/expand.js');
  }
}

async function loadTutorialsModule() {
  if (!window.initTutorialsSection) {
    console.log("[Business Bootstrap] Lazy loading Tutorials module...");
    await import('./modules/tutorials.js');
  }
}

async function loadActiveWorkspaceModules(workspace) {
  if (workspace === 'dashboard') {
    await loadTutorialsModule();
    if (window.initTutorialsSection) window.initTutorialsSection();
  } else if (workspace === 'learn') {
    await loadLearnModule();
    if (window.initLearnSection) window.initLearnSection();
  } else if (workspace === 'build') {
    await loadBuildModule();
    if (window.initBuildSection) window.initBuildSection();
  } else if (workspace === 'grow') {
    await loadExpandModule();
    if (window.initExpandSection) window.initExpandSection();
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
  
  // Load initial workspace modules based on the active tab
  const activeWorkspace = state.activeWorkspace || 'dashboard';
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
  await loadLearnModule();
  if (window.verifyQuizAnswer) window.verifyQuizAnswer(quizIdx, answerIndex);
};

window.downloadTemplate = async function(templateKey, category) {
  await loadLearnModule();
  if (window.downloadTemplate) window.downloadTemplate(templateKey, category);
};

window.selectAndCompileBusiness = async function(key) {
  await loadTutorialsModule();
  if (window.selectAndCompileBusiness) window.selectAndCompileBusiness(key);
};

window.handleBusinessVideoPlay = async function(key, videoBaseName, title) {
  await loadTutorialsModule();
  if (window.handleBusinessVideoPlay) window.handleBusinessVideoPlay(key, videoBaseName, title);
};
