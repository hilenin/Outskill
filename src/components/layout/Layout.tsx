import type { MockUser } from '@/types';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  user: MockUser;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function Layout({ user, onSignOut, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header user={user} onSignOut={onSignOut} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
