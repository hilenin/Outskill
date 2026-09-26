# Execution Prompts — Day 1 / Dev A: Foundation & AI Pipeline

**Executes:** `PRD-Day1-DevA-Foundation-and-AI-Pipeline.md` (plans 01 + 05 scaffold)
**Guidelines applied:** Supabase official AI prompts (`edge-functions.md` conventions: Deno.serve, `npm:` specifiers, JWT verification) · Bolt rule "first prompt sets the foundation — stack explicit, skeleton scope only".
**How to use:** run prompts in order; verify each ✅ before the next. Where a prompt goes to an LLM (Claude/AI Studio), paste it verbatim.

---

## P1 — Gemini validation (AI Studio playground) — FIRST TASK OF THE DAY

Upload a real, well-lit room photo in https://aistudio.google.com (model: Gemini 2.5 Flash Image), paste:

```
Redesign this room in Scandinavian style: light woods, white walls, cozy
textiles, functional minimalism. Keep the room's layout, walls, windows,
doors, and camera perspective exactly the same. Only change furniture,
decor, colors, materials, and lighting to match the style.
Photorealistic result.
```

✅ Verify: same room geometry, restyled furnishings, photorealistic. Repeat with a second photo + one more style. Record latency. Announce go/no-go at the 11 AM sync.

## P2 — Bolt starting prompt (Bolt, new project, build mode)

Use the full starting prompt from the filled playbook Step 7.3 (`docs/Product Building - Playbook - AI Interior Makeover.docx`) — it already follows Bolt's starting-prompt structure (stack named, entities, screens, must-have flow, skeleton scope). Before submitting, connect the Supabase integration in Bolt settings.

✅ Verify: project scaffolds with React + Vite + Tailwind + Supabase client; no extra backends invented.

## P3 — Secrets (terminal)

```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set GEMINI_API_KEY=<key-from-gemini-teammate>
```

✅ Verify: `supabase secrets list` shows the key. Grep the Bolt project for the key string — zero hits.

## P4 — Edge Function scaffold (Claude Code / your LLM)

```
You are writing a Supabase Edge Function following Supabase's official
edge-function conventions: Deno runtime, use the built-in Deno.serve (no
external HTTP framework), import npm packages with npm: specifiers, read
secrets via Deno.env.get, handle CORS with an OPTIONS preflight response.

Scaffold "generate-makeover" for project RoomReimagine:

1. Verify the caller's Supabase JWT from the Authorization header; reject
   with 401 if missing/invalid. Extract user_id from the verified claims.
2. Parse JSON body { room_id, style, custom_notes? }. Validate:
   - room_id is a UUID and the rooms row exists AND belongs to user_id
     (query with a service-role client; return 403 otherwise)
   - style is one of: scandinavian, modern-minimalist, industrial,
     bohemian, japandi, mid-century-modern, coastal, rustic (400 otherwise)
   - custom_notes optional, max 300 chars, strip control characters
3. Create two clients: one service-role (SUPABASE_URL +
   SUPABASE_SERVICE_ROLE_KEY env vars) for privileged writes, never
   exposed in responses.
4. Insert a makeovers row { room_id, user_id, style, custom_notes,
   status: 'pending' } and return 200 { makeover_id, status: 'pending' }.
5. Leave a clearly-marked TODO block where the AI generation call goes
   (implemented tomorrow): download original from storage, call Gemini,
   upload result, set status complete/failed.
6. Structure the code so the generation step can never leave a row in
   'pending' — wrap it in try/catch that sets status='failed' on any error.

Output a single index.ts I can place at
supabase/functions/generate-makeover/index.ts.
```

Then: `supabase functions new generate-makeover`, paste the code, `supabase functions deploy generate-makeover`.

✅ Verify with curl (get a JWT by signing in a test user):
- No auth → 401 · bad style → 400 · valid request → `{makeover_id, status:"pending"}` and a pending row in Table Editor.

## P5 — Stretch: first real generation (only if Dev B's schema is live)

Ask your LLM to fill the TODO using the Gemini REST API (`gemini-2.5-flash-image:generateContent`, inline_data image part + text prompt part, extract returned image part, upload to `makeovers/{user_id}/{makeover_id}.png` via service client, update row). Full hardening (timeout, retry, rate limit) is tomorrow's P-file — don't gold-plate today.

✅ Verify: one curl call flips a row pending → complete with a real image in the bucket.

## If something breaks
Paste the EXACT error output to your LLM with: "This Supabase Edge Function returns the following error when I <action>. Here is the full error: <paste>. Here is index.ts: <paste>. Fix only the failing part." (Bolt/LLM rule: exact errors, one fix per prompt.)
