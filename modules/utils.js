// Shared Utilities and Translation System for AI-OS
// Powered by A.R. Labs

let cachedToastEl = null;

export function showToast(message, type = "success") {
  if (!cachedToastEl) {
    cachedToastEl = document.getElementById('toast');
  }
  if (!cachedToastEl) return;
  
  let finalMsg = message;
  const state = window.state || {};
  if (state.translations && state.translations.roadmap && state.translations.roadmap.toast) {
    const toastMap = state.translations.roadmap.toast;
    const keyMap = {
      "Added to favorites": "addedFav",
      "Removed from favorites": "removedFav",
      "JSON Prompt generated locally! Proceed to Step 2.": "localGen",
      "JSON Prompt copied to clipboard!": "copied",
      "Copied JSON prompt to clipboard!": "copied",
      "Workflow completed successfully!": "completed",
      "Copied specifications to clipboard!": "specCopied",
      "Master Prompt copied! Opening ChatGPT...": "masterCopied",
      "JSON Prompt generated via Llama 3.3 successfully!": "llamaSuccess",
      "Generated static JSON prompt (Offline Fallback)": "offlineGen",
      "Voice recording canceled.": "voiceCanceled",
      "Removed from comparison": "removedCompare",
      "Cannot compare more than 3 tools simultaneously.": "compareLimit",
      "Added to comparison": "addedCompare"
    };
    const key = keyMap[message];
    if (key && toastMap[key]) {
      finalMsg = toastMap[key];
    }
  }
  
  cachedToastEl.textContent = finalMsg;
  cachedToastEl.className = `toast active ${type}`;
  setTimeout(() => {
    cachedToastEl.className = 'toast';
  }, type === 'error' || type === 'warning' ? 3500 : 2500);
}

export function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function playAudioTelemetry() {
  const state = window.state || {};
  try {
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = state.audioContext;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Core sweeping synth oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 1.2);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc.start(now);
    osc.stop(now + 1.2);

    // Accent beep oscillator
    setTimeout(() => {
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      bOsc.connect(bGain);
      bGain.connect(ctx.destination);
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(1200, ctx.currentTime);
      bGain.gain.setValueAtTime(0.04, ctx.currentTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      bOsc.start();
      bOsc.stop(ctx.currentTime + 0.3);
    }, 400);

  } catch (err) {
    console.warn("Web Audio compilation blocked by browser user policy: ", err);
  }
}

export function getNestedTranslation(obj, path) {
  const result = path.split('.').reduce((acc, part) => acc && acc[part], obj);
  if (result === undefined || result === null || result === '') {
    console.warn(`[i18n Missing Key] "${path}"`);
    return null;
  }
  return result;
}

export function applyTranslations(translations) {
  if (!translations) return;
  
  // Update elements with data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = getNestedTranslation(translations, key);
    if (translation !== null) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        el.innerHTML = translation;
      }
    } else {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = `[Missing: ${key}]`;
      } else {
        el.innerHTML = `[Missing: ${key}]`;
      }
    }
  });

  // Update elements with data-i18n-placeholder specifically
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = getNestedTranslation(translations, key);
    if (translation !== null) {
      el.placeholder = translation;
    } else {
      el.placeholder = `[Missing: ${key}]`;
    }
  });

  // Update elements with data-i18n-title
  const titleElements = document.querySelectorAll('[data-i18n-title]');
  titleElements.forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translation = getNestedTranslation(translations, key);
    if (translation !== null) {
      el.title = translation;
    } else {
      el.title = `[Missing: ${key}]`;
    }
  });
}

export async function loadTranslations(lang) {
  const state = window.state || {};
  const langKey = (lang || 'English').toLowerCase();
  const fileMap = {
    english: 'en',
    hindi: 'hi',
    hinglish: 'hinglish',
    en: 'en',
    hi: 'hi'
  };
  const fileName = fileMap[langKey] || langKey || 'en';
  try {
    const response = await fetch(`/locales/${fileName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load locale file: ${response.statusText}`);
    }
    state.translations = await response.json();
    applyTranslations(state.translations);
    translateLibraryChips();
    
    // Dynamically update parts of the UI that depend on active translations
    if (window.updateComparisonUI) {
      window.updateComparisonUI();
    }
  } catch (err) {
    console.error("Error loading translations:", err);
  }
}

export function translateLibraryChips() {
  const state = window.state || {};
  const libraryFilterChipsContainer = document.getElementById('library-filter-chips');
  if (!libraryFilterChipsContainer) return;
  const chips = libraryFilterChipsContainer.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    const sector = chip.getAttribute('data-chip');
    if (sector === 'all') {
      chip.textContent = (state.translations && state.translations.library && state.translations.library.allSectors) || "All Sectors";
    } else {
      chip.textContent = (state.translations && state.translations.sectors && state.translations.sectors[sector]) || sector;
    }
  });
}

// Global exposure for backwards compatibility with inline HTML events
window.showToast = showToast;
window.escapeHTML = escapeHTML;
window.playAudioTelemetry = playAudioTelemetry;
window.loadTranslations = loadTranslations;
