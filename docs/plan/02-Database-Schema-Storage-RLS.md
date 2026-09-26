# 02 — Database Schema, Storage & RLS

**Owner:** 1 person (data/backend)
**Depends on:** 01 (Supabase project exists)
**Estimated effort:** 2–3 hours (Day 1)
**Deliverable:** All tables, storage buckets, RLS policies, and the signup trigger live in Supabase. This package defines the **data contract** every other package builds against — finish it early and announce any change loudly.

---

## Tools Needed

| Tool | Purpose |
|------|---------|
| Supabase Dashboard → SQL Editor | Run the migration SQL below |
| Supabase Dashboard → Storage | Verify buckets & policies |
| Supabase Dashboard → Table Editor | Sanity-check rows during testing |
| (Optional) Supabase CLI | Keep the SQL as a migration file in the repo: `supabase migration new init_schema` |

## Tasks

### 1. Create tables
Run in SQL Editor:

```sql
-- profiles: mirrors auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

-- rooms: original uploaded photos
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  original_image_url text not null,
  room_type text,                     -- nullable; Could-have
  created_at timestamptz not null default now()
);

-- makeovers: generated concepts
create table public.makeovers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  style text not null,                -- slug: 'scandinavian', 'japandi', ...
  custom_notes text,                  -- Should-have S2
  generated_image_url text,           -- null while pending
  status text not null default 'pending'
    check (status in ('pending','complete','failed')),
  created_at timestamptz not null default now()
);

create index makeovers_user_created_idx on public.makeovers (user_id, created_at desc);
create index makeovers_room_idx on public.makeovers (room_id);
```

### 2. Auto-create profile on signup

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 3. Row Level Security

```sql
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.makeovers enable row level security;

create policy "own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "own rooms select" on public.rooms for select using (auth.uid() = user_id);
create policy "own rooms insert" on public.rooms for insert with check (auth.uid() = user_id);
create policy "own rooms delete" on public.rooms for delete using (auth.uid() = user_id);

create policy "own makeovers select" on public.makeovers for select using (auth.uid() = user_id);
create policy "own makeovers insert" on public.makeovers for insert with check (auth.uid() = user_id);
create policy "own makeovers delete" on public.makeovers for delete using (auth.uid() = user_id);
-- No user UPDATE policy on makeovers: status/generated_image_url are written by the
-- Edge Function using the service_role key, which bypasses RLS.
```

### 4. Storage buckets & policies
Create two **private** buckets — either in Dashboard → Storage → New bucket, or run this in the SQL Editor:

```sql
insert into storage.buckets (id, name, public)
values
  ('room-photos', 'room-photos', false),
  ('makeovers', 'makeovers', false)
on conflict (id) do nothing;
```

Path convention (contract — do not change without telling plans 04/05/06/07):
- `room-photos/{user_id}/{room_id}.jpg`
- `makeovers/{user_id}/{makeover_id}.png`

Policies (SQL Editor):

```sql
create policy "own room photos read" on storage.objects for select
  using (bucket_id = 'room-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own room photos write" on storage.objects for insert
  with check (bucket_id = 'room-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own room photos delete" on storage.objects for delete
  using (bucket_id = 'room-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "own makeovers read" on storage.objects for select
  using (bucket_id = 'makeovers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own makeovers delete" on storage.objects for delete
  using (bucket_id = 'makeovers' and (storage.foldername(name))[1] = auth.uid()::text);
-- Inserts into 'makeovers' bucket come from the Edge Function (service_role), no user policy needed.
```

### 5. Style constants (client-side, no table needed for MVP)
Publish this list to the team (plan 04 renders it, plan 05 maps slug → prompt):

| slug | name | prompt fragment |
|------|------|-----------------|
| scandinavian | Scandinavian | light woods, white walls, cozy textiles, functional minimalism |
| modern-minimalist | Modern Minimalist | clean lines, neutral palette, clutter-free, statement lighting |
| industrial | Industrial | exposed brick, metal accents, dark tones, raw materials |
| bohemian | Bohemian | layered textiles, plants, warm earthy colors, eclectic decor |
| japandi | Japandi | japanese-scandinavian fusion, low furniture, natural materials, zen calm |
| mid-century-modern | Mid-Century Modern | teak wood, organic curves, retro accents, bold accent colors |
| coastal | Coastal | light blues, whites, natural fibers, airy beach-house feel |
| rustic | Rustic | reclaimed wood, warm textures, farmhouse charm, stone accents |

## Test Checklist (use SQL Editor + a test user)
- [ ] Signing up a test user auto-creates a `profiles` row
- [ ] Test user can insert/select/delete own `rooms` and `makeovers` rows; cannot see another user's rows
- [ ] Test user can upload to `room-photos/{their_uid}/...` but NOT to another user's folder
- [ ] `makeovers.status` rejects values outside pending/complete/failed
- [ ] Deleting a room cascades its makeovers

## Acceptance Criteria
- [ ] All SQL applied without errors; tables visible in Table Editor
- [ ] RLS verified with two different test users
- [ ] Buckets exist, private, with per-user folder policies
- [ ] Style constants shared with plans 04 and 05
- [ ] SQL saved in repo (e.g., `supabase/migrations/`) via Code Owner
