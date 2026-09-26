# Mini-PRD — Day 3 / Dev B: Personal Gallery & Concept Management

**Developer:** Dev B (frontend support)
**Parent PRD:** `docs/PRD-AI-Interior-Makeover.md` — this PRD concentrates on:
- **§5.1 M6** — Personal gallery: save, list with style label + date, reopen into comparison, delete
- **§6 Flow 2** — Revisit & compare: Gallery → open card → comparison view → delete or new generation
- **§6 Error flows** — empty gallery → "Create your first makeover" CTA
- **§7 Data Model** — you built these tables on Day 1; today you put the UI on top of them

**Implementation plan:** `../07-Gallery-and-Concept-Detail.md` (all of it; you started §1 as Day 2's stretch)
**Work schedule:** `Day3-Work-Split.md` (Dev B column)

---

## Goal (your slice of the product)

By end of Day 3 morning, users can come back: every saved concept is findable, reopenable into the before/after view, and deletable — completing the makeovers CRUD matrix (playbook Step 9).

## Why this matters to the product

M6 is what separates this product from a one-shot AI toy — the parent PRD's goal (§3) is a gallery users "revisit and compare." It's also the retention hook flagged as a ⭐ differentiator in the playbook's competitor scan (weak or absent in RoomGPT and friends). And your empty state is literally the first screen every fresh demo account shows a judge.

## Requirements (your acceptance scope)

### R1 — Gallery grid (M6, Flow 2 step 1)
- Signed-in user's completed makeovers, newest first (your Day 1 index makes this cheap); card = concept thumbnail (signed URL), style badge, date.
- Batch signed URLs (`createSignedUrls`), lazy-load thumbnails; 2-column wrap at 375 px.
- "N styles" chip on rooms with multiple concepts → deep-links to Dev C's Shootout view (coordinate the route).

### R2 — Empty state (§6 error flows)
- Friendly illustration + "Create your first makeover" → `/new-makeover`. Not optional — it's the demo's first impression on a fresh account.

### R3 — Concept Detail (Flow 2 steps 2–3)
- Reuse Dev C's slider as a shared component — do NOT rebuild it. Style badge, notes, date shown.
- "Try Another Style" → `/new-makeover?room_id=...` (the param you built Day 2).

### R4 — Delete, done properly (M6)
- Confirmation dialog → delete `makeovers` row AND `makeovers/{user_id}/{id}.png` storage object.
- Last concept of a room → cascade the `rooms` row + original photo (your Day 1 FK cascades do the rows; you clean the storage files).
- Toast + gallery updates without refresh.

### R5 — CRUD matrix closed (playbook Step 9.2)
- makeovers: Create(05)/Read(07)/Update(05, function-only)/Delete(07) ✅; rooms: Create(04)/Read(06,07)/Delete(07) ✅ — report the closed matrix at standup.

## Out of scope for you today
- Shootout grid UI (Dev C — you only provide the chip link)
- Testing/demo assets (Dev A — but fix what they file against your screens, fast)

## Definition of Done (Day 3)
- [ ] Flow 2 works: gallery → open → compare → delete; empty → first save → card appears
- [ ] Delete verified removing storage files (checked in dashboard), cascade included
- [ ] Two-user isolation re-verified at UI level; 10+ concepts scroll smoothly
- [ ] Committed before the 1 PM feature freeze
