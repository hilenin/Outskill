import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Images, Plus } from 'lucide-react';
import { GalleryCard } from '@/components/gallery/GalleryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { roomService } from '@/services/roomService';
import { pushToast } from '@/components/ui/Toast';
import type { GalleryRoom } from '@/types';

export function Gallery() {
  const [rooms, setRooms] = useState<GalleryRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    roomService.getGalleryRooms().then((data) => {
      setRooms(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-serif text-ink-900 mb-1">
            Your Gallery
          </h1>
          <p className="text-ink-500">All your reimagined rooms in one place.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-surface border border-border-warm overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-canvas" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-16 bg-canvas rounded" />
                <div className="h-3 w-20 bg-canvas rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 lg:px-8 py-12">
        <EmptyState
          icon={<Images className="h-10 w-10" />}
          title="No makeovers yet"
          subtitle="Transform your first room and see it in a brand new style."
          actionLabel="Create your first makeover"
          onAction={() => navigate('/new-makeover')}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 lg:px-8 py-8 lg:py-12">
      <div className="mb-8 flex items-start justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif text-ink-900 mb-1">
            Your Gallery
          </h1>
          <p className="text-ink-500">All your reimagined rooms in one place.</p>
        </div>
        <button
          onClick={() => navigate('/new-makeover')}
          className="hidden md:flex items-center gap-2 rounded-2xl bg-accent text-white px-5 py-2.5 text-sm font-medium shadow-warm hover:bg-accent-hover transition-all duration-200 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Makeover
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <GalleryCard
            key={room.id}
            room={room}
            onClick={() => {
              if (room.latestConcept) {
                navigate(`/concept/${room.latestConcept.id}`);
              } else {
                pushToast(
                  'error',
                  'No makeover happened for this room yet — pick a style to create one.'
                );
                navigate(`/new-makeover?room_id=${room.id}`);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
