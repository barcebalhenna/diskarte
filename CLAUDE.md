# CLAUDE.md — Diskarte prototype

Context for Claude Code. Read this first every session.

## What this is
**Diskarte** is a game-based-learning prototype: a portrait, 2D-pixel-art
budget life-sim where a young Filipino manages a tight weekly budget while
resisting online gambling. The player learns **by experiencing the trap**,
not by quizzes. Tagline: *"Survive the month. Outsmart the odds."*

## Source of truth (read these; keep them in this folder)
- `diskarte_srs.md` — requirements (what to build + the rules).
- `diskarte_build_plan.md` — **the milestones to build in order** (M0–M8).
- `diskarte_flow_spec.md` — the screen state machine + the Path A / Path B
  beat tables (used at Milestone 7).
- `diskarte_flow_diagram.png` — visual of the state machine.

When these and the code disagree, the **docs win** — update the code.

## Tech stack & conventions
- **Vanilla HTML5 + CSS3 + JavaScript (ES5-style).** No framework, no build
  step, no backend.
- **Plain `<script>` tags, not ES modules**, so the game runs on `file://`
  too. Everything hangs off a single global: `window.Diskarte` (alias `D`).
  Load order is fixed in `index.html` (state → systems → screens → main).
- **Offline-first (NFR-3):** no network calls at play time. The only current
  exception is the Google-Fonts `@import` in `styles.css` — **bundle those
  pixel fonts into `assets/fonts/` and switch to `@font-face`** before
  calling the prototype done.
- **Portrait only:** logical stage is **360×640**, scaled to the window and
  letterboxed by `main.js`. Pixel art uses `image-rendering: pixelated`.
- Palette lives as CSS variables in `styles.css` (SRS §3.5). Don't hardcode
  hex values elsewhere — use the vars.

## Project structure
```
index.html        loads everything (fixed script order)
css/styles.css    palette vars, stage scaling, screen/button styles
js/state.js       the single state object (SRS §6) + safe set/update/onChange
js/hud.js         M1 — Week Hub HUD (money, meters, compulsion) bound to state
js/dev.js         M1 — TEMPORARY dev panel (mutate state to test the HUD)
js/screens.js     screen router + all 11 screens; Budget screen built (M2)
js/budget.js      M2 — allocation + meter drains + week advance (done)
js/gamble.js      M4 — rigged odds model (stub, numbers from SRS App. B)
js/compulsion.js  M5 — compulsion meter + bands (stub)
js/events.js      M3 — data-driven life-event cards, 1 per week (done)
js/debrief.js     M6 — weekly debrief + win/lose checks (stub)
js/paths.js       M7 — scripted Path A/B beats (stub)
js/main.js        boot + stage scaling
assets/           sprites / fonts / audio (empty; filled at M8)
```

## Non-negotiable constraints (SRS §7.4 — ethics)
- **No real money, no real gambling, no links to real gambling sites.**
- The gambling minigame must be **less fun and less rewarding** than
  budgeting; the odds tracker and compulsion meter must keep losses visible.
- The game **cannot be won by gambling** — winning = ending with a buffer,
  intact scholarship, and self-control.
- Show a **non-judgmental support message** on lose/debrief screens (FR-15).

## How to run
Open `index.html` with the VS Code **Live Server** extension (or double-click
it). You should see the Title screen; you can click through all 11 screens.

## Current status
- **M0 (scaffold & stage): DONE.** Router + 11 placeholder screens wired to
  the full state machine; stage scales/letterboxes; state object in place.
- **M1 (state model & HUD): DONE.** `state.js` now has safe `set`/`update`/
  `onChange` with per-field clamping; the Week Hub renders a live HUD
  (week counter, cash/savings/debt chips, Food/Energy/Trust segmented bars,
  compulsion bar). Compulsion stays locked (`???`) until the first gamble
  per SRS §6. A temporary dev panel (`dev.js`, backtick to toggle) mutates
  state to verify live binding and 0–100 clamping; delete its `<script>`
  line to remove it. Band *effects* and End-Week logic are M5/M2.
- **M2 (budget allocation): DONE.** Budget screen (S3) with a stepper per need
  (+ optional Savings), live remainder, over-allocation blocked. Per the Flow
  Spec the weekly loop is split: S3 Confirm commits the draft (spends cash,
  moves savings, stores the allocation); S8 Continue applies under-funding
  drains to meters (proportional; full funding = stable); S9 Next Week advances
  the week (+income, debt ×1.2, compulsion decay). That logic lives in
  `budget.js` and is wired into the S8/S9 placeholders so it's testable now;
  M5/M6 will build those screens out around it. Under-funding drain sizes are a
  tunable prototype choice (SRS gives costs/meters, not magnitudes).
- **M3 (life events): DONE.** `events.js` is a data-driven registry of all
  Appendix C week 1–3 life events (org fee, Lola, midterm, loan-shark follow-up,
  raket), each with 1–3 choices whose `apply()` mutates cash/meters/debt and
  returns a Taglish result line. The S4 card shows exactly one event per week:
  W1 org fee, W2 Lola, W3 loan-shark if `debt > 0` else the raket (midterm is
  defined and ready for M7 scripting). Choices disable when unaffordable.
  Meter-hit magnitudes are a documented, tunable prototype choice (SRS fixes
  the peso costs only). Gambling ADS (also in Appendix C) are M4.
- **Next: M4** — Temptation ad (≥3 dark patterns, Play / Report-Dismiss) and
  the rigged gambling minigame with the always-on odds tracker (SRS §4.2.5 /
  Appendix B). See the Build Plan.

## Working agreement
Build **one milestone at a time**, in order. Stop at each milestone's
acceptance criteria (in the Build Plan) and let me test before moving on.
Keep scope to the 3-week vertical slice (SRS §10 is the out-of-scope list).
Prefer small, readable functions; comment the *why*.
