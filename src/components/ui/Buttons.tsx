import { type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function PrimaryButton({
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      className={`btn-base bg-accent text-white px-6 py-3 text-[0.95rem] font-medium shadow-warm hover:bg-accent-hover active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function SecondaryButton({
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: SecondaryButtonProps) {
  return (
    <button
      className={`btn-base bg-surface text-ink-900 px-6 py-3 text-[0.95rem] font-medium border border-border-warm hover:border-ink-300 hover:bg-canvas active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
