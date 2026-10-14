# Software Requirements Specification (SRS)
## *Diskarte* — A Game-Based Learning Platform for Financial Literacy and Online-Gambling Prevention

**Prepared for:** Game-Based Learning Platform Project
**Prepared by:** Henna Marie S. Barcebal — BSIT, University of the Immaculate Conception, Davao City
**Document version:** 1.1 *(adds a positive earning-opportunity event — the side-gig/*raket* — so disciplined play can win; see §4.2.4 and Appendix C)*
**Date:** October 14, 2026
**Status:** For development of a high-fidelity, playable prototype (vertical slice)

| Field | Value |
|---|---|
| **Working title** | *Diskarte* |
| **Tagline** | *"Survive the month. Outsmart the odds."* |
| **Build target (this SRS)** | High-fidelity web prototype — HTML5 + CSS3 + vanilla JavaScript |
| **Genre** | Scripted choice-driven budget life-simulation (serious game) |
| **Visual style** | 2D pixel art, mobile-first portrait |
| **Platform (prototype)** | Browser (desktop + Android); offline-capable |
| **Platform (full product)** | Native Android app via Flutter/Dart |

---

## 1. Introduction

### 1.1 Purpose of this document
This SRS defines the requirements for the **high-fidelity prototype** of *Diskarte*, a game-based learning (GBL) platform. It is written to be detailed enough that a developer can implement the prototype in code without further design decisions. It specifies the game's identity, educational goals, theme and art direction, gameplay systems, functional and non-functional requirements, screen-by-screen behavior, data model, and technical architecture. Where the full product differs from the prototype, this is stated explicitly.

### 1.2 Project overview
*Diskarte* is a single-player, narrative simulation in which the player manages the weekly budget of a young Filipino on a tight income while resisting the pull of online gambling. The player learns financial literacy and gambling-harm awareness **by experiencing the trap**, not by answering quizzes about it. The name *diskarte* is Filipino slang for resourcefulness and street-smart problem-solving — the exact skill the game builds.

### 1.3 Problem statement
Two documented, overlapping problems define the need for this platform in the Philippine context:

1. **A financial-literacy and comprehension gap.** In the OECD's PISA 2022 assessment, Filipino 15-year-olds ranked 76th of 81 countries in reading, 75th in mathematics, and 79th in science, with a mean reading score of 347 against a global average of roughly 476. Weak numeracy and comprehension translate directly into poor real-world money decisions.

2. **A youth online-gambling crisis.** A 2023 national survey (Capstone-Intel) found that about **66% of Filipinos aged 18–24 engage in online gambling**, many betting several times a week. E-wallets with weak age verification put gambling one tap away from students, and reports describe learners skipping classes, borrowing money, and misusing family funds to keep betting. In 2025 Senate hearings, lawmakers repeatedly urged the Department of Education to add gambling-harm awareness to school programs — yet there is still **no interactive, experiential learning tool** built for this purpose.

Together these create a population that is both financially under-equipped and heavily targeted by a 24/7 gambling industry engineered to exploit impulsivity. *Diskarte* addresses the intersection.

### 1.4 Existing solutions and their gaps
| Existing approach | What it does | Gap it leaves |
|---|---|---|
| **Awareness campaigns / seminars / posters** (schools, LGUs, PSAs) | Warn students that gambling is harmful | Passive and didactic; low engagement; tells rather than shows; forgotten quickly |
| **Quiz-gamification tools** (Kahoot/Quizizz-style) | Add points and leaderboards to money or values questions | *Extrinsic* — the game and the learning are separate; players memorize answers without changing behavior |
| **Financial-literacy games** (e.g., Visa's *Financial Football*) | Teach budgeting concepts through quiz-driven play | Not localized to Philippine incomes, currency, or informal lending; do not address gambling |
| **Poverty/decision simulators** (e.g., *SPENT*) | Let players feel hard budget trade-offs | Not Philippine-specific; no gambling system; browser-only, one-time play |
| **Misinformation-inoculation games** (e.g., *Bad News*) | Teach people to spot manipulation tactics | Right *method*, wrong *topic* — proves inoculation works, but nothing applies it to gambling ads |

**The gap in one line:** no existing tool combines (a) a Philippine financial context, (b) a gambling-specific, behaviorally honest mechanic, and (c) *experiential* learning where the player feels the trap close. *Diskarte* occupies exactly that space.

### 1.5 How *Diskarte* is different and how it solves the problem
*Diskarte* is built on three design commitments:

1. **Intrinsic mechanic — the game *is* the lesson.** Budgeting is taught by making the player allocate real pesos against real needs. Gambling harm is taught by letting the player gamble inside a **rigged-but-honest** probability model, where early "beginner's luck" hooks them and the negative expected value quietly drains them. The player does not read that "the house always wins" — they *lose to it*.

2. **Prevention, not treatment.** The target is young people who have not yet formed a habit. The goal is **inoculation**: feel the trap in a safe sandbox so the real one is recognizable and resistible.

3. **"Stability is the win."** The game cannot be won by gambling. It is won by reaching the end of the period with an emergency fund, intact relationships, and self-control — permanently reframing what "winning with money" means.

A distinctive sub-system, **"Spot the Manipulation,"** turns real gambling-ad dark patterns (fake countdowns, "47 people just won!", free-first-bet, celebrity faces) into scored gameplay, directly supporting proposed anti-gambling-advertising policy.

### 1.6 Scope of this SRS
This document covers the **prototype vertical slice**: a complete, polished, playable arc of **three in-game weeks** that runs the entire emotional and educational loop end to end, across roughly 11 screens, in two scripted outcomes (a "spiral" path and a "resist" path) plus an optional live-simulation sandbox. Full-product features (multiplayer, teacher analytics dashboard, full semester campaign, multi-language localization) are documented in the roadmap (Section 11) but are **out of scope for this build** (Section 10).

### 1.7 Definitions, acronyms, and abbreviations
See the glossary in **Appendix A** for Filipino terms (*diskarte*, *5-6*, *baon*, *sari-sari*, *iskolar*, *utang*, *Taglish*). Technical terms: **GBL** (game-based learning), **EV** (expected value), **HUD** (heads-up display), **SPA** (single-page application), **FR** (functional requirement), **NFR** (non-functional requirement).

### 1.8 References
- OECD PISA 2022 Results — Philippines country performance (reported via Philstar, Rappler, and Senate press releases, December 2023).
- Capstone-Intel 2023 national survey on online gambling among Filipinos aged 18–24 (reported via SunStar, Tribune, 2025).
- Philippine Senate Committee on Games and Amusement hearings on online gambling, 2025 (reported via multiple outlets; resolutions by Sen. Gatchalian, Sen. Pimentel, Sen. Tulfo).

---

## 2. Game identity and overall description

### 2.1 Name and meaning
**Diskarte** — Filipino for resourcefulness, hustle, and figuring a way through with limited means. The title frames the player's goal positively: not "avoid gambling" but "master your *diskarte*."

### 2.2 Genre and classification
A **serious game** in the **scripted, choice-driven life-simulation** genre — closer to *BitLife* or an interactive visual novel with a budgeting dashboard than to an open sandbox like *The Sims*. This classification is deliberate: a scripted branching structure is honest to prototype (no simulation engine required to fake convincingly) and is how the real product would be authored.

### 2.3 Subject area and curriculum alignment
- **Primary:** Financial Literacy and Life Skills.
- **Cross-cutting:** Values Education (*Edukasyon sa Pagpapakatao*) and Health (behavioral-addiction awareness).
- **Policy fit:** Aligns with DepEd's push to integrate financial literacy and the 2025 legislative calls to include gambling-harm awareness in school programs.

### 2.4 Target learners and audience
**Primary players — Senior High School and early college students, ~15–20 years old.** This is where the crisis lives, where prevention is still possible, and where players have just enough money logic (allowance/*baon*, first e-wallet, stipend, or sideline income) to relate.

**Highest-priority sub-segments** (the design is tuned to these):
- Students with their own e-wallet and weak parental oversight.
- Scholars and working students on a fixed stipend — prime targets, because a "sure win" looks like a shortcut out of a tight budget.
- Students from low-income households, where the "one big win escapes poverty" fantasy hits hardest.

**Secondary audiences (the "platform" dimension):**
- **Teachers / guidance counselors** — deploy the game and lead the post-play debrief (future: a light results dashboard).
- **DepEd, LGUs, and NGOs** — potential adopters/funders of a classroom tool.
- **Parents** — not players, but a possible "what your teen sees" awareness mode.

### 2.5 Learning objectives (measurable)
After playing, the learner should be able to:
- **LO1** — Allocate a fixed weekly income across competing needs while maintaining a buffer.
- **LO2** — Explain, using the game's visible odds tracker, why gambling has negative expected value.
- **LO3** — Identify at least four manipulative tactics used in gambling advertisements.
- **LO4** — Describe the debt trap of informal "5-6" lending and compounding interest.
- **LO5** — Choose and justify resistance strategies, reframing "winning" as financial stability.

### 2.6 Educational philosophy
Experiential and constructivist: the player builds understanding through consequence, not instruction. Every lecture is replaced by a mechanic; every mechanic ends in a short, numbers-based **debrief** that names what just happened.

### 2.7 Product perspective and future vision
The prototype is a **standalone browser artifact** with no backend. It is designed to double as a **clickable specification** for the full product, which will be rebuilt natively in **Flutter/Dart** as an offline Android APK. The screen flow, state variables, and systems defined here map cleanly onto a Flutter widget tree.

### 2.8 Assumptions and dependencies
- The prototype runs client-side only; no server, account, or network connection is required at play time.
- Players use a modern browser (Chromium, Firefox, or Safari) on desktop or a mid-range Android phone.
- Pixel-art assets and fonts are bundled locally so the game works fully offline.

### 2.9 Constraints
- **No real money and no real gambling** of any kind. All currency is fictional.
- The gambling minigame must never be more rewarding or exciting than the budgeting path (see NFR-ethics, Section 7.4).
- Prototype content is limited to the three-week vertical slice.
- Must be demonstrable on a phone screen and via screen-recording as a fallback.

---

## 3. Theme, narrative, and art direction

### 3.1 Theme and tone
Grounded, relatable, and quietly tense — the mood of a tight budget, not a casino's glamour. Cautionary without being preachy: the game lets players make mistakes and feel them. Humor and warmth (Filipino everyday life) balance the pressure.

### 3.2 Setting and narrative premise
A present-day Filipino urban-poor / student setting: a small rented room, a *sari-sari* store, a *barangay* street, a phone screen full of e-wallet notifications and gambling ads. The player lives one week at a time, trying to reach the end of the month intact.

### 3.3 Playable characters
Each character is a difficulty setting and a different income/obligation profile, adding replay value.

| Character | Income source | Core pressure | Difficulty |
|---|---|---|---|
| **Iskolar (scholar)** — *default* | Monthly stipend, disbursed in parts | Must keep grades up or lose the stipend | Medium |
| **Tindera's kid** | Share of *sari-sari* store earnings | Irregular income; family depends on the store | Hard |
| **Call-center newbie** | First regular paycheck | Lifestyle temptation; payday-to-payday | Easy–Medium |

**Default for the prototype demo: Iskolar** — the most relatable to the target class and the cleanest stakes (grades ↔ income).

### 3.4 Visual style — 2D pixel art (decision + rationale)
**Decision: 16-bit-inspired 2D pixel art, mobile-first portrait.** Rationale: pixel art reads as "a real game" (not a worksheet), is cheap and fast to produce consistently as a solo/small-team project, scales crisply, and gives the everyday Filipino setting a warm, nostalgic, approachable feel that lowers the defensiveness a "lecture about gambling" would trigger.

- **Orientation / logical resolution:** portrait, base design canvas **360 × 640 px** (9:16), scaled up with integer/`pixelated` rendering so pixels stay crisp.
- **Sprite grid:** 16×16 or 32×32 base tiles; characters ~32×48.
- **Rendering:** `image-rendering: pixelated` on all raster assets; avoid sub-pixel scaling.
- **UI treatment:** chunky pixel panels, bordered "card" modals, HUD meters as segmented pixel bars.

### 3.5 Color palette
A cohesive, limited palette with a reserved "danger" hue for gambling.

| Role | Hex | Use |
|---|---|---|
| Night base | `#1B1B2F` | Backgrounds |
| Panel | `#16213E` | Cards, HUD panels |
| Stability green | `#43AA8B` | Money saved, "good" states, win |
| Warm highlight | `#FF9F1C` | Sari-sari / friendly accents, buttons |
| Gambling red | `#E63946` | Gambling UI, debt, danger, lose |
| Text light | `#F1FAEE` | Primary text |
| Muted | `#8D99AE` | Secondary text, disabled |

### 3.6 Typography
- **Display / HUD numbers:** a blocky pixel font (e.g., *Press Start 2P*), used sparingly for titles and key figures.
- **Body / dialogue:** a legible pixel/retro font (e.g., *VT323* or *Pixelify Sans*) at a comfortable size for accessibility.
- Fonts bundled locally (no CDN dependency) for offline use.

### 3.7 Audio direction
- Light chiptune background loop (calm on the budget screen, tense/seductive on the gambling screen).
- SFX: coin/cash for income and saving; a deliberately **hollow, cheap** jingle for gambling wins (so wins never feel truly good); a soft alarm for low meters.
- Audio is **optional** in the prototype (placeholders acceptable) and must be mutable.

### 3.8 Accessibility and localization
- Text in **Taglish** (English–Filipino mix) matching how the target audience actually speaks.
- Body text legible despite pixel style; adequate contrast against panels.
- All actions reachable by tap (touch-first); no reliance on hover.
- Full localization (e.g., Cebuano/Bisaya for Davao) is a **future** item; the prototype ships in Taglish.

---

## 4. Gameplay and functional requirements

### 4.1 Core gameplay loop
One **turn = one in-game week**. The loop:

1. **Income arrives** (stipend / earnings / paycheck).
2. **Budget allocation** — the player distributes income across fixed needs.
3. **Life event** — a card introduces an unexpected cost or choice.
4. **Temptation** — a gambling ad (with dark patterns) appears; the player may engage or dismiss.
5. **Gambling minigame** (if engaged) — a rigged, odds-visible draw; possible micro-win → the "chase."
6. **Consequences resolve** — meters update; debt accrues; compulsion meter shifts.
7. **Weekly debrief** — a short, numbers-based reflection screen.
8. Advance to next week → repeat. After Week 3, reach a **win** or **lose** end-state.

### 4.2 Game systems

**4.2.1 Economy / wallet.** Tracks cash on hand (₱), savings/emergency fund (₱), and debt (₱). Default **Iskolar** weekly income: **₱1,500**.

**4.2.2 Budget allocation.** The player assigns cash to needs. Under-funding a need drains the matching meter and can trigger events.

| Need | Suggested weekly cost | Meter affected |
|---|---|---|
| Food (*pagkain*) | ₱700 | Food |
| Fare (*pamasahe*) | ₱300 | Energy (if unfunded, player misses class) |
| Load / data | ₱150 | Trust/social (and exposure to ads) |
| School supplies / fees | ₱200 | Trust (grades) |
| **Savings (optional)** | remainder | Emergency fund |

With ₱1,500 income and ~₱1,350 of needs, the player has ~₱150 of slack — deliberately tight.

**4.2.3 Status meters (0–100).** **Food**, **Energy**, **Trust** (family/scholarship standing). Dropping below thresholds triggers negative events (e.g., Energy < 20 → fail a quiz → Trust drop → scholarship at risk).

**4.2.4 Life events.** Scripted cards per week. Most are **costs or pressures** (e.g., "Lola is sick — ₱500," "Org collection — ₱100," "Barkada invites you out — ₱250 or lose social standing"), but the set also includes the occasional **positive earning opportunity** — a small legitimate side-gig (*raket*), such as a design or tutoring job — so that disciplined, non-gambling play can realistically build a buffer and reach the win condition even after absorbing an emergency. See Appendix C for the sample set.

**4.2.5 Temptation and gambling minigame (the core).** A gambling ad popup offers to play. If engaged, the player bets from cash on hand and plays a draw/spin. The outcome uses a **rigged-but-honest probability model**:

| Play | Win chance | Payout multiplier | Expected value on a ₱50 bet | Purpose |
|---|---|---|---|---|
| 1st play (beginner's luck) | 70% | 1.8× | +₱40 (net, scripted win) | The hook |
| 2nd play onward | 28% | 1.9× | 0.28 × ₱95 − ₱50 = **−₱23.40** | The real house edge |

An on-screen **odds tracker** always shows: current true win %, total wagered, total returned, and **net result (red when negative)**. Bet tiers: **₱50 / ₱100 / ₱200**.

**4.2.6 Compulsion meter (0–100).** Rises **+12 per gamble**, decays **−3 per week the player resists**. Behavior by band:

| Band | Range | Effect |
|---|---|---|
| In control | 0–39 | Normal play |
| Urge | 40–69 | Unprompted "one more spin" popups; ads appear more often |
| Hooked | 70–99 | Some safe budget options are greyed/locked; stronger auto-nudges |
| Addiction (lose) | 100 | Game-over: addiction end-state |

**4.2.7 Debt and informal lending ("5-6").** The player may borrow from a loan shark. Borrowing ₱X creates a debt of **1.2 × X** (the "5-6" ~20% rule), and unpaid debt grows **+20% per week (compounding)**. Debt over the cap is a lose condition.

**4.2.8 "Spot the manipulation."** Gambling ads contain real dark patterns the player can learn to recognize. Correctly tapping the **"Report / Dismiss"** action on a manipulative element scores awareness points and lowers ad frequency; being fooled raises it.

| Dark pattern | In-game representation |
|---|---|
| False urgency | Fake countdown timer |
| Social proof | "47 people just won ₱10,000!" ticker |
| Free-first hit | "Claim your FREE ₱100 bonus spin" |
| Authority/celebrity | Familiar-looking endorser face |
| Near-miss design | Reels landing just short of a jackpot |

**4.2.9 Weekly debrief.** After each week: a short screen showing the math — e.g., "You spent ₱350 chasing bets. That would have been 70% of your emergency-fund goal." No lecture voice; just the player's own numbers.

**4.2.10 Win / lose conditions.**
- **Win (end of Week 3):** emergency fund ≥ **₱500** AND scholarship intact AND compulsion < 70 AND no meter at 0. Message: *"Stability is the real win."*
- **Lose:** debt > **₱2,000**, OR scholarship lost, OR compulsion = 100, OR any need at 0 for two consecutive weeks.

### 4.3 Scripted vertical slice (two golden paths)
The prototype ships **two predetermined playthroughs over the same screens**, with per-screen numbers hand-set to tell each story, plus an optional live-model sandbox.

- **Path A — The Spiral (primary demo):** player engages the ad, wins small (Week 1), chases and borrows (Week 2), debt + compulsion spiral, scholarship dropped (Week 3) → **lose**. This is the emotionally decisive demo.
- **Path B — The Resist:** player dismisses ads, budgets carefully, and takes one legitimate side-gig (*raket*) to build a buffer → **win**. Shows the alternative and the message.
- **Sandbox (optional):** free play where the real probability/compulsion model runs live.

### 4.4 Functional requirements (enumerated, testable)
- **FR-1** The system shall present a title screen with **Start**, **How to Play**, and **Mute** controls.
- **FR-2** The system shall let the player select one of three characters; **Iskolar** is default/pre-highlighted.
- **FR-3** The system shall display a **Week Hub** showing cash, savings, debt, the three status meters, the compulsion meter, and the current week number.
- **FR-4** The system shall let the player allocate cash to each need via tap/drag, prevent over-allocation beyond available cash, and show the running remainder.
- **FR-5** The system shall apply allocation results to status meters on week advance.
- **FR-6** The system shall present at least one life-event card per week with 1–3 choices and apply their effects.
- **FR-7** The system shall display a gambling ad popup containing at least three dark-pattern elements, with **Play** and **Report/Dismiss** actions.
- **FR-8** The system shall run the gambling minigame using the rigged odds in §4.2.5 and update cash accordingly.
- **FR-9** The system shall display a persistent **odds tracker** (true win %, total wagered, total returned, net result) whenever the gambling screen is active.
- **FR-10** The system shall update the **compulsion meter** per §4.2.6 and enforce its band effects (urge popups, locked options, game-over at 100).
- **FR-11** The system shall allow borrowing via a loan shark and accrue debt per the "5-6" model (§4.2.7).
- **FR-12** The system shall score "Spot the Manipulation" interactions and adjust ad frequency.
- **FR-13** The system shall show a weekly debrief screen with the player's own spending/saving figures.
- **FR-14** The system shall evaluate win/lose conditions after Week 3 (§4.2.10) and show the matching end screen.
- **FR-15** The system shall display, on lose and debrief screens, a brief **support message** encouraging players who struggle with real gambling to seek help/talk to a trusted adult or counselor.
- **FR-16** The system shall support the two scripted golden paths (A and B) for demonstration.
- **FR-17** The system shall allow restart from any end screen.
- **FR-18** All screens shall render correctly in portrait on a phone-width viewport.

---

## 5. Screen / scene specifications
Eleven core screens form the vertical slice. Each entry lists purpose, key elements, interactions, and transitions.

1. **Title / Main Menu** — *Purpose:* entry + framing. *Elements:* logo, tagline, Start/How-to-Play/Mute. *Transition:* Start → Character Select.
2. **Character Select** — *Elements:* three pixel portraits with income/pressure summary; Iskolar default. *Transition:* confirm → Week Hub (Week 1).
3. **Week Hub (hero screen — 60% of polish)** — *Elements:* HUD (cash, savings, debt), three status meters, compulsion meter, week counter, room/character sprite, **"Plan Budget"** and **"End Week"** buttons. *Transition:* Plan Budget → Budget Allocation.
4. **Budget Allocation** — *Elements:* need rows with cost inputs, running remainder, confirm. *Validation:* cannot exceed cash. *Transition:* confirm → Life Event.
5. **Life-Event Card** — *Elements:* illustrated card, short Taglish text, 1–3 choice buttons with cost/consequence hints. *Transition:* choice → Temptation.
6. **Temptation Popup** — *Elements:* gambling ad with ≥3 dark patterns, **Play** / **Report-Dismiss**. *Transition:* Play → Gambling Minigame; Dismiss → Consequence.
7. **Gambling Minigame** — *Elements:* spin/draw visual, bet-tier selector (₱50/₱100/₱200), persistent odds tracker, Spin, Stop. *Transition:* result → Result screen.
8. **Result / The Chase** — *Elements:* win or loss reveal (cheap-feeling win jingle), "Play again?" nudge, compulsion update. *Transition:* → Consequence.
9. **Consequence / Debt** — *Elements:* meter/cash/debt changes, optional loan-shark offer, compulsion band warning if triggered. *Transition:* → Weekly Debrief.
10. **Weekly Debrief** — *Elements:* the week's money math, one reflective line, Next Week button; support message if relevant. *Transition:* → Week Hub (next week) or End screen after Week 3.
11. **End — Win / Lose** — *Elements:* outcome summary, final figures, the "Stability is the real win" message (win) or spiral recap + support message (lose), **Replay** / **Try the other path**.

*(Optional 12th: Pause/How-to-Play overlay.)*

---

## 6. Data model / state specification
All state is held in a single in-memory object (optionally mirrored to `localStorage` for resume). Developers should treat the ranges and initial values below as authoritative for the Iskolar default.

| Variable | Type | Range / unit | Initial | Notes |
|---|---|---|---|---|
| `week` | int | 1–3 | 1 | Current week |
| `character` | enum | iskolar / tindera / callcenter | iskolar | Difficulty profile |
| `cash` | int | ₱ ≥ 0 | 1500 | Cash on hand |
| `savings` | int | ₱ ≥ 0 | 0 | Emergency fund |
| `debt` | int | ₱ ≥ 0 | 0 | Includes accrued interest |
| `meterFood` | int | 0–100 | 70 | |
| `meterEnergy` | int | 0–100 | 70 | |
| `meterTrust` | int | 0–100 | 70 | Scholarship standing |
| `compulsion` | int | 0–100 | 0 | Hidden until first gamble |
| `gambleCount` | int | ≥ 0 | 0 | Drives beginner's-luck logic |
| `totalWagered` | int | ₱ ≥ 0 | 0 | Odds tracker |
| `totalReturned` | int | ₱ ≥ 0 | 0 | Odds tracker |
| `awareness` | int | 0–100 | 0 | "Spot the manipulation" score |
| `scholarshipActive` | bool | — | true | |
| `path` | enum | A / B / sandbox | sandbox | Demo scripting flag |
| `muted` | bool | — | false | |

**Derived values:** `netGambling = totalReturned − totalWagered`; `trueWinPct` from the model in §4.2.5; win/lose checks per §4.2.10.

---

## 7. Non-functional requirements

### 7.1 Performance
- **NFR-1** Initial load ≤ 3 seconds on a mid-range Android phone over a local file.
- **NFR-2** Interactions respond within 100 ms; animations run at ≥ 30 fps.

### 7.2 Platform and compatibility
- **NFR-3** Runs fully **offline** after first load; no network calls at play time.
- **NFR-4** Works in current Chromium, Firefox, and Safari; **mobile-first portrait**, responsive down to 320 px width.
- **NFR-5** Pixel assets render crisply (`image-rendering: pixelated`, integer scaling).

### 7.3 Maintainability and portability
- **NFR-6** Code organized into clear modules (state, screens, systems) so it can be read as a spec and re-implemented in Flutter.
- **NFR-7** Total bundle kept small (target < 10 MB including assets) for easy sharing and APK wrapping.
- **NFR-8** No backend, database, or account system.

### 7.4 Ethical and safety requirements (critical)
- **NFR-ETH-1** No real money, real betting, or links to real gambling platforms, ever.
- **NFR-ETH-2** The gambling minigame must be **less** rewarding and **less** fun than the budgeting path; the visible odds tracker and compulsion meter must make losses legible at all times.
- **NFR-ETH-3** The product must be clearly framed as educational on the title and end screens.
- **NFR-ETH-4** A supportive, non-judgmental help message must appear on lose/debrief screens (FR-15), pointing players who struggle with real gambling toward a trusted adult, counselor, or recognized help resource.
- **NFR-ETH-5** No depiction that glamorizes gambling or implies it is a viable path out of poverty.

---

## 8. Technical architecture (prototype)

### 8.1 Technology stack (decision + rationale)
**Decision: HTML5 + CSS3 + vanilla JavaScript (ES6), DOM/CSS-driven UI with pixel-art assets.** Rationale: *Diskarte* is a UI- and card-driven simulation, not a physics/action game, so a full game engine is unnecessary. Vanilla web tech has **no build step**, runs offline, is trivial to demo and share, and maps most cleanly onto a future Flutter widget tree. A small canvas scene may be used for the character/room if desired.

- **Alternative (optional):** if richer animated pixel scenes are wanted, a lightweight engine such as **KAPLAY (formerly Kaboom.js)** or **Phaser** may be introduced for the game-scene layer only. Not required for the slice.
- **Not recommended:** Unity/Godot (overkill for a prototype); Flutter for the prototype itself (slower to iterate just to demo screens — reserved for the full product).

### 8.2 Suggested project structure
```
diskarte/
  index.html
  /css/        styles.css (palette vars, pixel rendering, layout)
  /js/
    state.js     state object + save/load
    screens.js   screen rendering + navigation
    budget.js    allocation + meters
    gamble.js    rigged odds model + odds tracker
    compulsion.js compulsion meter + band effects
    events.js    life events + dark-pattern ads
    debrief.js   weekly math + win/lose checks
    paths.js     scripted golden paths A/B
  /assets/
    /sprites/   characters, room, UI (pixel art)
    /fonts/     bundled pixel fonts
    /audio/     optional chiptune + SFX
```

### 8.3 Asset pipeline
Pixel sprites authored on the 16/32 px grid (e.g., in Aseprite or Piskel), exported as PNG sprite sheets; fonts and audio bundled locally.

### 8.4 Running and deployment
- **Run:** open `index.html` directly, or serve locally for module imports.
- **Share/demo:** host on GitHub Pages (static), or run offline from the file system.
- **Later APK:** wrap as a PWA or via Capacitor for Android, or (preferably) rebuild in Flutter.

---

## 9. Verification — mapping requirements to the demo
Each golden path exercises a defined set of requirements, so the demo doubles as an acceptance walkthrough:

| Demo beat | Requirements verified |
|---|---|
| Start → character select | FR-1, FR-2 |
| Week Hub + budget | FR-3, FR-4, FR-5 |
| Life event | FR-6 |
| Ad popup + spin | FR-7, FR-8, FR-9 |
| Chase + loan + spiral | FR-10, FR-11 |
| Dismiss + awareness (Path B) | FR-12 |
| Debrief + end | FR-13, FR-14, FR-15 |
| Replay / switch path | FR-16, FR-17 |

---

## 10. Out of scope (for this prototype)
- Multiplayer or classroom co-op.
- Teacher analytics dashboard and any backend/accounts.
- Full-semester campaign beyond three weeks.
- Multi-language localization beyond Taglish.
- Finalized audio design (placeholders acceptable).
- Real save-sync across devices.

---

## 11. Future roadmap (full product)
1. **Native rebuild in Flutter/Dart** as an offline Android APK.
2. **Content expansion:** full month(s), all three characters fully implemented, more life events and ad patterns.
3. **Teacher platform:** deployment + a light results/debrief dashboard (the "platform" layer).
4. **Localization:** Cebuano/Bisaya (Davao) and other mother tongues.
5. **Validation:** classroom playtesting and a pre/post knowledge-and-attitude study to measure learning gains.
6. **Partnerships:** DepEd / LGU / NGO pilots.

---

## Appendix A — Glossary of Filipino terms
- **Diskarte** — resourcefulness; street-smart way of getting by.
- **5-6** — informal lending at ~20% interest (borrow 5, repay 6).
- **Baon** — allowance / money or food brought from home.
- **Sari-sari store** — small neighborhood convenience store.
- **Iskolar** — scholar / scholarship recipient.
- **Utang** — debt / to owe.
- **Pamasahe** — transport fare.
- **Barkada** — friend group.
- **Taglish** — mixed Tagalog–English speech.

## Appendix B — Gambling odds reference (authoritative for implementation)
| Parameter | Value |
|---|---|
| Bet tiers | ₱50 / ₱100 / ₱200 |
| First-play win chance (scripted) | 70% |
| First-play payout | 1.8× |
| Subsequent win chance | 28% |
| Subsequent payout | 1.9× |
| EV per ₱50 bet (after first) | −₱23.40 |
| Compulsion per gamble | +12 |
| Compulsion decay per resisted week | −3 |

## Appendix C — Sample life events (vertical slice)
| Week | Event | Choices / effect |
|---|---|---|
| 1 | "Org collection fee — ₱100" | Pay (−₱100) or skip (−Trust) |
| 1 | Gambling ad: "FREE ₱100 bonus spin!" | Play or Report/Dismiss |
| 2 | "Lola is sick — ₱500 for medicine" | Pay, borrow (5-6), or delay (−Trust, −Food) |
| 2 | Gambling ad: "47 people just won ₱10,000!" | Play or Report/Dismiss |
| 3 | "Midterm week — low Energy risks failing" | Buy food/rest or push through (−Energy → quiz) |
| 3 | Loan-shark follow-up on unpaid debt | Pay, partial, or default (debt +20%) |
| 3 | **"Raket — a small design/tutoring gig"** *(positive)* | Accept (+₱250, −Energy) or decline — lets disciplined, non-gambling play reach the savings goal |

---

*End of SRS v1.1 — Diskarte. (Change from v1.0: added the positive earning-opportunity event — the side-gig/*raket* — in §4.2.4, §4.3, and Appendix C.)*
