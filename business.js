// AI-OS Business Workspace Bootstrap
// Powered by A.R. Labs

import { state } from './modules/core.js';
import { initTheme, toggleTheme } from './modules/core.js';
import { initAuthSystem } from './modules/auth.js';
import { initWorkspaceControls, switchBusinessWorkspace } from './modules/businessUI.js';
import { initMobileUI } from './modules/mobileUI.js';
import { completeMissionTask } from './modules/gamification.js';
import { initTrialClock, closeTrialWelcomeModal } from './modules/premium.js';
import { businessTranslations } from './modules/businessTranslations.js';

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

  // Initialize language state
  let currentLang = localStorage.getItem('aios_business_lang');
  if (!currentLang && state.user && state.user.interface_lang) {
    currentLang = state.user.interface_lang;
  }
  if (!currentLang) {
    currentLang = 'en';
  }

  // Translate UI initially
  translateBusinessUI(currentLang);

  // Setup Onboarding Modal Behavior
  const obModal = document.getElementById('business-onboarding-modal');
  if (obModal) {
    const isVisited = localStorage.getItem('aios_business_visited') === 'true';
    const isLangSet = localStorage.getItem('aios_business_lang') !== null;
    if (!isVisited || !isLangSet) {
      obModal.style.display = 'flex';
    }
    
    document.querySelectorAll('.lang-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedLang = btn.getAttribute('data-lang');
        translateBusinessUI(selectedLang);
      });
    });
    
    document.querySelectorAll('.dest-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const workspace = btn.getAttribute('data-workspace');
        localStorage.setItem('aios_business_visited', 'true');
        obModal.style.display = 'none';
        (window.switchBusinessWorkspace || switchBusinessWorkspace)(workspace);
      });
    });
  }

  // Setup Language Swapper Dropdown in Top Nav
  const langBtnWrap = document.getElementById('language-dropdown-wrap');
  const langBtn = document.getElementById('language-dropdown-btn');
  if (langBtn && langBtnWrap) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langBtnWrap.classList.toggle('active');
    });
  }
  document.addEventListener('click', () => {
    if (langBtnWrap) langBtnWrap.classList.remove('active');
  });

  document.querySelectorAll('.lang-opt').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedLang = item.getAttribute('data-lang');
      translateBusinessUI(selectedLang);
      if (langBtnWrap) langBtnWrap.classList.remove('active');
    });
  });

  // Setup Settings Profile Modal Language Dropdown
  const pfLangSelect = document.getElementById('pf-lang');
  if (pfLangSelect) {
    pfLangSelect.addEventListener('change', () => {
      translateBusinessUI(pfLangSelect.value);
    });
  }
}

// Event handler bindings to entry points
document.addEventListener('DOMContentLoaded', () => {
  initBusiness().catch(console.error);
});

// Expose event handlers globally
window.toggleTheme = toggleTheme;
window.closeTrialWelcomeModal = closeTrialWelcomeModal;

export function translateBusinessUI(lang) {
  state.language = lang;
  localStorage.setItem('aios_business_lang', lang);
  
  const labelMap = { en: 'English', hi: 'हिन्दी', hinglish: 'Hinglish' };
  const currentLangLabel = document.getElementById('current-lang-label');
  if (currentLangLabel) currentLangLabel.textContent = labelMap[lang] || 'English';

  const pfLangSelect = document.getElementById('pf-lang');
  if (pfLangSelect) pfLangSelect.value = lang;

  document.querySelectorAll('.lang-select-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const dictionary = businessTranslations[lang] || businessTranslations['en'];
  
  const btnBack = document.querySelector('.btn-back-home span');
  if (btnBack) btnBack.textContent = dictionary.backToAios;
  
  const btnAbout = document.getElementById('btn-about-trigger');
  if (btnAbout) btnAbout.textContent = dictionary.btnAboutTrigger;
  
  const sysGuide = document.querySelector('a[href="intro.html"].btn-about-bus');
  if (sysGuide) sysGuide.textContent = dictionary.btnSystemGuide;

  const workspaceTrigger = document.querySelector('#workspace-dropdown-btn span');
  if (workspaceTrigger) {
    const ws = state.activeWorkspace || 'dashboard';
    const keyMap = {
      dashboard: dictionary.workspaceDashboard,
      learn: dictionary.workspaceLearn,
      build: dictionary.workspaceBuild,
      grow: dictionary.workspaceGrow
    };
    workspaceTrigger.textContent = keyMap[ws] || dictionary.workspaceDashboard;
  }

  const dropdownItems = document.querySelectorAll('.workspace-dropdown-menu button');
  if (dropdownItems.length >= 4) {
    dropdownItems[0].textContent = '📊 ' + dictionary.workspaceDashboard.replace('Workspace: ', '');
    dropdownItems[1].textContent = '📚 ' + dictionary.workspaceLearn.replace('Workspace: ', '');
    dropdownItems[2].textContent = '🚀 ' + dictionary.workspaceBuild.replace('Workspace: ', '');
    dropdownItems[3].textContent = '📈 ' + dictionary.workspaceGrow.replace('Workspace: ', '');
  }

  const dbHeading = document.querySelector('#pane-bus-dashboard h2');
  if (dbHeading) dbHeading.textContent = dictionary.dashboardHeading;
  const dbDesc = document.querySelector('#pane-bus-dashboard p.workspace-desc');
  if (dbDesc) dbDesc.textContent = dictionary.dashboardSubheading;
  
  const monTitle = document.querySelector('.metric-table-section h3');
  if (monTitle) monTitle.textContent = dictionary.monitorTitle;
  const monSub = document.querySelector('.metric-table-section p.section-sub');
  if (monSub) monSub.textContent = dictionary.monitorSub;
  
  const newsTitle = document.querySelector('.business-news-section h3');
  if (newsTitle) newsTitle.textContent = dictionary.newsTitle;
  const newsSub = document.querySelector('.business-news-section p.section-sub');
  if (newsSub) newsSub.textContent = dictionary.newsSub;

  const ths = document.querySelectorAll('.metric-table th');
  if (ths.length >= 4) {
    ths[0].textContent = dictionary.monitorThAsset;
    ths[1].textContent = dictionary.monitorThPrice;
    ths[2].textContent = dictionary.monitorThChange;
    ths[3].textContent = dictionary.monitorThUpdated;
  }

  const acHeading = document.querySelector('#pane-bus-learn h2');
  if (acHeading) acHeading.textContent = dictionary.academyHeading;
  const acSub = document.querySelector('#pane-bus-learn p.workspace-desc');
  if (acSub) acSub.textContent = dictionary.academySubheading;
  const acPara = document.querySelector('#pane-bus-learn p.workspace-desc + p');
  if (acPara) acPara.textContent = dictionary.academyPara;

  document.querySelectorAll('.btn-submit-quiz').forEach(btn => {
    btn.textContent = dictionary.quizSubmit;
  });
  document.querySelectorAll('.workspace-dropdown-trigger[onclick*="downloadTemplate"]').forEach(btn => {
    btn.textContent = dictionary.downloadTxt;
  });

  const lpHeading = document.querySelector('#pane-bus-build h2');
  if (lpHeading) lpHeading.textContent = dictionary.launchpadHeading;
  const lpSub = document.querySelector('#pane-bus-build p.workspace-desc');
  if (lpSub) lpSub.textContent = dictionary.launchpadSubheading;

  const grHeading = document.querySelector('#pane-bus-grow h2');
  if (grHeading) grHeading.textContent = dictionary.growHeading;
  const grSub = document.querySelector('#pane-bus-grow p.workspace-desc');
  if (grSub) grSub.textContent = dictionary.growSubheading;
  
  const grFormTitle = document.querySelector('.strategist-compiler-card h3');
  if (grFormTitle) grFormTitle.textContent = dictionary.growFormTitle;
  const grNameLabel = document.querySelector('label[for="strat-name"]');
  if (grNameLabel) grNameLabel.textContent = dictionary.growLabelName;
  const grNameInput = document.getElementById('strat-name');
  if (grNameInput) grNameInput.placeholder = dictionary.growPlaceholderName;
  
  const grAudienceLabel = document.querySelector('label[for="strat-audience"]');
  if (grAudienceLabel) grAudienceLabel.textContent = dictionary.growLabelAudience;
  const grAudienceInput = document.getElementById('strat-audience');
  if (grAudienceInput) grAudienceInput.placeholder = dictionary.growPlaceholderAudience;
  
  const grBottleneckLabel = document.querySelector('label[for="strat-bottleneck"]');
  if (grBottleneckLabel) grBottleneckLabel.textContent = dictionary.growLabelBottleneck;
  const grBottleneckInput = document.getElementById('strat-bottleneck');
  if (grBottleneckInput) grBottleneckInput.placeholder = dictionary.growPlaceholderBottleneck;
  
  const grSubmitBtn = document.querySelector('#strategist-input-form button[type="submit"]');
  if (grSubmitBtn) grSubmitBtn.innerHTML = `<span>⚡</span> ${dictionary.btnCompileStrategy}`;

  const grChatTitle = document.querySelector('.chat-card-header-title');
  if (grChatTitle) grChatTitle.innerHTML = `<span>💬</span> ${dictionary.chatTitle}`;
  const grChatInput = document.getElementById('strategist-chat-input');
  if (grChatInput) grChatInput.placeholder = dictionary.chatPlaceholder;

  const obTitle = document.getElementById('ob-title');
  if (obTitle) obTitle.textContent = dictionary.onboardingTitle;
  const obSubtitle = document.getElementById('ob-subtitle');
  if (obSubtitle) obSubtitle.textContent = dictionary.onboardingSubtitle;
  const obLangTitle = document.getElementById('ob-lang-title');
  if (obLangTitle) obLangTitle.textContent = dictionary.langSectionTitle;
  const obDestTitle = document.getElementById('ob-dest-title');
  if (obDestTitle) obDestTitle.textContent = dictionary.destSectionTitle;

  const destBtns = document.querySelectorAll('.dest-select-btn');
  if (destBtns.length >= 4) {
    destBtns[0].querySelector('.dest-title').textContent = dictionary.moduleDashboardTitle;
    destBtns[0].querySelector('.dest-desc').textContent = dictionary.moduleDashboardDesc;
    
    destBtns[1].querySelector('.dest-title').textContent = dictionary.moduleLearnTitle;
    destBtns[1].querySelector('.dest-desc').textContent = dictionary.moduleLearnDesc;
    
    destBtns[2].querySelector('.dest-title').textContent = dictionary.moduleBuildTitle;
    destBtns[2].querySelector('.dest-desc').textContent = dictionary.moduleBuildDesc;
    
    destBtns[3].querySelector('.dest-title').textContent = dictionary.moduleGrowTitle;
    destBtns[3].querySelector('.dest-desc').textContent = dictionary.moduleGrowDesc;
  }

  const mobileNavTabs = document.querySelectorAll('.mobile-bottom-nav .mobile-nav-tab');
  if (mobileNavTabs.length >= 4) {
    const lbl0 = mobileNavTabs[0].querySelector('.mobile-nav-label');
    const lbl1 = mobileNavTabs[1].querySelector('.mobile-nav-label');
    const lbl2 = mobileNavTabs[2].querySelector('.mobile-nav-label');
    const lbl3 = mobileNavTabs[3].querySelector('.mobile-nav-label');
    if (lbl0) lbl0.textContent = dictionary.workspaceDashboard.replace('Workspace: ', '');
    if (lbl1) lbl1.textContent = dictionary.workspaceLearn.replace('Workspace: ', '');
    if (lbl2) lbl2.textContent = dictionary.workspaceBuild.replace('Workspace: ', '');
    if (lbl3) lbl3.textContent = dictionary.workspaceGrow.replace('Workspace: ', '');
  }

  if (state.user) {
    state.user.interface_lang = lang;
    apiCall('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ interface_lang: lang })
    }).catch(() => {});
  }
}
window.translateBusinessUI = translateBusinessUI;

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
