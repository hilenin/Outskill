import type {
  Room,
  GalleryRoom,
  Concept,
  DesignStyleId,
  MockUser,
} from '@/types';
import { MOCK_ROOMS, MOCK_USER } from '@/data/mockData';

/**
 * Mock service layer. Every method returns a Promise so the components
 * are already async-ready. When Supabase is wired in, only this file
 * needs to change — components import from here, not from mockData.
 */

const delay = (ms: number = 400) => new Promise((r) => setTimeout(r, ms));

function toGalleryRoom(room: Room): GalleryRoom {
  return {
    id: room.id,
    originalImage: room.originalImage,
    createdAt: room.createdAt,
    conceptCount: room.concepts.length,
    latestConcept: room.concepts.length > 0
      ? room.concepts[room.concepts.length - 1]
      : null,
    concepts: room.concepts,
  };
}

export const roomService = {
  async getGalleryRooms(): Promise<GalleryRoom[]> {
    await delay();
    return MOCK_ROOMS.map(toGalleryRoom);
  },

  async getRoom(roomId: string): Promise<Room | null> {
    await delay();
    const room = MOCK_ROOMS.find((r) => r.id === roomId);
    return room ?? null;
  },

  async getConcept(conceptId: string): Promise<Concept | null> {
    await delay();
    for (const room of MOCK_ROOMS) {
      const concept = room.concepts.find((c) => c.id === conceptId);
      if (concept) return concept;
    }
    return null;
  },

  async getRoomByConcept(conceptId: string): Promise<Room | null> {
    await delay();
    for (const room of MOCK_ROOMS) {
      if (room.concepts.some((c) => c.id === conceptId)) {
        return room;
      }
    }
    return null;
  },

  async deleteConcept(conceptId: string): Promise<boolean> {
    await delay();
    return true;
  },

  async createMakeover(
    _originalImage: string,
    _styleId: DesignStyleId,
    _notes: string
  ): Promise<string> {
    await delay(600);
    return 'concept-new';
  },
};

// authService moved to '@/services/authService' — now backed by real Supabase Auth.
// roomService above is still mock; it gets wired to Supabase in the next step (Wire-02).
