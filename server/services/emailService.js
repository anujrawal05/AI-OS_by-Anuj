const fs = require('fs');
const path = require('path');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'arproduction050@gmail.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'AI-OS';

// Centralized email subjects mapping
const SUBJECTS = {
  verifyEmail: 'Verify Your Email Address - AI-OS',
  welcome: 'Welcome to AI-OS!',
  forgotPassword: 'Reset Your Password - AI-OS',
  passwordChanged: 'Your AI-OS Password Has Been Changed',
  premiumActivated: 'Your AI-OS Premium Plan is Active!',
  trialStarted: 'Your AI-OS Premium Trial Has Started!',
  paymentSuccess: 'Payment Successful - AI-OS'
};

/**
 * Replace placeholders inside HTML string with matching keys from variables dictionary.
 * Supports standard placeholders and injects {{YEAR}} and {{BASE_URL}} automatically.
 * 
 * @param {string} html 
 * @param {Object} variables 
 * @returns {string}
 */
function replacePlaceholders(html, variables = {}) {
  let output = html;
  
  // Set up automatic variables
  const autoVars = {
    YEAR: new Date().getFullYear().toString(),
    BASE_URL: process.env.BASE_URL || ''
  };

  // Merge user variables with automatic variables
  const allVars = { ...autoVars, ...variables };

  // Loop through variables and replace placeholders of form {{KEY}}
  for (const [key, value] of Object.entries(allVars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    const stringValue = (value !== undefined && value !== null) ? String(value) : '';
    output = output.replace(regex, stringValue);
  }

  return output;
}

/**
 * Send transactional email using local HTML templates and Brevo SDK.
 * 
 * @param {string} templateName Name of the template (e.g. 'verifyEmail')
 * @param {string} to Recipient email
 * @param {string} [subject] Optional subject (falls back to centralized subject mapping)
 * @param {Object} [variables] Optional template variable values
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmail(templateName, to, subject, variables = {}) {
  try {
    // 1. Get Subject (centralized or passed directly)
    const emailSubject = subject || SUBJECTS[templateName] || 'Notification from AI-OS';

    // 2. Resolve template path and read contents
    const templatePath = path.join(__dirname, '../emails', `${templateName}.html`);
    let rawHtml;
    try {
      rawHtml = fs.readFileSync(templatePath, 'utf8');
    } catch (readErr) {
      console.error(`[Email Service] Failed to read template file "${templateName}.html":`, readErr.message);
      return { success: false, error: `Template "${templateName}" not found.` };
    }

    // 3. Process variables and placeholders
    // Automatically make recipient email available in variables
    const mergedVariables = { EMAIL: to, ...variables };
    const processedHtml = replacePlaceholders(rawHtml, mergedVariables);

    // 4. Send via Brevo SDK
    if (!BREVO_API_KEY) {
      console.warn(`[Email Service] BREVO_API_KEY is missing. Printing HTML payload to console instead.`);
      console.log(`To: ${to}\nSubject: ${emailSubject}\nContent:\n${processedHtml}`);
      return { success: true, mock: true };
    }

    // Initialize Brevo Client dynamically
    const { BrevoClient } = require('@getbrevo/brevo');
    const brevo = new BrevoClient({ apiKey: BREVO_API_KEY });

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: emailSubject,
      htmlContent: processedHtml,
      sender: { name: EMAIL_FROM_NAME, email: EMAIL_FROM },
      to: [{ email: to }],
    });

    console.log(`[Email Service] Email "${templateName}" sent successfully to ${to}. MessageId:`, result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (err) {
    console.error(`[Email Service Error] Failed to send email "${templateName}" to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendEmail
};
