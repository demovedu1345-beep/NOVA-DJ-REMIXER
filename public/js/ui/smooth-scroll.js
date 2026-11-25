// =========================================================================
// Audify Core Smoothness & Momentum Scrolling Suite
// Powered by Lenis, GPU Hardware Acceleration & Emil Kowalski Physics
// =========================================================================

(function initAudifySmoothScrollModule() {
  if (typeof window === 'undefined') return;
  if (window.__audify_smooth_scroll_initialized) return;
  window.__audify_smooth_scroll_initialized = true;

  function setupLenisEngine() {
    const isTouchPrimary = window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches;

    let lenis = null;
    if (!isTouchPrimary && typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential decay curve for luxury momentum glide
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1.08,
        autoRaf: true
      });
      window.__audify_lenis = lenis;

      let wasStopped = false;
      function syncModalScrollLock() {
        const eqOverlay = document.getElementById('audify-eq-overlay');
        const isEqOpen = !!(eqOverlay && (eqOverlay.classList.contains('open') || eqOverlay.style.display === 'flex'));
        const isSheetOpen = document.body.classList.contains('audify-sheet-open') || !!document.querySelector('.audify-artist-sheet-backdrop');
        const shouldStop = isEqOpen || isSheetOpen;
        if (shouldStop !== wasStopped) {
          wasStopped = shouldStop;
          if (shouldStop) lenis.stop();
          else lenis.start();
        }
      }

      // Lightweight non-subtree observer: avoids firing on every waveform/timer tick
      const bodyObserver = new MutationObserver(syncModalScrollLock);
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'], childList: true, subtree: false });
      const eqEl = document.getElementById('audify-eq-overlay');
      if (eqEl) {
        bodyObserver.observe(eqEl, { attributes: true, attributeFilter: ['class', 'style'] });
      }
    } else if (!isTouchPrimary && typeof Lenis === 'undefined') {
      setTimeout(setupLenisEngine, 100);
      return;
    }

    // Helper: Scroll smoothly to an element, selector, or Y coordinate
    window.audifyScrollTo = (target, opts = {}) => {
      try {
        if (lenis) {
          lenis.scrollTo(target, {
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            ...opts
          });
          return;
        }
      } catch (_) {}
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    };

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
