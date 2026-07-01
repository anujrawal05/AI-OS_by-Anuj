// AI-OS Business Workspace Bootstrap
// Powered by A.R. Labs

import { state } from './modules/core.js';
import { initTheme, toggleTheme } from './modules/core.js';
import { initAuthSystem } from './modules/auth.js';
import { initWorkspaceControls } from './modules/businessUI.js';

let learnModuleInstance = null;
async function loadLearnModule() {
  if (!learnModuleInstance) {
    console.log("[Business Bootstrap] Lazy loading Learn module...");
    learnModuleInstance = await import('./modules/learn.js');
  }
  return learnModuleInstance;
}

let buildModuleInstance = null;
async function loadBuildModule() {
  if (!buildModuleInstance) {
    console.log("[Business Bootstrap] Lazy loading Build module...");
    buildModuleInstance = await import('./modules/build.js');
  }
  return buildModuleInstance;
}

let expandModuleInstance = null;
async function loadExpandModule() {
  if (!expandModuleInstance) {
    console.log("[Business Bootstrap] Lazy loading Expand module...");
    expandModuleInstance = await import('./modules/expand.js');
  }
  return expandModuleInstance;
}

let tutorialsModuleInstance = null;
async function loadTutorialsModule() {
  if (!tutorialsModuleInstance) {
    console.log("[Business Bootstrap] Lazy loading Tutorials module...");
    tutorialsModuleInstance = await import('./modules/tutorials.js');
  }
  return tutorialsModuleInstance;
}

async function loadActiveWorkspaceModules(workspace) {
  if (workspace === 'dashboard') {
    const mod = await loadTutorialsModule();
    if (mod && mod.initTutorialsSection) mod.initTutorialsSection();
  } else if (workspace === 'learn') {
    const mod = await loadLearnModule();
    if (mod && mod.initLearnSection) mod.initLearnSection();
  } else if (workspace === 'build') {
    const mod = await loadBuildModule();
    if (mod && mod.initBuildSection) mod.initBuildSection();
  } else if (workspace === 'grow') {
    const mod = await loadExpandModule();
    if (mod && mod.initExpandSection) mod.initExpandSection();
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
