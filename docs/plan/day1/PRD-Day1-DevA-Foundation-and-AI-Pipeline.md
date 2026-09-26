# Mini-PRD — Day 1 / Dev A: Foundation & AI Pipeline Setup

**Developer:** Dev A (backend lead)
**Parent PRD:** `docs/PRD-AI-Interior-Makeover.md` — this PRD concentrates on:
- **§1 Overview** — the stack decision (Bolt + Supabase + AI image-editing API)
- **§8 Architecture** — the overall system shape and the "AI call runs server-side" design decision
- **§9 Non-Functional Requirements** — cost control, privacy (keys never in the browser)
- **§11 Risks** — Risk #1 (AI changes room geometry) and Risk #3 (API cost overrun)

**Implementation plans:** `../01-Project-Setup-Supabase-Foundation.md` (all of it) + `../05-Edge-Function-AI-Generation.md` (scaffold only — finished Day 2)
**Work schedule:** `Day1-Work-Split.md` (Dev A column)

---

## Goal (your slice of the product)

By end of Day 1, the project has a working foundation that unblocks both teammates, and the single biggest product risk — *"can the AI actually restyle a real room photo without moving the walls?"* — is answered with evidence, not hope.

## Why this matters to the product

The parent PRD's core promise (§2) is that the concept shows *the user's own room*, restyled. If the AI model invents a different room, the product has no reason to exist. That's why your first task is validation, not setup.

## Requirements (your acceptance scope)

### R1 — AI validation (parent PRD §11, Risk #1) — DO THIS FIRST
- Test Gemini 2.5 Flash Image with ≥2 real room photos and the geometry-preservation prompt (parent PRD §8).
- Pass bar: walls, windows, doors, and camera angle unchanged; furniture/decor restyled; photorealistic.
- Record: chosen model, observed latency (Dev C needs it for loading UX), sample outputs saved for the deck.

### R2 — Infrastructure live (parent PRD §1, §8)
- Supabase project created; URL + anon key shared with team; service_role key and DB password secured.
- Bolt project bootstrapped from the playbook Step 7.3 starting prompt, Supabase integration connected.
- GitHub private repo with Code Owner assigned.

### R3 — Secret hygiene (parent PRD §9 Privacy)
- Gemini key stored ONLY via `supabase secrets set GEMINI_API_KEY=...`. It must never appear in Bolt, front-end code, or GitHub. This is a hard product requirement, not a nicety.

### R4 — Edge Function scaffold (parent PRD §8) — afternoon
- `generate-makeover` function created; JWT verification and input validation working.
- Stretch: one successful curl generation against Dev B's schema (full function is Day 2 scope).

## Out of scope for you today
- Database schema/RLS (Dev B — `PRD-Day1-DevB-Data-Layer.md`)
- Any UI (Dev C — `PRD-Day1-DevC-Auth-and-Shell.md`)
- Rate limiting, timeouts, prompt tuning (your Day 2 PRD)

## Definition of Done (Day 1)
- [ ] Gemini validated with evidence; go/no-go on provider announced at the 11 AM sync
- [ ] Supabase + Bolt + GitHub live; teammates unblocked by ~11 AM
- [ ] Key in secrets; grep of scaffold confirms no key in front end
- [ ] Edge Function scaffold committed
