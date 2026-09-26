# Day 1 — Work Split (3 Developers)

**Goal by end of day:** Foundation complete — Supabase live with schema + RLS, auth working in Bolt, Gemini validated, Edge Function started. Ideation/PRD is already done (`docs/PRD-AI-Interior-Makeover.md`).

**Plans in play today:** 01 (Setup), 02 (Database/RLS), 03 (Auth & Shell), **05B (n8n AI workflow — started early; supersedes 05)**

> ⚠️ **Backend change:** the team uses **n8n** instead of Supabase Edge Functions. All "Edge Function" tasks below are replaced by their n8n equivalents from `../05B-n8n-AI-Generation-Workflow.md`.

## Developer roles (fix these once, keep for all 3 days)

| Developer | Role | Day 1 plans |
|-----------|------|-------------|
| **Dev A** | Backend lead | Plan 01 → start Plan 05B (n8n) |
| **Dev B** | Data / backend | Plan 02 |
| **Dev C** | Frontend lead | Plan 03 |

> The teammate with **Gemini access** does the AI validation test (Plan 01 §2) regardless of which Dev letter they are — see `docs/RequiredSoftware/Tools-and-Accounts-Checklist.md` §1.

---

## Morning (first ~3 hours)

### Dev A — Plan 01: Project Setup & Supabase Foundation
- [ ] Create Supabase project `roomreimagine`; record Project URL, anon key; secure service_role key + DB password
- [ ] Run the **Gemini room-photo validation test** (or hand to the Gemini-access teammate): real room photo + the geometry-preservation prompt; note latency
- [ ] Bootstrap the Bolt project, connect Supabase integration, generate scaffold from the playbook Step 7.3 starting prompt
- [ ] Create the **n8n instance** (n8n Cloud account, or `npx n8n` locally — Node ≥18); store the **Gemini API key** and **Supabase service_role key + URL** as n8n credentials (plan 05B §2) — keys go to n8n, NOT `supabase secrets`
- [ ] (Optional) Install Supabase CLI + Node for keeping SQL as migration files
- [ ] Create private GitHub repo, add teammates (Write), assign Code Owner, commit scaffold

⛔ **Everyone is blocked until Dev A shares:** Supabase project ref + dashboard access (→ Dev B), Bolt project link (→ Dev C). Target: done within 90 minutes.

### Dev B — Plan 02: Database Schema, Storage & RLS *(starts once Supabase project exists)*
While waiting: collect 3–4 test room photos (well-lit, wide-angle) and 8 style thumbnails from Unsplash/Pexels — plan 04/09 need them.
- [ ] Run all migration SQL: `profiles`, `rooms`, `makeovers` tables + indexes
- [ ] Signup trigger (`handle_new_user`)
- [ ] RLS policies on all three tables
- [ ] Create private buckets `room-photos`, `makeovers` + per-user-folder storage policies

### Dev C — Plan 03: Auth & App Shell *(starts once Bolt project exists)*
While waiting: read plans 03, 04, 06 so the day's frontend contracts are clear.
- [ ] Supabase Auth config: enable email/password, **disable email confirmation**, set redirect URLs
- [ ] Sign In / Sign Up screens with validation + friendly errors
- [ ] Session handling (`onAuthStateChange`), route guards

## Afternoon

### Dev A — Plan 05B (early start): n8n generation workflow skeleton
- [ ] Create workflow `generate-makeover`: Webhook trigger → immediate 202 Respond node (plan 05B §4 nodes 1–2)
- [ ] Add caller validation (JWT check via Supabase `/auth/v1/user`) + load-makeover-row nodes (nodes 3–4) against the DB Dev B built
- [ ] Apply the `error_reason` migration (plan 05B §3)
- [ ] First curl test: webhook returns 202 and the row lookup resolves for a manually seeded makeover (needs Dev B's schema — sync at 2 PM)

### Dev B — Plan 02: verification + hand-off
- [ ] Two-test-user RLS verification (rows AND storage folders isolated)
- [ ] Publish the style constants table (slug/name/prompt fragment) to team notes — Dev C and Dev A both consume it
- [ ] Save SQL to repo (`supabase/migrations/`) via Code Owner
- [ ] Then assist Dev A on plan 05 testing (seed rooms, watch rows flip status)

### Dev C — Plan 03: finish shell
- [ ] Register all 5 routes with guards + placeholder pages (`/new-makeover`, `/result/:id`, `/gallery`, `/concept/:id`, `/signin`)
- [ ] App header/nav, mobile layout, shared button/toast/spinner components
- [ ] Full auth loop test on phone + desktop

## Sync points
- **~11 AM:** Dev A unblocks B and C (access hand-offs). Gemini verdict announced — if geometry test failed, decide fallback NOW.
- **~2 PM:** Dev B walks A through schema; A starts wiring the n8n workflow against it.
- **~5 PM (end-of-day standup):** run the Day 1 checklist below; anything red rolls to Day 2 morning with an owner.

## End-of-Day-1 checklist
- [ ] Supabase project live; schema + RLS verified with 2 users (Plan 02 acceptance ✅)
- [ ] Gemini validated on a real room photo; keys stored in n8n credentials
- [ ] Sign up/in/out works twice in a row; all routes guarded (Plan 03 acceptance ✅)
- [ ] n8n workflow skeleton live (webhook 202 + row lookup working); ideally one full generation end-to-end (full acceptance can finish Day 2)
- [ ] Everything committed to GitHub by Code Owner
