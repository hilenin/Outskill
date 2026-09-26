# Bolt Wiring Prompt 01 — Real Supabase Authentication

**Use after:** the portal was generated from `Bolt-Design-Starting-Prompt.md` (mock data, mock auth).
**Goal:** replace mock auth with real Supabase Auth without changing any visual design.
**Schema contract:** plan `02-Database-Schema-Storage-RLS.md` — signup auto-creates a `profiles` row via trigger; email confirmation is already disabled in the Supabase dashboard.

---

## Before prompting (one-time, in Bolt UI — not a prompt)

1. Connect Supabase: Bolt project → settings/integrations → **Connect to Supabase** → pick your project. Bolt injects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` automatically.
2. Confirm in Supabase dashboard: Authentication → Sign In / Up → Email → "Confirm email" is OFF, and URL Configuration has your deployed URL + `http://localhost:5173/**`.

## The prompt (paste into Bolt, Build mode)

```
Replace the mock authentication with real Supabase Auth. Do not change
any visual design, layout, or component styling — wiring only.

1. Create a single shared Supabase client in src/lib/supabase.ts using
   the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars from the
   Bolt Supabase integration. Every feature must import this one client
   — never create a second client instance.

2. In the auth service layer (currently mocked), implement:
   - signUp(email, password) using supabase.auth.signUp
   - signIn(email, password) using supabase.auth.signInWithPassword
   - signOut() using supabase.auth.signOut
   Map Supabase errors to the existing friendly inline messages:
   "Invalid login credentials" -> "That email or password doesn't look
   right", user-already-exists -> "You already have an account — try
   signing in", anything else -> "Something went wrong, please try
   again."

3. Session handling: on app load, restore the session with
   supabase.auth.getSession() BEFORE rendering routes (show the
   existing Spinner while restoring), and subscribe to
   supabase.auth.onAuthStateChange to keep the signed-in user in app
   state. Store nothing auth-related in localStorage yourself — the
   Supabase client manages persistence.

4. Route guards: /new-makeover, /result/:id, /gallery, /concept/:id
   require a session — redirect signed-out visitors to /signin,
   remember the intended route, and return there after login. A
   signed-in user visiting /signin is redirected to /new-makeover.

5. The Sign In / Sign Up tabs on /signin call the real service: on
   successful sign-up the user is signed in immediately (email
   confirmation is disabled) and redirected. Submit buttons show their
   existing loading state during the call.

6. The avatar menu Sign out (and mobile equivalent) calls signOut()
   and redirects to /signin.

Keep all mock data for makeovers/gallery untouched for now — only auth
becomes real in this change.
```

## Verify (before moving to Wiring Prompt 02)

- [ ] Sign up with a new email → lands on /new-makeover signed in, no confirmation email needed
- [ ] Supabase dashboard: the user appears in Authentication → Users AND a row exists in the `profiles` table (trigger worked)
- [ ] Wrong password → friendly inline error, no crash
- [ ] Refresh the page → still signed in; Sign out → back to /signin
- [ ] Deep-link to /gallery signed out → /signin → sign in → lands on /gallery
- [ ] Test on the deployed URL too, not just the preview pane

## If something breaks
Paste the exact console/network error into Bolt: "When I <action>, I get: <paste>. Fix only this — do not restructure auth." Two failed fixes → roll back and re-prompt smaller.
