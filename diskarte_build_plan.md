# Diskarte — Prototype Build Plan (Milestones)

**Companion to:** *Diskarte* SRS v1.0
**Prepared by:** Henna Marie S. Barcebal — BSIT, University of the Immaculate Conception
**Date:** October 14, 2026
**Build target:** High-fidelity web prototype (HTML5 + CSS3 + vanilla JS), portrait 360×640, offline
**Companion doc:** *Diskarte — Gameplay Flow & Scripted-Path Spec* (needed for Milestone 7)

---

## How to use this plan with Claude Code
1. Build **one milestone at a time**, in order. Each depends on the ones before it.
2. For each milestone, start Claude Code in **Plan mode** with the "Prompt starter" below, review the plan, then let it build.
3. Stop at the **Acceptance criteria** and actually test them in the browser (Live Server) before moving on.
4. **Commit** at each passing milestone (suggested message provided) so you can roll back.
5. Keep scope to the three-week vertical slice. If Claude Code wanders, point it at SRS §10 (Out of Scope).

A milestone is "done" only when every acceptance check passes. Partial = stay on it.

---

## Milestone overview

| # | Milestone | Outcome you can see | Depends on |
|---|---|---|---|
| **M0** | Scaffold & stage | Portrait stage renders; can navigate between blank screens | — |
| **M1** | State model & HUD | Week Hub shows live cash/meters/compulsion from state | M0 |
| **M2** | Budget allocation | Allocate income to needs; meters update on End Week | M1 |
| **M3** | Life events | One event card per week applies its effects | M2 |
| **M4** | Temptation & gambling | In-world phone ad → rigged spin → odds tracker | M3 |
| **M5** | Compulsion, debt & consequences | Compulsion bands, 5-6 debt, consequence screen | M4 |
| **M6** | Debrief, win/lose & end | Weekly math, win/lose check, end screens, restart | M5 |
| **M7** | Thread the scripted paths | Path A (spiral→lose) & Path B (resist→win) play reproducibly | M6 + Flow Spec |
| **M8** | Polish | Pixel art, animation, audio, "spot the manipulation", a11y | M7 |

M0–M6 build the **systems**. M7 threads the **demo**. M8 makes it **presentable**. If you run short on time, a working M0–M7 is a fully demoable prototype; M8 is finish.

---

## Milestones in detail

### M0 — Project scaffold & stage
**Goal:** a runnable skeleton you can navigate.
**Build:** the file structure from SRS §8.2; `index.html`; `styles.css` with the palette CSS variables (§3.5), `image-rendering: pixelated`, bundled pixel fonts, and a **360×640 portrait stage** that scales to the window (letterboxed); a simple **screen router** in `screens.js` (show/hide one screen at a time); placeholder screens for all 11 with temporary "Next" buttons.
**Acceptance:**
- Opens via Live Server; portrait stage renders and scales without distortion.
- Can click from Title → Character Select → Week Hub → … through all placeholders and back.
- Works with no internet (fonts/assets local).
**Commit:** `M0: project scaffold, stage, and screen router`
**Prompt starter:** *"Read `diskarte_srs.md` and `CLAUDE.md`. In Plan mode, scaffold the project per §8.2: index.html, styles.css (palette vars, pixelated rendering, 360×640 portrait stage that scales/letterboxes), and a screen router that shows one screen at a time. Add placeholder screens for all 11 with temporary Next buttons. No game logic yet."*

### M1 — State model & HUD
**Goal:** the Week Hub reflects game state.
**Build:** the single state object from SRS §6 (exact fields/initials); render the **Week Hub** HUD — cash, savings, debt, Food/Energy/Trust meters, compulsion meter, week counter — all bound to state; temporary dev controls to change state and watch the HUD update.
**Acceptance:**
- Initial values match §6 (cash 1500, meters 70, compulsion 0, etc.).
- Editing a state value updates the matching HUD element live.
- Meters render as segmented pixel bars clamped 0–100.
**Commit:** `M1: state model + Week Hub HUD bound to state`
**Prompt starter:** *"Implement `state.js` exactly per SRS §6, then build the Week Hub HUD (cash/savings/debt, three meters, compulsion, week counter) bound to it. Add temporary dev buttons to mutate state so I can verify the HUD updates."*

### M2 — Budget allocation
**Goal:** the core budgeting mechanic.
**Build:** the Budget Allocation screen with a row per need (§4.2.2), live **running remainder**, validation (cannot allocate more than cash), and an **End Week** action that applies under/over-funding to meters and advances the week.
**Acceptance:**
- Over-allocation is blocked; remainder never goes negative.
- Fully funding needs keeps meters stable; underfunding a need lowers its meter on End Week.
- Week counter increments; leftover cash can be moved to savings.
**Commit:** `M2: budget allocation + meter effects on week advance`

### M3 — Life events
**Goal:** scripted pressure.
**Build:** an event-card system driven by data (so events are easy to add); implement the Appendix C events for weeks 1–3; each card has 1–3 choices that apply the specified cost/consequence.
**Acceptance:**
- Exactly one event card appears at the right point each week.
- Each choice changes state as specified (cash/meters/debt).
**Commit:** `M3: life-event card system + week 1–3 events`

### M4 — Temptation & gambling minigame
**Goal:** the heart of the game.
**Build:** the in-world **phone** popup ad with ≥3 dark patterns (§4.2.8) and **Play / Report-Dismiss**; the **gambling minigame** using the rigged model (SRS §4.2.5 / Appendix B); a persistent **odds tracker** (true win %, total wagered, total returned, net — red when negative); cash updates per result.
**Acceptance:**
- First play follows beginner's luck (70% / 1.8×); subsequent plays follow 28% / 1.9×.
- Odds tracker math is correct and always visible during play.
- Dismiss path records an awareness point and skips the minigame.
**Commit:** `M4: temptation ad + rigged gambling minigame + odds tracker`

### M5 — Compulsion, debt & consequences
**Goal:** make the trap close.
**Build:** the **compulsion meter** (+12/gamble, −3/resisted week) with band effects (urge popups at 40, locked safe options at 70, game-over at 100); **loan-shark 5-6** borrowing (debt = 1.2×, +20%/week compounding); a **Consequence** screen summarizing changes.
**Acceptance:**
- Band effects trigger exactly at 40 / 70 / 100.
- Debt compounds correctly week to week.
- Consequence screen reflects the week's deltas.
**Commit:** `M5: compulsion bands + 5-6 debt + consequence screen`

### M6 — Debrief, win/lose & end
**Goal:** close the loop.
**Build:** the **weekly debrief** (player's real spend/save/gamble numbers, one reflective line); **win/lose evaluation** after Week 3 (§4.2.10); **End — Win / Lose** screens with the support message (FR-15); **Replay**.
**Acceptance:**
- Debrief figures match actual play.
- Each win/lose condition routes to the correct end screen.
- Support message appears on lose/debrief; Replay resets cleanly to initial state.
**Commit:** `M6: weekly debrief + win/lose + end screens + restart`

### M7 — Thread the scripted golden paths
**Goal:** a reliable demo. **Requires the Flow & Scripted-Path Spec.**
**Build:** a `paths.js` that injects the scripted beats for **Path A (spiral → lose)** and **Path B (resist → win)** from the Flow Spec beat tables; a launcher to pick a path; the optional **sandbox** mode (engine runs the real model instead of scripted beats).
**Acceptance:**
- Path A reproducibly reaches the lose state via the scripted beats, every run.
- Path B reproducibly reaches the win state.
- Both match the Flow Spec tables beat for beat; sandbox still plays freely.
**Commit:** `M7: scripted golden paths A/B + sandbox launcher`

### M8 — Polish
**Goal:** presentable.
**Build:** pixel-art pass (character, room, phone frame, UI sprites); animation (meter fills, debt ticking up, the deliberately **cheap** win jingle); "spot the manipulation" scoring surfaced; audio + mute; accessibility pass (contrast, tap targets); confirm letterboxing on odd window sizes.
**Acceptance:**
- Reads as an intentional game, not a wireframe.
- **NFR-ETH-2 holds:** the gambling minigame is clearly *less* appealing than budgeting; losses stay legible.
- Smooth at ≥30 fps; no layout breakage when resized.
**Commit:** `M8: art, animation, audio, and accessibility polish`

---

## Reusable screen-spec template
Don't pre-write all 11 screen specs. When you reach a screen, have Claude Code fill this template for *that* screen only, then build it. Keeps specs in sync with code.

```
SCREEN: <name / id>
PURPOSE: <one line>
ENTRY CONDITION: <what state/trigger brings the player here>
LAYOUT (portrait 360×640): <top / middle / bottom regions and what sits in each>
COMPONENTS: <list every element: buttons, meters, cards, phone frame, etc.>
STATE READ: <which state fields it displays>
STATE WRITTEN: <which fields its actions change, and by how much>
EVENTS / HANDLERS: <control → function → effect>
VALIDATION: <rules, e.g. cannot exceed cash>
EXIT / TRANSITIONS: <trigger → target screen> (must match the Flow Spec)
PIXEL / VISUAL NOTES: <sprites, colors from palette, animation>
EDGE CASES: <empty, max, locked-option, low-meter states>
```

---

## Definition of done (whole prototype)
- All 11 screens implemented and reachable; portrait, offline, scales cleanly.
- All 18 functional requirements (SRS §4.4) demonstrably pass via the §9 verification table.
- Both golden paths reproduce their outcomes; sandbox plays freely.
- Ethical guardrails (NFR-ETH-1…5) all hold.
- Runs from a single folder with no backend; committed to git at each milestone.

## Scope guardrails (say "no" to these for the prototype)
Multiplayer, teacher dashboard/backend, more than three weeks, languages beyond Taglish, finalized audio, cross-device save. All are roadmap (SRS §11), not this build.
