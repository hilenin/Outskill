import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './Buttons';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-surface shadow-warm-lg border border-border-warm p-6 animate-fade-up">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-serif text-ink-900 mb-2">{title}</h2>
        <p className="text-ink-500 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <SecondaryButton onClick={onCancel}>{cancelLabel}</SecondaryButton>
          <PrimaryButton
            onClick={onConfirm}
            className="bg-error hover:bg-error/90"
          >
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
