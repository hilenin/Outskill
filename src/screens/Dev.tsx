import { Link } from 'react-router-dom';
import { Eye, Wand2, Image, CheckCircle, AlertTriangle, Inbox, Layers } from 'lucide-react';

interface DevLinkProps {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function DevLink({ to, label, description, icon }: DevLinkProps) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl bg-surface border border-border-warm hover:border-accent hover:shadow-warm p-4 transition-all duration-200"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-ink-700 group-hover:bg-accent-50 group-hover:text-accent transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">{description}</p>
      </div>
    </Link>
  );
}

export function Dev() {
  return (
    <div className="mx-auto max-w-3xl px-5 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-ink-900 mb-1">Dev Preview</h1>
        <p className="text-ink-500 text-sm">
          Links to every screen in every mock state for end-to-end review.
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">
            Auth
          </h2>
          <div className="space-y-2">
            <DevLink
              to="/signin"
              label="Sign In / Sign Up"
              description="Split layout with hero collage, tabbed auth card"
              icon={<Wand2 className="h-5 w-5" />}
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">
            Creation Flow
          </h2>
          <div className="space-y-2">
            <DevLink
              to="/new-makeover"
              label="New Makeover"
              description="3-step flow: upload, pick style, notes"
              icon={<Wand2 className="h-5 w-5" />}
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">
            Result States
          </h2>
          <div className="space-y-2">
            <DevLink
              to="/result/concept-new"
              label="Result — Loading"
              description="Shimmer overlay with rotating status lines"
              icon={<Eye className="h-5 w-5" />}
            />
            <DevLink
              to="/result/concept-1a"
              label="Result — Complete"
              description="Before/after compare slider, save/try actions"
              icon={<CheckCircle className="h-5 w-5" />}
            />
            <DevLink
              to="/result/concept-nonexistent"
              label="Result — Failed"
              description="Encouraging error message with retry"
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">
            Gallery
          </h2>
          <div className="space-y-2">
            <DevLink
              to="/gallery"
              label="Gallery — With items"
              description="Masonry grid with style badges and multi-style chips"
              icon={<Image className="h-5 w-5" />}
            />
            <DevLink
              to="/dev/gallery-empty"
              label="Gallery — Empty state"
              description="Designed empty state with CTA"
              icon={<Inbox className="h-5 w-5" />}
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">
            Concept Detail
          </h2>
          <div className="space-y-2">
            <DevLink
              to="/concept/concept-1a"
              label="Concept — Multi-style (3 concepts)"
              description="Compare slider + Style Shootout with 3 styles"
              icon={<Layers className="h-5 w-5" />}
            />
            <DevLink
              to="/concept/concept-2a"
              label="Concept — Single style"
              description="Compare slider, no shootout section"
              icon={<Image className="h-5 w-5" />}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
