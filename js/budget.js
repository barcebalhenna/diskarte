/* ============================================================
   budget.js — Milestone 2: budget allocation + meter effects.
   The player allocates weekly cash across needs (SRS §4.2.2).
   Flow (per Flow Spec §2):
     S3 Budget  "Confirm"    -> commit(): spend cash, store allocation
     S8 Conseq  "Continue"   -> applyAllocationToMeters(): under-funding drains
     S9 Debrief "Next Week"  -> endWeek(): +income, debt ×1.2, compulsion decay
   The UI itself lives in screens.js; this file is the pure logic.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  /* Needs with their suggested weekly cost, the meter each one guards, and
     `drain` = the MAX points removed from that meter if the need is left
     completely unfunded. The drain scales with the shortfall, so fully
     funding a need (>= cost) costs 0 meter points.

     NOTE: the SRS gives the costs/meter mapping but NOT the drain sizes, so
     these are a tunable prototype choice. They're set so each meter can lose
     at most ~20/week to budgeting alone (Food 20, Energy 20, Trust 10+10),
     keeping the 3-week slice tense but survivable — events (M3) are what
     actually push a meter to 0. The golden-path meter numbers (Flow Spec
     §4–5) are hand-authored injections for M7 and don't derive from this. */
  var NEEDS = [
    { key: 'food',   label: 'Food · pagkain',   cost: 700, meter: 'meterFood',   drain: 20 },
    { key: 'fare',   label: 'Fare · pamasahe',  cost: 300, meter: 'meterEnergy', drain: 20 },
    { key: 'load',   label: 'Load / data',      cost: 150, meter: 'meterTrust',  drain: 10 },
    { key: 'school', label: 'School supplies',  cost: 200, meter: 'meterTrust',  drain: 10 }
  ];

  var STEP = 50;  // allocation stepper increment (all costs are multiples of 50)

  // Weekly income by character. Only iskolar is tuned for the slice.
  var INCOME = { iskolar: 1500, tindera: 1500, callcenter: 1500 };
  function incomeFor(character) {
    return INCOME[character] != null ? INCOME[character] : 1500;
  }

  function needsTotal(draft) {
    var t = 0;
    for (var i = 0; i < NEEDS.length; i++) t += draft[NEEDS[i].key] || 0;
    return t;
  }
  function allocatedTotal(draft) { return needsTotal(draft) + (draft.savings || 0); }

  // Cash left unallocated. Never allowed below 0 (the UI blocks over-spend).
  function remainder(draft) { return Diskarte.state.cash - allocatedTotal(draft); }

  // A sensible starting draft: fund needs in order up to what cash allows
  // (so later weeks with less cash still start on a valid, non-negative plan).
  function suggestDraft() {
    var left = Diskarte.state.cash;
    var draft = { savings: 0 };
    for (var i = 0; i < NEEDS.length; i++) {
      var give = Math.max(0, Math.min(NEEDS[i].cost, left));
      draft[NEEDS[i].key] = give;
      left -= give;
    }
    return draft;
  }

  // S3 "Confirm": spend the needs money, move any savings allocation into the
  // emergency fund, and store the funding levels for the meter pass at S8.
  // Returns false if the draft over-spends (guard; the UI prevents this).
  function commit(draft) {
    if (remainder(draft) < 0) return false;
    var spend = needsTotal(draft);
    var save = draft.savings || 0;
    Diskarte.set('cash', Diskarte.state.cash - spend - save);
    if (save > 0) Diskarte.set('savings', Diskarte.state.savings + save);

    var alloc = {};
    for (var i = 0; i < NEEDS.length; i++) alloc[NEEDS[i].key] = draft[NEEDS[i].key] || 0;
    Diskarte.state.allocation = alloc;
    Diskarte.state.allocationApplied = false;
    return true;
  }

  // S8 "Continue": translate this week's under-funding into meter drops.
  // Idempotent within a week via the allocationApplied guard. Returns the
  // per-meter deltas (for the Consequence/Debrief screens to show later).
  function applyAllocationToMeters() {
    var a = Diskarte.state.allocation;
    if (!a || Diskarte.state.allocationApplied) return null;

    var deltas = {};
    for (var i = 0; i < NEEDS.length; i++) {
      var n = NEEDS[i];
      var funded = a[n.key] || 0;
      var shortfall = Math.max(0, n.cost - funded);
      var drop = Math.round(n.drain * (shortfall / n.cost));
      if (drop > 0) deltas[n.meter] = (deltas[n.meter] || 0) - drop;
    }
    for (var meter in deltas) {
      if (deltas.hasOwnProperty(meter)) {
        Diskarte.set(meter, Diskarte.state[meter] + deltas[meter]);
      }
    }
    Diskarte.state.allocationApplied = true;
    return deltas;
  }

  // S9 "Next Week": advance into the next week. No-op at week 3 (that path
  // ends via win/lose in M6). Order follows the Flow Spec S9->S2 side-effects.
  function endWeek() {
    var s = Diskarte.state;
    if (s.week >= 3) return false;

    Diskarte.update({ week: s.week + 1, cash: s.cash + incomeFor(s.character) });
    if (Diskarte.state.debt > 0) {
      Diskarte.set('debt', Math.round(Diskarte.state.debt * 1.2)); // 5-6 compounding
    }
    // Compulsion decays only on a week the player didn't gamble (M4 sets the flag).
    if (!Diskarte.state.gambledThisWeek) {
      Diskarte.set('compulsion', Diskarte.state.compulsion - 3);
    }
    Diskarte.state.gambledThisWeek = false; // fresh week
    Diskarte.state.weekResolved = false;    // S8's once-per-week eval re-arms (M6)
    return true;
  }

  Diskarte.budget = {
    NEEDS: NEEDS,
    STEP: STEP,
    incomeFor: incomeFor,
    needsTotal: needsTotal,
    remainder: remainder,
    suggestDraft: suggestDraft,
    commit: commit,
    applyAllocationToMeters: applyAllocationToMeters,
    endWeek: endWeek
  };
})();
