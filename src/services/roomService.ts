import { supabase } from '@/lib/supabase';
import { DESIGN_STYLES } from '@/data/mockData';
import type { Room, GalleryRoom, Concept, DesignStyleId } from '@/types';

// Real Supabase-backed room/makeover service — replaces roomService in
// mockService.ts with the same interface, so components don't change.
//
// Data contract (docs/plan/02 + 05B):
//   rooms:     id, user_id, original_image_url (storage path), room_type, created_at
//   makeovers: id, room_id, user_id, style, custom_notes, generated_image_url,
//              status ('pending'|'complete'|'failed'), created_at
//   Buckets (private): room-photos/{user_id}/{room_id}.jpg
//                      makeovers/{user_id}/{makeover_id}.png|jpg
//   Generation: front end inserts the pending makeovers row, then POSTs the
//   n8n webhook (VITE_N8N_WEBHOOK_URL) with { makeover_id } + user JWT.

interface RoomRow {
  id: string;
  user_id: string;
  original_image_url: string;
  created_at: string;
}

interface MakeoverRow {
  id: string;
  room_id: string;
  user_id: string;
  style: string;
  custom_notes: string | null;
  generated_image_url: string | null;
  status: 'pending' | 'complete' | 'failed';
  created_at: string;
}

const SIGNED_URL_TTL = 3600; // seconds

// Default makeover budget in US dollars, sent to n8n as `cost_limit`.
// The user can change it on the New Makeover screen.
export const DEFAULT_BUDGET = 500;

/**
 * Contract says storage columns hold RELATIVE paths ({user_id}/{file}), but
 * some writers (n8n) have stored full public URLs. Normalize to the relative
 * path so signing works either way.
 */
function normalizeStoragePath(bucket: string, value: string | null): string {
  if (!value) return '';
  const marker = `/${bucket}/`;
  const idx = value.indexOf(marker);
  return idx >= 0 ? value.slice(idx + marker.length) : value;
}

/** Map loose style values ("Mid-century modern", "Industrial loft") to slugs. */
function normalizeStyleSlug(style: string): DesignStyleId {
  const s = style.toLowerCase();
  if (s.includes('japandi')) return 'japandi';
  if (s.includes('scandi')) return 'scandinavian';
  if (s.includes('mid')) return 'mid-century-modern';
  if (s.includes('industrial')) return 'industrial';
  if (s.includes('boh')) return 'bohemian';
  if (s.includes('coast')) return 'coastal';
  if (s.includes('rustic')) return 'rustic';
  if (s.includes('minimal') || s.includes('modern')) return 'modern-minimalist';
  return s.replace(/\s+/g, '-') as DesignStyleId;
}

/** Batch-sign storage paths; returns path -> signed URL (skips nulls). */
async function signPaths(
  bucket: 'room-photos' | 'makeovers',
  paths: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  const map = new Map<string, string>();
  if (unique.length === 0) return map;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(unique, SIGNED_URL_TTL);
  if (error || !data) return map;
  data.forEach((entry, i) => {
    if (entry.signedUrl) map.set(unique[i], entry.signedUrl);
  });
  return map;
}

function toConcept(m: MakeoverRow, afterUrl: string): Concept {
  return {
    id: m.id,
    roomId: m.room_id,
    styleId: normalizeStyleSlug(m.style),
    resultImage: afterUrl,
    notes: m.custom_notes ?? '',
    createdAt: m.created_at,
  };
}

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user?.id;
  if (!uid) throw new Error('Not signed in.');
  return uid;
}

/** Downscale an image (data URL or http URL) to <=1024px longest edge, JPEG. */
async function toDownscaledJpeg(src: string): Promise<Blob> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = src;
  });
  const maxEdge = 1024;
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not process the image.'))),
      'image/jpeg',
      0.85
    )
  );
}

/** Load rooms + complete makeovers for the signed-in user, mapped with signed URLs. */
async function loadRooms(): Promise<Room[]> {
  const [roomsRes, makeoversRes] = await Promise.all([
    supabase.from('rooms').select('*').order('created_at', { ascending: false }),
    supabase
      .from('makeovers')
      .select('*')
      // 'approved' is a status the n8n workflow writes; treat it as complete
      .in('status', ['complete', 'approved'])
      .order('created_at', { ascending: true }),
  ]);
  if (roomsRes.error) throw roomsRes.error;
  if (makeoversRes.error) throw makeoversRes.error;
  const roomRows = (roomsRes.data ?? []) as RoomRow[];
  const makeoverRows = (makeoversRes.data ?? []) as MakeoverRow[];

  // Tolerate full-URL values written by out-of-contract writers
  roomRows.forEach((r) => {
    r.original_image_url = normalizeStoragePath('room-photos', r.original_image_url);
  });
  makeoverRows.forEach((m) => {
    m.generated_image_url = normalizeStoragePath('makeovers', m.generated_image_url) || null;
  });

  const [beforeUrls, afterUrls] = await Promise.all([
    signPaths('room-photos', roomRows.map((r) => r.original_image_url)),
    signPaths('makeovers', makeoverRows.map((m) => m.generated_image_url!)),
  ]);

  return roomRows.map((r) => ({
    id: r.id,
    originalImage: beforeUrls.get(r.original_image_url) ?? '',
    createdAt: r.created_at,
    concepts: makeoverRows
      .filter((m) => m.room_id === r.id && m.generated_image_url)
      .map((m) => toConcept(m, afterUrls.get(m.generated_image_url!) ?? '')),
  }));
}

function toGalleryRoom(room: Room): GalleryRoom {
  return {
    id: room.id,
    originalImage: room.originalImage,
    createdAt: room.createdAt,
    conceptCount: room.concepts.length,
    latestConcept: room.concepts.length > 0 ? room.concepts[room.concepts.length - 1] : null,
    concepts: room.concepts,
  };
}

/**
 * The team's n8n webhook contract (owned by the n8n developer):
 *   POST { user_id, room_id, style (display name), custom_notes, cost_limit, image_url }
 *   Header: X-API-Key (VITE_N8N_API_KEY)
 * The workflow generates the concept and INSERTS ITS OWN makeovers row when
 * done — so the front end does NOT create a pending row. After triggering,
 * the Result screen polls for a new completed concept on that room
 * (wait-token flow below).
 */
async function callGenerationWebhook(
  userId: string,
  roomId: string,
  styleId: DesignStyleId,
  notes: string,
  imageUrl: string,
  budget: number
): Promise<string | null> {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
  const apiKey = import.meta.env.VITE_N8N_API_KEY;
  if (!webhookUrl || !apiKey) throw new Error('Generation service is not configured.');
  const styleName = DESIGN_STYLES.find((s) => s.id === styleId)?.name ?? styleId;
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({
      user_id: userId,
      room_id: roomId,
      style: styleName,
      custom_notes: notes || '',
      cost_limit: budget,
      image_url: imageUrl,
    }),
  });
  if (!res.ok) throw new Error('Generation service failed to start.');
  // The workflow responds with { status, makeover_id } when generation is
  // done — use the id directly when present.
  try {
    const body = await res.json();
    return typeof body?.makeover_id === 'string' ? body.makeover_id : null;
  } catch {
    return null;
  }
}

/** Wait-token: lets /result/:id poll for the webhook's row. */
export function makeWaitToken(
  roomId: string,
  styleId: string,
  notes: string,
  budget: number
): string {
  return `wait__${roomId}__${styleId}__${Date.now()}__${budget}__${encodeURIComponent(notes)}`;
}

export function parseWaitToken(
  token: string
): {
  roomId: string;
  styleId: DesignStyleId;
  since: number;
  budget: number;
  notes: string;
} | null {
  if (!token.startsWith('wait__')) return null;
  const [, roomId, styleId, since, budget, ...rest] = token.split('__');
  if (!roomId || !styleId || !since) return null;
  return {
    roomId,
    styleId: styleId as DesignStyleId,
    since: Number(since),
    budget: Number(budget) > 0 ? Number(budget) : DEFAULT_BUDGET,
    // Rejoin in case the notes themselves contained "__"
    notes: decodeURIComponent(rest.join('__')),
  };
}

export interface MakeoverStatus {
  id: string;
  status: 'pending' | 'complete' | 'failed';
  styleId: DesignStyleId;
  notes: string;
  roomId: string;
  beforeUrl: string;
  afterUrl: string | null;
  errorReason?: string | null;
}

export const roomService = {
  async getGalleryRooms(): Promise<GalleryRoom[]> {
    const rooms = await loadRooms();
    // ALL rooms appear in the gallery — rooms without a finished concept
    // render the "no makeover yet" placeholder card.
    return rooms.map(toGalleryRoom);
  },

  async getRoom(roomId: string): Promise<Room | null> {
    const rooms = await loadRooms();
    return rooms.find((r) => r.id === roomId) ?? null;
  },

  async getConcept(conceptId: string): Promise<Concept | null> {
    const rooms = await loadRooms();
    for (const room of rooms) {
      const c = room.concepts.find((x) => x.id === conceptId);
      if (c) return c;
    }
    return null;
  },

  async getRoomByConcept(conceptId: string): Promise<Room | null> {
    const rooms = await loadRooms();
    return rooms.find((r) => r.concepts.some((c) => c.id === conceptId)) ?? null;
  },

  async deleteConcept(conceptId: string): Promise<boolean> {
    const uid = await requireUserId();
    const { data: row, error } = await supabase
      .from('makeovers')
      .select('*')
      .eq('id', conceptId)
      .single();
    if (error || !row) return false;
    const m = row as MakeoverRow;

    const afterPath = normalizeStoragePath('makeovers', m.generated_image_url);
    if (afterPath) {
      await supabase.storage.from('makeovers').remove([afterPath]);
    }
    const { error: delErr } = await supabase.from('makeovers').delete().eq('id', conceptId);
    if (delErr) return false;

    // Last concept of the room? Remove the room + original photo too.
    const { count } = await supabase
      .from('makeovers')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', m.room_id);
    if ((count ?? 0) === 0) {
      const { data: roomRow } = await supabase
        .from('rooms')
        .select('original_image_url')
        .eq('id', m.room_id)
        .single();
      const beforePath = normalizeStoragePath('room-photos', roomRow?.original_image_url ?? '');
      if (beforePath) {
        await supabase.storage.from('room-photos').remove([beforePath]);
      }
      await supabase.from('rooms').delete().eq('id', m.room_id);
    }
    void uid;
    return true;
  },

  /**
   * Upload the photo, create the rooms row + pending makeovers row, trigger
   * the n8n generation, and return the makeover id (Result polls it).
   */
  async createMakeover(
    photo: string,
    styleId: DesignStyleId,
    notes: string,
    budget: number = DEFAULT_BUDGET
  ): Promise<string> {
    const uid = await requireUserId();

    const blob = await toDownscaledJpeg(photo);
    const roomId = crypto.randomUUID();
    const path = `${uid}/${roomId}.jpg`;

    const { error: upErr } = await supabase.storage
      .from('room-photos')
      .upload(path, blob, { contentType: 'image/jpeg' });
    if (upErr) throw new Error("Couldn't save your photo — please try again.");

    const { error: roomErr } = await supabase
      .from('rooms')
      .insert({ id: roomId, user_id: uid, original_image_url: path });
    if (roomErr) {
      await supabase.storage.from('room-photos').remove([path]); // no orphans
      throw new Error("Couldn't save your photo — please try again.");
    }

    return this.generateForRoom(roomId, styleId, notes, budget);
  },

  /**
   * Trigger generation for an EXISTING room via the team's n8n webhook.
   * Returns a wait-token the Result screen uses to poll for the new concept
   * (the webhook inserts the makeovers row itself when generation finishes).
   */
  async generateForRoom(
    roomId: string,
    styleId: DesignStyleId,
    notes: string,
    budget: number = DEFAULT_BUDGET
  ): Promise<string> {
    const uid = await requireUserId();
    const { data: roomRow, error } = await supabase
      .from('rooms')
      .select('original_image_url')
      .eq('id', roomId)
      .single();
    if (error || !roomRow) throw new Error("Couldn't find that room's photo.");
    const path = normalizeStoragePath('room-photos', roomRow.original_image_url);
    const { data: signed } = await supabase.storage
      .from('room-photos')
      .createSignedUrl(path, SIGNED_URL_TTL);
    if (!signed?.signedUrl) throw new Error("Couldn't access that room's photo.");

    const makeoverId = await callGenerationWebhook(
      uid,
      roomId,
      styleId,
      notes,
      signed.signedUrl,
      budget
    );
    // Direct id from the webhook response; wait-token polling as fallback
    return makeoverId ?? makeWaitToken(roomId, styleId, notes, budget);
  },

  /**
   * Find a concept the webhook created for this room since the wait started.
   * Matches loosely on style (the webhook stores display names).
   */
  async findConceptSince(
    roomId: string,
    styleId: DesignStyleId,
    sinceMs: number
  ): Promise<string | null> {
    const sinceIso = new Date(sinceMs - 60_000).toISOString(); // clock-skew buffer
    const { data } = await supabase
      .from('makeovers')
      .select('id, style, status, generated_image_url, created_at')
      .eq('room_id', roomId)
      .in('status', ['complete', 'approved'])
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false });
    const match = (data ?? []).find(
      (m) =>
        m.generated_image_url &&
        normalizeStyleSlug(m.style) === normalizeStyleSlug(styleId)
    );
    return match?.id ?? null;
  },

  /** One poll tick for the Result screen. */
  async getMakeoverStatus(makeoverId: string): Promise<MakeoverStatus | null> {
    const { data, error } = await supabase
      .from('makeovers')
      .select('*, rooms(original_image_url)')
      .eq('id', makeoverId)
      .single();
    if (error || !data) return null;
    const m = data as MakeoverRow & {
      rooms: { original_image_url: string } | null;
      error_reason?: string | null;
    };

    const beforePath = normalizeStoragePath('room-photos', m.rooms?.original_image_url ?? '');
    const afterPath = normalizeStoragePath('makeovers', m.generated_image_url);
    const [beforeUrls, afterUrls] = await Promise.all([
      signPaths('room-photos', beforePath ? [beforePath] : []),
      signPaths('makeovers', afterPath ? [afterPath] : []),
    ]);

    return {
      id: m.id,
      status: (m.status as string) === 'approved' ? 'complete' : m.status,
      styleId: normalizeStyleSlug(m.style),
      notes: m.custom_notes ?? '',
      roomId: m.room_id,
      beforeUrl: beforeUrls.get(beforePath) ?? '',
      afterUrl: afterPath ? afterUrls.get(afterPath) ?? null : null,
      errorReason: m.error_reason ?? null,
    };
  },

  /**
   * Retry a failed makeover with the same room/style/notes. The makeovers row
   * doesn't store the budget, so this falls back to DEFAULT_BUDGET.
   */
  async retryMakeover(makeoverId: string): Promise<string> {
    const status = await this.getMakeoverStatus(makeoverId);
    if (!status) throw new Error("Couldn't find that makeover.");
    return this.generateForRoom(status.roomId, status.styleId, status.notes);
  },
};
