# Execution Prompts — Day 2 / Dev B: Photo Upload & Style Selection

**Executes:** `PRD-Day2-DevB-Upload-and-Style-Selection.md` (plan 04)
**Guidelines applied:** Bolt rules — one feature per prompt · exact names (`.bolt/prompt` from Day 1 already enforces stack/paths/design) · Discussion-mode plan first · screenshot visual issues · rollback after two failed fixes.
**How to use:** P1 in Discussion mode, then P2→P5 in Build mode, verifying in preview (including a real phone via the preview URL) after each.

---

## P1 — Plan (Discussion mode)

```
I'm building the /new-makeover screen next: photo upload with
client-side downscale, a grid of 8 style cards, an optional notes
field, and a Generate button that uploads to Supabase Storage, inserts
a rooms row, calls the generate-makeover Edge Function, and navigates
to /result/:makeoverId. List the components and the exact upload/insert/
invoke sequence you'll implement, including how you'll handle failures
at each step. Do not write code yet.
```

✅ Verify: sequence matches the contract (upload → rooms insert → function → navigate); failures keep state.

## P2 — Upload zone (Build mode — one feature)

```
On /new-makeover build the photo upload feature only:
- UploadZone component: drag-and-drop area plus tap-to-choose; on
  mobile use input accept="image/*" capture="environment" so the
  camera opens.
- Validate BEFORE any upload: only JPG/PNG, max 10 MB. Show inline
  errors naming the accepted formats ("Please use a JPG or PNG under
  10 MB") — never fail silently.
- Downscale client-side with a canvas: if the longest edge exceeds
  1024px, resize proportionally and export as JPEG quality 0.85. All
  later steps use this downscaled file.
- Show a preview of the selected photo with a "Change photo" button,
  and the tip text: "Use a well-lit, wide-angle photo for best
  results."
No style cards or Generate wiring yet.
```

✅ Verify: 15 MB file → inline error; .gif → inline error; 4000 px photo previews and its processed size is ≤1024 px; phone camera opens on a real phone.

## P3 — Style cards + notes (one feature)

```
Below the photo preview add the style selection feature:
- StyleGrid: 8 single-select cards, 2 columns on mobile, 4 on desktop.
  Each card: thumbnail image, style name, one-line description, and a
  clear selected state (accent border + check).
- Cards, in this order with these exact slugs: scandinavian
  "Scandinavian — light woods & cozy minimalism", modern-minimalist
  "Modern Minimalist — clean lines, clutter-free", industrial
  "Industrial — brick, metal, raw textures", bohemian "Bohemian —
  plants, layers, earthy warmth", japandi "Japandi — zen fusion of
  Japan & Scandinavia", mid-century-modern "Mid-Century Modern — teak
  & retro curves", coastal "Coastal — airy beach-house blues", rustic
  "Rustic — reclaimed wood & farmhouse charm".
- Thumbnails from /public/styles/{slug}.jpg (I will add the image
  files myself).
- Under the grid: optional "Style notes" text input, max 200 chars
  with live counter, placeholder "e.g., keep the sofa, add plants,
  warm lighting".
```

Then drop Dev B's Day 1 thumbnails into `/public/styles/`. ✅ Verify: exactly one card selectable; slugs match plan 02 §5.

## P4 — Generate hand-off (one feature — the critical wiring)

```
Wire the Generate Makeover button on /new-makeover:
- Disabled with helper text "Add a photo and pick a style to continue"
  until BOTH a processed photo and a style are selected.
- On click, in order: (1) roomId = crypto.randomUUID(); (2) upload the
  processed file to the room-photos bucket at
  {user.id}/{roomId}.jpg; (3) insert a rooms row { id: roomId,
  user_id, original_image_url: that path }; (4) invoke the
  generate-makeover Edge Function with { room_id: roomId, style:
  selected slug, custom_notes: notes or null }; (5) navigate to
  /result/{makeover_id} from the function response.
- Show a loading state on the button through steps 2-5.
- If ANY step fails: error Toast with a human message, keep the photo
  preview and style selection exactly as they were, button returns to
  enabled so the user can retry. If the function returns 429
  daily_limit, show "You've hit today's makeover limit — try again
  tomorrow."
```

✅ Verify: happy path lands on /result with a pending makeover; kill network in devtools mid-flow → toast + state preserved; storage object and rooms row match the path convention.

## P5 — Re-style entry point (one feature — feeds Try Another Style + Day 3 shootout)

```
Support the query param room_id on /new-makeover: when present, load
that rooms row (it belongs to the current user), show its existing
photo as the preview with a "Using your earlier photo" note instead of
the upload zone (keep a "Upload a different photo" link that reverts
to normal mode), and on Generate SKIP the upload and rooms insert —
only call the Edge Function with the existing room_id.
```

✅ Verify: `/new-makeover?room_id=<real id>` shows the photo instantly; generation produces a second concept for the same room.

## Evening stretch — gallery seed head start
Insert 3–4 completed makeovers via SQL Editor (reuse one generated PNG path) so Day 3's gallery work starts against real-looking data.

## Fix protocol
Visual issue → screenshot into Bolt + one specific ask. Error → exact message, "fix only this". Two failed fixes → rollback, smaller prompt.
