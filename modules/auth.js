// Authentication Layer for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';

let supabaseClient = null;
let authMode = 'signin';
let onboardingUser = null;

export async function initSupabase() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (config.supabaseUrl && config.supabaseAnonKey) {
      supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log("Supabase client initialized successfully.");
    } else {
      console.warn("Supabase credentials missing from config API.");
    }
  } catch (err) {
    console.error("Failed to initialize Supabase:", err);
  }
}

export function isUserAuthenticated() {
  // Always return true to bypass authentication gates in static mode
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
  
  // Update Premium CTA visibility in the header actions
  const ctaBtn = document.getElementById('btn-upgrade-premium-cta');
  const heroCtaBtn = document.getElementById('btn-hero-upgrade-cta');
  
  if (ctaBtn) {
    if (state.user && (state.user.plan_type === 'Premium' || state.user.plan_type === 'Trial Premium')) {
      ctaBtn.style.display = 'block';
      ctaBtn.textContent = (state.user.plan_type === 'Trial Premium') ? 'Trial Active' : 'Premium Active';
      ctaBtn.style.background = (state.user.plan_type === 'Trial Premium') ? 'linear-gradient(135deg, #FFD54A, #2EC5FF)' : 'linear-gradient(135deg, #2ecc71, #27ae60)';
      ctaBtn.style.color = (state.user.plan_type === 'Trial Premium') ? '#000' : '#fff';
      ctaBtn.style.boxShadow = (state.user.plan_type === 'Trial Premium') ? '0 0 10px rgba(46, 197, 255, 0.3)' : '0 0 10px rgba(46, 204, 113, 0.3)';
      ctaBtn.style.animation = 'none';
      ctaBtn.onclick = () => {
        if (state.user.plan_type === 'Trial Premium') {
          if (window.showPricingModal) window.showPricingModal();
        } else {
          showToast("You are currently on the Premium Plan! Full access unlocked.", "info");
        }
      };
    } else {
      ctaBtn.style.display = 'block';
      ctaBtn.textContent = 'Upgrade to Premium';
      ctaBtn.style.background = '';
      ctaBtn.style.color = '';
      ctaBtn.style.boxShadow = '';
      ctaBtn.style.animation = '';
      ctaBtn.onclick = () => {
        if (window.showPricingModal) window.showPricingModal();
      };
    }
  }

  if (heroCtaBtn) {
    if (state.user && (state.user.plan_type === 'Premium' || state.user.plan_type === 'Trial Premium')) {
      heroCtaBtn.style.display = 'none';
    } else {
      heroCtaBtn.style.display = 'inline-block';
    }
  }
  
  // Render user initials profile button / dropdown
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
    
    // Bind toggle dropdown
    const profileBtn = document.getElementById('btn-header-profile');
    const dropdown = document.getElementById('header-profile-dropdown');
    if (profileBtn && dropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
    }
    
    // Bind profile
    const profileMenuBtn = document.getElementById('btn-dropdown-profile');
    if (profileMenuBtn) {
      profileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown) dropdown.classList.remove('active');
        showProfileModal();
      });
    }
    
    // Bind logout
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
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      if (errorEl) { errorEl.textContent = data.error || 'Login failed.'; errorEl.style.display = 'block'; }
      return;
    }
    
    state.user = data.user;
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    
    const authOverlay = document.getElementById('auth-modal-overlay');
    if (authOverlay) authOverlay.style.display = 'none';
    
    if (data.hasDetails) {
      updateUserProfileHeader();
      if (window.initTrialClock) window.initTrialClock();
      window.location.href = './aios_buisness.html';
      showToast("Logged in successfully!");
    } else {
      showOnboardingModal(data.user);
    }
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
  }
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
  
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) {
      if (errorEl) { errorEl.textContent = data.error || 'Signup failed.'; errorEl.style.display = 'block'; }
      return;
    }
    
    showOtpScreen();
    showToast("Account created successfully! An OTP has been sent to your email.");
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
  }
}

export function showOtpScreen() {
  const title = document.getElementById('auth-modal-title');
  const desc = document.getElementById('auth-modal-desc');
  if (title) title.textContent = 'Verify OTP';
  if (desc) desc.textContent = 'A 6-digit verification code has been sent to your email. Enter it below to complete registration.';
  
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
  
  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp })
    });
    
    const data = await res.json();
    if (!res.ok) {
      if (errorEl) { errorEl.textContent = data.error || 'Verification failed.'; errorEl.style.display = 'block'; }
      return;
    }
    
    if (successEl) { successEl.textContent = 'Email verified successfully!'; successEl.style.display = 'block'; }
    
    state.user = data.user;
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    
    setTimeout(() => {
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) authOverlay.style.display = 'none';
      
      if (codeEl) codeEl.value = '';
      if (errorEl) errorEl.style.display = 'none';
      if (successEl) successEl.style.display = 'none';
      hideOtpScreen();
      
      showOnboardingModal(data.user);
      showToast("Email verified successfully! Please complete your profile onboarding.");
    }, 1000);
    
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
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
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await res.json();
    if (!res.ok) {
      if (errorEl) { errorEl.textContent = data.error || 'Failed to request reset.'; errorEl.style.display = 'block'; }
      return;
    }
    
    if (successEl) {
      successEl.textContent = 'Recovery link sent successfully!';
      successEl.style.display = 'block';
    }
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
  }
}

export async function handleSupabaseSession(session, profile = null) {
  const user = session.user;
  try {
    let finalProfile = profile;
    if (!finalProfile) {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        finalProfile = await res.json();
      }
    }
      
    if (!finalProfile || !finalProfile.full_name || !finalProfile.date_of_birth || !finalProfile.gender || !finalProfile.profession) {
      showOnboardingModal(user);
    } else {
      const isTrial = finalProfile.plan_type === 'Trial Premium';
      const trialExpires = finalProfile.trial_expires_at;
      const diffMs = trialExpires ? new Date(trialExpires).getTime() - Date.now() : 0;
      const remainingDays = diffMs > 0 ? Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))) : 0;
      
      state.user = {
        id: user.id,
        name: finalProfile.full_name,
        email: user.email,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`,
        gender: finalProfile.gender,
        profession: finalProfile.profession,
        date_of_birth: finalProfile.date_of_birth,
        plan_type: finalProfile.plan_type || 'Basic',
        trial_started_at: finalProfile.trial_started_at || null,
        trial_expires_at: finalProfile.trial_expires_at || null,
        trial_days_remaining: remainingDays,
        token: session.access_token,
        is_coupon: false
      };
      
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
      state.analytics.emailSignIns = (state.analytics.emailSignIns || 0) + 1;
      
      hideAuthModals();
      updateUserProfileHeader();
      if (window.initTrialClock) window.initTrialClock();
      if (window.toggleBusinessSectionView) window.toggleBusinessSectionView();
      
      const trialUsed = finalProfile.trial_used || (finalProfile.trial_started_at ? true : false);
      const isBasicNow = finalProfile.plan_type === 'Basic' || !finalProfile.plan_type;
      
      if (trialUsed && isBasicNow) {
        showToast("⚠️ Your Premium Trial has ended. Premium features are now locked.", "warning");
        if (window.showPricingModal) window.showPricingModal(true);
      } else if (isBasicNow) {
        if (window.showPricingModal) window.showPricingModal(true);
      } else {
        if (window.regenerateActiveRoadmap) window.regenerateActiveRoadmap();
        showToast(`Welcome back, ${state.user.name}!`);
      }
    }
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
  }
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
  
  try {
    const res = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        full_name: fullName,
        date_of_birth: dob,
        gender: gender,
        profession: profession
      })
    });
    
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Profile update failed.');
    
    const overlay = document.getElementById('onboarding-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    
    const welcomeModal = document.getElementById('trial-welcome-modal-overlay');
    if (welcomeModal) welcomeModal.style.display = 'flex';
    
    if (result.profile) {
      const remainingDays = 3;
      state.user = {
        id: result.profile.id,
        name: result.profile.full_name,
        email: result.profile.email,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.profile.email}`,
        gender: result.profile.gender,
        profession: result.profile.profession,
        date_of_birth: result.profile.date_of_birth,
        plan_type: result.profile.plan_type || 'Trial Premium',
        trial_started_at: result.profile.trial_started_at || new Date().toISOString(),
        trial_expires_at: result.profile.trial_expires_at || new Date(Date.now() + 3*24*60*60*1000).toISOString(),
        trial_days_remaining: remainingDays,
        is_coupon: false
      };
      
      updateUserProfileHeader();
      if (window.initTrialClock) window.initTrialClock();
      if (window.toggleBusinessSectionView) window.toggleBusinessSectionView();
    }
    
    showToast("Profile completed successfully!");
  } catch (err) {
    console.error("Onboarding failed:", err.message);
    if (errorEl) {
      errorEl.textContent = 'Onboarding registration failed: ' + err.message;
      errorEl.style.display = 'block';
    }
  }
}

export function showProfileModal() {
  if (!state.user) return;
  
  document.getElementById('pf-email').value = state.user.email || '';
  document.getElementById('pf-fullname').value = state.user.name || '';
  document.getElementById('pf-dob').value = state.user.date_of_birth || '';
  document.getElementById('pf-gender').value = state.user.gender || '';
  document.getElementById('pf-profession').value = state.user.profession || '';
  document.getElementById('pf-plan-display').textContent = state.user.plan_type || 'Basic';
  
  const accountTypeEl = document.getElementById('pf-account-type-display');
  const accessStatusEl = document.getElementById('pf-access-status-display');
  const isCoupon = !!state.user.is_coupon;
  
  if (isCoupon) {
    if (accountTypeEl) accountTypeEl.textContent = state.user.account_type || 'Premium Coupon User';
    if (accessStatusEl) {
      accessStatusEl.innerHTML = 'Premium';
      accessStatusEl.className = 'badge-access premium-badge';
    }
  } else {
    if (accountTypeEl) accountTypeEl.textContent = 'Email User';
    if (accessStatusEl) {
      const isPremium = state.user.plan_type === 'Premium';
      const isTrial = state.user.plan_type === 'Trial Premium';
      if (isPremium) {
        accessStatusEl.innerHTML = 'Premium';
        accessStatusEl.className = 'badge-access premium-badge';
        accessStatusEl.style = '';
      } else if (isTrial) {
        accessStatusEl.innerHTML = '✨ Premium Trial';
        accessStatusEl.className = 'badge-access premium-badge';
        accessStatusEl.style = 'background: linear-gradient(135deg, #FFD54A 0%, #2EC5FF 100%) !important; color: #000 !important; font-weight: 700; border: none !important;';
      } else {
        accessStatusEl.innerHTML = 'Basic';
        accessStatusEl.className = 'badge-access basic-badge';
        accessStatusEl.style = '';
      }
    }
  }
  
  document.getElementById('pf-fullname').disabled = isCoupon;
  document.getElementById('pf-dob').disabled = isCoupon;
  document.getElementById('pf-gender').disabled = isCoupon;
  document.getElementById('pf-profession').disabled = isCoupon;
  
  const saveBtn = document.querySelector('#profile-edit-form button[type="submit"]');
  if (saveBtn) {
    saveBtn.style.display = isCoupon ? 'none' : 'block';
  }
  
  const upgradeBtn = document.getElementById('btn-pf-upgrade');
  if (upgradeBtn) {
    upgradeBtn.style.display = (isCoupon || state.user.plan_type === 'Premium') ? 'none' : 'block';
  }
  
  const overlay = document.getElementById('profile-modal-overlay');
  if (overlay) overlay.style.display = 'flex';
}

export async function handleProfileSave(e) {
  e.preventDefault();
  
  if (state.user && state.user.is_coupon) {
    showToast("Profile editing is disabled for coupon sessions.", "error");
    return;
  }
  
  const errorEl = document.getElementById('profile-error-msg');
  if (errorEl) errorEl.style.display = 'none';
  
  const fullName = document.getElementById('pf-fullname').value.trim();
  const dob = document.getElementById('pf-dob').value;
  const gender = document.getElementById('pf-gender').value;
  const profession = document.getElementById('pf-profession').value;
  
  if (!fullName) {
    if (errorEl) {
      errorEl.textContent = 'Name is required.';
      errorEl.style.display = 'block';
    }
    return;
  }
  
  if (state.user.is_coupon) {
    state.user.name = fullName;
    state.user.date_of_birth = dob;
    state.user.gender = gender;
    state.user.profession = profession;
    sessionStorage.setItem('aios_coupon_session', JSON.stringify(state.user));
    
    const overlay = document.getElementById('profile-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    updateUserProfileHeader();
    showToast("Temporary profile updated.");
    return;
  }
  
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient
      .from('user_profiles')
      .update({
        full_name: fullName,
        date_of_birth: dob || null,
        gender: gender || null,
        profession: profession || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', state.user.id);
      
    if (error) throw error;
    
    state.user.name = fullName;
    state.user.date_of_birth = dob;
    state.user.gender = gender;
    state.user.profession = profession;
    
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    
    const overlay = document.getElementById('profile-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    updateUserProfileHeader();
    showToast("Profile settings saved successfully!");
  } catch (err) {
    console.error("Profile update failed:", err.message);
    if (errorEl) {
      errorEl.textContent = 'Save failed: ' + err.message;
      errorEl.style.display = 'block';
    }
  }
}

export async function handleCouponLogin(couponCode) {
  const errorEl = document.getElementById('coupon-error-msg');
  if (errorEl) errorEl.style.display = 'none';
  
  const submitBtn = document.getElementById('btn-coupon-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
  }
  
  try {
    const res = await fetch('/api/auth/coupon-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ couponCode })
    });
    
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Invalid access code. Please try again.');
    }
    
    sessionStorage.setItem('aios_coupon_session', JSON.stringify(data.user));
    state.user = data.user;
    
    state.analytics.couponRedemptions++;
    state.analytics.roadmapUnlockRate = calculateUnlockRate();
    
    hideAuthModals();
    updateUserProfileHeader();
    if (window.toggleBusinessSectionView) window.toggleBusinessSectionView();
    if (window.AdManager) window.AdManager.updateAdVisibility();
    if (window.regenerateActiveRoadmap) window.regenerateActiveRoadmap();
    
    showToast("Coupon redeemed successfully! Premium access unlocked.");
  } catch (err) {
    console.error("Coupon redemption failed:", err.message);
    if (errorEl) {
      errorEl.textContent = 'Invalid access code. Please try again.';
      errorEl.style.display = 'block';
    } else {
      showToast('Invalid access code. Please try again.', 'error');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Redeem Access Code';
    }
  }
}

export async function logoutUser() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {}
  sessionStorage.removeItem('aios_coupon_session');
  localStorage.removeItem('aios_user_profile');
  state.user = null;
  
  hideAuthModals();
  updateUserProfileHeader();
  if (window.toggleBusinessSectionView) window.toggleBusinessSectionView();
  if (window.AdManager) window.AdManager.updateAdVisibility();
  
  if (state.goalText && state.goalText !== "Exploring AI") {
    state.generatedJSONPrompt = '';
    const outputWrapper = document.getElementById('premium-json-output-wrapper');
    if (outputWrapper) outputWrapper.style.display = 'none';
  }
  if (window.regenerateActiveRoadmap) window.regenerateActiveRoadmap();
  showToast("Signed out successfully.");
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
  const urlParams = new URLSearchParams(window.location.search);
  
  // Handle Reset Password action
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

  // Bind Save Password inside reset overlay
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
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json();
        if (!res.ok) {
          if (errorEl) { errorEl.textContent = data.error || 'Reset failed.'; errorEl.style.display = 'block'; }
          return;
        }
        
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
        if (errorEl) { errorEl.textContent = 'Connection failed.'; errorEl.style.display = 'block'; }
      }
    });
  }

  const resetCloseBtn = document.getElementById('reset-password-modal-close-btn');
  if (resetCloseBtn) {
    resetCloseBtn.addEventListener('click', () => {
      const resetOverlay = document.getElementById('reset-password-modal-overlay');
      if (resetOverlay) resetOverlay.style.display = 'none';
    });
  }

  // Session synchronization bypassed for static frontend mode
  console.log("[Static Mode] Session synchronization bypassed. Default Premium User active.");

  // Direct default premium user state session initialization
  
  updateUserProfileHeader();
  if (window.toggleBusinessSectionView) window.toggleBusinessSectionView();
  if (window.initBusinessSimulators) window.initBusinessSimulators();
  
  // Initialize Supabase Client dynamically
  try {
    await initSupabase();
  } catch (e) {}
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
