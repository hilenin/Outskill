# Mini-PRD — Day 2 / Dev B: Photo Upload & Style Selection

**Developer:** Dev B (data/backend → frontend support)
**Parent PRD:** `docs/PRD-AI-Interior-Makeover.md` — this PRD concentrates on:
- **§5.1 M2** — Room photo upload (camera or file, stored in Supabase Storage, preview before generating)
- **§5.1 M3** — Style selector (6–8 preset style cards with thumbnail + description)
- **§6 Flow 1, steps 2–4** — upload → preview → pick style → Generate
- **§6 Error flows** — upload fails / wrong file type → inline error, re-prompt
- **§9 Non-Functional Requirements** — image limits (10 MB, downscale to ~1024 px), upload-from-phone as primary path
- **§11 Risks** — Risk #4: poor-quality uploads (your upload-tips mitigation)

**Implementation plan:** `../04-Photo-Upload-and-Style-Selector.md` (all of it)
**Work schedule:** `Day2-Work-Split.md` (Dev B column)

---

## Goal (your slice of the product)

By end of Day 2, the `/new-makeover` screen takes a user from "I have a photo on my phone" to "generation started" in under 30 seconds: validated upload, instant preview, one-tap style choice, Generate.

## Why this matters to the product

You own the product's front door. The parent PRD's 2-minute demo bar (§3) spends most of its budget on your screen — and §11 Risk #4 says bad uploads produce bad AI output that users blame on the app, so your validation + tips are quality control for Dev A's engine, not just UX polish.

## Requirements (your acceptance scope)

### R1 — Upload (M2, §9 limits)
- JPG/PNG via drag-drop, file picker, and mobile camera capture; ≤10 MB validated BEFORE upload with inline errors naming accepted formats (§6 error flows — never silent).
- Canvas downscale to ≤1024 px longest edge (the §9 cost/speed guardrail — Dev A's function depends on receiving small images).
- Preview with "Change photo"; tip text: "Use a well-lit, wide-angle photo for best results" (Risk #4 mitigation).

### R2 — Style selection (M3)
- 8 style cards from Dev B's own Day 1 constants (plan 02 §5): thumbnail, name, one-liner; single-select with clear selected state.
- Optional notes field (≤200 chars) — plumbing for Should-have S2, flows into Dev A's `custom_notes`.

### R3 — The Generate hand-off (Flow 1 step 4)
- Disabled until photo + style are both set (with helper text).
- On click: upload to `room-photos/{user_id}/{room_id}.jpg` → insert `rooms` row → call Dev A's function (contract frozen 10 AM) → navigate to `/result/:makeoverId`.
- Any failure: toast, photo + style preserved, retriable (§6 error flows).
- Support `?room_id=` query param: pre-load an existing room's photo, skip re-upload (feeds Dev C's "Try Another Style" and Day 3's Shootout).

### R4 — Evening stretch: gallery seed (your Day 3 head start)
- Seed 3–4 fake makeovers; start plan 07's gallery grid if time remains.

## Out of scope for you today
- The result screen and slider (Dev C)
- Edge Function internals (Dev A — you only call the contract)
- Gallery completion (your Day 3 PRD)

## Definition of Done (Day 2)
- [ ] Phone camera → preview → style → Generate → lands on /result with a pending makeover (tested on a real phone)
- [ ] Oversize/wrong-type files rejected inline; 4000 px photo stored ≤1024 px
- [ ] `rooms` row + storage object follow the Day 1 path convention exactly
- [ ] Committed; integrated live at the 2 PM sync with A and C
