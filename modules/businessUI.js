// Dashboard Workspace UI Controller for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';
import { updateUserProfileHeader } from './auth.js';

export function switchBusinessWorkspace(workspaceName) {
  if (workspaceName === 'learn') {
    switchBusinessWorkspace('dashboard');
    setTimeout(() => {
      const learnSection = document.querySelector('#pane-bus-dashboard .learn-grid-layout');
      if (learnSection) {
        learnSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
    return;
  }

  state.activeWorkspace = workspaceName;
  
  // Update Header Button Text
  const swBtn = document.getElementById('workspace-dropdown-btn');
  if (swBtn) {
    const formatted = workspaceName.charAt(0).toUpperCase() + workspaceName.slice(1);
    swBtn.querySelector('span').textContent = `Workspace: ${formatted}`;
  }
  
  // Update Dropdown Active Option
  const dropdownItems = document.querySelectorAll('.workspace-dropdown-item');
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
  
  const isPremium = state.user && (state.user.plan_type === 'Premium' || state.user.plan_type === 'Trial Premium');
  const isTrial = state.user && state.user.plan_type === 'Trial';
  
  if (isPremium) {
    if (buildLock) buildLock.style.display = 'none';
    if (expandLock) expandLock.style.display = 'none';
    
    // Disable strategist blur gate
    const stratBlurGate = document.getElementById('strategist-blur-gate');
    if (stratBlurGate) {
      stratBlurGate.classList.remove('premium-blur-gate');
      const blurContent = stratBlurGate.querySelector('.blur-content-wrapper');
      if (blurContent) blurContent.classList.remove('blur-content');
      const overlay = document.getElementById('strategist-gate-overlay');
      if (overlay) overlay.style.display = 'none';
    }
  } else if (isTrial) {
    // Hide main locks for trial users so they can compile/chat
    if (buildLock) buildLock.style.display = 'none';
    if (expandLock) expandLock.style.display = 'none';
    
    // Enable strategist blur gate
    const stratBlurGate = document.getElementById('strategist-blur-gate');
    if (stratBlurGate) {
      stratBlurGate.classList.add('premium-blur-gate');
      const blurContent = stratBlurGate.querySelector('.blur-content-wrapper');
      if (blurContent) blurContent.classList.add('blur-content');
      const overlay = document.getElementById('strategist-gate-overlay');
      if (overlay) overlay.style.display = 'flex';
    }
  } else {
    // Basic/Locked
    if (buildLock) buildLock.style.display = 'flex';
    if (expandLock) expandLock.style.display = 'flex';
    
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

  const dropdownItems = document.querySelectorAll('.workspace-dropdown-menu button');
  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const workspace = item.getAttribute('data-workspace');
      switchBusinessWorkspace(workspace);
      if (swBtnWrap) swBtnWrap.classList.remove('active');
    });
  });

  const heroLearn = document.getElementById('btn-hero-learn-cta');
  if (heroLearn) {
    heroLearn.addEventListener('click', () => switchBusinessWorkspace('learn'));
  }
  const heroBuild = document.getElementById('btn-hero-build-cta');
  if (heroBuild) {
    heroBuild.addEventListener('click', () => switchBusinessWorkspace('build'));
  }
  const heroGrow = document.getElementById('btn-hero-grow-cta');
  if (heroGrow) {
    heroGrow.addEventListener('click', () => switchBusinessWorkspace('grow'));
  }
  const skipBasicsBtn = document.getElementById('btn-skip-basics');
  if (skipBasicsBtn) {
    skipBasicsBtn.addEventListener('click', () => switchBusinessWorkspace('build'));
  }
}

window.switchBusinessWorkspace = switchBusinessWorkspace;
window.toggleBusinessSectionView = toggleBusinessSectionView;
window.initWorkspaceControls = initWorkspaceControls;
