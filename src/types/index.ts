export type DesignStyleId =
  | 'scandinavian'
  | 'modern-minimalist'
  | 'industrial'
  | 'bohemian'
  | 'japandi'
  | 'mid-century-modern'
  | 'coastal'
  | 'rustic';

export interface DesignStyle {
  id: DesignStyleId;
  name: string;
  description: string;
  thumbnail: string;
}

export type GenerationStatus = 'loading' | 'complete' | 'failed';

export interface Concept {
  id: string;
  roomId: string;
  styleId: DesignStyleId;
  resultImage: string;
  notes: string;
  createdAt: string;
}

export interface Room {
  id: string;
  originalImage: string;
  createdAt: string;
  concepts: Concept[];
}

export interface GalleryRoom {
  id: string;
  originalImage: string;
  createdAt: string;
  conceptCount: number;
  latestConcept: Concept | null;
  concepts: Concept[];
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}
