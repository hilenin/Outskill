# Execution Prompts — Day 2 / Dev C: Result Screen & Before/After Compare

**Executes:** `PRD-Day2-DevC-Result-and-Compare.md` (plan 06)
**Guidelines applied:** Bolt rules — one feature per prompt · build mock-first so you're never blocked · signed URLs everywhere (enforced by `.bolt/prompt`) · screenshot + exact-error fix protocol · rollback over retry loops.
**How to use:** P1 in Discussion mode. P2–P3 build against a SEEDED makeovers row (ask Dev B or insert one in SQL Editor) — don't wait for integration. P4–P5 wire the real flow at the 2 PM sync.

---

## P1 — Plan (Discussion mode)

```
Next I'm building /result/:makeoverId. It must: load the makeovers row
joined with its rooms row, poll every 2.5s while status is 'pending',
show an engaging loading treatment over the ORIGINAL photo (no blank
spinner), then on 'complete' show a draggable before/after slider of
original vs generated image using signed URLs (buckets are private),
with Save to Gallery, Try Another Style, and Retry-on-failed actions.
Outline the component structure, the polling approach with cleanup on
unmount, and how you'll preload both images before revealing the
slider. Do not write code yet.
```

✅ Verify: plan includes poll cleanup + image preloading (the two classic bugs here).

## P2 — Loading experience (Build mode — one feature, mock data)

```
Build /result/:makeoverId loading state first, tested against a
makeovers row whose status is 'pending':
- Fetch the makeover row + its room's original_image_url; get a signed
  URL for the original.
- While status='pending': poll the row every 2.5 seconds (clear the
  interval on unmount and on status change).
- Loading treatment: show the original photo dimmed with a slow
  shimmer/scan animation sweeping over it, the selected style name as
  a badge, and status lines rotating every 4 seconds: "Analyzing your
  room…", "Applying {style} style…", "Choosing furniture and
  materials…", "Rendering your makeover…". Never a blank spinner.
- If still pending after 90 seconds of polling, stop and treat it as
  failed (failed UI comes in a later prompt — a simple message is fine
  for now).
```

✅ Verify (seeded pending row): animation runs; flip the row to `complete` in Table Editor → polling notices within ~2.5 s.

## P3 — The slider (one feature — the wow moment)

```
Add the complete state to /result/:makeoverId:
- Install and use react-compare-slider. Create a shared CompareSlider
  component (it will be reused on /concept/:makeoverId later): left =
  original photo, right = generated concept, draggable divider with a
  round handle, style-name badge overlaid top-left.
- Both images come from createSignedUrl (private buckets). PRELOAD
  both images and only swap the loading treatment for the slider once
  both are loaded — no pop-in.
- Below the slider add a "Before / After" toggle button as an
  accessible fallback that snaps the divider to 0% / 100%.
- If custom_notes exist on the makeover, show them as a small caption
  under the slider.
```

✅ Verify (seeded complete row): drag is smooth on desktop AND real-phone touch; toggle snaps; no flash of missing image.

## P4 — Actions (one feature)

```
Add the action bar to /result/:makeoverId:
- "Save to Gallery" (PrimaryButton): every complete makeover is
  already persisted, so this shows a success Toast "Saved to your
  gallery" and navigates to /gallery.
- "Try Another Style" (SecondaryButton): navigate to
  /new-makeover?room_id={room_id}.
- Failed state (status='failed' or the 90s client stop): friendly
  message "That one didn't work — let's try again", show the original
  photo and style, and a Retry button that re-invokes the
  generate-makeover Edge Function with the same room_id and style,
  then navigates to the new /result/{makeover_id}.
- If the retry invocation returns 429 daily_limit, show "You've hit
  today's makeover limit — try again tomorrow" instead of the retry
  button.
- Unknown makeoverId or a row that isn't mine (query returns nothing
  under RLS): show a "Concept not found" state with a link to
  /gallery.
```

✅ Verify: set a row to `failed` → retry produces a new pending → complete cycle; foreign UUID in the URL → not-found state.

## P5 — Live integration (2 PM sync, with Devs A & B)

No new prompt — run the real flow: B's Generate → A's function → your screen. Then decide the `saved`-flag question as a team (recommendation: no flag). Log any seam bugs and fix with:

```
When arriving at /result/{id} from the Generate flow, <exact symptom>.
The console shows: <paste exact error>. Fix only this issue without
changing the polling or slider behavior.
```

## Fix protocol
Slider feel wrong → screenshot/screen-record into Bolt with one specific ask. Two failed fixes → rollback, smaller prompt. Keep `CompareSlider` a clean shared component — Day 3's gallery reuses it.
