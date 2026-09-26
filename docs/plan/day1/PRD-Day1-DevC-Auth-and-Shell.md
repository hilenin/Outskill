# Mini-PRD — Day 1 / Dev C: Auth & App Shell

**Developer:** Dev C (frontend lead)
**Parent PRD:** `docs/PRD-AI-Interior-Makeover.md` — this PRD concentrates on:
- **§5.1 M1** — Email auth (sign up / sign in via Supabase Auth)
- **§6 Flow 1, step 1** — "User lands on the app → signs up / signs in"
- **§9 Non-Functional Requirements** — "Responsive: works on mobile and desktop browsers"
- **§4 Target Users** — casual at-home users on phones; friction kills the 'what if?' exploration mood

**Implementation plan:** `../03-Auth-and-App-Shell.md` (all of it)
**Work schedule:** `Day1-Work-Split.md` (Dev C column)

---

## Goal (your slice of the product)

By end of Day 1, a user can create an account, sign in and out reliably on phone and desktop, and every screen the product will ever have already exists as a guarded route inside a clean app shell. Days 2–3 are then purely about filling screens in — never about plumbing.

## Why this matters to the product

The parent PRD's demo bar (§3) is a first-time user completing the flow *in under 2 minutes without getting stuck*. Auth is step zero of that clock — a confusing error message or a broken redirect burns the budget before the product even starts. And because the gallery is personal (M6), identity isn't optional plumbing; it IS the feature that makes saving meaningful.

## Requirements (your acceptance scope)

### R1 — Auth flow (M1, Flow 1 step 1)
- Email/password sign up and sign in via Supabase Auth; email confirmation disabled (hackathon).
- Friendly inline errors (wrong password, existing account) — never a raw error string or crash (§6 edge-flow spirit).
- Session survives refresh; sign out clears it and returns to Sign In.

### R2 — Route skeleton (the whole product's floor plan)
All five routes registered with auth guards and placeholder pages:
`/signin` `/new-makeover` `/result/:makeoverId` `/gallery` `/concept/:makeoverId`
- Signed out + any app route → redirected to Sign In, then back to the intended page after login.

### R3 — App shell (§9 Responsive)
- Header with app name, nav (New Makeover / Gallery), sign out; thumb-friendly on mobile (375 px tested).
- Warm neutral palette, clean modern look (per playbook starting prompt).

### R4 — Shared components (you build once, B and A's screens reuse)
- Primary/secondary buttons, toast/notification, loading spinner — documented so Day 2/3 screens stay visually consistent.

## Out of scope for you today
- Upload/style screens (Day 2 — Dev B's PRD)
- Result screen and slider (your Day 2 PRD)
- Anything backend (Devs A & B)

## Definition of Done (Day 1)
- [ ] Sign up → out → in works twice in a row on phone AND desktop
- [ ] Sign up visibly creates a `profiles` row (integration check with Dev B's trigger)
- [ ] All 5 guarded routes render placeholders; deep-link redirect works
- [ ] Shared components in place; shell committed to GitHub
