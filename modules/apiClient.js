import { state } from './core.js';
import { showToast } from './utils.js';

// Detect backend URL: use same-origin on localhost, else read from <meta name="api-base-url"> or env
function resolveApiBase() {
  const host = window.location.hostname;
  // Running on localhost or 127.0.0.1 → backend is on same port via Express static serving
  if (host === 'localhost' || host === '127.0.0.1') {
    return '';
  }
  // On Vercel or any other deployment → check for a meta tag override first
  const metaTag = document.querySelector('meta[name="api-base-url"]');
  if (metaTag && metaTag.content) {
    return metaTag.content.replace(/\/$/, '');
  }
  // Default fallback — no backend deployed yet
  return '__NO_BACKEND__';
}

const API_BASE_URL = resolveApiBase();

export async function apiCall(endpoint, options = {}) {
  // Guard: backend not deployed on this host
  if (API_BASE_URL === '__NO_BACKEND__') {
    const msg = 'Backend not connected. Please run the app locally or wait for a deployed backend.';
    showToast(msg, 'error');
    throw new Error(msg);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  // Enforce session credentials sharing for cookies
  const defaultOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include'
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // 1. Handling HTTP 401 Unauthorized
    if (response.status === 401) {
      // Clear local session cache
      localStorage.removeItem('aios_user_profile');
      sessionStorage.removeItem('aios_coupon_session');
      state.user = null;
      
      if (window.updateUserProfileHeader) {
        window.updateUserProfileHeader();
      }

      // Don't show toast or open modal for background session checks
      const isBackgroundCheck = endpoint.includes('/api/auth/me') || endpoint.includes('/api/auth/login');
      if (!isBackgroundCheck) {
        const authOverlay = document.getElementById('auth-modal-overlay');
        if (authOverlay) authOverlay.style.display = 'flex';
        showToast("Your session has expired. Please sign in again.", "warning");
      }
      
      throw new Error("Unauthorized");
    }

    // 2. Handling HTTP 403 Forbidden
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      
      // Email verification required — pass through so auth.js can show the OTP screen
      if (errorData.emailVerificationRequired) {
        throw new Error("Email verification required");
      }
      
      // Premium subscription gate
      if (errorData.subscriptionRequired) {
        const pricingOverlay = document.getElementById('pricing-modal-overlay');
        if (pricingOverlay) pricingOverlay.style.display = 'flex';
        showToast("Premium subscription required for this feature.", "warning");
      } else {
        showToast(errorData.error || "Access Denied.", "error");
      }
      throw new Error(errorData.error || "Forbidden");
    }

    // 3. Handling HTTP 429 Too Many Requests (quota limits)
    if (response.status === 429) {
      const errorData = await response.json().catch(() => ({}));
      showToast(errorData.error || "Limit exceeded. Please try again later.", "warning");
      return { success: false, quotaExceeded: true, quota: errorData.quota };
    }

    // 4. Handle other error codes (400, 404, 500)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errMsg);
    }

    return await response.json();

  } catch (err) {
    if (err.message !== "Unauthorized" && err.message !== "Forbidden") {
      console.error(`[API Client Error] Call to ${endpoint} failed:`, err.message);
    }
    throw err;
  }
}

window.apiCall = apiCall;

