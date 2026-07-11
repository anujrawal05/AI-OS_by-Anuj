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
  const savedTheme = localStorage.getItem('kronos-theme');
  if (savedTheme) {
    state.theme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    state.theme = 'light';
  }
  
  document.documentElement.classList.add('theme-transitioning');
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();
  
  // Force layout reflow to apply theme instantly
  document.documentElement.offsetHeight;
  document.documentElement.classList.remove('theme-transitioning');
}

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

export function toggleTheme() {
  document.documentElement.classList.add('theme-transitioning');
  
  // Force layout reflow to ensure suppression class is computed
  document.documentElement.offsetHeight;
  
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('kronos-theme', state.theme);
  updateThemeIcon();
  
  // Re-draw the road to align colors smoothly
  if (window.drawRoad) {
    window.drawRoad();
  }
  
  // Force layout reflow to paint theme changes instantly
  document.documentElement.offsetHeight;
  
  document.documentElement.classList.remove('theme-transitioning');
}

// Global exposure for backwards compatibility
window.initTheme = initTheme;
window.updateThemeIcon = updateThemeIcon;
window.toggleTheme = toggleTheme;
