/* ============================================================
   screens.js — screen router + 11 placeholder screens (Milestone 0)
   The placeholders already wire the FULL state machine from the
   Flow & Scripted-Path Spec, so you can walk the whole game loop
   now. Each real screen gets built at its milestone.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var mount = null; // #screen element, set on init

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Build a standard placeholder screen from a definition.
  function render(def) {
    mount.innerHTML = '';
    var scr = el('div', 'scr' + (def.phone ? ' scr--phone' : ''));

    // Tiny live HUD on the Week Hub to prove state is wired (M1 expands this).
    if (def.id === 'hub') {
      var s = Diskarte.state;
      var hud = el('div', 'hud');
      hud.appendChild(el('span', null, 'Week ' + s.week + '/3'));
      hud.appendChild(el('span', null, '₱' + s.cash));
      hud.appendChild(el('span', null, 'Save ₱' + s.savings));
      hud.appendChild(el('span', null, 'Debt ₱' + s.debt));
      scr.appendChild(hud);
    }

    scr.appendChild(el('div', 'scr__tag', def.tag));
    scr.appendChild(el('div', 'scr__title', def.title));
    scr.appendChild(el('div', 'scr__desc', def.desc));

    var actions = el('div', 'scr__actions');
    (def.actions || []).forEach(function (a) {
      var b = el('button', 'btn' + (a.variant ? ' btn--' + a.variant : ''), a.label);
      b.addEventListener('click', function () { Diskarte.screens.show(a.to); });
      actions.appendChild(b);
    });
    scr.appendChild(actions);
    mount.appendChild(scr);
  }

  // --- Screen definitions (placeholders). Transitions = Flow Spec §2. ---
  var SCREENS = {
    title: {
      id: 'title', tag: 'S0 · Title',
      title: 'DISKARTE',
      desc: 'Survive the month. Outsmart the odds. (Title / Main Menu — Start, How to Play, Mute.)',
      actions: [{ label: 'Start', to: 'char', variant: 'green' }]
    },
    char: {
      id: 'char', tag: 'S1 · Character Select · M0',
      title: 'Choose Your\nDiskarte',
      desc: 'Iskolar (default) · Tindera’s kid · Call-center newbie. Each is a different income and difficulty.',
      actions: [{ label: 'Confirm: Iskolar', to: 'hub', variant: 'green' }]
    },
    hub: {
      id: 'hub', tag: 'S2 · Week Hub · M1',
      title: 'Week Hub',
      desc: 'HUD + meters + compulsion live here (built in M1). Start of each week.',
      actions: [{ label: 'Plan Budget', to: 'budget' }]
    },
    budget: {
      id: 'budget', tag: 'S3 · Budget · M2',
      title: 'Budget\nAllocation',
      desc: 'Split income across needs; keep a buffer. Validation: can’t exceed cash.',
      actions: [{ label: 'Confirm allocation', to: 'event' }]
    },
    event: {
      id: 'event', tag: 'S4 · Life Event · M3',
      title: 'Life-Event\nCard',
      desc: 'An unexpected cost or choice (or a positive raket). 1–3 options.',
      actions: [{ label: 'Resolve choice', to: 'ad' }]
    },
    ad: {
      id: 'ad', tag: 'S5 · Temptation Ad (phone) · M4', phone: true,
      title: 'Temptation Ad',
      desc: 'A gambling ad on your phone, full of dark patterns. Play, or report/dismiss?',
      actions: [
        { label: 'Play', to: 'spin', variant: 'red' },
        { label: 'Report / Dismiss', to: 'conseq', variant: 'green' }
      ]
    },
    spin: {
      id: 'spin', tag: 'S6 · Gambling Minigame (phone) · M4', phone: true,
      title: 'Gambling\nMinigame',
      desc: 'Rigged-but-honest spin. The odds tracker is always on screen (M4).',
      actions: [{ label: 'Spin', to: 'result', variant: 'red' }]
    },
    result: {
      id: 'result', tag: 'S7 · Result / The Chase · M4', phone: true,
      title: 'Result /\nThe Chase',
      desc: 'Win or loss revealed. “Play again?” is the chase.',
      actions: [
        { label: 'Play again (chase)', to: 'spin', variant: 'red' },
        { label: 'Stop', to: 'conseq', variant: 'ghost' }
      ]
    },
    conseq: {
      id: 'conseq', tag: 'S8 · Consequence / Debt · M5',
      title: 'Consequence\n/ Debt',
      desc: 'Meters, cash and debt update. Loan-shark (5-6) offer. Compulsion band warnings.',
      actions: [{ label: 'Continue', to: 'debrief' }]
    },
    debrief: {
      id: 'debrief', tag: 'S9 · Weekly Debrief · M6',
      title: 'Weekly\nDebrief',
      desc: 'Your own numbers, one reflective line. Then next week — or the ending after Week 3.',
      actions: [
        { label: 'Next Week', to: 'hub' },
        { label: 'Finish → WIN', to: 'end_win', variant: 'green' },
        { label: 'Finish → LOSE', to: 'end_lose', variant: 'red' }
      ]
    },
    end_win: {
      id: 'end_win', tag: 'S10 · End — Win · M6',
      title: 'YOU WIN',
      desc: 'Stability is the real win. Final figures + replay.',
      actions: [{ label: 'Replay', to: 'char', variant: 'green' }]
    },
    end_lose: {
      id: 'end_lose', tag: 'S11 · End — Lose · M6',
      title: 'GAME OVER',
      desc: 'The spiral recap + a non-judgmental support message (FR-15). Replay.',
      actions: [{ label: 'Replay', to: 'char', variant: 'red' }]
    }
  };

  Diskarte.screens = {
    show: function (id) {
      var def = SCREENS[id];
      if (!def) { console.warn('Unknown screen:', id); return; }
      Diskarte.state.currentScreen = id;
      render(def);
    },
    init: function (mountEl) {
      mount = mountEl;
      this.show('title');
    },
    _defs: SCREENS
  };
})();
