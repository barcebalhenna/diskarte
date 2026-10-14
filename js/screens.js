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

  // Snapshot the economy at the start of a week so the Consequence screen can
  // show what changed. Taken on every Hub entry (week start, Flow Spec §1).
  function snapshotWeek() {
    var s = Diskarte.state;
    Diskarte.state.weekStart = {
      cash: s.cash, savings: s.savings, debt: s.debt,
      meterFood: s.meterFood, meterEnergy: s.meterEnergy, meterTrust: s.meterTrust,
      compulsion: s.compulsion,
      totalWagered: s.totalWagered, totalReturned: s.totalReturned
    };
  }

  // An "unprompted one-more-spin" nudge — the Urge band effect (compulsion ≥ 40).
  function urgeNudge(text) {
    var n = el('div', 'urge');
    n.appendChild(el('div', 'urge__txt', text));
    return n;
  }

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

    // Hooked band locks the safe option — you can't move money to savings.
    var hooked = Diskarte.compulsion.safeOptionsLocked();

    B.NEEDS.forEach(function (n) {
      rowRefs.push(makeRow(n.key, n.label, 'of ' + fmtPeso(n.cost)));
    });
    rowRefs.push(makeRow('savings', 'Savings', hooked ? 'locked · Hooked' : 'buffer'));

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
        r.plus.disabled = rem <= 0 || (r.key === 'savings' && hooked);
      });
    }
    refresh();
  }

  // ----- S4 Life-Event Card screen (M3) -----
  // Shows the one event picked for this week; each choice applies its effects
  // immediately, then a result line + Continue advances to the ad (Flow Spec §2).
  function buildEvent(scr) {
    var ev = Diskarte.events.pick(Diskarte.state.week, Diskarte.state);

    scr.appendChild(el('div', 'scr__tag', 'S4 · Life Event · M3'));
    scr.appendChild(el('div', 'scr__title', ev ? ev.title : 'Life Event'));

    var card = el('div', 'ev__card');
    card.appendChild(el('div', 'ev__body', ev ? ev.body : 'Walang pangyayari ngayong linggo.'));
    scr.appendChild(card);

    var actions = el('div', 'scr__actions');
    scr.appendChild(actions);

    function toAd() { Diskarte.screens.show('ad'); }

    if (!ev) {
      var contOnly = el('button', 'btn', 'Continue');
      contOnly.addEventListener('click', toAd);
      actions.appendChild(contOnly);
      return;
    }

    function showResult(text) {
      actions.innerHTML = '';
      card.appendChild(el('div', 'ev__result', text));
      var cont = el('button', 'btn btn--green', 'Continue');
      cont.addEventListener('click', toAd);
      actions.appendChild(cont);
    }

    var resolved = false;
    ev.choices.forEach(function (c) {
      var disabled = (typeof c.enabled === 'function') && !c.enabled(Diskarte.state);
      var label = c.label + (disabled && c.note ? ' — ' + c.note : '');
      var btn = el('button', 'btn', label);
      if (disabled) btn.disabled = true;
      btn.addEventListener('click', function () {
        if (resolved) return;
        resolved = true;
        showResult(c.apply());
      });
      actions.appendChild(btn);
    });
  }

  // ----- Odds tracker (M4): always visible on the gambling screens -----
  // Shows the TRUE win % for the next spin, total wagered/returned, and the
  // net (red when negative). This is the ethical core — losses stay legible.
  function buildOddsTracker() {
    var G = Diskarte.gamble, s = Diskarte.state;
    var wrap = el('div', 'odds');
    wrap.appendChild(el('div', 'odds__title', 'ODDS TRACKER'));
    var grid = el('div', 'odds__grid');

    function cell(k, v, cls) {
      var c = el('div', 'odds__cell');
      c.appendChild(el('span', 'odds__k', k));
      c.appendChild(el('span', 'odds__v' + (cls ? ' ' + cls : ''), v));
      grid.appendChild(c);
    }

    var net = G.net();
    var netStr = net === 0 ? fmtPeso(0) : (net > 0 ? '+' : '−') + fmtPeso(Math.abs(net));
    cell('True win', G.trueWinPct() + '%');
    cell('Wagered', fmtPeso(s.totalWagered));
    cell('Returned', fmtPeso(s.totalReturned));
    cell('Net', netStr, net < 0 ? 'is-neg' : (net > 0 ? 'is-pos' : ''));
    wrap.appendChild(grid);
    return wrap;
  }

  // Fake countdown for the ad's false-urgency pattern. It loops forever (the
  // "offer" never really ends) and clears itself once its node leaves the DOM.
  // The first paint is unconditional (the node isn't attached yet during
  // build); the interval guards on isConnected so it stops after navigation.
  function startFakeCountdown(node, seconds) {
    var t = seconds;
    function label(n) { return '⏱ Offer ends in 00:' + (n < 10 ? '0' : '') + n; }
    node.textContent = label(t);
    var id = setInterval(function () {
      if (!node.isConnected) { clearInterval(id); return; }
      t = (t <= 0) ? seconds : t - 1;
      node.textContent = label(t);
    }, 1000);
  }

  // ----- S5 Temptation Ad screen (M4) -----
  // A phone ad packed with real dark patterns (SRS §4.2.8): false urgency,
  // social proof, free-first bait, fake authority, near-miss. Play -> minigame;
  // Report/Dismiss -> awareness +1 and skip straight to the consequence.
  function buildAd(scr) {
    scr.appendChild(el('div', 'scr__tag', 'S5 · Temptation Ad · M4'));

    var ad = el('div', 'ad');
    var timer = el('div', 'ad__timer');
    ad.appendChild(timer);
    startFakeCountdown(timer, 15);
    ad.appendChild(el('div', 'ad__head', '🎁 Claim your FREE ₱100 bonus spin!'));
    ad.appendChild(el('div', 'ad__social', '🔥 47 people just won ₱10,000 — ikaw na!'));
    ad.appendChild(el('div', 'ad__endorser', '✔ "Sinubukan ko ’to" — Verified™ idol'));
    ad.appendChild(el('div', 'ad__nearmiss', 'Sayang, muntik na kanina! One more spin — 7 7 7'));
    scr.appendChild(ad);

    scr.appendChild(el('div', 'ad__disclaim',
      'Dark patterns above: fake countdown, "winners" ticker, free bait, fake endorser, near-miss.'));

    var actions = el('div', 'scr__actions');
    var play = el('button', 'btn btn--red', 'Play');
    play.addEventListener('click', function () { Diskarte.screens.show('spin'); });
    var dismiss = el('button', 'btn btn--green', 'Report / Dismiss');
    dismiss.addEventListener('click', function () {
      Diskarte.set('awareness', Diskarte.state.awareness + 1);  // spotted it
      Diskarte.screens.show('conseq');
    });
    actions.appendChild(play);
    actions.appendChild(dismiss);
    scr.appendChild(actions);
  }

  // ----- S6 Gambling Minigame screen (M4) -----
  // Odds tracker on top, a bet-tier picker, and SPIN. Stop bails to the
  // consequence. If cash is below the minimum bet, the chase hits its floor.
  function buildSpin(scr) {
    var G = Diskarte.gamble, s = Diskarte.state;
    scr.appendChild(el('div', 'scr__tag', 'S6 · Gambling Minigame · M4'));
    scr.appendChild(el('div', 'scr__title', 'Spin'));
    scr.appendChild(buildOddsTracker());

    var minBet = G.BET_TIERS[0];
    if (s.cash < minBet) {
      scr.appendChild(el('div', 'ad__disclaim',
        'Wala nang pang-taya (cash < ' + fmtPeso(minBet) + '). The chase has a floor.'));
      var a0 = el('div', 'scr__actions');
      var stop0 = el('button', 'btn btn--ghost', 'Stop');
      stop0.addEventListener('click', function () { Diskarte.screens.show('conseq'); });
      a0.appendChild(stop0);
      scr.appendChild(a0);
      return;
    }

    scr.appendChild(el('div', 'bet__label', 'Choose your bet'));
    var tiers = el('div', 'bet');
    var selected = minBet;                 // default to the cheapest tier
    var tierBtns = [];
    G.BET_TIERS.forEach(function (b) {
      var btn = el('button', 'bet__tier', fmtPeso(b));
      if (!G.canBet(b)) btn.disabled = true;
      if (b === selected) btn.classList.add('is-sel');
      btn.addEventListener('click', function () {
        if (!G.canBet(b)) return;
        selected = b;
        tierBtns.forEach(function (x) { x.el.classList.toggle('is-sel', x.b === selected); });
      });
      tierBtns.push({ b: b, el: btn });
      tiers.appendChild(btn);
    });
    scr.appendChild(tiers);

    var actions = el('div', 'scr__actions');
    var spin = el('button', 'btn btn--red', 'SPIN');
    spin.addEventListener('click', function () {
      if (G.play(selected)) Diskarte.screens.show('result');
    });
    var stop = el('button', 'btn btn--ghost', 'Stop');
    stop.addEventListener('click', function () { Diskarte.screens.show('conseq'); });
    actions.appendChild(spin);
    actions.appendChild(stop);
    scr.appendChild(actions);
  }

  // ----- S7 Result / The Chase screen (M4) -----
  // Reveals the last spin. Wins are deliberately flat (NFR-ETH-2); the odds
  // tracker stays on screen. "Play again" is the chase; "Stop" exits.
  function buildResult(scr) {
    var r = Diskarte.gamble.lastResult();
    scr.appendChild(el('div', 'scr__tag', 'S7 · Result / The Chase · M4'));

    var card = el('div', 'spin__result ' + (r && r.win ? 'is-win' : 'is-lose'));
    if (!r) {
      card.appendChild(el('div', 'spin__big', '—'));
    } else if (r.win) {
      card.appendChild(el('div', 'spin__big', 'WIN'));
      card.appendChild(el('div', 'spin__sub', '+' + fmtPeso(r.delta) +
        '  (' + fmtPeso(r.bet) + ' → ' + fmtPeso(r.ret) + ')'));
      card.appendChild(el('div', 'spin__flat',
        r.firstPlay ? 'Ang sarap, ’di ba? (beginner’s luck)' : 'Panalo… sa ngayon.'));
    } else {
      card.appendChild(el('div', 'spin__big', 'LOSE'));
      card.appendChild(el('div', 'spin__sub', '−' + fmtPeso(r.bet)));
      card.appendChild(el('div', 'spin__flat', 'Lamon ng bahay. Balik na sa budget?'));
    }
    scr.appendChild(card);
    scr.appendChild(buildOddsTracker());

    // Urge band: the chase gets a push.
    if (Diskarte.compulsion.isUrge()) {
      scr.appendChild(urgeNudge('Isa pa! Balik mo lahat sa isang spin. (' +
        Diskarte.compulsion.band().label + ')'));
    }

    var actions = el('div', 'scr__actions');
    var again = el('button', 'btn btn--red', 'Play again');
    again.addEventListener('click', function () { Diskarte.screens.show('spin'); });
    var stop = el('button', 'btn btn--green', 'Stop');
    stop.addEventListener('click', function () { Diskarte.screens.show('conseq'); });
    actions.appendChild(again);
    actions.appendChild(stop);
    scr.appendChild(actions);
  }

  // ----- S8 Consequence / Debt screen (M5) -----
  // Applies this week's allocation to the meters (Flow Spec S8), summarises the
  // week's deltas vs the Hub snapshot, shows the compulsion band + its effect,
  // offers a 5-6 loan, and triggers the addiction game-over at compulsion 100.
  function buildConseq(scr) {
    Diskarte.budget.applyAllocationToMeters();   // idempotent within the week
    Diskarte.debrief.resolveWeek();              // once/week: scholarship + zero streak

    var s = Diskarte.state;
    var start = s.weekStart || {};
    var failReason = Diskarte.debrief.hardFail(); // full S8 hard-fail (Flow Spec)
    var gameOver = !!failReason;

    scr.appendChild(el('div', 'scr__tag', 'S8 · Consequence · M5'));
    scr.appendChild(el('div', 'scr__title', gameOver ? 'Game Over' : 'Consequence'));

    if (gameOver) {
      Diskarte.state.loseReason = failReason;    // the end screen reads this
      var go = el('div', 'conseq__gameover');
      go.appendChild(el('div', 'conseq__goHead', 'GAME OVER'));
      go.appendChild(el('div', 'conseq__goSub', Diskarte.debrief.reasonText(failReason)));
      scr.appendChild(go);
    }

    // compulsion band + what it does
    var band = Diskarte.compulsion.band();
    var bandBox = el('div', 'conseq__band is-' + band.id);
    bandBox.appendChild(el('span', 'conseq__bandK', 'Compulsion'));
    bandBox.appendChild(el('span', 'conseq__bandV', s.compulsion + ' · ' + band.label));
    scr.appendChild(bandBox);
    var note = {
      urge: 'Urge: may kumakalabit na "isa pa".',
      hooked: 'Hooked: naka-lock ang Savings sa budget.'
    }[band.id];
    if (note) scr.appendChild(el('div', 'conseq__note', note));

    // deltas vs the start of the week ([label, delta, isMoney, upIsBad])
    var fields = [
      ['Cash', s.cash - (start.cash || 0), true, false],
      ['Savings', s.savings - (start.savings || 0), true, false],
      ['Debt', s.debt - (start.debt || 0), true, true],
      ['Food', s.meterFood - (start.meterFood || 0), false, false],
      ['Energy', s.meterEnergy - (start.meterEnergy || 0), false, false],
      ['Trust', s.meterTrust - (start.meterTrust || 0), false, false],
      ['Compulsion', s.compulsion - (start.compulsion || 0), false, true]
    ];
    var list = el('div', 'conseq__list');
    list.appendChild(el('div', 'conseq__listTitle', 'Changes this week'));
    var any = false;
    fields.forEach(function (f) {
      var d = f[1];
      if (d === 0) return;
      any = true;
      var row = el('div', 'conseq__row');
      row.appendChild(el('span', 'conseq__k', f[0]));
      var txt = (d > 0 ? '+' : '−') + (f[2] ? fmtPeso(Math.abs(d)) : Math.abs(d));
      var good = f[3] ? d < 0 : d > 0;     // debt/compulsion: down is good
      row.appendChild(el('span', 'conseq__v ' + (good ? 'is-good' : 'is-bad'), txt));
      list.appendChild(row);
    });
    if (!any) list.appendChild(el('div', 'conseq__row', 'Walang pagbabago.'));
    scr.appendChild(list);

    var actions = el('div', 'scr__actions');
    if (gameOver) {
      var end = el('button', 'btn btn--red', 'See the damage');
      end.addEventListener('click', function () { Diskarte.screens.show('end_lose'); });
      actions.appendChild(end);
    } else {
      var borrow = el('button', 'btn btn--ghost', 'Borrow ₱500 via 5-6 (owe ₱600)');
      borrow.addEventListener('click', function () {
        Diskarte.borrow(500);
        Diskarte.screens.show('conseq');   // re-render to show the new debt
      });
      actions.appendChild(borrow);
      var cont = el('button', 'btn', 'Continue');
      cont.addEventListener('click', function () { Diskarte.screens.show('debrief'); });
      actions.appendChild(cont);
    }
    scr.appendChild(actions);
  }

  // ----- S9 Weekly Debrief screen (M6) -----
  // The player's own numbers for the week + one reflective line + the FR-15
  // support message. Week < 3 advances; Week 3 runs the win/lose evaluation.
  function buildDebrief(scr) {
    var s = Diskarte.state;
    var g = Diskarte.debrief.thisWeekGambling();
    var isFinal = s.week >= 3;

    scr.appendChild(el('div', 'scr__tag', 'S9 · Weekly Debrief · M6'));
    scr.appendChild(el('div', 'scr__title', 'Debrief — Week ' + s.week));

    var card = el('div', 'debrief__card');
    function line(k, v, cls) {
      var row = el('div', 'debrief__row');
      row.appendChild(el('span', 'debrief__k', k));
      row.appendChild(el('span', 'debrief__v' + (cls ? ' ' + cls : ''), v));
      card.appendChild(row);
    }
    line('Wagered this week', fmtPeso(g.wagered));
    line('Returned', fmtPeso(g.returned));
    line('Net on bets', (g.net >= 0 ? '+' : '−') + fmtPeso(Math.abs(g.net)),
      g.net < 0 ? 'is-bad' : (g.net > 0 ? 'is-good' : ''));
    line('Cash on hand', fmtPeso(s.cash));
    line('Savings', fmtPeso(s.savings) + ' / ₱500', s.savings >= 500 ? 'is-good' : '');
    scr.appendChild(card);

    var reflect;
    if (g.net < 0) {
      var pct = Math.round(Math.abs(g.net) / 500 * 100);
      reflect = 'Nilustay mo ₱' + Math.abs(g.net).toLocaleString('en-US') +
        ' sa taya — ' + pct + '% sana ng ₱500 goal.';
    } else if (s.savings > 0) {
      reflect = 'May naipon kang ' + fmtPeso(s.savings) + '. Diskarte, ’di diskarte-swerte.';
    } else {
      reflect = 'Walang taya, wala pang ipon. Okay lang — tuloy ang laban.';
    }
    scr.appendChild(el('div', 'debrief__reflect', reflect));

    scr.appendChild(buildSupport());

    var actions = el('div', 'scr__actions');

    // Move leftover cash into savings (Flow Spec S9 — e.g. the week-3 raket's
    // ₱250 reaches the buffer here). The Hooked band locks this safe option.
    if (s.cash > 0 && !Diskarte.compulsion.safeOptionsLocked()) {
      var toSave = el('button', 'btn btn--green', 'Move ₱' + s.cash.toLocaleString('en-US') + ' to savings');
      toSave.addEventListener('click', function () {
        Diskarte.update({ savings: Diskarte.state.savings + Diskarte.state.cash, cash: 0 });
        Diskarte.screens.show('debrief');   // re-render with the updated buffer
      });
      actions.appendChild(toSave);
    }

    if (isFinal) {
      var finish = el('button', 'btn btn--green', 'Finish the month');
      finish.addEventListener('click', function () {
        if (Diskarte.debrief.checkWin()) {
          Diskarte.screens.show('end_win');
        } else {
          if (!Diskarte.state.loseReason) {
            Diskarte.state.loseReason = Diskarte.debrief.hardFail() || 'no-buffer';
          }
          Diskarte.screens.show('end_lose');
        }
      });
      actions.appendChild(finish);
    } else {
      var next = el('button', 'btn', 'Next Week');
      next.addEventListener('click', function () {
        Diskarte.budget.endWeek();
        Diskarte.screens.show('hub');
      });
      actions.appendChild(next);
    }
    scr.appendChild(actions);
  }

  // FR-15 / NFR-ETH-4 support card (debrief + lose screens).
  function buildSupport() {
    var sup = el('div', 'support');
    sup.appendChild(el('div', 'support__k', 'Kung kailangan mo ng tulong'));
    sup.appendChild(el('div', 'support__txt', Diskarte.debrief.SUPPORT));
    return sup;
  }

  // Final figures block for the end screens.
  function buildFinalFigures() {
    var s = Diskarte.state, net = Diskarte.netGambling();
    var box = el('div', 'end__figures');
    function f(k, v, cls) {
      var r = el('div', 'end__frow');
      r.appendChild(el('span', 'end__fk', k));
      r.appendChild(el('span', 'end__fv' + (cls ? ' ' + cls : ''), v));
      box.appendChild(r);
    }
    f('Savings', fmtPeso(s.savings), s.savings >= 500 ? 'is-good' : '');
    f('Debt', fmtPeso(s.debt), s.debt > 0 ? 'is-bad' : '');
    f('Net on bets', (net >= 0 ? '+' : '−') + fmtPeso(Math.abs(net)),
      net < 0 ? 'is-bad' : (net > 0 ? 'is-good' : ''));
    f('Compulsion', s.compulsion + ' · ' + Diskarte.compulsion.band().label);
    f('Scholarship', s.scholarshipActive ? 'Intact' : 'Lost', s.scholarshipActive ? 'is-good' : 'is-bad');
    f('Spotted ads', s.awareness + '');
    return box;
  }

  // Replay resets to initial state and returns to Character Select (Flow Spec).
  function replayButton(variant) {
    var b = el('button', 'btn btn--' + variant, 'Replay');
    b.addEventListener('click', function () {
      Diskarte.resetState();
      Diskarte.screens.show('char');
    });
    return b;
  }

  // ----- S10 End — Win -----
  function buildEndWin(scr) {
    scr.appendChild(el('div', 'scr__tag', 'S10 · End — Win · M6'));
    scr.appendChild(el('div', 'scr__title', 'You Win'));
    var card = el('div', 'end__card is-win');
    card.appendChild(el('div', 'end__headline', 'Stability is the real win.'));
    scr.appendChild(card);
    scr.appendChild(buildFinalFigures());
    var actions = el('div', 'scr__actions');
    actions.appendChild(replayButton('green'));
    scr.appendChild(actions);
  }

  // ----- S11 End — Lose -----
  function buildEndLose(scr) {
    var s = Diskarte.state;
    scr.appendChild(el('div', 'scr__tag', 'S11 · End — Lose · M6'));
    scr.appendChild(el('div', 'scr__title', 'Game Over'));
    var card = el('div', 'end__card is-lose');
    card.appendChild(el('div', 'end__headline', 'Hindi lahat ng diskarte, panalo.'));
    if (s.loseReason) card.appendChild(el('div', 'end__reason', Diskarte.debrief.reasonText(s.loseReason)));
    scr.appendChild(card);
    scr.appendChild(buildFinalFigures());
    scr.appendChild(buildSupport());
    var actions = el('div', 'scr__actions');
    actions.appendChild(replayButton('red'));
    scr.appendChild(actions);
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
        snapshotWeek();                 // mark the start of this week
        Diskarte.hud.mount(scr);

        var scene = el('div', 'hub__scene');
        scene.appendChild(el('div', 'scr__tag', this.tag));
        scene.appendChild(el('div', 'scr__title', this.title));
        // Urge band: an unprompted nudge back toward the phone.
        if (Diskarte.compulsion.isUrge()) {
          scene.appendChild(urgeNudge('Kati sa kamay… isa pa kaya? (' +
            Diskarte.compulsion.band().label + ')'));
        }
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
      title: 'Life-Event Card',
      // Data-driven card; builds its own choice + Continue buttons.
      build: function (scr) { buildEvent(scr); }
    },
    ad: {
      id: 'ad', tag: 'S5 · Temptation Ad (phone) · M4', phone: true,
      title: 'Temptation Ad',
      build: function (scr) { buildAd(scr); }
    },
    spin: {
      id: 'spin', tag: 'S6 · Gambling Minigame (phone) · M4', phone: true,
      title: 'Gambling Minigame',
      build: function (scr) { buildSpin(scr); }
    },
    result: {
      id: 'result', tag: 'S7 · Result / The Chase · M4', phone: true,
      title: 'Result / The Chase',
      build: function (scr) { buildResult(scr); }
    },
    conseq: {
      id: 'conseq', tag: 'S8 · Consequence / Debt · M5',
      title: 'Consequence / Debt',
      // Full screen: applies meters, shows deltas, 5-6 loan, band + game-over.
      build: function (scr) { buildConseq(scr); }
    },
    debrief: {
      id: 'debrief', tag: 'S9 · Weekly Debrief · M6',
      title: 'Weekly Debrief',
      build: function (scr) { buildDebrief(scr); }
    },
    end_win: {
      id: 'end_win', tag: 'S10 · End — Win · M6',
      title: 'You Win',
      build: function (scr) { buildEndWin(scr); }
    },
    end_lose: {
      id: 'end_lose', tag: 'S11 · End — Lose · M6',
      title: 'Game Over',
      build: function (scr) { buildEndLose(scr); }
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
