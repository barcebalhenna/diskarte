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
js/gamble.js      M4 — rigged odds model + spin (done, SRS App. B)
js/compulsion.js  M5 — compulsion band authority + effects (done)
js/events.js      M3 — data-driven life-event cards, 1 per week (done)
js/debrief.js     M6 — debrief + win/lose + hard-fail eval (done)
js/paths.js       M7 — scripted Path A/B beat playback (done)
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
- **M4 (temptation + gambling): DONE.** S5 ad with 5 dark patterns (fake
  countdown, winners ticker, free bait, fake endorser, near-miss) + Play /
  Report-Dismiss (dismiss → awareness +1 → skip to consequence). `gamble.js`
  runs the rigged model: first play 70%/1.8× (beginner's luck), every play
  after 28%/1.9×; a spin updates cash/wagered/returned, compulsion +12,
  gambleCount +1, and flags the week gambled. S6 has a bet-tier picker
  (₱50/100/200, unaffordable disabled) + SPIN; S7 reveals the result (wins
  deliberately flat per NFR-ETH-2). The always-on **odds tracker** shows the
  true next-spin win %, totals, and net (red when negative) on S6 and S7.
- **M5 (compulsion, debt, consequence): DONE.** `compulsion.js` is the band
  authority (control/urge/hooked/addiction at 40/70/100); the HUD reuses it.
  Band effects fire exactly on the thresholds: Urge (≥40) shows "one more spin"
  nudges on the Hub and Result; Hooked (≥70) locks the Savings row in the
  Budget; Addiction (100) triggers game-over at S8 → routes to the lose screen
  with `loseReason`. `Diskarte.borrow()` is the shared 5-6 rule (debt = 1.2×;
  weekly +20% compounding already in `budget.endWeek`); the Lola event reuses
  it. The S8 Consequence screen applies the week's meter drains, shows deltas
  vs the Hub snapshot (color-coded), offers a 5-6 loan, and surfaces the band.
- **M6 (debrief, win/lose, end, replay): DONE.** `debrief.js` owns the
  evaluation: `checkWin` (buffer ≥500, scholarship, compulsion <70, no meter 0),
  `hardFail` (compulsion 100 / scholarship lost / debt >2000 / any meter 0 for
  two weeks), and `resolveWeek` (once/week: Trust 0 ⇒ scholarship lost, zero-
  meter streak). The S8 Consequence runs the full hard-fail; S9 Debrief shows
  the week's own gambling numbers + a reflective line + the FR-15 support
  message, lets you move leftover cash to savings (Flow Spec S9; Hooked locks
  it), then advances (weeks 1–2) or runs the win/lose check (week 3) into the
  End-Win / End-Lose screens (final figures, reason, Replay → reset → S1).
  **The full M0–M6 loop is playable: both a natural win (save + raket → ₱700)
  and the gambling spiral (→ addiction/debt/scholarship lose) reproduce.**
- **M7 (scripted golden paths): DONE.** `paths.js` holds the Path A (spiral→
  lose) and Path B (resist→win) beat sequences from the Flow Spec §4–5. In a
  scripted path the engine injects each beat's canonical state and renders a
  read-only playback (SCRIPTED banner + live HUD + odds tracker on gambling
  beats + a Taglish caption + "Next ▶"); end beats show the real end screen.
  The Title is now a launcher: **Play — Sandbox** (full interactive engine,
  unchanged) / **Watch Path A** / **Watch Path B**. Both paths reproduce their
  Flow Spec §6 end states exactly and every run (A: debt ₱1,464 · Trust 20 ·
  compulsion 84 · scholarship lost → LOSE; B: savings ₱500 · intact · comp 0 →
  WIN). Replay → Title so you can re-pick. **M0–M7 = a fully demoable prototype.**
- **Next: M8** — polish: pixel art, animation, cheap win jingle + audio/mute,
  "spot the manipulation" scoring surfaced, accessibility, and the offline
  font bundling (@font-face into assets/fonts/) this file flags as required.
  See the Build Plan.

## Working agreement
Build **one milestone at a time**, in order. Stop at each milestone's
acceptance criteria (in the Build Plan) and let me test before moving on.
Keep scope to the 3-week vertical slice (SRS §10 is the out-of-scope list).
Prefer small, readable functions; comment the *why*.
