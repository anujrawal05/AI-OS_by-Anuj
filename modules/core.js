// Core State & Theme Manager for AI-OS
// Powered by A.R. Labs

export const state = {
  theme: 'dark',
  activeFilter: 'all',
  activePlaygroundReset: null,
  audioContext: null,
  currentProgress: 0,
  targetProgress: 0,
  
  viewMode: 'grid',          // 'grid', 'list', 'category'
  sortOption: 'default',     // 'default', 'name-asc', 'name-desc', 'price-low', 'difficulty'
  showFavoritesOnly: false,
  comparisonList: [],         // array of tool IDs (max 3)

  // Discovered video filenames (populated by tutorials.js on init)
  discoveredVideos: {
    build: [],
    explore: []
  },

  // Currently active roadmap goal text (set by explore.js on compile)
  goalText: 'Exploring AI',

  // User state: null until initAuthSystem() populates it from /api/auth/me
  // Do NOT set a default user here — every feature gate depends on this being null for guests.
  user: null,

  analytics: {
    compileRoadmapClicks: 0,
    loginAttempts: 0,
    emailSignIns: 0,
    couponRedemptions: 0,
    roadmapUnlockRate: 0
  },
  translations: null
};

// Expose state globally for backward compatibility
window.state = state;

export function initTheme() {
  state.theme = 'dark';
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('kronos-theme', 'dark');
}

export function updateThemeIcon() {
  // Theme icon updating disabled as light theme has been removed
}

export function toggleTheme() {
  // Theme toggling disabled as light theme has been removed
}

// Global exposure for backwards compatibility
window.initTheme = initTheme;
window.updateThemeIcon = updateThemeIcon;
window.toggleTheme = toggleTheme;
