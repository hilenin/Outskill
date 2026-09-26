import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import type { ToastMessage } from '@/types';

type AddToastFn = (type: 'success' | 'error', message: string) => void;

let addToastExternal: AddToastFn | null = null;

export function pushToast(type: 'success' | 'error', message: string) {
  addToastExternal?.(type, message);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  useEffect(() => {
    addToastExternal = addToast;
    return () => {
      addToastExternal = null;
    };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-surface shadow-warm-lg border border-border-warm px-4 py-3 animate-slide-in min-w-[280px] max-w-sm"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-sage mt-0.5 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-error mt-0.5 shrink-0" />
          )}
          <p className="text-sm text-ink-900 flex-1 leading-snug">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-ink-300 hover:text-ink-700 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
