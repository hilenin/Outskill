import { Sofa, Plus } from 'lucide-react';
import { PrimaryButton } from './Buttons';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 animate-fade-in">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent-50 text-accent">
        {icon ?? <Sofa className="h-10 w-10" />}
      </div>
      <h3 className="text-2xl font-serif text-ink-900 mb-2">{title}</h3>
      {subtitle && (
        <p className="text-ink-500 max-w-sm mb-6 leading-relaxed">{subtitle}</p>
      )}
      {actionLabel && onAction && (
        <PrimaryButton onClick={onAction}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}
