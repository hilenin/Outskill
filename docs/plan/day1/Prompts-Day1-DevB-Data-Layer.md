# Execution Prompts — Day 1 / Dev B: Data Layer

**Executes:** `PRD-Day1-DevB-Data-Layer.md` (plan 02)
**Guidelines applied:** Supabase official AI prompts — `database-rls-policies.md` conventions (separate policy per operation, `auth.uid()` ownership checks, policies on `storage.objects` for buckets) and `database-create-migration.md` (SQL kept as ordered migration files in the repo).
**How to use:** the migration SQL already exists in `../02-Database-Schema-Storage-RLS.md` — run it as written. The prompts below are for verification, gap-fixing, and regenerating pieces consistently if you must deviate.

---

## P1 — Apply the schema (Supabase SQL Editor)

Run plan 02 §1–§3 SQL blocks in order: tables → signup trigger → RLS policies. Then create private buckets `room-photos` and `makeovers` (Dashboard → Storage) and run the §4 storage policies.

✅ Verify: three tables in Table Editor; both buckets show "private".

## P2 — RLS review prompt (Claude / your LLM) — run BEFORE the 2 PM hand-off

```
You are a Supabase security reviewer. Below are my tables and RLS
policies. Review them against Supabase's RLS best practices:
- RLS enabled on every public table
- a separate policy per operation (select / insert / delete), no
  overly-broad FOR ALL policies
- ownership checks use auth.uid() = user_id
- INSERT policies use WITH CHECK, SELECT/DELETE use USING
- no user UPDATE policy on makeovers (only the service role, which
  bypasses RLS, may change status/generated_image_url)
- storage.objects policies restrict each bucket to the caller's own
  folder via (storage.foldername(name))[1] = auth.uid()::text

Report: (1) any table/bucket left unprotected, (2) any policy that lets
user A touch user B's rows or files, (3) missing WITH CHECK clauses.
Do not rewrite anything that is already correct.

<paste the full SQL you actually ran>
```

✅ Verify: reviewer finds no gaps (or you fix + rerun until clean).

## P3 — Two-user proof (SQL Editor + a second browser)

Create two test users (sign-up screen if Dev C is ready, else Auth dashboard). As user B in an incognito session, attempt:
1. `select * from rooms` → only B's rows (zero if none)
2. Insert a makeover with `user_id = <userA-id>` → must FAIL
3. Upload to `room-photos/<userA-id>/x.jpg` via the JS client → must FAIL

✅ Verify: all three isolation checks pass. Screenshot results for the standup.

## P4 — Gap-fix prompt template (only if P2/P3 found holes)

```
My Supabase RLS test failed: <exact failing check, e.g. "user B could
insert a makeovers row with user A's user_id">. Current policy SQL for
that table: <paste>. Write ONLY the corrective SQL (drop + recreate the
specific policy), following the same naming style as my existing
policies. Do not touch other policies.
```

(One fix per prompt — never "fix all my policies".)

## P5 — Publish the contracts (team notes / repo README)

Post to the team channel, verbatim from plan 02:
- Path convention: `room-photos/{user_id}/{room_id}.jpg` · `makeovers/{user_id}/{makeover_id}.png`
- The 8-style constants table (slug / name / prompt fragment) from plan 02 §5

✅ Verify: Dev A confirms the Edge Function reads the same paths; Dev C confirms the style slugs.

## P6 — Commit as migration (terminal, or hand SQL to Code Owner)

```bash
supabase migration new init_schema   # paste the applied SQL into the generated file
git add supabase/migrations && git commit -m "Add initial schema, RLS, storage policies"
```

✅ Verify: migration file in repo matches what's live (this is the Supabase-recommended way to keep SQL reproducible).

## While waiting on Dev A (morning idle time)
Collect assets — no prompts needed: 3–4 well-lit wide-angle room photos + 8 style thumbnails (unsplash.com / pexels.com). Drop into a shared folder named by style slug (e.g., `japandi.jpg`) so Day 2's style cards wire up without renaming.
