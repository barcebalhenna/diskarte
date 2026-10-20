/* ============================================================
   paths.js — Milestone 7: scripted golden paths A (spiral→lose) &
   B (resist→win). From the Flow & Scripted-Path Spec §4–5.

   Scripted mode is a deterministic PLAYBACK: on each beat the engine
   injects that beat's canonical state (the Flow Spec "key state
   after" values) and the player steps through with "Next ▶". This is
   reproducible every run and matches the tables beat for beat.
   Sandbox mode ('sandbox') is untouched — it runs the real systems.

   Each beat: { week, screen, caption, set:{field:value}, phone?, last? }
   `set` values are authored to equal the Flow Spec state at that point.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var P = '₱';

  var SCRIPT = {
    // ---- Path A — The Spiral → LOSE (Flow Spec §4) ----
    A: [
      { week: 1, screen: 'hub',     caption: 'Linggo 1. Dumating ang baon — cash ' + P + '1,500.', set: {} },
      { week: 1, screen: 'budget',  caption: 'Fund needs ' + P + '1,350, keep ' + P + '150 na buffer.', set: { cash: 150 } },
      { week: 1, screen: 'event',   caption: 'Org fee ' + P + '100 → Bayad.', set: { cash: 50 } },
      { week: 1, screen: 'ad',      caption: 'Ad: “FREE ' + P + '100 bonus spin!” → Play.', phone: true, set: {} },
      { week: 1, screen: 'spin',    caption: 'Taya ' + P + '50 → beginner’s luck PANALO 1.8×. Net +' + P + '40.', phone: true,
        set: { cash: 90, compulsion: 12, gambleCount: 1, totalWagered: 50, totalReturned: 90 } },
      { week: 1, screen: 'conseq',  caption: 'Maliit na panalo. Tigil muna ngayong linggo.', set: {} },
      { week: 1, screen: 'debrief', caption: '“+' + P + '40 — ang sarap, ’di ba?” Walang naipon.', set: {} },

      { week: 2, screen: 'hub',     caption: 'Linggo 2. +' + P + '1,500 kita.', set: { week: 2, cash: 1590 } },
      { week: 2, screen: 'budget',  caption: 'Chase pa — nilaktawan ang School ' + P + '200. Trust −15.', set: { cash: 440, meterTrust: 55 } },
      { week: 2, screen: 'event',   caption: 'May sakit si Lola ' + P + '500 → nangutang sa 5-6. Debt ' + P + '600.', set: { debt: 600 } },
      { week: 2, screen: 'ad',      caption: 'Ad: “47 people just won ' + P + '10,000!” → Play.', phone: true, set: {} },
      { week: 2, screen: 'spin',    caption: 'Taya ' + P + '200 TALO → habol ' + P + '200 TALO. Net −' + P + '360.', phone: true,
        set: { cash: 40, compulsion: 36, gambleCount: 3, totalWagered: 450 } },
      { week: 2, screen: 'conseq',  caption: 'Net −' + P + '360, lumitaw ang utang.', set: {} },
      { week: 2, screen: 'debrief', caption: 'Lugi, pero “babawi next week.”', set: {} },

      { week: 3, screen: 'hub',     caption: 'Linggo 3. +' + P + '1,500 — pero tumubo ang utang 600→720.', set: { week: 3, cash: 1540, debt: 720 } },
      { week: 3, screen: 'budget',  caption: 'Habol ulit — skip Load + School. Bumagsak ang Trust.', set: { cash: 540, meterTrust: 20 } },
      { week: 3, screen: 'event',   caption: 'Loan-shark + midterm → default. Scholarship flagged.', set: { debt: 864, scholarshipActive: false } },
      { week: 3, screen: 'ad',      caption: 'Urge popup (compulsion ≥ 40) → binge.', phone: true, set: {} },
      { week: 3, screen: 'spin',    caption: P + '200 talo → ' + P + '200 talo → utang ' + P + '500 → talo. Compulsion 84 (Hooked).', phone: true,
        set: { cash: 140, debt: 1464, compulsion: 84, totalWagered: 1050, gambleCount: 7 } },
      { week: 3, screen: 'conseq',  caption: 'Utang ' + P + '1,464. Hooked. Nawala ang scholarship.', set: {} },
      { week: 3, screen: 'end_lose', caption: '', set: { loseReason: 'scholarship' }, last: true }
    ],

    // ---- Path B — The Resist → WIN (Flow Spec §5) ----
    B: [
      { week: 1, screen: 'hub',     caption: 'Linggo 1. Cash ' + P + '1,500. Plano: disiplina.', set: {} },
      { week: 1, screen: 'budget',  caption: 'Tipid: Food 650 / Fare 300 / Load 100 / School 200. Buffer ' + P + '250.', set: { cash: 250, meterFood: 65 } },
      { week: 1, screen: 'event',   caption: 'Org fee ' + P + '100 → bayad mula buffer.', set: { cash: 150 } },
      { week: 1, screen: 'ad',      caption: 'Ad: “FREE ' + P + '100 spin!” → Report / Dismiss. Awareness +1.', phone: true, set: { awareness: 1 } },
      { week: 1, screen: 'conseq',  caption: 'Walang sugal. Buo ang ulo.', set: {} },
      { week: 1, screen: 'debrief', caption: 'Inilipat ang ' + P + '150 sa savings.', set: { cash: 0, savings: 150 } },

      { week: 2, screen: 'hub',     caption: 'Linggo 2. +' + P + '1,500 kita. Ipon: ' + P + '150.', set: { week: 2, cash: 1500 } },
      { week: 2, screen: 'budget',  caption: 'Parehong tipid. Buffer ' + P + '250.', set: { cash: 250 } },
      { week: 2, screen: 'event',   caption: 'Si Lola ' + P + '500 → buffer + ipon + tulong ng pamilya. Walang utang. Trust +5.', set: { cash: 0, savings: 0, meterTrust: 75 } },
      { week: 2, screen: 'ad',      caption: 'Ad: “47 winners!” → Dismiss. Awareness +1.', phone: true, set: { awareness: 2 } },
      { week: 2, screen: 'conseq',  caption: 'Walang sugal, walang utang.', set: {} },
      { week: 2, screen: 'debrief', caption: 'Matatag pa rin. Tuloy ang disiplina.', set: {} },

      { week: 3, screen: 'hub',     caption: 'Linggo 3. +' + P + '1,500 kita.', set: { week: 3, cash: 1500 } },
      { week: 3, screen: 'budget',  caption: 'Parehong tipid. Konting pagod — Energy 65.', set: { cash: 250, meterEnergy: 65 } },
      { week: 3, screen: 'event',   caption: 'Raket (design/tutor) → tanggap. +' + P + '250. Buffer ' + P + '500.', set: { cash: 500 } },
      { week: 3, screen: 'ad',      caption: 'Ad → Dismiss (walang urge). Awareness +1.', phone: true, set: { awareness: 3 } },
      { week: 3, screen: 'conseq',  caption: 'Handa nang isara ang buwan.', set: {} },
      { week: 3, screen: 'debrief', caption: 'Inilipat ang ' + P + '500 sa savings.', set: { cash: 0, savings: 500 } },
      { week: 3, screen: 'end_win', caption: '', set: {}, last: true }
    ]
  };

  var seq = null, idx = -1;

  function applyBeat(beat) {
    if (!beat || !beat.set) return;
    for (var k in beat.set) {
      if (beat.set.hasOwnProperty(k)) Diskarte.set(k, beat.set[k]);
    }
  }

  Diskarte.paths = {
    SCRIPT: SCRIPT,

    // True while a scripted path is playing (not sandbox).
    active: function () { return Diskarte.state.path === 'A' || Diskarte.state.path === 'B'; },

    label: function () {
      return Diskarte.state.path === 'A' ? 'Path A — The Spiral'
        : Diskarte.state.path === 'B' ? 'Path B — The Resist' : '';
    },

    // Begin a scripted playback from beat 0.
    start: function (pathId) {
      Diskarte.resetState(pathId);
      seq = SCRIPT[pathId] || [];
      idx = 0;
      if (!seq.length) return;
      applyBeat(seq[0]);
      Diskarte.screens.showScriptedBeat(seq[0]);
    },

    // Step to the next beat (called by the "Next ▶" button).
    advance: function () {
      if (!seq || idx + 1 >= seq.length) return;
      idx++;
      applyBeat(seq[idx]);
      Diskarte.screens.showScriptedBeat(seq[idx]);
    },

    current: function () { return seq ? seq[idx] : null; }
  };
})();
