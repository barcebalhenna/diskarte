/* ============================================================
   main.js — boots the game and scales the stage to the window.
   (Milestone 0)
   ============================================================ */
(function () {
  function scaleStage() {
    var stage = document.getElementById('stage');
    if (!stage) return;
    // logical size from CSS vars (fallback 360x640)
    var w = 360, h = 640;
    // fit the stage inside the window, keep aspect, letterbox the rest
    var scale = Math.min(window.innerWidth / w, window.innerHeight / h);
    stage.style.transform = 'scale(' + scale + ')';
  }

  function boot() {
    scaleStage();
    window.addEventListener('resize', scaleStage);
    Diskarte.screens.init(document.getElementById('screen'));
    // Handy for debugging in the console:
    window.D = Diskarte;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
