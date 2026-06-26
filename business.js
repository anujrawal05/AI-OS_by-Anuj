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

let supabase = null;

// Initialize Supabase Client
async function initSupabase() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (config.supabaseUrl && config.supabaseAnonKey) {
      supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      console.log("Supabase client initialized successfully on Business page.");
      
      // Listen to auth state transitions
      supabase.auth.onAuthStateChange(async (event, session) => {
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
  if (state.user && !state.user.is_coupon && state.user.token) {
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
    if (state.user && state.user.plan_type === 'Premium') {
      btn.style.display = 'block';
      btn.textContent = 'Premium Active';
      btn.style.background = 'linear-gradient(135deg, #00D084 0%, #2EC5FF 100%)';
      btn.style.boxShadow = '0 0 15px rgba(0, 208, 132, 0.4)';
      btn.onclick = () => {
        showToast("Premium Plan active! All enterprise workspaces unlocked.", "info");
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
    
    container.innerHTML = `
      <div style="position: relative; display: flex; align-items: center;">
        <button id="btn-header-profile" class="profile-btn">
          <img src="${avatarToDisplay}" class="profile-avatar" alt="Avatar">
          <span>${nameToDisplay.split(' ')[0]}</span>
        </button>
        <div id="header-profile-dropdown" class="profile-dropdown">
          <div class="profile-dropdown-name">${nameToDisplay}</div>
          <div class="profile-dropdown-email">${state.user.email || ''}</div>
          <div class="profile-dropdown-status ${statusText.toLowerCase() === 'premium' ? 'premium' : ''}">${statusText.toUpperCase()}</div>
          <button id="btn-dropdown-profile" class="workspace-dropdown-item" style="width: 100%; border-radius: 8px;">
            👤 &nbsp; My Profile
          </button>
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
  if (!supabase) {
    showToast("Supabase configuration is not loaded yet.", "error");
    return;
  }
  try {
    state.analytics.loginAttempts++;
    const { error } = await supabase.auth.signInWithOAuth({
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

async function handleSupabaseSession(session) {
  const user = session.user;
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error || !profile || !profile.full_name || !profile.date_of_birth || !profile.gender || !profile.profession) {
      showOnboardingModal(user);
    } else {
      state.user = {
        id: user.id,
        name: profile.full_name,
        email: user.email,
        picture: user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        profession: profile.profession,
        plan_type: profile.plan_type,
        token: session.access_token
      };
      
      localStorage.setItem('aios_user_profile', JSON.stringify(state.user));
      hideAuthModals();
      updateUserProfileHeader();
      toggleBusinessSectionView();
      
      if (profile.plan_type === null || profile.plan_type === undefined) {
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
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: onboardingUser.id,
        email: onboardingUser.email,
        full_name: fullName,
        date_of_birth: dob,
        gender: gender,
        profession: profession,
        plan_type: null,
        updated_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    document.getElementById('onboarding-modal-overlay').style.display = 'none';
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await handleSupabaseSession(session);
    }
  } catch (err) {
    console.error("Onboarding failed:", err.message);
    if (errorEl) {
      errorEl.textContent = 'Onboarding registration failed: ' + err.message;
      errorEl.style.display = 'block';
    }
  }
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

  const options = {
    key: razorpayKey,
    amount: amount * 100,
    currency: 'INR',
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
    if (accountTypeEl) accountTypeEl.textContent = 'Google User';
    if (accessStatusEl) {
      const isPremium = state.user.plan_type === 'Premium';
      accessStatusEl.innerHTML = isPremium ? 'Premium' : 'Basic';
      accessStatusEl.className = isPremium ? 'profile-dropdown-status premium' : 'profile-dropdown-status';
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
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {}
  }
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
  
  const isPremium = state.user && state.user.plan_type === 'Premium';
  
  if (isPremium) {
    if (buildLock) buildLock.style.display = 'none';
    if (expandLock) expandLock.style.display = 'none';
  } else {
    if (buildLock) buildLock.style.display = 'flex';
    if (expandLock) expandLock.style.display = 'flex';
  }
}

// REDESIGNED TAB SWITCHER FUNCTION
function switchBusinessWorkspace(workspaceName) {
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

function initBusinessSimulators() {
  // First Visit Onboarding Popup trigger
  const hasVisited = localStorage.getItem('aios_business_first_visit_done');
  if (!hasVisited) {
    const overlay = document.getElementById('journey-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  // Journey selection buttons
  const journeyCards = document.querySelectorAll('.journey-option-card');
  journeyCards.forEach(card => {
    card.addEventListener('click', () => {
      const journey = card.getAttribute('data-journey');
      localStorage.setItem('aios_business_first_visit_done', 'true');
      document.getElementById('journey-modal-overlay').style.display = 'none';
      switchBusinessWorkspace(journey);
    });
  });

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

  // Custom visual triggers (hero buttons)
  const heroLearn = document.getElementById('btn-hero-learn-cta');
  if (heroLearn) {
    heroLearn.addEventListener('click', () => switchBusinessWorkspace('learn'));
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
      
      if (state.user && state.user.plan_type !== 'Premium') {
        showPricingModal(true);
        showToast("Upgrade to Premium to compile executable blueprints.", "warning");
        return;
      }

      const model = document.getElementById('blueprint-model-select').value;
      const niche = document.getElementById('blueprint-niche-select').value;
      const budget = document.getElementById('blueprint-budget-select').value;

      bOutput.innerHTML = `
        <div style="text-align: center; padding: 60px 0;">
          <span style="display:inline-block; animation: pulse 1.5s infinite; font-size: 2rem;">⏳</span>
          <p style="margin-top: 10px; font-family: var(--font-mono); color: var(--bus-primary);">COMPILING ENTERPRISE LAUNCH BLUEPRINT...</p>
        </div>
      `;

      setTimeout(() => {
        let title = "AI Automation Agency (AAA) Implementation Plan";
        let profit = "₹1,20,000 / month";
        let cost = "₹0 (Bootstrapped)";
        let overhead = "3 hours / order";
        let roadmapSteps = [
          "Establish high-converting landing page showcasing dynamic customer chatbots.",
          "Build modular support agent prototype with clear target instruction parameters.",
          "Link form webhook outputs directly to client email pipelines using Make.com flows.",
          "Initiate customized cold inbound outreach pitches targetting local clinical directories."
        ];
        let promptScript = `Act as an executive business compiler. Create a 3-step value pitch proposal for a local provider in the niche: "${niche}" detailing how custom support agents reduce lead drop-off rates by 70%.`;

        if (model === 'dropservicing') {
          title = "High-Ticket Drop-Servicing Business Blueprint";
          profit = "₹95,000 / month";
          cost = "₹0";
          overhead = "4 hours / order";
          roadmapSteps = [
            "Curate a portfolio of high-demand graphics, copywriting, or video templates.",
            "Generate sample outputs using Midjourney/DALL-E to show client validation.",
            "List service packs on marketplace portals (Upwork, Fiverr) and run cold outreaches.",
            "Delegate raw execution to premium AI tools once order receipts are verified."
          ];
          promptScript = `Write an outcomes-focused design proposal pitching 15 premium marketing creative templates tailored dynamically to client objectives.`;
        } else if (model === 'micro-saas') {
          title = "AI Micro-SaaS Product Launch matrix";
          profit = "₹2,50,000 / month";
          cost = "₹1,200 / month";
          overhead = "Continuous dev";
          roadmapSteps = [
            "Map out a highly specific administrative task (e.g. formatting contracts).",
            "Generate boilerplate single-page script using Cursor or code generation engines.",
            "Integrate OpenAI API key configurations securely in the backend schema.",
            "Incorporate checkout links (Stripe/Razorpay) and post in user directories (ProductHunt)."
          ];
          promptScript = `Act as a senior software architect. Provide secure Node/Express boilerplate code for a dynamic text compiler API calling GPT models.`;
        } else if (model === 'creator') {
          title = "Vertical Content Engine Brand strategy";
          profit = "₹1,50,000 / month";
          cost = "₹0";
          overhead = "3 hours / week";
          roadmapSteps = [
            "Research high-traffic trends within target sector topics.",
            "Draft high-retention vertical script outlines with customized system prompts.",
            "Generate professional voiceover narratives and vertical visual crops.",
            "Include product checkout links in profiles to capture organic conversion rates."
          ];
          promptScript = `Write a viral 45-second vertical video script focused on: "3 Secrets to scaling local clinicial leads using automated voice agents".`;
        }

        bOutput.innerHTML = `
          <div class="blueprint-result-header">
            <span class="blueprint-result-badge">LAUNCHPAD BLUEPRINT V1.0</span>
            <h3 class="blueprint-result-title">${title}</h3>
          </div>
          
          <div class="blueprint-projections-grid">
            <div class="blueprint-proj-card">
              <span class="blueprint-proj-val green">${profit}</span>
              <span class="blueprint-proj-lbl">Projected IRR</span>
            </div>
            <div class="blueprint-proj-card">
              <span class="blueprint-proj-val">${cost}</span>
              <span class="blueprint-proj-lbl">Launch OPEX</span>
            </div>
            <div class="blueprint-proj-card">
              <span class="blueprint-proj-val green">${overhead}</span>
              <span class="blueprint-proj-lbl">Setup Time</span>
            </div>
          </div>

          <h5 class="learn-module-section-title">Launch Roadmap Steps</h5>
          <ol style="margin-left: 20px; color: var(--bus-text-secondary); line-height: 1.7; margin-bottom: 20px; font-size: 0.9rem;">
            ${roadmapSteps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
          </ol>

          <h5 class="learn-module-section-title">Copyable System Prompt</h5>
          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--bus-border); padding: 16px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem; color: #fff; margin-bottom: 16px; position: relative;">
            <p style="margin: 0; line-height: 1.5;">${promptScript}</p>
            <button class="workspace-dropdown-trigger" onclick="navigator.clipboard.writeText(\`${promptScript.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`); showToast('Prompt copied!');" style="margin-top: 12px; padding: 4px 10px; font-size: 0.7rem; border-color: var(--bus-primary);">Copy Prompt</button>
          </div>
        `;
      }, 1000);
    });
  }

  // A.R. Business Strategist Chat & 7-Tab Output Compiler
  const chatInput = document.getElementById('chat-strategist-input');
  const chatSendBtn = document.getElementById('btn-chat-strategist-send');
  const chatLogs = document.getElementById('chat-strategist-logs');
  const outputPanel = document.getElementById('strategist-tabs-panel');
  
  // Strategy tab triggers binding
  const strategTabBtns = document.querySelectorAll('.strategist-tab-btn');
  strategTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-output-tab');
      
      // Update buttons active
      strategTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update pane active
      const panes = document.querySelectorAll('.strategist-tab-pane');
      panes.forEach(p => p.classList.remove('active'));
      const activePane = document.getElementById(`tab-out-${targetTab}`);
      if (activePane) activePane.classList.add('active');
    });
  });

  if (chatInput && chatSendBtn && chatLogs) {
    const handleSend = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      if (!isUserAuthenticated()) {
        document.getElementById('auth-modal-overlay').style.display = 'flex';
        showToast("Please login first to consult the AI strategist.", "warning");
        return;
      }
      
      if (state.user && state.user.plan_type !== 'Premium') {
        showPricingModal(true);
        showToast("Upgrade to Premium to consult A.R. Business Strategist.", "warning");
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

      setTimeout(() => {
        botThinking.remove();
        
        // Generate Dynamic Strategist Responses & Compile all 7 Tabs
        let analysisText = `Based on your query "${text}", the primary operational gap is customer distribution volume. While your core delivery mechanics are valid, your cost-of-acquisition (CAC) is bottlenecked by manual outreach models. System analysis recommends deploying programmatic outbound nodes.`;
        let oppText = "1. AAA Lead Chatbots: Selling conversational booking lead systems to local medical clinics.<br>2. Programmatic Landing Pages: Building highly-scalable programmatic landing pages tailored dynamically to regional keywords.<br>3. Workflow Optimization: Connecting support mail webhooks to automated CRM databases.";
        let autoText = "Integrate Make.com triggers: When a user completes the lead capture page, fire an API call to extract specs, generate a formatted design contract template, and sync coordinates to client dashboard tables instantly.";
        let markText = "Focus on cold outbound messaging on LinkedIn. Deploy automated prospecting systems targetting executive leads, delivering a customized 5-minute Loom demo demonstrating a 60% increase in operations speed.";
        let leadText = "Acquire a corporate directory mailing list. Filter target contacts by position and scale. Set up automated sequence scripts delivering personalized offers and tracking open metrics.";
        let revText = "Shift pricing from time-based margins to outcome-based contracts. Charge a ₹50,000 setup fee + a 10% commission on all new leads generated, dramatically scaling the lifetime value (LTV) metric.";
        let planText = "Days 1-30: Build landing portfolio page and chatbot assets.<br>Days 31-60: Initiate automated cold outbound campaigns pitching 40 contacts daily.<br>Days 61-90: Upsell automated support contracts to existing accounts.";

        const lowText = text.toLowerCase();
        if (lowText.includes('traffic') || lowText.includes('leads') || lowText.includes('visitor')) {
          analysisText = "Traffic bottlenecks are caused by relying on a single channel. Programmatic organic pipelines represent the highest yield. Organic video scripts generated via AI scale impressions at ₹0 expense.";
          oppText = "Deploy viral short video content cycles. Reach out to local directory leads with customized content templates.";
        } else if (lowText.includes('conversion') || lowText.includes('sell') || lowText.includes('sales')) {
          analysisText = "Low conversion rates indicate poor offer validation or lack of trust. Refocus pricing copy around output warranties instead of tool definitions.";
          oppText = "Embed interactive AI chatbots directly on the landing page to resolve user concerns in under 10 seconds.";
        } else if (lowText.includes('scale') || lowText.includes('expand')) {
          analysisText = "Scaling requires removing yourself from daily operations. Delegate product delivery to automated AI code platforms and focus exclusively on client pipeline distribution.";
          planText = "Days 1-15: Integrate Make database webhooks.<br>Days 16-45: Launch scalable ads targeting validated templates.<br>Days 46-90: Delegate support lines to conversational bots.";
        }

        // Fill in the 7 Tabs contents dynamically
        document.getElementById('out-text-analysis').innerHTML = analysisText;
        document.getElementById('out-text-opportunities').innerHTML = oppText;
        document.getElementById('out-text-automation').innerHTML = autoText;
        document.getElementById('out-text-marketing').innerHTML = markText;
        document.getElementById('out-text-leads').innerHTML = leadText;
        document.getElementById('out-text-revenue').innerHTML = revText;
        document.getElementById('out-text-plan').innerHTML = planText;

        // Append Bot Text reply
        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bot';
        botBubble.innerHTML = "Analysis Compiled successfully! I have generated a custom strategy matrix based on your inputs. Please review the <strong>7-tab Strategy Board</strong> below for step-by-step implementation parameters.";
        chatLogs.appendChild(botBubble);
        chatLogs.scrollTop = chatLogs.scrollHeight;

        // Display the 7-Tab Panel
        if (outputPanel) {
          outputPanel.style.display = 'block';
          outputPanel.scrollIntoView({ behavior: 'smooth' });
        }
        
      }, 1200);
    };

    chatSendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
}

async function initApp() {
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
  toggleBusinessSectionView();
  initBusinessSimulators();
  
  await initSupabase();
  
  // Close triggers for modals
  document.getElementById('auth-modal-close-btn').addEventListener('click', () => {
    document.getElementById('auth-modal-overlay').style.display = 'none';
  });
  document.getElementById('coupon-modal-close-btn').addEventListener('click', () => {
    document.getElementById('coupon-modal-overlay').style.display = 'none';
  });
  document.getElementById('pricing-modal-close-btn').addEventListener('click', () => {
    if (state.onboardingPricing) {
      showToast("Please choose a plan to continue.", "warning");
      return;
    }
    document.getElementById('pricing-modal-overlay').style.display = 'none';
  });
  document.getElementById('profile-modal-close-btn').addEventListener('click', () => {
    document.getElementById('profile-modal-overlay').style.display = 'none';
  });
  
  // Custom About platform modal triggers
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
  
  document.getElementById('btn-auth-google').addEventListener('click', handleGoogleLogin);
  document.getElementById('btn-auth-coupon-trigger').addEventListener('click', () => {
    document.getElementById('auth-modal-overlay').style.display = 'none';
    document.getElementById('coupon-modal-overlay').style.display = 'flex';
  });
  
  document.getElementById('btn-coupon-submit').addEventListener('click', () => {
    const code = document.getElementById('coupon-input').value.trim();
    if (code) handleCouponLogin(code);
    else {
      const errorEl = document.getElementById('coupon-error-msg');
      if (errorEl) {
        errorEl.textContent = 'Please enter a coupon code.';
        errorEl.style.display = 'block';
      }
    }
  });

  document.getElementById('onboarding-form').addEventListener('submit', handleOnboardingSubmit);
  document.getElementById('profile-edit-form').addEventListener('submit', handleProfileSave);

  document.getElementById('btn-pricing-free').addEventListener('click', handleChooseFreePlan);
  document.getElementById('btn-pricing-monthly').addEventListener('click', () => handlePremiumUpgrade('Premium Monthly', 99));
  document.getElementById('btn-pricing-yearly').addEventListener('click', () => handlePremiumUpgrade('Premium Yearly', 999));
  document.getElementById('btn-pricing-coupon').addEventListener('click', () => {
    document.getElementById('pricing-modal-overlay').style.display = 'none';
    document.getElementById('coupon-modal-overlay').style.display = 'flex';
  });
  document.getElementById('btn-pf-upgrade').addEventListener('click', () => {
    document.getElementById('profile-modal-overlay').style.display = 'none';
    showPricingModal(false);
  });
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

document.addEventListener('DOMContentLoaded', initApp);
