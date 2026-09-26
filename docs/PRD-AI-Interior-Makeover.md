# PRD — AI Interior Makeover ("RoomReimagine")

**Version:** 1.0 (MVP / 3-Day Hackathon Build)
**Date:** 2026-09-24
**Status:** Draft — locked for hackathon scope

---

## 1. Overview

**Product name (working):** RoomReimagine — AI Interior Makeover

**One-liner:** For homeowners and renters who want to redecorate but can't visualize the result, RoomReimagine lets them upload a photo of their room, pick an interior design style, and instantly see AI-generated makeover concepts they can compare side-by-side with the original and save to a personal gallery.

**Stack:**
- **Front end:** Bolt (React web app)
- **Backend / Auth / DB / Image storage:** Supabase
- **AI generation:** AI image-editing API (e.g., Google Gemini 2.5 Flash Image / "Nano Banana", OpenAI Images Edit, or Replicate-hosted models) that takes the room photo + a style prompt and returns a restyled image of the same room

---

## 2. Problem Statement

Homeowners and renters who want to refresh a room can't confidently picture how a new style would look in *their* space. Inspiration apps (Pinterest, Instagram, Houzz) show other people's rooms, hiring an interior designer is expensive and slow, and generic AI image generators produce imaginary rooms rather than restyling the user's actual room. As a result, people delay redecorating, buy furniture that doesn't fit the look, or give up on the project entirely.

**Final problem statement:** People who want to redecorate feel stuck because they cannot visualize design styles applied to their own room, and the existing options are either generic inspiration (not their room) or costly professional services.

---

## 3. Goals & Success Metrics

### Product goal
Let a user go from "photo of my room" to "realistic makeover concept in a style I chose" in under 60 seconds, and build a personal gallery of concepts they can revisit and compare.

### MVP success (end of 3-day hackathon)
A user should be able to: **sign in, upload a room photo, select a design style, generate an AI makeover concept, compare it side-by-side with the original, and save it to their personal gallery.**

**Demo success metric:** A first-time user completes one full makeover flow (upload → style → generate → compare → save) in under 2 minutes without getting stuck, and can generate at least 2 different style concepts for the same room.

---

## 4. Target Users

**Primary user:** Homeowners and renters aged 25–45 who are planning to redecorate or furnish a room and are active on visual inspiration platforms.

**Context of use:** At home on a phone or laptop, casually exploring "what could this room look like?" before committing time or money — often while browsing furniture sites or planning a move-in.

**Top 3 pains today:**
1. Can't visualize how a style (e.g., Scandinavian, Japandi, Industrial) would actually look in *their* room.
2. Inspiration photos are of other people's rooms with different layouts, lighting, and dimensions.
3. Professional design services and 3D-rendering tools are expensive, slow, or too complex for a casual "what if?" exploration.

**Secondary users (post-MVP):** Real-estate agents virtually staging listings; landlords marketing rentals; furniture retailers.

---

## 5. Scope

### 5.1 Must-Have (M) — the committed end-to-end flow

| # | Feature | Description |
|---|---------|-------------|
| M1 | Email auth | Sign up / sign in via Supabase Auth (email + password). |
| M2 | Room photo upload | Upload a JPG/PNG room photo (camera or file); stored in Supabase Storage; preview before generating. |
| M3 | Style selector | Pick 1 of 6–8 preset styles: Scandinavian, Modern Minimalist, Industrial, Bohemian, Japandi, Mid-Century Modern, Coastal, Rustic. Each style card shows a thumbnail + short description. |
| M4 | AI makeover generation | Send photo + style prompt to the AI image-editing API; return a restyled image of the same room (layout/geometry preserved, furnishings & decor restyled). Loading state with progress feedback. |
| M5 | Before/After comparison | Side-by-side view of original vs. concept (slider or toggle). |
| M6 | Personal gallery | Save concepts; gallery lists saved makeovers with original photo, style label, and date; open any item back into comparison view; delete items. |

### 5.2 Should-Have (S) — max 2, only after Must-haves are stable

| # | Feature | Description | Differentiator |
|---|---------|-------------|----------------|
| S1 | Multi-style generation for one room | Generate 2–3 style concepts from the same photo and compare them in a grid — "style shootout." | ⭐ |
| S2 | Custom style notes | Free-text field appended to the style prompt (e.g., "keep the sofa, add warm lighting, add plants"). | ⭐ |

### 5.3 Could-Have (C) — only if time remains
- Download / share a concept image (public share link).
- Regenerate button ("try another variation") on any concept.
- Room-type tag (bedroom / living room / kitchen) to sharpen prompts.

### 5.4 Won't-Have (W) — explicitly out of scope for MVP
- Shopping links / product matching for furniture in concepts.
- Precise object masking or region-select editing ("only change the wall color").
- Mobile native apps (responsive web only).
- Collaboration, comments, or social feed.
- Paid plans, credits, or billing.
- AR / 3D room scanning.

---

## 6. Core User Flows

### Flow 1 — First makeover (the must-have flow)
1. User lands on the app → signs up / signs in (M1).
2. Clicks **"New Makeover"** → uploads a room photo → sees preview (M2).
3. Picks a style from the style cards (M3), optionally adds custom notes (S2).
4. Clicks **"Generate Makeover"** → loading state (~10–30 s) → concept appears (M4).
5. Views **Before/After** comparison with a slider (M5).
6. Clicks **"Save to Gallery"** → concept stored with style label and date (M6).

### Flow 2 — Revisit & compare
1. User opens **Gallery** → sees all saved makeovers as cards.
2. Taps a card → opens comparison view (original vs. concept).
3. Can delete the concept, or start a new generation from the same original photo.

### Flow 3 — Style shootout (Should-have)
1. From a generated concept, user clicks **"Try another style"**.
2. Picks a second style → generates → gallery/compare view shows both concepts against the original.

### Error / edge flows
- Upload fails or wrong file type → inline error, re-prompt for JPG/PNG under size limit (e.g., 10 MB).
- AI API fails or times out → friendly error with **Retry** button; original photo and style selection preserved.
- Empty gallery → empty-state with "Create your first makeover" CTA.

---

## 7. Data Model (Supabase)

### `profiles`
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | = auth.users.id |
| email | text | |
| created_at | timestamptz | default now() |

### `rooms` (original uploaded photos)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | RLS: owner only |
| original_image_url | text | Supabase Storage path |
| room_type | text (nullable) | bedroom / living / kitchen (Could-have) |
| created_at | timestamptz | |

### `makeovers` (generated concepts)
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| room_id | uuid (FK → rooms) | |
| user_id | uuid (FK → profiles) | denormalized for RLS + gallery query |
| style | text | e.g., "japandi" |
| custom_notes | text (nullable) | Should-have S2 |
| generated_image_url | text | Supabase Storage path |
| status | text | pending / complete / failed |
| created_at | timestamptz | |

### `styles` (static lookup — can be hardcoded client-side for MVP)
| Field | Type | Notes |
|-------|------|-------|
| id | text (PK) | slug, e.g., "scandinavian" |
| name | text | display name |
| description | text | one-line card copy |
| prompt_template | text | the style portion of the AI prompt |
| thumbnail_url | text | style card image |

### Storage buckets
- `room-photos/` — originals, private, per-user folder (`{user_id}/{room_id}.jpg`).
- `makeovers/` — generated concepts, private, per-user folder.

**Security:** Row Level Security on `rooms` and `makeovers` (user can only read/write own rows). Storage policies scoped to the user's folder.

---

## 8. Architecture

```
[Bolt front end (React)]
   │  auth, CRUD, file upload
   ▼
[Supabase]
   ├── Auth (email/password)
   ├── Postgres (profiles, rooms, makeovers)
   ├── Storage (room-photos, makeovers buckets)
   └── Edge Function: generate-makeover
          │  original image + style prompt
          ▼
   [AI Image-Editing API]
   (Gemini 2.5 Flash Image / OpenAI Images Edit / Replicate)
          │  restyled room image
          ▼
   Edge Function saves result → Storage + makeovers row
```

**Key design decision:** the AI API call runs in a **Supabase Edge Function**, not the browser — this keeps the API key secret and lets us write the result directly to Storage and the `makeovers` table.

### AI prompt strategy (per generation)
```
Redesign this room in {style_name} style. {style_prompt_template}.
Keep the room's layout, walls, windows, doors, and camera perspective
exactly the same. Only change furniture, decor, colors, materials,
and lighting to match the style. Photorealistic result.
{custom_notes}
```

---

## 9. Non-Functional Requirements

- **Generation latency:** show progress feedback; target < 30 s per concept; timeout with retry at 60 s.
- **Image limits:** accept JPG/PNG up to 10 MB; downscale to ~1024 px longest edge before sending to the AI API (cost + speed).
- **Privacy:** photos are private to the user (RLS + storage policies); no public listing of user images.
- **Cost control:** MVP has no billing — soft-limit generations to ~20/user/day to protect API spend during the demo period.
- **Responsive:** works on mobile and desktop browsers (upload from phone camera is a primary path).
- **Graceful failure:** every AI failure leaves the app in a recoverable state (photo + style preserved, retry available).

---

## 10. Out of Scope (explicit)

Shopping/product links, region-select editing, native apps, collaboration/social features, payments, AR/3D scanning, multi-room projects, designer marketplace. These are parked, not rejected — see roadmap.

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI changes room geometry (moves walls/windows) | Concepts look fake, trust drops | Strong "preserve layout" prompt language; test prompts per style on Day 2; pick the API that best preserves structure |
| Generation too slow for live demo | Demo stalls | Pre-generate demo examples as backup; show engaging loading state |
| API cost overrun | Budget burn | Downscale images, per-user daily cap, single concept per request |
| Poor-quality uploads (dark/blurry photos) | Bad outputs blamed on app | Upload tips ("well-lit, wide angle"), preview step before generating |
| Edge Function timeout on slow AI responses | Failed generations | Async pattern: create `makeovers` row as `pending`, poll for `complete` |

---

## 12. 3-Day Build Plan

**Day 1 — Ideation & setup (this document):** scope frozen, architecture sketched, Supabase project created, styles list + prompt templates written, Bolt starting prompt ready.

**Day 2 — Core build:** Bolt project generated from starting prompt; Supabase auth + tables + storage wired; upload → style select → generate → compare flow working end-to-end with the AI API; save to gallery.

**Day 3 — Hardening & demo:** CRUD complete on gallery (list/open/delete); error states and retry; Should-haves (multi-style shootout, custom notes) if stable; scenario testing; demo script + Loom recording; pitch deck.

---

## 13. Demo Script (3–5 min)

1. **Problem:** "RoomReimagine is for homeowners and renters who want to redecorate but can't picture how a new style would look in their own room."
2. **What we built:** "In 3 days we built an app where you upload your room photo, pick a style, and AI shows you your room — restyled."
3. **Live walkthrough:** sign in → upload living-room photo → pick *Japandi* → generate → before/after slider → save → generate *Industrial* for the same room → compare both in gallery.
4. **Wow moment:** the before/after slider on the user's *actual* room.
5. **Close:** "Next we'll add shoppable furniture links so a concept becomes a purchase list."

---

## 14. Post-Hackathon Roadmap (next 7 days)

1. Stability + UX polish on the generate flow.
2. Add share links and image download.
3. Room-type tags to sharpen prompts.
4. Test with 3–5 real users; log where they stall.
5. Explore product-matching (furniture links) as the monetization wedge.
