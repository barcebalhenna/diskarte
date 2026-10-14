/* ============================================================
   hud.js — the Week Hub HUD (Milestone 1)
   Reads ONLY from Diskarte.state and redraws on every change.
   Pieces: week counter, money row (cash/savings/debt), the three
   need-meters (Food/Energy/Trust) as segmented pixel bars, and the
   compulsion bar. All values clamped 0..100 at draw time as a backup.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var SEGMENTS = 10;        // each bar is 10 blocks; one block = 10 points

  // Compulsion bands (SRS §6 thresholds). Effects arrive in M5; this is label-only.
  function compulsionBand(v) {
    if (v >= 100) return { cls: 'is-addiction', label: 'Addiction' };
    if (v >= 70)  return { cls: 'is-hooked',    label: 'Hooked' };
    if (v >= 40)  return { cls: 'is-urge',      label: 'Urge' };
    return { cls: 'is-control', label: 'In control' };
  }

  // Need-meter colour band. SRS treats Energy < 20 as its danger point, so
  // low = red, mid = warm, healthy = green — same thresholds for all three.
  function meterBand(v) {
    if (v < 20) return 'is-danger';
    if (v < 40) return 'is-warn';
    return 'is-good';
  }

  function peso(n) {
    // ₱1,500 — thousands separators, no decimals (whole pesos only).
    return '₱' + Math.round(n).toLocaleString('en-US');
  }

  function clamp100(v) { return Math.max(0, Math.min(100, Math.round(v))); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Build one segmented bar; returns { bar, segs:[...] } so update() can
  // flip blocks on/off without rebuilding the DOM (no flicker).
  function buildBar(cls) {
    var bar = el('div', 'meter__bar ' + cls);
    var segs = [];
    for (var i = 0; i < SEGMENTS; i++) {
      var seg = el('i', 'seg');
      bar.appendChild(seg);
      segs.push(seg);
    }
    return { bar: bar, segs: segs };
  }

  function fillSegs(built, value) {
    var on = Math.round(clamp100(value) / (100 / SEGMENTS));
    for (var i = 0; i < built.segs.length; i++) {
      built.segs[i].className = 'seg' + (i < on ? ' seg--on' : '');
    }
  }

  // Build a labelled meter row (name + numeric value + bar).
  function buildMeter(key, name) {
    var row = el('div', 'meter');
    var top = el('div', 'meter__top');
    var nameEl = el('span', 'meter__name', name);
    var valEl = el('span', 'meter__val', '');
    top.appendChild(nameEl);
    top.appendChild(valEl);
    var built = buildBar('');
    row.appendChild(top);
    row.appendChild(built.bar);
    return { key: key, row: row, val: valEl, bar: built.bar, segs: built.segs };
  }

  // --- the HUD module ------------------------------------------------------
  var refs = null;          // DOM references, set on mount()
  var mounted = false;

  var hud = {
    isMounted: function () { return mounted; },

    // Build the HUD DOM, append it to `container`, draw once, return the root.
    mount: function (container) {
      var root = el('div', 'hud');

      var week = el('div', 'hud__week', '');

      var money = el('div', 'hud__money');
      var cash = el('span', 'chip chip--cash', '');
      var save = el('span', 'chip chip--save', '');
      var debt = el('span', 'chip chip--debt', '');
      money.appendChild(cash);
      money.appendChild(save);
      money.appendChild(debt);

      var meters = el('div', 'hud__meters');
      var food = buildMeter('meterFood', 'Food');
      var energy = buildMeter('meterEnergy', 'Energy');
      var trust = buildMeter('meterTrust', 'Trust');
      meters.appendChild(food.row);
      meters.appendChild(energy.row);
      meters.appendChild(trust.row);

      // Compulsion sits apart (it's the danger meter). Hidden until first
      // gamble per SRS §6 — shown as a locked "???" slot before then.
      var comp = el('div', 'meter meter--comp');
      var compTop = el('div', 'meter__top');
      var compName = el('span', 'meter__name', 'Compulsion');
      var compVal = el('span', 'meter__val', '');
      compTop.appendChild(compName);
      compTop.appendChild(compVal);
      var compBuilt = buildBar('');
      var compLock = el('div', 'meter__lock', '???');  // shown pre-first-gamble
      comp.appendChild(compTop);
      comp.appendChild(compBuilt.bar);
      comp.appendChild(compLock);

      root.appendChild(week);
      root.appendChild(money);
      root.appendChild(meters);
      root.appendChild(comp);
      container.appendChild(root);

      refs = {
        root: root, week: week,
        cash: cash, save: save, debt: debt,
        meters: [food, energy, trust],
        comp: { row: comp, val: compVal, bar: compBuilt.bar,
                segs: compBuilt.segs, lock: compLock }
      };
      mounted = true;
      hud.update();
      return root;
    },

    // Called when the hub screen is torn down, so stale change-events are ignored.
    unmount: function () { mounted = false; refs = null; },

    // Re-read state and refresh every piece. Cheap; safe to call on any change.
    update: function () {
      if (!refs) return;
      var s = Diskarte.state;

      refs.week.textContent = 'WEEK ' + s.week + '/3';

      refs.cash.textContent = peso(s.cash);
      refs.save.textContent = 'Save ' + peso(s.savings);
      refs.debt.textContent = 'Debt ' + peso(s.debt);
      // tint when they carry meaning: savings green, debt red
      refs.save.className = 'chip chip--save' + (s.savings > 0 ? ' is-on' : '');
      refs.debt.className = 'chip chip--debt' + (s.debt > 0 ? ' is-on' : '');

      for (var i = 0; i < refs.meters.length; i++) {
        var m = refs.meters[i];
        var v = clamp100(s[m.key]);
        m.val.textContent = v;
        m.bar.className = 'meter__bar ' + meterBand(v);
        fillSegs(m, v);
      }

      // Compulsion: locked until the first gamble.
      var c = refs.comp;
      if (s.gambleCount < 1) {
        c.row.className = 'meter meter--comp is-locked';
        c.val.textContent = '';
        c.lock.textContent = '???';
      } else {
        var cv = clamp100(s.compulsion);
        var band = compulsionBand(cv);
        c.row.className = 'meter meter--comp ' + band.cls;
        c.val.textContent = cv + ' · ' + band.label;
        c.bar.className = 'meter__bar meter__bar--comp ' + band.cls;
        fillSegs(c, cv);
      }
    }
  };

  // Redraw whenever state changes, but only while the HUD is on screen.
  Diskarte.onChange(function () { if (mounted) hud.update(); });

  Diskarte.hud = hud;
})();
