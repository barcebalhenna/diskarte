# Diskarte — Gameplay Flow & Scripted-Path Spec

**Companion to:** *Diskarte* SRS v1.0 and Build Plan (Milestone 7)
**Prepared by:** Henna Marie S. Barcebal — BSIT, University of the Immaculate Conception
**Date:** October 14, 2026
**Purpose:** This is the *threading* layer the SRS intentionally leaves out. It defines the screen state machine (what leads where, on what trigger) and the **beat-by-beat scripts** for the two demo paths, with exact injected values. Build this at Milestone 7 so the demo reproduces identically every run.

---

## 1. Screen IDs
| ID | Screen | Notes |
|---|---|---|
| S0 | Title / Main Menu | |
| S1 | Character Select | |
| S2 | Week Hub | Returned to at the start of each week |
| S3 | Budget Allocation | |
| S4 | Life-Event Card | |
| S5 | Temptation Ad | on the in-world phone |
| S6 | Gambling Minigame | on the in-world phone |
| S7 | Result / The Chase | |
| S8 | Consequence / Debt | |
| S9 | Weekly Debrief | |
| S10 | End — Win | |
| S11 | End — Lose | |

---

## 2. The weekly loop (state machine)
One week runs S2 → S3 → S4 → S5 → (S6 → S7 → …) → S8 → S9, then either loops to S2 (next week) or ends (S10/S11). See the accompanying diagram (`diskarte_flow_diagram.svg` / `.png`) for the visual.

### Transition table
| From | Trigger | To | Side-effects |
|---|---|---|---|
| S0 | "Start" | S1 | — |
| S1 | Confirm character | S2 | `week = 1`; load character profile; apply initial state (SRS §6) |
| S2 | "Plan Budget" | S3 | — |
| S3 | "Confirm allocation" | S4 | Pending allocation stored (applied on week advance) |
| S4 | Choice resolved | S5 | Apply event choice effects |
| S5 | "Play" | S6 | — |
| S5 | "Report / Dismiss" | S8 | `awareness += 1`; (resisting contributes to weekly compulsion decay) |
| S6 | Spin resolves | S7 | Apply bet result to `cash`, `totalWagered`, `totalReturned`; `compulsion += 12`; `gambleCount += 1` |
| S7 | "Play again" (chase) | S6 | — |
| S7 | "Stop" | S8 | — |
| S8 | "Continue" | S9 | Apply allocation → meters; resolve debt/loan; **hard-fail check** (below) |
| S9 | `week < 3` → "Next Week" | S2 | `week += 1`; add income; if `debt > 0`, `debt = round(debt × 1.2)`; if no gamble this week, `compulsion = max(0, compulsion − 3)` |
| S9 | `week == 3` → "Finish" | S10 / S11 | **Win/lose evaluation** (below) |
| S10 / S11 | "Replay" | S1 | Reset to initial state |
| S10 / S11 | "Try other path" | S2 | Reset; load the other scripted path |

### Evaluation points
- **Hard-fail check (on every S8):** if `compulsion == 100` → S11; if any meter `== 0` for two consecutive weeks → S11; if `debt > 2000` → S11; if `scholarshipActive == false` → S11.
- **Win check (end of Week 3, at S9→Finish):** `savings ≥ 500` AND `scholarshipActive` AND `compulsion < 70` AND no meter at 0 → **S10 (Win)**; otherwise → **S11 (Lose)**.

---

## 3. Scripting mechanism (how to implement the two paths)
- `state.path` ∈ `{ "A", "B", "sandbox" }`.
- `paths.js` holds `SCRIPT = { A: [beat…], B: [beat…] }`. Each **beat** is keyed by `{ week, screen }` and carries:
  - `inject` — state values to **set or add** on entering that screen (e.g., force a spin result, set a debt value).
  - `force` — the player choice to auto-apply or pre-highlight (e.g., `choice: "borrow"`, `ad: "play"`, `spin: "lose"`).
- **Scripted mode (A/B):** on entering a screen, the engine finds the matching beat, applies `inject`, and performs `force` — so the demo is deterministic.
- **Sandbox mode:** ignore `SCRIPT`; the engine runs the real model — `gamble.js` uses the Appendix B odds, `compulsion.js` uses the real formulas, and the player chooses freely.

This keeps one engine and one set of screens; only the *source of decisions* differs.

---

## 4. Path A — "The Spiral" → **LOSE**
Scripted so a small early win hooks the player into a chase that ends in debt and a lost scholarship. Allocations shown are representative; the **bold** values are the scripted injections that matter.

### Week 1 — the hook
| Step | Screen | Scripted action | Key state after |
|---|---|---|---|
| 1 | S2 Hub | Income arrives | cash **1500** |
| 2 | S3 Budget | Fund needs ₱1,350, keep ₱150 | cash 150 · meters 70/70/70 |
| 3 | S4 Event | Org fee ₱100 → **pay** | cash 50 |
| 4 | S5 Ad | "FREE ₱100 bonus spin" → **Play** | — |
| 5 | S6 Spin | Bet ₱50 → **beginner's luck WIN 1.8×** | cash **90** · compulsion **12** · wagered 50 / returned 90 / **net +40** |
| 6 | S7 Result | Small win; **Stop** (this week) | — |
| 7 | S8 → S9 | Consequence → Debrief: *"+₱40 — ang sarap, 'di ba?"* | savings 0 |

**End of Week 1:** cash 90 · savings 0 · debt 0 · meters 70/70/70 · compulsion 12 · net gambling **+40**.

### Week 2 — the chase + first loan
| Step | Screen | Scripted action | Key state after |
|---|---|---|---|
| 1 | S2 Hub | +₱1,500 income | cash 1,590 |
| 2 | S3 Budget | Fund Food/Fare/Load, **skip School ₱200**, no savings | cash 440 · Trust **55** (−15) |
| 3 | S4 Event | Lola sick ₱500 → **borrow via 5-6** | **debt 600** (1.2×₱500); cash 440 |
| 4 | S5 Ad | "47 people just won ₱10,000!" → **Play** | — |
| 5 | S6/S7 | Bet ₱200 **LOSE** → chase ₱200 **LOSE** | cash 40 · compulsion **36** · wagered 450 / returned 90 / **net −360** |
| 6 | S8 → S9 | Consequence → Debrief: net −₱360, debt appears | — |

**End of Week 2:** cash 40 · savings 0 · **debt 600** · Food 70 / Energy 70 / Trust 55 · compulsion 36.

### Week 3 — the collapse
| Step | Screen | Scripted action | Key state after |
|---|---|---|---|
| 1 | S2 Hub | +₱1,500; **debt compounds 600 → 720** | cash 1,540 · debt 720 |
| 2 | S3 Budget | Chase again; skip Load + School, no savings/payment | cash 540 · Trust **35** (−20) |
| 3 | S4 Event | Loan-shark follow-up + midterm → **default** | **debt 720 → 864**; scholarship flagged |
| 4 | S5 Ad | Urge popup (compulsion ≥ 40) → **binge** | — |
| 5 | S6/S7 | ₱200 lose → ₱200 lose → **borrow ₱500** (debt **1,464**) → lose; compulsion → **72 (Hooked: safe options lock)** → ~84 | cash ~140 · compulsion ~84 |
| 6 | S9 Finish | Evaluate → **scholarship lost** | → **S11 LOSE** |

**End of Week 3:** cash ~140 · savings 0 · debt **~1,464** (growing) · Trust ~20 · compulsion ~84 · **scholarship lost → LOSE.** Decisive trigger: scholarship; debt and compulsion are also failing.

---

## 5. Path B — "The Resist" → **WIN**
Same income and the same ₱500 Lola shock — but no gambling, disciplined budgeting, and one honest side-gig. Ends with a buffer.

> **New content beat:** Week 3 includes a legitimate **earning opportunity ("raket")** — a small design/tutoring gig for **₱250**. This positive event isn't in the SRS Appendix C yet; recommend adding it there so sandbox play can offer it too.

### Week 1 — discipline
| Step | Screen | Scripted action | Key state after |
|---|---|---|---|
| 1 | S2 Hub | Income | cash 1,500 |
| 2 | S3 Budget | Trim safely: Food 650 / Fare 300 / Load 100 / School 200 = 1,250; buffer 250 | Food **65** (−5), others 70 |
| 3 | S4 Event | Org fee ₱100 → pay from buffer | buffer 150 |
| 4 | S5 Ad | "FREE ₱100 bonus spin" → **Report/Dismiss** | **awareness 1**; compulsion 0 |
| 5 | S9 | Debrief → move ₱150 to savings | **savings 150** |

**End of Week 1:** cash 0 · savings 150 · debt 0 · Food 65 / Energy 70 / Trust 70 · compulsion 0 · awareness 1.

### Week 2 — absorb the shock, no debt
| Step | Screen | Scripted action | Key state after |
|---|---|---|---|
| 1 | S2 Hub | +₱1,500 | cash 1,500 (savings 150) |
| 2 | S3 Budget | Same trim; buffer 250 | meters steady |
| 3 | S4 Event | Lola sick ₱500 → pay ₱250 buffer + ₱150 savings; **family covers ₱100** after an honest talk → **no debt** | savings 0 · Trust **75** (+5) |
| 4 | S5 Ad | "47 people just won!" → **Dismiss** | **awareness 2**; compulsion 0 |
| 5 | S9 | Debrief: no gambling, no debt | — |

**End of Week 2:** cash 0 · savings 0 · debt 0 · Food 65 / Energy 70 / Trust 75 · compulsion 0 · awareness 2.

### Week 3 — recover → win
| Step | Screen | Scripted action | Key state after |
|---|---|---|---|
| 1 | S2 Hub | +₱1,500 | cash 1,500 |
| 2 | S3 Budget | Same trim; buffer 250 | Food 65 / Energy **65** |
| 3 | S4 Event | **Raket** (design/tutoring) → **accept, +₱250** | buffer 500 available to save |
| 4 | S5 Ad | Dismiss (no urge, compulsion 0) | **awareness 3** |
| 5 | S9 Finish | Move ₱500 to savings → evaluate | **savings 500** |

**End of Week 3:** cash 0 · **savings 500** · debt 0 · Food 65 / Energy 65 / Trust 75 · compulsion 0 · awareness 3 → **WIN.** (savings ≥ 500 ✓ · scholarship intact ✓ · compulsion < 70 ✓ · no meter at 0 ✓)

---

## 6. The contrast (your demo's punchline)
Same starting money. Same ₱500 emergency. Two endings:

| End of Week 3 | Path A — Spiral | Path B — Resist |
|---|---|---|
| Savings | ₱0 | **₱500** |
| Debt | ~₱1,464 (growing) | ₱0 |
| Scholarship | **Lost** | Intact |
| Compulsion | ~84 (Hooked) | 0 |
| Outcome | **LOSE** | **WIN** |

The only differences were: gambling + chasing + 5-6 loans (A) vs. dismissing ads + budgeting + one honest *raket* (B). Show Path A first for the gut-punch, then Path B to prove *diskarte* beats luck.

---

## 7. Sandbox mode (optional)
Same screens and transitions, but `state.path = "sandbox"`: no scripted beats. The gambling minigame rolls the real Appendix B odds, compulsion and debt use the real formulas, and the player makes every choice. Use it to let someone *actually play* after the two scripted demos — most will lose to the odds on their own, which is the lesson landing without a script.
