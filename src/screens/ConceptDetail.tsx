import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { CompareSlider } from '@/components/ui/CompareSlider';
import { StyleBadge } from '@/components/ui/StyleBadge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { roomService } from '@/services/roomService';
import { pushToast } from '@/components/ui/Toast';
import { getStyleById } from '@/data/mockData';
import type { Room, Concept } from '@/types';

export function ConceptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [currentConcept, setCurrentConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      roomService.getRoomByConcept(id),
      roomService.getConcept(id),
    ]).then(([r, c]) => {
      setRoom(r);
      setCurrentConcept(c);
      setLoading(false);
    });
  }, [id]);

  const hasMultiple = room && room.concepts.length >= 2;

  const dateStr = useMemo(() => {
    if (!currentConcept) return '';
    return new Date(currentConcept.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [currentConcept]);

  const handleDelete = async () => {
    if (!currentConcept) return;
    setDeleting(true);
    try {
      await roomService.deleteConcept(currentConcept.id);
      pushToast('success', 'Concept deleted.');
      navigate('/gallery');
    } catch {
      pushToast('error', 'Could not delete. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 lg:px-8 py-12">
        <div className="rounded-2xl bg-surface border border-border-warm overflow-hidden animate-pulse">
          <div className="aspect-[3/2] bg-canvas" />
          <div className="p-6 space-y-3">
            <div className="h-4 w-24 bg-canvas rounded" />
            <div className="h-4 w-48 bg-canvas rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!room || !currentConcept) {
    return (
      <div className="mx-auto max-w-4xl px-5 lg:px-8 py-16 text-center">
        <p className="text-ink-500 mb-4">This concept could not be found.</p>
        <SecondaryButton onClick={() => navigate('/gallery')}>
          Back to Gallery
        </SecondaryButton>
      </div>
    );
  }

  const style = getStyleById(currentConcept.styleId);

  return (
    <div className="mx-auto max-w-4xl px-5 lg:px-8 py-8 lg:py-12">
      <button
        onClick={() => navigate('/gallery')}
        className="mb-6 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </button>

      {/* Compare slider */}
      <div className="relative mb-6 animate-fade-up">
        <div className="absolute top-3 left-3 z-10">
          <StyleBadge styleId={currentConcept.styleId} />
        </div>
        <CompareSlider
          beforeImage={room.originalImage}
          afterImage={currentConcept.resultImage}
        />
      </div>

      {/* Meta + actions */}
      <div className="flex flex-wrap items-center gap-3 mb-8 animate-fade-up">
        {style && <StyleBadge styleId={currentConcept.styleId} />}
        <span className="text-sm text-ink-500">{dateStr}</span>
        <SecondaryButton
          onClick={() => navigate(`/new-makeover?room_id=${room.id}`)}
          className="ml-auto"
        >
          <Plus className="h-4 w-4" />
          Try Another Style
        </SecondaryButton>
      </div>

      {currentConcept.notes && (
        <blockquote className="mb-10 border-l-2 border-accent-soft pl-4 text-ink-700 italic leading-relaxed text-[1.05rem] animate-fade-up">
          {currentConcept.notes}
        </blockquote>
      )}

      {/* Style Shootout */}
      {hasMultiple && (
        <section className="mb-10 animate-fade-up">
          <h2 className="text-xl font-serif text-ink-900 mb-4">Style Shootout</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Original */}
            <div className="overflow-hidden rounded-2xl border border-border-warm">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={room.originalImage}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5">
                <span className="text-xs font-medium text-ink-500">Original</span>
              </div>
            </div>

            {/* Concepts */}
            {room.concepts.map((c) => {
              const isCurrent = c.id === currentConcept.id;
              const cStyle = getStyleById(c.styleId);
              return (
                <button
                  key={c.id}
                  onClick={() => setCurrentConcept(c)}
                  className={`group overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 ${
                    isCurrent
                      ? 'border-accent shadow-warm-md'
                      : 'border-border-warm hover:border-ink-300'
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={c.resultImage}
                      alt={cStyle?.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isCurrent && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-accent text-white text-[0.65rem] font-medium px-2 py-0.5">
                        Viewing
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    {cStyle && (
                      <span className="text-xs font-medium text-ink-900">
                        {cStyle.name}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Try another style tile */}
            <button
              onClick={() => navigate(`/new-makeover?room_id=${room.id}`)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-warm hover:border-accent hover:bg-accent-50/30 transition-all duration-200 aspect-square text-ink-500 hover:text-accent"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs font-medium text-center px-2">
                Try Another Style
              </span>
            </button>
          </div>
        </section>
      )}

      {/* Delete */}
      <div className="pt-6 border-t border-border-warm">
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-2 text-sm text-ink-500 hover:text-error transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete this concept
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete this concept?"
        message="This will permanently remove this style concept from your gallery. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
