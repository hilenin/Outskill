# 00 — High-Level Implementation Plan

**Product:** RoomReimagine — AI Interior Makeover
**Source PRD:** `docs/PRD-AI-Interior-Makeover.md`
**Timeline:** 3-day hackathon build
**Team model:** Each numbered plan below is a self-contained work package sized for **one person**. Packages list their dependencies so parallel work is safe.

---

## 1. Execution Order & Dependency Map

```
01 Project Setup & Supabase Foundation  (blocks everything)
        │
        ├── 02 Database Schema, Storage & RLS   ──┐
        │                                          │
        ├── 03 Auth & App Shell (Bolt)            │
        │        │                                 │
        │        ├── 04 Upload & Style Selector ───┤
        │        │                                 │
        │        │        05 Edge Function: AI Generation  (needs 02)
        │        │                 │
        │        └──── 06 Result Screen & Before/After Compare (needs 04 + 05)
        │                          │
        │              07 Gallery & Concept Detail (needs 02 + 03; full test needs 06)
        │                          │
        │              08 Should-Haves: Style Shootout & Custom Notes (needs 05 + 06 + 07)
        │                          │
        └───────────── 09 Testing, Hardening & Demo Prep (needs all)
```

## 2. Work Packages

| # | Plan file | Scope (one line) | Depends on | Day |
|---|-----------|------------------|------------|-----|
| 01 | `01-Project-Setup-Supabase-Foundation.md` | Accounts, API keys, Bolt project bootstrap, Supabase project, env secrets | — | Day 1 |
| 02 | `02-Database-Schema-Storage-RLS.md` | Postgres tables, storage buckets, RLS policies, signup trigger | 01 | Day 1 |
| 03 | `03-Auth-and-App-Shell.md` | Sign in/up screens, session handling, routing, layout | 01 | Day 1–2 |
| 04 | `04-Photo-Upload-and-Style-Selector.md` | New Makeover screen: upload, preview, client-side downscale, style cards | 02, 03 | Day 2 |
| 05 | `05-Edge-Function-AI-Generation.md` | `generate-makeover` Edge Function calling the AI image-editing API | 02 | Day 2 |
| 06 | `06-Result-Screen-Before-After-Compare.md` | Generation polling, before/after slider, save/retry actions | 04, 05 | Day 2 |
| 07 | `07-Gallery-and-Concept-Detail.md` | Gallery grid, concept detail, delete, empty states | 02, 03 (06 for full test) | Day 2–3 |
| 08 | `08-Should-Haves-Style-Shootout-and-Notes.md` | Multi-style shootout grid + custom style notes | 05, 06, 07 | Day 3 |
| 09 | `09-Testing-Hardening-Demo-Prep.md` | Scenario tests, bug log, backup demo data, Loom, pitch deck | All | Day 3 |

**Team sizing:** With 4 people — P1 takes 01→05 (backend track), P2 takes 03→04, P3 takes 06→08, P4 takes 02→07→09. With 2 people — split backend (01, 02, 05) vs. frontend (03, 04, 06, 07), share 08/09.

## 3. Shared Tooling (used across all packages)

| Tool | Purpose | Where to get it |
|------|---------|-----------------|
| **Bolt** (bolt.new) | Front-end vibe-coding builder (React + Vite + Tailwind) | https://bolt.new — sign in, connect Supabase via built-in integration |
| **Supabase** | Auth, Postgres DB, Storage, Edge Functions | https://supabase.com — free tier is enough |
| **Supabase CLI** | Local dev, deploy Edge Functions, set secrets | `npm i -g supabase` (or `scoop install supabase` on Windows) |
| **AI image-editing API** | Room restyling. Primary: **Google Gemini 2.5 Flash Image** ("Nano Banana") via Google AI Studio API key. Fallbacks: OpenAI Images Edit (`gpt-image-1`), Replicate (e.g., interior-design models) | https://aistudio.google.com / https://platform.openai.com / https://replicate.com |
| **GitHub** | Code backup (Code Owner pattern from playbook) | Private repo `aiap-<cohort>-roomreimagine` |
| **Loom** | Demo recording for submission | https://www.loom.com |

## 4. Critical Path & Risk Notes

- **Critical path:** 01 → 02 → 05 → 06 → 09. The AI Edge Function (05) is the highest-risk package — start it as early as Day 1 afternoon; validate the AI API restyles a real photo *before* wiring the UI.
- **Interface contracts** (agree on these before parallel work starts, all defined in plans 02 and 05):
  - DB shapes for `rooms` and `makeovers` (plan 02, §2).
  - Edge Function request/response contract (plan 05, §3).
  - Storage path convention: `room-photos/{user_id}/{room_id}.jpg`, `makeovers/{user_id}/{makeover_id}.png`.
- **Cost/latency guardrails:** downscale to ≤1024 px before AI call, 60 s timeout, ~20 generations/user/day soft cap (plan 05).
- **Demo insurance:** pre-generated concepts saved in the demo account's gallery (plan 09).

## 5. Definition of Done (MVP)

A first-time user can: sign in → upload a room photo → pick a style → generate an AI concept of *their* room → compare before/after with a slider → save it → find it again in their gallery — twice in a row, on mobile and desktop, in under 2 minutes.
