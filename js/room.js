/* ============================================================
   room.js — compact, walkable neighborhood hub.
   The neighborhood is a small open space between weekly decisions:
   explore, talk to locals, then return home to plan the budget.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var places = [
    { id: 'home', x: 20, y: 24, label: 'BAHAY', title: 'Bahay', text: 'Dito ka nagpapahinga at nagpa-plano. Balik tayo sa budget?', action: 'budget' },
    { id: 'school', x: 226, y: 22, label: 'ESKWELA', title: 'Eskwela', text: '“Unahin ang klase at scholarship. Isang linggo lang ang bawat desisyon.”' },
    { id: 'store', x: 25, y: 178, label: 'SARI-SARI', title: 'Sari-sari store', text: 'Ate sa tindahan: “Isulat muna ang bibilhin. Madaling lumaki ang tingi-tingi.”' },
    { id: 'court', x: 230, y: 178, label: 'BARANGAY', title: 'Barangay court', text: 'May naglalaro sa court. “Libre ang tambay dito—di kailangan gumastos para makasama.”' },
    { id: 'cafe', x: 128, y: 93, label: 'COMPUTERAN', title: 'Computeran', text: 'May kumikislap na “FREE SPINS” sa screen. Mukhang promo, pero ad lang iyon.' }
  ];

  Diskarte.room = {
    build: function (container, onAction) {
      var root = el('div', 'room room--world');
      root.setAttribute('aria-label', 'Neighborhood to explore');
      root.appendChild(el('div', 'world__sky'));
      root.appendChild(el('div', 'world__road'));
      root.appendChild(el('div', 'world__path'));
      root.appendChild(el('div', 'world__sun'));

      var status = el('div', 'world__message', 'Lakarin ang barangay. Lapit sa lugar at pindutin ang INTERACT.');
      root.appendChild(status);

      var player = el('div', 'world__player');
      if (Diskarte.sprites) player.innerHTML = Diskarte.sprites.character;
      player.setAttribute('aria-label', 'Player character');
      root.appendChild(player);

      var controls = el('div', 'world__controls');
      var pad = el('div', 'world__pad');
      var dirs = [
        { key: 'ArrowUp', label: '▲', x: 1, y: 0 },
        { key: 'ArrowLeft', label: '◀', x: 0, y: 1 },
        { key: 'ArrowDown', label: '▼', x: 1, y: 2 },
        { key: 'ArrowRight', label: '▶', x: 2, y: 1 }
      ];
      dirs.forEach(function (d) {
        var b = el('button', 'world__dir', d.label);
        b.type = 'button'; b.setAttribute('aria-label', 'Move ' + d.key.replace('Arrow', '').toLowerCase());
        b.style.gridColumn = String(d.x + 1); b.style.gridRow = String(d.y + 1);
        b.addEventListener('click', function () { move(d.x === 1 ? 0 : (d.x === 0 ? -1 : 1), d.y === 0 ? -1 : (d.y === 2 ? 1 : 0)); });
        pad.appendChild(b);
      });
      controls.appendChild(pad);
      var interact = el('button', 'btn btn--green world__interact', 'Interact');
      interact.type = 'button'; interact.addEventListener('click', activateNearby);
      controls.appendChild(interact);

      var pos = { x: 166, y: 135 };
      var nearby = null;
      var buttons = [];
      function distance(a, b) {
        var dx = (a.x + 9) - (b.x + 36), dy = (a.y + 14) - (b.y + 25);
        return Math.sqrt(dx * dx + dy * dy);
      }
      function refresh() {
        player.style.left = pos.x + 'px'; player.style.top = pos.y + 'px';
        nearby = null; var closest = 999;
        places.forEach(function (p, i) {
          var d = distance(pos, p);
          buttons[i].classList.toggle('is-near', d < 62);
          if (d < closest) { closest = d; nearby = p; }
        });
        interact.disabled = closest >= 78;
        interact.textContent = nearby && closest < 78 ? 'Interact · ' + nearby.title : 'Move closer';
      }
      function move(dx, dy) {
        pos.x = Math.max(4, Math.min(302, pos.x + dx * 14));
        pos.y = Math.max(58, Math.min(226, pos.y + dy * 14));
        refresh();
      }
      function activate(p) {
        if (!p) return;
        status.textContent = p.text;
        if (p.action === 'budget') {
          var go = el('button', 'world__go', 'Plan this week’s budget →');
          go.addEventListener('click', function () { onAction('budget'); });
          status.appendChild(document.createTextNode(' ')); status.appendChild(go);
        }
      }
      function activateNearby() {
        if (!nearby || distance(pos, nearby) >= 78) return;
        activate(nearby);
      }

      places.forEach(function (p) {
        var b = el('button', 'world__place world__place--' + p.id);
        b.type = 'button'; b.style.left = p.x + 'px'; b.style.top = p.y + 'px';
        b.appendChild(el('span', 'world__building'));
        b.appendChild(el('span', 'world__label', p.label));
        b.setAttribute('aria-label', p.title + ', walk close and interact');
        b.addEventListener('click', function () {
          pos.x = Math.max(4, Math.min(302, p.x + 34));
          pos.y = Math.max(58, Math.min(226, p.y + 52));
          refresh(); activate(p);
        });
        buttons.push(b); root.appendChild(b);
      });
      root.appendChild(controls);
      // Place controls above the map interaction layer.
      controls.classList.add('world__controls--overlay');
      refresh();

      function onKey(e) {
        if (e.target && e.target.closest && e.target.closest('button')) return;
        var delta = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] }[e.key];
        if (delta && root.isConnected) { e.preventDefault(); move(delta[0], delta[1]); }
        else if ((e.key === 'e' || e.key === 'Enter') && root.isConnected) { e.preventDefault(); activateNearby(); }
      }
      document.addEventListener('keydown', onKey);
      // Remove this scene's keyboard listener when its screen is replaced.
      var observer = new MutationObserver(function () {
        if (!root.isConnected) { document.removeEventListener('keydown', onKey); observer.disconnect(); }
      });
      observer.observe(container, { childList: true, subtree: true });
      container.appendChild(root);
    }
  };
})();
