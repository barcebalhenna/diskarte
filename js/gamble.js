/* gamble.js — Milestone 4: rigged-but-honest gambling model.
   SRS §4.2.5 / Appendix B. The odds tracker must always be visible. */
window.Diskarte = window.Diskarte || {};
Diskarte.gamble = {
  BET_TIERS: [50, 100, 200],
  FIRST_WIN_CHANCE: 0.70, FIRST_PAYOUT: 1.8,   // beginner's luck (the hook)
  WIN_CHANCE: 0.28,       PAYOUT: 1.9          // real house edge (EV < 0)
  // TODO(M4): spin(bet) -> {win, payout}; update cash, totalWagered,
  //           totalReturned, compulsion (+12), gambleCount.
  //           First gamble uses FIRST_* ; subsequent use WIN_CHANCE/PAYOUT.
};
