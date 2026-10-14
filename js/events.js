/* events.js — Milestone 3: life-event cards + dark-pattern ads.
   Data-driven so events are easy to add (SRS §4.2.4 / Appendix C).
   Includes the positive "raket" earning event in Week 3 (SRS v1.1). */
window.Diskarte = window.Diskarte || {};
Diskarte.events = {
  // Minimal seed; expand in M3. See SRS Appendix C.
  byWeek: {
    1: [{ id: 'org-fee', text: 'Org collection fee — ₱100', type: 'cost' }],
    2: [{ id: 'lola',    text: 'Lola is sick — ₱500',       type: 'cost' }],
    3: [{ id: 'raket',   text: 'Raket — a small design/tutoring gig (+₱250)', type: 'earn' }]
  },
  // Dark patterns for the temptation ad (SRS §4.2.8)
  DARK_PATTERNS: ['false-urgency', 'social-proof', 'free-first', 'authority', 'near-miss']
  // TODO(M3): renderEventCard(), apply choice effects.
  // TODO(M4): renderAd() with >=3 dark patterns + Play / Report-Dismiss.
};
