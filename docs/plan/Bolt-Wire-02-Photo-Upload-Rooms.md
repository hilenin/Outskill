# Bolt Wiring Prompt 02 — Real Photo Upload → `room-photos` bucket + `rooms` table

**Use after:** Wiring Prompt 01 (real auth working) — upload needs `user.id` and RLS needs a session.
**Goal:** replace the mock upload on /new-makeover with a real upload to Supabase Storage and a real `rooms` row, without changing the visual design.
**Schema contract:** plan `02-Database-Schema-Storage-RLS.md` — table is **`rooms`** (`id, user_id, original_image_url, room_type, created_at`), bucket is **`room-photos`** (private), path **`{user_id}/{room_id}.jpg`**. These exact names matter: the RLS and storage policies only allow writes to your own folder, and the Edge Function later reads from this same path.

---

## Before prompting (checks, not prompts)

1. In Supabase dashboard → Storage: bucket `room-photos` exists and is **Private**.
2. Storage policies from plan 02 §4 are applied (own-folder read/insert/delete).
3. You are signed in to the app as a real user (Wiring 01 verified).

## The prompt (paste into Bolt, Build mode)

```
Replace the mock photo upload on /new-makeover with real Supabase
Storage and database writes. Do not change any visual design — the
upload zone, preview, tips, and step layout stay exactly as they are.

1. Keep the existing client-side validation (JPG/PNG only, max 10 MB,
   inline errors) and the canvas downscale (longest edge max 1024px,
   export JPEG quality 0.85). The downscaled file is what gets
   uploaded.

2. When the user selects a valid photo, show the local preview
   immediately as today (object URL) — do NOT upload yet. Upload
   happens when Generate is clicked, so changing the photo never
   leaves orphan files.

3. On "Generate Makeover" click, using the shared Supabase client from
   src/lib/supabase.ts and the signed-in user:
   a. const roomId = crypto.randomUUID()
   b. Upload the downscaled file to the "room-photos" bucket at path
      `${user.id}/${roomId}.jpg` with contentType "image/jpeg".
   c. Insert into the "rooms" table: { id: roomId, user_id: user.id,
      original_image_url: `${user.id}/${roomId}.jpg` }. Store the
      relative storage path exactly as shown — not a signed or public
      URL.
   d. For now, keep the existing mock generation/navigation behavior
      after these two steps succeed (the real generate-makeover Edge
      Function is wired in a later change). Pass the real roomId along
      to it.

4. Failure handling: if the upload or the insert fails, show the error
   Toast with a human message ("Couldn't save your photo — please try
   again"), keep the photo preview and selected style exactly as they
   were, and re-enable the Generate button. If the upload succeeded
   but the insert failed, remove the just-uploaded storage object
   before showing the error so no orphan files are left.

5. Anywhere the app needs to DISPLAY an uploaded room photo from
   storage, use supabase.storage.from('room-photos')
   .createSignedUrl(path, 3600) — never a public URL, the bucket is
   private.

6. Also support the room_id query parameter on /new-makeover: when
   present, fetch that rooms row (it belongs to the current user),
   display its photo via a signed URL with a "Using your earlier
   photo" note and an "Upload a different photo" link that reverts to
   normal upload mode. On Generate in this mode, skip the upload and
   insert — reuse the existing room id.
```

## Verify

- [ ] Pick a 4000px photo → preview instant; click Generate → file appears in Storage under `room-photos/<your-user-id>/<uuid>.jpg` and its stored size is ≤1024px on the longest edge
- [ ] A matching row appears in the `rooms` table with `original_image_url` = the relative path
- [ ] `rooms.user_id` equals your auth user id (RLS would reject otherwise)
- [ ] Kill network in devtools → Generate → error Toast, photo + style still selected, no orphan file left in Storage
- [ ] Second test user cannot see the first user's rooms rows or storage files
- [ ] `/new-makeover?room_id=<real-id>` shows the earlier photo via signed URL; Generate skips re-upload

## Next step after this works
Wire the real `generate-makeover` Edge Function call — that prompt already exists: `day2/Prompts-Day2-DevB-Upload-and-Style-Selection.md` **P4** (and P5 is then already half-done via step 6 above).

## If something breaks
- "new row violates row-level security policy" → you're inserting a `user_id` that isn't the signed-in user, or the session expired — check both before re-prompting.
- 400 on upload → usually the bucket name or path (`room-photos`, `{user_id}/{room_id}.jpg`) — verify against the contract above.
- Paste exact errors into Bolt, one fix per prompt, roll back after two failed attempts.
