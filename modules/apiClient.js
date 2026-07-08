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
    // Re-initialize if not set
    if (!this.baseURL && typeof window.BackendConfig !== 'undefined') {
      this.initializeBaseURL();
    }

    if (!this.baseURL) {
      const error = {
        status: 'offline',
        message: 'Backend not configured. Development: start backend at http://localhost:8080. Production: add REACT_APP_BACKEND_URL to Vercel env vars.'
      };
      console.error('[APIClient]', error.message);
      
      // Show error UI if available
      if (typeof window.BackendErrorUI !== 'undefined') {
        window.BackendErrorUI.displayBackendError(error);
      }
      
      throw new Error(error.message);
    }

    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders()
    };

    try {
      console.log(`[APIClient] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[APIClient] Request failed:', error);
      
      // Show error UI if available
      if (typeof window.BackendErrorUI !== 'undefined' && typeof window.BackendConfig !== 'undefined') {
        const errorInfo = window.BackendConfig.handleBackendError(error);
        window.BackendErrorUI.displayBackendError(errorInfo);
      }
      
      throw error;
    }
  }

  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
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

// Export singleton instance
window.api = new window.APIClient();

// Named export for ES module loaders compatibility
export async function apiCall(endpoint, options = {}) {
  return window.api.request(endpoint, options);
}
