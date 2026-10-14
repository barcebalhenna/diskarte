/* ============================================================
   gamble.js — Milestone 4: rigged-but-honest gambling model.
   SRS §4.2.5 / Appendix B. The first play uses "beginner's luck"
   (70% / 1.8×) to hook the player; every play after is the real
   house edge (28% / 1.9×, EV ≈ −₱23.40 per ₱50). The odds tracker
   (built in screens.js) must stay visible the whole time.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var BET_TIERS = [50, 100, 200];
  var FIRST_WIN_CHANCE = 0.70, FIRST_PAYOUT = 1.8;  // the hook
  var WIN_CHANCE = 0.28,       PAYOUT = 1.9;        // the real edge

  // Odds that apply to the NEXT spin, based on how many times we've played.
  // (So the tracker shows 70% before the first spin, then drops to 28% — the
  // lesson made visible.)
  function currentOdds() {
    return Diskarte.state.gambleCount === 0
      ? { chance: FIRST_WIN_CHANCE, mult: FIRST_PAYOUT, first: true }
      : { chance: WIN_CHANCE, mult: PAYOUT, first: false };
  }

  function trueWinPct() { return Math.round(currentOdds().chance * 100); }

  // Can the player afford this bet right now?
  function canBet(bet) { return bet > 0 && Diskarte.state.cash >= bet; }

  // Play one spin for `bet`. Applies the result to cash + the odds-tracker
  // totals, bumps compulsion (+12) and gambleCount, and flags the week as
  // gambled (so compulsion won't decay). Returns the outcome for the result
  // screen. Returns null if the bet isn't affordable.
  function play(bet) {
    var s = Diskarte.state;
    if (!canBet(bet)) return null;

    var odds = currentOdds();                 // read BEFORE incrementing count
    var win = Math.random() < odds.chance;
    var ret = win ? Math.round(bet * odds.mult) : 0;

    Diskarte.update({
      cash: s.cash - bet + ret,
      totalWagered: s.totalWagered + bet,
      totalReturned: s.totalReturned + ret,
      compulsion: s.compulsion + 12,
      gambleCount: s.gambleCount + 1
    });
    Diskarte.state.gambledThisWeek = true;

    var result = {
      win: win, bet: bet, mult: odds.mult, ret: ret,
      delta: ret - bet,                       // net cash change this spin
      firstPlay: odds.first
    };
    last = result;
    return result;
  }

  var last = null;                            // most recent spin, for the result screen

  Diskarte.gamble = {
    BET_TIERS: BET_TIERS,
    FIRST_WIN_CHANCE: FIRST_WIN_CHANCE, FIRST_PAYOUT: FIRST_PAYOUT,
    WIN_CHANCE: WIN_CHANCE, PAYOUT: PAYOUT,
    currentOdds: currentOdds,
    trueWinPct: trueWinPct,
    canBet: canBet,
    play: play,
    lastResult: function () { return last; },
    net: function () { return Diskarte.netGambling(); }  // returned − wagered
  };
})();
