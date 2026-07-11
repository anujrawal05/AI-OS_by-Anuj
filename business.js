// AI-OS Business Workspace Bootstrap
// Powered by A.R. Labs

import { state } from './modules/core.js';
import { initTheme, toggleTheme } from './modules/core.js';
import { initAuthSystem } from './modules/auth.js';
import { initWorkspaceControls, switchBusinessWorkspace } from './modules/businessUI.js';
import { initMobileUI } from './modules/mobileUI.js';
import { completeMissionTask } from './modules/gamification.js';
import { initTrialClock, closeTrialWelcomeModal } from './modules/premium.js';

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

let uiModuleInstance = null;
async function loadUIModule() {
  if (!uiModuleInstance) {
    uiModuleInstance = await import('./modules/ui.js');
  }
  return uiModuleInstance;
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
    const tutMod = await loadTutorialsModule();
    if (!dashboardSectionInitialized && tutMod && tutMod.initTutorialsSection) {
      tutMod.initTutorialsSection();
      dashboardSectionInitialized = true;
    }
    // The Academy accordion modules live inside pane-bus-dashboard,
    // so initLearnSection must also run when the dashboard loads.
    const learnMod = await loadLearnModule();
    if (!learnSectionInitialized && learnMod && learnMod.initLearnSection) {
      learnMod.initLearnSection();
      learnSectionInitialized = true;
    }
  } else if (workspace === 'learn') {
    // 'learn' workspace redirects to dashboard in switchBusinessWorkspace,
    // but load the module here as a safety net in case the pane ever goes live.
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

  // Complete business workspace visit daily mission task
  completeMissionTask('business');

  // Update the profile header immediately so sign-in state is visible
  if (window.updateUserProfileHeader) window.updateUserProfileHeader();
  
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

  // Eagerly preload Build and Grow in background so they're instant on first switch
  if (activeWorkspace !== 'build') {
    loadBuildModule().then(mod => {
      if (!buildSectionInitialized && mod && mod.initBuildSection) {
        mod.initBuildSection();
        buildSectionInitialized = true;
      }
    }).catch(() => {});
  }
  if (activeWorkspace !== 'grow') {
    loadExpandModule().then(mod => {
      if (!expandSectionInitialized && mod && mod.initExpandSection) {
        mod.initExpandSection();
        expandSectionInitialized = true;
      }
    }).catch(() => {});
  }

  // Initialize Premium Trial clock countdowns
  initTrialClock();

  // Handle First-Visit Onboarding Journey Popup
  const onboardingOverlay = document.getElementById('first-visit-popup-overlay');
  if (onboardingOverlay) {
    const visitedKey = 'aios_business_visited';
    const isVisited = localStorage.getItem(visitedKey) === 'true';
    if (!isVisited) {
      onboardingOverlay.classList.add('active');
    }
    const dismissPopup = (workspace) => {
      onboardingOverlay.classList.remove('active');
      localStorage.setItem(visitedKey, 'true');
      if (workspace) {
        (window.switchBusinessWorkspace || switchBusinessWorkspace)(workspace);
      }
    };
    const btnLearn = document.getElementById('first-visit-opt-learn');
    const btnBuild = document.getElementById('first-visit-opt-build');
    const btnExpand = document.getElementById('first-visit-opt-expand');
    if (btnLearn) btnLearn.addEventListener('click', () => dismissPopup('learn'));
    if (btnBuild) btnBuild.addEventListener('click', () => dismissPopup('build'));
    if (btnExpand) btnExpand.addEventListener('click', () => dismissPopup('grow'));
  }
}

// Event handler bindings to entry points
document.addEventListener('DOMContentLoaded', () => {
  initBusiness().catch(console.error);
});

// Expose event handlers globally
window.toggleTheme = toggleTheme;
window.closeTrialWelcomeModal = closeTrialWelcomeModal;

// Lazy proxies for inline handlers
window.verifyQuizAnswer = async function(...args) {
  const mod = await loadLearnModule();
  if (mod && mod.verifyQuizAnswer) mod.verifyQuizAnswer(...args);
};

window.downloadTemplate = async function(...args) {
  const mod = await loadLearnModule();
  if (mod && mod.downloadTemplate) mod.downloadTemplate(...args);
};

window.showPricingModal = async function(...args) {
  const mod = await loadUIModule();
  if (mod && mod.showPricingModal) mod.showPricingModal(...args);
};

// selectAndCompileBusiness and handleBusinessVideoPlay now live in build.js
// (they were moved there from tutorials.js so the build catalog can call them).
window.selectAndCompileBusiness = async function(...args) {
  const mod = await loadBuildModule();
  if (mod && mod.selectAndCompileBusiness) {
    mod.selectAndCompileBusiness(...args);
  } else if (window._selectAndCompileBusiness) {
    window._selectAndCompileBusiness(...args);
  }
};

window.handleBusinessVideoPlay = async function(...args) {
  // Fall through to tutorials module which holds the language selection popup
  const tutMod = await loadTutorialsModule();
  if (tutMod && tutMod.handleBusinessVideoPlay) {
    tutMod.handleBusinessVideoPlay(...args);
  }
};
