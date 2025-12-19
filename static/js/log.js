(function () {
  'use strict';

  window.Demeza = window.Demeza || {};

  function _ts() {
    return new Date().toISOString().slice(11, 23);
  }

  function log(msg, obj) {
    if (obj !== undefined) console.log(`[${_ts()}] ${msg}`, obj);
    else console.log(`[${_ts()}] ${msg}`);
  }

  function warn(msg, obj) {
    if (obj !== undefined) console.warn(`[${_ts()}] ${msg}`, obj);
    else console.warn(`[${_ts()}] ${msg}`);
  }

  function err(msg, obj) {
    if (obj !== undefined) console.error(`[${_ts()}] ${msg}`, obj);
    else console.error(`[${_ts()}] ${msg}`);
  }

  function numPx(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }

  function byId(id) {
    const el = document.getElementById(id);
    if (!el) warn('[DOM] missing id', { id });
    return el;
  }

  window.Demeza.Log = { log, warn, err, numPx, byId };
})();
