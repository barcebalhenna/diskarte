/* ============================================================
   room.js — Milestone 8: the walkable Week Hub room.
   A small pixel room you move around (arrow keys / WASD, or tap).
   Walk to the desk and interact to start the week's budget; other
   objects give flavor. The HUD still sits above it and the loop/state
   machine is unchanged — the desk just triggers "Plan Budget".

   onAction(id) is called when an object is activated ('budget' starts
   the week). The animation loop self-stops when the room leaves the DOM.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var W = 328, H = 300;          // room logical size (px, inside the stage)
  var SPEED = 2.6;               // walk speed (px/frame)
  var CHAR_W = 18, CHAR_H = 26;
  var REACH = 26;                // how close the desk must be to interact

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Interactable objects. 'budget' starts the week (walk + interact); the
  // rest are flavor (tap to read). Coords: wall is y<110, floor is y>=120.
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
    // Build the room into `container`; `onAction('budget')` starts the week.
    build: function (container, onAction) {
      var root = el('div', 'room');
      root.appendChild(el('div', 'room__wall'));
      root.appendChild(el('div', 'room__floor'));

      var objs = makeObjects();
      var flavorTimer = null;

      objs.forEach(function (o) {
        var d = el('div', 'room__obj room__' + o.id);
        d.style.left = o.x + 'px'; d.style.top = o.y + 'px';
        d.style.width = o.w + 'px'; d.style.height = o.h + 'px';
        d.setAttribute('role', 'button');
        d.setAttribute('tabindex', '0');
        d.setAttribute('aria-label', o.label);
        if (o.id === 'desk')   d.appendChild(el('div', 'room__laptop'));
        if (o.id === 'window') d.appendChild(el('div', 'room__winpane'));
        if (o.id === 'bed')    d.appendChild(el('div', 'room__pillow'));
        root.appendChild(d);

        d.addEventListener('click', function (e) {
          e.stopPropagation();
          if (o.budget) walkTo(objFront(o), o); else showFlavor(o.flavor);
        });
        d.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(o); }
        });
      });

      var charEl = el('div', 'room__char');
      charEl.appendChild(el('div', 'room__char-head'));
      charEl.appendChild(el('div', 'room__char-body'));
      root.appendChild(charEl);

      var prompt = el('div', 'room__prompt');
      prompt.hidden = true;
      root.appendChild(prompt);
      root.appendChild(el('div', 'room__hint', 'Arrow keys / WASD · i-tap ang desk'));

      container.appendChild(root);

      var pos = { x: 164, y: 240 }, target = null, pending = null, keys = {};

      function objFront(o) { return { x: o.x + o.w / 2, y: Math.max(130, o.y - 6) }; }
      function walkTo(pt, o) { target = { x: pt.x, y: pt.y }; pending = o || null; }
      function activate(o) {
        if (o.budget) onAction('budget'); else showFlavor(o.flavor);
      }
      function showFlavor(t) {
        prompt.hidden = false;
        prompt.classList.add('is-flavor');
        prompt.textContent = t;
        if (flavorTimer) clearTimeout(flavorTimer);
        flavorTimer = setTimeout(function () {
          prompt.classList.remove('is-flavor');
          prompt.hidden = true;
        }, 2600);
      }
      function deskNear() {
        for (var i = 0; i < objs.length; i++) {
          var o = objs[i];
          if (!o.budget) continue;
          var nx = Math.max(o.x, Math.min(pos.x, o.x + o.w));
          var ny = Math.max(o.y, Math.min(pos.y, o.y + o.h));
          if (Math.hypot(pos.x - nx, pos.y - ny) < REACH) return o;
        }
        return null;
      }
      function render() {
        charEl.style.left = (pos.x - CHAR_W / 2) + 'px';
        charEl.style.top = (pos.y - CHAR_H) + 'px';
      }

      function kd(e) {
        var k = e.key.toLowerCase();
        if (k === 'arrowleft' || k === 'a') keys.left = 1;
        else if (k === 'arrowright' || k === 'd') keys.right = 1;
        else if (k === 'arrowup' || k === 'w') keys.up = 1;
        else if (k === 'arrowdown' || k === 's') keys.down = 1;
        else if (k === 'enter' || k === ' ') { var n = deskNear(); if (n) { e.preventDefault(); activate(n); } return; }
        else return;
        e.preventDefault();
      }
      function ku(e) {
        var k = e.key.toLowerCase();
        if (k === 'arrowleft' || k === 'a') keys.left = 0;
        else if (k === 'arrowright' || k === 'd') keys.right = 0;
        else if (k === 'arrowup' || k === 'w') keys.up = 0;
        else if (k === 'arrowdown' || k === 's') keys.down = 0;
      }
      document.addEventListener('keydown', kd);
      document.addEventListener('keyup', ku);

      // tap the floor to walk there
      root.addEventListener('click', function (e) {
        var r = root.getBoundingClientRect();
        var scale = r.width / W || 1;
        walkTo({ x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }, null);
      });

      function frame() {
        if (!root.isConnected) {
          document.removeEventListener('keydown', kd);
          document.removeEventListener('keyup', ku);
          if (flavorTimer) clearTimeout(flavorTimer);
          return;
        }
        var vx = 0, vy = 0, moving = false;
        if (keys.left) vx -= SPEED; if (keys.right) vx += SPEED;
        if (keys.up) vy -= SPEED; if (keys.down) vy += SPEED;
        if (vx || vy) { target = null; pending = null; pos.x += vx; pos.y += vy; moving = true; }
        else if (target) {
          var dx = target.x - pos.x, dy = target.y - pos.y, d = Math.hypot(dx, dy);
          if (d < SPEED) {
            pos.x = target.x; pos.y = target.y;
            var p = pending; target = null; pending = null;
            if (p) activate(p);
          } else { pos.x += dx / d * SPEED; pos.y += dy / d * SPEED; moving = true; }
        }
        // keep the character on the floor
        pos.x = Math.max(14, Math.min(W - 14, pos.x));
        pos.y = Math.max(128, Math.min(H - 8, pos.y));
        charEl.classList.toggle('is-walking', moving);
        render();

        if (!prompt.classList.contains('is-flavor')) {
          var near = deskNear();
          if (near) { prompt.hidden = false; prompt.textContent = '▶ ' + near.label + ' (Space)'; }
          else prompt.hidden = true;
        }
        requestAnimationFrame(frame);
      }
      render();
      requestAnimationFrame(frame);
    }
  };
})();
