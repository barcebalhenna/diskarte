/* ============================================================
   events.js — Milestone 3: life-event cards (SRS §4.2.4 / Appendix C).
   Data-driven so events are easy to add. Each event has a title, a
   short Taglish body, and 1–3 choices; each choice has an apply() that
   mutates state (cash / meters / debt) and returns a short result line.

   One card shows per week at S4 (Flow Spec §2). pick() chooses it from
   the current state. The gambling ADS from Appendix C are separate and
   built at M4 (S5); DARK_PATTERNS is kept here for that.

   Magnitude note: the SRS fixes the peso costs but leaves the meter hits
   vague ("−Trust", "−Food"). The point values below are a documented,
   tunable prototype choice, sized to the M2 meter model (~10–15/hit).
   The golden-path numbers (Flow Spec §4–5) are M7 injections.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var S = function () { return Diskarte.state; };
  var set = function (k, v) { return Diskarte.set(k, v); };

  // Each event: { id, title, body, choices:[ {id,label,note?,enabled?(state),apply()->text} ] }
  var EVENTS = {

    // --- Week 1 ---------------------------------------------------------
    'org-fee': {
      id: 'org-fee', week: 1,
      title: 'Org collection fee',
      body: 'Nangongolekta ang org — ₱100 para sa materials. Bayad ka ba?',
      choices: [
        { id: 'pay', label: 'Pay ₱100',
          enabled: function (s) { return s.cash >= 100; },
          note: 'Not enough cash',
          apply: function () { set('cash', S().cash - 100); return 'Bayad na. Walang drama. (−₱100)'; } },
        { id: 'skip', label: 'Skip it',
          apply: function () { set('meterTrust', S().meterTrust - 10); return 'Nilagpasan mo — may tumingin nang masama. (Trust −10)'; } }
      ]
    },

    // --- Week 2 ---------------------------------------------------------
    'lola': {
      id: 'lola', week: 2,
      title: 'Lola is sick',
      body: 'Kailangan ng ₱500 para sa gamot ni Lola. Paano mo haharapin?',
      choices: [
        { id: 'pay', label: 'Pay ₱500',
          enabled: function (s) { return s.cash >= 500; },
          note: 'Not enough cash',
          apply: function () { set('cash', S().cash - 500); return 'Nabili ang gamot. Ginhawa kay Lola. (−₱500)'; } },
        { id: 'borrow', label: 'Borrow via 5-6',
          apply: function () {
            // Borrow ₱500 and spend it on medicine: net cash 0, debt = 1.2×500.
            set('debt', S().debt + Math.round(500 * 1.2));
            return 'Nangutang sa 5-6. Debt +₱600 — lalaki \'to kapag \'di nabayaran.';
          } },
        { id: 'delay', label: 'Delay / ask around',
          apply: function () {
            set('meterTrust', S().meterTrust - 15);
            set('meterFood', S().meterFood - 10);
            return 'Ipinagpaliban. Nag-aalala ang pamilya, kinapos sa pagkain. (Trust −15, Food −10)';
          } }
      ]
    },

    // --- Week 3 ---------------------------------------------------------
    'midterm': {
      id: 'midterm', week: 3,
      title: 'Midterm week',
      body: 'Finals na parang gyera. Kapag mababa ang Energy, bagsak sa quiz.',
      choices: [
        { id: 'rest', label: 'Buy food / rest (₱150)',
          enabled: function (s) { return s.cash >= 150; },
          note: 'Not enough cash',
          apply: function () {
            set('cash', S().cash - 150);
            set('meterEnergy', S().meterEnergy + 10);
            return 'Kumain, nagpahinga. Mas handa sa midterm. (−₱150, Energy +10)';
          } },
        { id: 'push', label: 'Push through',
          apply: function () {
            set('meterEnergy', S().meterEnergy - 15);
            if (S().meterEnergy < 20) {
              set('meterTrust', S().meterTrust - 15);
              return 'Puyat sa review — bagsak sa quiz. (Energy −15, Trust −15)';
            }
            return 'Nilusob mo pagod. Pasado pa rin, pero gigil. (Energy −15)';
          } }
      ]
    },
    'loanshark': {
      id: 'loanshark', week: 3,
      title: 'Loan-shark follow-up',
      body: 'Dumalaw ang 5-6. Kailangan nang bayaran ang utang.',
      choices: [
        { id: 'pay', label: 'Pay in full',
          enabled: function (s) { return s.debt > 0 && s.cash >= s.debt; },
          note: 'Not enough cash',
          apply: function () {
            var d = S().debt;
            set('cash', S().cash - d);
            set('debt', 0);
            return 'Bayad na lahat. Wala nang humahabol. (−₱' + d.toLocaleString('en-US') + ')';
          } },
        { id: 'partial', label: 'Pay what you can',
          enabled: function (s) { return s.debt > 0 && s.cash > 0; },
          apply: function () {
            var amt = Math.min(S().cash, Math.round(S().debt / 2));
            set('cash', S().cash - amt);
            set('debt', S().debt - amt);
            return 'Hulugan muna. (−₱' + amt.toLocaleString('en-US') + ', natira pa ang utang)';
          } },
        { id: 'default', label: 'Default',
          apply: function () {
            set('debt', Math.round(S().debt * 1.2));
            set('meterTrust', S().meterTrust - 10);
            return 'Tumakas sa bayad — tumubo ang utang, kumalat ang usapan. (Debt +20%, Trust −10)';
          } }
      ]
    },
    'raket': {
      id: 'raket', week: 3,
      title: 'Raket — a side-gig',
      body: 'May nag-alok ng maliit na design/tutoring gig — ₱250. Tatanggapin?',
      choices: [
        { id: 'accept', label: 'Accept (+₱250)',
          apply: function () {
            set('cash', S().cash + 250);
            set('meterEnergy', S().meterEnergy - 10);
            return 'Natapos ang raket. Dagdag-kita, konting pagod. (+₱250, Energy −10)';
          } },
        { id: 'decline', label: 'Decline',
          apply: function () { return 'Dinaan mo na lang. Walang pagbabago.'; } }
      ]
    }
  };

  // Exactly one card per week. W3 shows the loan-shark if the player carries
  // debt (the active threat), otherwise the positive raket. Midterm is defined
  // and available for M7 scripting / sandbox tuning.
  function pick(week, state) {
    var s = state || Diskarte.state;
    if (week === 1) return EVENTS['org-fee'];
    if (week === 2) return EVENTS['lola'];
    if (week === 3) return s.debt > 0 ? EVENTS['loanshark'] : EVENTS['raket'];
    return null;
  }

  Diskarte.events = {
    EVENTS: EVENTS,
    pick: pick,
    // Dark patterns for the temptation ad (SRS §4.2.8) — used at M4.
    DARK_PATTERNS: ['false-urgency', 'social-proof', 'free-first', 'authority', 'near-miss']
  };
})();
