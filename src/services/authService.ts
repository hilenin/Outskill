import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { MockUser } from '@/types';

// Real Supabase auth service — replaces the authService in mockService.ts.
// Maps Supabase users onto the existing MockUser shape so no component changes.

function toAppUser(u: User): MockUser {
  const email = u.email ?? '';
  return {
    id: u.id,
    email,
    name: email.split('@')[0] || 'You',
    avatarUrl: '',
  };
}

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials'))
    return "That email or password doesn't look right.";
  if (m.includes('already registered') || m.includes('already exists'))
    return 'You already have an account — try signing in.';
  if (m.includes('at least 6') || m.includes('password'))
    return 'Password must be at least 6 characters.';
  if (m.includes('rate limit'))
    return 'Too many attempts — wait a minute and try again.';
  return 'Something went wrong. Please try again.';
}

export const authService = {
  async signIn(email: string, password: string): Promise<MockUser> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendly(error.message));
    return toAppUser(data.user);
  },

  async signUp(email: string, password: string): Promise<MockUser> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(friendly(error.message));
    // Email confirmation is disabled for this project, so a session exists
    // immediately and data.user is present.
    if (!data.user) throw new Error('Something went wrong. Please try again.');
    return toAppUser(data.user);
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  /** Restore the persisted session on app load (null if signed out). */
  async getSession(): Promise<MockUser | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ? toAppUser(data.session.user) : null;
  },

  /** Subscribe to sign-in/sign-out events. Returns an unsubscribe function. */
  onAuthChange(callback: (user: MockUser | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? toAppUser(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  },

  /** Send the password-reset email; the link lands on /reset-password. */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(friendly(error.message));
  },

  /**
   * Called on /reset-password after the user arrives via the email link
   * (which signs them in with a recovery session). Sets the password the
   * user chose.
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(friendly(error.message));
  },
};
