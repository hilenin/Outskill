# Execution Prompts — Day 1 / Dev C: Auth & App Shell

**Executes:** `PRD-Day1-DevC-Auth-and-Shell.md` (plan 03)
**Guidelines applied:** Bolt official prompting rules — one feature per prompt · exact component/route names · Discussion mode for planning (≈90% cheaper) · `.bolt/prompt` file for persistent team conventions (THE consistency lever) · rollback instead of "fix it" loops · paste exact errors.
**How to use:** P0 first (it shapes every later prompt any developer sends). Then P1→P5 in order, verifying each in the Bolt preview before the next.

---

## P0 — Create the `.bolt/prompt` file (do this before any build prompt)

In the Bolt project, create `.bolt/prompt` with exactly this content. Every future prompt from ANY developer inherits these rules — this is how three people get consistent output:

```
This project is "RoomReimagine", an AI interior makeover web app.

Stack (fixed): React + Vite + Tailwind + Supabase (Auth, Postgres,
Storage, Edge Functions). Never introduce another backend, database,
CSS framework, or state library.

Hard rules:
- All data access goes through the Supabase JS client and respects RLS.
  Never use or ask for the service_role key in front-end code.
- Storage buckets are PRIVATE. Always display images via
  createSignedUrl / createSignedUrls, never public URLs.
- Storage paths: room-photos/{user_id}/{room_id}.jpg and
  makeovers/{user_id}/{makeover_id}.png. Do not invent other paths.
- Routes (fixed): /signin, /new-makeover, /result/:makeoverId,
  /gallery, /concept/:makeoverId. All except /signin require auth.
- makeovers.status is written ONLY by the Edge Function; the front end
  only reads it.
- Reuse shared components: PrimaryButton, SecondaryButton, Toast,
  Spinner, CompareSlider. Never create duplicates of these.
- Design: warm neutral palette, rounded-2xl cards, generous spacing,
  mobile-first (must work at 375px). Every error state shows a friendly
  message with a retry or CTA — no dead ends, no raw error strings.
```

✅ Verify: file exists; next prompt's output follows the palette/rules without restating them.

## P1 — Plan in Discussion mode (no code, cheap tokens)

Switch Bolt to Discussion mode, paste:

```
Before building: this app needs email/password auth with Supabase,
5 routes (/signin, /new-makeover, /result/:makeoverId, /gallery,
/concept/:makeoverId), a route guard, and an app shell with header nav.
List the components and files you would create, and where session state
will live. Do not write code yet.
```

✅ Verify: the plan is sane (guard wraps routes, session in a context/provider). Adjust here — it's 10× cheaper than fixing built code.

## P2 — Auth screens (Build mode — one feature)

```
Build the /signin route: a single AuthPage component with Sign In and
Sign Up tabs using Supabase Auth email/password. Include: field
validation with inline errors, loading state on submit, friendly
messages for wrong-password and email-already-registered, and a link
switching between the tabs. On success redirect to /new-makeover.
Do not build any other screens yet.
```

✅ Verify: sign up creates a user in the Auth dashboard AND a `profiles` row (Dev B's trigger). Wrong password → friendly inline error.

## P3 — Session + route guards (one feature)

```
Add session handling: restore the Supabase session on app load before
rendering routes (show Spinner while restoring), subscribe to
onAuthStateChange, and add a RequireAuth guard so /new-makeover,
/result/:makeoverId, /gallery and /concept/:makeoverId redirect
unauthenticated visitors to /signin, remembering the intended route and
returning there after login. /signin redirects signed-in users to
/new-makeover. Register all five routes now with simple placeholder
pages titled with the route name.
```

✅ Verify: refresh keeps you signed in; deep-link to /gallery signed-out bounces to /signin then back after login.

## P4 — App shell (one feature)

```
Build the app shell around all authed routes: header with the
RoomReimagine wordmark, nav links "New Makeover" and "Gallery"
(active-state styling), and a sign-out button that clears the session
and redirects to /signin. On screens under 640px collapse nav into a
thumb-friendly bottom bar. Apply the shell to the placeholder pages.
```

✅ Verify: usable one-handed on a phone at 375 px; sign-out works from every page.

## P5 — Shared components (one feature)

```
Create the shared UI kit used by all future screens: PrimaryButton and
SecondaryButton (loading + disabled states), Toast (success and error
variants, auto-dismiss, callable from anywhere), and Spinner. Replace
any ad-hoc buttons/spinners created so far with these. Show a demo of
each on a temporary /dev-kit route I can delete later.
```

✅ Verify: /dev-kit renders all states; AuthPage now uses the kit.

## Fix protocol (all day)
- Something visually off → screenshot it into Bolt with one specific ask.
- Error → paste the EXACT message: "When I <action>, I get this error: <paste>. Fix only this."
- Two failed fix attempts → **roll back** to the last good state and re-prompt smaller. Never chain "still broken, try again".
