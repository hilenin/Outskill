import { ImageOff } from 'lucide-react';
import { StyleBadge } from '@/components/ui/StyleBadge';
import type { GalleryRoom } from '@/types';

const NO_MAKEOVER_IMAGE = '/no-makeover.png';

interface GalleryCardProps {
  room: GalleryRoom;
  onClick: () => void;
}

/**
 * Gallery card = before/after pair: the user's uploaded photo on the left,
 * and on the right either the latest makeover result or the
 * "No makeover yet" banner when generation never completed.
 */
export function GalleryCard({ room, onClick }: GalleryCardProps) {
  const latest = room.latestConcept;
  const hasMultiple = room.conceptCount > 1;

  const dateStr = new Date(room.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <button
      onClick={onClick}
      className={`group text-left overflow-hidden rounded-2xl bg-surface border transition-all duration-200 active:scale-[0.98] hover:shadow-warm-md ${
        latest
          ? 'border-border-warm hover:border-ink-300'
          : 'border-dashed border-border-warm hover:border-accent-soft'
      }`}
    >
      <div className="grid grid-cols-2">
        {/* LEFT: the uploaded original photo */}
        <div className="relative overflow-hidden border-r border-border-warm">
          <img
            src={room.originalImage || NO_MAKEOVER_IMAGE}
            alt="Original room"
            className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = NO_MAKEOVER_IMAGE;
            }}
          />
          <span className="absolute top-2 left-2 rounded-full bg-ink-900/60 text-white text-[10px] font-medium px-2 py-0.5 backdrop-blur-sm">
            Before
          </span>
        </div>

        {/* RIGHT: the makeover result, or the no-makeover banner */}
        {latest ? (
          <div className="relative overflow-hidden">
            <img
              src={latest.resultImage}
              alt="Makeover result"
              className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 left-2">
              <StyleBadge
                styleId={latest.styleId}
                className="bg-white/90 backdrop-blur-sm scale-90 origin-top-left"
              />
            </div>
            {hasMultiple && (
              <span className="absolute bottom-2 right-2 rounded-full bg-sage/90 text-white text-xs font-medium px-2.5 py-0.5 backdrop-blur-sm">
                {room.conceptCount} styles
              </span>
            )}
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center gap-2 aspect-[4/3] bg-canvas px-3 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border-warm text-ink-300">
              <ImageOff className="h-4 w-4" />
            </span>
            <span className="rounded-full bg-ink-900/70 text-white text-[11px] font-medium px-2.5 py-1">
              No makeover yet
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        {latest ? (
          <p className="text-xs text-ink-500">{dateStr}</p>
        ) : (
          <>
            <p className="text-xs text-ink-700 font-medium mb-0.5">
              Makeover didn&rsquo;t happen for this room
            </p>
            <p className="text-xs text-ink-500">{dateStr} &middot; tap to try a style</p>
          </>
        )}
      </div>
    </button>
  );
}
