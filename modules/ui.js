// Shared UI Helpers & Modals for AI-OS
// Powered by A.R. Labs

import { state } from './core.js';
import { showToast } from './utils.js';

export function getActiveLanguage() {
  const controlSelect = document.getElementById('control-lang-select');
  return controlSelect ? controlSelect.value : 'Hinglish';
}

export function setupCardInteractions() {
  const cards = document.querySelectorAll('.timeline-card');
  const lang = getActiveLanguage();
  
  // Mouse Glow Spotlight Effect
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });
  });

  // Intersection Observer for scroll reveal
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  cards.forEach(card => revealObserver.observe(card));

  // Next Lesson buttons smooth scroll
  const nextLessonBtns = document.querySelectorAll('.next-lesson-btn');
  nextLessonBtns.forEach(btn => {
    if (btn.getAttribute('data-bound')) return;
    btn.setAttribute('data-bound', 'true');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIdx = parseInt(btn.getAttribute('data-next-idx'));
      const nextAnchor = document.getElementById(`anchor-${nextIdx}`);
      if (nextAnchor) {
        nextAnchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const nextCard = nextAnchor.parentElement.querySelector('.timeline-card');
        if (nextCard) {
          nextCard.classList.add('highlight-pulse');
          setTimeout(() => {
            nextCard.classList.remove('highlight-pulse');
          }, 2000);
        }
      } else {
        showToast(lang === "Hindi" ? "बधाई हो! आपने पाठ्यक्रम पूरा कर लिया है!" : "Congratulations! You completed the learning journey!");
      }
    });
  });

  // Quiz Option buttons interaction
  const optionBtns = document.querySelectorAll('.edu-quiz-option-btn');
  optionBtns.forEach(btn => {
    if (btn.getAttribute('data-bound')) return;
    btn.setAttribute('data-bound', 'true');
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cardId = btn.getAttribute('data-card-id');
      const optIdx = parseInt(btn.getAttribute('data-opt-idx'));
      const correctIdx = parseInt(btn.getAttribute('data-correct-idx'));
      
      const container = btn.parentElement;
      const buttons = container.querySelectorAll('.edu-quiz-option-btn');
      
      buttons.forEach(b => {
        b.disabled = true;
        b.style.cursor = 'not-allowed';
        b.style.opacity = '0.6';
      });
      
      buttons.forEach((b, idx) => {
        if (idx === correctIdx) {
          b.style.background = 'rgba(46, 204, 113, 0.2)';
          b.style.borderColor = '#2ecc71';
          b.style.color = '#2ecc71';
          b.innerHTML += ' (✅ Correct)';
        } else if (idx === optIdx) {
          b.style.background = 'rgba(231, 76, 60, 0.2)';
          b.style.borderColor = '#e74c3c';
          b.style.color = '#e74c3c';
          b.innerHTML += ' (❌ Incorrect)';
        }
      });
      
      const cardData = window.exploringAIRoadmap ? window.exploringAIRoadmap.find(c => c.id === cardId) : null;
      if (cardData && cardData.checkpoint && cardData.checkpoint.explanation) {
        const feedbackDiv = document.getElementById(`feedback-${cardId}`);
        if (feedbackDiv) {
          const explanationText = cardData.checkpoint.explanation[lang] || cardData.checkpoint.explanation["English"];
          const isCorrect = (optIdx === correctIdx);
          feedbackDiv.style.display = 'block';
          feedbackDiv.style.padding = '10px';
          feedbackDiv.style.borderRadius = '6px';
          feedbackDiv.style.marginTop = '12px';
          
          if (isCorrect) {
            feedbackDiv.style.background = 'rgba(46, 204, 113, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(46, 204, 113, 0.2)';
            feedbackDiv.style.color = '#2ecc71';
            feedbackDiv.innerHTML = `<strong>Correct!</strong> ${explanationText}`;
          } else {
            feedbackDiv.style.background = 'rgba(231, 76, 60, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(231, 76, 60, 0.2)';
            feedbackDiv.style.color = '#ff6b6b';
            feedbackDiv.innerHTML = `<strong>Not quite!</strong> ${explanationText}`;
          }
        }
      }
    });
  });
}

export function initNavigation() {
  // Includes the mobile bottom-nav tabs so they share the exact same
  // scroll-spy + smooth-scroll-on-click behavior as the desktop nav links.
  const navLinks = document.querySelectorAll('.main-nav .nav-link, .mobile-nav-tab[data-target]');
  const sections = document.querySelectorAll('section[id], header[id]');
  
  const appHeader = document.querySelector('.app-header');
  const hamburgerToggle = document.getElementById('hamburger-toggle');
  const mainNav = document.querySelector('.main-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');

  const closeMobileMenu = () => {
    if (hamburgerToggle) hamburgerToggle.classList.remove('active');
    if (mainNav) mainNav.classList.remove('mobile-active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    if (appHeader) appHeader.classList.remove('menu-active');
  };

  if (hamburgerToggle && mainNav && mobileOverlay) {
    hamburgerToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburgerToggle.classList.toggle('active');
      mainNav.classList.toggle('mobile-active');
      mobileOverlay.classList.toggle('active');
      if (appHeader) appHeader.classList.toggle('menu-active');
    });

    mobileOverlay.addEventListener('click', () => {
      closeMobileMenu();
    });
  }

  const updateActiveNavLink = () => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 120;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    if (currentSectionId) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  };

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        closeMobileMenu();

        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          window.removeEventListener('scroll', updateActiveNavLink);
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          const offset = 72;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = targetSection.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          setTimeout(() => {
            window.addEventListener('scroll', updateActiveNavLink);
          }, 800);
        }
      }
    });
  });

  window.addEventListener('scroll', updateActiveNavLink);
}

export async function openLegalDrawer(type) {
  const overlay = document.getElementById('legal-overlay');
  const modalTitle = document.getElementById('legal-modal-title');
  const modalBody = document.getElementById('legal-modal-body');
  const modalSubtitle = document.getElementById('legal-modal-subtitle');
  
  if (typeof window.legalData === 'undefined') {
    // Lazy load the legal data on demand
    await import('../legalData.js');
  }
  
  const doc = window.legalData[type];
  if (!doc) return;
  
  if (modalTitle) modalTitle.textContent = doc.title;
  if (modalSubtitle) modalSubtitle.textContent = `CORPORATE REGULATORY FILE // ${type.toUpperCase()}`;
  
  if (modalBody) {
    let html = '';
    const hasJurisdictionSection = doc.sections.some(sec => 
      sec.heading.toLowerCase().includes('governing law') || 
      sec.heading.toLowerCase().includes('jurisdiction')
    );
    
    const sectionsToRender = [...doc.sections];
    if (!hasJurisdictionSection) {
      const nextIdx = sectionsToRender.length + 1;
      sectionsToRender.push({
        heading: `${nextIdx}. GOVERNING LAW & EXCLUSIVE JURISDICTION`,
        text: "These Terms, Conditions, Policies, Services, Products, Features, APIs, Content, and all interactions with this platform shall be governed and construed exclusively in accordance with the laws of the Republic of India. By accessing or using this website, the user irrevocably agrees that any dispute, claim, controversy, legal proceeding, arbitration, injunction, recovery action, contractual disagreement, statutory interpretation, tort claim, intellectual property dispute, consumer complaint, or any matter whatsoever arising directly or indirectly out of the use of this platform shall be subject solely and exclusively to the competent courts located in Indore, Madhya Pradesh, India. The user expressly waives any objection relating to territorial jurisdiction, venue inconvenience, or forum selection and agrees not to initiate or maintain any legal proceedings in any other jurisdiction, state, district, or country."
      });
    }
    
    sectionsToRender.forEach(sec => {
      const isGoverningLaw = sec.heading.toLowerCase().includes('governing law') || sec.heading.toLowerCase().includes('jurisdiction');
      const isTerms = (type === 'terms');
      let textContent = sec.text;
      
      if (isGoverningLaw && isTerms && !textContent.includes('<strong>')) {
        textContent = `<strong>${textContent}</strong>`;
      }
      
      if (isGoverningLaw) {
        html += `
          <div class="legal-section-block highlighted-legal-section">
            <h3>${sec.heading}</h3>
            <p>${textContent}</p>
          </div>
        `;
      } else {
        html += `
          <div class="legal-section-block">
            <h3>${sec.heading}</h3>
            <p>${textContent}</p>
          </div>
        `;
      }
    });
    modalBody.innerHTML = html;
  }
  
  if (overlay) {
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

export function closeLegalDrawer() {
  const overlay = document.getElementById('legal-overlay');
  if (overlay) {
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Bypassed showPricingModal for static mode
export function showPricingModal(isMandatory = false) {
  // Pricing locks are deactivated in fully unlocked static frontend
}

// Global exposure for backwards compatibility
window.setupCardInteractions = setupCardInteractions;
window.initNavigation = initNavigation;
window.openLegalDrawer = openLegalDrawer;
window.closeLegalDrawer = closeLegalDrawer;
window.showPricingModal = showPricingModal;
window.getActiveLanguage = getActiveLanguage;

document.addEventListener('click', (e) => {
  const trigger = e.target.closest('.legal-trigger');
  if (trigger) {
    e.preventDefault();
    const type = trigger.getAttribute('data-legal');
    openLegalDrawer(type);
  }
});

const legalCloseBtn = document.getElementById('legal-close-btn');
if (legalCloseBtn) {
  legalCloseBtn.addEventListener('click', closeLegalDrawer);
}

const legalCloseOverlay = document.getElementById('legal-close-overlay');
if (legalCloseOverlay) {
  legalCloseOverlay.addEventListener('click', closeLegalDrawer);
}
