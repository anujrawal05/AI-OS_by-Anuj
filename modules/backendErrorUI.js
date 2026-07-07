/**
 * Backend Error UI Handler
 * Shows user-friendly error messages when backend is unavailable
 */

export const showBackendOfflineMessage = () => {
  const offlineDiv = document.createElement('div');
  offlineDiv.id = 'backend-offline-banner';
  offlineDiv.innerHTML = `
    <div style="
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      padding: 15px 20px;
      border-radius: 4px;
      margin: 10px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    ">
      <strong>⚠️ Backend Unavailable</strong>
      <p>Some features require a backend server:</p>
      <ul style="margin: 5px 0; padding-left: 20px;">
        <li>Development: Start backend at <code>http://localhost:8080</code></li>
        <li>Production: Deploy backend to Render, Railway, or Heroku</li>
        <li>Then add backend URL to Vercel environment variables</li>
      </ul>
      <p style="margin: 5px 0; font-size: 12px;">
        See DEPLOYMENT_GUIDE.md for detailed setup instructions
      </p>
    </div>
  `;
  return offlineDiv;
};

export const showCORSErrorMessage = () => {
  const corsDiv = document.createElement('div');
  corsDiv.id = 'cors-error-banner';
  corsDiv.innerHTML = `
    <div style="
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 15px 20px;
      border-radius: 4px;
      margin: 10px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    ">
      <strong>🔒 CORS Error</strong>
      <p>Backend CORS is not properly configured.</p>
      <p style="margin: 5px 0; font-size: 12px;">
        Add your frontend domain to backend CORS whitelist in server configuration.
      </p>
    </div>
  `;
  return corsDiv;
};

export const displayBackendError = (errorInfo, containerId = 'app') {
  const container = document.getElementById(containerId);
  if (!container) return;

  let errorElement;
  if (errorInfo.status === 'offline') {
    errorElement = showBackendOfflineMessage();
  } else if (errorInfo.status === 'cors_error') {
    errorElement = showCORSErrorMessage();
  }

  if (errorElement) {
    container.insertBefore(errorElement, container.firstChild);
  }
};
