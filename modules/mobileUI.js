// Mobile UI Controller for AI-OS
// Powered by A.R. Labs
//
// Provides the native-app-style mobile header + bottom navigation behavior
// for <=767px viewports (see mobile.css). This module NEVER duplicates
// business logic - it only relocates existing elements and calls existing
// global functions (window.showProfileModal, window.switchBusinessWorkspace,
// the existing hamburger-drawer toggle, etc.) so mobile and desktop always
// share the exact same underlying behavior. Desktop DOM/behavior is fully
// restored the moment the viewport leaves the mobile breakpoint.

const MOBILE_MQ = '(max-width: 767px)';

function watchBreakpoint(mq, onChange) {
  onChange(mq.matches);
  if (mq.addEventListener) {
    mq.addEventListener('change', (e) => onChange(e.matches));
  } else if (mq.addListener) {
    // Safari <14 fallback
    mq.addListener((e) => onChange(e.matches));
  }

  // Belt-and-suspenders: some environments (emulated viewport resizes,
  // certain WebViews) don't reliably fire MediaQueryList 'change' events.
  // A plain debounced window resize listener that re-reads mq.matches
  // fresh guarantees the layout is always correct regardless of how the
  // viewport changed.
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => onChange(mq.matches), 120);
  });
}

export function initMobileUI() {
  const mq = window.matchMedia(MOBILE_MQ);

  // --- Relocate the existing profile avatar/dropdown widget into the new
  // mobile header at mobile widths, and restore it to its exact original
  // desktop position when leaving mobile widths. The widget's own logic
  // (dropdown open/close, Settings/Profile, Admin, Sign Out) is untouched -
  // only its DOM position moves.
  const userProfileHeader = document.getElementById('user-profile-header');
  const mobileHeaderActions = document.getElementById('mobile-header-actions');
  let originalParent = null;
  let originalNextSibling = null;

  if (userProfileHeader) {
    originalParent = userProfileHeader.parentElement;
    originalNextSibling = userProfileHeader.nextElementSibling;
  }

  watchBreakpoint(mq, (isMobile) => {
    if (!userProfileHeader || !mobileHeaderActions) return;
    if (isMobile) {
      mobileHeaderActions.appendChild(userProfileHeader);
    } else if (originalParent) {
      originalParent.insertBefore(userProfileHeader, originalNextSibling);
    }
  });

  // --- Mobile header "Menu" button (index.html only) directly toggles the
  // same nav/overlay/hamburger classes the desktop handler uses. We cannot
  // simply proxy to hamburger-toggle.click() because .app-header has its
  // visual display suppressed on mobile (position:absolute / visibility:hidden)
  // which would prevent a display:none parent from rendering the fixed nav.
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const mainNav = document.querySelector('.main-nav');
      const mobileOverlay = document.getElementById('mobile-nav-overlay');
      const hamburger = document.getElementById('hamburger-toggle');
      if (mainNav) mainNav.classList.toggle('mobile-active');
      if (mobileOverlay) mobileOverlay.classList.toggle('active');
      if (hamburger) hamburger.classList.toggle('active');
    });
  }

  // --- Bottom nav "Profile" tab opens the existing profile modal directly.
  const mobileNavProfile = document.getElementById('mobile-nav-profile');
  if (mobileNavProfile) {
    mobileNavProfile.addEventListener('click', () => {
      if (window.showProfileModal) window.showProfileModal();
    });
  }

  // --- Bottom nav workspace tabs (aios_buisness.html only) reuse the
  // existing workspace switcher - zero duplicated pane-switch logic.
  document.querySelectorAll('.mobile-nav-tab[data-workspace]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const workspace = tab.getAttribute('data-workspace');
      if (window.switchBusinessWorkspace) window.switchBusinessWorkspace(workspace);
    });
  });

  // Compact expandable "How To Execute" onboarding guide (mobile only -
  // on desktop/tablet the box is never given the `expanded`/collapsed
  // treatment since mobile.css is not loaded there).
  const onboardingBox = document.getElementById('onboarding-guide-box');
  const onboardingToggle = document.getElementById('onboarding-guide-toggle');
  if (onboardingBox && onboardingToggle) {
    onboardingToggle.addEventListener('click', () => {
      const isExpanded = onboardingBox.classList.toggle('expanded');
      onboardingToggle.setAttribute('aria-expanded', String(isExpanded));
      const label = onboardingToggle.querySelector('.onboarding-guide-toggle-label');
      if (label) label.textContent = isExpanded ? 'Hide guide' : 'Show guide';
    });
  }

  initModalBottomSheetSwipe(mq);
  initEscapeKeyClose();
}

// All app modals (auth/coupon/profile/pricing/onboarding/trial/business-popup/
// journey) already render as a shared overlay + card pair (.auth-modal-overlay
// > .auth-modal-card, .journey-modal-overlay > .journey-modal-card, etc). On
// mobile, mobile.css alone re-docks those cards to the bottom of the screen
// as native-style sheets. This function ONLY adds the swipe-to-close touch
// gesture on top of that - it never opens/closes anything itself except by
// invoking each modal's own existing close control (or, absent one, the same
// `display: none` idiom every modal already uses to close), so no dialog's
// open/close business logic is duplicated.
function initModalBottomSheetSwipe(mq) {
  const OVERLAY_SELECTOR = '.auth-modal-overlay, .journey-modal-overlay, .business-popup-overlay';
  const CARD_SELECTOR = '.auth-modal-card, .auth-modal, .journey-modal-card, .business-popup-card';
  const CLOSE_SELECTOR = '.auth-modal-close-btn, .hotstar-close-btn, [id$="-close-btn"]';
  const DRAG_ZONE_PX = 60; // only the sheet's top "handle" area starts a close-drag
  const CLOSE_THRESHOLD_PX = 90;

  function closeOverlay(overlay) {
    const closeBtn = overlay.querySelector(CLOSE_SELECTOR);
    if (closeBtn) {
      closeBtn.click();
    } else {
      overlay.style.display = 'none';
      overlay.classList.remove('active');
    }
  }

  let card = null;
  let overlay = null;
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    if (!mq.matches) return;
    const target = e.target.closest(CARD_SELECTOR);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (e.touches[0].clientY - rect.top > DRAG_ZONE_PX) return;
    card = target;
    overlay = card.closest(OVERLAY_SELECTOR);
    startY = e.touches[0].clientY;
    card.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!card) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) card.style.transform = `translateY(${dy}px)`;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!card) return;
    const dy = e.changedTouches[0].clientY - startY;
    card.style.transition = '';
    if (dy > CLOSE_THRESHOLD_PX && overlay) {
      card.style.transform = 'translateY(100%)';
      const closedCard = card;
      const closedOverlay = overlay;
      setTimeout(() => {
        closeOverlay(closedOverlay);
        closedCard.style.transform = '';
      }, 200);
    } else {
      card.style.transform = '';
    }
    card = null;
    overlay = null;
  });
}

// Generic Escape-to-close for every dismissible dialog on the page (auth/
// coupon/pricing/profile/reset-password overlays plus the drawer-style
// detail/comparison/legal panels). Reuses each dialog's own close control -
// or, for the aria-hidden drawer pattern, its aria-hidden flag - so no
// dialog's open/close logic is duplicated here. Forced-choice dialogs that
// ship with no close button by design (onboarding, trial-welcome, the video
// roadmap-format choice, the business journey picker) are intentionally left
// untouched - they require an explicit choice, so Escape must not offer a
// silent way to skip them.
function initEscapeKeyClose() {
  const CLOSE_SELECTOR = '.auth-modal-close-btn, .hotstar-close-btn, [id$="-close-btn"]';

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    document.querySelectorAll('[role="dialog"]').forEach((dialog) => {
      if (dialog.getAttribute('aria-hidden') === 'true') return;
      if (window.getComputedStyle(dialog).display === 'none') return;

      const closeBtn = dialog.querySelector(CLOSE_SELECTOR);
      if (closeBtn) {
        closeBtn.click();
      } else if (dialog.hasAttribute('aria-hidden')) {
        dialog.setAttribute('aria-hidden', 'true');
      }
    });
  });
}
