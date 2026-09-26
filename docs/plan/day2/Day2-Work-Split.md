# Day 2 — Work Split (3 Developers)

**Goal by end of day:** The must-have flow runs end-to-end at least once: upload → style → generate → before/after slider → save → visible in gallery. (Playbook Day 2 bar.)

**Plans in play today:** **05B (n8n workflow — finish; supersedes 05)**, 04 (Upload & Style Selector), 06 (Result Screen), 07 (Gallery — started)

> ⚠️ **Backend change:** the team uses **n8n** instead of Supabase Edge Functions — follow `../05B-n8n-AI-Generation-Workflow.md`. Key contract difference: the FRONT END inserts the pending `makeovers` row, then POSTs the n8n webhook (05B §3); daily-limit surfaces as `error_reason='daily_limit'` on a failed row, not HTTP 429.

| Developer | Role | Day 2 plans |
|-----------|------|-------------|
| **Dev A** | Backend lead | Plan 05B — finish workflow, activate, tune |
| **Dev B** | Data / backend → frontend support | Plan 04 |
| **Dev C** | Frontend lead | Plan 06, then start Plan 07 |

---

## Morning

### Dev A — Plan 05B: finish the n8n workflow
- [ ] Complete the generation path: download original → Gemini call → upload result → mark complete (05B §4 nodes 6–10)
- [ ] Rate limiting (20/user/day → row `failed` with `error_reason='daily_limit'`)
- [ ] Gemini HTTP node: 55 s timeout + one retry; Error Workflow guarantees no row is ever stuck `pending` (node 11)
- [ ] Activate the workflow; full curl test matrix (05B §6: happy path, foreign makeover → `invalid_request`, dead key → `generation_error`, 21st call → `daily_limit`, 2 concurrent)
- [ ] Announce the contract is FROZEN (plan **05B §3**) and share the production webhook URL — Devs B & C build against it

### Dev B — Plan 04: Photo Upload & Style Selector
- [ ] Upload zone: drag-drop + file picker + mobile camera capture; JPG/PNG ≤10 MB validation with inline errors
- [ ] Canvas downscale to ≤1024 px longest edge; preview + "Change photo"
- [ ] Style card grid (8 styles from plan 02 §5 constants, thumbnails collected Day 1) + optional notes field

### Dev C — Plan 06: Result screen (mock-first)
Don't wait for 04/05 integration — build with a seeded `makeovers` row:
- [ ] Polling (or Realtime) on the makeovers row; status handling pending/complete/failed
- [ ] Engaging loading state: original photo + shimmer + rotating status lines (no blank spinners)
- [ ] Before/after slider (`react-compare-slider`) with signed URLs, preloaded images, toggle fallback

## Afternoon — integration

### Dev B — Plan 04: the Generate hand-off
- [ ] On Generate: upload to `room-photos/{user_id}/{room_id}.jpg` → insert `rooms` row → **insert pending `makeovers` row → POST the n8n webhook** (makeover_id + user JWT, 05B §3) → navigate to `/result/:makeoverId`
- [ ] Failure handling: toast, photo + style preserved, retry possible
- [ ] Then: seed 3–4 fake makeovers and **start Plan 07 gallery grid** if time remains

### Dev C — Plan 06: real integration + actions
- [ ] Wire against real generations coming from Dev B's screen
- [ ] Actions: Save (→ gallery), Try Another Style (`/new-makeover?room_id=...` — agree param with Dev B), Retry on failed, friendly daily-limit message when `error_reason='daily_limit'`
- [ ] **Decision to make together at 2 PM:** explicit `saved` flag vs. all-completes-are-saved. Recommendation (plan 06 §3): no flag — simplest.

### Dev A — Plan 05: prompt tuning + support
- [ ] Run all 8 styles against 2 test photos; strengthen any style fragment that moves walls/windows; record final fragments in plan 02 §5 table
- [ ] Support B & C on integration bugs (webhook CORS, JWT header pass-through, signed URLs — debug via n8n Executions panel)
- [ ] Confirm no AI key in the front-end bundle

## Sync points
- **~10 AM:** Dev A freezes the n8n contract (05B §3) and shares the webhook URL.
- **~2 PM:** Integration hour — B's Generate → A's function → C's result screen, first live end-to-end run together. Decide the `saved`-flag question.
- **~5 PM:** Full must-have flow attempt, all three watching. Log every issue in the plan 09 bug-log format.

## End-of-Day-2 checklist
- [ ] Must-have flow runs end-to-end at least once (even if rough): upload → style → generate → slider → save
- [ ] n8n workflow acceptance criteria all green (plan 05B), workflow JSON exported to the repo
- [ ] All 8 styles produce geometry-preserving results
- [ ] Gallery grid started with seed data (plan 07 §1)
- [ ] Everything committed to GitHub; bug list written down for Day 3
