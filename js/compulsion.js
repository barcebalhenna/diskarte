/* ============================================================
   compulsion.js — Milestone 5: compulsion meter + band effects.
   SRS §4.2.6: rises +12 per gamble (applied in gamble.js), decays
   −3 per resisted week (applied in budget.endWeek). This module is
   the single authority on the BANDS and what each one unlocks:
     0–39  In control   normal play
     40–69 Urge         unprompted "one more spin" nudges
     70–99 Hooked       safe budget options (Savings) get locked
     100   Addiction    game-over (hard-fail at S8)
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var URGE = 40, HOOKED = 70, MAX = 100;

  var LABELS = {
    control: 'In control',
    urge: 'Urge',
    hooked: 'Hooked',
    addiction: 'Addiction'
  };

  // band(v) -> { id, label }. Defaults to the current compulsion value.
  function band(v) {
    if (v == null) v = Diskarte.state.compulsion;
    var id = v >= MAX ? 'addiction' : v >= HOOKED ? 'hooked' : v >= URGE ? 'urge' : 'control';
    return { id: id, label: LABELS[id] };
  }

  function val() { return Diskarte.state.compulsion; }

  Diskarte.compulsion = {
    PER_GAMBLE: 12,
    DECAY_PER_RESISTED_WEEK: 3,
    URGE: URGE, HOOKED: HOOKED, MAX: MAX,
    band: band,
    isUrge: function () { return val() >= URGE; },          // show nudges
    isHooked: function () { return val() >= HOOKED; },       // lock safe options
    isGameOver: function () { return val() >= MAX; },        // addiction end-state
    safeOptionsLocked: function () { return val() >= HOOKED; }
  };
})();
