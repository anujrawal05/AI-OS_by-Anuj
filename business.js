// AI-OS Business Workspace Bootstrap
// Powered by A.R. Labs

import { state } from './modules/core.js';
import { initTheme, toggleTheme } from './modules/core.js';
import { initAuthSystem } from './modules/auth.js';
import { initWorkspaceControls, switchBusinessWorkspace } from './modules/businessUI.js';
import { initMobileUI } from './modules/mobileUI.js';
import { completeMissionTask } from './modules/gamification.js';
import { initTrialClock, closeTrialWelcomeModal } from './modules/premium.js';
import { loadTranslations } from './modules/utils.js';
import { apiCall } from './modules/apiClient.js';


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
  await translateBusinessUI(currentLang);

  // ─── Premium 2-Step Business Welcome Popup ───────────────────────────────
  // Shows every visit UNLESS the user checked 'Remember my choice' previously.
  const obModal = document.getElementById('business-onboarding-modal');
  const abModal = document.getElementById('about-bus-modal-overlay');
  
  // Safely move modals to body to prevent them from being hidden by unclosed wrapper containers
  if (obModal) document.body.appendChild(obModal);
  if (abModal) document.body.appendChild(abModal);

  // ─── Wire About & Methodology button ─────────────────────────────────────
  // The button exists in the nav but had no event listener — fixed here after
  // the modals have been safely moved to document.body (prevents z-index traps).
  const aboutTriggerBtn = document.getElementById('btn-about-trigger');
  if (aboutTriggerBtn && abModal) {
    aboutTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      abModal.style.display = 'flex';
      requestAnimationFrame(() => abModal.classList.add('active'));
    });
  }

  // Wire close button inside the About modal (supports any .modal-close-btn inside it)
  if (abModal) {
    abModal.querySelectorAll('.modal-close-btn, .about-modal-close').forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        abModal.classList.remove('active');
        setTimeout(() => { abModal.style.display = 'none'; }, 300);
      });
    });
    // Click backdrop to close
    abModal.addEventListener('click', (e) => {
      if (e.target === abModal) {
        abModal.classList.remove('active');
        setTimeout(() => { abModal.style.display = 'none'; }, 300);
      }
    });
  }

  if (obModal) {
    const remembered = localStorage.getItem('aios_business_remember') === 'true';
    if (!remembered) {
      // Mark modal as visible immediately
      obModal.style.display = 'flex';
      setTimeout(() => obModal.classList.add('active'), 10);
    }

    // Restore saved language selection visual state
    const savedLang = localStorage.getItem('aios_business_lang') || 'en';
    document.querySelectorAll('.ob-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === savedLang);
    });

    // Language button selection (live preview)
    document.querySelectorAll('.ob-lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.ob-lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        translateBusinessUI(btn.getAttribute('data-lang'));
      });
    });

    // Destination card selection (closes modal + switches workspace)
    document.querySelectorAll('.dest-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const workspace = btn.getAttribute('data-workspace');
        const rememberCheckbox = document.getElementById('ob-remember-choice');
        if (rememberCheckbox && rememberCheckbox.checked) {
          localStorage.setItem('aios_business_remember', 'true');
        }
        localStorage.setItem('aios_business_visited', 'true');
        obModal.classList.remove('active');
        setTimeout(() => { obModal.style.display = 'none'; }, 300);
        (window.switchBusinessWorkspace || switchBusinessWorkspace)(workspace);
      });
    });

    // Also wire old .lang-select-btn class for compatibility
    document.querySelectorAll('.lang-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedLang = btn.getAttribute('data-lang');
        if (selectedLang) translateBusinessUI(selectedLang);
      });
    });
  }

  // ─── Step navigation (exposed globally for inline onclick handlers) ───────
  window._obGoStep2 = function() {
    const step1 = document.getElementById('ob-step-1');
    const step2 = document.getElementById('ob-step-2');
    const dot1  = document.getElementById('ob-step-dot-1');
    const dot2  = document.getElementById('ob-step-dot-2');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    if (dot1) dot1.classList.remove('ob-step-active');
    if (dot2) dot2.classList.add('ob-step-active');
  };

  window._obGoStep1 = function() {
    const step1 = document.getElementById('ob-step-1');
    const step2 = document.getElementById('ob-step-2');
    const dot1  = document.getElementById('ob-step-dot-1');
    const dot2  = document.getElementById('ob-step-dot-2');
    if (step2) step2.style.display = 'none';
    if (step1) step1.style.display = 'block';
    if (dot2) dot2.classList.remove('ob-step-active');
    if (dot1) dot1.classList.add('ob-step-active');
  };



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

export async function translateBusinessUI(lang) {
  state.language = lang;
  localStorage.setItem('aios_business_lang', lang);
  
  // Load initial translation package via the standard JSON loader
  try {
    await loadTranslations(lang);
  } catch (e) {
    console.error("[i18n Translation Load Fail]", e);
  }
  
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

  const dictionary = (state.translations && state.translations.business) || {};
  
  const workspaceTrigger = document.querySelector('#workspace-dropdown-btn span');
  if (workspaceTrigger) {
    const ws = state.activeWorkspace || 'dashboard';
    const keyMap = {
      dashboard: dictionary.workspaceDashboard,
      learn: dictionary.workspaceLearn,
      build: dictionary.workspaceBuild,
      grow: dictionary.workspaceGrow
    };
    const translatedLabel = keyMap[ws] || dictionary.workspaceDashboard;
    if (translatedLabel) {
      workspaceTrigger.textContent = translatedLabel;
    } else {
      workspaceTrigger.textContent = `[Missing: business.workspace${ws.charAt(0).toUpperCase() + ws.slice(1)}]`;
    }
  }

  const dropdownItems = document.querySelectorAll('.workspace-dropdown-menu button');
  if (dropdownItems.length >= 4) {
    dropdownItems[0].textContent = '📊 ' + (dictionary.workspaceDashboard ? dictionary.workspaceDashboard.replace('Workspace: ', '') : '[Missing: business.workspaceDashboard]');
    dropdownItems[1].textContent = '📚 ' + (dictionary.workspaceLearn ? dictionary.workspaceLearn.replace('Workspace: ', '') : '[Missing: business.workspaceLearn]');
    dropdownItems[2].textContent = '🚀 ' + (dictionary.workspaceBuild ? dictionary.workspaceBuild.replace('Workspace: ', '') : '[Missing: business.workspaceBuild]');
    dropdownItems[3].textContent = '📈 ' + (dictionary.workspaceGrow ? dictionary.workspaceGrow.replace('Workspace: ', '') : '[Missing: business.workspaceGrow]');
  }

  document.querySelectorAll('.btn-submit-quiz').forEach(btn => {
    btn.textContent = dictionary.quizSubmit || "[Missing: business.quizSubmit]";
  });
  document.querySelectorAll('.workspace-dropdown-trigger[onclick*="downloadTemplate"]').forEach(btn => {
    btn.textContent = dictionary.downloadTxt || "[Missing: business.downloadTxt]";
  });

  const grSubmitBtn = document.querySelector('#strategist-input-form button[type="submit"]');
  if (grSubmitBtn) grSubmitBtn.innerHTML = `<span>⚡</span> ${dictionary.btnCompileStrategy || '[Missing: business.btnCompileStrategy]'}`;

  const grChatTitle = document.querySelector('.chat-card-header-title');
  if (grChatTitle) grChatTitle.innerHTML = `<span>💬</span> ${dictionary.chatTitle || '[Missing: business.chatTitle]'}`;

  const destBtns = document.querySelectorAll('.dest-select-btn');
  if (destBtns.length >= 4) {
    destBtns[0].querySelector('.dest-title').textContent = dictionary.moduleDashboardTitle || "[Missing: business.moduleDashboardTitle]";
    destBtns[0].querySelector('.dest-desc').textContent = dictionary.moduleDashboardDesc || "[Missing: business.moduleDashboardDesc]";
    
    destBtns[1].querySelector('.dest-title').textContent = dictionary.moduleLearnTitle || "[Missing: business.moduleLearnTitle]";
    destBtns[1].querySelector('.dest-desc').textContent = dictionary.moduleLearnDesc || "[Missing: business.moduleLearnDesc]";
    
    destBtns[2].querySelector('.dest-title').textContent = dictionary.moduleBuildTitle || "[Missing: business.moduleBuildTitle]";
    destBtns[2].querySelector('.dest-desc').textContent = dictionary.moduleBuildDesc || "[Missing: business.moduleBuildDesc]";
    
    destBtns[3].querySelector('.dest-title').textContent = dictionary.moduleGrowTitle || "[Missing: business.moduleGrowTitle]";
    destBtns[3].querySelector('.dest-desc').textContent = dictionary.moduleGrowDesc || "[Missing: business.moduleGrowDesc]";
  }

  const mobileNavTabs = document.querySelectorAll('.mobile-bottom-nav .mobile-nav-tab');
  if (mobileNavTabs.length >= 4) {
    const lbl0 = mobileNavTabs[0].querySelector('.mobile-nav-label');
    const lbl1 = mobileNavTabs[1].querySelector('.mobile-nav-label');
    const lbl2 = mobileNavTabs[2].querySelector('.mobile-nav-label');
    const lbl3 = mobileNavTabs[3].querySelector('.mobile-nav-label');
    if (lbl0) lbl0.textContent = dictionary.workspaceDashboard ? dictionary.workspaceDashboard.replace('Workspace: ', '') : '[Missing: business.workspaceDashboard]';
    if (lbl1) lbl1.textContent = dictionary.workspaceLearn ? dictionary.workspaceLearn.replace('Workspace: ', '') : '[Missing: business.workspaceLearn]';
    if (lbl2) lbl2.textContent = dictionary.workspaceBuild ? dictionary.workspaceBuild.replace('Workspace: ', '') : '[Missing: business.workspaceBuild]';
    if (lbl3) lbl3.textContent = dictionary.workspaceGrow ? dictionary.workspaceGrow.replace('Workspace: ', '') : '[Missing: business.workspaceGrow]';
  }

  if (state.user) {
    state.user.interface_lang = lang;
    apiCall('/api/auth/update-profile', {
      method: 'POST',
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
