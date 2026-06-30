/* ==========================================================================
   AD MANAGER // DYNAMIC EXTERNAL AD PLACEMENT & LAZY LOADING
   ========================================================================== */

(function () {
  'use strict';

  // Config mapping for all ad placements and dimensions
  const AD_CONFIGS = {
    'code_1': {
      width: 300,
      height: 250,
      key: '9de8680837e41c8c6ebab4f8dbb2598b',
      type: 'iframe'
    },
    'code_2': {
      width: 320,
      height: 50,
      key: '9353579f557d5d2e719911d379c000bc',
      type: 'iframe'
    },
    'code_3': {
      width: 728,
      height: 90,
      key: 'e19df4624b03432ffaafbdb4b463f805',
      type: 'iframe'
    },
    'code_4': {
      width: 160,
      height: 600,
      key: '564cde4e9e45a197556575b60bc41afa',
      type: 'iframe'
    },
    'code_5': {
      type: 'native',
      containerId: 'container-189104649ec02c9c6b37528ee5071d7a',
      scriptSrc: 'https://pl29764042.effectivecpmnetwork.com/189104649ec02c9c6b37528ee5071d7a/invoke.js'
    }
  };

  // Keep track of viewport state
  let isMobileLayout = window.innerWidth < 1200;

  /**
   * Safe sandboxed ad rendering using Nested iFrames.
   * Isolates the third-party script's document.write and window.atOptions.
   */
  function injectAdIframe(container, codeName) {
    const config = AD_CONFIGS[codeName];
    if (!config) return;

    // Remove any previous active content in this slot
    container.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.background = 'transparent';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';

    if (config.type === 'iframe') {
      iframe.style.width = config.width + 'px';
      iframe.style.height = config.height + 'px';
      iframe.width = config.width;
      iframe.height = config.height;
    } else {
      iframe.style.width = '100%';
      iframe.style.height = '120px'; // Initial container height for code_5
    }

    container.appendChild(iframe);

    // Write contents to iframe doc to invoke script cleanly
    setTimeout(() => {
      try {
        const doc = iframe.contentWindow.document;
        doc.open();
        
        let bodyContent = '';
        if (config.type === 'iframe') {
          bodyContent = `
            <script>
              var atOptions = {
                'key' : '${config.key}',
                'format' : 'iframe',
                'height' : ${config.height},
                'width' : ${config.width},
                'params' : {}
              };
            </script>
            <script src="https://www.highperformanceformat.com/${config.key}/invoke.js"></script>
          `;
        } else if (config.type === 'native') {
          bodyContent = `
            <div id="${config.containerId}"></div>
            <script async="async" data-cfasync="false" src="${config.scriptSrc}"></script>
          `;
        }

        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { margin: 0; padding: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; background: transparent; }
            </style>
          </head>
          <body>
            ${bodyContent}
          </body>
          </html>
        `);
        doc.close();

        // If native banner, poll scrollHeight to size the parent container appropriately
        if (config.type === 'native') {
          let attempts = 0;
          const resize = () => {
            const body = doc.body;
            if (body && body.scrollHeight > 0) {
              iframe.style.height = body.scrollHeight + 'px';
            }
            if (attempts++ < 15) {
              setTimeout(resize, 400);
            }
          };
          setTimeout(resize, 400);
        }
      } catch (err) {
        console.error('AdManager: Failed to write to ad frame', err);
      }
    }, 20);
  }

  /**
   * Creates an IntersectionObserver to load ads only when visible.
   */
  function registerLazyLoad(container, codeName) {
    if (!container) return;

    // Mark as pending to prevent double allocation
    container.setAttribute('data-ad-pending', 'true');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          injectAdIframe(container, codeName);
          container.removeAttribute('data-ad-pending');
          container.setAttribute('data-ad-loaded', 'true');
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '250px 0px', // start loading when 250px near viewport
      threshold: 0.01
    });

    observer.observe(container);
  }

  /**
   * Programmatically builds a native ad card element.
   */
  function createAdCardElement(codeName) {
    const wrapper = document.createElement('div');
    wrapper.className = `native-ad-card ad-size-${codeName}`;
    wrapper.innerHTML = `
      <div class="ad-label">Advertisement</div>
      <div class="ad-content"></div>
    `;
    return wrapper;
  }

  /**
   * Renders the layout configurations for Desktop.
   */
  function initDesktopPlacements() {
    // 1. Sidebar Skyscraper Ads (Code 4)
    const leftSidebar = document.getElementById('new-ad-left-sidebar');
    const rightSidebar = document.getElementById('new-ad-right-sidebar');

    if (leftSidebar && !leftSidebar.hasAttribute('data-ad-loaded') && !leftSidebar.hasAttribute('data-ad-pending')) {
      const card = createAdCardElement('code_4');
      leftSidebar.appendChild(card);
      registerLazyLoad(card.querySelector('.ad-content'), 'code_4');
      leftSidebar.setAttribute('data-ad-loaded', 'true');
    }

    if (rightSidebar && !rightSidebar.hasAttribute('data-ad-loaded') && !rightSidebar.hasAttribute('data-ad-pending')) {
      const card = createAdCardElement('code_4');
      rightSidebar.appendChild(card);
      registerLazyLoad(card.querySelector('.ad-content'), 'code_4');
      rightSidebar.setAttribute('data-ad-loaded', 'true');
    }

    // 2. Roadmap Page Inline Top & Bottom (Code 3)
    const roadmapSection = document.getElementById('roadmap-builder-section');
    if (roadmapSection) {
      // Inline Top (after header)
      let inlineTop = roadmapSection.querySelector('.roadmap-inline-top');
      if (!inlineTop) {
        inlineTop = document.createElement('div');
        inlineTop.className = 'roadmap-inline-top';
        const sectionHeader = roadmapSection.querySelector('.section-header');
        if (sectionHeader) {
          sectionHeader.insertAdjacentElement('afterend', inlineTop);
        } else {
          roadmapSection.insertBefore(inlineTop, roadmapSection.firstChild);
        }
      }
      if (!inlineTop.hasAttribute('data-ad-loaded') && !inlineTop.hasAttribute('data-ad-pending')) {
        const card = createAdCardElement('code_3');
        inlineTop.appendChild(card);
        registerLazyLoad(card.querySelector('.ad-content'), 'code_3');
        inlineTop.setAttribute('data-ad-loaded', 'true');
      }

      // Inline Bottom (after timeline)
      let inlineBottom = roadmapSection.querySelector('.roadmap-inline-bottom');
      if (!inlineBottom) {
        inlineBottom = document.createElement('div');
        inlineBottom.className = 'roadmap-inline-bottom';
        roadmapSection.appendChild(inlineBottom);
      }
      if (!inlineBottom.hasAttribute('data-ad-loaded') && !inlineBottom.hasAttribute('data-ad-pending')) {
        const card = createAdCardElement('code_3');
        inlineBottom.appendChild(card);
        registerLazyLoad(card.querySelector('.ad-content'), 'code_3');
        inlineBottom.setAttribute('data-ad-loaded', 'true');
      }
    }

    // 3. Explore Library Page Footer Banner (Code 3)
    const librarySection = document.getElementById('explore-library-section');
    if (librarySection) {
      let footerBanner = librarySection.querySelector('.library-footer-banner');
      if (!footerBanner) {
        footerBanner = document.createElement('div');
        footerBanner.className = 'library-footer-banner';
        librarySection.appendChild(footerBanner);
      }
      if (!footerBanner.hasAttribute('data-ad-loaded') && !footerBanner.hasAttribute('data-ad-pending')) {
        const card = createAdCardElement('code_3');
        footerBanner.appendChild(card);
        registerLazyLoad(card.querySelector('.ad-content'), 'code_3');
        footerBanner.setAttribute('data-ad-loaded', 'true');
      }
    }

    // 4. Category Page Bottom Banner (Code 3)
    const categorySection = document.getElementById('category-explorer-section');
    if (categorySection) {
      let bottomBanner = categorySection.querySelector('.category-bottom-banner');
      if (!bottomBanner) {
        bottomBanner = document.createElement('div');
        bottomBanner.className = 'category-bottom-banner';
        categorySection.appendChild(bottomBanner);
      }
      if (!bottomBanner.hasAttribute('data-ad-loaded') && !bottomBanner.hasAttribute('data-ad-pending')) {
        const card = createAdCardElement('code_3');
        bottomBanner.appendChild(card);
        registerLazyLoad(card.querySelector('.ad-content'), 'code_3');
        bottomBanner.setAttribute('data-ad-loaded', 'true');
      }
    }

    // 5. About Page Top & Bottom Banners (Code 3)
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      // Top banner (after header)
      let topBanner = aboutSection.querySelector('.about-top-banner');
      if (!topBanner) {
        topBanner = document.createElement('div');
        topBanner.className = 'about-top-banner';
        const sectionHeader = aboutSection.querySelector('.section-header');
        if (sectionHeader) {
          sectionHeader.insertAdjacentElement('afterend', topBanner);
        } else {
          aboutSection.insertBefore(topBanner, aboutSection.firstChild);
        }
      }
      if (!topBanner.hasAttribute('data-ad-loaded') && !topBanner.hasAttribute('data-ad-pending')) {
        const card = createAdCardElement('code_3');
        topBanner.appendChild(card);
        registerLazyLoad(card.querySelector('.ad-content'), 'code_3');
        topBanner.setAttribute('data-ad-loaded', 'true');
      }

      // Bottom banner
      let bottomBanner = aboutSection.querySelector('.about-bottom-banner');
      if (!bottomBanner) {
        bottomBanner = document.createElement('div');
        bottomBanner.className = 'about-bottom-banner';
        aboutSection.appendChild(bottomBanner);
      }
      if (!bottomBanner.hasAttribute('data-ad-loaded') && !bottomBanner.hasAttribute('data-ad-pending')) {
        const card = createAdCardElement('code_3');
        bottomBanner.appendChild(card);
        registerLazyLoad(card.querySelector('.ad-content'), 'code_3');
        bottomBanner.setAttribute('data-ad-loaded', 'true');
      }
    }


    // 7. Content Bottom Banner (Code 3)
    const bottomAd = document.getElementById('adsterra-bottom-banner');
    if (bottomAd && !bottomAd.hasAttribute('data-ad-loaded') && !bottomAd.hasAttribute('data-ad-pending')) {
      const card = createAdCardElement('code_3');
      bottomAd.appendChild(card);
      registerLazyLoad(card.querySelector('.ad-content'), 'code_3');
      bottomAd.setAttribute('data-ad-loaded', 'true');
    }

    // 8. Footer Native Ad (Code 5)
    const footerNative = document.getElementById('adsterra-footer-native');
    if (footerNative && !footerNative.hasAttribute('data-ad-loaded') && !footerNative.hasAttribute('data-ad-pending')) {
      const card = createAdCardElement('code_5');
      footerNative.appendChild(card);
      registerLazyLoad(card.querySelector('.ad-content'), 'code_5');
      footerNative.setAttribute('data-ad-loaded', 'true');
    }
  }

  /**
   * Renders layout configurations for Mobile (< 1200px viewports).
   */
  function initMobilePlacements() {
    // 1. After Hero Section (Positioned below dashboard-controls)
    const controlsDashboard = document.getElementById('dashboard-controls');
    if (controlsDashboard) {
      let mobileAd1 = document.getElementById('mobile-ad-pos-1');
      if (!mobileAd1) {
        mobileAd1 = document.createElement('div');
        mobileAd1.id = 'mobile-ad-pos-1';
        mobileAd1.className = 'mobile-ad-unit';
        controlsDashboard.insertAdjacentElement('afterend', mobileAd1);
      }
      if (!mobileAd1.hasAttribute('data-ad-loaded') && !mobileAd1.hasAttribute('data-ad-pending')) {
        const card = createAdCardElement('code_2');
        mobileAd1.appendChild(card);
        registerLazyLoad(card.querySelector('.ad-content'), 'code_2');
        mobileAd1.setAttribute('data-ad-loaded', 'true');
      }
    }

    // 2. After First Content Block (Positioned below roadmap-builder-section)
    const roadmapSection = document.getElementById('roadmap-builder-section');
    if (roadmapSection) {
      let mobileAd2 = document.getElementById('mobile-ad-pos-2');
      if (!mobileAd2) {
        mobileAd2 = document.createElement('div');
        mobileAd2.id = 'mobile-ad-pos-2';
        mobileAd2.className = 'mobile-ad-unit';
        roadmapSection.insertAdjacentElement('afterend', mobileAd2);
      }
      if (!mobileAd2.hasAttribute('data-ad-loaded') && !mobileAd2.hasAttribute('data-ad-pending')) {
        const card = createAdCardElement('code_2');
        mobileAd2.appendChild(card);
        registerLazyLoad(card.querySelector('.ad-content'), 'code_2');
        mobileAd2.setAttribute('data-ad-loaded', 'true');
      }
    }

    // 3. Footer Native Ad (Code 5)
    const footerNative = document.getElementById('adsterra-footer-native');
    if (footerNative && !footerNative.hasAttribute('data-ad-loaded') && !footerNative.hasAttribute('data-ad-pending')) {
      const card = createAdCardElement('code_5');
      footerNative.appendChild(card);
      registerLazyLoad(card.querySelector('.ad-content'), 'code_5');
      footerNative.setAttribute('data-ad-loaded', 'true');
    }
  }

  /**
   * Resets placements if layout switch happens (e.g. from Desktop to Mobile view).
   */
  function clearAllPlacements() {
    const selectors = [
      '.roadmap-inline-top', '.roadmap-inline-bottom', '.library-footer-banner',
      '.category-bottom-banner', '.about-top-banner', '.about-bottom-banner',
      '.mobile-ad-unit'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.innerHTML = '';
        el.removeAttribute('data-ad-loaded');
        el.removeAttribute('data-ad-pending');
      });
    });

    const staticAdSlots = [
      'new-ad-left-sidebar',
      'new-ad-right-sidebar',
      'adsterra-bottom-banner',
      'adsterra-footer-native'
    ];
    staticAdSlots.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = '';
        el.removeAttribute('data-ad-loaded');
        el.removeAttribute('data-ad-pending');
      }
    });
  }

  /**
   * Handles dynamic layout shifts on viewport resize.
   */
  function handleLayoutUpdate() {
    const isMobileNow = window.innerWidth < 1200;
    if (isMobileNow !== isMobileLayout) {
      isMobileLayout = isMobileNow;
      clearAllPlacements();
      if (isMobileLayout) {
        initMobilePlacements();
      } else {
        initDesktopPlacements();
      }
    }
  }

  function isUserPremium() {
    // 1. Check coupon session
    const couponSession = sessionStorage.getItem('aios_coupon_session');
    if (couponSession) return true;
    
    // 2. Check cached profile in localStorage
    const cachedProfile = localStorage.getItem('aios_user_profile');
    if (cachedProfile) {
      try {
        const u = JSON.parse(cachedProfile);
        if (u && (u.plan_type === 'Premium' || u.plan_type === 'Trial Premium' || u.plan_type === 'Trial')) return true;
      } catch (e) {}
    }
    
    // 3. Check global state
    if (window.state && window.state.user && (window.state.user.plan_type === 'Premium' || window.state.user.plan_type === 'Trial Premium' || window.state.user.plan_type === 'Trial')) {
      return true;
    }
    
    return false;
  }

  // Define public API
  window.AdManager = {
    init: function () {
      isMobileLayout = window.innerWidth < 1200;
      window.AdManager.updateAdVisibility();

      window.addEventListener('resize', () => {
        if (!isUserPremium()) {
          requestAnimationFrame(handleLayoutUpdate);
        }
      });
    },

    updateAdVisibility: function () {
      if (isUserPremium()) {
        clearAllPlacements();
        const adSlots = [
          'new-ad-left-sidebar', 'new-ad-right-sidebar', 'new-ad-sticky-bottom', 
          'new-ad-category-leaderboard', 'new-ad-explore-leaderboard'
        ];
        adSlots.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
      } else {
        const adSlots = [
          'new-ad-left-sidebar', 'new-ad-right-sidebar', 'new-ad-sticky-bottom', 
          'new-ad-category-leaderboard', 'new-ad-explore-leaderboard'
        ];
        adSlots.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'block';
        });
        clearAllPlacements();
        if (isMobileLayout) {
          initMobilePlacements();
        } else {
          initDesktopPlacements();
        }
      }
    },

    // Expose helpers for dynamic code-level injections inside grids/lists
    createInlineAdCard: function (codeName) {
      if (isUserPremium()) {
        const empty = document.createElement('div');
        empty.style.display = 'none';
        return empty;
      }
      return createAdCardElement(codeName);
    },

    registerLazyLoad: function (container, codeName) {
      if (isUserPremium()) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
      }
      registerLazyLoad(container, codeName);
    }
  };
})();
