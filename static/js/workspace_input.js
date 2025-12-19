(function () {
  'use strict';

  window.Demeza = window.Demeza || {};
  const L = window.Demeza.Log;

  const WorkspaceInput = {
    canvas: null,
    isPointerDown: false,
    last: { x: 0, y: 0 },

    init() {
      this.canvas = document.getElementById('workspaceCanvas');
      if (!this.canvas) {
        L.warn('[WorkspaceInput] workspaceCanvas missing');
        return;
      }

      L.log('[Init] WorkspaceInput.init');

      this.canvas.addEventListener('pointerdown', (e) => {
        this.isPointerDown = true;
        this.last = { x: e.clientX, y: e.clientY };
        this.canvas.setPointerCapture?.(e.pointerId);
        L.log('[WorkspaceInput] pointerdown', {
          x: e.clientX, y: e.clientY, button: e.button, pointerType: e.pointerType
        });
      });

      this.canvas.addEventListener('pointermove', (e) => {
        if (!this.isPointerDown) return;
        const dx = e.clientX - this.last.x;
        const dy = e.clientY - this.last.y;
        this.last = { x: e.clientX, y: e.clientY };
        L.log('[WorkspaceInput] pointermove(drag)', { x: e.clientX, y: e.clientY, dx, dy, pointerType: e.pointerType });
      });

      this.canvas.addEventListener('pointerup', (e) => {
        this.isPointerDown = false;
        L.log('[WorkspaceInput] pointerup', {
          x: e.clientX, y: e.clientY, button: e.button, pointerType: e.pointerType
        });
      });

      this.canvas.addEventListener('wheel', (e) => {
        L.log('[WorkspaceInput] wheel', { deltaX: e.deltaX, deltaY: e.deltaY, ctrlKey: e.ctrlKey });
      }, { passive: true });

      this.canvas.addEventListener('keydown', (e) => {
        L.log('[WorkspaceInput] keydown', { key: e.key, code: e.code, ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey });
      });

      this.canvas.addEventListener('focus', () => L.log('[WorkspaceInput] focus'));
      this.canvas.addEventListener('blur', () => L.log('[WorkspaceInput] blur'));
    }
  };

  window.Demeza.WorkspaceInput = WorkspaceInput;
})();
