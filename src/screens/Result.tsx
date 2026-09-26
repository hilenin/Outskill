import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles, ArrowLeft, AlertTriangle } from 'lucide-react';
import { CompareSlider } from '@/components/ui/CompareSlider';
import { StyleBadge } from '@/components/ui/StyleBadge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import {
  roomService,
  parseWaitToken,
  type MakeoverStatus,
} from '@/services/roomService';
import { pushToast } from '@/components/ui/Toast';
import { getStyleById } from '@/data/mockData';
import type { GenerationStatus } from '@/types';

const POLL_INTERVAL_MS = 2500;
const CLIENT_TIMEOUT_MS = 120_000; // n8n + Gemini can take a while

const LOADING_MESSAGES = [
  'Analyzing your room\u2026',
  'Applying your style\u2026',
  'Rendering your makeover\u2026',
];

export function Result() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<GenerationStatus>('loading');
  const [view, setView] = useState<'compare' | 'after'>('compare');
  const [messageIndex, setMessageIndex] = useState(0);
  const [makeover, setMakeover] = useState<MakeoverStatus | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Two modes:
  // 1. Wait-token (`wait__room__style__since__notes`): the n8n webhook was
  //    triggered and will INSERT its own makeovers row — poll for a new
  //    completed concept on that room, then swap to its real id.
  // 2. Concept id: load/poll that row directly.
  useEffect(() => {
    if (!id) return;
    let stopped = false;
    const startedAt = Date.now();
    const wait = parseWaitToken(id);

    const tick = async () => {
      if (wait) {
        const conceptId = await roomService.findConceptSince(
          wait.roomId,
          wait.styleId,
          wait.since
        );
        if (stopped) return;
        if (conceptId) {
          navigate(`/result/${conceptId}`, { replace: true });
          return;
        }
        if (Date.now() - startedAt > CLIENT_TIMEOUT_MS) setStatus('failed');
        return;
      }
      const m = await roomService.getMakeoverStatus(id);
      if (stopped) return;
      if (!m) {
        setStatus('failed');
        return;
      }
      setMakeover(m);
      if (m.status === 'complete') {
        setStatus('complete');
      } else if (m.status === 'failed' || Date.now() - startedAt > CLIENT_TIMEOUT_MS) {
        setStatus('failed');
      } else {
        setStatus('loading');
      }
    };

    setStatus('loading');
    setMessageIndex(0);

    // Wait mode: seed the loading UI with the room photo + chosen style
    if (wait) {
      roomService.getRoom(wait.roomId).then((room) => {
        if (stopped || !room) return;
        setMakeover({
          id,
          status: 'pending',
          styleId: wait.styleId,
          notes: wait.notes,
          roomId: wait.roomId,
          beforeUrl: room.originalImage,
          afterUrl: null,
        });
      });
    }

    tick();
    const interval = setInterval(() => {
      if (stopped) return;
      tick();
    }, POLL_INTERVAL_MS);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [id, navigate]);

  useEffect(() => {
    if (status !== 'loading') return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [status]);

  const concept = status === 'complete' && makeover?.afterUrl ? makeover : null;
  const styleId = makeover?.styleId ?? 'japandi';
  const style = getStyleById(styleId);
  const beforeImage = makeover?.beforeUrl ?? '';
  const afterImage = makeover?.afterUrl ?? '';
  const notes = makeover?.notes ?? '';
  const isDailyLimit = makeover?.errorReason === 'daily_limit';

  const handleSaveToGallery = () => {
    pushToast('success', 'Saved to your gallery!');
    navigate('/gallery');
  };

  const handleTryAnotherStyle = () => {
    navigate(
      makeover?.roomId ? `/new-makeover?room_id=${makeover.roomId}` : '/new-makeover'
    );
  };

  const handleRetry = async () => {
    if (!id) return;
    setRetrying(true);
    try {
      const wait = parseWaitToken(id);
      const newId = wait
        ? await roomService.generateForRoom(wait.roomId, wait.styleId, wait.notes, wait.budget)
        : await roomService.retryMakeover(id);
      navigate(`/result/${newId}`, { replace: true });
    } catch {
      pushToast('error', "Couldn't retry \u2014 please try again.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 py-8 lg:py-12">
      <button
        onClick={() => navigate('/gallery')}
        className="mb-6 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gallery
      </button>

      {/* LOADING STATE */}
      {status === 'loading' && (
        <div className="animate-fade-in">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src={beforeImage}
              alt="Your room"
              className="w-full aspect-[3/2] object-cover"
            />
            <div className="absolute inset-0 bg-ink-900/40" />
            <div className="absolute inset-0 shimmer-overlay overflow-hidden" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-warm-md">
                <Sparkles className="h-7 w-7 text-accent animate-pulse" />
              </div>
              <p className="text-white text-lg font-serif text-center px-4 transition-all duration-300">
                {LOADING_MESSAGES[messageIndex]}
              </p>
              {style && (
                <div className="mt-1">
                  <StyleBadge styleId={styleId} className="bg-white/90" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {LOADING_MESSAGES.map((msg, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 text-sm transition-all duration-300 ${
                  i <= messageIndex
                    ? 'text-ink-900 opacity-100'
                    : 'text-ink-300 opacity-60'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                    i <= messageIndex ? 'bg-accent' : 'bg-border-warm'
                  }`}
                />
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETE STATE */}
      {status === 'complete' && concept && (
        <div className="animate-fade-up">
          <div className="relative mb-4">
            <div className="absolute top-3 left-3 z-10">
              <StyleBadge styleId={styleId} />
            </div>
            {view === 'compare' ? (
              <CompareSlider
                beforeImage={beforeImage}
                afterImage={afterImage}
              />
            ) : (
              <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: '3 / 2' }}>
                <img
                  src={afterImage}
                  alt="After"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Before/After toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-1 rounded-full bg-surface border border-border-warm p-1">
              <button
                onClick={() => setView('compare')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  view === 'compare'
                    ? 'bg-accent text-white shadow-warm'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                Before / After
              </button>
              <button
                onClick={() => setView('after')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  view === 'after'
                    ? 'bg-accent text-white shadow-warm'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                After only
              </button>
            </div>
          </div>

          {notes && (
            <p className="text-center text-ink-500 italic mb-8 max-w-lg mx-auto leading-relaxed">
              &ldquo;{notes}&rdquo;
            </p>
          )}

          {/* Action bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PrimaryButton onClick={handleSaveToGallery}>
              Save to Gallery
            </PrimaryButton>
            <SecondaryButton onClick={handleTryAnotherStyle}>
              <RefreshCw className="h-4 w-4" />
              Try Another Style
            </SecondaryButton>
          </div>
        </div>
      )}

      {/* FAILED STATE */}
      {status === 'failed' && (
        <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error-50 text-error">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-serif text-ink-900 mb-2">
            {isDailyLimit ? 'Daily limit reached' : 'That one didn’t work'}
          </h2>
          <p className="text-ink-500 mb-8 max-w-sm leading-relaxed">
            {isDailyLimit
              ? 'You’ve hit today’s makeover limit — try again tomorrow.'
              : 'Let’s try again — sometimes a different photo or style works better.'}
          </p>
          {!isDailyLimit && (
            <PrimaryButton onClick={handleRetry} loading={retrying}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}
