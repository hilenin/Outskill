# Mini-PRD — Day 2 / Dev C: Result Screen & Before/After Compare

**Developer:** Dev C (frontend lead)
**Parent PRD:** `docs/PRD-AI-Interior-Makeover.md` — this PRD concentrates on:
- **§5.1 M5** — Before/After comparison (side-by-side slider vs. original) — **the product's wow moment**
- **§6 Flow 1, steps 4–6** — loading state → concept appears → compare → save
- **§6 Error flows** — AI failure/timeout → friendly error + Retry, state preserved
- **§9 Non-Functional Requirements** — "show progress feedback", graceful failure
- **§13 Demo Script, beat 4** — "the wow moment: the before/after slider on the user's actual room"

**Implementation plan:** `../06-Result-Screen-Before-After-Compare.md` (all of it)
**Work schedule:** `Day2-Work-Split.md` (Dev C column)

---

## Goal (your slice of the product)

By end of Day 2, `/result/:makeoverId` turns a 10–30 second AI wait into anticipation instead of doubt, then delivers the payoff: a smooth draggable slider between the user's real room and its restyled concept.

## Why this matters to the product

The parent PRD is explicit (§13): the slider IS the demo. Every other package exists to feed this screen. You also own the emotional risk nobody else can fix — 30 seconds of blank spinner reads as "broken," and §9 demands progress feedback. Build mock-first in the morning (seeded row) so you're never blocked on A or B.

## Requirements (your acceptance scope)

### R1 — Loading experience (Flow 1 step 4, §9)
- Poll the `makeovers` row every ~2.5 s (or Realtime) for pending → complete/failed.
- Show the ORIGINAL photo with a shimmer/scan animation + rotating status lines ("Analyzing your room…", "Applying Japandi style…"). No blank spinner >2 s.
- Client-side stop at 90 s → treat as failed (Dev A guarantees the row resolves by ~60 s).

### R2 — The slider (M5)
- `react-compare-slider`: original vs. concept, draggable divider, style badge; **signed URLs** (buckets are private — plain URLs 403).
- Preload both images before reveal; Before/After toggle fallback for accessibility and finicky mobile drags.
- Must feel great on phone touch — this is the Loom money shot.

### R3 — Actions (Flow 1 step 6 + §6 error flows)
- **Save to Gallery** → toast → `/gallery`. Decision at 2 PM sync with the team: recommendation is no `saved` flag (all completes are saved — plan 06 §3).
- **Try Another Style** → `/new-makeover?room_id=...` (param agreed with Dev B) — sets up Day 3's Shootout.
- **Retry on failed:** friendly message, same room + style re-submitted, state never lost. Distinct message for 429 `daily_limit`.
- Foreign/unknown `makeoverId` → "not found" (RLS proof at UI level).

## Out of scope for you today
- Upload screen (Dev B), function internals (Dev A)
- Gallery grid & concept detail (Dev B's Day 3 — but your slider gets reused there; keep it a clean shared component)
- Shootout grid (your Day 3 PRD)

## Definition of Done (Day 2)
- [ ] Pending → complete transition swaps animation for slider without refresh
- [ ] Slider smooth on desktop mouse AND real-phone touch; toggle fallback works
- [ ] Failed → Retry produces a new working concept; 429 message friendly
- [ ] Full flow ran end-to-end with A and B at the 5 PM sync; committed
