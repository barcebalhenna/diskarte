/* compulsion.js — Milestone 5: compulsion meter + band effects.
   SRS §4.2.6: +12 per gamble, -3 per resisted week.
   Bands: 0-39 in control | 40-69 urge | 70-99 hooked (lock safe
   options) | 100 lose. */
window.Diskarte = window.Diskarte || {};
Diskarte.compulsion = {
  PER_GAMBLE: 12, DECAY_PER_RESISTED_WEEK: 3,
  band: function (v) {
    if (v >= 100) return 'addiction';
    if (v >= 70)  return 'hooked';
    if (v >= 40)  return 'urge';
    return 'control';
  }
  // TODO(M5): apply increments/decay; enforce band effects.
};
