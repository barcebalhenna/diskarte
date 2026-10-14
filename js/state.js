/* ============================================================
   state.js — the single game-state object (SRS v1.1 §6)
   Values below are the authoritative initial state for the
   default "Iskolar" character. Milestone 1 binds the HUD to this.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

Diskarte.INITIAL_STATE = {
  week: 1,                 // 1..3
  character: 'iskolar',    // 'iskolar' | 'tindera' | 'callcenter'
  cash: 1500,              // ₱ on hand (weekly income for iskolar)
  savings: 0,              // ₱ emergency fund
  debt: 0,                 // ₱ (includes accrued 5-6 interest)
  meterFood: 70,           // 0..100
  meterEnergy: 70,         // 0..100
  meterTrust: 70,          // 0..100 (family / scholarship standing)
  compulsion: 0,           // 0..100 (hidden until first gamble)
  gambleCount: 0,          // drives beginner's-luck logic
  totalWagered: 0,         // ₱ (odds tracker)
  totalReturned: 0,        // ₱ (odds tracker)
  awareness: 0,            // 0..100 ("spot the manipulation" score)
  scholarshipActive: true,
  path: 'sandbox',         // 'A' | 'B' | 'sandbox'
  muted: false
};

// Live state object. Reset at game start / replay.
Diskarte.state = Object.assign({}, Diskarte.INITIAL_STATE);

Diskarte.resetState = function (path) {
  Diskarte.state = Object.assign({}, Diskarte.INITIAL_STATE);
  if (path) Diskarte.state.path = path;
  return Diskarte.state;
};

// Derived helpers (used by the odds tracker and win/lose checks later).
Diskarte.netGambling = function () {
  var s = Diskarte.state;
  return s.totalReturned - s.totalWagered;
};
