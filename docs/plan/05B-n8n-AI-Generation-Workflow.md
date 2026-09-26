# 05B — n8n Workflow: AI Makeover Generation

> ⚠️ **THIS PLAN USES n8n.** It **supersedes** `05-Edge-Function-AI-Generation.md` (kept unchanged for reference) after the team decided to use n8n instead of Supabase Edge Functions. Where any other document says "Edge Function", read it as "the n8n generate-makeover workflow" and use the contract in §3 below.

**Owner:** 1 person (backend — Dev A)
**Depends on:** 02 (schema + buckets). Testable standalone with curl before any UI exists.
**Estimated effort:** 4–6 hours (start Day 1 afternoon, finish Day 2)
**Deliverable:** An active n8n workflow triggered by a webhook: validates the caller, downloads the room photo, calls Gemini, stores the restyled image, updates the `makeovers` row. AI and service keys live only in n8n credentials.

---

## 1. What changes vs. plan 05 — and what doesn't

| Stays the same | Changes |
|----------------|---------|
| Storage paths, Gemini prompt template, style fragments | Backend runs in **n8n**, not a Supabase Edge Function |
| Polling UX: row flips pending → complete/failed (plan 06 unchanged) | **The front end now creates the pending `makeovers` row itself**, then calls the n8n webhook (RLS already allows "own makeovers insert" — plan 02 anticipated this) |
| RLS design: users never UPDATE makeovers; only the service key does | Secrets move from `supabase secrets` to **n8n credentials** |
| Never-stuck-pending guarantee, 55 s timeout + 1 retry, 20/day cap | Daily-limit is signaled via a new `error_reason` column (no HTTP 429 — the webhook already answered 202) |
| | Debug logs: n8n **Executions** panel instead of `supabase functions logs` |

## 2. Tools Needed

| Tool | Purpose |
|------|---------|
| **n8n** — n8n Cloud (https://n8n.io, free trial) OR self-hosted (`npx n8n` / Docker, Node ≥18) | Hosts the workflow. Cloud recommended for the hackathon: zero ops, always-on URL for the deployed app |
| n8n nodes: **Webhook**, **Respond to Webhook**, **HTTP Request**, **IF**, **Code** (small JS steps) | The whole flow is buildable with core nodes — no community nodes needed |
| n8n **credentials** store | Holds `GEMINI_API_KEY`, Supabase **service_role** key + project URL (header auth credentials for HTTP nodes) |
| Supabase REST + Storage APIs | Row reads/updates (`/rest/v1/makeovers`), file download/upload (`/storage/v1/object/...`) via HTTP Request nodes with the service key |
| curl / Hoppscotch | Standalone testing before UI integration |

## 3. Contract (FROZEN — replaces plan 05 §3; plans 04/06 and Wire-02 consumers)

1. **Front end** (on Generate click, after photo upload + `rooms` insert):
   a. Inserts the pending row itself: `insert into makeovers { room_id, user_id, style, custom_notes, status: 'pending' }` → gets `makeover_id`. (Allowed by the existing "own makeovers insert" RLS policy.)
   b. `POST <n8n-webhook-url>` with JSON body `{ "makeover_id": "<uuid>" }` and header `Authorization: Bearer <user's Supabase access token>`.
2. **n8n** responds **202 immediately** (Respond to Webhook node) and continues processing asynchronously.
3. n8n finishes by updating the row: `status = 'complete'` + `generated_image_url`, or `status = 'failed'` (+ `error_reason`).
4. **Front end polls the row** exactly as plan 06 specifies — no change to the result screen except reading `error_reason`.

**One-time migration** (SQL Editor) for failure reasons:

```sql
alter table public.makeovers add column if not exists error_reason text;
```

Front-end mapping: `error_reason = 'daily_limit'` → "You've hit today's makeover limit — try again tomorrow"; anything else failed → the standard retry UX.

## 4. Workflow build (node by node)

Name the workflow `generate-makeover`. Nodes in order:

1. **Webhook** (POST, path auto-generated random — keep it; Respond: "Using Respond to Webhook node").
2. **Respond to Webhook** — immediately return `202 {"status":"accepted"}`. Everything after runs async.
3. **HTTP Request — verify caller:** `GET {SUPABASE_URL}/auth/v1/user` with headers `apikey: <anon key>`, `Authorization: <incoming bearer token from webhook header>`. Invalid/expired token → error branch (stop; row stays pending only if it exists — see step 4 guard). Save `user.id` as `caller_id`.
4. **HTTP Request — load the makeover row:** `GET {SUPABASE_URL}/rest/v1/makeovers?id=eq.{{makeover_id}}&select=*,rooms(original_image_url,user_id)` with service-key headers. **IF** row missing, `status != 'pending'`, or `user_id != caller_id` → error branch → PATCH row `status='failed', error_reason='invalid_request'` (when the row exists).
5. **HTTP Request — rate limit:** `GET {SUPABASE_URL}/rest/v1/makeovers?user_id=eq.{{caller_id}}&created_at=gte.{{now-24h}}&select=id` with header `Prefer: count=exact`; read the `content-range` count. **IF** count > 20 → PATCH `status='failed', error_reason='daily_limit'` → stop.
6. **HTTP Request — download original:** `GET {SUPABASE_URL}/storage/v1/object/room-photos/{{rooms.original_image_url}}` with service key, response type **file/binary**.
7. **Code node — base64:** convert the binary to base64 and assemble the Gemini request body with the prompt template (style fragments from plan 02 §5):
   `Redesign this room in {style_name} style. {style_fragment}. Keep the room's layout, walls, windows, doors, and camera perspective exactly the same. Only change furniture, decor, colors, materials, and lighting to match the style. Photorealistic result. {custom_notes}`
8. **HTTP Request — Gemini:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`, header `x-goog-api-key` from n8n credentials. **Settings → Timeout: 55000 ms, Retry On Fail: enabled, Max Tries: 2.** Extract the returned `inline_data` image part (Code node).
9. **HTTP Request — upload result:** `POST {SUPABASE_URL}/storage/v1/object/makeovers/{{caller_id}}/{{makeover_id}}.png` with service key, `Content-Type: image/png`, `x-upsert: true`, binary body.
10. **HTTP Request — mark complete:** `PATCH {SUPABASE_URL}/rest/v1/makeovers?id=eq.{{makeover_id}}` body `{ "status":"complete", "generated_image_url":"{{caller_id}}/{{makeover_id}}.png" }`.
11. **Error handling — the never-stuck-pending guarantee:** attach an **Error Workflow** (or route every node's error output) to a final node: `PATCH ... { "status":"failed", "error_reason":"generation_error" }`. Every failure path after row creation MUST end in this PATCH.

Activate the workflow (toggle ON) — the production webhook URL is now stable; share it with Dev B for the front-end call.

## 5. Security notes

- **service_role key and Gemini key live ONLY in n8n credentials.** Never in Bolt, the front end, or GitHub.
- The webhook URL will be visible in front-end code — that's why step 3 validates the caller's Supabase JWT and step 4 checks row ownership. A stolen URL without a valid user token does nothing.
- `custom_notes` is user text entering a prompt: the row was created under RLS so length-cap it client-side (200 chars, plan 04) and keep it at the END of the prompt.

## 6. Standalone test matrix (curl, before UI integration)

Seed a room + photo manually (SQL Editor + Storage upload), sign in a test user to get a JWT, insert a pending makeovers row, then:

| Test | Expect |
|------|--------|
| POST webhook, no Authorization header | 202, then row → `failed` / `invalid_request` (or no-op if row check fails first) |
| Valid JWT, other user's makeover_id | row → `failed` / `invalid_request` |
| Valid happy path | 202 → row `pending` → `complete`, PNG in `makeovers/{user}/{id}.png` |
| Dead Gemini key (temporarily) | row → `failed` / `generation_error` after retry |
| 21st generation in 24 h | row → `failed` / `daily_limit` |
| Two concurrent requests | both complete |

Debug in **n8n → Executions** — every run shows per-node inputs/outputs (this replaces `supabase functions logs`).

## 7. Front-end impact (hand to Dev B / Wire prompts)

The Generate click sequence becomes: upload photo → insert `rooms` row → **insert pending `makeovers` row** → **POST n8n webhook with makeover_id + user JWT** → navigate to `/result/:makeoverId`. The result screen (plan 06) polls unchanged, plus maps `error_reason='daily_limit'` to the friendly cap message.

## Acceptance Criteria
- [ ] Workflow active; full §6 matrix green
- [ ] Median generation < 30 s; no row ever left `pending` across all failure tests
- [ ] Keys only in n8n credentials (grep the front-end bundle)
- [ ] Contract §3 announced to Dev B & Dev C; `error_reason` migration applied
- [ ] Workflow exported as JSON (n8n → Download) and committed to the repo (`n8n/generate-makeover.json`)
