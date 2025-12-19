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
