# 07 — Gallery & Concept Detail

**Owner:** 1 person (frontend)
**Depends on:** 02 (data), 03 (shell/routes). Can be built with seeded DB rows before 06 is finished; full integration test needs 06.
**Estimated effort:** 3 hours (Day 2 evening → Day 3)
**Deliverable:** `/gallery` grid of saved makeovers + `/concept/:makeoverId` detail view with compare and delete. Completes CRUD for the makeovers entity (playbook Step 9).

---

## Tools Needed

| Tool | Purpose |
|------|---------|
| Bolt | Build screens via prompts |
| Supabase JS client | Query `makeovers` (+ join `rooms`), signed URLs for thumbnails, delete rows + storage objects |
| Shared components from plan 03 | Toast (delete confirmation), spinner |
| Seed data | Insert 3–4 fake `makeovers` rows + images via SQL Editor/Storage upload so this screen can be built before plan 06 ships |

## Tasks

### 1. Gallery grid (`/gallery`)
- Query: caller's `makeovers` where `status = 'complete'`, newest first (index from plan 02 supports this), joined with `rooms` for the original image path.
- Card: concept thumbnail (signed URL), style name badge, created date, tap → `/concept/:id`.
- Group visually by room if multiple concepts share a `room_id` (a small "3 styles" chip) — cheap now, sets up plan 08's shootout view.
- **Empty state:** illustration/emoji + "Create your first makeover" button → `/new-makeover` (PRD §6 edge flows — do not skip this; first-run demo impression).
- Thumbnail performance: request signed URLs in one batch (`createSignedUrls([paths], 3600)`), lazy-load images.

### 2. Concept Detail (`/concept/:makeoverId`)
- Reuse plan 06's before/after slider component (same signed-URL pattern) — do NOT rebuild it; extract it to a shared component if plan 06 hasn't already.
- Show: style badge, custom notes (if any), created date.
- Actions:
  - **Delete** — confirmation dialog → delete the `makeovers` row AND the storage object `makeovers/{user_id}/{id}.png`; if it was the room's last makeover, also delete the `rooms` row + original photo (matches PRD data model cascade intent). Toast + navigate back to gallery.
  - **Try Another Style** — same query-param hand-off to `/new-makeover?room_id=...` as plan 06 §3.

### 3. CRUD completion check (playbook Step 9.2)
After this package, verify the full matrix:
- makeovers: Create (05) / Read-list (07) / Update-status (05, function only) / Delete (07) ✅
- rooms: Create (04) / Read (06, 07) / Delete (07, cascade) ✅

## Test Checklist
- [ ] Gallery shows only the signed-in user's concepts, newest first
- [ ] Two users' galleries are fully isolated (RLS re-verified at the UI level)
- [ ] Empty state renders for a brand-new user with working CTA
- [ ] Delete removes row + storage file (verify in dashboard); gallery updates without refresh
- [ ] Deleting the last concept for a room also removes the room + original photo
- [ ] 10+ concepts: grid scrolls smoothly, thumbnails lazy-load, mobile layout wraps to 2 columns

## Acceptance Criteria
- [ ] Flow 2 from PRD §6 works: Gallery → open concept → compare → delete
- [ ] Empty → first save → gallery card appears (integration with plan 06 verified)
- [ ] No dead buttons or dead-end screens on either view
- [ ] Committed to GitHub by Code Owner
