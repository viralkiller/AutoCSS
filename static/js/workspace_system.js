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
    controls: null,
    _raf: null,
    _gameIcon: null,

    init() {
      L.log('[Init] WorkspaceSystem.init');
      this.frame = document.getElementById('device-frame');
      this.header = document.getElementById('headerGroup');
      this.grid = document.getElementById('mainGrid');
      this.tile = document.getElementById('workspaceTile');
      this.canvas = document.getElementById('workspaceCanvas');
      this.controls = document.querySelector('.controls');

      if (!this.frame || !this.header || !this.grid || !this.tile || !this.canvas) {
        L.warn('[Workspace] init missing elements');
        return;
      }

      this.frame.classList.add('has-workspace');

      Bus && Bus.on && Bus.on((reason) => this.fitSoon(reason));

      window.addEventListener('resize', () => this.fitSoon('window.resize'));
      window.addEventListener('orientationchange', () => this.fitSoon('window.orientationchange'));

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
      if (!this.frame || !this.header || !this.grid || !this.tile || !this.canvas) return;

      const isLive = document.body.classList.contains('view-live');
      const bodyStyle = window.getComputedStyle(document.body);
      const padTop = parseFloat(bodyStyle.paddingTop) || 0;
      const padBot = parseFloat(bodyStyle.paddingBottom) || 0;

      // --- HEIGHT CALCULATION ---
      if (isLive) {
        // LIVE MODE: Full viewport minus body padding
        this.frame.style.height = `calc(100vh - ${padTop + padBot}px)`;
      } else {
        // SIMULATOR MODE
        // We calculate exact pixel height to fit between Toolbar and Bottom of screen.

        // 1. Measure Toolbar
        const controlsHeight = this.controls ? this.controls.offsetHeight : 0;

        // 2. Margins & Safety
        const gap = 16; // The CSS margin below controls
        const buffer = 12; // NEW: Explicit safety buffer to prevent bottom border clipping

        // 3. Calculate Available Height
        // Formula: Window - TopPad - Toolbar - ToolbarMargin - BottomPad - SafetyBuffer
        const availableH = Math.floor(window.innerHeight - padTop - controlsHeight - gap - padBot - buffer);

        // 4. Clamp min height (320px)
        const safeH = Math.max(320, availableH);

        this.frame.style.height = `${safeH}px`;
      }

      // --- INNER CONTENT FITTING ---
      const frameClientH = this.frame.clientHeight;
      const headerH = this.header.offsetHeight;
      const gridStyle = window.getComputedStyle(this.grid);
      const gridPadTop = parseFloat(gridStyle.paddingTop) || 0;
      const gridPadBot = parseFloat(gridStyle.paddingBottom) || 0;

      const fudge = 1;
      const workspaceH = Math.max(200, frameClientH - headerH - gridPadTop - gridPadBot - fudge);

      this.tile.style.height = workspaceH + 'px';
      this.canvas.style.height = '100%';

      // Reset scroll if it happened during resize
      if (this.frame.scrollTop !== 0) this.frame.scrollTop = 0;

      // --- VISUALS (Grid / Icon) ---
      this.updateVisuals();

      L.log('[Workspace] fit', { reason, isLive, frameH: this.frame.style.height });
    },

    updateVisuals() {
      const isGame = document.body.classList.contains('template-game');
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;

      if (isGame) {
        // Game Mode: Rotating Icon
        this.canvas.style.backgroundImage = 'none';
        if (!this._gameIcon) {
          const div = document.createElement('div');
          div.style.cssText = 'position:absolute;left:50%;top:50%;width:128px;height:128px;opacity:0.2;transition:transform 0.3s ease;pointer-events:none;';
          div.innerHTML = GAME_ICON_SVG;
          this.canvas.appendChild(div);
          this._gameIcon = div;
        }
        this._gameIcon.style.display = 'block';
        this._gameIcon.style.transform = (h > w)
          ? 'translate(-50%, -50%) rotate(90deg)' // Portrait
          : 'translate(-50%, -50%) rotate(0deg)'; // Landscape
      } else {
        // Workspace Mode: Grid
        if (this._gameIcon) this._gameIcon.style.display = 'none';
        if (w > 0) {
          const targetSize = 32;
          const cols = Math.round(w / targetSize) || 1;
          const exactSize = w / cols;
          this.canvas.style.backgroundSize = `${exactSize}px ${exactSize}px`;
          this.canvas.style.backgroundImage = `
            linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
          `;
        }
      }
    }
  };
  window.Demeza.WorkspaceSystem = WorkspaceSystem;
})();