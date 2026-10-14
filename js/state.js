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

/* ------------------------------------------------------------
   Safe mutation + change notification. Wrapped in an IIFE so the
   clamp table, the listener list and the notify() helper stay
   private (plain-script project: a bare `var notify` would leak
   onto window). Only the Diskarte.* methods are exposed.
   ------------------------------------------------------------ */
(function () {
  /* Clamp rules. Every numeric field has a floor (and a ceiling where
     it makes sense) so no later milestone can shove a meter past 100 or
     a peso amount below 0. Doing it HERE, once, means M2–M5 can just
     call Diskarte.set() and trust the bounds. */
  var CLAMP = {
    week:          { min: 1, max: 3 },
    cash:          { min: 0 },
    savings:       { min: 0 },
    debt:          { min: 0 },
    meterFood:     { min: 0, max: 100 },
    meterEnergy:   { min: 0, max: 100 },
    meterTrust:    { min: 0, max: 100 },
    compulsion:    { min: 0, max: 100 },
    gambleCount:   { min: 0 },
    totalWagered:  { min: 0 },
    totalReturned: { min: 0 },
    awareness:     { min: 0, max: 100 }
  };

  function clampNumber(key, value) {
    var v = Math.round(value);          // whole numbers only (pesos, points)
    var c = CLAMP[key];
    if (c) {
      if (c.min != null && v < c.min) v = c.min;
      if (c.max != null && v > c.max) v = c.max;
    }
    return v;
  }

  // change notification: the HUD (and later screens) subscribe here
  var listeners = [];

  function notify(changedKeys) {
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](Diskarte.state, changedKeys);
    }
  }

  // Subscribe to state changes. fn(state, changedKeys) runs on every set/update/reset.
  Diskarte.onChange = function (fn) {
    if (typeof fn === 'function') listeners.push(fn);
    return fn;
  };

  // Set one field. Numbers are rounded + clamped per CLAMP; other types pass through.
  Diskarte.set = function (key, value) {
    if (typeof value === 'number') value = clampNumber(key, value);
    Diskarte.state[key] = value;
    notify([key]);
    return value;
  };

  // Set several fields at once, then notify once with all the keys touched.
  Diskarte.update = function (obj) {
    var keys = [];
    for (var key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      var value = obj[key];
      if (typeof value === 'number') value = clampNumber(key, value);
      Diskarte.state[key] = value;
      keys.push(key);
    }
    notify(keys);
    return Diskarte.state;
  };

  Diskarte.resetState = function (path) {
    Diskarte.state = Object.assign({}, Diskarte.INITIAL_STATE);
    if (path) Diskarte.state.path = path;
    notify(null);                       // null = "everything changed"
    return Diskarte.state;
  };

  // Derived helpers (used by the odds tracker and win/lose checks later).
  Diskarte.netGambling = function () {
    var s = Diskarte.state;
    return s.totalReturned - s.totalWagered;
  };
})();
