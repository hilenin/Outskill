import { useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export function GalleryEmpty() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-6xl px-5 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-serif text-ink-900 mb-1">
          Your Gallery
        </h1>
        <p className="text-ink-500">All your reimagined rooms in one place.</p>
      </div>
      <EmptyState
        icon={<Inbox className="h-10 w-10" />}
        title="No makeovers yet"
        subtitle="Transform your first room and see it in a brand new style."
        actionLabel="Create your first makeover"
        onAction={() => navigate('/new-makeover')}
      />
    </div>
  );
}
