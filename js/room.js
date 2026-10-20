/* ============================================================
   room.js — Milestone 8: the Week Hub room (static).
   A small pixel room: wall, window, door, bed, and a desk with a
   glowing laptop, plus the character standing by it. Tap the desk to
   start the week's budget; other objects give a line of flavor. The
   HUD sits above it and a Plan Budget button is the reliable fallback.

   onAction(id) fires when an object is activated ('budget' starts the
   week). Purely static — no movement loop or key handlers to clean up.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Objects (px within the room). 'budget' starts the week; rest are flavor.
  // Wall is y<110, floor y>=120.
  function makeObjects() {
    return [
      { id: 'window', x: 34,  y: 30, w: 70, h: 56, label: 'Window', flavor: 'Umaga na. Simula ng linggo.' },
      { id: 'door',   x: 232, y: 24, w: 46, h: 76, label: 'Pinto',  flavor: 'Lalabas? Baon-aware tayo sa gastos.' },
      { id: 'bed',    x: 14,  y: 150, w: 96, h: 64, label: 'Kama',   flavor: 'Antok… pero kulang pa ang baon.' },
      { id: 'desk',   x: 196, y: 150, w: 110, h: 50, label: 'Plan Budget', budget: true },
      { id: 'phone',  x: 214, y: 128, w: 16, h: 22, label: 'Phone',  flavor: 'Mamaya na — mag-budget muna sa desk.' }
    ];
  }

  Diskarte.room = {
    // Build the static room into `container`; `onAction('budget')` starts the week.
    build: function (container, onAction) {
      var root = el('div', 'room room--static');
      root.appendChild(el('div', 'room__wall'));
      root.appendChild(el('div', 'room__floor'));

      var prompt = el('div', 'room__prompt');
      prompt.hidden = true;
      var flavorTimer = null;

      function activate(o) {
        if (o.budget) onAction('budget');
        else showFlavor(o.flavor);
      }
      function showFlavor(t) {
        prompt.hidden = false;
        prompt.classList.add('is-flavor');
        prompt.textContent = t;
        if (flavorTimer) clearTimeout(flavorTimer);
        flavorTimer = setTimeout(function () {
          if (!prompt.isConnected) return;
          prompt.classList.remove('is-flavor');
          prompt.hidden = true;
        }, 2600);
      }

      makeObjects().forEach(function (o) {
        var d = el('div', 'room__obj room__' + o.id);
        d.style.left = o.x + 'px'; d.style.top = o.y + 'px';
        d.style.width = o.w + 'px'; d.style.height = o.h + 'px';
        d.setAttribute('role', 'button');
        d.setAttribute('tabindex', '0');
        d.setAttribute('aria-label', o.label);
        if (o.id === 'desk')   d.appendChild(el('div', 'room__laptop'));
        if (o.id === 'window') d.appendChild(el('div', 'room__winpane'));
        if (o.id === 'bed')    d.appendChild(el('div', 'room__pillow'));
        d.addEventListener('click', function (e) { e.stopPropagation(); activate(o); });
        d.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(o); }
        });
        root.appendChild(d);
      });

      // character standing by the desk (static)
      var charEl = el('div', 'room__char');
      charEl.style.left = '168px';
      charEl.style.top = '202px';
      charEl.appendChild(el('div', 'room__char-head'));
      charEl.appendChild(el('div', 'room__char-body'));
      root.appendChild(charEl);

      root.appendChild(prompt);
      root.appendChild(el('div', 'room__hint', 'I-tap ang desk para mag-budget'));
      container.appendChild(root);
    }
  };
})();
