import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sofa, ChevronDown, LogOut, User } from 'lucide-react';
import type { MockUser } from '@/types';
import { authService } from '@/services/authService';

interface HeaderProps {
  user: MockUser;
  onSignOut: () => void;
}

export function Header({ user, onSignOut }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    setMenuOpen(false);
    onSignOut();
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-ink-900'
        : 'text-ink-500 hover:text-ink-900'
    }`;

  const navUnderlineClass = ({ isActive }: { isActive: boolean }) =>
    `absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-accent transition-all duration-250 ${
      isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-canvas/85 backdrop-blur-md border-b border-border-warm">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Wordmark */}
          <NavLink to="/gallery" className="flex items-center gap-2 group">
            <Sofa className="h-6 w-6 text-accent transition-transform duration-200 group-hover:scale-110" />
            <span className="text-xl font-serif font-semibold text-ink-900">
              RoomReimagine
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/new-makeover" className={navLinkClass}>
              {({ isActive }) => (
                <span className="relative py-1">
                  New Makeover
                  <span className={navUnderlineClass({ isActive })} />
                </span>
              )}
            </NavLink>
            <NavLink to="/gallery" className={navLinkClass}>
              {({ isActive }) => (
                <span className="relative py-1">
                  Gallery
                  <span className={navUnderlineClass({ isActive })} />
                </span>
              )}
            </NavLink>
          </nav>

          {/* Avatar menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface transition-colors duration-200"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-border-warm"
              />
              <ChevronDown
                className={`h-4 w-4 text-ink-500 transition-transform duration-200 ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface shadow-warm-lg border border-border-warm py-2 animate-fade-up">
                <div className="px-4 py-2 border-b border-border-warm">
                  <p className="text-sm font-medium text-ink-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-ink-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/gallery');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-canvas transition-colors"
                >
                  <User className="h-4 w-4" />
                  My Gallery
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-canvas transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
