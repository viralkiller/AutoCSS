(function () {
  'use strict';

  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;
  const Bus = window.Demeza.LayoutBus;

  const NavUI = {
    init() {
      L.log('[Init] NavUI.init');

      const nav = document.getElementById('mainNav');
      const btn = document.getElementById('hamburgerBtn');
      const navLinks = document.getElementById('navLinks');

      if (btn) {
        btn.addEventListener('click', () => {
          const before = nav && nav.classList.contains('mobile-open');
          if (nav) nav.classList.toggle('mobile-open');
          const after = nav && nav.classList.contains('mobile-open');

          btn.setAttribute('aria-expanded', after ? 'true' : 'false');
          if (navLinks) btn.setAttribute('aria-controls', 'navLinks');

          L.log('[UI] hamburger toggle', { before, after });
          Bus && Bus.notify && Bus.notify('NavUI.toggleMenu');
        });
      }

      // Meta links
      ['metaCredits', 'metaLogin', 'mobileCredits', 'mobileLogin'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('click', () => {
          L.log('[UI] meta link click', { id, text: (el.textContent || '').trim() });
        });
      });

      // Nav links
      document.querySelectorAll('.nav-link').forEach((a) => {
        a.addEventListener('click', () => {
          L.log('[UI] nav click', {
            label: a.getAttribute('data-nav') || (a.textContent || '').trim()
          });
        });
      });
    }
  };

  window.Demeza.NavUI = NavUI;
})();
