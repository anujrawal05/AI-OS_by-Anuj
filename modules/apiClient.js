import { getBackendURL, handleBackendError } from './backendConfig.js';

class APIClient {
  constructor() {
    this.baseURL = null;
    this.initializeBaseURL();
  }

  initializeBaseURL() {
    const url = getBackendURL();
    this.baseURL = url || null;
  }

  async request(endpoint, options = {}) {
    if (!this.baseURL) {
      throw new Error(
        'Backend not configured. Please set BACKEND_URL environment variable or configure in meta tag.'
      );
    }

    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders()
    };

    try {
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
      const errorInfo = handleBackendError(error);
      console.error('API Request Failed:', errorInfo);
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
}

export default new APIClient();
