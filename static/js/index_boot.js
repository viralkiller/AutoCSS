(function () {
  'use strict';

  window.addEventListener('load', () => {
    const D = window.Demeza || {};
    const L = D.Log;

    L && L.log && L.log('[Boot] index_boot');

    D.Index && D.Index.init && D.Index.init();
  });
})();
