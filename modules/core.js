// Core State & Theme Manager for AI-OS
// Powered by A.R. Labs

export const state = {
  theme: 'dark',
  activeFilter: 'all',
  activePlaygroundReset: null,
  audioContext: null,
  currentProgress: 0,
  targetProgress: 0,

  viewMode: 'grid',          // Options: 'grid', 'list', 'category'
  sortOption: 'default',     // Options: 'default', 'name-asc', 'name-desc', 'price-low', 'difficulty'
  showFavoritesOnly: false,
  comparisonList: [],         // Array of tool IDs (max 3)

  // Discovered video filenames (populated by tutorials.js on initialization)
  discoveredVideos: {
    build: [],
    explore: []
  },

  // Currently active roadmap goal text (dynamically updated by explore.js on compilation)
  goalText: 'Exploring AI',

  // CORRECTED: Fixed from mock demo credentials to null for absolute, real-time database verification loop tracking
  user: null,

  analytics: {
    compileRoadmapClicks: 0,
    emailSignIns: 0,
    couponRedemptions: 0
  },
  activeWorkspace: 'dashboard'
};

/**
 * Initializes and paints the application design theme on first window draw
 */
export function initTheme() {
  const savedTheme = localStorage.getItem('kronos-theme') || 'dark';
  state.theme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon();
}

/**
 * Updates individual SVG vectors matching active theme profiles
 */
export function updateThemeIcon() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');
  if (!sunIcon || !moonIcon) return;

  if (state.theme === 'light') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

/**
 * Toggles viewport styling modes seamlessly without causing interface layout flicker
 */
export function toggleTheme() {
  document.documentElement.classList.add('theme-transitioning');

  // Force browser layout engine reflow to paint transition rules
  document.documentElement.offsetHeight;

  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('kronos-theme', state.theme);
  updateThemeIcon();

  // Re-draw dynamic background components if active on viewport canvas
  if (window.drawRoad) {
    window.drawRoad();
  }

  document.documentElement.offsetHeight;
  document.documentElement.classList.remove('theme-transitioning');
}

// Global window exposure to handle legacy raw inline script references safely
window.initTheme = initTheme;
window.toggleTheme = toggleTheme;