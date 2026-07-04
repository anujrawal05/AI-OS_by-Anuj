// Authentication Layer for AI-OS (Connected to Express V2 Backend)
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';
import { apiCall } from './apiClient.js';

let authMode = 'signin';
let onboardingUser = null;

export function isUserAuthenticated() {
  return !!state.user;
}

export function calculateUnlockRate() {
  if (state.analytics.compileRoadmapClicks === 0) return 0;
  const rate = (((state.analytics.emailSignIns || 0) + state.analytics.couponRedemptions) / state.analytics.compileRoadmapClicks) * 100;
  return Math.min(100, Math.round(rate));
}

export function updateUserProfileHeader() {
  const container = document.getElementById('user-profile-header');
  if (!container) return;

  // ---- Subscription badge ----
  const subBadge = document.getElementById('header-subscription-badge');
  if (subBadge) {
    if (state.user && state.user.subscription) {
      const plan = state.user.subscription.plan || 'Free';
      const LABELS = { Trial: '⏳ Trial', Premium: '★ Premium', Standard: 'Standard', Free: 'Free' };
      subBadge.textContent = LABELS[plan] || plan;
      subBadge.setAttribute('data-plan', plan);
      subBadge.style.display = 'inline-flex';
    } else {
      subBadge.style.display = 'none';
    }
  }

  const ctaBtn = document.getElementById('btn-upgrade-premium-cta');
  const heroCtaBtn = document.getElementById('btn-hero-upgrade-cta'); // may not exist on all pages
  
  // Set premium button active status based on the plan type loaded from the DB
  const isPremium = state.user && (state.user.subscription?.plan === 'Premium' || state.user.subscription?.plan === 'Trial');

  if (ctaBtn) {
    if (isPremium) {
      ctaBtn.style.display = 'block';
      ctaBtn.textContent = state.user.subscription.plan === 'Trial' ? 'Trial Plan Active' : 'Premium Active';
      ctaBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
      ctaBtn.style.color = '#fff';
      ctaBtn.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.3)';
      ctaBtn.style.animation = 'none';
      ctaBtn.onclick = () => {
        showToast("Full access unlocked! Plan: " + state.user.subscription.plan, "info");
      };
    } else {
      ctaBtn.style.display = 'block';
      ctaBtn.textContent = 'Upgrade Premium';
      ctaBtn.style.background = 'var(--accent-color)';
      ctaBtn.style.color = '#000';
      ctaBtn.style.boxShadow = 'none';
      ctaBtn.onclick = () => {
        const pricingOverlay = document.getElementById('pricing-modal-overlay');
        if (pricingOverlay) pricingOverlay.style.display = 'flex';
      };
    }
  }

  if (heroCtaBtn) {
    heroCtaBtn.style.display = isPremium ? 'none' : 'block';
  }
  
  if (state.user) {
    const initials = state.user.profile?.name 
      ? state.user.profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) 
      : state.user.email.split('@')[0].slice(0,2).toUpperCase();
      
    container.innerHTML = `
      <div class="profile-dropdown-wrapper">
        <button id="btn-header-profile" class="profile-btn" style="background: linear-gradient(135deg, #2EC5FF 0%, #00D084 100%); color: #000; font-weight: 700; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.88rem; cursor: pointer; border: none; outline: none; transition: transform 0.2s;">
          ${initials}
        </button>
        <div id="header-profile-dropdown" class="profile-dropdown">
          <div class="profile-dropdown-header">
            <strong>${state.user.profile?.name || 'AI-OS User'}</strong>
            <span>${state.user.email}</span>
          </div>
          <a href="#" id="btn-dropdown-profile" class="profile-dropdown-item">
            👤 &nbsp; Settings / Profile
          </a>
          ${state.user.role === 'Admin' ? `
          <a href="#" id="btn-dropdown-admin" class="profile-dropdown-item" style="color: var(--accent-color); font-weight: 600;">
            ⚙️ &nbsp; Admin Control Panel
          </a>` : ''}
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

    const adminMenuBtn = document.getElementById('btn-dropdown-admin');
    if (adminMenuBtn) {
      adminMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown) dropdown.classList.remove('active');
        showAdminModal();
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
        // BUG-012 fix: always reset to signin mode when opening via the header button
        authMode = 'signin';
        updateAuthModalUI();
        const authOverlay = document.getElementById('auth-modal-overlay');
        if (authOverlay) authOverlay.style.display = 'flex';
      });
    }
  }
}

// BUG-011: switchAuthTab() removed — the auth modal uses a single unified form
// controlled by authMode + updateAuthModalUI(), not separate signin/signup form divs.
// This stub is kept for backwards compatibility with any external callers.
export function switchAuthTab(tab) {
  authMode = tab === 'signup' ? 'signup' : 'signin';
  updateAuthModalUI();
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

  const nameContainer = document.getElementById('auth-name-container');

  if (authMode === 'signin') {
    if (title) title.textContent = 'Access AI-OS';
    if (desc) desc.textContent = 'Securely sign in to access all platform features, timelines, and digital business modules.';
    if (pwdContainer) pwdContainer.style.display = 'block';
    if (nameContainer) nameContainer.style.display = 'none';
    if (btnSignin) { btnSignin.style.display = 'block'; btnSignin.textContent = 'Sign In'; }
    if (btnSignup) btnSignup.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = 'Create Account instead';
    if (forgotBtn) forgotBtn.style.display = 'inline-block';
  } else if (authMode === 'signup') {
    if (title) title.textContent = 'Create Account';
    if (desc) desc.textContent = 'Sign up to start your premium experience and build smart AI workspaces.';
    if (pwdContainer) pwdContainer.style.display = 'block';
    if (nameContainer) nameContainer.style.display = 'block'; // BUG-022: show name field
    if (btnSignin) btnSignin.style.display = 'none';
    if (btnSignup) { btnSignup.style.display = 'block'; btnSignup.textContent = 'Sign Up'; }
    if (toggleBtn) toggleBtn.textContent = 'Sign In instead';
    if (forgotBtn) forgotBtn.style.display = 'none';
  } else if (authMode === 'forgot') {
    if (title) title.textContent = 'Reset Password';
    if (desc) desc.textContent = 'Enter your email address and we will generate a recovery link.';
    if (pwdContainer) pwdContainer.style.display = 'none';
    if (nameContainer) nameContainer.style.display = 'none';
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
  
  try {
    const data = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.success) {
      // Re-fetch context to populate subscriptions & profile properties
      const context = await apiCall('/api/auth/me');
      state.user = context.user;
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
      
      if (window.syncBookmarksFromBackend) {
        window.syncBookmarksFromBackend();
      }
      
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) authOverlay.style.display = 'none';
      
      updateUserProfileHeader();
      if (window.initTrialClock) window.initTrialClock();
      showToast("Logged in successfully!");
    }
  } catch (err) {
    if (err.message === 'No backend') return; // Banner already shown
    if (err.message && err.message.toLowerCase().includes('verification required')) {
      showOtpScreen();
      showToast("Please verify the OTP code sent during registration.", "warning");
    } else if (err.message && err.message !== 'Unauthorized') {
      if (errorEl) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
      }
    }
  }
}

export async function handleEmailSignup() {
  const emailEl = document.getElementById('auth-email');
  const passwordEl = document.getElementById('auth-password');
  const nameEl = document.getElementById('auth-name'); // BUG-022: optional name field
  const errorEl = document.getElementById('auth-modal-error');
  
  const email = emailEl ? emailEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  const name = nameEl ? nameEl.value.trim() : '';
  
  if (!email || !password) {
    if (errorEl) { errorEl.textContent = 'Please enter email and password.'; errorEl.style.display = 'block'; }
    return;
  }
  
  if (password.length < 6) {
    if (errorEl) { errorEl.textContent = 'Password must be at least 6 characters.'; errorEl.style.display = 'block'; }
    return;
  }
  
  try {
    const payload = { email, password };
    if (name) payload.name = name; // include optional display name

    const data = await apiCall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (data.success) {
      showOtpScreen();
      showToast("Verification OTP code has been sent to your email!");
    }
  } catch (err) {
    if (err.message === 'No backend') return; // Banner already shown
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }
}

export function showOtpScreen() {
  const title = document.getElementById('auth-modal-title');
  const desc = document.getElementById('auth-modal-desc');
  if (title) title.textContent = 'Verify OTP';
  if (desc) desc.textContent = 'Enter the 6-digit verification code sent to your email address.';
  
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
  const emailEl = document.getElementById('auth-email');

  const otp = codeEl ? codeEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';

  if (!otp) {
    if (errorEl) { errorEl.textContent = 'Please enter the verification code.'; errorEl.style.display = 'block'; }
    return;
  }
  
  try {
    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';

    const nameEl = document.getElementById('auth-name'); // BUG-022: include name if provided
    const name = nameEl ? nameEl.value.trim() : '';
    const payload = { email, otp };
    if (name) payload.name = name;

    const data = await apiCall('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (data.success) {
      if (successEl) { successEl.textContent = 'Code verified successfully!'; successEl.style.display = 'block'; }
      
      const context = await apiCall('/api/auth/me');
      state.user = context.user;
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));

      if (window.syncBookmarksFromBackend) {
        window.syncBookmarksFromBackend();
      }

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
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }
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
  
  try {
    const data = await apiCall('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (data.success) {
      if (successEl) {
        successEl.textContent = 'Recovery instructions sent to your email!';
        successEl.style.display = 'block';
      }
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }
}

export function showOnboardingModal(user) {
  onboardingUser = user;
  const overlay = document.getElementById('onboarding-modal-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    // BUG-023 fix: Keep close button visible so user can dismiss if API call fails.
    // Previously this was hidden, trapping users in the modal permanently on error.
    const closeBtn = overlay.querySelector('.auth-modal-close-btn');
    if (closeBtn) closeBtn.style.display = 'block';
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
  
  try {
    const data = await apiCall('/api/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify({
        name: fullName,
        dateOfBirth: dob,
        gender,
        profession
      })
    });

    if (data.success) {
      const overlay = document.getElementById('onboarding-modal-overlay');
      if (overlay) overlay.style.display = 'none';
      
      const welcomeModal = document.getElementById('trial-welcome-modal-overlay');
      if (welcomeModal) welcomeModal.style.display = 'flex';
      
      const context = await apiCall('/api/auth/me');
      state.user = context.user;
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
      
      if (window.syncBookmarksFromBackend) {
        window.syncBookmarksFromBackend();
      }
      
      updateUserProfileHeader();
      if (window.initTrialClock) window.initTrialClock();
      showToast("Profile completed successfully!");
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }
}

export function showProfileModal() {
  if (!state.user) return;
  
  // BUG-020: Null-guard all profile modal element accesses
  const pfEmail = document.getElementById('pf-email');
  const pfFullname = document.getElementById('pf-fullname');
  const pfDob = document.getElementById('pf-dob');
  const pfGender = document.getElementById('pf-gender');
  const pfProfession = document.getElementById('pf-profession');
  const pfPlanDisplay = document.getElementById('pf-plan-display');

  if (!pfEmail) return; // profile modal not in DOM on this page

  pfEmail.value = state.user.email || '';
  if (pfFullname) pfFullname.value = state.user.profile?.name || '';
  if (pfDob) pfDob.value = state.user.profile?.dateOfBirth ? state.user.profile.dateOfBirth.slice(0, 10) : '';
  if (pfGender) pfGender.value = state.user.profile?.gender || '';
  if (pfProfession) pfProfession.value = state.user.profile?.profession || '';
  
  const planName = state.user.subscription?.plan || 'Free';
  if (pfPlanDisplay) pfPlanDisplay.textContent = planName;
  
  const accountTypeEl = document.getElementById('pf-account-type-display');
  const accessStatusEl = document.getElementById('pf-access-status-display');
  
  if (accountTypeEl) accountTypeEl.textContent = state.user.role === 'Admin' ? 'Administrator' : 'Standard User';
  
  if (accessStatusEl) {
    accessStatusEl.innerHTML = planName;
    if (planName === 'Premium' || planName === 'Trial') {
      accessStatusEl.className = 'badge-access premium-badge';
    } else {
      accessStatusEl.className = 'badge-access free-badge';
    }
  }
  
  // BUG-021: Null-guard mobile theme toggle label
  const mobileThemeLabel = document.querySelector('#pf-mobile-theme-toggle .pf-theme-label');
  if (mobileThemeLabel) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    mobileThemeLabel.textContent = isLight ? '☀️ Light Mode' : '🌙 Dark Mode';
  }

  const overlay = document.getElementById('profile-modal-overlay');
  if (overlay) overlay.style.display = 'flex';
}

export async function handleProfileSave(e) {
  e.preventDefault();
  
  const fullNameEl = document.getElementById('pf-fullname');
  const dobEl = document.getElementById('pf-dob');
  const genderEl = document.getElementById('pf-gender');
  const professionEl = document.getElementById('pf-profession');

  if (!fullNameEl) {
    showToast("Profile elements not found.", "error");
    return;
  }

  const fullName = fullNameEl.value.trim();
  const dob = dobEl ? dobEl.value : '';
  const gender = genderEl ? genderEl.value : '';
  const profession = professionEl ? professionEl.value : '';
  
  if (!fullName) {
    showToast("Name is required.", "error");
    return;
  }
  
  try {
    const data = await apiCall('/api/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify({
        name: fullName,
        dateOfBirth: dob,
        gender,
        profession
      })
    });

    if (data.success) {
      const context = await apiCall('/api/auth/me');
      state.user = context.user;
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
      
      const overlay = document.getElementById('profile-modal-overlay');
      if (overlay) overlay.style.display = 'none';
      updateUserProfileHeader();
      showToast("Profile settings saved successfully!");
    }
  } catch (err) {
    showToast("Failed to save profile: " + err.message, "error");
  }
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

  // The coupon endpoint requires an active session — the code upgrades the
  // subscription of an existing account, it does not create one.
  // If the user is not signed in, redirect them to sign-in first.
  if (!state.user) {
    if (errorEl) {
      errorEl.textContent = 'Please sign in or create a free account first, then redeem your code.';
      errorEl.style.display = 'block';
    }
    setTimeout(() => {
      const couponOverlay = document.getElementById('coupon-modal-overlay');
      if (couponOverlay) couponOverlay.style.display = 'none';
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) authOverlay.style.display = 'flex';
    }, 1800);
    return;
  }

  try {
    const data = await apiCall('/api/payments/coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode })
    });

    if (data.success) {
      const context = await apiCall('/api/auth/me');
      state.user = context.user;
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));

      hideAuthModals();
      updateUserProfileHeader();
      if (window.AdManager) window.AdManager.updateAdVisibility();
      if (window.regenerateActiveRoadmap) window.regenerateActiveRoadmap();
      if (window.initTrialClock) window.initTrialClock();

      showToast("Coupon redeemed successfully! Premium access unlocked.");
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }
}

export async function handlePremiumUpgrade(planLabel) {
  if (!state.user) {
    const pricingOverlay = document.getElementById('pricing-modal-overlay');
    if (pricingOverlay) pricingOverlay.style.display = 'none';
    const authOverlay = document.getElementById('auth-modal-overlay');
    if (authOverlay) authOverlay.style.display = 'flex';
    showToast("Please sign in to upgrade to Premium.", "warning");
    return;
  }

  // Lazy-load Razorpay only when the user actually initiates a payment
  // (prevents the browser Web Payment Handler permission prompt on page load)
  if (!window.Razorpay) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Payment gateway failed to load'));
      document.head.appendChild(s);
    }).catch(err => { throw err; });
  }
  if (!window.Razorpay) {
    showToast("Payment gateway failed to load. Please refresh and try again.", "error");
    return;
  }

  try {
    const keyData = await apiCall('/api/payments/key');
    const razorpayKeyId = keyData && keyData.key;
    if (!razorpayKeyId) {
      showToast('Payment gateway not configured. Please contact support.', 'error');
      return;
    }

    const order = await apiCall('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ planType: 'Premium' })
    });

    const rzp = new window.Razorpay({
      key: razorpayKeyId,
      amount: Math.round(order.amount * 100),
      currency: order.currency,
      order_id: order.orderId,
      name: 'AI-OS Premium',
      description: `${planLabel} Plan Upgrade`,
      prefill: { email: state.user.email },
      theme: { color: '#00D084' },
      handler: async (response) => {
        try {
          await apiCall('/api/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const context = await apiCall('/api/auth/me');
          state.user = context.user;
          localStorage.setItem('aios_user_profile', JSON.stringify(state.user));

          hideAuthModals();
          updateUserProfileHeader();
          if (window.AdManager) window.AdManager.updateAdVisibility();
          if (window.regenerateActiveRoadmap) window.regenerateActiveRoadmap();
          if (window.initTrialClock) window.initTrialClock();
          showToast("Payment successful! Premium access unlocked.");
        } catch (err) {
          showToast(err.message || "Payment verification failed. Please contact support.", "error");
        }
      },
      modal: {
        ondismiss: () => {
          showToast("Payment cancelled.", "warning");
        }
      }
    });

    rzp.on('payment.failed', (resp) => {
      showToast(resp?.error?.description || "Payment failed. Please try again.", "error");
    });

    rzp.open();
  } catch (err) {
    showToast(err.message || "Unable to start checkout. Please try again.", "error");
  }
}

export async function logoutUser() {
  try {
    await apiCall('/api/auth/logout', { method: 'POST' });
  } catch (e) {}

  // Reset local state cache
  state.user = null;
  localStorage.removeItem('aios_user_profile');
  sessionStorage.removeItem('aios_coupon_session');
  localStorage.removeItem('ai-os-favorites');
  
  hideAuthModals();
  updateUserProfileHeader();
  if (window.AdManager) window.AdManager.updateAdVisibility();
  if (window.regenerateActiveRoadmap) window.regenerateActiveRoadmap();
  showToast("Logged out successfully.");
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
  // Restore session context dynamically from backend on startup
  try {
    const data = await apiCall('/api/auth/me');
    if (data && data.success) {
      state.user = data.user;
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
      
      if (window.syncBookmarksFromBackend) {
        window.syncBookmarksFromBackend();
      }
    }
  } catch (err) {
    // BUG-025: Distinguish between "not logged in" (401) and "backend unavailable" (No backend / network error)
    // In both cases we set state.user = null but log differently for debugging.
    if (err.message === 'No backend') {
      console.info('[auth] Backend not connected — running in guest mode.');
    } else if (err.status === 401 || (err.message && err.message.toLowerCase().includes('401'))) {
      console.info('[auth] No active session — guest mode.');
    } else {
      console.warn('[auth] Session restore failed:', err.message);
    }
    state.user = null;
    localStorage.removeItem('aios_user_profile');
  }
  
  updateUserProfileHeader();
  
  // Handle Reset Password action extract on page load
  const urlParams = new URLSearchParams(window.location.search);
  const resetAction = urlParams.get('action');
  const resetTokenVal = urlParams.get('token');
  if (resetAction === 'reset-password' && resetTokenVal) {
    const resetOverlay = document.getElementById('reset-password-modal-overlay');
    if (resetOverlay) resetOverlay.style.display = 'flex';
  }

  // Bind Switch Mode button inside the main auth card
  const toggleBtn = document.getElementById('btn-toggle-auth-mode');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (authMode === 'signin') authMode = 'signup';
      else if (authMode === 'signup') authMode = 'signin';
      else authMode = 'signin';
      updateAuthModalUI();
    });
  }

  // Bind Forgot Password button inside the main auth card
  const forgotBtn = document.getElementById('btn-forgot-password');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', () => {
      authMode = 'forgot';
      updateAuthModalUI();
    });
  }

  // Sign In / Forgot Password Submit click
  const btnSignin = document.getElementById('btn-email-signin');
  if (btnSignin) {
    btnSignin.addEventListener('click', () => {
      if (authMode === 'signin') handleEmailSignin();
      else if (authMode === 'forgot') handleForgotPassword();
    });
  }

  // Sign Up Submit click
  const btnSignup = document.getElementById('btn-email-signup');
  if (btnSignup) {
    btnSignup.addEventListener('click', handleEmailSignup);
  }

  // Verify OTP Submit click
  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', handleVerifyOtp);
  }

  // BUG-005: Resend OTP button — calls the /api/auth/resend-otp endpoint
  const btnResendOtp = document.getElementById('btn-resend-otp');
  if (btnResendOtp) {
    btnResendOtp.addEventListener('click', async () => {
      const emailEl = document.getElementById('auth-email');
      const otpErrorEl = document.getElementById('otp-error-msg');
      const otpSuccessEl = document.getElementById('otp-success-msg');
      const email = emailEl ? emailEl.value.trim() : '';
      if (!email) {
        if (otpErrorEl) { otpErrorEl.textContent = 'Email address not found. Please go back and enter your email.'; otpErrorEl.style.display = 'block'; }
        return;
      }
      try {
        btnResendOtp.disabled = true;
        btnResendOtp.textContent = 'Sending...';
        if (otpErrorEl) otpErrorEl.style.display = 'none';
        if (otpSuccessEl) otpSuccessEl.style.display = 'none';
        const data = await apiCall('/api/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) });
        if (data.success) {
          if (otpSuccessEl) { otpSuccessEl.textContent = 'New OTP sent! Check your email.'; otpSuccessEl.style.display = 'block'; }
          // 30-second cooldown to prevent spam
          let countdown = 30;
          const interval = setInterval(() => {
            btnResendOtp.textContent = `Resend OTP (${countdown}s)`;
            countdown--;
            if (countdown < 0) { clearInterval(interval); btnResendOtp.disabled = false; btnResendOtp.textContent = 'Resend OTP'; }
          }, 1000);
        }
      } catch (err) {
        if (otpErrorEl) { otpErrorEl.textContent = err.message || 'Failed to resend OTP.'; otpErrorEl.style.display = 'block'; }
        btnResendOtp.disabled = false;
        btnResendOtp.textContent = 'Resend OTP';
      }
    });
  }

  // Back to login/auth from OTP
  const btnBackToAuth = document.getElementById('btn-back-to-auth');
  if (btnBackToAuth) {
    btnBackToAuth.addEventListener('click', hideOtpScreen);
  }

  // Close main auth modal — BUG-012 fix: reset authMode to 'signin' on close
  const closeBtn = document.getElementById('auth-modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      authMode = 'signin';
      hideAuthModals();
    });
  }

  // Coupon trigger inside main auth card
  const couponTrigger = document.getElementById('btn-auth-coupon-trigger');
  if (couponTrigger) {
    couponTrigger.addEventListener('click', () => {
      hideAuthModals();
      const couponOverlay = document.getElementById('coupon-modal-overlay');
      if (couponOverlay) couponOverlay.style.display = 'flex';
    });
  }

  // Close coupon modal
  const couponCloseBtn = document.getElementById('coupon-modal-close-btn');
  if (couponCloseBtn) {
    couponCloseBtn.addEventListener('click', hideAuthModals);
  }

  // Close pricing modal
  const pricingCloseBtn = document.getElementById('pricing-modal-close-btn');
  if (pricingCloseBtn) {
    pricingCloseBtn.addEventListener('click', hideAuthModals);
  }

  // Pricing plan selection (hidden proxy buttons clicked by the inline pricing-modal script)
  const pricingFreeBtn = document.getElementById('btn-pricing-free');
  if (pricingFreeBtn) {
    pricingFreeBtn.addEventListener('click', hideAuthModals);
  }

  const pricingMonthlyBtn = document.getElementById('btn-pricing-monthly');
  if (pricingMonthlyBtn) {
    pricingMonthlyBtn.addEventListener('click', () => handlePremiumUpgrade('Monthly'));
  }

  const pricingYearlyBtn = document.getElementById('btn-pricing-yearly');
  if (pricingYearlyBtn) {
    pricingYearlyBtn.addEventListener('click', () => handlePremiumUpgrade('Yearly'));
  }

  const pricingCouponBtn = document.getElementById('btn-pricing-coupon');
  if (pricingCouponBtn) {
    pricingCouponBtn.addEventListener('click', () => {
      hideAuthModals();
      const couponOverlay = document.getElementById('coupon-modal-overlay');
      if (couponOverlay) couponOverlay.style.display = 'flex';
    });
  }

  // Coupon Submit click
  const couponSubmitBtn = document.getElementById('btn-coupon-submit');
  if (couponSubmitBtn) {
    couponSubmitBtn.addEventListener('click', () => {
      const couponInput = document.getElementById('coupon-input');
      if (couponInput) handleCouponLogin(couponInput.value.trim());
    });
  }

  // Bind Submit Reset Password
  const btnSubmitReset = document.getElementById('btn-submit-reset-password');
  if (btnSubmitReset) {
    btnSubmitReset.addEventListener('click', async () => {
      const newPasswordEl = document.getElementById('reset-new-password');
      const errorEl = document.getElementById('reset-modal-error');
      const successEl = document.getElementById('reset-modal-success');
      const token = new URLSearchParams(window.location.search).get('token');
      
      const newPassword = newPasswordEl ? newPasswordEl.value : '';
      if (!newPassword || newPassword.length < 6) {
        if (errorEl) { errorEl.textContent = 'Password must be at least 6 characters.'; errorEl.style.display = 'block'; }
        return;
      }
      
      try {
        const data = await apiCall('/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, password: newPassword })
        });
        
        if (errorEl) errorEl.style.display = 'none';
        if (successEl) {
          successEl.textContent = 'Password reset successfully! Redirecting...';
          successEl.style.display = 'block';
        }
        setTimeout(() => {
          const resetOverlay = document.getElementById('reset-password-modal-overlay');
          if (resetOverlay) resetOverlay.style.display = 'none';
          const authOverlay = document.getElementById('auth-modal-overlay');
          if (authOverlay) authOverlay.style.display = 'flex';
        }, 2000);
      } catch (err) {
        if (errorEl) { errorEl.textContent = err.message || 'Connection failed.'; errorEl.style.display = 'block'; }
      }
    });
  }

  // Close Reset Password Modal
  const resetCloseBtn = document.getElementById('reset-password-modal-close-btn');
  if (resetCloseBtn) {
    resetCloseBtn.addEventListener('click', () => {
      const resetOverlay = document.getElementById('reset-password-modal-overlay');
      if (resetOverlay) resetOverlay.style.display = 'none';
    });
  }

  // Close Profile Modal
  const profileCloseBtn = document.getElementById('profile-modal-close-btn');
  if (profileCloseBtn) {
    profileCloseBtn.addEventListener('click', () => {
      const profileOverlay = document.getElementById('profile-modal-overlay');
      if (profileOverlay) profileOverlay.style.display = 'none';
    });
  }

  // Profile Save submit
  const profileForm = document.getElementById('profile-edit-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileSave);
  }

  // Onboarding Save submit
  const onboardingForm = document.getElementById('onboarding-form');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', handleOnboardingSubmit);
  }

  // Enter key bindings on input fields
  const authEmailInput = document.getElementById('auth-email');
  const authPasswordInput = document.getElementById('auth-password');
  const authOtpInput = document.getElementById('auth-otp-code');

  if (authEmailInput) {
    authEmailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (authMode === 'signin') handleEmailSignin();
        else if (authMode === 'signup') handleEmailSignup();
        else if (authMode === 'forgot') handleForgotPassword();
      }
    });
  }

  if (authPasswordInput) {
    authPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (authMode === 'signin') handleEmailSignin();
        else if (authMode === 'signup') handleEmailSignup();
      }
    });
  }

  if (authOtpInput) {
    authOtpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleVerifyOtp();
      }
    });
  }
}

export async function showAdminModal() {
  let modal = document.getElementById('admin-dashboard-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-dashboard-modal';
    modal.className = 'auth-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5,5,8,0.9); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 10001;';
    
    modal.innerHTML = `
      <div class="auth-modal-card" style="max-width: 800px; width: 95%; max-height: 85vh; overflow-y: auto; background: #0A0A0C; border: 1px solid rgba(255,255,255,0.08); padding: 32px; border-radius: 16px; position: relative; font-family: sans-serif;">
        <button id="admin-modal-close-btn" class="auth-modal-close-btn" style="position: absolute; right: 20px; top: 20px; background: transparent; border: none; color: #fff; font-size: 1.5rem; cursor: pointer;">&times;</button>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <span style="font-size: 1.8rem;">⚙️</span>
          <h2 style="font-family: monospace; color: #fff; margin: 0; font-weight: 700;">Admin Control Panel</h2>
        </div>
        
        <!-- Tab buttons -->
        <div style="display: flex; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 20px;">
          <button class="admin-tab-btn active" data-tab="stats" style="background: transparent; border: none; color: var(--accent-color); font-weight: 600; cursor: pointer; padding: 4px 12px; font-family: inherit;">Dashboard Stats</button>
          <button class="admin-tab-btn" data-tab="users" style="background: transparent; border: none; color: #888; font-weight: 600; cursor: pointer; padding: 4px 12px; font-family: inherit;">User Manager</button>
          <button class="admin-tab-btn" data-tab="broadcast" style="background: transparent; border: none; color: #888; font-weight: 600; cursor: pointer; padding: 4px 12px; font-family: inherit;">Alert Broadcast</button>
        </div>
        
        <!-- Tab Content Panes -->
        <div id="admin-tab-stats" class="admin-tab-pane active">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px;" id="admin-stats-grid">
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; text-align: center;">
              <span style="color: #888; font-size: 0.8rem;">Total Users</span>
              <h3 id="admin-stat-total" style="font-size: 1.8rem; margin: 8px 0 0 0; color: #fff; font-family: monospace;">...</h3>
            </div>
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; text-align: center;">
              <span style="color: #888; font-size: 0.8rem;">Active Premium</span>
              <h3 id="admin-stat-premium" style="font-size: 1.8rem; margin: 8px 0 0 0; color: var(--accent-color); font-family: monospace;">...</h3>
            </div>
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; text-align: center;">
              <span style="color: #888; font-size: 0.8rem;">Trial Users</span>
              <h3 id="admin-stat-trial" style="font-size: 1.8rem; margin: 8px 0 0 0; color: #2ecc71; font-family: monospace;">...</h3>
            </div>
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; text-align: center;">
              <span style="color: #888; font-size: 0.8rem;">Revenue</span>
              <h3 id="admin-stat-revenue" style="font-size: 1.8rem; margin: 8px 0 0 0; color: #f1c40f; font-family: monospace;">...</h3>
            </div>
          </div>
          
          <h4 style="color: #fff; margin-bottom: 12px; font-weight: 600;">Recent Audit Logs</h4>
          <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 0.78rem;" id="admin-recent-logs">
            Loading system events...
          </div>
        </div>
        
        <div id="admin-tab-users" class="admin-tab-pane" style="display: none;">
          <div style="display: flex; gap: 12px; margin-bottom: 16px;">
            <input type="text" id="admin-user-search" placeholder="Search by email..." style="flex: 1; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #fff;">
            <button id="btn-admin-search-users" class="btn btn-secondary" style="padding: 8px 16px; font-family: inherit;">Search</button>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #888;">
                  <th style="padding: 8px;">User</th>
                  <th style="padding: 8px;">Tier</th>
                  <th style="padding: 8px;">Status</th>
                  <th style="padding: 8px; text-align: right;">Operations</th>
                </tr>
              </thead>
              <tbody id="admin-users-table-body">
                <tr><td colspan="4" style="text-align: center; padding: 12px; color: #888;">Click search to retrieve users...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div id="admin-tab-broadcast" class="admin-tab-pane" style="display: none;">
          <form id="admin-broadcast-form" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label style="display: block; font-size: 0.8rem; margin-bottom: 4px; color: #888;">Notification Title</label>
              <input type="text" id="broadcast-title" required placeholder="e.g. System Upgrade Scheduled" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #fff; box-sizing: border-box;">
            </div>
            <div class="form-group">
              <label style="display: block; font-size: 0.8rem; margin-bottom: 4px; color: #888;">Broadcast Message Body</label>
              <textarea id="broadcast-message" required rows="4" placeholder="Type notification details here..." style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #fff; font-family: sans-serif; resize: vertical; box-sizing: border-box;"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; margin-top: 10px; font-family: inherit;">Dispatch Broadcast Alert</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Tab switching controls
    modal.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.admin-tab-btn').forEach(b => {
          b.classList.remove('active');
          b.style.color = '#888';
        });
        btn.classList.add('active');
        btn.style.color = 'var(--accent-color)';
        
        modal.querySelectorAll('.admin-tab-pane').forEach(p => p.style.display = 'none');
        const activePane = modal.querySelector(`#admin-tab-${btn.getAttribute('data-tab')}`);
        if (activePane) activePane.style.display = 'block';
        
        if (btn.getAttribute('data-tab') === 'users') {
          loadAdminUserList();
        }
      });
    });
    
    // Close handles
    modal.querySelector('#admin-modal-close-btn').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // User search button
    modal.querySelector('#btn-admin-search-users').addEventListener('click', loadAdminUserList);
    
    // Broadcast submit
    modal.querySelector('#admin-broadcast-form').addEventListener('submit', handleBroadcastSubmit);
  }
  
  modal.style.display = 'flex';
  loadAdminStats();
}

async function loadAdminStats() {
  try {
    const data = await apiCall('/api/admin/stats');
    if (data && data.success) {
      document.getElementById('admin-stat-total').textContent = data.stats.totalUsers;
      document.getElementById('admin-stat-premium').textContent = data.stats.premiumUsers;
      document.getElementById('admin-stat-trial').textContent = data.stats.trialUsers;
      document.getElementById('admin-stat-revenue').textContent = `₹${data.stats.totalRevenue}`;
      
      const logsContainer = document.getElementById('admin-recent-logs');
      if (logsContainer && data.stats.recentLogs) {
        logsContainer.innerHTML = data.stats.recentLogs.map(l => {
          const time = new Date(l.createdAt).toLocaleTimeString();
          return `<div style="margin-bottom: 4px; color: rgba(255,255,255,0.7);"><span style="color:var(--accent-color);">[${time}]</span> User ${l.userId.slice(0,6)} performed <strong>${l.action}</strong></div>`;
        }).join('') || '<div style="color: #666;">No audit log records available.</div>';
      }
    }
  } catch (err) {
    showToast("Failed to fetch admin statistics", "error");
  }
}

async function loadAdminUserList() {
  const searchQuery = document.getElementById('admin-user-search').value.trim();
  const tableBody = document.getElementById('admin-users-table-body');
  if (!tableBody) return;
  
  tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 12px; color: #888;">Fetching latest directory...</td></tr>`;
  
  try {
    const endpoint = `/api/admin/users?search=${encodeURIComponent(searchQuery)}`;
    const data = await apiCall(endpoint);
    if (data && data.success) {
      tableBody.innerHTML = data.users.map(u => {
        const isSuspended = u.status === 'Suspended';
        const plan = u.subscription?.plan || 'Free';
        
        return `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 10px; color: #fff;">
              <div>${u.profile?.name || 'No Name'}</div>
              <div style="font-size:0.75rem; color:#666;">${u.email}</div>
            </td>
            <td style="padding: 10px;">
              <select onchange="updateUserTier('${u.id}', this.value)" style="background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 4px; border-radius: 4px;">
                <option value="Free" ${plan === 'Free' ? 'selected' : ''}>Free</option>
                <option value="Trial" ${plan === 'Trial' ? 'selected' : ''}>Trial</option>
                <option value="Premium" ${plan === 'Premium' ? 'selected' : ''}>Premium</option>
              </select>
            </td>
            <td style="padding: 10px;">
              <span style="color: ${isSuspended ? '#ff4a4a' : '#2ecc71'};">${u.status || 'Active'}</span>
            </td>
            <td style="padding: 10px; text-align: right;">
              <button onclick="toggleUserSuspension('${u.id}', ${isSuspended})" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 4px; background: ${isSuspended ? '#2ecc71' : '#ff4a4a'}; border: none; color: #000; cursor: pointer; font-family: inherit;">
                ${isSuspended ? 'Activate' : 'Suspend'}
              </button>
            </td>
          </tr>
        `;
      }).join('') || `<tr><td colspan="4" style="text-align: center; padding: 12px; color: #888;">No users found matching search filter.</td></tr>`;
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 12px; color: #ff4a4a;">Failed to load directory details.</td></tr>`;
  }
}

async function handleBroadcastSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('broadcast-title').value.trim();
  const message = document.getElementById('broadcast-message').value.trim();
  
  try {
    const data = await apiCall('/api/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message })
    });
    
    if (data.success) {
      showToast("Alert broadcast dispatched successfully to all profiles!", "success");
      document.getElementById('broadcast-title').value = '';
      document.getElementById('broadcast-message').value = '';
    }
  } catch (err) {
    showToast("Failed to dispatch broadcast alert: " + err.message, "error");
  }
}

async function updateUserTier(userId, newPlan) {
  try {
    const data = await apiCall(`/api/admin/users/${userId}/tier`, {
      method: 'POST',
      body: JSON.stringify({ tier: newPlan })
    });
    if (data.success) {
      showToast("User subscription tier updated successfully!", "success");
      loadAdminUserList();
    }
  } catch (err) {
    showToast("Failed to update user tier: " + err.message, "error");
  }
}

async function toggleUserSuspension(userId, currentSuspended) {
  const endpoint = `/api/admin/users/${userId}/${currentSuspended ? 'activate' : 'suspend'}`;
  try {
    const data = await apiCall(endpoint, { method: 'POST' });
    if (data.success) {
      showToast(`User account ${currentSuspended ? 'activated' : 'suspended'} successfully.`, "success");
      loadAdminUserList();
    }
  } catch (err) {
    showToast("Failed to execute moderation change: " + err.message, "error");
  }
}

// Global exposure for backwards compatibility with inline HTML events
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
window.showOnboardingModal = showOnboardingModal;
window.handleOnboardingSubmit = handleOnboardingSubmit;
window.showProfileModal = showProfileModal;
window.handleProfileSave = handleProfileSave;
window.handleCouponLogin = handleCouponLogin;
window.handlePremiumUpgrade = handlePremiumUpgrade;
window.logoutUser = logoutUser;
window.hideAuthModals = hideAuthModals;
window.initAuthSystem = initAuthSystem;
window.showAdminModal = showAdminModal;
window.updateUserTier = updateUserTier;
window.toggleUserSuspension = toggleUserSuspension;
