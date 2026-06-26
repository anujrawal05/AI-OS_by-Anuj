// Standalone AI-OS Business Logic Script
// Powered by A.R. Labs

const state = {
  user: null,
  onboardingPricing: false,
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
  if (ctaBtn) {
    if (state.user && state.user.plan_type === 'Premium') {
      ctaBtn.style.display = 'block';
      ctaBtn.textContent = 'Premium Active';
      ctaBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
      ctaBtn.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.3)';
      ctaBtn.onclick = () => {
        showToast("You are currently on the Premium Plan! Full access unlocked.", "info");
      };
    } else {
      ctaBtn.style.display = 'block';
      ctaBtn.textContent = 'Upgrade To Premium';
      ctaBtn.style.background = 'linear-gradient(135deg, #ff007f, #7f00ff)';
      ctaBtn.style.boxShadow = '0 0 15px rgba(127, 0, 255, 0.4)';
      ctaBtn.onclick = () => showPricingModal(false);
    }
  }
  
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
          <button id="btn-dropdown-profile" class="profile-dropdown-item" style="width: 100%; text-align: left; background: transparent; border: none; color: #fff; padding: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
            👤 <span>My Profile</span>
          </button>
          <button id="btn-dropdown-logout" class="profile-dropdown-logout" style="margin-top: 10px;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
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
      <button id="btn-header-signin" class="profile-btn" style="border-radius: 20px; background: rgba(255, 255, 255, 0.05); border-color: var(--border-color);">
        🔑 <span>Sign In</span>
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
      color: '#7f00ff'
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
      accessStatusEl.className = 'badge-access premium-badge';
    }
  } else {
    if (accountTypeEl) accountTypeEl.textContent = 'Google User';
    if (accessStatusEl) {
      const isPremium = state.user.plan_type === 'Premium';
      accessStatusEl.innerHTML = isPremium ? 'Premium' : 'Basic';
      accessStatusEl.className = isPremium ? 'badge-access premium-badge' : 'badge-access basic-badge';
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

function initBusinessSimulators() {
  const chosen = localStorage.getItem('aios_business_journey');
  if (!chosen) {
    const modal = document.getElementById('journey-modal-overlay');
    if (modal) modal.style.display = 'flex';
  }

  const journeyCards = document.querySelectorAll('.journey-option-card');
  journeyCards.forEach(card => {
    card.addEventListener('click', () => {
      const journey = card.getAttribute('data-journey');
      localStorage.setItem('aios_business_journey', journey);
      document.getElementById('journey-modal-overlay').style.display = 'none';
      switchBusinessTab(journey);
    });
  });

  const tabBtns = document.querySelectorAll('.business-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchBusinessTab(tab);
    });
  });

  function switchBusinessTab(tabName) {
    const btns = document.querySelectorAll('.business-tab-btn');
    btns.forEach(b => {
      if (b.getAttribute('data-tab') === tabName) b.classList.add('active');
      else b.classList.remove('active');
    });

    const panes = document.querySelectorAll('.business-tab-pane');
    panes.forEach(p => p.classList.remove('active'));

    const targetPane = document.getElementById(`pane-bus-${tabName}`);
    if (targetPane) targetPane.classList.add('active');
  }

  document.getElementById('btn-hero-learn').addEventListener('click', () => switchBusinessTab('learn'));
  document.getElementById('btn-hero-build').addEventListener('click', () => switchBusinessTab('build'));
  document.getElementById('btn-hero-expand').addEventListener('click', () => switchBusinessTab('expand'));
  document.getElementById('btn-skip-basics').addEventListener('click', () => switchBusinessTab('build'));

  // Learn modules collapsible
  const modCards = document.querySelectorAll('.learn-module-card');
  modCards.forEach(card => {
    const header = card.querySelector('.learn-module-header');
    const body = card.querySelector('.learn-module-body');
    const arrow = card.querySelector('.learn-module-toggle-btn');
    if (header && body && arrow) {
      header.addEventListener('click', () => {
        const isActive = body.classList.contains('active');
        modCards.forEach(c => {
          c.classList.remove('active');
          c.querySelector('.learn-module-body').classList.remove('active');
          c.querySelector('.learn-module-toggle-btn').textContent = '▲';
        });
        if (!isActive) {
          card.classList.add('active');
          body.classList.add('active');
          arrow.textContent = '▼';
        }
      });
    }
  });

  // Blueprint Compiler
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
        <div style="text-align: center; padding: 40px 0;">
          <span style="display:inline-block; animation: pulse 1.5s infinite; font-size: 2rem;">⏳</span>
          <p style="margin-top: 10px; font-family: var(--font-mono);">COMPILING BUSINESS BLUEPRINT MATRIX...</p>
        </div>
      `;

      setTimeout(() => {
        let title = "AI Automation Agency Startup Guide";
        let profit = "₹1,20,000 / month";
        let cost = "₹0 (Bootstrapped)";
        let overhead = "3 hours / order";
        let roadmapSteps = [
          "Set up digital domain & lead capture page using AI landing page generators.",
          "Build specialized customer-support chat agent with system instructions for target niche.",
          "Configure CRM sync integrations to forward lead logs directly to client email.",
          "Launch cold-outreach system sending 30 AI-tailored proposals daily."
        ];
        let promptScript = `You are a growth consultant for a local business in the niche: "${niche}". Write a highly persuasive 3-step automation proposal demonstrating how integrating AI support agents reduces support resolution times by 75% and scales booking leads.`;

        if (model === 'dropservicing') {
          title = "High-Ticket Drop-Servicing Agency Blueprint";
          profit = "₹95,000 / month";
          cost = "₹0";
          overhead = "4 hours / order";
          roadmapSteps = [
            "Select high-demand digital services (e.g. copywriting, graphic templates, translations).",
            "Generate sample outputs using Midjourney/ChatGPT to showcase in your portfolio.",
            "List services on marketplaces (Fiverr, Upwork) and run automated social outreach.",
            "Once an order is received, generate output via AI, polish manually, and deliver."
          ];
          promptScript = `Write a professional client proposal for a digital design service offering 10 high-converting marketing creatives generated using Midjourney, including composition prompts.`;
        } else if (model === 'micro-saas') {
          title = "Niche AI Micro-SaaS Product Launch Blueprint";
          profit = "₹2,50,000 / month";
          cost = "₹1,200 / month";
          overhead = "Flexible development";
          roadmapSteps = [
            "Identify a single repetitive task (e.g. converting transcripts to blog posts).",
            "Build a lightweight Single Page App using AI coding assistants (Bolt.new, Cursor).",
            "Connect OpenAI/OpenRouter API key on the backend to execute the prompt.",
            "Integrate Stripe/Razorpay pricing buttons and share in product communities (ProductHunt, Reddit)."
          ];
          promptScript = `Act as a senior software architect. Provide a clean project structure and index.js boilerplates to fetch API models and process simple text-expander queries.`;
        } else if (model === 'creator') {
          title = "Automated Content Engine & Brand Blueprint";
          profit = "₹1,50,000 / month";
          cost = "₹0";
          overhead = "3 hours / week";
          roadmapSteps = [
            "Use AI outline tools to research trending topics in the selected industry.",
            "Generate video scripts and marketing hooks using tailored tone instructions.",
            "Batch-produce vertical video content utilizing voice generators and auto-subtitles.",
            "Drive viewers to a premium sponsor link or digital product storefront."
          ];
          promptScript = `Write a high-retention viral vertical video script about: "3 Secrets to scaling retail business automation using AI". Make it energetic, beginner-friendly and under 60 seconds.`;
        }

        bOutput.innerHTML = `
          <div class="blueprint-result-header">
            <span class="blueprint-result-badge">ACTIVE BLUEPRINT</span>
            <h3 class="blueprint-result-title">${title}</h3>
          </div>
          
          <div class="blueprint-projections-grid">
            <div class="blueprint-proj-card">
              <span class="blueprint-proj-val green">${profit}</span>
              <span class="blueprint-proj-lbl">Projected Revenue</span>
            </div>
            <div class="blueprint-proj-card">
              <span class="blueprint-proj-val">${cost}</span>
              <span class="blueprint-proj-lbl">Setup Cost</span>
            </div>
            <div class="blueprint-proj-card">
              <span class="blueprint-proj-val green">${overhead}</span>
              <span class="blueprint-proj-lbl">Overhead / Time</span>
            </div>
          </div>

          <h5 class="learn-module-section-title">Launch Roadmap Steps</h5>
          <ol style="margin-left: 20px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
            ${roadmapSteps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
          </ol>

          <h5 class="learn-module-section-title">Copyable Prompt Script</h5>
          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.82rem; color: #fff; margin-bottom: 16px; position: relative;">
            <p style="margin: 0; line-height: 1.4;">${promptScript}</p>
            <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(\`${promptScript.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`); showToast('Prompt copied to clipboard!');" style="margin-top: 10px; padding: 4px 8px; font-size: 0.75rem;">Copy Prompt</button>
          </div>
        `;
      }, 1000);
    });
  }

  // Strategy Chatbot
  const chatInput = document.getElementById('chat-strategist-input');
  const chatSendBtn = document.getElementById('btn-chat-strategist-send');
  const chatLogs = document.getElementById('chat-strategist-logs');
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

      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble user';
      userBubble.textContent = text;
      chatLogs.appendChild(userBubble);
      chatInput.value = '';
      chatLogs.scrollTop = chatLogs.scrollHeight;

      const botThinking = document.createElement('div');
      botThinking.className = 'chat-bubble bot';
      botThinking.innerHTML = `<span>Thinking...</span>`;
      chatLogs.appendChild(botThinking);
      chatLogs.scrollTop = chatLogs.scrollHeight;

      setTimeout(() => {
        botThinking.remove();
        
        let response = "I have analyzed your query. To optimize your business model, consider implementing high-ticket pricing models, refining your unit economics (CAC to LTV), and automating operational content engines to scale client acquisition.";
        const lowText = text.toLowerCase();
        
        if (lowText.includes('traffic') || lowText.includes('visitors')) {
          response = "To scale traffic, set up a programmatic SEO system or an automated vertical video engine to post daily content. This organic funnel consistently drives leads with ₹0 direct advertising spend.";
        } else if (lowText.includes('conversion') || lowText.includes('convert') || lowText.includes('sales')) {
          response = "A 2.8% conversion rate is decent. To optimize this, embed an interactive AI consultant widget directly on the landing page to answer visitor queries instantly, and run dynamic pricing tests.";
        } else if (lowText.includes('budget') || lowText.includes('money') || lowText.includes('cost')) {
          response = "With a limited budget, focus exclusively on drop-servicing or AI automation services. Use free tiers of automation tools (like Make.com, Supabase, Vercel) to keep fixed costs at ₹0.";
        } else if (lowText.includes('marketing') || lowText.includes('ads') || lowText.includes('leads')) {
          response = "For client acquisition, set up email scripts tailored dynamically to the prospects' website gaps. Offering a free 5-minute automated support demo is the highest converting lead-magnet.";
        }

        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bot';
        botBubble.innerHTML = response;
        chatLogs.appendChild(botBubble);
        chatLogs.scrollTop = chatLogs.scrollHeight;
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
