/* static/js/layout_bus.js */

(function () {
  'use strict';
  window.Demeza = window.Demeza || {};
  const { log } = window.Demeza.Log || console;

  const LayoutBus = {
    _subs: [],
    on(fn) {
      if (typeof fn !== 'function') return;
      this._subs.push(fn);
      log('[LayoutBus] subscribed', { count: this._subs.length });
    },
    notify(reason) {
      log('[LayoutBus] notify', { reason, subs: this._subs.length });
      this._subs.forEach(fn => {
        try { fn(reason); }
        catch (e) { console.error('[LayoutBus] subscriber error', e); }
      });
      if (typeof window.onLayoutChange === 'function') {
        try { window.onLayoutChange(reason); }
        catch (e) { console.error('[LayoutBus] window.onLayoutChange error', e); }
      }
    }
  };

  window.Demeza.LayoutBus = LayoutBus;
})();

/* -------------------------------------------------------------------------- */
/* LAYOUT ENFORCER (UNIFIED VERSION)            */
/* -------------------------------------------------------------------------- */

(function () {
  'use strict';

  let lastLogTime = 0;

  function logEnforcer(message, data = {}) {
    const now = Date.now();
    // Throttle logs to avoid spam during slider drag
    if (now - lastLogTime > 500 || data.force) {
      // console.log(`[Enforcer] ${message}`, data); // Uncomment for debugging
      lastLogTime = now;
    }
  }

  /**
   * Single Source of Truth for Layout
   * Runs exactly the same logic regardless of whether triggered by
   * Slider, Buttons, or Live View toggle.
   */
  function enforceLayoutConstraints() {
    const wrapper = document.querySelector('.simulator-wrapper');
    const body = document.body;

    if (!wrapper || !body) return;

    // 1. Get Metrics
    const viewportHeight = window.innerHeight;
    const wrapperHeight = wrapper.offsetHeight;
    const computedBody = window.getComputedStyle(body);
    const bodyPadTop = parseFloat(computedBody.paddingTop) || 0;

    // 2. OVERFLOW CHECK (Total Height vs Viewport)
    // We add a small buffer (2px) to prevent sub-pixel rounding jitters
    const totalContentHeight = wrapperHeight + (bodyPadTop * 2);

    if (totalContentHeight >= viewportHeight) {
      logEnforcer("Overflow Detected - Pinning to Top", { total: totalContentHeight, view: viewportHeight });

      // ACTION 1: Disable Flex Centering
      // When content overflows, 'center' pushes the top off-screen.
      // We switch to 'flex-start' to pin it to the top.
      body.style.justifyContent = 'flex-start';

      // ACTION 2: Enforce Max Height
      // We explicitly calculate the space remaining inside the padding.
      // This forces the SCROLLBAR to appear on the wrapper, not the window.
      const maxH = viewportHeight - (bodyPadTop * 2);

      wrapper.style.maxHeight = `${maxH}px`;
      wrapper.style.overflowY = 'auto';
      wrapper.style.scrollbarWidth = 'none'; // Clean look

      // Ensure body doesn't scroll
      body.style.overflow = 'hidden';

    } else {
      // SAFE STATE: Restore Aesthetics
      // If content fits, let Flexbox center it perfectly.
      body.style.justifyContent = 'center';
      wrapper.style.maxHeight = ''; // Remove constraint
      wrapper.style.overflowY = '';
      body.style.overflow = 'hidden';
    }

    // 3. SYMMETRY ENFORCER (The "Pop" Fix)
    // Always force bottom padding to match left padding.
    // This runs on every frame of the check to ensure no mismatch ever occurs.
    const padLeft = computedBody.paddingLeft;
    if (body.style.paddingBottom !== padLeft) {
      body.style.paddingBottom = padLeft;
    }
  }

  function initLayoutEnforcer() {
    // 1. Window Resize
    window.addEventListener('resize', () => {
        requestAnimationFrame(enforceLayoutConstraints);
    });

    // 2. Slider Input (Continuous)
    const slider = document.querySelector('input[type="range"]');
    if (slider) {
      slider.addEventListener('input', () => {
        // Use AnimationFrame to keep up with 60fps dragging
        requestAnimationFrame(enforceLayoutConstraints);
      });
    }

    // 3. Button Clicks & Live View (Transitions)
    // Mobile/Desktop and Live View toggles trigger CSS transitions (0.2s - 0.3s).
    // We run a loop to re-enforce the layout every frame during this transition.
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        let count = 0;
        const interval = setInterval(() => {
            enforceLayoutConstraints();
            count++;
            // Run for ~350ms (covers the 256ms CSS transition)
            if(count > 22) clearInterval(interval);
        }, 16);
      });
    });

    // 4. Initial Run
    setTimeout(enforceLayoutConstraints, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayoutEnforcer);
  } else {
    initLayoutEnforcer();
  }

})();