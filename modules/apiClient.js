import { showToast } from './utils.js';

const API_BASE_URL = ''; // Direct relative routing to leverage shared ports

export async function apiCall(endpoint, options = {}) {
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
      // Clear local session storage
      localStorage.removeItem('aios_user_profile');
      sessionStorage.removeItem('aios_coupon_session');
      window.state.user = null;
      
      if (window.updateUserProfileHeader) {
        window.updateUserProfileHeader();
      }

      // Display the sign-in modal
      const authOverlay = document.getElementById('auth-modal-overlay');
      if (authOverlay) {
        authOverlay.style.display = 'flex';
      }
      
      showToast("Your session has expired. Please sign in again.", "warning");
      throw new Error("Unauthorized");
    }

    // 2. Handling HTTP 403 Forbidden (Gated premium features)
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.subscriptionRequired) {
        const pricingOverlay = document.getElementById('pricing-modal-overlay');
        if (pricingOverlay) {
          pricingOverlay.style.display = 'flex';
        }
        showToast("Premium subscription required for this feature.", "warning");
      } else {
        showToast(errorData.error || "Access Denied.", "error");
      }
      throw new Error(errorData.error || "Forbidden");
    }

    // 3. Handling HTTP 429 Too Many Requests (Quotas limits)
    if (response.status === 429) {
      const errorData = await response.json().catch(() => ({}));
      showToast(errorData.error || "Limit exceeded. Please try again later.", "warning");
      return { success: false, quotaExceeded: true, quota: errorData.quota };
    }

    // 4. Handle other error codes (400, 404, 500)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error || `HTTP error! status: ${response.status}`;
      showToast(errMsg, "error");
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
