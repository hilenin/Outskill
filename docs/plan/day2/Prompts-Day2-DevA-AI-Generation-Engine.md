# Execution Prompts — Day 2 / Dev A: AI Generation Engine

**Executes:** `PRD-Day2-DevA-AI-Generation-Engine.md` (plan 05 complete)
**Guidelines applied:** Supabase official `edge-functions.md` conventions (Deno.serve, npm: specifiers, env secrets, CORS) · one concern per prompt · exact-error fix protocol.
**How to use:** P1→P4 with your LLM (Claude Code), deploying and curl-verifying after each. Contract freezes at 10 AM — announce it.

---

## P1 — Complete the generation core (your LLM)

```
Here is my working generate-makeover Supabase Edge Function scaffold
(JWT auth, validation, pending-row insert): <paste index.ts>

Implement the TODO generation block following Supabase edge-function
conventions (Deno, npm: specifiers, Deno.env.get for secrets):

1. Download the original image from the room-photos bucket at
   room-photos/{user_id}/{room_id}.jpg using the service-role client;
   convert to base64.
2. Build this exact prompt (style fragments provided below):
   "Redesign this room in {style_name} style. {style_fragment}.
    Keep the room's layout, walls, windows, doors, and camera
    perspective exactly the same. Only change furniture, decor, colors,
    materials, and lighting to match the style. Photorealistic result.
    {custom_notes}"
3. Call Gemini REST: POST
   https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent
   with header x-goog-api-key: GEMINI_API_KEY secret, body contents[0].parts =
   [{inline_data:{mime_type,data}}, {text: prompt}]. Extract the returned
   inline_data image part.
4. Upload the result to makeovers/{user_id}/{makeover_id}.png
   (service-role client, contentType image/png, upsert true).
5. Update the makeovers row: status='complete',
   generated_image_url=<path>.
6. Failure guarantee: wrap 1-5 so ANY error sets status='failed' before
   the function exits. A row must never remain 'pending'.

Style fragments: scandinavian: light woods, white walls, cozy textiles,
functional minimalism | modern-minimalist: clean lines, neutral palette,
clutter-free, statement lighting | industrial: exposed brick, metal
accents, dark tones, raw materials | bohemian: layered textiles, plants,
warm earthy colors, eclectic decor | japandi: japanese-scandinavian
fusion, low furniture, natural materials, zen calm | mid-century-modern:
teak wood, organic curves, retro accents, bold accent colors | coastal:
light blues, whites, natural fibers, airy beach-house feel | rustic:
reclaimed wood, warm textures, farmhouse charm, stone accents

Output the full updated index.ts only.
```

Deploy → ✅ one curl call flips pending → complete with a real PNG in the bucket.

## P2 — Timeout + retry (one concern)

```
Add to this Edge Function: wrap the Gemini fetch in an AbortController
with a 55-second timeout, and on timeout or any 5xx response retry
exactly once. If the retry also fails, set status='failed'. Do not
change any other behavior. <paste current index.ts>
```

✅ Verify: point at an invalid model name temporarily → row ends `failed` (never stuck), then restore.

## P3 — Rate limit (one concern)

```
Add a daily cap: before inserting the pending row, count the caller's
makeovers rows where created_at > now() - interval '1 day'. If >= 20,
return HTTP 429 with JSON {"error":"daily_limit"}. Do not change any
other behavior. <paste current index.ts>
```

✅ Verify: temporarily set the cap to 2, third curl call → 429, restore to 20.

## P4 — Contract freeze + curl matrix (10 AM)

Post to team: `POST /generate-makeover {room_id, style, custom_notes?} → {makeover_id, status:"pending"}` · errors: 401 / 403 foreign room / 400 bad input / 429 daily_limit · row resolves to complete|failed ≤60 s.

Run the full matrix; all must pass before integration hour:

| curl | Expect |
|------|--------|
| no Authorization header | 401 |
| other user's room_id | 403 |
| style "baroque" | 400 |
| 301-char notes | 400 |
| happy path | pending → complete, PNG exists |
| dead API key (temporarily) | row → failed |
| 3rd call with cap=2 | 429 daily_limit |
| 2 concurrent happy calls | both complete |

## P5 — Afternoon: per-style quality pass (AI Studio or curl)

For each of the 8 styles × 2 test photos, generate and inspect. For any style that moves walls/windows, strengthen ITS fragment only:

```
This prompt fragment for {style} caused the model to alter room
geometry (moved <what>). Rewrite ONLY the fragment to more strongly
preserve architecture while keeping the style's character. Current
fragment: "<fragment>". Return the new fragment text only.
```

Record final fragments in plan 02 §5's table and redeploy.

## Fix protocol
Paste the exact function log line (`supabase functions logs generate-makeover`) + current code + "fix only this" — one concern per prompt, redeploy, re-curl.
