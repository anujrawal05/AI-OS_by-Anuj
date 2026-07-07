import { state } from './core.js';
import { showToast } from './utils.js';

// Detect backend URL — meta tag takes top priority, then same-origin localhost, then same-origin relative default.
function resolveApiBase() {
  // 1. Explicit override via <meta name="api-base-url"> (if configured for cross-origin hosting).
  const metaTag = document.querySelector('meta[name="api-base-url"]');
  if (metaTag && metaTag.content && metaTag.content.trim() !== '') {
    return metaTag.content.trim().replace(/\/$/, '');
  }

  // 2. Local development fallback when frontend and backend are on different ports.
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    if (window.location.port === '3000') {
      return 'http://localhost:3001';
    }
    return window.location.origin;
  }

  // 3. Default fallback: same-origin relative path. This supports deployments where API and frontend share a hostname.
  return '';
}

const API_BASE_URL = resolveApiBase();
const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Log resolved base for debugging production connectivity issues.
if (API_BASE_URL === '__NO_BACKEND__') {
  console.warn(
    '[AI-OS] Backend not configured.\n' +
    'To connect: deploy the backend (Railway / Render / etc.) then set:\n' +
    '  <meta name="api-base-url" content="https://YOUR_BACKEND_URL">\n' +
    'in index.html and aios_buisness.html.'
  );
} else if (API_BASE_URL === '' && !isLocalHost) {
  console.warn('[AI-OS] No api-base-url configured for non-localhost deployment. Backend requests will use same-origin relative paths.');
  console.info('[AI-OS] Backend: same-origin relative path mode');
} else if (API_BASE_URL === '') {
  console.info('[AI-OS] Backend: same-origin relative path mode');
} else {
  console.info(`[AI-OS] Backend: ${API_BASE_URL}`);
}

// Background-only endpoints that should silently fail when no backend
const SILENT_ENDPOINTS = ['/api/auth/me'];

export function isBackendAvailable() {
  return API_BASE_URL !== '__NO_BACKEND__';
}

function showNoBackendBanner() {
  // Only show once
  if (document.getElementById('aios-no-backend-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'aios-no-backend-banner';
  banner.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 1px solid rgba(46,197,255,0.3);
    color: #fff; padding: 14px 24px; border-radius: 12px;
    font-family: monospace; font-size: 0.82rem; z-index: 99999;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    max-width: 520px; text-align: left;
  `;
  banner.innerHTML = `
    <span style="font-size:1.4rem">🔌</span>
    <div>
      <strong style="color:#2EC5FF">Backend not connected</strong><br>
      <span style="color:#aaa">Sign-in &amp; AI features require the backend. 
      <a href="https://github.com/anujrawal05/AI-OS_by-Anuj#backend-setup" 
         target="_blank" style="color:#2EC5FF">Setup guide ↗</a></span>
    </div>
    <button onclick="this.parentElement.remove()" style="
      background:none;border:none;color:#888;font-size:1.2rem;cursor:pointer;margin-left:auto;padding:0 4px;
    ">×</button>
  `;
  document.body.appendChild(banner);
  // Auto-dismiss after 8 seconds
  setTimeout(() => banner.remove(), 8000);
}

export async function apiCall(endpoint, options = {}) {
  // No backend deployed: silently return null for background checks, show banner for interactive calls
  if (API_BASE_URL === '__NO_BACKEND__') {
    const isSilent = SILENT_ENDPOINTS.some(e => endpoint.includes(e));
    if (!isSilent) showNoBackendBanner();
    throw new Error('No backend');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (state.activeCoupon) {
    headers['X-Coupon-Code'] = state.activeCoupon;
  }

  // Enforce session credentials sharing for cookies
  const defaultOptions = {
    ...options,
    headers,
    credentials: 'include'
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // 1. Handling HTTP 401 Unauthorized
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error || "Unauthorized";

      // Clear local session cache for all auth/authenticated flows
      localStorage.removeItem('aios_user_profile');
      sessionStorage.removeItem('aios_coupon_session');
      state.user = null;
      if (window.updateUserProfileHeader) {
        window.updateUserProfileHeader();
      }

      const isSessionCheck = endpoint.includes('/api/auth/me');
      const isSilentAuthEndpoint = endpoint.includes('/api/auth/login') || endpoint.includes('/api/auth/verify-otp') || endpoint.includes('/api/auth/reset-password');

      if (!isSessionCheck && !isSilentAuthEndpoint) {
        const authOverlay = document.getElementById('auth-modal-overlay');
        if (authOverlay) authOverlay.style.display = 'flex';
        showToast("Your session has expired. Please sign in again.", "warning");
      }

      const authError = new Error(errMsg);
      authError.status = 401;
      throw authError;
    }

    // 2. Handling HTTP 403 Forbidden
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      
      // Email verification required — pass through so auth.js can show the OTP screen
      if (errorData.emailVerificationRequired) {
        const authError = new Error("Email verification required");
        authError.status = 403;
        throw authError;
      }
      
      // Premium subscription gate
      if (errorData.subscriptionRequired) {
        const pricingOverlay = document.getElementById('pricing-modal-overlay');
        if (pricingOverlay) pricingOverlay.style.display = 'flex';
        showToast("Premium subscription required for this feature.", "warning");
      } else {
        showToast(errorData.error || "Access Denied.", "error");
      }
      const authError = new Error(errorData.error || "Forbidden");
      authError.status = 403;
      throw authError;
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
    let formattedErr = err;
    if (err.message === 'Failed to fetch' || err.message === 'Load failed' || err instanceof TypeError) {
      formattedErr = new Error("Backend unavailable or network error. Please verify the server is running.");
    }
    if (formattedErr.message !== "Unauthorized" && formattedErr.message !== "Forbidden") {
      console.error(`[API Client Error] Call to ${endpoint} failed:`, formattedErr.message);
    }
    throw formattedErr;
  }
}

window.apiCall = apiCall;

