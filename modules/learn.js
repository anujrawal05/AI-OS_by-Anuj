// Academy & Learning Module for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';

export function verifyQuizAnswer(btnElement, radioGroupName, expectedValue, explanationText) {
  const container = btnElement.closest('.learn-quiz-box');
  const feedbackBox = container.querySelector('.quiz-feedback-box');
  const selectedRadio = container.querySelector(`input[name="${radioGroupName}"]:checked`);
  
  const isHi = state.language === 'hi';
  const isHng = state.language === 'hinglish';
  
  let correctTitle = "✅ Correct!";
  let incorrectTitle = "❌ Incorrect.";
  let successToast = "Concept check unlocked successfully!";
  let errorToast = "Incorrect answer.";
  let warningToast = "Please select an option before submitting.";

  if (isHi) {
    correctTitle = "✅ सही उत्तर!";
    incorrectTitle = "❌ गलत उत्तर।";
    successToast = "अवधारणा जांच सफलतापूर्वक अनलॉक हो गई!";
    errorToast = "गलत उत्तर।";
    warningToast = "जमा करने से पहले कृपया एक विकल्प चुनें।";
  } else if (isHng) {
    correctTitle = "✅ Correct answer!";
    incorrectTitle = "❌ Incorrect answer.";
    successToast = "Concept check successfully unlock ho gaya!";
    errorToast = "Incorrect answer.";
    warningToast = "Submit karne se pehle please ek option select karein.";
  }

  if (!selectedRadio) {
    showToast(warningToast, "warning");
    return;
  }
  
  feedbackBox.style.display = 'block';
  btnElement.disabled = true;
  
  container.querySelectorAll(`input[name="${radioGroupName}"]`).forEach(input => {
    input.disabled = true;
  });

  if (selectedRadio.value === expectedValue) {
    feedbackBox.style.background = 'rgba(0, 208, 132, 0.1)';
    feedbackBox.style.border = '1px solid rgba(0, 208, 132, 0.3)';
    feedbackBox.style.color = 'var(--bus-primary)';
    feedbackBox.innerHTML = `<strong>${correctTitle}</strong> ${explanationText}`;
    showToast(successToast);
  } else {
    feedbackBox.style.background = 'rgba(255, 74, 74, 0.1)';
    feedbackBox.style.border = '1px solid rgba(255, 74, 74, 0.3)';
    feedbackBox.style.color = '#ff4a4a';
    feedbackBox.innerHTML = `<strong>${incorrectTitle}</strong> ${explanationText}`;
    showToast(errorToast, "error");
  }
}

export function downloadTemplate(templateName) {
  const templates = {
    'business_model_canvas': [
      "==================================================",
      "AI-OS BUSINESS PLATFORM - BUSINESS MODEL CANVAS",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "1. VALUE PROPOSITIONS:",
      "   - What value do we deliver to the customer?",
      "   - Which customer problems are we helping to solve?",
      "",
      "2. CUSTOMER SEGMENTS:",
      "   - For whom are we creating value?",
      "   - Who are our most important customers?",
      "",
      "3. CHANNELS:",
      "   - Through which channels do our customer segments want to be reached?",
      "",
      "4. CUSTOMER RELATIONSHIPS:",
      "   - How do we get, keep, and grow customers?",
      "",
      "5. REVENUE STREAMS:",
      "   - For what value are our customers really willing to pay?",
      "   - How do they pay (subscriptions, commissions, transactional)?",
      "",
      "6. KEY RESOURCES:",
      "   - What key assets are required to deliver our value proposition?",
      "",
      "7. KEY ACTIVITIES:",
      "   - What key operations are required to deliver value?",
      "",
      "8. KEY PARTNERS:",
      "   - Who are our key partners and suppliers?",
      "",
      "9. COST STRUCTURE:",
      "   - What are the most important costs inherent in our business model?",
      "   - What are the COGS and OPEX projections?",
      ""
    ].join('\n'),
    
    'marketing_distribution': [
      "==================================================",
      "AI-OS BUSINESS HUB - MARKETING DISTRIBUTION SHEET",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "CHANNEL LIST & OUTREACH METRIC MATRIX:",
      "",
      "1. COLD OUTBOUND OUTREACH (LinkedIn/Email):",
      "   - Daily Volume Goal: 40 highly targeted decision makers",
      "   - Script Outline: [Observation] + [Friction identified] + [Helpful outcome proof] + [Call to Action]",
      "   - Target Conversion Rate: 10% demo booking rate",
      "",
      "2. ORGANIC CONTENT ENGINE (Short Videos / Reels):",
      "   - Weekly Frequency: 3 videos detailing practical automations",
      "   - Target Platform: YouTube Shorts, TikTok, Instagram Reels, LinkedIn Video",
      "",
      "3. PROGRAMMATIC SEO PIPELINE:",
      "   - Niche Keyword Structure: '[Industry] Automation Service in [City Name]'",
      "   - Target Index Volume: 100 pages generated from template directories",
      "",
      "OUTREACH SCHEDULE TIMELINE:",
      "   - Week 1: Lead list creation (scrape directories for 200 qualified companies)",
      "   - Week 2: Send Loom-based video audits to top 40 prospects",
      "   - Week 3: Initiate secondary follow-up loops on positive replies",
      "   - Week 4: Analyze analytics and optimize script variables"
    ].join('\n'),
    
    'onboarding_automation': [
      "==================================================",
      "AI-OS BUSINESS PLATFORM - ONBOARDING WORKFLOW",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "Intake Flow Automations Trigger Mappings (Make.com/Zapier):",
      "",
      "[Trigger event: Stripe/Razorpay Checkout Captured successfully]",
      "  |",
      "  +--> 1. CREATE client row in Supabase database",
      "  |",
      "  +--> 2. GENERATE Google Drive folder labeled '[Client Name] Workspace'",
      "  |",
      "  +--> 3. RENDER custom Service Agreement contract from template",
      "  |      (Fill variables: client_name, date, setup_price, monthly_retainer)",
      "  |",
      "  +--> 4. SEND automated docu-sign proposal link via email",
      "  |",
      "  +--> 5. ALERT team Slack/Discord room: 'New client [Client Name] active!'"
    ].join('\n'),
    
    'pl_ledger': [
      "==================================================",
      "AI-OS BUSINESS HUB - P&L STATEMENT LEDGER SHEET",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "MONTHLY OPERATING SUMMARY:",
      "",
      "REVENUE:",
      "  - Retainer Services: ____________________ (INR/USD)",
      "  - Transaction Fees: ____________________ (INR/USD)",
      "  - Product Licenses: ____________________ (INR/USD)",
      "  - TOTAL REVENUE: ____________________ (A)",
      "",
      "COST OF GOODS SOLD (COGS):",
      "  - Freelancer Payouts: ____________________",
      "  - API Tokens & Compute: __________________",
      "  - Transaction Gateways: __________________",
      "  - TOTAL COGS: ________________________ (B)",
      "",
      "GROSS PROFIT: ________________________ (A - B = C)",
      "",
      "OPERATING EXPENSES (OPEX):",
      "  - Server Hosting: ____________________",
      "  - CRM & Support Subscriptions: _________",
      "  - Domain Registrations: _______________",
      "  - Marketing & Advertising: ____________",
      "  - TOTAL OPEX: ________________________ (D)",
      "",
      "NET OPERATING PROFIT: __________________ (C - D = NET PROFIT)",
      "NET MARGIN: __________________________ (NET PROFIT / TOTAL REVENUE) * 100"
    ].join('\n'),

    'freelance_contract': [
      "==================================================",
      "AI-OS BUSINESS PLATFORM - SERVICE AGREEMENT CONTRACT",
      "Powered by A.R. Labs",
      "==================================================",
      "",
      "This agreement is made between [Client Business Name] ('Client') and [Your Business/Agency Name] ('Service Provider').",
      "",
      "1. DESCRIPTION OF SERVICES:",
      "   Service Provider will configure and maintain autonomous operations, custom automation pipelines, and AI systems as detailed in the project specifications.",
      "",
      "2. PAYMENT TERMS:",
      "   - Setup Fee: [Setup Price] INR due upon signature of this agreement.",
      "   - Monthly Support Retainer: [Support Price] INR due on the 1st of each calendar month.",
      "",
      "3. INTELLECTUAL PROPERTY:",
      "   All custom scripts, web structures, and automation flows created specifically for the Client will belong to the Client upon full receipt of payment.",
      "",
      "4. LIMITATION OF LIABILITY:",
      "   Service Provider is not liable for indirect, incidental, or consequential damages resulting from operational tool down-time or third-party API rate adjustments.",
      "",
      "Signed,",
      "Service Provider Signature: ______________________ Date: ___________",
      "Client Signature: _______________________________ Date: ___________"
    ].join('\n')
  };

  const content = templates[templateName];
  if (!content) return;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${templateName}_template.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Business template downloaded successfully!");
}

export function initLearnSection() {
  const modCards = document.querySelectorAll('.learn-module-card');
  modCards.forEach(card => {
    const header = card.querySelector('.learn-module-header');
    const body = card.querySelector('.learn-module-body');
    const arrow = card.querySelector('.learn-module-toggle-btn');
    if (header && body && arrow) {
      header.addEventListener('click', () => {
        const isActive = body.style.display === 'block';
        modCards.forEach(c => {
          c.classList.remove('active');
          const b = c.querySelector('.learn-module-body');
          if (b) b.style.display = 'none';
        });
        if (!isActive) {
          card.classList.add('active');
          body.style.display = 'block';
        }
      });
    }
  });
}

// Global exposure for backwards compatibility
window.verifyQuizAnswer = verifyQuizAnswer;
window.downloadTemplate = downloadTemplate;
window.initLearnSection = initLearnSection;
