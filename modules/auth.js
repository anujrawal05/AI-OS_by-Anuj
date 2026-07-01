// Mock Authentication Layer for AI-OS (Fully Frontend Static)
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';

let authMode = 'signin';
let onboardingUser = null;

export async function initSupabase() {
  console.log("[Static Auth] Supabase initialization stubbed.");
}

export function isUserAuthenticated() {
  // Always authenticated in static mode
  return true;
}

export function calculateUnlockRate() {
  if (state.analytics.compileRoadmapClicks === 0) return 0;
  const rate = (((state.analytics.emailSignIns || 0) + state.analytics.couponRedemptions) / state.analytics.compileRoadmapClicks) * 100;
  return Math.min(100, Math.round(rate));
}

export function updateUserProfileHeader() {
  const container = document.getElementById('user-profile-header');
  if (!container) return;
  
  const ctaBtn = document.getElementById('btn-upgrade-premium-cta');
  const heroCtaBtn = document.getElementById('btn-hero-upgrade-cta');
  
  if (ctaBtn) {
    ctaBtn.style.display = 'block';
    ctaBtn.textContent = 'Premium Active';
    ctaBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
    ctaBtn.style.color = '#fff';
    ctaBtn.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.3)';
    ctaBtn.style.animation = 'none';
    ctaBtn.onclick = () => {
      showToast("You are currently on the Premium Plan! Full access unlocked.", "info");
    };
  }

  if (heroCtaBtn) {
    heroCtaBtn.style.display = 'none';
  }
  
  if (state.user) {
    const initials = state.user.name ? state.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'US';
    container.innerHTML = `
      <div class="profile-dropdown-wrapper">
        <button id="btn-header-profile" class="profile-btn" style="background: linear-gradient(135deg, #2EC5FF 0%, #00D084 100%); color: #000; font-weight: 700; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.88rem; cursor: pointer; border: none; outline: none; transition: transform 0.2s;">
          ${initials}
        </button>
        <div id="header-profile-dropdown" class="profile-dropdown">
          <div class="profile-dropdown-header">
            <strong>${state.user.name || 'AI-OS User'}</strong>
            <span>${state.user.email}</span>
          </div>
          <a href="#" id="btn-dropdown-profile" class="profile-dropdown-item">
            👤 &nbsp; Settings / Profile
          </a>
          <a href="#" id="btn-header-logout" class="profile-dropdown-item logout">
            🔑 &nbsp; Sign Out
          </a>
        </div>
      </div>
    `;
    
    const profileBtn = document.getElementById('btn-header-profile');
    const dropdown = document.getElementById('header-profile-dropdown');
    if (profileBtn && dropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
    }
    
    const profileMenuBtn = document.getElementById('btn-dropdown-profile');
    if (profileMenuBtn) {
      profileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown) dropdown.classList.remove('active');
        showProfileModal();
      });
    }
    
    const directLogoutBtn = document.getElementById('btn-header-logout');
    if (directLogoutBtn) {
      directLogoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logoutUser();
      });
    }
  } else {
    container.innerHTML = `
      <button id="btn-header-signin" class="profile-btn" style="border-radius: 20px; background: rgba(255, 255, 255, 0.05); border-color: var(--border-color);">
        🔑 <span>Sign In</span>
      </button>
    `;
    
    const signinBtn = document.getElementById('btn-header-signin');
    if (signinBtn) {
      signinBtn.addEventListener('click', () => {
        const authOverlay = document.getElementById('auth-modal-overlay');
        if (authOverlay) authOverlay.style.display = 'flex';
      });
    }
  }
}

export function switchAuthTab(tab) {
  const signinForm = document.getElementById('auth-form-signin');
  const signupForm = document.getElementById('auth-form-signup');
  const signinTab = document.getElementById('auth-tab-signin');
  const signupTab = document.getElementById('auth-tab-signup');
  if (!signinForm || !signupForm) return;
  if (tab === 'signin') {
    signinForm.style.display = 'flex';
    signupForm.style.display = 'none';
    if (signinTab) { signinTab.style.background = 'var(--accent-color)'; signinTab.style.color = '#000'; }
    if (signupTab) { signupTab.style.background = 'transparent'; signupTab.style.color = 'var(--text-secondary)'; }
  } else {
    signinForm.style.display = 'none';
    signupForm.style.display = 'flex';
    if (signupTab) { signupTab.style.background = 'var(--accent-color)'; signupTab.style.color = '#000'; }
    if (signinTab) { signinTab.style.background = 'transparent'; signinTab.style.color = 'var(--text-secondary)'; }
  }
}

export function updateAuthModalUI() {
  const otpSection = document.getElementById('otp-verification-section');
  if (otpSection) otpSection.style.display = 'none';

  const formFields = document.getElementById('auth-form-fields');
  const actionButtons = document.getElementById('auth-action-buttons');
  const couponSection = document.getElementById('auth-coupon-section');
  
  if (formFields) formFields.style.display = 'flex';
  if (actionButtons) actionButtons.style.display = 'flex';
  if (couponSection) couponSection.style.display = 'block';

  const title = document.getElementById('auth-modal-title');
  const desc = document.getElementById('auth-modal-desc');
  const pwdContainer = document.getElementById('auth-password-container');
  const btnSignin = document.getElementById('btn-email-signin');
  const btnSignup = document.getElementById('btn-email-signup');
  const toggleBtn = document.getElementById('btn-toggle-auth-mode');
  const forgotBtn = document.getElementById('btn-forgot-password');
  const errorEl = document.getElementById('auth-modal-error');
  const successEl = document.getElementById('auth-modal-success');

  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';

  if (authMode === 'signin') {
    if (title) title.textContent = 'Access AI-OS';
    if (desc) desc.textContent = 'Securely sign in to access all platform features, timelines, and digital business modules.';
    if (pwdContainer) pwdContainer.style.display = 'block';
    if (btnSignin) { btnSignin.style.display = 'block'; btnSignin.textContent = 'Sign In'; }
    if (btnSignup) btnSignup.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = 'Create Account instead';
    if (forgotBtn) forgotBtn.style.display = 'inline-block';
  } else if (authMode === 'signup') {
    if (title) title.textContent = 'Create Account';
    if (desc) desc.textContent = 'Sign up to start your premium experience and build smart AI workspaces.';
    if (pwdContainer) pwdContainer.style.display = 'block';
    if (btnSignin) btnSignin.style.display = 'none';
    if (btnSignup) { btnSignup.style.display = 'block'; btnSignup.textContent = 'Sign Up'; }
    if (toggleBtn) toggleBtn.textContent = 'Sign In instead';
    if (forgotBtn) forgotBtn.style.display = 'none';
  } else if (authMode === 'forgot') {
    if (title) title.textContent = 'Reset Password';
    if (desc) desc.textContent = 'Enter your email address and we will generate a recovery link.';
    if (pwdContainer) pwdContainer.style.display = 'none';
    if (btnSignin) { btnSignin.style.display = 'block'; btnSignin.textContent = 'Send Reset Link'; }
    if (btnSignup) btnSignup.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = 'Back to Sign In';
    if (forgotBtn) forgotBtn.style.display = 'none';
  }
}

export async function handleEmailSignin() {
  const emailEl = document.getElementById('auth-email');
  const passwordEl = document.getElementById('auth-password');
  const errorEl = document.getElementById('auth-modal-error');
  
  const email = emailEl ? emailEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  
  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Please enter email and password.'; errorEl.style.display = 'block'; }
    return;
  }
  
  // Set mock static premium user session
  state.user = {
    id: "static-user-id",
    name: email.split('@')[0],
    email: email,
    plan_type: 'Premium',
    is_coupon: false
  };
  localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
  
  const authOverlay = document.getElementById('auth-modal-overlay');
  if (authOverlay) authOverlay.style.display = 'none';
  
  updateUserProfileHeader();
  if (window.initTrialClock) window.initTrialClock();
  showToast("Logged in successfully!");
}

export async function handleEmailSignup() {
  const emailEl = document.getElementById('auth-email');
  const passwordEl = document.getElementById('auth-password');
  const errorEl = document.getElementById('auth-modal-error');
  
  const email = emailEl ? emailEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  
  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Please enter email and password.'; errorEl.style.display = 'block'; }
    return;
  }
  
  if (password.length < 6) {
    if (errorEl) { errorEl.textContent = 'Password must be at least 6 characters.'; errorEl.style.display = 'block'; }
    return;
  }
  
  // Mock registration sends user to OTP input modal
  showOtpScreen();
  showToast("Mock Registration: OTP code '123456' has been sent to your email!");
}

export function showOtpScreen() {
  const title = document.getElementById('auth-modal-title');
  const desc = document.getElementById('auth-modal-desc');
  if (title) title.textContent = 'Verify OTP';
  if (desc) desc.textContent = 'Enter the mock verification code sent to your email address (use 123456).';
  
  const formFields = document.getElementById('auth-form-fields');
  const actionButtons = document.getElementById('auth-action-buttons');
  const couponSection = document.getElementById('auth-coupon-section');
  if (formFields) formFields.style.display = 'none';
  if (actionButtons) actionButtons.style.display = 'none';
  if (couponSection) couponSection.style.display = 'none';
  
  const otpSection = document.getElementById('otp-verification-section');
  if (otpSection) {
    otpSection.style.display = 'flex';
    otpSection.style.flexDirection = 'column';
  }
}

export function hideOtpScreen() {
  const otpSection = document.getElementById('otp-verification-section');
  if (otpSection) otpSection.style.display = 'none';
  
  const formFields = document.getElementById('auth-form-fields');
  const actionButtons = document.getElementById('auth-action-buttons');
  const couponSection = document.getElementById('auth-coupon-section');
  if (formFields) formFields.style.display = 'flex';
  if (actionButtons) actionButtons.style.display = 'flex';
  if (couponSection) couponSection.style.display = 'block';
  
  updateAuthModalUI();
}

export async function handleVerifyOtp() {
  const codeEl = document.getElementById('auth-otp-code');
  const errorEl = document.getElementById('otp-error-msg');
  const successEl = document.getElementById('otp-success-msg');
  
  const otp = codeEl ? codeEl.value.trim() : '';
  if (!otp) {
    if (errorEl) { errorEl.textContent = 'Please enter the verification code.'; errorEl.style.display = 'block'; }
    return;
  }
  
  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
  
  if (successEl) { successEl.textContent = 'Mock code verified successfully!'; successEl.style.display = 'block'; }
  
  // Set mock static user session
  const emailEl = document.getElementById('auth-email');
  const email = emailEl ? emailEl.value.trim() : 'demo@aios.com';
  
  state.user = {
    id: "static-user-id",
    name: email.split('@')[0],
    email: email,
    plan_type: 'Premium',
    is_coupon: false
  };
  localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
  
  setTimeout(() => {
    const authOverlay = document.getElementById('auth-modal-overlay');
    if (authOverlay) authOverlay.style.display = 'none';
    
    if (codeEl) codeEl.value = '';
    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';
    hideOtpScreen();
    
    showOnboardingModal(state.user);
    showToast("Email verified! Welcome to AI-OS.");
  }, 1000);
}

export async function handleForgotPassword() {
  const emailEl = document.getElementById('auth-email');
  const errorEl = document.getElementById('auth-modal-error');
  const successEl = document.getElementById('auth-modal-success');
  
  const email = emailEl ? emailEl.value.trim() : '';
  if (!email) {
    if (errorEl) { errorEl.textContent = 'Please enter your email.'; errorEl.style.display = 'block'; }
    return;
  }
  
  if (successEl) {
    successEl.textContent = 'Mock recovery link sent to your email!';
    successEl.style.display = 'block';
  }
}

export async function handleSupabaseSession(session, profile = null) {
  console.log("[Static Auth] Supabase session handler bypassed.");
}

export function showOnboardingModal(user) {
  onboardingUser = user;
  const overlay = document.getElementById('onboarding-modal-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    const closeBtn = overlay.querySelector('.auth-modal-close-btn');
    if (closeBtn) closeBtn.style.display = 'none';
  }
}

export async function handleOnboardingSubmit(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('ob-fullname').value.trim();
  const dob = document.getElementById('ob-dob').value;
  const gender = document.getElementById('ob-gender').value;
  const profession = document.getElementById('ob-profession').value;
  
  const cbTerms = document.getElementById('ob-cb-terms').checked;
  const cbPrivacy = document.getElementById('ob-cb-privacy').checked;
  
  const errorEl = document.getElementById('onboarding-error-msg');
  if (errorEl) errorEl.style.display = 'none';
  
  if (!fullName || !dob || !gender || !profession) {
    if (errorEl) {
      errorEl.textContent = 'Please fill out all required fields.';
      errorEl.style.display = 'block';
    }
    return;
  }
  
  if (!cbTerms || !cbPrivacy) {
    if (errorEl) {
      errorEl.textContent = 'You must accept the terms & conditions and privacy policy to continue.';
      errorEl.style.display = 'block';
    }
    return;
  }
  
  const overlay = document.getElementById('onboarding-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  
  const welcomeModal = document.getElementById('trial-welcome-modal-overlay');
  if (welcomeModal) welcomeModal.style.display = 'flex';
  
  state.user.name = fullName;
  state.user.date_of_birth = dob;
  state.user.gender = gender;
  state.user.profession = profession;
  localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
  
  updateUserProfileHeader();
  if (window.initTrialClock) window.initTrialClock();
  showToast("Profile completed successfully!");
}

export function showProfileModal() {
  if (!state.user) return;
  
  document.getElementById('pf-email').value = state.user.email || '';
  document.getElementById('pf-fullname').value = state.user.name || '';
  document.getElementById('pf-dob').value = state.user.date_of_birth || '';
  document.getElementById('pf-gender').value = state.user.gender || '';
  document.getElementById('pf-profession').value = state.user.profession || '';
  document.getElementById('pf-plan-display').textContent = 'Premium';
  
  const accountTypeEl = document.getElementById('pf-account-type-display');
  const accessStatusEl = document.getElementById('pf-access-status-display');
  
  if (accountTypeEl) accountTypeEl.textContent = 'Email User';
  if (accessStatusEl) {
    accessStatusEl.innerHTML = 'Premium';
    accessStatusEl.className = 'badge-access premium-badge';
  }
  
  const overlay = document.getElementById('profile-modal-overlay');
  if (overlay) overlay.style.display = 'flex';
}

export async function handleProfileSave(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('pf-fullname').value.trim();
  const dob = document.getElementById('pf-dob').value;
  const gender = document.getElementById('pf-gender').value;
  const profession = document.getElementById('pf-profession').value;
  
  if (!fullName) {
    showToast("Name is required.", "error");
    return;
  }
  
  state.user.name = fullName;
  state.user.date_of_birth = dob;
  state.user.gender = gender;
  state.user.profession = profession;
  
  localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
  
  const overlay = document.getElementById('profile-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  updateUserProfileHeader();
  showToast("Profile settings saved successfully!");
}

export async function handleCouponLogin(couponCode) {
  const errorEl = document.getElementById('coupon-error-msg');
  if (errorEl) errorEl.style.display = 'none';
  
  if (!couponCode || couponCode.trim().length < 4) {
    if (errorEl) {
      errorEl.textContent = 'Invalid access code. Please try again.';
      errorEl.style.display = 'block';
    }
    return;
  }
  
  state.user = {
    id: "coupon-user-id",
    name: "Premium Coupon User",
    email: "coupon@aios.com",
    plan_type: 'Premium',
    is_coupon: true
  };
  
  sessionStorage.setItem('aios_coupon_session', JSON.stringify(state.user));
  state.analytics.couponRedemptions++;
  
  hideAuthModals();
  updateUserProfileHeader();
  if (window.AdManager) window.AdManager.updateAdVisibility();
  if (window.regenerateActiveRoadmap) window.regenerateActiveRoadmap();
  
  showToast("Coupon redeemed successfully! Premium access unlocked.");
}

export async function logoutUser() {
  sessionStorage.removeItem('aios_coupon_session');
  localStorage.removeItem('aios_user_profile');
  
  // Re-initialize default user profile for static sandbox
  state.user = {
    id: "demo-user-123",
    email: "demo@aios.com",
    name: "Demo Premium User",
    gender: "Male",
    profession: "Business Owner",
    date_of_birth: "1995-01-01",
    plan_type: "Premium",
    trial_started_at: new Date().toISOString(),
    trial_expires_at: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
    trial_days_remaining: 3,
    is_coupon: false
  };
  localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
  
  hideAuthModals();
  updateUserProfileHeader();
  if (window.AdManager) window.AdManager.updateAdVisibility();
  if (window.regenerateActiveRoadmap) window.regenerateActiveRoadmap();
  showToast("Signed out. Static profile reset successfully.");
}

export function hideAuthModals() {
  const authOverlay = document.getElementById('auth-modal-overlay');
  if (authOverlay) authOverlay.style.display = 'none';
  const couponOverlay = document.getElementById('coupon-modal-overlay');
  if (couponOverlay) couponOverlay.style.display = 'none';
  const pricingOverlay = document.getElementById('pricing-modal-overlay');
  if (pricingOverlay) pricingOverlay.style.display = 'none';
  const profileOverlay = document.getElementById('profile-modal-overlay');
  if (profileOverlay) profileOverlay.style.display = 'none';
  
  const couponInput = document.getElementById('coupon-input');
  if (couponInput) couponInput.value = '';
  const errorEl = document.getElementById('coupon-error-msg');
  if (errorEl) errorEl.style.display = 'none';
}

export async function initAuthSystem() {
  // If user profile doesn't exist, seed it with default premium user
  const localUser = localStorage.getItem('aios_user_profile');
  if (localUser) {
    try {
      state.user = JSON.parse(localUser);
    } catch(e) {}
  }
  
  if (!state.user) {
    state.user = {
      id: "demo-user-123",
      email: "demo@aios.com",
      name: "Demo Premium User",
      gender: "Male",
      profession: "Business Owner",
      date_of_birth: "1995-01-01",
      plan_type: "Premium",
      trial_started_at: new Date().toISOString(),
      trial_expires_at: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
      trial_days_remaining: 3,
      is_coupon: false
    };
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
  }
  
  updateUserProfileHeader();
  
  const toggleBtn = document.getElementById('btn-toggle-auth-mode');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (authMode === 'signin') authMode = 'signup';
      else authMode = 'signin';
      updateAuthModalUI();
    });
  }

  const forgotBtn = document.getElementById('btn-forgot-password');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', () => {
      authMode = 'forgot';
      updateAuthModalUI();
    });
  }

  console.log("[Static Mode] Static authentication initialized cleanly.");
}

// Global exposure for backwards compatibility
window.initSupabase = initSupabase;
window.isUserAuthenticated = isUserAuthenticated;
window.updateUserProfileHeader = updateUserProfileHeader;
window.switchAuthTab = switchAuthTab;
window.updateAuthModalUI = updateAuthModalUI;
window.handleEmailSignin = handleEmailSignin;
window.handleEmailSignup = handleEmailSignup;
window.showOtpScreen = showOtpScreen;
window.hideOtpScreen = hideOtpScreen;
window.handleVerifyOtp = handleVerifyOtp;
window.handleForgotPassword = handleForgotPassword;
window.handleSupabaseSession = handleSupabaseSession;
window.showOnboardingModal = showOnboardingModal;
window.handleOnboardingSubmit = handleOnboardingSubmit;
window.showProfileModal = showProfileModal;
window.handleProfileSave = handleProfileSave;
window.handleCouponLogin = handleCouponLogin;
window.logoutUser = logoutUser;
window.hideAuthModals = hideAuthModals;
window.initAuthSystem = initAuthSystem;
