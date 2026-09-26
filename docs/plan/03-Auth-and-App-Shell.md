# 03 — Auth & App Shell (Bolt)

**Owner:** 1 person (frontend)
**Depends on:** 01 (Bolt project + Supabase connection)
**Estimated effort:** 2–3 hours (Day 1 afternoon → Day 2 morning)
**Deliverable:** Working sign up / sign in / sign out, protected routing, and the app layout shell that plans 04, 06, 07 plug their screens into.

---

## Tools Needed

| Tool | Purpose |
|------|---------|
| Bolt (bolt.new) | Build screens via prompts; project from plan 01 |
| Supabase Auth (email/password) | Session management via `@supabase/supabase-js` (Bolt's integration wires this) |
| Supabase Dashboard → Authentication | Disable email confirmations for hackathon speed (Auth → Providers → Email → turn off "Confirm email") |
| Browser devtools (mobile emulation) | Verify responsive layout |

## Tasks

### 1. Configure Supabase Auth
- In Supabase Dashboard → Authentication → Providers → Email: enable email/password, **disable email confirmation** (avoids demo-day inbox friction).
- Add the Bolt preview URL + production URL to Auth → URL Configuration → allowed redirect URLs.

### 2. Build auth screens (Bolt prompt)
Suggested prompt:
> "Create Sign In and Sign Up screens using Supabase Auth (email + password). Include: form validation with inline errors, loading state on submit, friendly error messages (wrong password, user exists), and a link to switch between sign in/sign up. After auth, redirect to /new-makeover. Add a sign-out button in the app header."

### 3. Session handling & protected routes
- Persist session with `supabase.auth.onAuthStateChange`; on app load, restore session before rendering.
- Route guard: unauthenticated users hitting any app route are redirected to Sign In; authenticated users hitting Sign In are redirected to New Makeover.
- Routes to register now (screens filled in by later plans):
  - `/signin`, `/signup`
  - `/new-makeover` (plan 04)
  - `/result/:makeoverId` (plan 06)
  - `/gallery` (plan 07)
  - `/concept/:makeoverId` (plan 07)

### 4. App shell / layout
- Header: app name "RoomReimagine", nav links (New Makeover, Gallery), sign-out.
- Mobile: bottom nav or hamburger — must be thumb-friendly (upload-from-phone is a primary path per PRD §9).
- Global styles: warm neutral palette, clean modern look (Tailwind, which Bolt uses by default).
- Shared UI pieces other plans will reuse — build them here once:
  - Primary/secondary button styles
  - Toast/notification component (used by save/delete/error flows)
  - Loading spinner component

## Test Checklist
- [ ] Sign up creates a user AND a `profiles` row appears (verifies plan 02's trigger)
- [ ] Sign in with wrong password shows a friendly inline error, not a crash
- [ ] Refresh keeps the session; sign out clears it and redirects to Sign In
- [ ] Deep link to `/gallery` while signed out → redirected to Sign In → after login lands on Gallery
- [ ] Layout usable at 375 px wide (iPhone) and desktop

## Acceptance Criteria
- [ ] Full auth loop works twice in a row on mobile + desktop
- [ ] All 5 routes registered with guards; placeholder pages render for not-yet-built screens
- [ ] Shared button/toast/spinner components exist and are documented for the team
- [ ] Code Owner committed the working shell to GitHub

## Hand-off Notes
- Tell plans 04/06/07 the exact route names and how to get the current `user.id` (needed for storage paths and DB inserts).
- Point them to the shared toast/spinner components so UX stays consistent.
