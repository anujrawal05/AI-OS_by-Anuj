// modules/auth.js
// Connected to Express V2 Custom Backend
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast, escapeHTML } from './utils.js';
import { apiCall } from './apiClient.js';

let authMode = 'signin';
let pendingEmail = ''; // Tracks user email across signup and OTP verification views

export function isUserAuthenticated() {
  return !!state.user;
}

/**
 * Updates the visual profile layouts, buttons, and plan badges across the viewport header
 */
export function updateUserProfileHeader() {
  const container = document.getElementById('user-profile-header');
  const subBadge = document.getElementById('header-subscription-badge');
  const authBtn = document.getElementById('header-auth-cta-btn');

  if (state.user) {
    if (subBadge) {
      const plan = (state.user.subscription && state.user.subscription.plan) || 'Free';
      const LABELS = { Trial: '⏳ Trial', Premium: '★ Premium', Free: 'Free' };
      subBadge.textContent = LABELS[plan] || plan;
      subBadge.setAttribute('data-plan', plan);
      subBadge.style.display = 'inline-flex';
    }
    if (authBtn) {
      authBtn.innerHTML = `<span>Sign Out</span>`;
      authBtn.onclick = () => logoutUser();
    }
  } else {
    if (subBadge) subBadge.style.display = 'none';
    if (authBtn) {
      authBtn.innerHTML = `<span>Sign In</span>`;
      authBtn.onclick = () => window.switchAuthTab('signin');
    }
  }
}

/**
 * Switches between Login, Registration, and OTP views inside the authorization drawer
 */
export function switchAuthTab(tabName) {
  authMode = tabName;
  const modal = document.getElementById('auth-modal-container');
  if (!modal) return;

  modal.classList.add('active');

  const signinForm = document.getElementById('auth-pane-signin');
  const signupForm = document.getElementById('auth-pane-signup');
  const otpForm = document.getElementById('auth-pane-otp');

  if (tabName === 'signin') {
    if (signinForm) signinForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'none';
  } else if (tabName === 'signup') {
    if (signinForm) signinForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (otpForm) otpForm.style.display = 'none';
  } else if (tabName === 'otp') {
    if (signinForm) signinForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'block';
    const dynamicEmailLabel = document.getElementById('otp-display-email');
    if (dynamicEmailLabel) dynamicEmailLabel.textContent = pendingEmail;
  }
}

/**
 * Handles New User Registration Submission
 */
export async function handleEmailSignup(event) {
  if (event) event.preventDefault();

  const emailInput = document.getElementById('signup-email-field');
  const passwordInput = document.getElementById('signup-password-field');
  const nameInput = document.getElementById('signup-name-field');

  if (!emailInput || !passwordInput) return;

  try {
    const payload = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      name: nameInput ? nameInput.value.trim() : ''
    };

    const response = await apiCall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (response.success) {
      showToast("Verification OTP code sent to your email!", "success");
      pendingEmail = payload.email;
      switchAuthTab('otp');
    }
  } catch (error) {
    showToast(error.message || "Failed to complete account registration.", "error");
  }
}

/**
 * Handles OTP Checkpoint Verification
 */
export async function handleVerifyOtp(event) {
  if (event) event.preventDefault();

  const otpInput = document.getElementById('otp-code-field');
  if (!otpInput) return;

  try {
    const payload = {
      email: pendingEmail,
      otp: otpInput.value.trim()
    };

    const response = await apiCall('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (response.success) {
      showToast("Account verified successfully!", "success");

      state.user = response.user;
      updateUserProfileHeader();

      hideAuthModals();
      showOnboardingModal();
    }
  } catch (error) {
    showToast(error.message || "Invalid or expired OTP code entered.", "error");
  }
}

/**
 * Handles Standard Returning Sign In (No OTP/Emails triggered)
 */
export async function handleEmailSignin(event) {
  if (event) event.preventDefault();

  const emailInput = document.getElementById('signin-email-field');
  const passwordInput = document.getElementById('signin-password-field');

  if (!emailInput || !passwordInput) return;

  try {
    const payload = {
      email: emailInput.value.trim(),
      password: passwordInput.value
    };

    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (response.success) {
      showToast("Welcome back to AI-OS!", "success");

      state.user = response.user;
      updateUserProfileHeader();
      hideAuthModals();

      if (response.hasDetails) {
        if (window.renderDashboard) window.renderDashboard();
      } else {
        showOnboardingModal();
      }
    }
  } catch (error) {
    showToast(error.message || "Invalid email or password parameters.", "error");
  }
}

/**
 * Saves local onboarding personal/business details form questionnaire parameters
 */
export async function handleOnboardingSubmit(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('onboard-name-field');
  const professionInput = document.getElementById('onboard-profession-field');
  const dobInput = document.getElementById('onboard-dob-field');
  const genderSelect = document.getElementById('onboard-gender-select');

  try {
    const payload = {
      name: nameInput ? nameInput.value.trim() : 'AI-OS User',
      profession: professionInput ? professionInput.value.trim() : 'User',
      dateOfBirth: dobInput ? dobInput.value : '1995-01-01',
      gender: genderSelect ? genderSelect.value : 'Prefer_Not_To_Say'
    };

    const response = await apiCall('/api/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (response.success) {
      showToast("Workspace account configuration complete!", "success");
      if (state.user) {
        state.user.profile = response.profile;
      }

      hideOnboardingModal();
      if (window.renderDashboard) window.renderDashboard();
    }
  } catch (error) {
    showToast(error.message || "Failed to finalize account parameters.", "error");
  }
}

/**
 * Handles Forgot Password Email Link Request Submission
 */
export async function handleForgotPassword(event) {
  if (event) event.preventDefault();

  const emailInput = document.getElementById('forgot-password-email-field');
  if (!emailInput) return;

  try {
    const payload = { email: emailInput.value.trim() };

    const response = await apiCall('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (response.success) {
      showToast("Reset password instructions sent to your email!", "success");
      hideAuthModals();
    }
  } catch (error) {
    showToast(error.message || "Failed to submit password reset request.", "error");
  }
}

/**
 * Checks session cookie mapping state automatically on window system boot initialization
 */
export async function initAuthSystem() {
  try {
    const response = await apiCall('/api/auth/me', { method: 'GET' });

    if (response.success && response.user) {
      state.user = response.user;
      updateUserProfileHeader();

      if (window.renderDashboard) window.renderDashboard();
    }
  } catch (error) {
    state.user = null;
    updateUserProfileHeader();
  }
}

export async function logoutUser() {
  try {
    await apiCall('/api/auth/logout', { method: 'POST' });
    showToast("Signed out successfully.", "info");
  } catch (err) {
    console.warn("Cookie session cleared locally.");
  } finally {
    state.user = null;
    updateUserProfileHeader();
    window.location.reload();
  }
}

export function hideAuthModals() {
  const modal = document.getElementById('auth-modal-container');
  if (modal) modal.classList.remove('active');
}

export function showOnboardingModal() {
  const obModal = document.getElementById('onboarding-modal-wrapper');
  if (obModal) obModal.classList.add('active');
}

export function hideOnboardingModal() {
  const obModal = document.getElementById('onboarding-modal-wrapper');
  if (obModal) obModal.classList.remove('active');
}

// Global window mappings for direct event accessibility across legacy raw html button tags
window.switchAuthTab = switchAuthTab;
window.handleEmailSignup = handleEmailSignup;
window.handleVerifyOtp = handleVerifyOtp;
window.handleEmailSignin = handleEmailSignin;
window.handleOnboardingSubmit = handleOnboardingSubmit;
window.handleForgotPassword = handleForgotPassword;
window.logoutUser = logoutUser;
window.initAuthSystem = initAuthSystem;