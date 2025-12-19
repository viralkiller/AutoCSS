(function () {
  'use strict';

  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;

  function _uaMobileHint() {
    const ua = (navigator.userAgent || '').toLowerCase();
    return /android|iphone|ipad|ipod|mobile/.test(ua);
  }

  function isCoarsePointer() {
    return !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  }

  function isPortrait() {
    return !!window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
  }

  function isLandscape() {
    return !!window.matchMedia && window.matchMedia('(orientation: landscape)').matches;
  }

  function isNativeMobile() {
    // Prefer UAParser if present.
    if (typeof window.UAParser !== 'undefined') {
      try {
        const p = new window.UAParser();
        const dev = p.getDevice();
        const type = (dev && dev.type) || '';
        const res = (type === 'mobile' || type === 'tablet');
        L && L.log && L.log('[Device] UAParser check', { type, res });
        return res;
      } catch (e) {
        L && L.warn && L.warn('[Device] UAParser failed, fallback', { e: String(e) });
      }
    }
    const res = isCoarsePointer() || _uaMobileHint();
    L && L.log && L.log('[Device] fallback mobile check', { res, coarse: isCoarsePointer(), uaHint: _uaMobileHint() });
    return res;
  }

  window.Demeza.Device = { isNativeMobile, isCoarsePointer, isPortrait, isLandscape };
})();
