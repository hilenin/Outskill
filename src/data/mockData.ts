import type { DesignStyle, DesignStyleId, Room, MockUser } from '@/types';

export const DESIGN_STYLES: DesignStyle[] = [
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Light woods, soft textures, airy simplicity.',
    thumbnail:
      'https://images.pexels.com/photos/19966766/pexels-photo-19966766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean lines, neutral palette, less is more.',
    thumbnail:
      'https://images.pexels.com/photos/29012619/pexels-photo-29012619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Brick, steel, and raw textures meet warmth.',
    thumbnail:
      'https://images.pexels.com/photos/7031834/pexels-photo-7031834.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Layers, plants, and eclectic global charm.',
    thumbnail:
      'https://images.pexels.com/photos/15124841/pexels-photo-15124841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'japandi',
    name: 'Japandi',
    description: 'Japanese restraint meets Scandinavian warmth.',
    thumbnail:
      'https://images.pexels.com/photos/8251236/pexels-photo-8251236.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'mid-century-modern',
    name: 'Mid-Century Modern',
    description: 'Iconic silhouettes, warm woods, retro soul.',
    thumbnail:
      'https://images.pexels.com/photos/33084139/pexels-photo-33084139.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'coastal',
    name: 'Coastal',
    description: 'Breezy blues, natural fibers, seaside calm.',
    thumbnail:
      'https://images.pexels.com/photos/14495875/pexels-photo-14495875.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'rustic',
    name: 'Rustic',
    description: 'Reclaimed wood, cozy textures, farmhouse heart.',
    thumbnail:
      'https://images.pexels.com/photos/5900823/pexels-photo-5900823.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export const MOCK_USER: MockUser = {
  id: 'user-1',
  email: 'emma@roomreimagine.com',
  name: 'Emma Hartwell',
  avatarUrl:
    'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&h=120&w=120',
};

const BEFORE_ROOM_1 =
  'https://images.pexels.com/photos/8146336/pexels-photo-8146336.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const BEFORE_ROOM_2 =
  'https://images.pexels.com/photos/6782479/pexels-photo-6782479.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const BEFORE_ROOM_3 =
  'https://images.pexels.com/photos/8082327/pexels-photo-8082327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-1',
    originalImage: BEFORE_ROOM_1,
    createdAt: '2026-09-20T10:30:00Z',
    concepts: [
      {
        id: 'concept-1a',
        roomId: 'room-1',
        styleId: 'japandi',
        resultImage:
          'https://images.pexels.com/photos/8251236/pexels-photo-8251236.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        notes: 'Keep the large window, add warm wood furniture and soft neutral textiles.',
        createdAt: '2026-09-20T10:35:00Z',
      },
      {
        id: 'concept-1b',
        roomId: 'room-1',
        styleId: 'scandinavian',
        resultImage:
          'https://images.pexels.com/photos/19966766/pexels-photo-19966766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        notes: 'Keep the large window, add warm wood furniture and soft neutral textiles.',
        createdAt: '2026-09-21T14:10:00Z',
      },
      {
        id: 'concept-1c',
        roomId: 'room-1',
        styleId: 'mid-century-modern',
        resultImage:
          'https://images.pexels.com/photos/33084139/pexels-photo-33084139.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        notes: 'Keep the large window, add warm wood furniture and soft neutral textiles.',
        createdAt: '2026-09-22T09:00:00Z',
      },
    ],
  },
  {
    id: 'room-2',
    originalImage: BEFORE_ROOM_2,
    createdAt: '2026-09-18T16:00:00Z',
    concepts: [
      {
        id: 'concept-2a',
        roomId: 'room-2',
        styleId: 'bohemian',
        resultImage:
          'https://images.pexels.com/photos/15124841/pexels-photo-15124841.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        notes: 'Add lots of plants and layered textiles.',
        createdAt: '2026-09-18T16:05:00Z',
      },
    ],
  },
  {
    id: 'room-3',
    originalImage: BEFORE_ROOM_3,
    createdAt: '2026-09-15T12:00:00Z',
    concepts: [
      {
        id: 'concept-3a',
        roomId: 'room-3',
        styleId: 'industrial',
        resultImage:
          'https://images.pexels.com/photos/7031834/pexels-photo-7031834.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        notes: 'Expose the brick, add metal shelving and a leather sofa.',
        createdAt: '2026-09-15T12:10:00Z',
      },
      {
        id: 'concept-3b',
        roomId: 'room-3',
        styleId: 'rustic',
        resultImage:
          'https://images.pexels.com/photos/5900823/pexels-photo-5900823.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        notes: 'Expose the brick, add metal shelving and a leather sofa.',
        createdAt: '2026-09-16T08:00:00Z',
      },
    ],
  },
];

export const BEFORE_AFTER_PAIRS = {
  'room-1': BEFORE_ROOM_1,
  'room-2': BEFORE_ROOM_2,
  'room-3': BEFORE_ROOM_3,
};

export function getStyleById(id: DesignStyleId): DesignStyle | undefined {
  return DESIGN_STYLES.find((s) => s.id === id);
}
