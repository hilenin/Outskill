import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { Spinner } from '@/components/ui/Spinner';
import { pushToast } from '@/components/ui/Toast';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabase';

type Phase = 'waiting' | 'form' | 'saving';

/**
 * Landing page for the password-reset email link. The link signs the user in
 * with a recovery session; the user then picks a new password and signs in
 * with it.
 */
export function ResetPassword() {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Wait for supabase-js to establish the recovery session from the link.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPhase((p) => (p === 'waiting' ? 'form' : p));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) {
        setPhase((p) => (p === 'waiting' ? 'form' : p));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setPhase('saving');
    try {
      await authService.updatePassword(password);
      // Sign out of the recovery session so the user logs in with the new password.
      await authService.signOut();
      pushToast('success', 'Password updated — sign in with your new password.');
      navigate('/signin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setPhase('form');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-5">
      <div className="w-full max-w-md rounded-2xl bg-surface border border-border-warm shadow-warm p-8">
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent">
            <KeyRound className="h-7 w-7" />
          </div>
        </div>

        {phase === 'waiting' && (
          <div className="text-center">
            <h1 className="text-2xl font-serif text-ink-900 mb-2">Reset your password</h1>
            <p className="text-ink-500 text-sm leading-relaxed mb-6">
              Open this page using the link in your reset email. Waiting for the
              secure link&hellip;
            </p>
            <div className="flex justify-center mb-6">
              <Spinner />
            </div>
            <SecondaryButton onClick={() => navigate('/signin')} className="w-full">
              Back to Sign In
            </SecondaryButton>
          </div>
        )}

        {(phase === 'form' || phase === 'saving') && (
          <>
            <h1 className="text-2xl font-serif text-ink-900 mb-1 text-center">
              Choose a new password
            </h1>
            <p className="text-ink-500 text-sm text-center mb-6">
              You&rsquo;ll sign in with this from now on.
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-error-50 border border-error-soft px-3 py-2.5 text-sm text-error animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-base pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <PrimaryButton
                type="submit"
                loading={phase === 'saving'}
                className="w-full mt-2"
              >
                Set new password
              </PrimaryButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
