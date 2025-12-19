(function () {
  'use strict';

  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;
  const Bus = window.Demeza.LayoutBus;

  const WorkspaceSystem = {
    frame: null,
    header: null,
    grid: null,
    tile: null,
    canvas: null,
    _raf: null,

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

      // 1) Frame height.
      if (!isLive) {
        const gutter = 16;
        const top = this.frame.getBoundingClientRect().top;
        const desired = Math.max(320, Math.round(window.innerHeight - top - gutter));
        this.frame.style.height = desired + 'px';
      } else {
        this.frame.style.height = '100vh';
      }

      // 2) Integer math only.
      const frameClientH = this.frame.clientHeight;
      const headerH = this.header.offsetHeight;
      const gridStyle = window.getComputedStyle(this.grid);
      const padTop = L.numPx(gridStyle.paddingTop);
      const padBot = L.numPx(gridStyle.paddingBottom);

      // 3) Fudge prevents 1px scroll pop.
      const fudge = 1;
      const raw = frameClientH - headerH - padTop - padBot - fudge;
      const workspaceH = Math.max(200, raw);

      this.tile.style.height = workspaceH + 'px';
      this.canvas.style.height = '100%';

      // 4) Micro-scroll kill.
      if (this.frame.scrollTop !== 0) {
        L.log('[Workspace] frame scrollTop reset', { before: this.frame.scrollTop });
        this.frame.scrollTop = 0;
      }

      const overflowFrame = this.frame.scrollHeight - this.frame.clientHeight;
      const overflowGrid = this.grid.scrollHeight - this.grid.clientHeight;

      L.log('[Workspace] fit', {
        reason,
        isLive,
        frameClientH,
        headerH,
        padTop,
        padBot,
        fudge,
        workspaceH,
        overflowFrame,
        overflowGrid
      });
    }
  };

  window.Demeza.WorkspaceSystem = WorkspaceSystem;
})();
