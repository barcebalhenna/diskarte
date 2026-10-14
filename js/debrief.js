/* debrief.js — Milestone 6: weekly debrief + win/lose evaluation.
   SRS §4.2.9 / §4.2.10. Show the player's own numbers; evaluate at
   end of Week 3. */
window.Diskarte = window.Diskarte || {};
Diskarte.debrief = {
  // Win: savings>=500 AND scholarship AND compulsion<70 AND no meter at 0
  checkWin: function (s) {
    return s.savings >= 500 && s.scholarshipActive &&
           s.compulsion < 70 &&
           s.meterFood > 0 && s.meterEnergy > 0 && s.meterTrust > 0;
  }
  // TODO(M6): hard-fail checks (compulsion==100 | debt>2000 |
  //           meter==0 x2wk | scholarship lost); renderDebrief().
};
