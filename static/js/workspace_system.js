(function () {
  'use strict';
  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;
  const Bus = window.Demeza.LayoutBus;

  // Simple Gamepad Icon SVG
  const GAME_ICON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%; height:100%; color:#e0e0e0;">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h4m-2-2v4" />
      <line x1="15" y1="11" x2="15" y2="11" />
      <line x1="18" y1="13" x2="18" y2="13" />
    </svg>
  `;

  const WorkspaceSystem = {
    frame: null,
    header: null,
    grid: null,
    tile: null,
    canvas: null,
    _raf: null,
    _gameIcon: null,

    init() {
      L.log('[Init] WorkspaceSystem.init');
      this.frame = document.getElementById('device-frame');
      this.header = document.getElementById('headerGroup');
      this.grid = document.getElementById('mainGrid');
      this.tile = document.getElementById('workspaceTile');
      this.canvas = document.getElementById('workspaceCanvas');

      if (!this.frame || !this.header || !this.grid || !this.tile || !this.canvas) {
        L.warn('[Workspace] init missing elements', {
          frame: !!this.frame, header: !!this.header, grid: !!this.grid, tile: !!this.tile, canvas: !!this.canvas
        });
        return;
      }

      // Mark workspace mode for CSS overrides.
      this.frame.classList.add('has-workspace');
      L.log('[Workspace] has-workspace enabled');

      // React to layout signals.
      Bus && Bus.on && Bus.on((reason) => this.fitSoon(reason));

      // React to actual window changes.
      window.addEventListener('resize', () => {
        L.log('[Workspace] window resize');
        this.fitSoon('window.resize');
      });
      window.addEventListener('orientationchange', () => {
        L.log('[Workspace] orientationchange');
        this.fitSoon('window.orientationchange');
      });

      this.fitSoon('init');
    },

    fitSoon(reason) {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => {
        this._raf = null;
        this.fit(reason || 'fitSoon');
      });
    },

    fit(reason) {
      if (!this.frame || !this.header || !this.grid || !this.tile || !this.canvas) {
        L.warn('[Workspace] fit skipped (missing elements)');
        return;
      }
      const isLive = document.body.classList.contains('view-live');

      // 1) Frame height calculation
      if (!isLive) {
        const gutter = 16;
        const top = this.frame.getBoundingClientRect().top;
        const desired = Math.max(320, Math.round(window.innerHeight - top - gutter));
        this.frame.style.height = desired + 'px';
      } else {
        const bodyStyle = window.getComputedStyle(document.body);
        const padTop = parseFloat(bodyStyle.paddingTop) || 0;
        const padBot = parseFloat(bodyStyle.paddingBottom) || 0;
        this.frame.style.height = `calc(100vh - ${padTop + padBot}px)`;
      }

      // 2) Integer math for inner items
      const frameClientH = this.frame.clientHeight;
      const headerH = this.header.offsetHeight;
      const gridStyle = window.getComputedStyle(this.grid);
      const padTop = L.numPx(gridStyle.paddingTop);
      const padBot = L.numPx(gridStyle.paddingBottom);

      // 3) Fudge prevents 1px scroll pop
      const fudge = 1;
      const raw = frameClientH - headerH - padTop - padBot - fudge;
      const workspaceH = Math.max(200, raw);

      this.tile.style.height = workspaceH + 'px';
      this.canvas.style.height = '100%';

      // 4) Micro-scroll kill
      if (this.frame.scrollTop !== 0) {
        L.log('[Workspace] frame scrollTop reset', { before: this.frame.scrollTop });
        this.frame.scrollTop = 0;
      }

      // 5) VISUALS: Grid vs Game Icon
      const isGame = document.body.classList.contains('template-game');
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;

      if (isGame) {
        // --- GAME MODE: No Grid, Rotating Icon ---
        this.canvas.style.backgroundImage = 'none';

        // Ensure icon exists
        if (!this._gameIcon) {
          const iconWrapper = document.createElement('div');
          iconWrapper.style.position = 'absolute';
          iconWrapper.style.left = '50%';
          iconWrapper.style.top = '50%';
          iconWrapper.style.width = '128px';
          iconWrapper.style.height = '128px';
          iconWrapper.style.opacity = '0.2'; // Subtle watermark
          iconWrapper.style.transition = 'transform 0.3s ease';
          iconWrapper.style.pointerEvents = 'none';
          iconWrapper.innerHTML = GAME_ICON_SVG;
          this.canvas.appendChild(iconWrapper);
          this._gameIcon = iconWrapper;
        }

        // ORIENTATION LOGIC:
        // If container height > width (Portrait), we are "wrong".
        // Rotate icon 90deg to simulate "needs tilt".
        if (h > w) {
          this._gameIcon.style.transform = 'translate(-50%, -50%) rotate(90deg)';
        } else {
          this._gameIcon.style.transform = 'translate(-50%, -50%) rotate(0deg)';
        }
        this._gameIcon.style.display = 'block';

      } else {
        // --- WORKSPACE MODE: Perfect Grid ---
        if (this._gameIcon) this._gameIcon.style.display = 'none';

        if (w > 0) {
          const targetSize = 32;
          const cols = Math.round(w / targetSize);
          const safeCols = cols < 1 ? 1 : cols;
          const exactSize = w / safeCols;
          this.canvas.style.backgroundSize = `${exactSize}px ${exactSize}px`;
          this.canvas.style.backgroundImage = `
            linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
          `;
        }
      }

      L.log('[Workspace] fit', {
        reason,
        isLive,
        isGame,
        workspaceH,
        orientation: (h > w) ? 'portrait' : 'landscape'
      });
    }
  };
  window.Demeza.WorkspaceSystem = WorkspaceSystem;
})();