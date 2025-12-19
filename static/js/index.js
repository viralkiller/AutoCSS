(function () {
  'use strict';

  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;

  function go(path) {
    L.log('[Index] navigate', { path });
    window.location.href = path;
  }

  const Index = {
    init() {
      L.log('[Init] Index.init');

      document.querySelectorAll('[data-home-card]').forEach((card) => {
        card.addEventListener('click', () => {
          const target = card.getAttribute('data-target') || '';
          L.log('[UI] home card click', { target, text: (card.textContent || '').trim() });
          if (target) go(target);
        });

        card.addEventListener('mouseenter', () => {
          L.log('[UI] home card hover', { target: card.getAttribute('data-target') || '' });
        });
      });
    }
  };

  window.Demeza.Index = Index;
})();
