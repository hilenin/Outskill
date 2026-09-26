import type { DesignStyleId } from '@/types';
import { getStyleById } from '@/data/mockData';

interface StyleBadgeProps {
  styleId: DesignStyleId;
  className?: string;
}

export function StyleBadge({ styleId, className = '' }: StyleBadgeProps) {
  const style = getStyleById(styleId);
  if (!style) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-sage-50 text-sage px-3 py-1 text-xs font-medium border border-sage-soft/60 ${className}`}
    >
      {style.name}
    </span>
  );
}
