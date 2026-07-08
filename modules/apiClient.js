/**
 * API Client with Dynamic Backend Configuration
 * Uses window.BackendConfig to get backend URL (supports dev/prod)
 */

window.APIClient = class {
  constructor() {
    this.baseURL = null;
    this.initializeBaseURL();
  }

  initializeBaseURL() {
    // Wait for BackendConfig to be initialized
    if (typeof window.BackendConfig !== 'undefined') {
      const url = window.BackendConfig.getBackendURL();
      this.baseURL = url || null;
      console.log('[APIClient] Initialized with:', this.baseURL);
    } else {
      console.warn('[APIClient] BackendConfig not loaded. Will retry...');
      setTimeout(() => this.initializeBaseURL(), 500);
    }
  }

  async request(endpoint, options = {}) {
    // Re-initialize if not set[cite: 33]
    if (!this.baseURL && typeof window.BackendConfig !== 'undefined') {
      this.initializeBaseURL();
    }

    if (!this.baseURL) {
      const error = {
        status: 'offline',
        message: 'Backend not configured. Development: start backend at http://localhost:8080. Production: same-origin fallback active.'
      };
      console.error('[APIClient]', error.message);

      // Show error UI if available[cite: 33]
      if (typeof window.BackendErrorUI !== 'undefined') {
        window.BackendErrorUI.displayBackendError(error);
      }

      throw new Error(error.message);
    }

    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json'
    };

    // CRITICAL SECURITY UPDATE FOR VERCEL SERVERLESS COOKIES:
    // We enforce credentials: 'include' so the browser attaches the secure session_token cookie.
    const fetchOptions = {
      ...options,
      credentials: 'include',
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      console.log(`[APIClient] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[APIClient] Request failed:', error);

      // Show error UI if available[cite: 33]
      if (typeof window.BackendErrorUI !== 'undefined' && typeof window.BackendConfig !== 'undefined') {
        const errorInfo = window.BackendConfig.handleBackendError(error);
        window.BackendErrorUI.displayBackendError(errorInfo);
      }

      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// Export singleton instance[cite: 33]
window.api = new window.APIClient();

// Named export for ES module loaders compatibility[cite: 33]
export async function apiCall(endpoint, options = {}) {
  return window.api.request(endpoint, options);
}