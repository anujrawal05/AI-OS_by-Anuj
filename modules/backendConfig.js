/**
 * Dynamic Backend Configuration
 * Supports development (localhost:8080), environment variables, and graceful fallback
 */

export const getBackendURL = () => {
  // 1. Check if backend URL is in meta tag (can be injected at build time)
  const metaTag = document.querySelector('meta[name="backend-url"]');
  if (metaTag && metaTag.content && metaTag.content !== 'BACKEND_URL_PLACEHOLDER') {
    console.log('✓ Backend URL from meta tag:', metaTag.content);
    return metaTag.content;
  }

  // 2. Check if window.BACKEND_URL was injected globally
  if (typeof window.BACKEND_URL !== 'undefined' && window.BACKEND_URL) {
    console.log('✓ Backend URL from window:', window.BACKEND_URL);
    return window.BACKEND_URL;
  }

  // 3. Check environment variable (for Vercel deployment)
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BACKEND_URL) {
    console.log('✓ Backend URL from env:', process.env.REACT_APP_BACKEND_URL);
    return process.env.REACT_APP_BACKEND_URL;
  }

  // 4. Development fallback
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✓ Development mode: Using localhost:8080');
    return 'http://localhost:8080';
  }

  // 5. Production without backend - graceful degradation
  console.warn('⚠️ Backend URL not configured. Running in offline mode.');
  return null;
};

export const isBackendAvailable = async () => {
  const backendURL = getBackendURL();
  if (!backendURL) {
    return false;
  }

  try {
    const response = await fetch(`${backendURL}/health`, {
      method: 'GET',
      mode: 'cors',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error.message);
    return false;
  }
};

export const handleBackendError = (error) => {
  if (!getBackendURL()) {
    return {
      status: 'offline',
      message: 'Backend not connected. Ensure backend is running and BACKEND_URL is configured.',
      action: 'Try deploying backend to Railway, Render, or Heroku and add URL to environment variables.'
    };
  }

  if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
    return {
      status: 'cors_error',
      message: 'Backend CORS configuration issue. Check backend CORS settings.',
      action: 'Add your frontend domain to backend CORS whitelist.'
    };
  }

  return {
    status: 'network_error',
    message: error.message,
    action: 'Check if backend is running and accessible.'
  };
};
