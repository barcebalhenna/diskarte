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
js/state.js       the single state object (SRS §6) — authoritative initials
js/screens.js     screen router + all 11 screens (placeholders at M0)
js/budget.js      M2 — allocation + meter effects (stub)
js/gamble.js      M4 — rigged odds model (stub, numbers from SRS App. B)
js/compulsion.js  M5 — compulsion meter + bands (stub)
js/events.js      M3 — life-event cards + dark-pattern ads (stub)
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
- **Next: M1** — bind the Week Hub HUD (cash/savings/debt, Food/Energy/Trust
  meters, compulsion, week counter) to `Diskarte.state`. See the Build Plan.

## Working agreement
Build **one milestone at a time**, in order. Stop at each milestone's
acceptance criteria (in the Build Plan) and let me test before moving on.
Keep scope to the 3-week vertical slice (SRS §10 is the out-of-scope list).
Prefer small, readable functions; comment the *why*.
