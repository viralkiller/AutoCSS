(function () {
  'use strict';

  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;
  const Bus = window.Demeza.LayoutBus;

  const Simulator = {
    slider: null,
    frame: null,
    display: null,

    init() {
      L.log('[Init] Simulator.init');

      this.slider = document.getElementById('widthSlider');
      this.frame = document.getElementById('device-frame');
      this.display = document.getElementById('pxDisplay');

      const btnMobile = document.getElementById('btnMobile');
      const btnDesktop = document.getElementById('btnDesktop');
      const btnLive = document.getElementById('btnLive');
      const btnExit = document.getElementById('exit-live-btn');

      if (this.slider) {
        this.slider.addEventListener('input', (e) => {
          L.log('[UI] widthSlider input', { value: e.target.value });
          this.setWidth(e.target.value, 'slider:input');
        });
        this.slider.addEventListener('change', (e) => {
          L.log('[UI] widthSlider change', { value: e.target.value });
        });
      } else {
        L.warn('[Simulator] widthSlider missing');
      }

      if (btnMobile) btnMobile.addEventListener('click', () => L.log('[UI] button click', { id: 'btnMobile' }));
      if (btnDesktop) btnDesktop.addEventListener('click', () => L.log('[UI] button click', { id: 'btnDesktop' }));
      if (btnLive) btnLive.addEventListener('click', () => L.log('[UI] button click', { id: 'btnLive' }));
      if (btnExit) btnExit.addEventListener('click', () => L.log('[UI] button click', { id: 'exit-live-btn' }));

      const initial = Number(this.slider?.value || 512);
      this.setWidth(initial, 'init');
    },

    setWidth(width, reason) {
      if (!this.frame) {
        L.warn('[Simulator] device-frame missing');
        return;
      }
      const w = Math.max(320, Math.min(1280, Number(width) || 512));
      this.frame.style.width = w + 'px';
      if (this.display) this.display.innerText = `${w}px`;
      if (this.slider) this.slider.value = String(w);

      L.log('[Simulator] setWidth', { w, reason });
      Bus && Bus.notify && Bus.notify('Simulator.setWidth');
    },

    setMode(mode) {
      L.log('[UI] setMode clicked', { mode });
      const width = (mode === 'mobile') ? 512 : 1024;
      this.setWidth(width, `setMode:${mode}`);
    },

    toggleLive() {
      const before = document.body.classList.contains('view-live');
      document.body.classList.toggle('view-live');
      const after = document.body.classList.contains('view-live');

      L.log('[UI] toggleLiveMode', { before, after });
      Bus && Bus.notify && Bus.notify('Simulator.toggleLive');
    }
  };

  window.Demeza.Simulator = Simulator;

  // Optional globals for your inline HTML onclick handlers.
  window.setMode = (m) => Simulator.setMode(m);
  window.toggleLiveMode = () => Simulator.toggleLive();
})();
