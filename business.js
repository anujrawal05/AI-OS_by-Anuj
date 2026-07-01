// --- Stateless CSRF Fetch Interceptor ---
(function() {
  const originalFetch = window.fetch;
  window.fetch = function (url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      options.headers = options.headers || {};
      const match = document.cookie.match(new RegExp('(^| )aios_csrf=([^;]+)'));
      const token = match ? match[2] : '';
      if (token) {
        if (options.headers instanceof Headers) {
          options.headers.set('X-CSRF-Token', token);
        } else {
          options.headers['X-CSRF-Token'] = token;
        }
      }
    }
    return originalFetch(url, options);
  };
})();

// --- Client-side Session Cache Helper ---
const ClientCache = {
  get(key) {
    try {
      const data = sessionStorage.getItem(`aios_cache_${key}`);
      if (!data) return null;
      const { value, expiresAt } = JSON.parse(data);
      if (Date.now() > expiresAt) {
        sessionStorage.removeItem(`aios_cache_${key}`);
        return null;
      }
      return value;
    } catch (e) {
      return null;
    }
  },
  set(key, value, ttlMs = 5 * 60 * 1000) {
    try {
      const data = JSON.stringify({ value, expiresAt: Date.now() + ttlMs });
      sessionStorage.setItem(`aios_cache_${key}`, data);
    } catch (e) {}
  }
};

// --- Client-side Anonymized Analytics ---
const Analytics = {
  logEvent(eventName, eventDetails = {}) {
    console.log(`[Analytics Event] ${eventName}`, eventDetails);
  }
};

// Standalone AI-OS Business Platform Logic Script
// Powered by A.R. Labs

const state = {
  user: null,
  onboardingPricing: false,
  activeWorkspace: 'learn', // 'learn', 'build', 'grow'
  analytics: {
    loginAttempts: 0,
    couponRedemptions: 0,
    roadmapUnlockRate: 0
  }
};

let supabaseClient = null;

// Initialize Supabase Client
async function initSupabase() {
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
      console.log("Supabase client initialized successfully on Business page.");
      
      // Listen to auth state transitions
      if (supabaseClient) {
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
          if (state.user?.provider === 'Kinde Auth') return;
          console.log("Supabase Auth Event (Business):", event);
          if (session) {
            await handleSupabaseSession(session);
          } else {
            if (!sessionStorage.getItem('aios_coupon_session')) {
              state.user = null;
              updateUserProfileHeader();
              toggleBusinessSectionView();
            }
          }
        });
      }
    } else {
      console.warn("Supabase credentials missing from config API.");
    }
  } catch (err) {
    console.error("Failed to initialize Supabase:", err);
  }
}

function isUserAuthenticated() {
  const couponSession = sessionStorage.getItem('aios_coupon_session');
  if (couponSession) {
    try {
      const user = JSON.parse(couponSession);
      if (user && user.is_coupon) return true;
    } catch (e) {}
  }
  if (state.user && !state.user.is_coupon) {
    return true;
  }
  return false;
}

function updateUserProfileHeader() {
  const container = document.getElementById('user-profile-header');
  if (!container) return;
  
  const ctaBtn = document.getElementById('btn-upgrade-premium-cta');
  const heroCtaBtn = document.getElementById('btn-hero-upgrade-cta');
  
  const handleUpgradeState = (btn) => {
    if (!btn) return;
    if (state.user && (state.user.plan_type === 'Premium' || state.user.plan_type === 'Trial Premium')) {
      btn.style.display = 'block';
      btn.textContent = (state.user.plan_type === 'Trial Premium') ? 'Trial Active' : 'Premium Active';
      btn.style.background = (state.user.plan_type === 'Trial Premium') ? 'linear-gradient(135deg, #FFD54A, #2EC5FF)' : 'linear-gradient(135deg, #00D084 0%, #2EC5FF 100%)';
      btn.style.color = (state.user.plan_type === 'Trial Premium') ? '#000' : '#000';
      btn.style.boxShadow = (state.user.plan_type === 'Trial Premium') ? '0 0 10px rgba(46, 197, 255, 0.3)' : '0 0 15px rgba(0, 208, 132, 0.4)';
      btn.onclick = () => {
        if (state.user.plan_type === 'Trial Premium') {
          showPricingModal();
        } else {
          showToast("Premium Plan active! All enterprise workspaces unlocked.", "info");
        }
      };
    } else {
      btn.style.display = 'block';
      btn.textContent = 'Upgrade to Premium';
      btn.style.background = 'linear-gradient(135deg, #FFD54A 0%, #00D084 100%)';
      btn.style.boxShadow = '0 0 15px rgba(255, 213, 74, 0.35)';
      btn.onclick = () => showPricingModal(false);
    }
  };

  handleUpgradeState(ctaBtn);
  handleUpgradeState(heroCtaBtn);
  
  if (isUserAuthenticated()) {
    const nameToDisplay = state.user.name || 'Premium User';
    const avatarToDisplay = state.user.picture || 'https://api.dicebear.com/7.x/bottts/svg';
    const statusText = state.user.plan_type || 'Basic';
    
    let statusClass = '';
    let statusStyle = '';
    let statusDisplay = statusText.toUpperCase();
    
    if (statusText === 'Premium') {
      statusClass = 'premium';
    } else if (statusText === 'Trial Premium' || statusText === 'Trial') {
      statusClass = 'premium-trial';
      statusStyle = 'background: linear-gradient(135deg, #FFD54A 0%, #2EC5FF 100%) !important; color: #000 !important; font-weight: 700;';
      statusDisplay = '✨ PREMIUM TRIAL';
    }

    container.innerHTML = `
      <div style="position: relative; display: flex; align-items: center; gap: 12px;">
        <button id="btn-header-profile" class="profile-btn">
          <img src="${avatarToDisplay}" class="profile-avatar" alt="Avatar">
          <span>${nameToDisplay.split(' ')[0]}</span>
        </button>
        <button id="btn-header-logout" class="profile-btn" style="border-radius: 20px; background: rgba(255, 90, 90, 0.12); border: 1px solid rgba(255, 90, 90, 0.3); color: #ff5a5a; font-weight: 700; padding: 8px 16px; cursor: pointer; transition: all 0.2s; font-family: var(--font-mono); font-size: 0.8rem;" onmouseover="this.style.background='rgba(255, 90, 90, 0.2)'" onmouseout="this.style.background='rgba(255, 90, 90, 0.12)'">
          🚪 &nbsp; Logout
        </button>
        <div id="header-profile-dropdown" class="profile-dropdown">
          <div class="profile-dropdown-name">${nameToDisplay}</div>
          <div class="profile-dropdown-email">${state.user.email || ''}</div>
          <div class="profile-dropdown-status ${statusClass}" style="${statusStyle}">${statusDisplay}</div>
          <button id="btn-dropdown-profile" class="workspace-dropdown-item" style="width: 100%; border-radius: 8px;">
            👤 &nbsp; My Profile
          </button>
          <a href="https://arproduction050-byte.github.io/A.R.-Publications/" target="_blank" rel="noopener" style="display:flex; align-items:center; gap:8px; padding:10px; color:rgba(255,255,255,0.7); font-size:0.82rem; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
            📖 <span>A.R. Publications</span>
          </a>
          <a href="https://anujrawal05.github.io/apps-by-anujrawal/" target="_blank" rel="noopener" style="display:flex; align-items:center; gap:8px; padding:10px; color:rgba(255,255,255,0.7); font-size:0.82rem; text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.7)'">
            📱 <span>Apps by Anuj</span>
          </a>
          <button id="btn-dropdown-logout" class="profile-dropdown-logout" style="margin-top: 10px;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('btn-header-profile').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('header-profile-dropdown').classList.toggle('active');
    });
    
    document.getElementById('btn-dropdown-profile').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('header-profile-dropdown').classList.remove('active');
      showProfileModal();
    });
    
    document.getElementById('btn-dropdown-logout').addEventListener('click', (e) => {
      e.stopPropagation();
      logoutUser();
    });
    
    // Bind direct header logout button
    const directLogoutBtn = document.getElementById('btn-header-logout');
    if (directLogoutBtn) {
      directLogoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        logoutUser();
      });
    }
  } else {
    container.innerHTML = `
      <button id="btn-header-signin" class="profile-btn">
        🔑 &nbsp; Sign In
      </button>
    `;
    
    document.getElementById('btn-header-signin').addEventListener('click', () => {
      document.getElementById('auth-modal-overlay').style.display = 'flex';
    });
  }
}

async function handleGoogleLogin() {
  if (!supabaseClient) {
    showToast("Supabase configuration is not loaded yet.", "error");
    return;
  }
  try {
    state.analytics.loginAttempts++;
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/aios_buisness.html'
      }
    });
    if (error) throw error;
  } catch (err) {
    showToast("Google sign in failed: " + err.message, "error");
  }
}

async function handleSupabaseSession(session, profile = null) {
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
        picture: user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${finalProfile.full_name}`,
        date_of_birth: finalProfile.date_of_birth,
        gender: finalProfile.gender,
        profession: finalProfile.profession,
        plan_type: finalProfile.plan_type || 'Basic',
        trial_started_at: finalProfile.trial_started_at || null,
        trial_expires_at: finalProfile.trial_expires_at || null,
        trial_days_remaining: remainingDays,
        token: session.access_token
      };
      
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
      hideAuthModals();
      updateUserProfileHeader();
      initTrialClock();
      toggleBusinessSectionView();
      
      const trialUsed = finalProfile.trial_used || (finalProfile.trial_started_at ? true : false);
      const isBasicNow = finalProfile.plan_type === 'Basic' || !finalProfile.plan_type;
      
      if (trialUsed && isBasicNow) {
        showToast("⚠️ Your Premium Trial has ended. Premium features are now locked.", "warning");
        showPricingModal(true);
      } else if (isBasicNow) {
        showPricingModal(true);
      }
    }
  } catch (err) {
    console.error("Session sync failed:", err.message);
  }
}

let onboardingUser = null;
function showOnboardingModal(user) {
  onboardingUser = user;
  document.getElementById('ob-fullname').value = user.user_metadata.full_name || '';
  document.getElementById('onboarding-modal-overlay').style.display = 'flex';
}

async function handleOnboardingSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById('onboarding-error-msg');
  if (errorEl) errorEl.style.display = 'none';
  
  const fullName = document.getElementById('ob-fullname').value.trim();
  const dob = document.getElementById('ob-dob').value;
  const gender = document.getElementById('ob-gender').value;
  const profession = document.getElementById('ob-profession').value;
  const cbTerms = document.getElementById('ob-cb-terms').checked;
  const cbPrivacy = document.getElementById('ob-cb-privacy').checked;
  
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
    
    document.getElementById('onboarding-modal-overlay').style.display = 'none';
    
    // Trigger Trial Welcome Modal
    const welcomeModal = document.getElementById('trial-welcome-modal-overlay');
    if (welcomeModal) welcomeModal.style.display = 'flex';
    
    // Sync UI with updated profile values
    if (result.profile) {
      const remainingDays = 3; // New trials start with 3 days
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
      initTrialClock();
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

/* ─── Trial Clock ───────────────────────────────────────────────────── */
function isTrialActive() {
  return state.user && (state.user.plan_type === 'Trial Premium' || state.user.plan_type === 'Trial') && state.user.trial_days_remaining > 0;
}

function getTrialRemainingTime() {
  if (!state.user || !state.user.trial_expires_at) return null;
  const now = Date.now();
  const expires = new Date(state.user.trial_expires_at).getTime();
  const diffMs = expires - now;
  if (diffMs <= 0) return null;
  
  const totalHours = diffMs / (1000 * 60 * 60);
  if (totalHours < 24) {
    const hours = Math.ceil(totalHours);
    return { isLastDay: true, text: `${hours} hour${hours !== 1 ? 's' : ''} remaining` };
  } else {
    const days = Math.ceil(totalHours / 24);
    return { isLastDay: false, text: `${days} day${days !== 1 ? 's' : ''} remaining` };
  }
}

function initTrialClock() {
  const banner = document.getElementById('trial-countdown-banner');
  if (!banner) return;
  if (isTrialActive()) {
    const timeRemaining = getTrialRemainingTime();
    let text = "";
    if (timeRemaining) {
      if (timeRemaining.isLastDay) {
        text = `⚠️ <strong>Less than 24 hours remaining</strong> (${timeRemaining.text})! Recommend upgrading before trial expires.`;
      } else {
        text = `🎉 You're currently using your FREE 3-Day Premium Trial (${timeRemaining.text} left).`;
      }
    } else {
      text = `🎉 You're currently using your FREE 3-Day Premium Trial.`;
    }
    
    banner.innerHTML = `<span>${text}</span> <button onclick="showPricingModal();" style="margin-left: 12px; background: linear-gradient(135deg, #00D084, #2EC5FF); border: none; border-radius: 4px; padding: 4px 10px; color: #000; font-family: monospace; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: transform 0.2s;">Upgrade Now</button>`;
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

function closeTrialWelcomeModal() {
  const welcomeModal = document.getElementById('trial-welcome-modal-overlay');
  if (welcomeModal) welcomeModal.style.display = 'none';
  location.reload();
}

function showPricingModal(isMandatory = false) {
  const overlay = document.getElementById('pricing-modal-overlay');
  if (overlay) overlay.style.display = 'flex';
  const closeBtn = document.getElementById('pricing-modal-close-btn');
  if (closeBtn) {
    closeBtn.style.display = isMandatory ? 'none' : 'block';
  }
  state.onboardingPricing = isMandatory;
}

async function handleChooseFreePlan() {
  if (!state.user) return;
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ plan_type: 'Basic', updated_at: new Date().toISOString() })
      .eq('id', state.user.id);
      
    if (error) throw error;
    
    state.user.plan_type = 'Basic';
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    
    document.getElementById('pricing-modal-overlay').style.display = 'none';
    updateUserProfileHeader();
    toggleBusinessSectionView();
    showToast("Free Plan activated successfully!");
  } catch (err) {
    showToast("Failed to activate Free Plan: " + err.message, "error");
  }
}

async function handlePremiumUpgrade(planName = 'Premium Monthly', amount = 99) {
  if (!state.user) {
    showToast("Please sign in or use a coupon code to upgrade.", "warning");
    document.getElementById('pricing-modal-overlay').style.display = 'none';
    document.getElementById('auth-modal-overlay').style.display = 'flex';
    return;
  }
  
  if (state.user.plan_type === 'Premium') {
    showToast("You are already on the Premium Plan!", "info");
    document.getElementById('pricing-modal-overlay').style.display = 'none';
    return;
  }
  
  // Load Razorpay config
  let razorpayKey = 'rzp_test_review2026';
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (config.razorpayKeyId) {
      razorpayKey = config.razorpayKeyId;
    }
  } catch (e) {
    console.error("Failed to fetch Razorpay config:", e);
  }

  // Create secure backend order first
  let backendOrderId = null;
  try {
    const orderRes = await fetch('/api/auth/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, planName })
    });
    if (orderRes.ok) {
      const orderData = await orderRes.json();
      if (orderData.success) {
        backendOrderId = orderData.orderId;
      }
    }
  } catch (err) {
    console.error("Failed to create Razorpay order on backend:", err);
  }

  const options = {
    key: razorpayKey,
    amount: amount * 100,
    currency: 'INR',
    order_id: backendOrderId,
    name: 'A.R. Labs',
    description: `AI-OS ${planName} Upgrade`,
    image: 'https://anujrawal05.github.io/AI-OS_by-Anuj/aiso_logo.png',
    handler: async function (response) {
      showToast("Payment Successful! Verifying upgrade...", "info");
      await verifyRazorpayPayment(response, planName);
    },
    prefill: {
      name: state.user.name || 'Test User',
      email: state.user.email || 'user@test.com'
    },
    theme: {
      color: '#00D084'
    },
    modal: {
      ondismiss: function () {
        showToast("Payment cancelled.", "warning");
      }
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    showToast("Failed to initialize Razorpay checkout widget: " + err.message, "error");
  }
}

async function verifyRazorpayPayment(response, planName) {
  try {
    const res = await fetch('/api/auth/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.user.token}`
      },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        planName: planName
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Payment verification failed');

    state.user.plan_type = 'Premium';
    
    if (state.user.is_coupon) {
      const payload = {
        email: state.user.email,
        name: state.user.name,
        plan_type: "Premium",
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000,
        signature: 'AIOS-AUTHENTICATED-COUPON'
      };
      state.user.token = btoa(JSON.stringify(payload));
      sessionStorage.setItem('aios_coupon_session', JSON.stringify(state.user));
    } else {
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    }

    document.getElementById('pricing-modal-overlay').style.display = 'none';
    updateUserProfileHeader();
    toggleBusinessSectionView();
    showToast(`Premium features (${planName}) unlocked successfully!`);
  } catch (err) {
    showToast("Upgrade profile update failed: " + err.message, "error");
  }
}

function showProfileModal() {
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
      accessStatusEl.className = 'profile-dropdown-status premium';
    }
  } else {
    if (accountTypeEl) accountTypeEl.textContent = 'Email User';
    if (accessStatusEl) {
      const isPremium = state.user.plan_type === 'Premium';
      const isTrial = state.user.plan_type === 'Trial Premium';
      if (isPremium) {
        accessStatusEl.innerHTML = 'Premium';
        accessStatusEl.className = 'profile-dropdown-status premium';
        accessStatusEl.style = '';
      } else if (isTrial) {
        accessStatusEl.innerHTML = '✨ Premium Trial';
        accessStatusEl.className = 'profile-dropdown-status premium-trial';
        accessStatusEl.style = 'background: linear-gradient(135deg, #FFD54A 0%, #2EC5FF 100%) !important; color: #000 !important; font-weight: 700; border: none !important;';
      } else {
        accessStatusEl.innerHTML = 'Basic';
        accessStatusEl.className = 'profile-dropdown-status';
        accessStatusEl.style = '';
      }
    }
  }
  
  document.getElementById('pf-fullname').disabled = isCoupon;
  document.getElementById('pf-dob').disabled = isCoupon;
  document.getElementById('pf-gender').disabled = isCoupon;
  document.getElementById('pf-profession').disabled = isCoupon;
  
  const saveBtn = document.querySelector('#profile-edit-form button[type="submit"]');
  if (saveBtn) saveBtn.style.display = isCoupon ? 'none' : 'block';
  
  const upgradeBtn = document.getElementById('btn-pf-upgrade');
  if (upgradeBtn) upgradeBtn.style.display = (isCoupon || state.user.plan_type === 'Premium') ? 'none' : 'block';
  
  document.getElementById('profile-modal-overlay').style.display = 'flex';
}

async function handleProfileSave(e) {
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
  
  try {
    const { error } = await supabase
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
    document.getElementById('profile-modal-overlay').style.display = 'none';
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

async function handleCouponLogin(couponCode) {
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
    if (!res.ok || data.error) throw new Error(data.error || 'Invalid access code. Please try again.');
    
    sessionStorage.setItem('aios_coupon_session', JSON.stringify(data.user));
    state.user = data.user;
    
    hideAuthModals();
    updateUserProfileHeader();
    toggleBusinessSectionView();
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

async function logoutUser() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {}
  sessionStorage.removeItem('aios_coupon_session');
  localStorage.removeItem('aios_user_profile');
  state.user = null;
  
  hideAuthModals();
  updateUserProfileHeader();
  toggleBusinessSectionView();
  showToast("Signed out successfully.");
}

function hideAuthModals() {
  document.getElementById('auth-modal-overlay').style.display = 'none';
  document.getElementById('coupon-modal-overlay').style.display = 'none';
  document.getElementById('pricing-modal-overlay').style.display = 'none';
  document.getElementById('profile-modal-overlay').style.display = 'none';
}

function toggleBusinessSectionView() {
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

// REDESIGNED TAB SWITCHER FUNCTION
function switchBusinessWorkspace(workspaceName) {
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

// Live metrics loader from server proxy API
function updateConversionFunnel(modelData, budgetValue) {
  const trafficEl = document.getElementById('funnel-traffic');
  const qualifiedEl = document.getElementById('funnel-qualified');
  const conversionsEl = document.getElementById('funnel-conversions');
  const growthEl = document.getElementById('funnel-growth');

  const barTraffic = document.getElementById('funnel-bar-traffic');
  const barQualified = document.getElementById('funnel-bar-qualified');
  const barConversions = document.getElementById('funnel-bar-conversions');
  const barGrowth = document.getElementById('funnel-bar-growth');

  const budget = parseFloat(budgetValue) || 0;
  
  let traffic = 1500;
  if (budget > 0) {
    if (budget <= 5000) {
      traffic = 6200;
    } else {
      traffic = 31000;
    }
  }

  let convRate = 0.025;
  if (modelData) {
    const titleLower = modelData.title.toLowerCase();
    if (titleLower.includes('micro-saas')) {
      convRate = 0.018;
    } else if (titleLower.includes('agency')) {
      convRate = 0.032;
    } else if (titleLower.includes('animation') || titleLower.includes('compiler')) {
      convRate = 0.012;
    }
  }

  const qualified = Math.round(traffic * 0.22);
  const conversions = Math.round(traffic * convRate);
  
  let growthPct = "+15%";
  if (budget > 0) {
    if (budget <= 5000) {
      growthPct = "+60%";
    } else {
      growthPct = "+180%";
    }
  }

  if (trafficEl) trafficEl.textContent = traffic.toLocaleString('en-IN');
  if (qualifiedEl) qualifiedEl.textContent = qualified.toLocaleString('en-IN');
  if (conversionsEl) conversionsEl.textContent = `${(convRate * 100).toFixed(1)}% (${conversions.toLocaleString('en-IN')})`;
  if (growthEl) growthEl.textContent = growthPct;

  if (barTraffic) barTraffic.style.setProperty('--w', '100%');
  if (barQualified) barQualified.style.setProperty('--w', '45%');
  if (barConversions) barConversions.style.setProperty('--w', `${Math.min(100, Math.max(10, convRate * 10 * 100))}%`);
  if (barGrowth) {
    barGrowth.style.setProperty('--w', budget === 0 ? '20%' : (budget <= 5000 ? '55%' : '90%'));
  }
}

// Live market indices ticker data loader
async function loadLiveDashboardMetrics() {
  const loadingEl = document.getElementById('market-data-loading');
  const errorEl = document.getElementById('market-data-error');
  const contentEl = document.getElementById('market-data-content');
  const tbody = document.getElementById('market-data-tbody');
  
  if (!tbody) return;

  try {
    const res = await fetch('/api/market-data');
    if (!res.ok) throw new Error("API call failed");
    const data = await res.json();
    
    tbody.innerHTML = '';
    
    const tickerMappings = {
      'NIFTY': 'NIFTY 50 (NSE)',
      'SENSEX': 'SENSEX (BSE)',
      'NASDAQ': 'NASDAQ Composite',
      'SP500': 'S&P 500 Index',
      'BTC': 'Bitcoin (BTC/USD)',
      'ETH': 'Ethereum (ETH/USD)',
      'Gold': 'Gold COMEX (USD)',
      'USDINR': 'USD / INR Forex'
    };

    Object.entries(data).forEach(([key, val]) => {
      if (!val) return;
      if (!tickerMappings[key]) return;
      const isUp = val.change >= 0;
      const changeClass = isUp ? 'up' : 'down';
      const changeArrow = isUp ? '▲' : '▼';
      const changeSign = isUp ? '+' : '';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-weight: 600; font-family: var(--font-mono); font-size: 0.82rem;">${tickerMappings[key] || key}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: #fff;">${key === 'USDINR' ? '₹' : (key === 'NIFTY' || key === 'SENSEX' ? '₹' : '$')}${val.price.toLocaleString('en-IN')}</td>
        <td class="change ${changeClass}" style="font-weight: 700; font-family: var(--font-mono); font-size: 0.8rem; color: ${isUp ? 'var(--bus-primary)' : '#ff4a4a'};">
          ${changeArrow} ${changeSign}${val.change}%
        </td>
      `;
      tbody.appendChild(row);
    });

    const valTbody = document.getElementById('valuations-tbody');
    if (valTbody && data._valuations) {
      valTbody.innerHTML = '';
      const focusMappings = {
        'NVDA': 'GPU & Infrastructure',
        'MSFT': 'Copilot & Azure Cloud',
        'AAPL': 'On-Device Intelligence',
        'GOOGL': 'Gemini Ecosystem'
      };
      const nameMappings = {
        'NVDA': 'NVIDIA (NVDA)',
        'MSFT': 'Microsoft (MSFT)',
        'AAPL': 'Apple (AAPL)',
        'GOOGL': 'Alphabet (GOOGL)'
      };
      Object.entries(data._valuations).forEach(([sym, val]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="font-weight: 600;">${nameMappings[sym] || sym}</td>
          <td style="font-family: var(--font-mono);">₹${val.capInr}T ($${val.capUsd}T)</td>
          <td><span class="badge-tag" style="background: var(--bus-border); color: var(--bus-primary); border: 1px solid var(--bus-primary); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-family: var(--font-mono);">${focusMappings[sym] || 'AI Platform'}</span></td>
        `;
        valTbody.appendChild(row);
      });
    }

    const calList = document.getElementById('calendar-list');
    if (calList && data._calendar) {
      calList.innerHTML = '';
      data._calendar.forEach(evt => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="cal-date-badge" style="background: var(--bus-primary); color: #000; font-weight: 700; font-family: var(--font-mono); font-size: 0.72rem; padding: 4px 8px; border-radius: 4px; min-width: 52px; text-align: center; text-transform: uppercase; line-height: 1.2;">${evt.date}</div>
          <div class="cal-details" style="display: flex; flex-direction: column; gap: 2px; margin-left: 10px;">
            <strong style="color: #fff; font-size: 0.85rem; font-weight: 600;">${evt.title}</strong>
            <span style="color: var(--bus-text-secondary); font-size: 0.75rem;">${evt.desc}</span>
          </div>
        `;
        calList.appendChild(li);
      });
    }

    const trendsCont = document.getElementById('trends-container');
    if (trendsCont && data._trends) {
      trendsCont.innerHTML = '';
      data._trends.forEach((trd, index) => {
        const div = document.createElement('div');
        div.className = 'trend-item';
        if (index > 0) {
          div.style.borderTop = '1px solid var(--bus-border)';
          div.style.paddingTop = '12px';
          div.style.marginTop = '12px';
        }
        div.innerHTML = `
          <div class="trend-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #fff; font-size: 0.85rem; font-weight: 600;">${trd.title}</strong>
            <span class="trend-growth" style="color: var(--bus-primary); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700;">${trd.growth}</span>
          </div>
          <p class="trend-desc" style="color: var(--bus-text-secondary); font-size: 0.78rem; line-height: 1.4; margin: 0;">${trd.desc}</p>
        `;
        trendsCont.appendChild(div);
      });
    }

    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';

  } catch (err) {
    console.error("Dashboard live market data load failed:", err.message);
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
  }
}

// Live news feed loader from server proxy API
async function loadLiveBusinessNews() {
  const loadingEl = document.getElementById('news-data-loading');
  const errorEl = document.getElementById('news-data-error');
  const contentEl = document.getElementById('news-data-content');
  
  if (!contentEl) return;

  try {
    const res = await fetch('/api/business-news');
    if (!res.ok) throw new Error("API call failed");
    const articles = await res.json();
    
    contentEl.innerHTML = '';
    
    articles.forEach(art => {
      const item = document.createElement('a');
      item.href = art.link;
      item.target = '_blank';
      item.rel = 'noopener';
      item.className = 'news-item';
      item.style.display = 'block';
      item.style.textDecoration = 'none';
      item.style.marginBottom = '12px';
      
      const dateStr = art.pubDate ? new Date(art.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'RECENT';
      
      item.innerHTML = `
        <div class="news-item-title" style="color: #fff; font-weight: 600; font-size: 0.85rem; line-height: 1.4; margin-bottom: 4px; transition: color 0.2s;">
          ${art.title}
        </div>
        <div class="news-item-meta" style="font-size: 0.72rem; color: var(--bus-text-muted); font-family: var(--font-mono); display: flex; gap: 8px;">
          <span>${dateStr}</span>
          <span>•</span>
          <span style="color: var(--bus-primary); font-weight: 600;">${art.source}</span>
        </div>
      `;
      
      item.addEventListener('mouseenter', () => {
        item.querySelector('.news-item-title').style.color = 'var(--bus-primary)';
      });
      item.addEventListener('mouseleave', () => {
        item.querySelector('.news-item-title').style.color = '#fff';
      });

      contentEl.appendChild(item);
    });

    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';

  } catch (err) {
    console.error("Dashboard news data load failed:", err.message);
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
  }
}

// Concept Quiz Verifier
function verifyQuizAnswer(btnElement, radioGroupName, expectedValue, explanationText) {
  const container = btnElement.closest('.learn-quiz-box');
  const feedbackBox = container.querySelector('.quiz-feedback-box');
  const selectedRadio = container.querySelector(`input[name="${radioGroupName}"]:checked`);
  
  if (!selectedRadio) {
    showToast("Please select an option before submitting.", "warning");
    return;
  }
  
  feedbackBox.style.display = 'block';
  btnElement.disabled = true;
  
  container.querySelectorAll(`input[name="${radioGroupName}"]`).forEach(input => {
    input.disabled = true;
  });

  if (selectedRadio.value === expectedValue) {
    feedbackBox.style.background = 'rgba(0, 208, 132, 0.1)';
    feedbackBox.style.border = '1px solid rgba(0, 208, 132, 0.3)';
    feedbackBox.style.color = 'var(--bus-primary)';
    feedbackBox.innerHTML = `<strong>✅ Correct!</strong> ${explanationText}`;
    showToast("Concept check unlocked successfully!");
  } else {
    feedbackBox.style.background = 'rgba(255, 74, 74, 0.1)';
    feedbackBox.style.border = '1px solid rgba(255, 74, 74, 0.3)';
    feedbackBox.style.color = '#ff4a4a';
    feedbackBox.innerHTML = `<strong>❌ Incorrect.</strong> ${explanationText}`;
    showToast("Incorrect answer.", "error");
  }
}

// Downloadable templates client exporter
function downloadTemplate(templateName) {
  const templates = {
    'business_model_canvas': [
      "==================================================",
      "AI-OS BUSINESS PLATFORM - BUSINESS MODEL CANVAS",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "1. VALUE PROPOSITIONS:",
      "   - What value do we deliver to the customer?",
      "   - Which customer problems are we helping to solve?",
      "",
      "2. CUSTOMER SEGMENTS:",
      "   - For whom are we creating value?",
      "   - Who are our most important customers?",
      "",
      "3. CHANNELS:",
      "   - Through which channels do our customer segments want to be reached?",
      "",
      "4. CUSTOMER RELATIONSHIPS:",
      "   - How do we get, keep, and grow customers?",
      "",
      "5. REVENUE STREAMS:",
      "   - For what value are our customers really willing to pay?",
      "   - How do they pay (subscriptions, commissions, transactional)?",
      "",
      "6. KEY RESOURCES:",
      "   - What key assets are required to deliver our value proposition?",
      "",
      "7. KEY ACTIVITIES:",
      "   - What key operations are required to deliver value?",
      "",
      "8. KEY PARTNERS:",
      "   - Who are our key partners and suppliers?",
      "",
      "9. COST STRUCTURE:",
      "   - What are the most important costs inherent in our business model?",
      "   - What are the COGS and OPEX projections?",
      ""
    ].join('\n'),
    
    'marketing_distribution': [
      "==================================================",
      "AI-OS BUSINESS HUB - MARKETING DISTRIBUTION SHEET",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "CHANNEL LIST & OUTREACH METRIC MATRIX:",
      "",
      "1. COLD OUTBOUND OUTREACH (LinkedIn/Email):",
      "   - Daily Volume Goal: 40 highly targeted decision makers",
      "   - Script Outline: [Observation] + [Friction identified] + [Helpful outcome proof] + [Call to Action]",
      "   - Target Conversion Rate: 10% demo booking rate",
      "",
      "2. ORGANIC CONTENT ENGINE (Short Videos / Reels):",
      "   - Weekly Frequency: 3 videos detailing practical automations",
      "   - Target Platform: YouTube Shorts, TikTok, Instagram Reels, LinkedIn Video",
      "",
      "3. PROGRAMMATIC SEO PIPELINE:",
      "   - Niche Keyword Structure: '[Industry] Automation Service in [City Name]'",
      "   - Target Index Volume: 100 pages generated from template directories",
      "",
      "OUTREACH SCHEDULE TIMELINE:",
      "   - Week 1: Lead list creation (scrape directories for 200 qualified companies)",
      "   - Week 2: Send Loom-based video audits to top 40 prospects",
      "   - Week 3: Initiate secondary follow-up loops on positive replies",
      "   - Week 4: Analyze analytics and optimize script variables"
    ].join('\n'),
    
    'onboarding_automation': [
      "==================================================",
      "AI-OS BUSINESS PLATFORM - ONBOARDING WORKFLOW",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "Intake Flow Automations Trigger Mappings (Make.com/Zapier):",
      "",
      "[Trigger event: Stripe/Razorpay Checkout Captured successfully]",
      "  |",
      "  +--> 1. CREATE client row in Supabase database",
      "  |",
      "  +--> 2. GENERATE Google Drive folder labeled '[Client Name] Workspace'",
      "  |",
      "  +--> 3. RENDER custom Service Agreement contract from template",
      "  |      (Fill variables: client_name, date, setup_price, monthly_retainer)",
      "  |",
      "  +--> 4. SEND automated docu-sign proposal link via email",
      "  |",
      "  +--> 5. ALERT team Slack/Discord room: 'New client [Client Name] active!'"
    ].join('\n'),
    
    'pl_ledger': [
      "==================================================",
      "AI-OS BUSINESS HUB - P&L STATEMENT LEDGER SHEET",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "MONTHLY OPERATING SUMMARY:",
      "",
      "REVENUE:",
      "  - Retainer Services: ____________________ (INR/USD)",
      "  - Transaction Fees: ____________________ (INR/USD)",
      "  - Product Licenses: ____________________ (INR/USD)",
      "  - TOTAL REVENUE: ____________________ (A)",
      "",
      "COST OF GOODS SOLD (COGS):",
      "  - Freelancer Payouts: ____________________",
      "  - API Tokens & Compute: __________________",
      "  - Transaction Gateways: __________________",
      "  - TOTAL COGS: ________________________ (B)",
      "",
      "GROSS PROFIT: ________________________ (A - B = C)",
      "",
      "OPERATING EXPENSES (OPEX):",
      "  - Server Hosting: ____________________",
      "  - CRM & Support Subscriptions: _________",
      "  - Domain Registrations: _______________",
      "  - Marketing & Advertising: ____________",
      "  - TOTAL OPEX: ________________________ (D)",
      "",
      "NET OPERATING PROFIT: __________________ (C - D = NET PROFIT)",
      "NET MARGIN: __________________________ (NET PROFIT / TOTAL REVENUE) * 100"
    ].join('\n'),

    'freelance_contract': [
      "==================================================",
      "AI-OS BUSINESS PLATFORM - SERVICE AGREEMENT CONTRACT",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "This agreement is made between [Client Business Name] ('Client') and [Your Business/Agency Name] ('Service Provider').",
      "",
      "1. DESCRIPTION OF SERVICES:",
      "   Service Provider will configure and maintain autonomous operations, custom automation pipelines, and AI systems as detailed in the project specifications.",
      "",
      "2. PAYMENT TERMS:",
      "   - Setup Fee: [Setup Price] INR due upon signature of this agreement.",
      "   - Monthly Support Retainer: [Support Price] INR due on the 1st of each calendar month.",
      "",
      "3. INTELLECTUAL PROPERTY:",
      "   All custom scripts, web structures, and automation flows created specifically for the Client will belong to the Client upon full receipt of payment.",
      "",
      "4. LIMITATION OF LIABILITY:",
      "   Service Provider is not liable for indirect, incidental, or consequential damages resulting from operational tool down-time or third-party API rate adjustments.",
      "",
      "Signed,",
      "Service Provider Signature: ______________________ Date: ___________",
      "Client Signature: _______________________________ Date: ___________"
    ].join('\n')
  };

  const content = templates[templateName];
  if (!content) return;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${templateName}_template.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Business template downloaded successfully!");
}

// Bind methods globally
window.verifyQuizAnswer = verifyQuizAnswer;
window.downloadTemplate = downloadTemplate;

// Vetted ideas database matrix for constructor compilations
const launchpadIdeas = {
  'agency': {
    title: "AI Business Automation",
    desc: "Deploy conversational lead-capture chat bots, CRM database synchronizers, and intake form workflows for client services.",
    retail: {
      setup: "₹1,500 (Domain registration + clean custom email address)",
      monthly: "₹4,200 (Make.com core plan + OpenAI token usage + Voiceflow setup)",
      profit: "₹80,000 - ₹3,50,000 / month",
      tools: "Make.com, Voiceflow, ChatGPT API, Google Drive APIs",
      skills: "API webhook configurations, prompt structuring, client discovery",
      registration: "Sole Proprietorship initially. Transition to One Person Company (OPC) once monthly retainer exceeds ₹1,50,000.",
      marketing: "Configure Programmatic SEO directory sites targetting '[City Name] Realtor Automations' + cold outreach DMs.",
      sales: "Build a basic real estate booking bot mockup and send a 3-minute video showcase to local agency directors.",
      automation: "Webhooks sync lead capture records directly to client CRM spreadsheet rows while firing Slack client alert pings.",
      risks: "API model updates changing bot output tones, client churn, setting up wrong webhooks.",
      timeline: "14 - 30 days to close first client retainer.",
      checklist: [
        "1. Build landing portal displaying realtor conversational lead booking bot demo.",
        "2. Locate 40 regional realtors on Google Maps and LinkedIn.",
        "3. Pitch Loom audit illustrating how bots reduce booking leakage by 60%.",
        "4. Close setup agreement and link Make.com pipeline nodes."
      ]
    },
    ecommerce: {
      setup: "₹2,500",
      monthly: "₹6,000",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Make.com, ActiveCampaign, ChatGPT API, E-Commerce App Marketplace",
      skills: "Email sequence structuring, cart abandon script setups",
      registration: "Sole Proprietorship. Register as Private Limited for foreign remittances.",
      marketing: "Audit brands using BuiltWith and email marketing directors with specific cart recovery recommendations.",
      sales: "Charge a performance retainer (e.g. 15% cut on all recovered shopping carts).",
      automation: "Triggers sync checkout abandonment tags to personalized email reminders containing AI copywriting.",
      risks: "Email deliverability limits, E-Commerce API access modifications.",
      timeline: "10 - 25 days.",
      checklist: [
        "1. Configure Make triggers for cart checkouts.",
        "2. Identify 30 E-Commerce brands in directory portals.",
        "3. Pitch email recovery improvements.",
        "4. Verify sequence delivery reports."
      ]
    },
    health: {
      setup: "₹1,500",
      monthly: "₹5,000",
      profit: "₹1,00,000 - ₹3,80,000 / month",
      tools: "Make, Voiceflow, HIPAA-compliant storage configs, WhatsApp Business API",
      skills: "Data compliance guidelines, conversational flows",
      registration: "Sole Proprietorship. Transition to Partnership or LLC for legal shield.",
      marketing: "Target local dental or wellness clinic owners with a WhatsApp appointment-auto-confirm system outline.",
      sales: "Present a case study of a local clinic reducing phone support workloads by 70% using WhatsApp automation.",
      automation: "Booking bot automatically updates scheduling calendars, confirms appointments, and alerts administrative staff.",
      risks: "Data privacy regulations, wrong calendars booking syncs.",
      timeline: "15 - 30 days.",
      checklist: [
        "1. Create a dental/health booking bot script template.",
        "2. Target local clinic directors with WhatsApp templates.",
        "3. Close setup retainer and synchronize database appointments."
      ]
    },
    education: {
      setup: "₹1,200",
      monthly: "₹3,500",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "Make, Zoom API, Loom, Google Classroom APIs",
      skills: "Learning flow setups, document templates",
      registration: "Sole Proprietorship.",
      marketing: "Target private tutors or content creators with auto-quiz generators and lesson organizers.",
      sales: "Offer custom course templates for an upfront ₹25,000 setup fee.",
      automation: "Signup events trigger lesson scheduling and generate completion certificates automatically.",
      risks: "Student churn, video bandwidth costs.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Build automated certificate and quiz generators.",
        "2. Contact local tutors and coaches.",
        "3. Deploy course workflows and sync signups."
      ]
    }
  },
  'dropservicing': {
    title: "Online Service Business",
    desc: "Broker high-value digital services (web design, copywriting, video editing) by securing contracts and outsourcing delivery to vetted contractors.",
    retail: {
      setup: "₹1,000 (Domain + basic landing site builder)",
      monthly: "₹2,500 (CRM tool + outreach sequencing software)",
      profit: "₹75,000 - ₹3,00,000 / month",
      tools: "Webflow, Loom, Google Forms, Freelance portals",
      skills: "High-ticket sales, project management, contractor vetting",
      registration: "Sole Proprietorship. LLC once cash flows stabilize.",
      marketing: "Build a premium niche portfolio site (e.g. 'Custom Web Design for Real Estate Brokers').",
      sales: "Outbound outreach pitching site upgrades, charging ₹80,000 flat setup fee.",
      automation: "Client feedback forms map updates directly to contractor project boards via Trello integrations.",
      risks: "Contractor delays or poor output quality, client communication delays.",
      timeline: "15 - 40 days.",
      checklist: [
        "1. Vett 3 high-quality UI designers on Behance and agree on hourly pricing.",
        "2. Build client-facing site presenting premium visual examples.",
        "3. Reach out to 50 realtors with outdated sites.",
        "4. Close client deal, pay contractor 40%, and keep 60% arbitrage margin."
      ]
    },
    ecommerce: {
      setup: "₹1,000",
      monthly: "₹3,000",
      profit: "₹90,000 - ₹4,00,000 / month",
      tools: "Outreach CRM, Upwork, Make.com",
      skills: "Product-led sales, client onboarding",
      registration: "Sole Proprietorship.",
      marketing: "Pitch E-commerce brands high-converting video ad edits for social media channels.",
      sales: "Sell video packs (10 ads/month) for a monthly recurring retainer of ₹50,000.",
      automation: "Dropbox automation pulls raw assets, alerts the video editor, and syncs finalized reviews.",
      risks: "Fluctuating ad platform compliance rules, contractor availability.",
      timeline: "10 - 30 days.",
      checklist: [
        "1. Contract 2 expert video editors.",
        "2. Direct-message active e-commerce brands running ads.",
        "3. Close monthly video retainer.",
        "4. Delegate editing tasks and track delivery."
      ]
    }
  },
  'micro-saas': {
    title: "Software Business",
    desc: "Launch a single-feature software tool that solves a highly specific operational task, monetizing via low-cost monthly subscriptions.",
    retail: {
      setup: "₹3,500 (API server + domain + database config)",
      monthly: "₹5,000 (Vercel hosting + Supabase + OpenAI APIs + Stripe API)",
      profit: "₹1,50,000 - ₹8,00,000 / month",
      tools: "Next.js, Tailwind, Supabase, OpenAI, Resend",
      skills: "JavaScript/React development, basic API routing, product design",
      registration: "Private Limited or LLP immediately to protect software assets.",
      marketing: "Submit product to AI directories (ProductHunt, TheresAnAIForThat) + programmatic content.",
      sales: "Set pricing at ₹1,500/month per user account with a free 7-day trial.",
      automation: "User accounts, billing portals, and API keys are provisioned automatically.",
      risks: "Server down-time, OpenAI billing scale spikes, competitors launching identical clones.",
      timeline: "30 - 60 days.",
      checklist: [
        "1. Build a single-page tool: e.g., 'Real Estate AI Description Writer'.",
        "2. Integrate Supabase Auth and Stripe checkout links.",
        "3. List product on directories and launch organic search campaigns.",
        "4. Optimize product UX based on client feedback metrics."
      ]
    },
    ecommerce: {
      setup: "₹4,000",
      monthly: "₹6,000",
      profit: "₹2,00,000 - ₹12,00,000 / month",
      tools: "Next.js, E-Commerce Cart Automation Matrix, Supabase, OpenAI",
      skills: "E-Commerce API, backend database schema",
      registration: "Private Limited.",
      marketing: "List app on the E-Commerce App Marketplace, optimizing for keywords like 'AI product reviews' or 'SEO tagger'.",
      sales: "Freemium plan: Free up to 100 products, then ₹2,500/month.",
      automation: "Platform installation captures account details and configures synchronization automatically.",
      risks: "E-Commerce store bans, review ratings drops, API changes.",
      timeline: "30 - 90 days.",
      checklist: [
        "1. Write single-feature app for product tag generation.",
        "2. Submit app to E-Commerce App Marketplace validation.",
        "3. Run targeted installs campaigns.",
        "4. Upsell premium subscription models."
      ]
    }
  },
  'creator': {
    title: "Content Creator Business",
    desc: "Build a highly-targeted content brand using AI video scripting tools, monetizing via sponsorships, templates, and courses.",
    retail: {
      setup: "₹0 (Free social accounts + organic editing tools)",
      monthly: "₹1,500 (AI video generation + captioning templates)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "CapCut, ElevenLabs, ChatGPT, Gumroad, Canva",
      skills: "Video storytelling, script structure, content hook design",
      registration: "Sole Proprietorship. LLC once sponsorship revenues emerge.",
      marketing: "Publish daily vertical content explaining business mechanics and automation tips.",
      sales: "Monetize by selling copy-paste template bundles on Gumroad at ₹750/download.",
      automation: "Gumroad delivery fires immediately, updating customer directories and newsletter lists.",
      risks: "Algorithm updates limiting reach, audience fatigue.",
      timeline: "30 - 90 days.",
      checklist: [
        "1. Create social channels focused on 'How to automate local businesses'.",
        "2. Generate 10 videos showing active visual workflows.",
        "3. Build a digital template pack on Gumroad.",
        "4. Direct traffic to bio link."
      ]
    },
    ecommerce: {
      setup: "₹500",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "CapCut, ChatGPT, affiliate program links",
      skills: "Affiliate marketing, video editing",
      registration: "Sole Proprietorship.",
      marketing: "Review e-commerce gadgets on camera using interactive hooks.",
      sales: "Place affiliate purchase links in bio descriptions (capturing 5-15% commission).",
      automation: "Affiliate dashboard tracks conversions and schedules payouts.",
      risks: "Affiliate program changes, account bans.",
      timeline: "20 - 60 days.",
      checklist: [
        "1. Setup affiliate program relationships (Amazon, EarnKaro).",
        "2. Create short content reviews of trending gadgets.",
        "3. Include affiliate links in description bios.",
        "4. Scale video content volume."
      ]
    }
  },
  'agency_video_ad': {
    title: "Video Advertisement Business",
    desc: "Transform a single product or brand image into a premium commercial video ad using keyframe interpolation and motion vector blueprints.",
    retail: {
      setup: "₹1,500 (Domain + safe professional email mapping)",
      monthly: "₹4,500 (Motion Script Compiler Pipeline API credits + mid-tier image models)",
      profit: "₹90,000 - ₹3,50,000 / month",
      tools: "Motion Script Compiler Pipeline, Google Veo, OmniFlash, ChatGPT, Midjourney",
      skills: "Storyboard expansion, motion vector prompt engineering, asset standardization",
      registration: "Sole Proprietorship initially. Transition to LLC as campaigns scale.",
      marketing: "Target local e-commerce and retail brands with high-quality spec video ads.",
      sales: "Charge a flat retainership for weekly high-retention video ad creatives.",
      automation: "Product image uploaded -> Universal Storyboard prompt generates 9-frame layout -> Motion Script Compiler Pipeline JSON prompt outputs camera movement instructions -> Video renders automatically.",
      risks: "Ad platform compliance changes, high rendering API costs.",
      timeline: "7 - 14 days to secure first ad production client.",
      checklist: [
        "1. Scrape directory listings for local e-commerce brands with static product imagery.",
        "2. Generate a 6-8 second spec video ad from their raw image asset using Workflow 1 templates.",
        "3. Send a direct outbound message presenting the high-retention cinematic animation result.",
        "4. Close a monthly creation retainer and automate the intake delivery webhook."
      ]
    },
    ecommerce: {
      setup: "₹1,500 (Domain + safe professional email mapping)",
      monthly: "₹4,500 (Motion Script Compiler Pipeline API credits + mid-tier image models)",
      profit: "₹90,000 - ₹3,50,000 / month",
      tools: "Motion Script Compiler Pipeline, Google Veo, OmniFlash, ChatGPT, Midjourney",
      skills: "Storyboard expansion, motion vector prompt engineering, asset standardization",
      registration: "Sole Proprietorship initially. Transition to LLC as campaigns scale.",
      marketing: "Target local e-commerce and retail brands with high-quality spec video ads.",
      sales: "Charge a flat retainership for weekly high-retention video ad creatives.",
      automation: "Product image uploaded -> Universal Storyboard prompt generates 9-frame layout -> Motion Script Compiler Pipeline JSON prompt outputs camera movement instructions -> Video renders automatically.",
      risks: "Ad platform compliance changes, high rendering API costs.",
      timeline: "7 - 14 days to secure first ad production client.",
      checklist: [
        "1. Scrape directory listings for local e-commerce brands with static product imagery.",
        "2. Generate a 6-8 second spec video ad from their raw image asset using Workflow 1 templates.",
        "3. Send a direct outbound message presenting the high-retention cinematic animation result.",
        "4. Close a monthly creation retainer and automate the intake delivery webhook."
      ]
    },
    health: {
      setup: "₹1,500 (Domain + safe professional email mapping)",
      monthly: "₹4,500 (Motion Script Compiler Pipeline API credits + mid-tier image models)",
      profit: "₹90,000 - ₹3,50,000 / month",
      tools: "Motion Script Compiler Pipeline, Google Veo, OmniFlash, ChatGPT, Midjourney",
      skills: "Storyboard expansion, motion vector prompt engineering, asset standardization",
      registration: "Sole Proprietorship initially. Transition to LLC as campaigns scale.",
      marketing: "Target local e-commerce and retail brands with high-quality spec video ads.",
      sales: "Charge a flat retainership for weekly high-retention video ad creatives.",
      automation: "Product image uploaded -> Universal Storyboard prompt generates 9-frame layout -> Motion Script Compiler Pipeline JSON prompt outputs camera movement instructions -> Video renders automatically.",
      risks: "Ad platform compliance changes, high rendering API costs.",
      timeline: "7 - 14 days to secure first ad production client.",
      checklist: [
        "1. Scrape directory listings for local e-commerce brands with static product imagery.",
        "2. Generate a 6-8 second spec video ad from their raw image asset using Workflow 1 templates.",
        "3. Send a direct outbound message presenting the high-retention cinematic animation result.",
        "4. Close a monthly creation retainer and automate the intake delivery webhook."
      ]
    },
    education: {
      setup: "₹1,500 (Domain + safe professional email mapping)",
      monthly: "₹4,500 (Motion Script Compiler Pipeline API credits + mid-tier image models)",
      profit: "₹90,000 - ₹3,50,000 / month",
      tools: "Motion Script Compiler Pipeline, Google Veo, OmniFlash, ChatGPT, Midjourney",
      skills: "Storyboard expansion, motion vector prompt engineering, asset standardization",
      registration: "Sole Proprietorship initially. Transition to LLC as campaigns scale.",
      marketing: "Target local e-commerce and retail brands with high-quality spec video ads.",
      sales: "Charge a flat retainership for weekly high-retention video ad creatives.",
      automation: "Product image uploaded -> Universal Storyboard prompt generates 9-frame layout -> Motion Script Compiler Pipeline JSON prompt outputs camera movement instructions -> Video renders automatically.",
      risks: "Ad platform compliance changes, high rendering API costs.",
      timeline: "7 - 14 days to secure first ad production client.",
      checklist: [
        "1. Scrape directory listings for local e-commerce brands with static product imagery.",
        "2. Generate a 6-8 second spec video ad from their raw image asset using Workflow 1 templates.",
        "3. Send a direct outbound message presenting the high-retention cinematic animation result.",
        "4. Close a monthly creation retainer and automate the intake delivery webhook."
      ]
    }
  },
  'creator_zackd_shorts': {
    title: "Short Video Production Business",
    desc: "Produce highly viral 3D cartoon-realistic educational shorts with fast-paced pacing and scientific cross-section reveals for social channels.",
    retail: {
      setup: "₹0 (Organic video channel registration)",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "ChatGPT, Gemini (Create with Omni), CapCut, InShot, ElevenLabs",
      skills: "Viral hook structure, high-retention pacing, localized video stitching",
      registration: "Sole Proprietorship. Register for tax filing once AdSense/brand sponsorships are active.",
      marketing: "Deploy vertical content natively on YouTube Shorts, Instagram Reels, and TikTok optimized with localized hashtags.",
      sales: "Monetize via platform views creator pools, brand sponsor placements, and digital template downloads in bio.",
      automation: "Master prompt detects content category -> outputs 10 curious titles -> selection triggers a 3-part script (Hook, Explanation, Shocking Reveal) with explicit camera motions (Orbit, Push-in) and Hindi voiceovers.",
      risks: "Platform algorithm variance, automated reuse content flags, high rendering queue latency.",
      timeline: "15 - 30 days to build audience metrics and initial revenue.",
      checklist: [
        "1. Establish faceless social media handles targeting educational/bizarre fact niches.",
        "2. Compile the master script blueprint using the exact 24-30 second motion script sequencing layout sequence.",
        "3. Render the three independent 8-10 second clips inside Gemini's video engine using stylized 3D character descriptions.",
        "4. Stitch the outputs sequentially with automated captions and drop a template download link in the bio."
      ]
    },
    ecommerce: {
      setup: "₹0 (Organic video channel registration)",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "ChatGPT, Gemini (Create with Omni), CapCut, InShot, ElevenLabs",
      skills: "Viral hook structure, high-retention pacing, localized video stitching",
      registration: "Sole Proprietorship. Register for tax filing once AdSense/brand sponsorships are active.",
      marketing: "Deploy vertical content natively on YouTube Shorts, Instagram Reels, and TikTok optimized with localized hashtags.",
      sales: "Monetize via platform views creator pools, brand sponsor placements, and digital template downloads in bio.",
      automation: "Master prompt detects content category -> outputs 10 curious titles -> selection triggers a 3-part script (Hook, Explanation, Shocking Reveal) with explicit camera motions (Orbit, Push-in) and Hindi voiceovers.",
      risks: "Platform algorithm variance, automated reuse content flags, high rendering queue latency.",
      timeline: "15 - 30 days to build audience metrics and initial revenue.",
      checklist: [
        "1. Establish faceless social media handles targeting educational/bizarre fact niches.",
        "2. Compile the master script blueprint using the exact 24-30 second motion script sequencing layout sequence.",
        "3. Render the three independent 8-10 second clips inside Gemini's video engine using stylized 3D character descriptions.",
        "4. Stitch the outputs sequentially with automated captions and drop a template download link in the bio."
      ]
    },
    health: {
      setup: "₹0 (Organic video channel registration)",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "ChatGPT, Gemini (Create with Omni), CapCut, InShot, ElevenLabs",
      skills: "Viral hook structure, high-retention pacing, localized video stitching",
      registration: "Sole Proprietorship. Register for tax filing once AdSense/brand sponsorships are active.",
      marketing: "Deploy vertical content natively on YouTube Shorts, Instagram Reels, and TikTok optimized with localized hashtags.",
      sales: "Monetize via platform views creator pools, brand sponsor placements, and digital template downloads in bio.",
      automation: "Master prompt detects content category -> outputs 10 curious titles -> selection triggers a 3-part script (Hook, Explanation, Shocking Reveal) with explicit camera motions (Orbit, Push-in) and Hindi voiceovers.",
      risks: "Platform algorithm variance, automated reuse content flags, high rendering queue latency.",
      timeline: "15 - 30 days to build audience metrics and initial revenue.",
      checklist: [
        "1. Establish faceless social media handles targeting educational/bizarre fact niches.",
        "2. Compile the master script blueprint using the exact 24-30 second motion script sequencing layout sequence.",
        "3. Render the three independent 8-10 second clips inside Gemini's video engine using stylized 3D character descriptions.",
        "4. Stitch the outputs sequentially with automated captions and drop a template download link in the bio."
      ]
    },
    education: {
      setup: "₹0 (Organic video channel registration)",
      monthly: "₹2,000 (Gemini Omni / Kling AI video rendering allocations)",
      profit: "₹70,000 - ₹3,00,000 / month",
      tools: "ChatGPT, Gemini (Create with Omni), CapCut, InShot, ElevenLabs",
      skills: "Viral hook structure, high-retention pacing, localized video stitching",
      registration: "Sole Proprietorship. Register for tax filing once AdSense/brand sponsorships are active.",
      marketing: "Deploy vertical content natively on YouTube Shorts, Instagram Reels, and TikTok optimized with localized hashtags.",
      sales: "Monetize via platform views creator pools, brand sponsor placements, and digital template downloads in bio.",
      automation: "Master prompt detects content category -> outputs 10 curious titles -> selection triggers a 3-part script (Hook, Explanation, Shocking Reveal) with explicit camera motions (Orbit, Push-in) and Hindi voiceovers.",
      risks: "Platform algorithm variance, automated reuse content flags, high rendering queue latency.",
      timeline: "15 - 30 days to build audience metrics and initial revenue.",
      checklist: [
        "1. Establish faceless social media handles targeting educational/bizarre fact niches.",
        "2. Compile the master script blueprint using the exact 24-30 second motion script sequencing layout sequence.",
        "3. Render the three independent 8-10 second clips inside Gemini's video engine using stylized 3D character descriptions.",
        "4. Stitch the outputs sequentially with automated captions and drop a template download link in the bio."
      ]
    }
  },
  'agency_voice_ai': {
    title: "AI Voice Assistant Business",
    desc: "Build and sell custom autonomous conversational voice AI booking assistants to handle administrative phone workloads for local healthcare clinics.",
    retail: {
      setup: "₹2,500 (Server endpoint configurations + custom portal mapping)",
      monthly: "₹6,000 (Claude API token scale + Twilio trunk line allocations + Voiceflow routing)",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Claude AI, OmniDimension MCP Server (https://mcp.omnidim.io/mcp), Twilio, Exotel, SIP trunks",
      skills: "MCP connector integration, voice telephony architecture, conversational intake rules",
      registration: "Private Limited company setup recommended due to enterprise medical clinic liability and service agreements.",
      marketing: "Target high-traffic local dental, wellness, and medical clinics experiencing customer service overhead.",
      sales: "Perform live telephone audits with clinic owners showcasing immediate voice booking response.",
      automation: "Incoming call activates Twilio trunk -> triggers OmniDimension MCP custom connector -> Claude processes natural dialogue -> automatically inputs appointment slot into clinic spreadsheet calendar.",
      risks: "Telephony latency issues, complex medical terminology misunderstanding, API connection dropouts.",
      timeline: "15 - 30 days to deploy your first client system.",
      checklist: [
        "1. Map out a dentist booking voice agent script using Claude's custom connectors block.",
        "2. Locate 40 regional dental or wellness clinics experiencing high support workloads.",
        "3. Run phone demonstration audits showing how the autonomous system auto-confirms data fields.",
        "4. Secure a ₹40,000 upfront setup package and scale the monthly support retainer infrastructure."
      ]
    },
    ecommerce: {
      setup: "₹2,500 (Server endpoint configurations + custom portal mapping)",
      monthly: "₹6,000 (Claude API token scale + Twilio trunk line allocations + Voiceflow routing)",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Claude AI, OmniDimension MCP Server (https://mcp.omnidim.io/mcp), Twilio, Exotel, SIP trunks",
      skills: "MCP connector integration, voice telephony architecture, conversational intake rules",
      registration: "Private Limited company setup recommended due to enterprise medical clinic liability and service agreements.",
      marketing: "Target high-traffic local dental, wellness, and medical clinics experiencing customer service overhead.",
      sales: "Perform live telephone audits with clinic owners showcasing immediate voice booking response.",
      automation: "Incoming call activates Twilio trunk -> triggers OmniDimension MCP custom connector -> Claude processes natural dialogue -> automatically inputs appointment slot into clinic spreadsheet calendar.",
      risks: "Telephony latency issues, complex medical terminology misunderstanding, API connection dropouts.",
      timeline: "15 - 30 days to deploy your first client system.",
      checklist: [
        "1. Map out a dentist booking voice agent script using Claude's custom connectors block.",
        "2. Locate 40 regional dental or wellness clinics experiencing high support workloads.",
        "3. Run phone demonstration audits showing how the autonomous system auto-confirms data fields.",
        "4. Secure a ₹40,000 upfront setup package and scale the monthly support retainer infrastructure."
      ]
    },
    health: {
      setup: "₹2,500 (Server endpoint configurations + custom portal mapping)",
      monthly: "₹6,000 (Claude API token scale + Twilio trunk line allocations + Voiceflow routing)",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Claude AI, OmniDimension MCP Server (https://mcp.omnidim.io/mcp), Twilio, Exotel, SIP trunks",
      skills: "MCP connector integration, voice telephony architecture, conversational intake rules",
      registration: "Private Limited company setup recommended due to enterprise medical clinic liability and service agreements.",
      marketing: "Target high-traffic local dental, wellness, and medical clinics experiencing customer service overhead.",
      sales: "Perform live telephone audits with clinic owners showcasing immediate voice booking response.",
      automation: "Incoming call activates Twilio trunk -> triggers OmniDimension MCP custom connector -> Claude processes natural dialogue -> automatically inputs appointment slot into clinic spreadsheet calendar.",
      risks: "Telephony latency issues, complex medical terminology misunderstanding, API connection dropouts.",
      timeline: "15 - 30 days to deploy your first client system.",
      checklist: [
        "1. Map out a dentist booking voice agent script using Claude's custom connectors block.",
        "2. Locate 40 regional dental or wellness clinics experiencing high support workloads.",
        "3. Run phone demonstration audits showing how the autonomous system auto-confirms data fields.",
        "4. Secure a ₹40,000 upfront setup package and scale the monthly support retainer infrastructure."
      ]
    },
    education: {
      setup: "₹2,500 (Server endpoint configurations + custom portal mapping)",
      monthly: "₹6,000 (Claude API token scale + Twilio trunk line allocations + Voiceflow routing)",
      profit: "₹1,20,000 - ₹4,50,000 / month",
      tools: "Claude AI, OmniDimension MCP Server (https://mcp.omnidim.io/mcp), Twilio, Exotel, SIP trunks",
      skills: "MCP connector integration, voice telephony architecture, conversational intake rules",
      registration: "Private Limited company setup recommended due to enterprise medical clinic liability and service agreements.",
      marketing: "Target high-traffic local dental, wellness, and medical clinics experiencing customer service overhead.",
      sales: "Perform live telephone audits with clinic owners showcasing immediate voice booking response.",
      automation: "Incoming call activates Twilio trunk -> triggers OmniDimension MCP custom connector -> Claude processes natural dialogue -> automatically inputs appointment slot into clinic spreadsheet calendar.",
      risks: "Telephony latency issues, complex medical terminology misunderstanding, API connection dropouts.",
      timeline: "15 - 30 days to deploy your first client system.",
      checklist: [
        "1. Map out a dentist booking voice agent script using Claude's custom connectors block.",
        "2. Locate 40 regional dental or wellness clinics experiencing high support workloads.",
        "3. Run phone demonstration audits showing how the autonomous system auto-confirms data fields.",
        "4. Secure a ₹40,000 upfront setup package and scale the monthly support retainer infrastructure."
      ]
    }
  },
  'creator_managed_network': {
    title: "Influencer Management Business",
    desc: "Monetize digital vertical content channels through highly structured creator network partnerships, direct content contracts, and high-CPM performance applications.",
    retail: {
      setup: "₹0 (Free standard creator portal access)",
      monthly: "₹1,500 (Caption builders + short-form template scripts)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "8x Social platform, Smartreach, Instantly, Google Sheets",
      skills: "Brand guidelines alignment, contract negotiation, performance content scaling",
      registration: "Sole Proprietorship initially. Transition to LLC/Partnership as creator contracts expand.",
      marketing: "Apply directly to premium brand databases and pitch short-form content conversion loops.",
      sales: "Secure brand integration payouts based on vertical video view thresholds and affiliate tracking codes.",
      automation: "Profile optimization triggers direct campaign matching -> system matches channel metrics to featured tech/AI campaigns (firstprompt, Pocket Pal, AiApply) -> tracking dashboard registers video views and processes direct payouts.",
      risks: "Brand guidelines violation, platform ban hazards, changing CPM pay rates.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Configure user authentication inside the 16-tier managed creator portal dashboard.",
        "2. Apply to active high-CPM campaign arrays and download specific brand briefs.",
        "3. Deploy daily vertical video assets integrating the precise promotional hook rules.",
        "4. Sign digital payout waivers and verify recurring ledger payouts to local banks."
      ]
    },
    ecommerce: {
      setup: "₹0 (Free standard creator portal access)",
      monthly: "₹1,500 (Caption builders + short-form template scripts)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "8x Social platform, Smartreach, Instantly, Google Sheets",
      skills: "Brand guidelines alignment, contract negotiation, performance content scaling",
      registration: "Sole Proprietorship initially. Transition to LLC/Partnership as creator contracts expand.",
      marketing: "Apply directly to premium brand databases and pitch short-form content conversion loops.",
      sales: "Secure brand integration payouts based on vertical video view thresholds and affiliate tracking codes.",
      automation: "Profile optimization triggers direct campaign matching -> system matches channel metrics to featured tech/AI campaigns (firstprompt, Pocket Pal, AiApply) -> tracking dashboard registers video views and processes direct payouts.",
      risks: "Brand guidelines violation, platform ban hazards, changing CPM pay rates.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Configure user authentication inside the 16-tier managed creator portal dashboard.",
        "2. Apply to active high-CPM campaign arrays and download specific brand briefs.",
        "3. Deploy daily vertical video assets integrating the precise promotional hook rules.",
        "4. Sign digital payout waivers and verify recurring ledger payouts to local banks."
      ]
    },
    health: {
      setup: "₹0 (Free standard creator portal access)",
      monthly: "₹1,500 (Caption builders + short-form template scripts)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "8x Social platform, Smartreach, Instantly, Google Sheets",
      skills: "Brand guidelines alignment, contract negotiation, performance content scaling",
      registration: "Sole Proprietorship initially. Transition to LLC/Partnership as creator contracts expand.",
      marketing: "Apply directly to premium brand databases and pitch short-form content conversion loops.",
      sales: "Secure brand integration payouts based on vertical video view thresholds and affiliate tracking codes.",
      automation: "Profile optimization triggers direct campaign matching -> system matches channel metrics to featured tech/AI campaigns (firstprompt, Pocket Pal, AiApply) -> tracking dashboard registers video views and processes direct payouts.",
      risks: "Brand guidelines violation, platform ban hazards, changing CPM pay rates.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Configure user authentication inside the 16-tier managed creator portal dashboard.",
        "2. Apply to active high-CPM campaign arrays and download specific brand briefs.",
        "3. Deploy daily vertical video assets integrating the precise promotional hook rules.",
        "4. Sign digital payout waivers and verify recurring ledger payouts to local banks."
      ]
    },
    education: {
      setup: "₹0 (Free standard creator portal access)",
      monthly: "₹1,500 (Caption builders + short-form template scripts)",
      profit: "₹50,000 - ₹2,50,000 / month",
      tools: "8x Social platform, Smartreach, Instantly, Google Sheets",
      skills: "Brand guidelines alignment, contract negotiation, performance content scaling",
      registration: "Sole Proprietorship initially. Transition to LLC/Partnership as creator contracts expand.",
      marketing: "Apply directly to premium brand databases and pitch short-form content conversion loops.",
      sales: "Secure brand integration payouts based on vertical video view thresholds and affiliate tracking codes.",
      automation: "Profile optimization triggers direct campaign matching -> system matches channel metrics to featured tech/AI campaigns (firstprompt, Pocket Pal, AiApply) -> tracking dashboard registers video views and processes direct payouts.",
      risks: "Brand guidelines violation, platform ban hazards, changing CPM pay rates.",
      timeline: "7 - 20 days.",
      checklist: [
        "1. Configure user authentication inside the 16-tier managed creator portal dashboard.",
        "2. Apply to active high-CPM campaign arrays and download specific brand briefs.",
        "3. Deploy daily vertical video assets integrating the precise promotional hook rules.",
        "4. Sign digital payout waivers and verify recurring ledger payouts to local banks."
      ]
    }
  },
  'creator_kids_animation': {
    title: "Kids Content Business",
    desc: "Produce automated, high-view count children's animation channels using structured ChatGPT text storyboards and native mobile generation apps.",
    retail: {
      setup: "₹500 (Basic design templates)",
      monthly: "₹2,500 (YouTube Create video scaling + audio assets)",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "ChatGPT, YouTube Create App, CapCut, Canva, Suno AI",
      skills: "Nursery narrative structure, mobile video layout generation, audio syncing",
      registration: "Sole Proprietorship. File taxes once YouTube AdSense thresholds are met.",
      marketing: "Deploy highly engaging 3D nursery rhyme videos on YouTube and YouTube Kids using strategic tags.",
      sales: "Monetize through YouTube Partner Program (AdSense) and merchandise or book licensing.",
      automation: "Prompt forces ChatGPT to render scene-by-scene detail scripts -> user inserts instructions into YouTube Create's AI video generation interface -> tool outputs smooth, colorful animated short frames.",
      risks: "YouTube Kids algorithm updates, reuse content guidelines, copyright strikes on audio tracks.",
      timeline: "30 - 60 days to gain authority and build steady audience metrics.",
      checklist: [
        "1. Research viral children's animation categories on YouTube and map their view volume metrics.",
        "2. Command ChatGPT to write a detailed, high-contrast nursery rhyme storyboard scene breakdown.",
        "3. Generate the colorful cinematic clips using the text-to-video tools inside the mobile editor pipeline.",
        "4. Layer background tracks and schedule daily automated uploads optimized for mobile view loops."
      ]
    },
    ecommerce: {
      setup: "₹500 (Basic design templates)",
      monthly: "₹2,500 (YouTube Create video scaling + audio assets)",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "ChatGPT, YouTube Create App, CapCut, Canva, Suno AI",
      skills: "Nursery narrative structure, mobile video layout generation, audio syncing",
      registration: "Sole Proprietorship. File taxes once YouTube AdSense thresholds are met.",
      marketing: "Deploy highly engaging 3D nursery rhyme videos on YouTube and YouTube Kids using strategic tags.",
      sales: "Monetize through YouTube Partner Program (AdSense) and merchandise or book licensing.",
      automation: "Prompt forces ChatGPT to render scene-by-scene detail scripts -> user inserts instructions into YouTube Create's AI video generation interface -> tool outputs smooth, colorful animated short frames.",
      risks: "YouTube Kids algorithm updates, reuse content guidelines, copyright strikes on audio tracks.",
      timeline: "30 - 60 days to gain authority and build steady audience metrics.",
      checklist: [
        "1. Research viral children's animation categories on YouTube and map their view volume metrics.",
        "2. Command ChatGPT to write a detailed, high-contrast nursery rhyme storyboard scene breakdown.",
        "3. Generate the colorful cinematic clips using the text-to-video tools inside the mobile editor pipeline.",
        "4. Layer background tracks and schedule daily automated uploads optimized for mobile view loops."
      ]
    },
    health: {
      setup: "₹500 (Basic design templates)",
      monthly: "₹2,500 (YouTube Create video scaling + audio assets)",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "ChatGPT, YouTube Create App, CapCut, Canva, Suno AI",
      skills: "Nursery narrative structure, mobile video layout generation, audio syncing",
      registration: "Sole Proprietorship. File taxes once YouTube AdSense thresholds are met.",
      marketing: "Deploy highly engaging 3D nursery rhyme videos on YouTube and YouTube Kids using strategic tags.",
      sales: "Monetize through YouTube Partner Program (AdSense) and merchandise or book licensing.",
      automation: "Prompt forces ChatGPT to render scene-by-scene detail scripts -> user inserts instructions into YouTube Create's AI video generation interface -> tool outputs smooth, colorful animated short frames.",
      risks: "YouTube Kids algorithm updates, reuse content guidelines, copyright strikes on audio tracks.",
      timeline: "30 - 60 days to gain authority and build steady audience metrics.",
      checklist: [
        "1. Research viral children's animation categories on YouTube and map their view volume metrics.",
        "2. Command ChatGPT to write a detailed, high-contrast nursery rhyme storyboard scene breakdown.",
        "3. Generate the colorful cinematic clips using the text-to-video tools inside the mobile editor pipeline.",
        "4. Layer background tracks and schedule daily automated uploads optimized for mobile view loops."
      ]
    },
    education: {
      setup: "₹500 (Basic design templates)",
      monthly: "₹2,500 (YouTube Create video scaling + audio assets)",
      profit: "₹60,000 - ₹2,20,000 / month",
      tools: "ChatGPT, YouTube Create App, CapCut, Canva, Suno AI",
      skills: "Nursery narrative structure, mobile video layout generation, audio syncing",
      registration: "Sole Proprietorship. File taxes once YouTube AdSense thresholds are met.",
      marketing: "Deploy highly engaging 3D nursery rhyme videos on YouTube and YouTube Kids using strategic tags.",
      sales: "Monetize through YouTube Partner Program (AdSense) and merchandise or book licensing.",
      automation: "Prompt forces ChatGPT to render scene-by-scene detail scripts -> user inserts instructions into YouTube Create's AI video generation interface -> tool outputs smooth, colorful animated short frames.",
      risks: "YouTube Kids algorithm updates, reuse content guidelines, copyright strikes on audio tracks.",
      timeline: "30 - 60 days to gain authority and build steady audience metrics.",
      checklist: [
        "1. Research viral children's animation categories on YouTube and map their view volume metrics.",
        "2. Command ChatGPT to write a detailed, high-contrast nursery rhyme storyboard scene breakdown.",
        "3. Generate the colorful cinematic clips using the text-to-video tools inside the mobile editor pipeline.",
        "4. Layer background tracks and schedule daily automated uploads optimized for mobile view loops."
      ]
    }
  }
};

function initBusinessSimulators() {
  // Header Dropdown switches trigger
  const swBtnWrap = document.getElementById('workspace-dropdown-wrap');
  const swBtn = document.getElementById('workspace-dropdown-btn');
  if (swBtn && swBtnWrap) {
    swBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      swBtnWrap.classList.toggle('active');
    });
  }

  // Close dropdown on click outside
  document.addEventListener('click', () => {
    if (swBtnWrap) swBtnWrap.classList.remove('active');
  });

  // Dropdown list click triggers swapper
  const dropdownItems = document.querySelectorAll('.workspace-dropdown-menu button');
  dropdownItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const workspace = item.getAttribute('data-workspace');
      switchBusinessWorkspace(workspace);
      if (swBtnWrap) swBtnWrap.classList.remove('active');
    });
  });

  // Dashboard Overview Hero Button switches
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

  // Academy course catalog module toggles
  const modCards = document.querySelectorAll('.learn-module-card');
  modCards.forEach(card => {
    const header = card.querySelector('.learn-module-header');
    const body = card.querySelector('.learn-module-body');
    const arrow = card.querySelector('.learn-module-toggle-btn');
    if (header && body && arrow) {
      header.addEventListener('click', () => {
        const isActive = body.style.display === 'block';
        modCards.forEach(c => {
          c.classList.remove('active');
          const b = c.querySelector('.learn-module-body');
          if (b) b.style.display = 'none';
          const a = c.querySelector('.learn-module-toggle-btn');
          if (a) a.textContent = '▲';
        });
        if (!isActive) {
          card.classList.add('active');
          body.style.display = 'block';
          arrow.textContent = '▼';
        }
      });
    }
  });

  // Blueprint Launchpad Compiler logic
  const btnCompile = document.getElementById('btn-compile-blueprint');
  const bOutput = document.getElementById('blueprint-output-contents');
  if (btnCompile && bOutput) {
    btnCompile.addEventListener('click', () => {
      if (!isUserAuthenticated()) {
        document.getElementById('auth-modal-overlay').style.display = 'flex';
        showToast("Please login first to compile a business blueprint.", "warning");
        return;
      }
      
      if (state.user && state.user.plan_type !== 'Premium' && state.user.plan_type !== 'Trial') {
        showPricingModal(true);
        showToast("Upgrade to Premium or start trial to compile executable blueprints.", "warning");
        return;
      }

      const model = document.getElementById('blueprint-model-select').value;
      const nicheEl = document.getElementById('blueprint-niche-select');
      const niche = nicheEl ? nicheEl.value : 'retail';
      const budgetSelect = document.getElementById('blueprint-budget-select');
      const budget = budgetSelect ? budgetSelect.value : "5000";

      bOutput.innerHTML = `
        <div style="text-align: center; padding: 60px 0;">
          <span style="display:inline-block; animation: pulse 1.5s infinite; font-size: 2rem;">⏳</span>
          <p style="margin-top: 10px; font-family: var(--font-mono); color: var(--bus-primary); font-size:0.85rem;">COMPILING PRODUCTION LAUNCH MATRIX...</p>
        </div>
      `;

      setTimeout(() => {
        // Query the local database for compiler profile, fallback cleanly if not mapped
        const modelData = launchpadIdeas[model] || launchpadIdeas['agency'];
        const profile = modelData[niche] || modelData['retail'] || Object.values(modelData)[1];
        const isTrial = state.user && state.user.plan_type === 'Trial';

        let detailsHtml = `
          <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h5 class="learn-module-section-title">Required AI Tools</h5>
              <p style="font-family: var(--font-mono); font-size:0.8rem; color:var(--bus-primary);">${profile.tools}</p>
            </div>
            <div>
              <h5 class="learn-module-section-title">Required Human Skills</h5>
              <p style="font-family: var(--font-mono); font-size:0.8rem; color:var(--bus-accent);">${profile.skills}</p>
            </div>
          </div>

          <h5 class="learn-module-section-title" style="margin-top: 18px;">Entity Registration Guidance</h5>
          <p style="font-size:0.85rem; color:var(--bus-text-secondary); line-height:1.6; margin-bottom: 12px;">${profile.registration}</p>

          <h5 class="learn-module-section-title">Operational Automation Strategy</h5>
          <p style="font-size:0.85rem; color:var(--bus-text-secondary); line-height:1.6; margin-bottom: 12px;">${profile.automation}</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom:18px;">
            <div>
              <h5 class="learn-module-section-title">Niche Marketing Strategy</h5>
              <p style="font-size:0.82rem; color:var(--bus-text-secondary); line-height:1.5;">${profile.marketing}</p>
            </div>
            <div>
              <h5 class="learn-module-section-title">Outbound Sales Strategy</h5>
              <p style="font-size:0.82rem; color:var(--bus-text-secondary); line-height:1.5;">${profile.sales}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <h5 class="learn-module-section-title">Risk Factors</h5>
              <p style="font-size:0.82rem; color:var(--bus-secondary); line-height:1.5;">⚠️ ${profile.risks}</p>
            </div>
            <div>
              <h5 class="learn-module-section-title">Timeline to First Revenue</h5>
              <p style="font-size:0.82rem; color:var(--bus-primary); font-weight:600;">🕒 ${profile.timeline}</p>
            </div>
          </div>

          <h5 class="learn-module-section-title">Step-by-Step Launch Checklist</h5>
          <ol style="margin-left: 20px; color: var(--bus-text-secondary); line-height: 1.7; margin-bottom: 20px; font-size: 0.88rem;">
            ${profile.checklist.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
          </ol>
        `;

        if (isTrial) {
          detailsHtml = `
            <div class="premium-blur-gate">
              <div class="blur-content">
                ${detailsHtml}
              </div>
              <div class="premium-gate-overlay">
                <div class="gate-icon">🔒</div>
                <h4>Free Trial Preview</h4>
                <p>Upgrade to Premium for ₹99/mo to unlock full launch checklists, automation roadmaps, and step-by-step strategies.</p>
                <button class="btn-gate-upgrade" onclick="showPricingModal(true)">Upgrade to Premium</button>
              </div>
            </div>
          `;
        }

        let videoBaseName = 'AAA';
        if (model === 'dropservicing') videoBaseName = 'Drop-Servicing_Sprint';
        else if (model === 'micro-saas') videoBaseName = 'SaaS';
        else if (model === 'creator') videoBaseName = 'Content_Engine';
        else if (model === 'agency_video_ad') videoBaseName = 'AI_Video_Ad_Pipeline';
        else if (model === 'creator_zackd_shorts') videoBaseName = 'Motion_Script_Compiler';
        else if (model === 'agency_voice_ai') videoBaseName = 'Inbound_Voice_AI_Studio';
        else if (model === 'creator_managed_network') videoBaseName = 'Managed_Creator_Network';
        else if (model === 'creator_kids_animation') videoBaseName = 'AI_Nursery_Rhyme_Engine';

        bOutput.innerHTML = `
          <div class="blueprint-result-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 250px;">
              <span class="blueprint-result-badge">LAUNCHPAD CORE V2.0 // ACTIVE</span>
              <h3 class="blueprint-result-title">${modelData.title}</h3>
              <p style="font-size:0.85rem; color:var(--bus-text-secondary); margin-top:4px;">${modelData.desc}</p>
            </div>
            <button class="card-btn-video" onclick="handleBusinessVideoPlay('${model}', '${videoBaseName}', '${modelData.title}')" style="padding: 10px 16px; background: rgba(46, 197, 255, 0.1); border: 1px solid rgba(46, 197, 255, 0.3); color: #2EC5FF; font-family: 'Space Grotesk', monospace; font-weight: 700; font-size: 0.8rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='rgba(46, 197, 255, 0.2)'; this.style.borderColor='#2EC5FF';" onmouseout="this.style.background='rgba(46, 197, 255, 0.1)'; this.style.borderColor='rgba(46, 197, 255, 0.3)';">
              <span>🎥 Watch Video Tutorial</span>
            </button>
          </div>
          
          <div class="blueprint-projections-grid">
            <div class="blueprint-proj-card">
              <span class="blueprint-proj-val green">${profile.profit}</span>
              <span class="blueprint-proj-lbl">Expected Monthly Profits</span>
            </div>
            <div class="blueprint-proj-card">
              <span class="blueprint-proj-val">${profile.setup}</span>
              <span class="blueprint-proj-lbl">Realistic Setup Budget</span>
            </div>
            <div class="blueprint-proj-card">
              <span class="blueprint-proj-val green">${profile.monthly}</span>
              <span class="blueprint-proj-lbl">Estimated Monthly OPEX</span>
            </div>
          </div>

          ${detailsHtml}
        `;
        updateConversionFunnel(modelData, budget);
      }, 1000);
    });
  }

  // A.R. Business Strategist Chat & 7-Tab Output Compiler
  const chatInput = document.getElementById('chat-strategist-input');
  const chatSendBtn = document.getElementById('btn-chat-strategist-send');
  const chatLogs = document.getElementById('chat-strategist-logs');
  const outputPanel = document.getElementById('strategist-tabs-panel');
  const btnAnalyze = document.getElementById('btn-strategist-analyze');
  
  // Strategy tab triggers binding
  const strategTabBtns = document.querySelectorAll('.strategist-tab-btn');
  strategTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-output-tab');
      
      strategTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const panes = document.querySelectorAll('.strategist-tab-pane');
      panes.forEach(p => p.classList.remove('active'));
      const activePane = document.getElementById(`tab-out-${targetTab}`);
      if (activePane) activePane.classList.add('active');
    });
  });

  let isAnalysisComputed = false;
  let currentBusinessContext = {
    name: '',
    audience: '',
    bottleneck: '',
    strategy: null
  };
  let strategistChatHistory = [];

  // Deactivate chatbot send footer inputs by default until compiled
  if (chatInput && chatSendBtn) {
    chatInput.disabled = true;
    chatInput.placeholder = "Please analyze your enterprise matrix first...";
    chatSendBtn.disabled = true;
  }

  const renderStrategyBoard = (data) => {
    const formatValue = (val) => {
      if (!val) return 'Awaiting compiler generation...';
      if (Array.isArray(val)) {
        return val.map(item => {
          if (item && typeof item === 'object') {
            return `<strong>${item.title || item.name || ''}</strong>: ${item.description || item.text || JSON.stringify(item)}`;
          }
          return `${item}`;
        }).join('<br><br>');
      }
      if (typeof val === 'object') {
        return Object.entries(val).map(([key, value]) => {
          if (value && typeof value === 'object') {
            return `<strong>${key}</strong>:<br>${formatValue(value)}`;
          }
          return `<strong>${key}</strong>: ${value}`;
        }).join('<br>');
      }
      return String(val);
    };

    document.getElementById('out-text-analysis').innerHTML = formatValue(data.analysis);
    document.getElementById('out-text-opportunities').innerHTML = formatValue(data.opportunities);
    document.getElementById('out-text-automation').innerHTML = formatValue(data.automation);
    document.getElementById('out-text-marketing').innerHTML = formatValue(data.marketing);
    document.getElementById('out-text-leads').innerHTML = formatValue(data.leads);
    document.getElementById('out-text-revenue').innerHTML = formatValue(data.revenue);
    document.getElementById('out-text-plan').innerHTML = formatValue(data.plan);

    // Display the 7-Tab Panel
    if (outputPanel) {
      outputPanel.style.display = 'block';
      outputPanel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getClientFallback = () => {
    return {
      analysis: "Strategy generation requires a live server connection. Please check your network and retry.",
      opportunities: "Please retry after a moment.",
      automation: "Please retry after a moment.",
      marketing: "Please retry after a moment.",
      leads: "Please retry after a moment.",
      revenue: "Please retry after a moment.",
      plan: "Please retry after a moment."
    };
  };

  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', async () => {
      if (!isUserAuthenticated()) {
        document.getElementById('auth-modal-overlay').style.display = 'flex';
        showToast("Please login first to consult the AI strategist.", "warning");
        return;
      }
      
      if (state.user && state.user.plan_type !== 'Premium' && state.user.plan_type !== 'Trial') {
        showPricingModal(true);
        showToast("Upgrade to Premium or start trial to consult A.R. Business Strategist.", "warning");
        return;
      }

      const nameVal = (document.getElementById('strategist-business-name') || {}).value?.trim();
      const audienceVal = (document.getElementById('strategist-target-audience') || {}).value?.trim();
      const bottleneckVal = (document.getElementById('strategist-bottleneck') || {}).value?.trim();

      if (!nameVal || !audienceVal || !bottleneckVal) {
        showToast("Please fill in all three matrix profile inputs first.", "warning");
        return;
      }

      btnAnalyze.disabled = true;
      btnAnalyze.textContent = "COMPILING MATRIX...";

      // Clear previous logs and append Bot Thinking
      if (chatLogs) {
        chatLogs.innerHTML = '';
        const botThinking = document.createElement('div');
        botThinking.className = 'chat-bubble bot';
        botThinking.innerHTML = `<span>Formulating customized enterprise strategy roadmap based on your profile inputs...</span>`;
        chatLogs.appendChild(botThinking);
        chatLogs.scrollTop = chatLogs.scrollHeight;
      }

      try {
        const res = await fetch('/api/strategist/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.user ? state.user.token : ''}`
          },
          body: JSON.stringify({
            mode: 'compile',
            businessName: nameVal,
            targetAudience: audienceVal,
            bottleneck: bottleneckVal
          })
        });

        // Remove thinking bubble
        if (chatLogs) chatLogs.innerHTML = '';

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Server error');
        }

        const data = await res.json();
        
        // Sync context
        currentBusinessContext = {
          name: nameVal,
          audience: audienceVal,
          bottleneck: bottleneckVal,
          strategy: data
        };

        // Initialize structured payload context in active chat memory logs
        strategistChatHistory = [
          { role: 'user', content: `Analyze my business:\nName/Niche: ${nameVal}\nTarget Audience: ${audienceVal}\nBottleneck: ${bottleneckVal}` },
          { role: 'assistant', content: `Analysis Compiled successfully. I have populated the 7-tab Strategy Board. Key findings:\n${data.analysis}` }
        ];

        renderStrategyBoard(data);

        // Success bubble in chat
        if (chatLogs) {
          const welcomeBubble = document.createElement('div');
          welcomeBubble.className = 'chat-bubble bot';
          welcomeBubble.innerHTML = `<strong>Enterprise Analysis Compiled!</strong><br>I have generated a customized operational blueprint based on your query. Please review the <strong>7-tab Strategy Board</strong> below.<br><br>You can now ask follow-up questions in the chat bar below.`;
          chatLogs.appendChild(welcomeBubble);
          chatLogs.scrollTop = chatLogs.scrollHeight;
        }

        // Enable chat inputs
        isAnalysisComputed = true;
        if (chatInput && chatSendBtn) {
          chatInput.disabled = false;
          chatInput.placeholder = "Ask your corporate advisory partner follow-up questions...";
          chatSendBtn.disabled = false;
        }

      } catch (err) {
        console.warn("Backend strategist call failed, running local fallback strategy:", err);
        if (chatLogs) chatLogs.innerHTML = '';
        renderStrategyBoard(getClientFallback());
        showToast(err.message || "Failed to compile blueprint.", "error");
      } finally {
        btnAnalyze.disabled = false;
        btnAnalyze.textContent = "ANALYZE ENTERPRISE MATRIX";
      }
    });
  }

  if (chatInput && chatSendBtn && chatLogs) {
    const handleSend = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      if (!isAnalysisComputed) {
        showToast("Please compile the Enterprise Matrix first.", "warning");
        return;
      }

      if (!isUserAuthenticated()) {
        document.getElementById('auth-modal-overlay').style.display = 'flex';
        showToast("Please login first to consult the AI strategist.", "warning");
        return;
      }
      
      if (state.user && state.user.plan_type !== 'Premium' && state.user.plan_type !== 'Trial') {
        showPricingModal(true);
        showToast("Upgrade to Premium or start trial to consult A.R. Business Strategist.", "warning");
        return;
      }

      // Append User Bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble user';
      userBubble.textContent = text;
      chatLogs.appendChild(userBubble);
      chatInput.value = '';
      chatLogs.scrollTop = chatLogs.scrollHeight;

      // Append Bot Thinking Bubble
      const botThinking = document.createElement('div');
      botThinking.className = 'chat-bubble bot';
      botThinking.innerHTML = `<span>Thinking...</span>`;
      chatLogs.appendChild(botThinking);
      chatLogs.scrollTop = chatLogs.scrollHeight;

      fetch('/api/strategist/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.user ? state.user.token : ''}`
        },
        body: JSON.stringify({
          mode: 'chat',
          userInput: text,
          context: currentBusinessContext,
          history: strategistChatHistory
        })
      })
      .then(async (res) => {
        botThinking.remove();
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Server error');
        }
        return res.json();
      })
      .then((data) => {
        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bot';
        botBubble.innerHTML = data.reply || "I have processed your query.";
        chatLogs.appendChild(botBubble);
        chatLogs.scrollTop = chatLogs.scrollHeight;

        // Persist history
        strategistChatHistory.push({ role: 'user', content: text });
        strategistChatHistory.push({ role: 'assistant', content: data.reply });
      })
      .catch((err) => {
        showToast("Failed to fetch reply: " + err.message, "error");
      });
    };

    chatSendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
}

let authMode = 'signin';

function updateAuthModalUI() {
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
    if (title) title.textContent = 'Access AI-OS Business';
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

async function handleBusEmailSignin() {
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
    
    if (!data.user.name || !data.user.date_of_birth || !data.user.gender || !data.user.profession) {
      showOnboardingModal(data.user);
    } else {
      updateUserProfileHeader();
      initTrialClock();
      switchBusinessWorkspace('dashboard');
      showToast("Logged in successfully!");
    }
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
  }
}

async function handleBusEmailSignup() {
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
    
    state.user = data.user;
    localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
    
    const authOverlay = document.getElementById('auth-modal-overlay');
    if (authOverlay) authOverlay.style.display = 'none';
    
    showOnboardingModal(data.user);
    showToast("Account created successfully!");
  } catch (err) {
    if (errorEl) { errorEl.textContent = 'Server connection failed.'; errorEl.style.display = 'block'; }
  }
}

async function handleBusForgotPassword() {
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

async function initApp() {
  const authUrlParams = new URLSearchParams(window.location.search);
  
  // Handle Reset Password action
  const resetAction = authUrlParams.get('action');
  const resetTokenVal = authUrlParams.get('token');
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

  if (authUrlParams.has('code') || authUrlParams.has('state') || authUrlParams.has('token') || authUrlParams.has('error')) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.search = '';
    window.history.replaceState({}, document.title, cleanUrl.toString());
  }

  // Try to synchronize and recover session from DB auth status check using /api/auth/me
  try {
    const meRes = await fetch('/api/auth/me');
    if (meRes.ok) {
      const meData = await meRes.json();
      if (meData.success && meData.user) {
        const user = meData.user;
        // Check profile completeness on user object directly
        if (!user.fullName || !user.dateOfBirth || !user.gender || !user.profession) {
          showOnboardingModal({
            id: user.id,
            email: user.email,
            name: user.fullName || '',
            gender: user.gender || '',
            profession: user.profession || '',
            date_of_birth: user.dateOfBirth || '',
            plan_type: user.plan_type || 'Basic'
          });
        } else {
          state.user = {
            id: user.id,
            email: user.email,
            name: user.fullName,
            gender: user.gender,
            profession: user.profession,
            date_of_birth: user.dateOfBirth,
            plan_type: user.plan_type || 'Basic',
            is_coupon: false
          };
          localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
          
          const authOverlay = document.getElementById('auth-modal-overlay');
          if (authOverlay) authOverlay.style.display = 'none';
          
          // Redirect immediately to the active 7-tab dashboard console
          switchBusinessWorkspace('dashboard');
        }
      } else {
        throw new Error('Invalid user payload');
      }
    } else {
      const couponSession = sessionStorage.getItem('aios_coupon_session');
      if (!couponSession) {
        state.user = null;
        localStorage.removeItem('aios_user_profile');
        window.location.href = './index.html?action=login';
      }
    }
  } catch (err) {
    console.warn('Session synchronization failed:', err.message);
    const couponSession = sessionStorage.getItem('aios_coupon_session');
    if (!couponSession) {
      state.user = null;
      localStorage.removeItem('aios_user_profile');
      window.location.href = './index.html?action=login';
    }
  }

  const couponSession = sessionStorage.getItem('aios_coupon_session');
  if (couponSession) {
    try {
      state.user = JSON.parse(couponSession);
    } catch (e) {
      state.user = null;
    }
  } else {
    const storedUser = localStorage.getItem('aios_user_profile');
    if (storedUser) {
      try {
        state.user = JSON.parse(storedUser);
      } catch (e) {
        state.user = null;
      }
    }
  }
  
  updateUserProfileHeader();
  initTrialClock();
  toggleBusinessSectionView();
  initBusinessSimulators();
  
  // Set default workspace or route by URL search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const targetWorkspace = urlParams.get('workspace');
  if (targetWorkspace) {
    switchBusinessWorkspace(targetWorkspace);
  } else {
    switchBusinessWorkspace('dashboard');
  }
  
  // Load live data feeds initially
  loadLiveDashboardMetrics();
  loadLiveBusinessNews();

  // Initialize Business Catalog Grid & Auto-Discovered Videos
  renderBusinessCardsGrid();
  loadDiscoveredVideos();
  updateConversionFunnel(launchpadIdeas['agency'], 0);
  
  // Reload live data feeds every 60 seconds
  setInterval(() => {
    loadLiveDashboardMetrics();
    loadLiveBusinessNews();
  }, 60000);
  
  await initSupabase();
  
  // Close triggers for modals
  const authClose = document.getElementById('auth-modal-close-btn');
  if (authClose) {
    authClose.addEventListener('click', () => {
      const modal = document.getElementById('auth-modal-overlay');
      if (modal) modal.style.display = 'none';
    });
  }

  const couponClose = document.getElementById('coupon-modal-close-btn');
  if (couponClose) {
    couponClose.addEventListener('click', () => {
      const modal = document.getElementById('coupon-modal-overlay');
      if (modal) modal.style.display = 'none';
    });
  }

  const pricingClose = document.getElementById('pricing-modal-close-btn');
  if (pricingClose) {
    pricingClose.addEventListener('click', () => {
      if (state.onboardingPricing) {
        showToast("Please choose a plan to continue.", "warning");
        return;
      }
      const modal = document.getElementById('pricing-modal-overlay');
      if (modal) modal.style.display = 'none';
    });
  }

  const profileClose = document.getElementById('profile-modal-close-btn');
  if (profileClose) {
    profileClose.addEventListener('click', () => {
      const modal = document.getElementById('profile-modal-overlay');
      if (modal) modal.style.display = 'none';
    });
  }
  
  // Custom About platform modal triggers (incorporating methodology description)
  const btnAboutTrigger = document.getElementById('btn-about-trigger');
  const aboutOverlay = document.getElementById('about-bus-modal-overlay');
  if (btnAboutTrigger && aboutOverlay) {
    btnAboutTrigger.addEventListener('click', () => {
      aboutOverlay.style.display = 'flex';
    });
  }
  const btnAboutClose = document.getElementById('btn-about-close');
  const btnAboutCloseBtn = document.getElementById('about-bus-modal-close-btn');
  if (btnAboutClose && btnAboutCloseBtn && aboutOverlay) {
    const closeAbout = () => { aboutOverlay.style.display = 'none'; };
    btnAboutClose.addEventListener('click', closeAbout);
    btnAboutCloseBtn.addEventListener('click', closeAbout);
  }
  
  // Email/Password Auth bindings
  const bESignin = document.getElementById('btn-email-signin');
  if (bESignin) bESignin.addEventListener('click', handleBusEmailSignin);
  const bESignup = document.getElementById('btn-email-signup');
  if (bESignup) bESignup.addEventListener('click', handleBusEmailSignup);

  ['auth-signin-email','auth-signin-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleBusEmailSignin(); });
  });
  ['auth-signup-email','auth-signup-password','auth-signup-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleBusEmailSignup(); });
  });

  const couponTrigger = document.getElementById('btn-auth-coupon-trigger');
  if (couponTrigger) {
    couponTrigger.addEventListener('click', () => {
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) authOverlay.style.display = 'none';
      const couponOverlay = document.getElementById('coupon-modal-overlay');
      if (couponOverlay) couponOverlay.style.display = 'flex';
    });
  }
  
  const couponSubmit = document.getElementById('btn-coupon-submit');
  if (couponSubmit) {
    couponSubmit.addEventListener('click', () => {
      const couponInput = document.getElementById('coupon-input');
      const code = couponInput ? couponInput.value.trim() : '';
      if (code) handleCouponLogin(code);
      else {
        const errorEl = document.getElementById('coupon-error-msg');
        if (errorEl) {
          errorEl.textContent = 'Please enter a coupon code.';
          errorEl.style.display = 'block';
        }
      }
    });
  }

  const obForm = document.getElementById('onboarding-form');
  if (obForm) {
    obForm.addEventListener('submit', handleOnboardingSubmit);
  }

  const pfForm = document.getElementById('profile-edit-form');
  if (pfForm) {
    pfForm.addEventListener('submit', handleProfileSave);
  }

  const pFree = document.getElementById('btn-pricing-free');
  if (pFree) {
    pFree.addEventListener('click', handleChooseFreePlan);
  }

  const pMonthly = document.getElementById('btn-pricing-monthly');
  if (pMonthly) {
    pMonthly.addEventListener('click', () => handlePremiumUpgrade('Premium Monthly', 99));
  }

  const pYearly = document.getElementById('btn-pricing-yearly');
  if (pYearly) {
    pYearly.addEventListener('click', () => handlePremiumUpgrade('Premium Yearly', 999));
  }

  const pCoupon = document.getElementById('btn-pricing-coupon');
  if (pCoupon) {
    pCoupon.addEventListener('click', () => {
      const pricingOverlay = document.getElementById('pricing-modal-overlay');
      if (pricingOverlay) pricingOverlay.style.display = 'none';
      const couponOverlay = document.getElementById('coupon-modal-overlay');
      if (couponOverlay) couponOverlay.style.display = 'flex';
    });
  }

  const pfUpgrade = document.getElementById('btn-pf-upgrade');
  if (pfUpgrade) {
    pfUpgrade.addEventListener('click', () => {
      const profileOverlay = document.getElementById('profile-modal-overlay');
      if (profileOverlay) profileOverlay.style.display = 'none';
      showPricingModal(false);
    });
  }

  // --- First-Visit Onboarding Journey Popup Overlay ---
  const firstVisitOverlay = document.getElementById('first-visit-popup-overlay');
  if (firstVisitOverlay && !localStorage.getItem('aios_business_hub_visited')) {
    firstVisitOverlay.classList.add('active');
  }

  const optLearn = document.getElementById('first-visit-opt-learn');
  if (optLearn) {
    optLearn.addEventListener('click', () => {
      localStorage.setItem('aios_business_hub_visited', 'true');
      if (firstVisitOverlay) firstVisitOverlay.classList.remove('active');
      switchBusinessWorkspace('learn');
    });
  }

  const optBuild = document.getElementById('first-visit-opt-build');
  if (optBuild) {
    optBuild.addEventListener('click', () => {
      localStorage.setItem('aios_business_hub_visited', 'true');
      if (firstVisitOverlay) firstVisitOverlay.classList.remove('active');
      switchBusinessWorkspace('build');
    });
  }

  const optExpand = document.getElementById('first-visit-opt-expand');
  if (optExpand) {
    optExpand.addEventListener('click', () => {
      localStorage.setItem('aios_business_hub_visited', 'true');
      if (firstVisitOverlay) firstVisitOverlay.classList.remove('active');
      switchBusinessWorkspace('grow');
    });
  }
}

/* ---- Auth Tab Switcher ---- */
function switchAuthTab(tab) {
  const signinForm = document.getElementById('auth-form-signin');
  const signupForm = document.getElementById('auth-form-signup');
  const signinTab = document.getElementById('auth-tab-signin');
  const signupTab = document.getElementById('auth-tab-signup');
  if (!signinForm || !signupForm) return;
  if (tab === 'signin') {
    signinForm.style.display = 'flex';
    signupForm.style.display = 'none';
    if (signinTab) { signinTab.style.background = 'var(--bus-primary)'; signinTab.style.color = '#000'; }
    if (signupTab) { signupTab.style.background = 'transparent'; signupTab.style.color = 'var(--bus-text-secondary)'; }
  } else {
    signinForm.style.display = 'none';
    signupForm.style.display = 'flex';
    if (signupTab) { signupTab.style.background = 'var(--bus-primary)'; signupTab.style.color = '#000'; }
    if (signinTab) { signinTab.style.background = 'transparent'; signinTab.style.color = 'var(--bus-text-secondary)'; }
  }
}

async function handleBusEmailSignin() {
  if (window.kinde) {
    window.kinde.login();
  } else {
    window.location.href = '/login';
  }
}

async function handleBusEmailSignup() {
  if (window.kinde) {
    window.kinde.register();
  } else {
    window.location.href = '/register';
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast active ${type}`;
  setTimeout(() => {
    toast.classList.remove('active');
  }, 4000);
}

// Bind methods globally
window.verifyQuizAnswer = verifyQuizAnswer;
window.downloadTemplate = downloadTemplate;

// Vetted Business Catalog dynamic cards rendering
state.discoveredVideos = { build: [], explore: [] };

async function loadDiscoveredVideos() {
  try {
    const res = await fetch('/api/videos');
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        state.discoveredVideos.build = data.buildVideos || [];
        state.discoveredVideos.explore = data.exploreVideos || [];
        console.log("Successfully discovered videos:", state.discoveredVideos);
      }
    }
  } catch (e) {
    console.warn("Auto-discovery API failed. Using static structure fallback.", e);
  }
}

function renderBusinessCardsGrid() {
  const container = document.getElementById('business-cards-grid');
  if (!container) return;
  
  const models = [
    { key: 'agency', icon: '🤖', subtitle: 'Automate boring tasks and emails for local businesses.', video: 'AAA' },
    { key: 'dropservicing', icon: '💼', subtitle: 'Broker premium digital services and outsource to contractors.', video: 'Drop-Servicing_Sprint' },
    { key: 'micro-saas', icon: '⚡', subtitle: 'Launch simple single-purpose tools with monthly subscriptions.', video: 'SaaS' },
    { key: 'creator', icon: '📸', subtitle: 'Build an audience and monetize with templates and sponsorships.', video: 'Content_Engine' },
    { key: 'agency_video_ad', icon: '🎥', subtitle: 'Turn static product photos into high-converting video ads.', video: 'AI_Video_Ad_Pipeline' },
    { key: 'creator_zackd_shorts', icon: '🎬', subtitle: 'Produce viral 3D shorts and bizarre facts videos using AI.', video: 'Motion_Script_Compiler' },
    { key: 'agency_voice_ai', icon: '📞', subtitle: 'Deploy smart voice agents to answer phones for local clinics.', video: 'Inbound_Voice_AI_Studio' },
    { key: 'creator_managed_network', icon: '🤝', subtitle: 'Manage social creators and secure brand sponsorships.', video: 'Managed_Creator_Network' },
    { key: 'creator_kids_animation', icon: '👶', subtitle: 'Produce automated animated children\'s songs and rhymes.', video: 'AI_Nursery_Rhyme_Engine' }
  ];

  container.innerHTML = models.map(m => {
    const idea = launchpadIdeas[m.key];
    const profitRange = idea.retail.profit;
    
    return `
      <div class="business-catalog-card" data-key="${m.key}">
        <div class="card-glow-effect"></div>
        <div class="card-header-row">
          <div class="card-icon-wrapper">${m.icon}</div>
          <span class="card-profit-badge">${profitRange.split(' /')[0]}</span>
        </div>
        <h4 class="card-business-title">${idea.title}</h4>
        <p class="card-business-subtitle">${m.subtitle}</p>
        
        <div class="card-actions-row">
          <button class="card-btn-compile" onclick="selectAndCompileBusiness('${m.key}')">
            <span>Configure</span> ⚙️
          </button>
          <button class="card-btn-video" onclick="handleBusinessVideoPlay('${m.key}', '${m.video}', '${idea.title}')">
            <span>Watch Video</span> ▶
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.selectAndCompileBusiness = function(key) {
  const select = document.getElementById('blueprint-model-select');
  if (select) {
    select.value = key;
    // Scroll to configurator output smoothly
    const configPanel = document.querySelector('.blueprint-workspace');
    if (configPanel) {
      configPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Auto compile
    const compileBtn = document.getElementById('btn-compile-blueprint');
    if (compileBtn) compileBtn.click();
  }
};

window.handleBusinessVideoPlay = function(key, videoBaseName, title) {
  // Check if authenticated
  if (!isUserAuthenticated()) {
    document.getElementById('auth-modal-overlay').style.display = 'flex';
    showToast("Please login first to watch business tutorials.", "warning");
    return;
  }
  
  // Premium lock check
  const isPremium = state.user && (state.user.plan_type === 'Premium' || state.user.plan_type === 'Trial Premium' || state.user.plan_type === 'Trial');
  if (!isPremium) {
    showToast("Upgrade to Premium or start trial to watch tutorials.", "warning");
    showPricingModal(true);
    return;
  }

  // Show Language Selection Modal
  showLanguageSelectionPopup(videoBaseName, title);
};

function showLanguageSelectionPopup(videoBaseName, title) {
  let modal = document.getElementById('premium-lang-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'premium-lang-modal-overlay';
    modal.className = 'auth-modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5,5,8,0.9); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 10000; opacity: 0; transition: opacity 0.2s ease;';
    
    modal.innerHTML = `
      <div class="auth-modal" style="width: 90%; max-width: 400px; background: #0A0A0C; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); text-align: center; font-family: 'Outfit', sans-serif;">
        <span style="font-size: 2.2rem; display: block; margin-bottom: 12px;">🌐</span>
        <h3 style="font-family: 'Space Grotesk', monospace; color: #fff; margin-bottom: 8px; font-weight: 700; font-size: 1.15rem;" id="premium-lang-modal-title">Select Tutorial Language</h3>
        <p style="color: rgba(255,255,255,0.6); font-size: 0.8rem; line-height: 1.5; margin-bottom: 24px;">This premium lecture contains audio tracks in both Hindi and English. Please select your preference.</p>
        
        <div style="display: flex; gap: 12px;">
          <button id="btn-lang-hindi" class="btn btn-secondary btn-full" style="flex: 1; padding: 14px; font-weight: 700; font-family: 'Space Grotesk', monospace; border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); color: #fff; border-radius: 8px; cursor: pointer; transition: all 0.2s;">हिंदी 🇮🇳</button>
          <button id="btn-lang-english" class="btn btn-primary btn-full" style="flex: 1; padding: 14px; font-weight: 700; font-family: 'Space Grotesk', monospace; background: linear-gradient(135deg, #00D084 0%, #2EC5FF 100%); border: none; color: #000; border-radius: 8px; cursor: pointer; transition: all 0.2s;">English 🇺🇸</button>
        </div>
        
        <button id="btn-lang-close" style="background: transparent; border: none; color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-top: 20px; text-decoration: underline; cursor: pointer;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  document.getElementById('premium-lang-modal-title').textContent = `Select Language: ${title}`;

  modal.style.display = 'flex';
  void modal.offsetWidth;
  modal.style.opacity = '1';

  const closePopup = () => {
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; }, 200);
  };

  const btnHindi = document.getElementById('btn-lang-hindi');
  const btnEnglish = document.getElementById('btn-lang-english');
  const btnClose = document.getElementById('btn-lang-close');

  btnHindi.onclick = () => {
    closePopup();
    playVideoForLanguage('hindi');
  };

  btnEnglish.onclick = () => {
    closePopup();
    playVideoForLanguage('eng');
  };

  btnClose.onclick = closePopup;
  modal.onclick = (e) => {
    if (e.target === modal) closePopup();
  };

  function playVideoForLanguage(lang) {
    let filename = `${videoBaseName}_${lang}.mp4`;
    if (state.discoveredVideos && state.discoveredVideos.build && state.discoveredVideos.build.length > 0) {
      const matched = state.discoveredVideos.build.find(f => f.toLowerCase() === filename.toLowerCase());
      if (matched) filename = matched;
    }
    const videoPath = `https://media.ai-os.in/build/${filename}`;
    window.playPremiumVideo(videoPath, `${title} (${lang === 'eng' ? 'English' : 'Hindi'})`);
  }
}

document.addEventListener('DOMContentLoaded', initApp);

const onboardingForm = document.getElementById('onboarding-form');
if (onboardingForm) {
  onboardingForm.addEventListener('submit', handleOnboardingSubmit);
}

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] Service Worker registered.', reg.scope))
      .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
  });
}
