(function () {
  'use strict';

  window.addEventListener('load', () => {
    const D = window.Demeza || {};
    const L = D.Log;

    L && L.log && L.log('[Boot] game_boot');

    D.NavUI && D.NavUI.init && D.NavUI.init();
    D.Simulator && D.Simulator.init && D.Simulator.init();

    // Game uses workspace sizing + canvas input too.
    D.WorkspaceInput && D.WorkspaceInput.init && D.WorkspaceInput.init();
    D.WorkspaceSystem && D.WorkspaceSystem.init && D.WorkspaceSystem.init();

    // Mobile-only: rotate to play.
    D.RotateGate && D.RotateGate.init && D.RotateGate.init();
  });
})();
