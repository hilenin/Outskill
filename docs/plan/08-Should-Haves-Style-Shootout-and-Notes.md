# 08 — Should-Haves: Style Shootout & Custom Notes ⭐

**Owner:** 1 person (frontend, pairs briefly with plan 05's owner)
**Depends on:** 05, 06, 07 all working. **Rule from the playbook: do NOT start this until the must-have flow runs end-to-end twice in a row.**
**Estimated effort:** 2–3 hours (Day 3, only if stable)
**Deliverable:** The two ⭐ differentiators from the PRD: (S1) multi-style shootout comparing 2–3 concepts of the same room, and (S2) custom style notes influencing generation. Both degrade gracefully if cut.

---

## Tools Needed

| Tool | Purpose |
|------|---------|
| Bolt | UI changes via prompts |
| Existing Edge Function (plan 05) | No backend changes needed — shootout is N calls with the same `room_id`; notes already accepted in the contract |
| Slider/grid components from plans 06/07 | Reuse, don't rebuild |

## Tasks

### 1. S2 — Custom style notes (do this first; ~30 min)
Most of the plumbing already exists (04 has the field, 05 accepts + injects it):
- Verify the text flows end-to-end: type "keep the sofa, add plants" → generate → visible effect in output.
- Display the notes on the Result screen and Concept Detail (plans 06/07) as a small caption under the style badge.
- Sanity-test prompt-injection-ish input ("ignore previous instructions...") — plan 05 caps length; output should still be a room. If results derail, plan 05's owner wraps notes as: `User preferences (apply only if compatible with the style): "{notes}"`.

### 2. S1 — Style Shootout (the demo differentiator)
**Generation path (already works):** "Try Another Style" (plan 06 §3) generates concept #2/#3 for the same `room_id`.

**New UI — shootout view:**
- On Concept Detail (or a `/room/:roomId` view — pick whichever is faster in Bolt), when a room has ≥ 2 complete makeovers: show a comparison grid — original photo first, then each concept as a card with its style badge.
- Tap any concept card → opens the full before/after slider for that one.
- Add a "+ Try Another Style" tile at the end of the grid → `/new-makeover?room_id=...`.
- Gallery cards (plan 07) with multiple styles per room get a "N styles" chip that deep-links to this view.

Suggested Bolt prompt:
> "When a room has 2 or more complete makeovers, show a Style Shootout view: the original photo, then a responsive grid of concept cards each labeled with its style. Tapping a card opens the existing before/after slider for that concept. Include a '+ Try Another Style' tile linking to /new-makeover with the room_id query param."

### 3. Demo integration
- Prepare the shootout demo beat with plan 09's owner: same living room in **Japandi vs. Industrial**, shown in the grid ("Same room — two futures").

## Test Checklist
- [ ] Notes text demonstrably changes the output (sofa kept / plants added)
- [ ] Notes render on Result + Concept Detail; empty notes show nothing (no blank caption)
- [ ] Room with 3 concepts: shootout grid renders, each card opens the right slider
- [ ] Room with 1 concept: NO shootout UI appears (no empty grid)
- [ ] "+ Try Another Style" pre-loads the correct room photo without re-upload
- [ ] Mobile: grid stacks cleanly at 375 px

## Acceptance Criteria
- [ ] Both features work without destabilizing the must-have flow (re-run the full Flow 1 test after merging!)
- [ ] Shootout demo beat rehearsed with a real room photo
- [ ] Committed to GitHub by Code Owner
- [ ] **Cut-line honored:** if Day 3 noon arrives and these aren't stable, revert and ship the must-have flow only — parked per playbook Step 4.3
