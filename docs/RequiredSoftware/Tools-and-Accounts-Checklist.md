# Required Software — Tools & Accounts Checklist
## RoomReimagine (AI Interior Makeover)

Everything the team needs to sign up for, install, or get keys for — consolidated from implementation plans 01–09 (`docs/plan/`). Get all of these ready on **Day 1 morning** (plan 01) so nobody is blocked later.

> ✅ **DECISION MADE — Image generation/editing: Google Gemini.** A teammate already has Gemini access, so Gemini 2.5 Flash Image is our confirmed image model. The OpenAI/Replicate fallbacks below are listed for reference only — do not set them up unless the Day 1 room-photo test fails badly.

---

## 1. Core AI Tools (the ones doing the intelligent work)

| # | Tool | What it's for | Access type | Sign-up / link | Cost | Used in plan | Status |
|---|------|---------------|-------------|----------------|------|--------------|--------|
| 1 | **Google Gemini 2.5 Flash Image** ("Nano Banana") | **CONFIRMED image-editing AI** — takes the user's room photo + style prompt, returns the same room restyled | API key (online) | https://aistudio.google.com/apikey | Free tier available; pay-per-image after | 01 (validate), 05 (Edge Function) | ✅ Teammate has access — they own the Day 1 validation test and provide the API key for Supabase secrets |
| 2 | OpenAI Images Edit (`gpt-image-1`) | Fallback only — skip unless Gemini fails the geometry test | API key (online) | https://platform.openai.com | Paid (~$0.02–0.19/image) | 01, 05 | ⏸ Not needed |
| 3 | Replicate (interior-design models) | 2nd fallback only | API token (online) | https://replicate.com | Pay-per-run | 01, 05 | ⏸ Not needed |
| 4 | **Bolt** (bolt.new) | AI vibe-coding builder that generates and iterates the entire React front end from prompts | Online account | https://bolt.new | Free tier; Pro recommended for token headroom | 01, 03, 04, 06, 07, 08 | ☐ |
| 5 | **Claude / ChatGPT** (any LLM you have) | Writing/refining Bolt prompts, PRD iterations, fix prompts during the test loop | Online account | claude.ai / chatgpt.com | Free tiers fine | All phases (playbook workflow) | ☐ |

### Gemini owner's Day 1 tasks (the teammate with access)
1. Confirm the API key works: test in AI Studio's playground with a real room photo + this prompt:
   `"Redesign this room in Scandinavian style. Keep the room layout, walls, windows, doors and camera perspective exactly the same. Only change furniture, decor, colors, materials and lighting. Photorealistic."`
2. Verify the output preserves room geometry (walls/windows/doors unmoved).
3. Note the observed latency (expect 10–30 s) — plan 06 needs it for the loading UX.
4. Hand the API key to the backend lead to store as a Supabase secret: `supabase secrets set GEMINI_API_KEY=<key>` — the key must never appear in Bolt, the front end, or GitHub.
5. On Day 2, pair with plan 05's owner on prompt tuning per style (plan 05 §6).

## 2. Backend & Infrastructure (online access)

| # | Tool | What it's for | Access type | Sign-up / link | Cost | Used in plan | Status |
|---|------|---------------|-------------|----------------|------|--------------|--------|
| 6 | **Supabase** (online) | Auth (email/password), Postgres DB, private image Storage, Edge Functions | Online account + project | https://supabase.com/dashboard | Free tier is enough | 01, 02, 03, 05, 06, 07 | ☐ |
| 7 | **Supabase CLI** | Deploy the `generate-makeover` Edge Function, set API-key secrets | Local install | `npm i -g supabase` | Free | 01, 05 | ☐ |
| 8 | **Node.js ≥ 18 LTS** | Required by the Supabase CLI | Local install | https://nodejs.org | Free | 01, 05 | ☐ |
| 9 | **GitHub** | Private repo for code backup (Code Owner pattern) | Online account | https://github.com/new | Free | 01, all commits | ☐ |

## 3. Supporting Tools (testing, assets, demo)

| # | Tool | What it's for | Access type | Link | Cost | Used in plan | Status |
|---|------|---------------|-------------|------|------|--------------|--------|
| 10 | **curl / Postman / Hoppscotch** | Test the Edge Function standalone before the UI exists | Local / online | hoppscotch.io (no install) | Free | 05 | ☐ |
| 11 | **Unsplash / Pexels** | Style-card thumbnails + test room photos | Online, no account needed | unsplash.com / pexels.com | Free | 04, 09 | ☐ |
| 12 | **react-compare-slider** (npm) | The before/after slider component (the demo "wow moment") | npm package (Bolt installs it via prompt) | npmjs.com/package/react-compare-slider | Free | 06, 07 | ☐ |
| 13 | **Loom** | Record the 2–3 min demo walkthrough for submission | Online account | https://www.loom.com | Free tier fine | 09 | ☐ |
| 14 | **A real phone + desktop browser** | Mobile is a primary path — test camera upload & slider touch | Hardware | — | — | 04, 09 | ☐ |

## 4. Keys & Secrets Summary (who holds what)

| Secret | Where it lives | Who uses it | NEVER goes to |
|--------|----------------|-------------|---------------|
| **Gemini API key** (from teammate with access) | Supabase Edge Function secrets (`supabase secrets set GEMINI_API_KEY=...`) | Plan 05's Edge Function only | Front end / Bolt / GitHub |
| Supabase `service_role` key | Auto-available inside Edge Functions | Plan 05 (privileged DB/Storage writes) | Front end / GitHub |
| Supabase `anon` key + Project URL | Bolt's Supabase integration | Front end (safe — RLS protects data) | — (public by design) |
| Supabase DB password | Team vault/notes | Dashboard admin only | GitHub |

## 5. Day 1 Morning Setup Checklist (one pass, ~1 hour)

- [ ] Supabase account + project `roomreimagine` created (owner: backend lead)
- [ ] **Gemini teammate: room-photo restyle test passed; API key handed to backend lead**
- [ ] Bolt account created; project bootstrapped; Supabase integration connected
- [ ] Supabase CLI + Node installed on backend lead's machine; `supabase login` works
- [ ] Gemini key stored as Supabase secret (not in any file)
- [ ] GitHub private repo created; teammates invited; Code Owner assigned
- [ ] Loom account created (any teammate)
- [ ] 3–4 good test room photos collected (well-lit, wide-angle)
