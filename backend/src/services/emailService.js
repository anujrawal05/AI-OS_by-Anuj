const fs = require('fs');
const path = require('path');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'arproduction050@gmail.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'AI-OS';

const SUBJECTS = {
  verifyEmail: 'Verify Your Email Address - AI-OS',
  welcome: 'Welcome to AI-OS!',
  forgotPassword: 'Reset Your Password - AI-OS',
  passwordChanged: 'Your AI-OS Password Has Been Changed'
};

function replacePlaceholders(html, variables = {}) {
  let output = html;
  
  const autoVars = {
    YEAR: new Date().getFullYear().toString(),
    BASE_URL: process.env.BASE_URL || 'http://localhost:8080'
  };

  const allVars = { ...autoVars, ...variables };

  for (const [key, value] of Object.entries(allVars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    const stringValue = (value !== undefined && value !== null) ? String(value) : '';
    output = output.replace(regex, stringValue);
  }

  return output;
}

// Helper to mask sensitive email addresses in logs
function maskEmail(email) {
  if (typeof email !== 'string') return email;
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

async function sendEmail(templateName, to, subject, variables = {}) {
  try {
    const emailSubject = subject || SUBJECTS[templateName] || 'Notification from AI-OS';

    // Resolve template path and read contents
    const templatePath = path.join(__dirname, '../emails', `${templateName}.html`);
    let rawHtml;
    try {
      rawHtml = fs.readFileSync(templatePath, 'utf8');
    } catch (readErr) {
      console.error(`[Email Service] Failed to read template file "${templateName}.html":`, readErr.message);
      return { success: false, error: `Template "${templateName}" not found.` };
    }

    // Process variables and placeholders
    const mergedVariables = { EMAIL: to, ...variables };
    const processedHtml = replacePlaceholders(rawHtml, mergedVariables);

    if (!BREVO_API_KEY) {
      const isProd = process.env.NODE_ENV === 'production';
      console.warn(`[Email Service] BREVO_API_KEY is missing. Mock dispatch logic engaged.`);
      if (isProd) {
        console.log(`[Email Service] Mock email to ${maskEmail(to)} with subject "${emailSubject}" simulated (content hidden in production).`);
      } else {
        console.log(`[Email Service] Mock email to ${maskEmail(to)}\nSubject: ${emailSubject}\nContent:\n${processedHtml}`);
      }
      return { success: true, mock: true };
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: EMAIL_FROM_NAME, email: EMAIL_FROM },
        to: [{ email: to }],
        subject: emailSubject,
        htmlContent: processedHtml
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo HTTP Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Email Service] Email "${templateName}" sent successfully to ${maskEmail(to)}. MessageId:`, result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (err) {
    console.error(`[Email Service Error] Failed to send email "${templateName}" to ${maskEmail(to)}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendEmail
};
