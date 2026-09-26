import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Check, X, Lightbulb, History, DollarSign } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/Buttons';
import { DESIGN_STYLES } from '@/data/mockData';
import { roomService, DEFAULT_BUDGET } from '@/services/roomService';
import { pushToast } from '@/components/ui/Toast';
import type { DesignStyleId } from '@/types';

// Whole US dollars the user wants the makeover to stay within.
const MIN_BUDGET = 500;
const MAX_BUDGET = 100000;

const SAMPLE_PHOTO =
  'https://images.pexels.com/photos/8146336/pexels-photo-8146336.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export function NewMakeover() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [styleId, setStyleId] = useState<DesignStyleId | null>(null);
  const [notes, setNotes] = useState('');
  const [budget, setBudget] = useState(String(DEFAULT_BUDGET));
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  // When set, we're restyling an EXISTING room photo — no re-upload needed.
  const [existingRoomId, setExistingRoomId] = useState<string | null>(null);
  // Styles this room already has a finished concept for: styleId -> conceptId
  const [existingStyles, setExistingStyles] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ?room_id= → preload that room's photo for a new style pass
  useEffect(() => {
    const roomId = searchParams.get('room_id');
    if (!roomId) return;
    roomService.getRoom(roomId).then((room) => {
      if (room && room.originalImage) {
        setExistingRoomId(room.id);
        setPhoto(room.originalImage);
        setPhotoName('Your earlier photo');
        const styles: Record<string, string> = {};
        room.concepts.forEach((c) => {
          styles[c.styleId] = c.id;
        });
        setExistingStyles(styles);
      } else {
        pushToast('error', "Couldn't load that photo — upload a new one.");
      }
    });
  }, [searchParams]);

  const clearExistingRoom = () => {
    setExistingRoomId(null);
    setExistingStyles({});
    setPhoto(null);
    setPhotoName('');
  };

  const handleFile = useCallback((file: File) => {
    setExistingRoomId(null); // picking a new file always starts a new room
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const budgetValue = Number(budget);
  const budgetValid =
    budget.trim() !== '' &&
    Number.isInteger(budgetValue) &&
    budgetValue >= MIN_BUDGET &&
    budgetValue <= MAX_BUDGET;

  const handleGenerate = async () => {
    if (!photo || !styleId || !budgetValid) return;

    // Same style again on the same photo? Don't create a duplicate —
    // take the user to the concept that already exists.
    if (existingRoomId && existingStyles[styleId]) {
      pushToast(
        'success',
        'You already have this style for this room — here it is.'
      );
      navigate(`/concept/${existingStyles[styleId]}`);
      return;
    }

    setLoading(true);
    try {
      // Existing room: skip upload + rooms insert, just start a new makeover
      const makeoverId = existingRoomId
        ? await roomService.generateForRoom(existingRoomId, styleId, notes, budgetValue)
        : await roomService.createMakeover(photo, styleId, notes, budgetValue);
      pushToast('success', 'Makeover started!');
      navigate(`/result/${makeoverId}`);
    } catch {
      pushToast('error', 'Could not generate makeover. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useSamplePhoto = () => {
    setPhoto(SAMPLE_PHOTO);
    setPhotoName('sample-room.jpg');
  };

  const canGenerate = photo && styleId && budgetValid && !loading;

  return (
    <div className="mx-auto max-w-2xl px-5 lg:px-8 py-8 lg:py-12">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-3xl lg:text-4xl font-serif text-ink-900 mb-2">
          New Makeover
        </h1>
        <p className="text-ink-500">
          Four quick steps to see your room in a whole new style.
        </p>
      </div>

      {/* Step 1: Upload */}
      <section className="mb-10 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">
            1
          </span>
          <h2 className="text-xl font-serif text-ink-900">Your room</h2>
        </div>

        {!photo ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 py-16 px-6 text-center ${
              dragging
                ? 'border-accent bg-accent-50/50 scale-[1.01]'
                : 'border-border-warm hover:border-accent-soft hover:bg-surface'
            }`}
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent">
                <Camera className="h-7 w-7" />
              </div>
            </div>
            <p className="text-ink-900 font-medium mb-1">
              Drop a photo or tap to choose
            </p>
            <p className="text-sm text-ink-500">JPG or PNG, up to 10MB</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                useSamplePhoto();
              }}
              className="mt-4 text-sm text-accent font-medium hover:underline"
            >
              or use a sample room photo
            </button>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border border-border-warm bg-surface animate-fade-in">
            <div className="relative">
              <img
                src={photo}
                alt="Your room"
                className="w-full max-h-80 object-cover"
              />
              <button
                onClick={clearExistingRoom}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/60 text-white hover:bg-ink-900/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              {existingRoomId && (
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-ink-900/70 text-white text-xs font-medium px-3 py-1 backdrop-blur-sm">
                  <History className="h-3.5 w-3.5" />
                  Using your earlier photo
                </span>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-ink-500 truncate">{photoName}</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-accent hover:underline"
              >
                {existingRoomId ? 'Upload a different photo' : 'Change photo'}
              </button>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="mt-3 flex items-start gap-2 text-sm text-ink-500">
          <Lightbulb className="h-4 w-4 mt-0.5 text-sage shrink-0" />
          <span>Use a well-lit, wide-angle photo for best results.</span>
        </div>
      </section>

      {/* Step 2: Style */}
      <section className="mb-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">
            2
          </span>
          <h2 className="text-xl font-serif text-ink-900">Pick a style</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DESIGN_STYLES.map((style) => {
            const selected = styleId === style.id;
            const alreadyCreated = Boolean(existingRoomId && existingStyles[style.id]);
            return (
              <button
                key={style.id}
                onClick={() => setStyleId(style.id)}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-200 text-left ${
                  selected
                    ? 'border-accent shadow-warm-md'
                    : alreadyCreated
                    ? 'border-sage/60 opacity-80'
                    : 'border-border-warm hover:border-ink-300'
                }`}
              >
                {alreadyCreated && (
                  <span className="absolute top-2 left-2 z-10 rounded-full bg-sage/90 text-white text-[0.65rem] font-medium px-2 py-0.5 backdrop-blur-sm">
                    Already created
                  </span>
                )}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={style.thumbnail}
                    alt={style.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-ink-900 mb-0.5">
                    {style.name}
                  </p>
                  <p className="text-xs text-ink-500 leading-snug line-clamp-2">
                    {style.description}
                  </p>
                </div>
                {selected && (
                  <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-warm animate-fade-in">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 3: Notes */}
      <section className="mb-10 animate-fade-up" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">
            3
          </span>
          <h2 className="text-xl font-serif text-ink-900">
            Make it yours
            <span className="text-ink-300 text-base font-sans font-normal ml-2">
              (optional)
            </span>
          </h2>
        </div>

        <div className="relative">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 200))}
            rows={3}
            placeholder="e.g., keep the sofa, add plants, warm lighting."
            className="input-base resize-none"
          />
          <span className="absolute bottom-3 right-4 text-xs text-ink-300">
            {notes.length}/200
          </span>
        </div>
      </section>

      {/* Step 4: Budget */}
      <section className="mb-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-sm font-semibold">
            4
          </span>
          <h2 className="text-xl font-serif text-ink-900">Set your budget</h2>
        </div>

        <p className="text-sm text-ink-500 mb-3">
          How much you'd spend on this makeover, in US dollars. The design will aim to stay within it.
        </p>
        <div className="relative max-w-xs">
          <DollarSign className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
          <input
            id="budget"
            type="number"
            inputMode="numeric"
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={50}
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, ''))}
            aria-label="Budget in US dollars"
            aria-invalid={!budgetValid}
            aria-describedby="budget-help"
            className={`input-base pl-10 ${budgetValid ? '' : '!border-error focus:!ring-error/20'}`}
          />
        </div>
        <p
          id="budget-help"
          className={`mt-2 text-xs ${budgetValid ? 'text-ink-300' : 'text-error'}`}
        >
          {budgetValid
            ? `Whole dollars, $${MIN_BUDGET.toLocaleString()} to $${MAX_BUDGET.toLocaleString()}.`
            : `Enter a whole-dollar amount between $${MIN_BUDGET.toLocaleString()} and $${MAX_BUDGET.toLocaleString()}.`}
        </p>
      </section>

      {/* Sticky footer */}
      <div className="fixed bottom-0 inset-x-0 md:relative z-40 bg-surface/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-0 border-border-warm px-5 lg:px-8 py-4 md:py-0 md:pt-2">
        <div className="mx-auto max-w-2xl flex flex-col items-stretch gap-2">
          {!canGenerate && !loading && (
            <p className="text-center text-sm text-ink-500 order-2 md:order-1">
              {!photo
                ? 'Add a photo to get started'
                : !styleId
                ? 'Choose a style to continue'
                : 'Enter a valid budget to continue'}
            </p>
          )}
          <PrimaryButton
            onClick={handleGenerate}
            disabled={!canGenerate}
            loading={loading}
            className="w-full order-1 md:order-2 mb-16 md:mb-0"
          >
            Generate Makeover
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
