# Mini-PRD — Day 1 / Dev B: Data Layer (Schema, Storage & Privacy)

**Developer:** Dev B (data / backend)
**Parent PRD:** `docs/PRD-AI-Interior-Makeover.md` — this PRD concentrates on:
- **§7 Data Model** — all tables (`profiles`, `rooms`, `makeovers`), storage buckets, and the security note (RLS)
- **§9 Non-Functional Requirements** — "Privacy: photos are private to the user"
- **§5.1 M6 (partially)** — the gallery's persistence layer (what makes "save" saveable)

**Implementation plan:** `../02-Database-Schema-Storage-RLS.md` (all of it — the SQL is written there, ready to run)
**Work schedule:** `Day1-Work-Split.md` (Dev B column)

---

## Goal (your slice of the product)

By end of Day 1, every piece of data the product touches — users, room photos, generated concepts — has a home with the right shape and the right lock on the door. You own the **data contract** that all three developers build against for the rest of the hackathon.

## Why this matters to the product

Two parent-PRD promises live or die in your package:
1. **"Save to a personal gallery"** (§3 goal) — the gallery is only as reliable as the `makeovers` table and its indexes.
2. **"Photos are private to the user"** (§9) — users upload photos of the inside of their homes. RLS and per-user storage folders are the entire privacy story. A leak here isn't a bug, it's a broken product.

## Requirements (your acceptance scope)

### R1 — Tables match parent PRD §7 exactly
- `profiles`, `rooms`, `makeovers` with the fields, types, and status check constraint as specified; indexes for the gallery query (user_id + created_at desc).
- Signup trigger auto-creates a `profiles` row (supports Flow 1 step 1, §6).

### R2 — Privacy enforced (parent PRD §9)
- RLS on all three tables: users see/insert/delete only their own rows; no user UPDATE on `makeovers` (the Edge Function owns status changes via service_role).
- Private buckets `room-photos` and `makeovers` with per-user folder policies.
- Verified with **two real test users** — not assumed.

### R3 — The contracts you publish (consumed by A and C)
- Storage path convention: `room-photos/{user_id}/{room_id}.jpg`, `makeovers/{user_id}/{makeover_id}.png` — Devs A and C hardcode these; changes after today are breaking changes.
- The 8-style constants table (slug / name / prompt fragment) from plan 02 §5 — Dev C renders it (style cards), Dev A injects it (prompts).

### R4 — Supporting assets (while waiting for Dev A's hand-off)
- 3–4 well-lit, wide-angle test room photos + 8 style thumbnails (Unsplash/Pexels) — feeds Day 2's plan 04 and Day 3's demo.

## Out of scope for you today
- The Edge Function that writes to your tables (Dev A)
- Any screens (Dev C)
- Gallery UI that reads your tables (your Day 3 PRD)

## Definition of Done (Day 1)
- [ ] All SQL applied; tables visible and correct in Table Editor
- [ ] Two-user RLS test passed for rows AND storage folders
- [ ] Style constants + path conventions published to team notes
- [ ] SQL committed to repo (`supabase/migrations/`); walked Dev A through the schema at the 2 PM sync
