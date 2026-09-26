# Execution Prompts — Day 3 / Dev A: Quality Gate & Demo Delivery

**Executes:** `PRD-Day3-DevA-Quality-and-Demo.md` (plan 09)
**Guidelines applied:** playbook Step 11 loop (test → log → targeted fix prompt → retest) · Bolt fix rules (exact errors, one issue per prompt — you WRITE the fix prompts, B and C run them) · exact-scenario scripting so results are reproducible.
**How to use:** P1 is your morning loop. P2 templates are what you hand to B/C for every bug. P3–P5 are afternoon demo assets.

---

## P1 — The certification scenario (run on the PRODUCTION URL, desktop + real phone)

Execute verbatim, twice in a row, fresh account each morning run:

```
1. Sign up new account → lands on /new-makeover
2. Upload living-room photo (from the demo photo set)
3. Pick Japandi, notes: "keep the sofa" → Generate
4. Loading treatment plays (no blank spinner) → slider appears ≤60s
5. Drag slider, toggle Before/After → Save → lands on /gallery, card visible
6. Open the card → /concept view → slider works
7. Try Another Style → photo pre-loaded, no re-upload → Industrial → Generate
8. Both concepts visible for the room (shootout if Dev C shipped it)
9. Delete the Industrial concept → confirm → gone, no refresh needed
10. Sign out → sign back in → gallery intact
```

Rule: any step needing a workaround = FAIL → bug log → fix → restart from step 1. Announce the 10 AM gate result (pass = Dev C starts differentiators).

## P2 — Bug-log fix-prompt templates (hand these to B/C filled in)

**UI/flow bug (for Bolt):**
```
Bug on {route}: when I {exact action}, {exact wrong behavior} instead
of {expected behavior per the scenario step N}. Console/network shows:
{paste exact error, or "no error"}. Fix only this issue; do not change
other screens or shared components.
```

**Edge Function bug (for Dev A yourself / LLM):**
```
generate-makeover misbehaved: request {paste curl/body}, expected
{expected}, got {actual}. Function logs: {paste supabase functions logs
lines}. Current index.ts: {paste}. Fix only the failing path; keep the
contract and the never-stuck-pending guarantee unchanged.
```

Log every issue in plan 09 §3's table (issue / where / prompt used / fixed). Re-run the FULL P1 scenario after each fix batch.

## P3 — Edge-case sweep checklist (after two clean P1 runs)

Work through plan 09 §2's list; two need setup:
- **Daily limit:** ask Dev A-hat (you) to set the cap to 2, verify the friendly 429 message on the 3rd generation, RESTORE to 20, redeploy.
- **Isolation:** second account in incognito — gallery empty, foreign /concept/:id URL → "not found".

## P4 — Demo insurance (early afternoon)

1. Create `demo@roomreimagine.test` (memorable password, share with team).
2. Pre-generate the backup gallery: living room × Japandi, Industrial, Scandinavian; bedroom × Bohemian.
3. Rehearse the pivot line for slow live generation (>40 s): *"While the AI keeps working on this one, let me show you concepts it created earlier…"* → switch to gallery.

## P5 — Loom script (record on production URL, demo account, pre-warmed)

```
[0:00-0:20] Problem: "RoomReimagine is for homeowners and renters who
can't picture how a new style would look in their own room. Designers
are expensive; Pinterest shows other people's rooms."
[0:20-1:50] Live flow: sign in → upload living room → Japandi →
generate → THE SLIDER (linger here, drag it slowly) → save → gallery.
[1:50-2:20] Differentiator: Try Another Style → Industrial → shootout
grid: "Same room — two futures."
[2:20-2:40] Close: stack (Bolt + Supabase + Gemini, built in 3 days) +
"Next: shoppable furniture links."
```

Teammate reviews the take before you accept it. Then: deck hand-off check with Dev C, submit via the portal (only valid channel), verify every field, screenshot the confirmation.

## End-of-day
Fill playbook Step 12.2 reflection while it's fresh; final GitHub commit via Code Owner.
