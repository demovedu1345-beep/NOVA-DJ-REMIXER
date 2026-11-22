// =========================================================================
// Audify Core Smoothness & Momentum Scrolling Suite
// Powered by Lenis, GPU Hardware Acceleration & Emil Kowalski Physics
// =========================================================================

(function initAudifySmoothScrollModule() {
  if (typeof window === 'undefined') return;
  if (window.__audify_smooth_scroll_initialized) return;
  window.__audify_smooth_scroll_initialized = true;

  function setupLenisEngine() {
    if (typeof Lenis === 'undefined') {
      setTimeout(setupLenisEngine, 100);
      return;
    }

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    const lenis = new Lenis({
      duration: isTouch ? 1.05 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential decay curve for luxury momentum glide
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false, // On mobile touch, maintain native 120Hz high-refresh rate touch momentum
      touchMultiplier: 1.5,
      wheelMultiplier: 1.08,
      autoRaf: true
    });

    window.__audify_lenis = lenis;

    // Helper: Scroll smoothly to an element, selector, or Y coordinate
    window.audifyScrollTo = (target, opts = {}) => {
      try {
        lenis.scrollTo(target, {
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          ...opts
        });
      } catch (_) {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Modal Scroll Containment: Stop Lenis background scrolling when EQ modal or Artist Sheet is open
    const observer = new MutationObserver(() => {
      const eqOverlay = document.getElementById('audify-eq-overlay');
      const isEqOpen = eqOverlay && (eqOverlay.classList.contains('open') || eqOverlay.style.display === 'flex');
      const isSheetOpen = document.body.classList.contains('audify-sheet-open') || !!document.querySelector('.audify-artist-sheet-backdrop');

      if (isEqOpen || isSheetOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    observer.observe(document.body, { attributes: true, subtree: true, childList: true });

    // Global tactile squeeze listener for dynamic buttons & cards
    document.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('.audify-pill-btn, .audify-artist-card, .squeeze, .audify-eq-preset-btn, .audify-eq-theme-pill');
      if (target) {
        target.style.transform = 'scale(0.96) translate3d(0, 0, 0)';
      }
    }, { passive: true });

    document.addEventListener('pointerup', (e) => {
      const target = e.target.closest('.audify-pill-btn, .audify-artist-card, .squeeze, .audify-eq-preset-btn, .audify-eq-theme-pill');
      if (target) {
        target.style.transform = '';
      }
    }, { passive: true });

    document.addEventListener('pointercancel', (e) => {
      const target = e.target.closest('.audify-pill-btn, .audify-artist-card, .squeeze, .audify-eq-preset-btn, .audify-eq-theme-pill');
      if (target) {
        target.style.transform = '';
      }
    }, { passive: true });

    console.log('[Audify Smooth] 🚀 Core Lenis luxury momentum scroll & tactile physics initialized.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLenisEngine);
  } else {
    setupLenisEngine();
  }
})();
