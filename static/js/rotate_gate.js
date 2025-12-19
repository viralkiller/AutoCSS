(function () {
  'use strict';

  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;
  const Device = window.Demeza.Device;
  const Bus = window.Demeza.LayoutBus;

  const RotateGate = {
    enabled: true,
    overlay: null,
    _lastState: null,

    init() {
      L.log('[Init] RotateGate.init');

      // Only meaningful on mobile.
      const isMobile = Device && Device.isNativeMobile && Device.isNativeMobile();
      L.log('[RotateGate] mobile check', { isMobile });

      if (!isMobile) {
        document.body.classList.remove('is-native-mobile');
        return;
      }

      document.body.classList.add('is-native-mobile');

      // Create overlay once.
      this.overlay = document.getElementById('rotateGate');
      if (!this.overlay) {
        this.overlay = document.createElement('div');
        this.overlay.id = 'rotateGate';
        this.overlay.setAttribute('role', 'dialog');
        this.overlay.setAttribute('aria-live', 'polite');
        this.overlay.style.position = 'absolute';
        this.overlay.style.inset = '0';
        this.overlay.style.display = 'none';
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.overlay.style.background = 'rgba(0,0,0,0.75)';
        this.overlay.style.zIndex = '9999';
        this.overlay.style.pointerEvents = 'auto';

        const box = document.createElement('div');
        box.style.background = 'white';
        box.style.color = '#111';
        box.style.border = '4px solid #FF9F1C';
        box.style.borderRadius = '0px';
        box.style.padding = '16px';
        box.style.maxWidth = '320px';
        box.style.fontFamily = 'monospace';
        box.style.textAlign = 'center';

        const h = document.createElement('div');
        h.textContent = 'Rotate to play';
        h.style.fontSize = '18px';
        h.style.fontWeight = '700';
        h.style.marginBottom = '8px';

        const p = document.createElement('div');
        p.textContent = 'Please rotate your device to landscape.';
        p.style.fontSize = '13px';
        p.style.opacity = '0.85';

        box.appendChild(h);
        box.appendChild(p);
        this.overlay.appendChild(box);

        // Put it inside device frame if possible.
        const frame = document.getElementById('device-frame') || document.body;
        frame.style.position = frame.style.position || 'relative';
        frame.appendChild(this.overlay);

        L.log('[RotateGate] overlay created');
      }

      window.addEventListener('resize', () => this.tick('window.resize'));
      window.addEventListener('orientationchange', () => this.tick('window.orientationchange'));

      this.tick('init');
    },

    tick(reason) {
      if (!this.enabled) return;

      const portrait = Device && Device.isPortrait && Device.isPortrait();
      const shouldBlock = !!portrait;

      // Avoid spam logs.
      if (this._lastState === shouldBlock) {
        return;
      }
      this._lastState = shouldBlock;

      if (shouldBlock) {
        this.overlay.style.display = 'flex';
        document.body.classList.add('rotate-blocked');
        L.log('[RotateGate] BLOCK', { reason, portrait: true });
      } else {
        this.overlay.style.display = 'none';
        document.body.classList.remove('rotate-blocked');
        L.log('[RotateGate] UNBLOCK', { reason, portrait: false });
      }

      Bus && Bus.notify && Bus.notify('RotateGate.tick');
    }
  };

  window.Demeza.RotateGate = RotateGate;
})();
