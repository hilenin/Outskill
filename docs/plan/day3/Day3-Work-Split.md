# Day 3 — Work Split (3 Developers)

**Goal by end of day:** Stable must-have flow (twice in a row, phone + desktop), gallery CRUD complete, Should-haves in **only if stable**, Loom recorded, deck done, project SUBMITTED via the portal.

**Plans in play today:** 07 (finish Gallery), 08 (Should-haves — gated), 09 (Testing, Hardening & Demo)

| Developer | Role | Day 3 plans |
|-----------|------|-------------|
| **Dev A** | QA / demo lead (didn't build the UI — best tester) | Plan 09 |
| **Dev B** | Frontend support | Plan 07 — finish |
| **Dev C** | Frontend lead | Plan 08 — gated on stability |

> ⚠️ **Gate rule (playbook + plan 08):** Dev C does NOT start plan 08 until the must-have flow passes twice in a row. If it hasn't by ~10 AM, Dev C joins bug-fixing instead.

---

## Morning

### Dev A — Plan 09: scenario testing + bug log
- [ ] Run the full scenario script (plan 09 §1) on desktop AND a real phone, on the production URL
- [ ] Edge-case sweep: bad files, network drop mid-generation, refresh mid-loading, second-user isolation, empty/failed/not-found states, daily-limit message (`error_reason='daily_limit'` — lower the cap in the n8n workflow's rate-limit IF node to test, then restore; failures debug via n8n Executions panel)
- [ ] Log every issue in the bug table (issue → where → fix prompt → fixed?); hand fixes to B/C as targeted Bolt prompts
- [ ] Declare the stability gate: ✅ two clean consecutive runs → Dev C may start plan 08

### Dev B — Plan 07: finish Gallery & Concept Detail
- [ ] Gallery grid: user's completed makeovers, newest first, batch signed URLs, lazy thumbnails, "N styles" chip per room
- [ ] Empty state with "Create your first makeover" CTA
- [ ] Concept Detail: reuse the plan 06 slider component; style badge, notes, date
- [ ] Delete: confirm dialog → row + storage file; last-makeover-of-room cascades room + original; toast + refresh
- [ ] CRUD matrix check (plan 07 §3)

### Dev C — Plan 08 (if gate passed): Should-haves
- [ ] S2 Custom notes first (~30 min): verify end-to-end effect, display notes on Result + Concept Detail
- [ ] S1 Style Shootout: comparison grid when a room has ≥2 concepts, card → slider, "+ Try Another Style" tile
- [ ] Re-run the FULL must-have flow after merging — should-haves must not destabilize it

## Afternoon — freeze, polish, demo

**~1 PM: FEATURE FREEZE.** Only bug fixes after this. If plan 08 isn't stable, revert it (cut-line rule, plan 08 acceptance).

### Dev A — Plan 09: demo assets
- [ ] Demo account with pre-generated backup gallery (living room: Japandi + Industrial + Scandinavian; bedroom: Boho)
- [ ] Rehearse demo script (plan 09 §5) including the slow-generation fallback
- [ ] Record the 2–3 min Loom on the production URL; teammate reviews before accepting the take

### Dev B — final CRUD + regression
- [ ] Fix remaining bug-log items for gallery/detail
- [ ] Re-verify two-user isolation at UI level; deletion actually removes storage files

### Dev C — pitch deck + submission prep
- [ ] Copy `AIAP _ Pitch Deck Template.pptx` → `docs/RoomReimagine-Pitch-Deck.pptx` (never edit the original)
- [ ] Fill: problem, solution, before/after screenshot pairs (the money slides), stack diagram (Bolt + Supabase + **n8n** + Gemini), next steps
- [ ] Gather submission package: live URL, Loom link, deck, team details

### All three — final hour
- [ ] Final full scenario run, all watching, on production URL
- [ ] Submit via the **AI Accelerator Hackathon Portal** (only valid channel — no WhatsApp/email); double-check every field
- [ ] Final GitHub commit; fill playbook Step 12.2 reflection while it's fresh

## Sync points
- **~10 AM:** Stability gate decision (Dev A calls it).
- **~1 PM:** Feature freeze.
- **~3 PM:** Demo dry-run for the team before Loom recording.
- **Before deadline:** Submission confirmed by all three.

## End-of-Day-3 / final checklist
- [ ] Scenario passes twice in a row, phone + desktop, zero blocker bugs
- [ ] Gallery CRUD complete; Should-haves in or cleanly cut
- [ ] Demo account + backup gallery ready
- [ ] Loom recorded and reviewed
- [ ] Deck done; **submission completed through the portal**
