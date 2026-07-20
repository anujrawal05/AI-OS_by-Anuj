// Dashboard Workspace UI Controller for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';
import { updateUserProfileHeader } from './auth.js';
import { completeMissionTask } from './gamification.js';

export function switchBusinessWorkspace(workspaceName) {
  if (!workspaceName) {
    console.warn("[Workspace Switch Warning] workspaceName is null or undefined");
    return;
  }
  if (workspaceName === 'learn') {
    completeMissionTask('learn');
    switchBusinessWorkspace('dashboard');
    setTimeout(() => {
      const learnSection = document.querySelector('#pane-bus-dashboard .learn-grid-layout');
      if (learnSection) {
        learnSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
    return;
  }

  if (workspaceName === 'build') {
    completeMissionTask('build');
  }
  if (workspaceName === 'grow') {
    completeMissionTask('business');
  }

  state.activeWorkspace = workspaceName;
  
  // Update Header Button Text
  const swBtn = document.getElementById('workspace-dropdown-btn');
  if (swBtn) {
    const formatted = workspaceName.charAt(0).toUpperCase() + workspaceName.slice(1);
    swBtn.querySelector('span').textContent = `Workspace: ${formatted}`;
  }
  
  // Update Dropdown Active Option (also syncs the mobile bottom-nav tabs,
  // which share the same data-workspace attribute)
  const dropdownItems = document.querySelectorAll('.workspace-dropdown-item, .mobile-nav-tab[data-workspace]');
  dropdownItems.forEach(item => {
    if (item.getAttribute('data-workspace') === workspaceName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Hide all workspaces
  const panes = document.querySelectorAll('.workspace-wrapper');
  panes.forEach(pane => pane.classList.remove('active'));
  
  // Show target workspace
  const targetPane = document.getElementById(`pane-bus-${workspaceName}`);
  if (targetPane) targetPane.classList.add('active');
}

export function toggleBusinessSectionView() {
  const buildLock = document.getElementById('build-premium-lock');
  const expandLock = document.getElementById('expand-premium-lock');
  const chatLogs = document.getElementById('chat-strategist-logs');
  const chatInputBar = document.getElementById('strategist-chat-input-bar');
  const blueprintOutputContents = document.getElementById('blueprint-output-contents');
  
  const isPremium = state.user && (
    state.user.plan_type === 'Premium' || 
    state.user.subscription?.plan === 'Premium'
  );
  const isTrial = state.user && (
    state.user.plan_type === 'Trial' ||
    state.user.subscription?.plan === 'Trial'
  );
  
  const hasAccess = isPremium || isTrial;

  if (hasAccess) {
    if (buildLock) buildLock.style.display = 'none';
    if (expandLock) expandLock.style.display = 'none';
    // Show chat UI for premium/trial users (BUG-009 fix)
    if (chatLogs) chatLogs.style.display = 'flex';
    if (chatInputBar) chatInputBar.style.display = 'flex';
    // Show blueprint output area for premium/trial (BUG-007 fix)
    if (blueprintOutputContents) blueprintOutputContents.style.display = 'block';
    
    // Disable strategist blur gate for premium users
    if (isPremium) {
      const stratBlurGate = document.getElementById('strategist-blur-gate');
      if (stratBlurGate) {
        stratBlurGate.classList.remove('premium-blur-gate');
        const blurContent = stratBlurGate.querySelector('.blur-content-wrapper');
        if (blurContent) blurContent.classList.remove('blur-content');
        const overlay = document.getElementById('strategist-gate-overlay');
        if (overlay) overlay.style.display = 'none';
      }
    } else if (isTrial) {
      // Enable strategist blur gate for trial users (partial access)
      const stratBlurGate = document.getElementById('strategist-blur-gate');
      if (stratBlurGate) {
        stratBlurGate.classList.add('premium-blur-gate');
        const blurContent = stratBlurGate.querySelector('.blur-content-wrapper');
        if (blurContent) blurContent.classList.add('blur-content');
        const overlay = document.getElementById('strategist-gate-overlay');
        if (overlay) overlay.style.display = 'flex';
      }
    }
  } else {
    // Basic/Locked — show locks, hide chat UI
    if (buildLock) buildLock.style.display = 'flex';
    if (expandLock) expandLock.style.display = 'flex';
    // Hide chat UI for non-premium users
    if (chatLogs) chatLogs.style.display = 'none';
    if (chatInputBar) chatInputBar.style.display = 'none';
    // Hide blueprint output area for non-premium
    if (blueprintOutputContents) blueprintOutputContents.style.display = 'none';
    
    // Hide strategist blur gate overlay to prevent overlap with main locks
    const overlay = document.getElementById('strategist-gate-overlay');
    if (overlay) overlay.style.display = 'none';
  }
}

export function initWorkspaceControls() {
  const swBtnWrap = document.getElementById('workspace-dropdown-wrap');
  const swBtn = document.getElementById('workspace-dropdown-btn');
  if (swBtn && swBtnWrap) {
    swBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      swBtnWrap.classList.toggle('active');
    });
  }

  document.addEventListener('click', () => {
    if (swBtnWrap) swBtnWrap.classList.remove('active');
  });

  const dropdownItems = document.querySelectorAll('#workspace-dropdown-wrap .workspace-dropdown-menu button');
  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const workspace = item.getAttribute('data-workspace');
      // Use window.switchBusinessWorkspace so the async module-loader
      // override set up in business.js is invoked on every switch.
      (window.switchBusinessWorkspace || switchBusinessWorkspace)(workspace);
      if (swBtnWrap) swBtnWrap.classList.remove('active');
    });
  });

  const heroLearn = document.getElementById('btn-hero-learn-cta');
  if (heroLearn) {
    heroLearn.addEventListener('click', () => (window.switchBusinessWorkspace || switchBusinessWorkspace)('learn'));
  }
  const heroBuild = document.getElementById('btn-hero-build-cta');
  if (heroBuild) {
    heroBuild.addEventListener('click', () => (window.switchBusinessWorkspace || switchBusinessWorkspace)('build'));
  }
  const heroGrow = document.getElementById('btn-hero-grow-cta');
  if (heroGrow) {
    heroGrow.addEventListener('click', () => (window.switchBusinessWorkspace || switchBusinessWorkspace)('grow'));
  }
  const skipBasicsBtn = document.getElementById('btn-skip-basics');
  if (skipBasicsBtn) {
    skipBasicsBtn.addEventListener('click', () => (window.switchBusinessWorkspace || switchBusinessWorkspace)('build'));
  }
}

window.switchBusinessWorkspace = switchBusinessWorkspace;
window.toggleBusinessSectionView = toggleBusinessSectionView;
window.initWorkspaceControls = initWorkspaceControls;
