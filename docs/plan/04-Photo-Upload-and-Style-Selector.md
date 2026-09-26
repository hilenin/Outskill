# 04 — Photo Upload & Style Selector (New Makeover screen)

**Owner:** 1 person (frontend)
**Depends on:** 02 (buckets/RLS + style list), 03 (auth shell, routes)
**Estimated effort:** 3–4 hours (Day 2)
**Deliverable:** `/new-makeover` screen: user uploads a room photo (validated + downscaled), previews it, picks a style card, optionally adds notes, and hits Generate — which creates the `rooms` row, uploads the file, and hands off to plan 06's flow.

---

## Tools Needed

| Tool | Purpose |
|------|---------|
| Bolt | Build the screen via prompts |
| Supabase Storage JS client | Upload to `room-photos/{user_id}/{room_id}.jpg` |
| Browser Canvas API | Client-side image downscale to ≤1024 px longest edge (cost + speed guardrail, PRD §9) |
| Style constants from plan 02 §5 | The 8 style cards (slug, name, prompt fragment) |
| Free stock room photos (unsplash.com / pexels.com) | Style card thumbnails + test uploads |

## Tasks

### 1. Upload component
- Accept JPG/PNG via file picker AND drag-drop; on mobile, `<input accept="image/*" capture="environment">` opens the camera.
- Client-side validation BEFORE upload: type is jpg/png, size ≤ 10 MB. Inline error otherwise (never a silent failure).
- Downscale with Canvas: if longest edge > 1024 px, resize proportionally, export JPEG quality ~0.85. This is the file that gets uploaded.
- Show a preview of the (downscaled) photo with a "Change photo" option.
- Upload tips helper text: "Use a well-lit, wide-angle photo for best results."

Suggested Bolt prompt:
> "On /new-makeover, add a photo upload zone: drag-drop or tap to choose, mobile camera capture, accepts JPG/PNG up to 10 MB with inline validation errors. Downscale images client-side to max 1024 px longest edge using canvas before upload. Show a preview with a change-photo button and a tip: 'Use a well-lit, wide-angle photo for best results.'"

### 2. Style selector
- Grid of 8 style cards from the constants list (plan 02 §5): thumbnail image, style name, one-line description.
- Single-select with a clear selected state (border/checkmark).
- Optional free-text "Style notes" field below (placeholder: "e.g., keep the sofa, add plants, warm lighting") — max ~200 chars. This is Should-have S2 but the input field is trivial to include now; plan 05 already accepts it.

### 3. Generate action (the hand-off)
On "Generate Makeover" click (button disabled until photo + style are both set):
1. `roomId = crypto.randomUUID()`
2. Upload downscaled file to `room-photos/{user.id}/{roomId}.jpg`
3. Insert `rooms` row: `{ id: roomId, user_id, original_image_url: <storage path> }`
4. Call the `generate-makeover` Edge Function (contract in plan 05 §3) with `{ room_id, style, custom_notes }`
5. Navigate to `/result/:makeoverId` using the `makeover_id` the function returns — plan 06 takes over from here.
6. Any failure at steps 2–4: show error toast, keep photo + style selected, allow retry (PRD error flows §6).

> Coordinate with plan 06's owner: they consume the `makeoverId` route param and expect the pending row to already exist.

## Test Checklist
- [ ] 15 MB photo → inline error, no upload attempt
- [ ] .heic / .gif file → inline error naming accepted formats
- [ ] 4000 px photo → uploaded file is ≤1024 px longest edge (check in Storage)
- [ ] Generate disabled until BOTH photo and style chosen; helper text explains why
- [ ] Phone camera capture works on a real phone (test via Bolt preview URL)
- [ ] Upload failure (kill network in devtools) → toast + state preserved

## Acceptance Criteria
- [ ] Full path works: choose photo → preview → pick style → Generate → lands on /result with a pending makeover
- [ ] `rooms` row + storage object appear with the correct path convention
- [ ] Works at 375 px wide; style card grid wraps cleanly
- [ ] Committed to GitHub by Code Owner
