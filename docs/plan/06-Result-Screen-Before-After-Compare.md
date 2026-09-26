# 06 — Result Screen & Before/After Compare

**Owner:** 1 person (frontend — owns the "wow moment")
**Depends on:** 04 (navigates here with `makeoverId`), 05 (polls the row it creates)
**Estimated effort:** 3–4 hours (Day 2)
**Deliverable:** `/result/:makeoverId` — engaging loading state while the AI works, then a before/after slider comparing original vs. concept, with Save to Gallery, Try Another Style, and Retry actions. This screen is the demo centerpiece (PRD §13).

---

## Tools Needed

| Tool | Purpose |
|------|---------|
| Bolt | Build the screen via prompts |
| Supabase JS client | Poll `makeovers` row; create signed URLs for private images (`storage.from().createSignedUrl(path, 3600)`) |
| Before/after slider | `react-compare-slider` (npm) — or a custom two-`<img>` clip-path slider if the dependency misbehaves in Bolt |
| Shared toast/spinner components from plan 03 | Consistent UX |

## Tasks

### 1. Polling & loading state
- On mount, fetch the `makeovers` row (join `rooms` for the original image path).
- If `status = 'pending'`: poll every 2.5 s (or use Supabase Realtime subscription on the row — nicer, use it if Bolt wires it easily).
- Loading UX (expect 10–30 s, per plan 01's latency test): show the ORIGINAL photo with a shimmer/scan animation over it + rotating status lines ("Analyzing your room…", "Applying Japandi style…", "Rendering your makeover…"). Never a blank spinner for 30 s.
- Client-side stop: if still pending after 90 s, treat as failed (plan 05 guarantees the row itself resolves by ~60 s).

### 2. Before/after comparison (the wow moment)
- When `status = 'complete'`: fetch signed URLs for both images and render the slider — original on the left, concept on the right, draggable divider, style label badge (e.g., "Japandi").
- Both private buckets require **signed URLs** — plain public URLs will 403 (plan 02 made buckets private).
- Add a toggle fallback button ("Before / After") for accessibility and finicky mobile drags.
- Preload both images before revealing the slider to avoid pop-in.

### 3. Actions
- **Save to Gallery:** for MVP, every complete makeover is already a row — "Save" confirms/keeps it (show success toast, navigate to `/gallery`). If the team prefers explicit saving, add `saved boolean default false` to `makeovers` (coordinate with plan 02!) and set it true here; gallery then filters `saved = true`. **Decide once, before building — recommendation: skip the flag, all completes are saved; simplest for 3 days.**
- **Try Another Style:** navigates to `/new-makeover` pre-loaded with the same `room_id` and photo preview, skipping re-upload (coordinate with plan 04 — pass `room_id` as a query param). Sets up plan 08's shootout.
- **Retry (on failed):** re-calls the Edge Function with the same `room_id` + style; navigate to the new `makeoverId`.
- **Failed state UX:** friendly message ("That one didn't work — let's try again"), Retry button, photo + style context preserved (PRD §6 edge flows). Special message for the 429 `daily_limit` error from plan 05.

## Test Checklist
- [ ] Pending → complete transition swaps loading animation for slider without refresh
- [ ] Slider drags smoothly on desktop mouse AND phone touch; toggle fallback works
- [ ] Failed generation shows retry UX; retry produces a new working concept
- [ ] Direct URL to someone else's `makeoverId` → no data (RLS proves out) — show "not found"
- [ ] Signed URLs render on a fresh session (not relying on cached public access)
- [ ] Daily-limit (429) shows the friendly cap message

## Acceptance Criteria
- [ ] Upload→style→generate→slider→save runs end-to-end twice in a row (stability bar from playbook Step 11)
- [ ] Loading state is engaging — no blank spinner longer than 2 s
- [ ] All three actions (Save / Try Another Style / Retry) work
- [ ] Committed to GitHub by Code Owner
