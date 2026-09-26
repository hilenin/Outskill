# Execution Prompts — Day 3 / Dev B: Personal Gallery & Concept Management

**Executes:** `PRD-Day3-DevB-Personal-Gallery.md` (plan 07)
**Guidelines applied:** Bolt rules — one feature per prompt · reuse shared components (CompareSlider, Toast — enforced by `.bolt/prompt`) · batch signed URLs for performance · exact-error fix protocol.
**How to use:** P1→P4 in Build mode against your seeded data + real Day 2 concepts. Everything committed before the 1 PM freeze.

---

## P1 — Gallery grid (one feature)

```
Build the /gallery page:
- Query the current user's makeovers where status='complete', newest
  first, joined with their rooms rows.
- Request signed URLs for all thumbnails in ONE batch call
  (createSignedUrls) rather than one per card; lazy-load the images.
- Card: generated-concept thumbnail, style name badge, created date
  (e.g., "Sep 26"). Tap → /concept/{makeover_id}.
- Grid: 2 columns at mobile widths, 3-4 on desktop.
- When several cards share the same room_id, show a small "{n} styles"
  chip on those cards (it will deep-link to the shootout view Dev C is
  building — for now link to /concept of the newest one).
- Empty state when there are no completed makeovers: a friendly
  illustration or large emoji, "No makeovers yet", and a PrimaryButton
  "Create your first makeover" linking to /new-makeover.
```

✅ Verify: seeded + real concepts render newest-first; brand-new account sees the empty state; one network call for all signed URLs.

## P2 — Concept Detail (one feature)

```
Build the /concept/:makeoverId page:
- Load the makeover + its room; reuse the existing shared
  CompareSlider component exactly as /result uses it (original vs
  concept, signed URLs, Before/After toggle). Do NOT create a new
  slider.
- Show: style badge, custom_notes as a caption if present, created
  date.
- Actions: "Try Another Style" (SecondaryButton) →
  /new-makeover?room_id={room_id}; "Delete" (danger-styled button) —
  wired in the next prompt, disabled for now.
- Unknown id or a row not owned by me → "Concept not found" state with
  a link back to /gallery.
```

✅ Verify: slider identical to /result; notes caption renders only when notes exist.

## P3 — Delete with cleanup (one feature — the careful one)

```
Wire Delete on /concept/:makeoverId:
- Confirmation dialog: "Delete this Japandi concept? This can't be
  undone." with Cancel / Delete.
- On confirm, in order: (1) remove the storage object
  makeovers/{user_id}/{makeover_id}.png; (2) delete the makeovers row;
  (3) if that was the LAST makeover for its room_id, also remove
  room-photos/{user_id}/{room_id}.jpg and delete the rooms row;
  (4) success Toast "Concept deleted" and navigate to /gallery, which
  must reflect the deletion without a manual refresh.
- Any step failing: error Toast, nothing half-deleted from the UI's
  perspective (refetch state).
```

✅ Verify in the Supabase dashboard: PNG gone from Storage; last-of-room delete also removes the original photo + rooms row; gallery updates live.

## P4 — Polish pass (one feature)

```
Polish /gallery and /concept for the demo: skeleton placeholders while
thumbnails load, smooth scrolling with 10+ cards, consistent card
hover/press states, and make sure the "{n} styles" chip and date don't
overlap the style badge at 375px width. Change nothing functional.
```

✅ Verify: 10+ concepts scroll smoothly on the phone; nothing overlaps at 375 px.

## P5 — CRUD matrix closure (standup report, no prompt)

Confirm and report: makeovers C(05)/R(07)/U(05 function-only)/D(07) ✅ · rooms C(04)/R(06,07)/D(07 cascade) ✅ · profiles C(auto)/R ✅. Any unchecked box → targeted prompt using the fix template from Dev A's file.

## Fix protocol
Dev A files bugs against your screens with exact repro prompts — run them as-is, one at a time, and report back on the log. Two failed fixes → rollback and re-prompt smaller. Freeze at 1 PM.
