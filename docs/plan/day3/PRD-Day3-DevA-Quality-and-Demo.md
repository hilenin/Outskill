# Mini-PRD — Day 3 / Dev A: Quality Gate & Demo Delivery

**Developer:** Dev A (QA / demo lead — you didn't build the UI, so you test it honestly)
**Parent PRD:** `docs/PRD-AI-Interior-Makeover.md` — this PRD concentrates on:
- **§3 Success Metrics** — the bar you enforce: first-time user, full flow, <2 min, no getting stuck, twice in a row
- **§6 Error / edge flows** — every one of them must actually render
- **§11 Risks** — Risk #2 (generation too slow for live demo) — the backup-gallery mitigation is yours
- **§13 Demo Script** — you deliver it
- **§12 Day 3** of the build plan — hardening, scenario testing, Loom, deck, submission

**Implementation plan:** `../09-Testing-Hardening-Demo-Prep.md` (all of it)
**Work schedule:** `Day3-Work-Split.md` (Dev A column)

---

## Goal (your slice of the product)

By end of Day 3, the product provably meets the parent PRD's success metric, the demo cannot fail even if the AI has a bad minute, and the project is submitted through the portal with a clean Loom and deck.

## Why this matters to the product

A product that works "usually" fails a live demo eventually. §3's "twice in a row" bar and §11's demo-insurance are the difference between shipping and apologizing. You also hold the day's most important power: the **stability gate** — Dev C may not start Should-haves until you've certified two clean consecutive runs.

## Requirements (your acceptance scope)

### R1 — Certify the success metric (§3)
- Run the full scenario (plan 09 §1: fresh account → upload → Japandi + notes → generate → slider → save → gallery → second style → delete) on the PRODUCTION URL, desktop AND a real phone. Pass = twice in a row, no workarounds.
- Call the gate at ~10 AM: pass → Dev C starts plan 08; fail → Dev C joins bug-fixing.

### R2 — Every edge flow renders (§6)
- Bad file types, network drop mid-generation, refresh mid-loading, second-user isolation, empty gallery, failed generation, not-found concept, daily-limit message (temporarily set the cap to 2 to test it; restore to 20).
- Log everything in the bug table; hand fixes to B/C as targeted Bolt prompts; re-run the FULL scenario after each fix batch.

### R3 — Demo insurance (§11 Risk #2)
- Demo account with pre-generated gallery: living room in Japandi + Industrial + Scandinavian, bedroom in Boho.
- Rehearsed fallback: live generation >40 s → pivot to the pre-generated gallery while narrating.

### R4 — Deliverables (§13 + playbook submission rules)
- 2–3 min Loom on production URL, pre-warmed, teammate-reviewed: 20 s problem → 90 s flow → 20 s shootout → 10 s close.
- Coordinate Dev C's deck; submit via the AI Accelerator Hackathon Portal ONLY; all fields double-checked.

## Out of scope for you today
- Writing feature code (B and C fix; you find and verify)
- Should-haves themselves (Dev C — you only gate and then re-test them)

## Definition of Done (Day 3)
- [ ] Scenario certified twice in a row, phone + desktop, zero blocker bugs
- [ ] All §6 edge flows verified rendering; bug log closed or consciously waived
- [ ] Demo account + backup gallery ready; fallback rehearsed
- [ ] Loom recorded and reviewed; submission confirmed before deadline
