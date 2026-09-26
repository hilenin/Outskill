# Mini-PRD — Day 2 / Dev A: AI Generation Engine

**Developer:** Dev A (backend lead)
**Parent PRD:** `docs/PRD-AI-Interior-Makeover.md` — this PRD concentrates on:
- **§5.1 M4** — AI makeover generation (layout preserved, furnishings restyled)
- **§8 Architecture** — the Edge Function + AI prompt strategy (this is YOUR box in the diagram)
- **§9 Non-Functional Requirements** — latency (<30 s target, 60 s timeout), cost control (20/user/day), graceful failure
- **§11 Risks** — geometry distortion, cost overrun, Edge Function timeouts (all three mitigations are yours)

**Implementation plan:** `../05-Edge-Function-AI-Generation.md` (all of it — contract in §3 is what you freeze today)
**Work schedule:** `Day2-Work-Split.md` (Dev A column)

---

## Goal (your slice of the product)

By end of Day 2, `generate-makeover` is deployed, battle-tested via curl, and produces geometry-preserving restyles for all 8 styles. Your function is the product's engine — every wow moment Dev C shows runs through it.

## Why this matters to the product

M4 is the makeover in "AI Interior Makeover." Everything else is chrome around your function. The parent PRD also makes YOU the failure-safety owner: "every AI failure leaves the app in a recoverable state" (§9) is implemented as your never-stuck-pending guarantee.

## Requirements (your acceptance scope)

### R1 — The contract, frozen by 10 AM (plan 05 §3)
- Request `{room_id, style, custom_notes}` → immediate `{makeover_id, status:"pending"}`; row later flips to `complete`/`failed`. Devs B and C build against this today — breaking it after 10 AM breaks two people.

### R2 — Guardrails (parent PRD §9)
- Rate limit: ≥20 generations/day → 429 `daily_limit` (Dev C renders the friendly message).
- 55 s timeout + one retry on 5xx/timeout; a row NEVER stays `pending` (§9 graceful failure).
- Input validation: caller owns the room; style is a known slug; notes ≤300 chars, sanitized (user text enters your prompt).

### R3 — Generation quality (M4 + §11 Risk #1)
- Prompt template from parent PRD §8, style fragments from plan 02 §5.
- Afternoon quality pass: all 8 styles × 2 test photos; strengthen any fragment that moves walls/windows; record final fragments back into plan 02's table.

### R4 — Proven before integration
- Full curl matrix green BEFORE the 2 PM integration sync: happy path, foreign room → 403, bad style → 400, dead key → `failed`, 21st call → 429, two concurrent requests.

## Out of scope for you today
- Any UI (Devs B & C — you support their integration bugs at 2 PM, not their screens)
- Gallery/delete logic (Day 3)
- Style Shootout — no backend change needed; it's N calls to your existing function

## Definition of Done (Day 2)
- [ ] Deployed; contract frozen and documented; curl matrix green
- [ ] Median generation <30 s on test photos; zero stuck-pending rows across all failure tests
- [ ] 8/8 styles preserve geometry; fragments recorded
- [ ] No AI key in the front-end bundle (grep it); function source committed
