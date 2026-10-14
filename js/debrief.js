/* ============================================================
   debrief.js — Milestone 6: weekly debrief + win/lose evaluation.
   SRS §4.2.9 (debrief) / §4.2.10 (win-lose) and Flow Spec §2
   (hard-fail at S8, win-check at S9 Finish).
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  // FR-15 / NFR-ETH-4: a brief, non-judgmental support message. Shown on the
  // debrief and lose screens. No fabricated hotline — points to real people.
  var SUPPORT =
    'Laro lang ito. Pero kung tunay nang nakakaapekto sa iyo o sa mahal mo ang ' +
    'sugal, may matatakbuhan: kausapin ang magulang, guidance counselor, o health ' +
    'worker na pinagkakatiwalaan. Hindi ka nag-iisa.';

  // Human-readable reason for how a run ended.
  var REASONS = {
    addiction:   'Umabot sa 100 ang compulsion — hindi na mapigilan.',
    scholarship: 'Nawala ang scholarship (bumagsak sa 0 ang Trust).',
    debt:        'Lumampas sa ₱2,000 ang utang sa 5-6.',
    meter:       'May pangangailangang nasa 0 nang dalawang magkasunod na linggo.',
    'no-buffer': 'Kulang ang emergency fund (₱500) sa dulo ng ika-3 linggo.'
  };

  // WIN (end of Week 3): buffer ≥ 500, scholarship intact, compulsion < 70,
  // no meter at 0 (SRS §4.2.10).
  function checkWin(s) {
    s = s || Diskarte.state;
    return s.savings >= 500 && s.scholarshipActive &&
           s.compulsion < Diskarte.compulsion.HOOKED &&
           s.meterFood > 0 && s.meterEnergy > 0 && s.meterTrust > 0;
  }

  // Hard-fail check (runs at S8, every week). Returns a reason id or null.
  function hardFail(s) {
    s = s || Diskarte.state;
    if (s.compulsion >= Diskarte.compulsion.MAX) return 'addiction';
    if (!s.scholarshipActive) return 'scholarship';
    if (s.debt > 2000) return 'debt';
    if (s.zeroMeterStreak >= 2) return 'meter';
    return null;
  }

  // Once-per-week resolution, called from the Consequence screen (S8) under a
  // guard so it runs a single time per week even if the screen re-renders.
  // Loses the scholarship when Trust bottoms out, and tracks the streak of
  // consecutive weeks ending with any need at 0.
  function resolveWeek() {
    var s = Diskarte.state;
    if (s.weekResolved) return;
    if (s.meterTrust === 0) s.scholarshipActive = false;
    var anyZero = Math.min(s.meterFood, s.meterEnergy, s.meterTrust) === 0;
    s.zeroMeterStreak = anyZero ? (s.zeroMeterStreak || 0) + 1 : 0;
    s.weekResolved = true;
  }

  // This week's gambling, derived from the Hub snapshot (weekStart).
  function thisWeekGambling() {
    var s = Diskarte.state, w = s.weekStart || {};
    var wagered = s.totalWagered - (w.totalWagered || 0);
    var returned = s.totalReturned - (w.totalReturned || 0);
    return { wagered: wagered, returned: returned, net: returned - wagered };
  }

  Diskarte.debrief = {
    SUPPORT: SUPPORT,
    checkWin: checkWin,
    hardFail: hardFail,
    resolveWeek: resolveWeek,
    thisWeekGambling: thisWeekGambling,
    reasonText: function (id) { return REASONS[id] || ''; }
  };
})();
