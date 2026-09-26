# 09 — Testing, Hardening & Demo Prep

**Owner:** 1 person (QA/demo lead — ideally NOT the person who built the flow being tested)
**Depends on:** All previous packages (starts as soon as 06 lands; runs through end of Day 3)
**Deliverable:** Stable must-have flow verified twice in a row, bug log worked to zero blockers, demo account with backup data, 2–3 min Loom recording, pitch deck, and submission via the portal.

---

## Tools Needed

| Tool | Purpose |
|------|---------|
| The deployed app (Bolt production URL) | All testing happens on the real URL, not just the editor preview |
| A real phone + a desktop browser | Mobile is a primary path (PRD §9); test both |
| Loom (loom.com) | Record the 2–3 min walkthrough for submission |
| Pitch deck template | `AIAP _ Pitch Deck Template.pptx` (repo root) — make a COPY, don't edit the original |
| AI Accelerator Hackathon Portal | Only valid submission channel (per playbook) |
| Bug log table below | Track issue → fix prompt → retest |
| 3–4 good demo photos | Well-lit, wide-angle living room + bedroom shots |

## Tasks

### 1. Scenario test script (playbook Step 11.1)
Run this full scenario, start to finish, on desktop AND phone:

> "A renter wants to see their living room in Japandi style before buying furniture. They: Sign Up (fresh account) → New Makeover → upload living-room photo → pick Japandi → notes: 'keep the sofa' → Generate → watch loading → Before/After slider → Save → Gallery → open concept → Try Another Style (Industrial) → compare both in shootout → delete one concept → done."

Must pass **twice in a row without a workaround** (playbook stability bar).

### 2. Edge-case sweep
- [ ] Wrong file type / oversize photo → friendly errors
- [ ] Network drop mid-generation → recoverable, retry works
- [ ] Daily-limit message renders (temporarily set the cap to 2 to test, then restore to 20)
- [ ] Second user account sees NONE of user 1's data (rooms, makeovers, storage)
- [ ] Refresh mid-loading on /result → resumes polling correctly
- [ ] Empty gallery, failed generation, and not-found concept states all render

### 3. Bug and gap log (playbook Step 11.2)
| # | Issue | Where | Fix prompt used | Fixed? |
|---|-------|-------|-----------------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

Cycle: run scenario → log issues → targeted Bolt prompts to fix → retest. Re-run the FULL scenario after each fix batch (fixes regress things).

### 4. Demo insurance (PRD risk: slow/failed AI during live demo)
- Create a dedicated demo account (`demo@...` + memorable password).
- Pre-generate a full gallery: living room in Japandi + Industrial + Scandinavian, bedroom in Boho — so the shootout and gallery look rich even if live generation hiccups.
- Rehearse the fallback: if live generation exceeds ~40 s during the demo, switch to the pre-generated gallery while narrating.

### 5. Demo script (3–5 min, from PRD §13)
1. **Problem:** "RoomReimagine is for homeowners and renters who can't picture how a new style would look in their own room."
2. **Built:** "In 3 days: upload your room, pick a style, and AI shows you your room — restyled."
3. **Live:** sign in → upload → Japandi → generate → **slider wow moment** → save → Industrial → shootout grid.
4. **Close:** "Next: shoppable furniture links — every concept becomes a purchase list."

### 6. Loom recording (2–3 min)
- Record on the production URL, demo account, pre-warmed (one generation already run so caches are hot).
- Structure: 20 s problem → 90 s live flow → 20 s shootout → 10 s close. Re-record until it's clean; nobody watches take one.

### 7. Pitch deck & submission
- Copy `AIAP _ Pitch Deck Template.pptx` → `docs/RoomReimagine-Pitch-Deck.pptx`; fill: problem, solution, demo screenshots (before/after pairs are the money slides), stack diagram (Bolt + Supabase + AI API), next steps.
- Submit via the **AI Accelerator Hackathon Portal** only (WhatsApp/email submissions are invalid per playbook): live URL + Loom + deck + team details. Double-check every field before submitting — it's used for evaluation.

## Acceptance Criteria
- [ ] Scenario passes twice in a row on desktop + phone
- [ ] Zero open blocker bugs in the log
- [ ] Demo account with pre-generated backup gallery ready
- [ ] Loom recorded on production URL and reviewed by a teammate
- [ ] Deck done; submission completed through the portal before the deadline
