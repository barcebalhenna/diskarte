/* ============================================================
   dev.js — TEMPORARY dev panel (Milestone 1 only)
   Lets you mutate Diskarte.state by hand so you can watch the HUD
   update live and prove the 0..100 clamping. Everything here is
   behind the DEV flag and lives in this one file — to remove it for
   a build, delete the <script src="js/dev.js"> line in index.html.

   You can also drive state from the browser console, e.g.
       D.set('meterFood', 5)
       D.update({ compulsion: 60, gambleCount: 1 })
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var DEV = true;                 // flip to false to disable without unlinking
  if (!DEV) return;

  function bump(key, delta) {
    Diskarte.set(key, Diskarte.state[key] + delta);
  }

  function simulateGamble() {
    // +12 compulsion / +1 gamble count (the M5 numbers) — also reveals the
    // compulsion bar, which is locked until the first gamble.
    Diskarte.update({
      compulsion: Diskarte.state.compulsion + 12,
      gambleCount: Diskarte.state.gambleCount + 1
    });
  }

  function reset() {
    Diskarte.resetState(Diskarte.state.path);
  }

  // [label, handler] pairs. Grouped roughly by what they touch.
  var BUTTONS = [
    ['Cash +100', function () { bump('cash', 100); }],
    ['Cash -100', function () { bump('cash', -100); }],
    ['Save +100', function () { bump('savings', 100); }],
    ['Save -100', function () { bump('savings', -100); }],
    ['Debt +100', function () { bump('debt', 100); }],
    ['Debt -100', function () { bump('debt', -100); }],
    ['Food +10',  function () { bump('meterFood', 10); }],
    ['Food -10',  function () { bump('meterFood', -10); }],
    ['Enrg +10',  function () { bump('meterEnergy', 10); }],
    ['Enrg -10',  function () { bump('meterEnergy', -10); }],
    ['Trust +10', function () { bump('meterTrust', 10); }],
    ['Trust -10', function () { bump('meterTrust', -10); }],
    ['Gamble',    simulateGamble],
    ['Week +1',   function () { bump('week', 1); }],
    ['Reset',     reset]
  ];

  function build() {
    var panel = document.createElement('div');
    panel.id = 'dev-panel';
    panel.hidden = true;

    var title = document.createElement('div');
    title.className = 'dev__title';
    title.textContent = 'DEV (`)';
    panel.appendChild(title);

    var grid = document.createElement('div');
    grid.className = 'dev__grid';
    BUTTONS.forEach(function (pair) {
      var b = document.createElement('button');
      b.className = 'dev__btn';
      b.textContent = pair[0];
      b.addEventListener('click', pair[1]);
      grid.appendChild(b);
    });
    panel.appendChild(grid);

    var toggle = document.createElement('button');
    toggle.id = 'dev-toggle';
    toggle.textContent = 'DEV';
    toggle.addEventListener('click', function () { panel.hidden = !panel.hidden; });

    // Fixed overlay on the body (NOT inside the scaled #stage, so the buttons
    // stay a usable size regardless of the stage scale).
    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    // Backtick toggles the panel.
    document.addEventListener('keydown', function (e) {
      if (e.key === '`') { panel.hidden = !panel.hidden; }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
