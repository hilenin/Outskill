# 01 — Project Setup & Supabase Foundation

**Owner:** 1 person (backend lead)
**Depends on:** Nothing — do this first; it blocks every other package
**Estimated effort:** 2–3 hours (Day 1 morning)
**Deliverable:** Live Bolt project connected to a Supabase project, AI API key validated, secrets stored, GitHub repo ready.

---

## Tools Needed

| Tool | Version / Plan | Purpose | Setup link |
|------|----------------|---------|------------|
| Bolt (bolt.new) | Free/Pro account | Front-end builder; hosts the React app | https://bolt.new |
| Supabase | Free tier project | Auth, Postgres, Storage, Edge Functions | https://supabase.com/dashboard |
| Supabase CLI | latest (`npm i -g supabase`) | Deploy Edge Functions, manage secrets | https://supabase.com/docs/guides/cli |
| Node.js | ≥ 18 LTS | Required by Supabase CLI | https://nodejs.org |
| Google AI Studio | Free API key | Gemini 2.5 Flash Image (primary AI image-editing API) | https://aistudio.google.com/apikey |
| OpenAI Platform (fallback) | API key with credit | `gpt-image-1` Images Edit fallback | https://platform.openai.com |
| GitHub | Private repo | Team backup (Code Owner pattern) | https://github.com/new |

## Tasks

### 1. Create the Supabase project
1. Sign in at supabase.com → **New project** → name `roomreimagine`, choose closest region, generate a strong DB password (store in team vault/notes).
2. From **Project Settings → API**, record:
   - `Project URL` (`https://<ref>.supabase.co`)
   - `anon` public key (used by Bolt front end)
   - `service_role` key (used ONLY inside Edge Functions — never in the front end)

### 2. Validate the AI image-editing API (do this before anything else!)
This is the highest-risk dependency. Prove it works with a real room photo:
1. Get a Gemini API key from Google AI Studio.
2. Test with `curl` or AI Studio's playground: upload a sample room photo + prompt:
   `"Redesign this room in Scandinavian style. Keep the room layout, walls, windows, doors and camera perspective exactly the same. Only change furniture, decor, colors, materials and lighting. Photorealistic."`
3. Confirm: the output is the *same room* restyled (geometry preserved). If Gemini output is unsatisfactory, test the OpenAI Images Edit fallback and pick the winner. **Record the chosen provider + model in this file — plan 05 consumes this decision.**
4. Note observed latency (expect 10–30 s) — plan 06 needs it for the loading UX.

### 3. Bootstrap the Bolt project
1. Go to bolt.new → new project.
2. Connect Supabase via Bolt's built-in integration (Settings → Integrations → Supabase) using the Project URL + anon key.
3. Paste the starting prompt from the filled playbook (`docs/Product Building - Playbook - AI Interior Makeover.docx`, Step 7.3) to generate the first scaffold. Don't polish yet — plans 03–07 own the screens.

### 4. Store secrets
Using the Supabase CLI (after `supabase login` and `supabase link --project-ref <ref>`):
```bash
supabase secrets set GEMINI_API_KEY=<key>
# or the fallback:
supabase secrets set OPENAI_API_KEY=<key>
```
Rule: AI keys live ONLY in Edge Function secrets. The front end only ever holds the anon key.

### 5. GitHub backup repo
1. Create private repo `aiap-<cohort>-roomreimagine`; add teammates with Write access.
2. Assign one **Code Owner** who commits stable Bolt exports with clear messages.
3. Commit the initial scaffold export as the first commit.

## Acceptance Criteria
- [ ] Supabase project live; URL, anon key recorded in team notes; service_role key stored securely
- [ ] AI API validated on a real room photo; provider/model decision recorded; latency noted
- [ ] Bolt project created, Supabase integration connected, scaffold generated
- [ ] `GEMINI_API_KEY` (or fallback) set as a Supabase secret
- [ ] GitHub repo created with initial commit; Code Owner assigned

## Hand-off Notes
- Give plan 02's owner the Supabase project ref + dashboard access.
- Give plan 05's owner the chosen AI provider decision + secret name.
- Give plan 03's owner the Bolt project link.
