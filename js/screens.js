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

  // Build a screen from a definition. A def may supply a custom build(scr)
  // step (the Hub uses it for the live HUD); otherwise we render the
  // standard placeholder body (tag / title / desc). Actions are appended
  // for every screen either way.
  function render(def) {
    // The HUD listens for state changes; detach it before we wipe the DOM so
    // a change fired from another screen doesn't write to dead nodes.
    if (Diskarte.hud) Diskarte.hud.unmount();

    mount.innerHTML = '';
    var scr = el('div', 'scr' + (def.phone ? ' scr--phone' : ''));

    if (typeof def.build === 'function') {
      def.build(scr);
    } else {
      scr.appendChild(el('div', 'scr__tag', def.tag));
      scr.appendChild(el('div', 'scr__title', def.title));
      scr.appendChild(el('div', 'scr__desc', def.desc));
    }

    // Actions bar. An action may carry an optional `do()` side-effect that
    // runs before navigating (used to apply allocation / advance the week at
    // their flow-correct screens). Skipped entirely when a screen defines no
    // actions (e.g. the Budget screen builds its own Confirm button).
    if (def.actions && def.actions.length) {
      var actions = el('div', 'scr__actions');
      def.actions.forEach(function (a) {
        var b = el('button', 'btn' + (a.variant ? ' btn--' + a.variant : ''), a.label);
        b.addEventListener('click', function () {
          if (typeof a.do === 'function') a.do();
          Diskarte.screens.show(a.to);
        });
        actions.appendChild(b);
      });
      scr.appendChild(actions);
    }
    mount.appendChild(scr);
  }

  function fmtPeso(n) { return '₱' + Math.round(n).toLocaleString('en-US'); }

  // ----- S3 Budget Allocation screen (M2) -----
  // A stepper per need + an optional Savings row, a live remainder readout,
  // and a Confirm button that commits the draft (can't over-spend) then goes
  // to the Life Event. Meter effects are applied later at S8 (Flow Spec §2).
  function buildBudget(scr) {
    var B = Diskarte.budget;
    var draft = B.suggestDraft();   // fresh plan each time the screen opens

    scr.appendChild(el('div', 'scr__tag', 'S3 · Budget · M2'));
    scr.appendChild(el('div', 'scr__title', 'Budget — Week ' + Diskarte.state.week));

    var cashRow = el('div', 'bud__cash');
    var cashChip = el('span', 'chip chip--cash');
    var remChip = el('span', 'chip bud__rem');
    cashRow.appendChild(cashChip);
    cashRow.appendChild(remChip);
    scr.appendChild(cashRow);

    scr.appendChild(el('div', 'bud__hint',
      'Fund your needs, keep a buffer. Under-funding a need drains its meter on the week.'));

    var rowsWrap = el('div', 'bud__rows');
    scr.appendChild(rowsWrap);

    var rowRefs = [];
    function makeRow(key, label, costLabel) {
      var row = el('div', 'bud__row');
      var info = el('div', 'bud__info');
      info.appendChild(el('span', 'bud__name', label));
      info.appendChild(el('span', 'bud__cost', costLabel));
      row.appendChild(info);

      var step = el('div', 'bud__step');
      var minus = el('button', 'bud__btn', '−');
      var valEl = el('span', 'bud__val', '');
      var plus = el('button', 'bud__btn', '+');
      step.appendChild(minus);
      step.appendChild(valEl);
      step.appendChild(plus);
      row.appendChild(step);
      rowsWrap.appendChild(row);

      minus.addEventListener('click', function () {
        draft[key] = Math.max(0, (draft[key] || 0) - B.STEP);
        refresh();
      });
      plus.addEventListener('click', function () {
        var rem = B.remainder(draft);
        if (rem > 0) { draft[key] = (draft[key] || 0) + Math.min(B.STEP, rem); refresh(); }
      });
      return { key: key, valEl: valEl, minus: minus, plus: plus };
    }

    B.NEEDS.forEach(function (n) {
      rowRefs.push(makeRow(n.key, n.label, 'of ' + fmtPeso(n.cost)));
    });
    rowRefs.push(makeRow('savings', 'Savings', 'buffer'));

    var actions = el('div', 'scr__actions');
    var confirm = el('button', 'btn btn--green', 'Confirm allocation');
    confirm.addEventListener('click', function () {
      if (B.commit(draft)) Diskarte.screens.show('event');
    });
    actions.appendChild(confirm);
    scr.appendChild(actions);

    function refresh() {
      var rem = B.remainder(draft);
      cashChip.textContent = 'Cash ' + fmtPeso(Diskarte.state.cash);
      remChip.textContent = 'Left ' + fmtPeso(rem);
      remChip.className = 'chip bud__rem' + (rem === 0 ? ' is-zero' : '');
      rowRefs.forEach(function (r) {
        r.valEl.textContent = fmtPeso(draft[r.key] || 0);
        r.minus.disabled = (draft[r.key] || 0) <= 0;
        r.plus.disabled = rem <= 0;
      });
    }
    refresh();
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
      // Custom layout: live HUD on top, a sprite placeholder in the middle
      // (real art is M8), and the Plan Budget action appended by render().
      build: function (scr) {
        Diskarte.hud.mount(scr);

        var scene = el('div', 'hub__scene');
        scene.appendChild(el('div', 'scr__tag', this.tag));
        scene.appendChild(el('div', 'scr__title', this.title));
        var sprite = el('div', 'hub__sprite', '[ character / room — M8 ]');
        scene.appendChild(sprite);
        scr.appendChild(scene);
      },
      actions: [{ label: 'Plan Budget', to: 'budget' }]
    },
    budget: {
      id: 'budget', tag: 'S3 · Budget · M2',
      title: 'Budget Allocation',
      // Full allocation UI. No `actions` — it builds its own Confirm button so
      // it can validate + commit the draft before navigating to the event.
      build: function (scr) { buildBudget(scr); },
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
      // Flow Spec S8: apply this week's allocation to the meters (M5 builds the
      // full screen; the meter pass is wired here now so M2 is testable).
      actions: [{ label: 'Continue', to: 'debrief', do: function () { Diskarte.budget.applyAllocationToMeters(); } }]
    },
    debrief: {
      id: 'debrief', tag: 'S9 · Weekly Debrief · M6',
      title: 'Weekly\nDebrief',
      desc: 'Your own numbers, one reflective line. Then next week — or the ending after Week 3.',
      // Flow Spec S9->S2: "Next Week" advances the week (+income, debt ×1.2,
      // compulsion decay). M6 builds the real debrief; logic is wired here now.
      actions: [
        { label: 'Next Week', to: 'hub', do: function () { Diskarte.budget.endWeek(); } },
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
      // currentScreen is router state, not a §6 game field — keep it off state.
      Diskarte.screens.current = id;
      render(def);
    },
    init: function (mountEl) {
      mount = mountEl;
      this.show('title');
    },
    _defs: SCREENS
  };
})();
