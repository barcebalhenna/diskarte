/* paths.js — Milestone 7: scripted golden paths A (spiral) & B (resist).
   See the Flow & Scripted-Path Spec beat tables. In scripted mode the
   engine injects these beats; in 'sandbox' it runs the real model. */
window.Diskarte = window.Diskarte || {};
Diskarte.paths = {
  // Each beat: { week, screen, inject:{...}, force:{...} }
  SCRIPT: {
    A: [], // TODO(M7): fill from Flow Spec §4 (Path A — The Spiral -> LOSE)
    B: []  // TODO(M7): fill from Flow Spec §5 (Path B — The Resist -> WIN)
  }
  // TODO(M7): beatFor(week, screenId) -> beat | null; apply inject/force.
};
