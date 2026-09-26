# 05 — Edge Function: AI Makeover Generation

**Owner:** 1 person (backend — strongest coder on the team; this is the highest-risk package)
**Depends on:** 02 (schema + buckets). Can be built in parallel with 03/04 and tested standalone with `curl`.
**Estimated effort:** 4–6 hours (start Day 1 afternoon if possible, finish Day 2)
**Deliverable:** Deployed `generate-makeover` Supabase Edge Function: takes a room + style, calls the AI image-editing API, stores the restyled image, and updates the `makeovers` row status. The AI API key never leaves the server.

---

## Tools Needed

| Tool | Purpose |
|------|---------|
| Supabase CLI | `supabase functions new generate-makeover`, `supabase functions deploy`, `supabase secrets set` |
| Deno (bundled with Supabase Edge runtime) | Edge Function runtime (TypeScript) |
| AI image-editing API — decided in plan 01 §2 | Primary: Gemini 2.5 Flash Image (`gemini-2.5-flash-image`) via `generativelanguage.googleapis.com` REST. Fallback: OpenAI Images Edit (`gpt-image-1`, `/v1/images/edits`) |
| `@supabase/supabase-js` (service_role client) | Read original from Storage, write result, update row — bypasses RLS |
| curl / Postman / Hoppscotch | Test the function standalone before UI exists |
| Sample room photos | 3–4 test images (bright living room, dark bedroom, kitchen) |

## Contracts (agreed with plans 04 and 06 — do not change silently)

### 3. Request / Response contract
**Request** (POST, authenticated with the user's Supabase JWT):
```json
{ "room_id": "uuid", "style": "japandi", "custom_notes": "keep the sofa" }
```
**Response — immediate (async pattern):**
```json
{ "makeover_id": "uuid", "status": "pending" }
```
The function returns as soon as the `makeovers` row is created, then continues processing (or processes inline if < 60 s is reliable — decide after latency testing in plan 01). Plan 06 polls the `makeovers` row for `status = complete | failed`.

## Tasks

### 1. Scaffold & auth
```bash
supabase functions new generate-makeover
```
- Verify the caller's JWT (`Authorization: Bearer <user jwt>`); resolve `user_id` from it.
- Create a second client with `SUPABASE_SERVICE_ROLE_KEY` (available as built-in env var) for privileged writes.
- Validate input: `room_id` exists AND belongs to the caller; `style` is one of the 8 known slugs; `custom_notes` ≤ 300 chars (sanitize — it's user text entering a prompt).

### 2. Rate limiting (cost guardrail, PRD §9)
- Count caller's `makeovers` rows where `created_at > now() - interval '1 day'`. If ≥ 20 → return HTTP 429 with `{ "error": "daily_limit" }`. Plan 06 shows a friendly message for this.

### 3. Core generation flow
1. Insert `makeovers` row: `{ room_id, user_id, style, custom_notes, status: 'pending' }` → get `makeover_id`.
2. Download the original from `room-photos/{user_id}/{room_id}.jpg` (service client, `storage.from().download()`); base64-encode.
3. Build the prompt (style fragments from plan 02 §5):
   ```
   Redesign this room in {style_name} style. {style_prompt_fragment}.
   Keep the room's layout, walls, windows, doors, and camera perspective
   exactly the same. Only change furniture, decor, colors, materials,
   and lighting to match the style. Photorealistic result. {custom_notes}
   ```
4. Call the AI API with image + prompt. Gemini REST shape: `POST /v1beta/models/gemini-2.5-flash-image:generateContent` with `contents[0].parts = [{inline_data: {mime_type, data}}, {text: prompt}]`; extract the returned image part.
5. Wrap the AI call with a **55 s timeout** (`AbortController`) and **one automatic retry** on 5xx/timeout.
6. Upload result to `makeovers/{user_id}/{makeover_id}.png` (service client).
7. Update row: `status = 'complete'`, `generated_image_url = <path>`.
8. On any failure after retry: `status = 'failed'` — NEVER leave a row pending forever.

### 4. Deploy & configure
```bash
supabase secrets set GEMINI_API_KEY=<key>     # if not done in plan 01
supabase functions deploy generate-makeover
```

### 5. Standalone testing with curl (before UI exists)
- Sign in a test user via the Supabase JS console or Auth API to get a JWT.
- Manually upload a test photo + insert a `rooms` row (SQL Editor).
- `curl -X POST <functions-url>/generate-makeover -H "Authorization: Bearer <jwt>" -d '{"room_id":"...","style":"japandi"}'`
- Watch the `makeovers` row flip pending → complete and the PNG appear in Storage.

### 6. Prompt tuning per style (quality pass)
Run all 8 styles against 2 test photos. For any style that alters geometry (moved windows/walls — Risk #1 in PRD §11), strengthen its prompt fragment. Record final fragments back into plan 02 §5's table.

## Test Checklist
- [ ] Happy path: pending → complete, image in bucket, correct path convention
- [ ] Wrong user's `room_id` → 403; unknown style → 400; oversize notes → 400
- [ ] Kill the AI key temporarily → row ends `failed`, response/row never stuck pending
- [ ] 21st generation in a day → 429 `daily_limit`
- [ ] Two concurrent requests from the same user both complete
- [ ] All 8 styles produce geometry-preserving results on test photos

## Acceptance Criteria
- [ ] Deployed and callable; contract §3 verified with curl
- [ ] Median generation < 30 s; hard timeout at 55 s with retry then `failed`
- [ ] API keys only in Supabase secrets (grep the front-end bundle to be sure)
- [ ] Function source committed to repo (`supabase/functions/generate-makeover/`)
