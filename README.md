# RoomReimagine — AI Interior Makeover

Upload a photo of your room, pick an interior design style, and see an AI-restyled version of **your own room**. Compare it with the original using a before/after slider, and keep the concepts you like in a personal gallery.

Built as a 3-day hackathon MVP. The full product spec lives in [`docs/PRD-AI-Interior-Makeover.md`](docs/PRD-AI-Interior-Makeover.md).

---

## Features

**Must-have (MVP)**

- **Email auth** — sign up, sign in, and password reset via Supabase Auth.
- **Room photo upload** — JPG/PNG up to 10 MB, previewed before generating, downscaled in the browser to 1024 px (longest edge) before upload.
- **Style selector** — 8 presets: Scandinavian, Modern Minimalist, Industrial, Bohemian, Japandi, Mid-Century Modern, Coastal, Rustic.
- **AI makeover generation** — room photo + style prompt sent to Google Gemini 2.5 Flash Image through an n8n workflow. Layout, walls, windows and camera angle are preserved; furniture, decor, materials and lighting are restyled.
- **Before/After compare** — draggable comparison slider.
- **Personal gallery** — list, open and delete saved concepts. Empty-state and "no makeover yet" placeholders included.

**Should-have**

- **Style shootout** — generate several styles for the same room and compare them in a grid.
- **Custom style notes** — free text appended to the prompt (for example, "keep the sofa, add plants"), capped at 200 characters.
- **Budget** — the dollar amount the user wants the makeover to stay within, sent to n8n as `cost_limit`. Defaults to $500, which is also the minimum; whole dollars from $500 to $100,000.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Front end | React 18, TypeScript, Vite 5, React Router 6 |
| Styling | Tailwind CSS 3 (custom warm "editorial" design tokens), lucide-react icons |
| Auth / DB / Storage | Supabase (Postgres + Row Level Security, private Storage buckets) |
| AI generation | n8n workflow calling Google Gemini 2.5 Flash Image |
| Hosting | Netlify or Vercel (SPA rewrites configured for both) |
| Scaffolding | Initially generated with [Bolt](https://bolt.new) (see `.bolt/prompt`) |

---

## Architecture

```
[React SPA]  ── auth, CRUD, photo upload (anon key + RLS) ──►  [Supabase]
     │                                                          ├── Auth (email/password)
     │                                                          ├── Postgres: profiles, rooms, makeovers
     │                                                          └── Storage: room-photos/, makeovers/ (private)
     │
     └── POST generation request ──►  [n8n "generate-makeover" workflow]
                                          │  downloads photo, builds prompt
                                          ▼
                                   [Gemini 2.5 Flash Image]
                                          │  restyled image
                                          ▼
                     n8n uploads result to Storage + writes the makeovers row
                                          │
[Result screen] ◄── polls makeovers until status = complete / failed
```

**Key decision:** the AI call happens server-side in n8n, never in the browser. The Gemini key and the Supabase `service_role` key live only in n8n credentials. The front end only ever uses the Supabase **anon** key.

> n8n replaced the originally planned Supabase Edge Function. See [`docs/plan/05B-n8n-AI-Generation-Workflow.md`](docs/plan/05B-n8n-AI-Generation-Workflow.md), which supersedes plan 05.

### Data model

| Table | Key columns |
|-------|-------------|
| `profiles` | `id` (= `auth.users.id`), `email`, `created_at` — created by the `handle_new_user` signup trigger |
| `rooms` | `id`, `user_id`, `original_image_url` (storage path), `room_type`, `created_at` |
| `makeovers` | `id`, `room_id`, `user_id`, `style`, `custom_notes`, `generated_image_url`, `status` (`pending` / `complete` / `failed`), `error_reason`, `created_at` |

**Storage paths:** `room-photos/{user_id}/{room_id}.jpg` and `makeovers/{user_id}/{makeover_id}.png`. Both buckets are private; images are displayed via short-lived signed URLs.

RLS restricts every row and storage folder to its owner. Full SQL is in [`docs/plan/02-Database-Schema-Storage-RLS.md`](docs/plan/02-Database-Schema-Storage-RLS.md).

### Generation contract (as implemented)

The current front end (`src/services/roomService.ts`) calls the team's n8n webhook with:

```json
POST <VITE_N8N_WEBHOOK_URL>
Content-Type: application/json
X-API-Key: <VITE_N8N_API_KEY>

{ "user_id": "...", "room_id": "...", "style": "Japandi", "custom_notes": "...", "cost_limit": <budget in USD>, "image_url": "<signed URL>" }
```

The workflow inserts its own `makeovers` row. If the response contains a `makeover_id`, the Result screen polls that row directly. Otherwise it polls for a new completed concept on that room.

> This differs from the "frozen" contract in plan 05B, where the front end inserts a `pending` row and sends only `{ makeover_id }` with the user's JWT. Keep the code and the n8n workflow in sync if either side changes.

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- A Supabase project with the plan 02 schema, RLS and buckets applied
- An active n8n `generate-makeover` workflow with Gemini and Supabase credentials

See [`docs/RequiredSoftware/Tools-and-Accounts-Checklist.md`](docs/RequiredSoftware/Tools-and-Accounts-Checklist.md) for every account and key you need.

### Setup

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:5173
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key. Safe for the browser because RLS protects the data. |
| `VITE_N8N_WEBHOOK_URL` | Production webhook URL of the n8n `generate-makeover` workflow |
| `VITE_N8N_API_KEY` | Shared key sent as the `X-API-Key` header. Get it from the n8n team. Note that it ends up in the public JS bundle. |

> ⚠️ **Never** put the Supabase `service_role` key or the Gemini API key in `.env` or anywhere in the front end.

The app throws on startup if the Supabase variables are missing.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with `tsc` |

---

## Project Structure

```
src/
├── App.tsx                 # Routes; signed-out vs signed-in route trees
├── main.tsx                # Entry point
├── index.css               # Tailwind + global styles
├── lib/supabase.ts         # The single shared Supabase client
├── services/
│   ├── authService.ts      # Sign in/up/out, session, password reset
│   ├── roomService.ts      # Rooms, makeovers, uploads, generation, polling (Supabase + n8n)
│   └── mockService.ts      # Original mock implementation (same interface)
├── data/mockData.ts        # DESIGN_STYLES (the 8 presets) + mock fixtures
├── types/index.ts          # Shared TypeScript types
├── components/
│   ├── layout/             # Header, BottomNav (mobile), Layout
│   ├── gallery/            # GalleryCard
│   └── ui/                 # Buttons, CompareSlider, ConfirmDialog, EmptyState, Spinner, StyleBadge, Toast
└── screens/                # SignIn, ResetPassword, NewMakeover, Result, Gallery,
                            # GalleryEmpty, ConceptDetail, Dev
```

**Service layer:** components only talk to `authService` and `roomService`. The mock service has the same interface, so the backend can be swapped without touching screens.

### Routes

| Path | Screen |
|------|--------|
| `/signin` | Sign in / sign up |
| `/reset-password` | Password reset |
| `/new-makeover` | Upload photo, choose style, add notes, generate |
| `/result/:id` | Generation progress, before/after compare, retry |
| `/gallery` | Saved rooms and concepts (default after sign-in) |
| `/concept/:id` | Concept detail, compare, delete, try another style |
| `/dev`, `/dev/gallery-empty` | Developer shortcuts for previewing UI states |

---

## Sample Data

[`docs/sample-data/`](docs/sample-data/README.md) contains room photos and a seeder that uploads them to Storage and creates matching `rooms` / `makeovers` rows. The seeded data covers completed concepts, a style shootout, a failed makeover and a pending makeover.

```bash
cd docs/sample-data
npm install
SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service_role key, terminal only> \
node upload-sample-data.js you@example.com
```

The seeder is safe to re-run. Read its README first for corporate-network TLS workarounds and other gotchas.

---

## Deployment

Both `netlify.toml` and `vercel.json` are included. Each builds with `npm run build`, publishes `dist/`, and rewrites all paths to `index.html` so deep links like `/result/:id` survive a refresh.

Set the three `VITE_*` environment variables in the hosting dashboard. Add the deployed URL to Supabase Auth's redirect URLs so password-reset links work.

---

## Implementation Plan & Docs

All planning material is in [`docs/`](docs/).

| Document | Contents |
|----------|----------|
| [`PRD-AI-Interior-Makeover.md`](docs/PRD-AI-Interior-Makeover.md) | Product requirements, scope, data model, risks, demo script |
| [`plan/00-High-Level-Implementation-Plan.md`](docs/plan/00-High-Level-Implementation-Plan.md) | Dependency map and work-package overview |
| `plan/01` – `plan/09` | One self-contained work package per file (setup, schema, auth, upload, generation, result, gallery, should-haves, testing) |
| [`plan/05B-n8n-AI-Generation-Workflow.md`](docs/plan/05B-n8n-AI-Generation-Workflow.md) | n8n workflow, node by node (supersedes plan 05) |
| `plan/Bolt-*.md` | Bolt design prompt and wiring prompts |
| `plan/day1` – `plan/day3` | Per-day work split, per-developer PRDs and prompts for a 3-person team |
| `RequiredSoftware/` | Tools and accounts checklist, skills research |

### Work packages

| # | Package | Depends on |
|---|---------|------------|
| 01 | Project setup and Supabase foundation | — |
| 02 | Database schema, storage and RLS | 01 |
| 03 | Auth and app shell | 01 |
| 04 | Photo upload and style selector | 02, 03 |
| 05B | n8n AI generation workflow | 02 |
| 06 | Result screen and before/after compare | 04, 05B |
| 07 | Gallery and concept detail | 02, 03 |
| 08 | Style shootout and custom notes | 05B, 06, 07 |
| 09 | Testing, hardening and demo prep | all |

**Critical path:** 01 → 02 → 05B → 06 → 09.

### Definition of done (MVP)

A first-time user can sign in, upload a room photo, pick a style, generate a concept of their own room, compare before/after, save it, and find it again in the gallery. They can do this twice in a row, on mobile and desktop, in under 2 minutes.

---

## Guardrails

- Images are downscaled to 1024 px before any AI call, for cost and speed.
- Generation times out at about 55 seconds with one retry.
- Soft limit of about 20 generations per user per day. Hitting it sets `error_reason = 'daily_limit'`.
- Every failure leaves the app recoverable. The photo and chosen style are kept, and a Retry button is shown.
- Photos are private to their owner through RLS and storage policies.

---

## Out of Scope (MVP)

Shopping links, region-select editing, native apps, collaboration or social features, payments, and AR/3D scanning. See the PRD roadmap for what comes next.
