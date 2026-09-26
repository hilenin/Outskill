# Mini-PRD — Day 3 / Dev C: Differentiators (Style Shootout & Custom Notes) ⭐

**Developer:** Dev C (frontend lead)
**Parent PRD:** `docs/PRD-AI-Interior-Makeover.md` — this PRD concentrates on:
- **§5.2 S1** — Multi-style generation ("style shootout"): 2–3 concepts of the same room compared in a grid ⭐
- **§5.2 S2** — Custom style notes appended to the prompt ⭐
- **§6 Flow 3** — Style shootout flow: from a concept → try another style → compare both against the original
- **§13 Demo Script, beat 3** — "generate Industrial for the same room → compare both in gallery"

**Implementation plan:** `../08-Should-Haves-Style-Shootout-and-Notes.md` (all of it, including the cut-line rule)
**Work schedule:** `Day3-Work-Split.md` (Dev C column)

---

## ⚠️ The gate

You do not start this PRD until Dev A certifies the must-have flow passes **twice in a row** (~10 AM call). The parent PRD is unambiguous (§5.2): Should-haves come "only after Must-haves are stable." If the gate fails, your PRD for the morning is bug-fixing.

## Goal (your slice of the product)

By the 1 PM freeze, the product has its two ⭐ differentiators: users can steer the AI with their own words, and see one room re-imagined in multiple styles side by side — "same room, two futures."

## Why this matters to the product

Must-haves make the product work; these make it memorable. The competitor scan (playbook Step 3) found nobody does a polished multi-style comparison — S1 is the judges' screenshot. S2 turns a preset picker into a conversation ("keep MY sofa"), which is the difference between a filter app and a design tool.

## Requirements (your acceptance scope)

### R1 — S2 Custom notes, end-to-end (~30 min; do first)
- The plumbing exists (B's field → A's `custom_notes` → prompt). You verify the effect is REAL: "keep the sofa, add plants" visibly honored in output.
- Display notes on Result + Concept Detail as a caption; empty notes → nothing rendered.
- Adversarial check: "ignore previous instructions"-style notes must still yield a room; if output derails, Dev A wraps notes per plan 08 §1.

### R2 — S1 Style Shootout (Flow 3)
- When a room has ≥2 complete makeovers: comparison view — original first, then concept cards each with style badge; tap card → the existing slider for that concept.
- "+ Try Another Style" tile → `/new-makeover?room_id=...` (B's Day 2 param).
- Entry points: Concept Detail + Dev B's "N styles" gallery chip (agree the route with B).
- Exactly 1 concept → NO shootout UI (no sad empty grid).

### R3 — Stability preserved (the prime directive)
- After merging, re-run the FULL must-have flow. If anything regressed, fixing that outranks finishing this.
- **Cut-line (plan 08):** not stable by ~noon → revert cleanly and hand Dev A a working must-have build. Parked ≠ failed (§5.4 spirit).

### Afternoon (post-freeze) — deck & submission support
- Copy `AIAP _ Pitch Deck Template.pptx` → `docs/RoomReimagine-Pitch-Deck.pptx` (never edit the original); before/after pairs are the money slides; stack diagram: Bolt + Supabase + Gemini.
- Rehearse the shootout demo beat with Dev A: Japandi vs. Industrial on the same living room.

## Out of scope for you today
- Gallery/delete mechanics (Dev B), testing ownership (Dev A)
- Any backend change — shootout is N calls to the existing function; if you think you need one, talk to Dev A first

## Definition of Done (Day 3)
- [ ] Notes demonstrably steer output and display correctly (or consciously cut)
- [ ] Shootout grid works for 2–3 concepts; absent for 1 (or consciously cut)
- [ ] Must-have flow re-certified AFTER your merges
- [ ] Deck done; shootout demo beat rehearsed; committed before freeze
