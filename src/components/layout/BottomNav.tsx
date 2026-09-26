import { NavLink } from 'react-router-dom';
import { Wand2, Images } from 'lucide-react';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-1 py-2 transition-colors duration-200 ${
    isActive ? 'text-accent' : 'text-ink-500'
  }`;

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border-warm">
      <div className="flex items-center justify-around">
        <NavLink to="/new-makeover" className={tabClass}>
          {({ isActive }) => (
            <>
              <Wand2 className="h-5 w-5" />
              <span className="text-[0.7rem] font-medium">New Makeover</span>
              {isActive && (
                <span className="absolute -top-px h-0.5 w-8 rounded-full bg-accent" />
              )}
            </>
          )}
        </NavLink>
        <NavLink to="/gallery" className={tabClass}>
          {({ isActive }) => (
            <>
              <Images className="h-5 w-5" />
              <span className="text-[0.7rem] font-medium">Gallery</span>
              {isActive && (
                <span className="absolute -top-px h-0.5 w-8 rounded-full bg-accent" />
              )}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
