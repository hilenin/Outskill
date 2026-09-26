import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/Buttons';
import { authService } from '@/services/authService';
import { pushToast } from '@/components/ui/Toast';
import type { MockUser } from '@/types';

interface SignInProps {
  onAuthSuccess: (user: MockUser) => void;
}

export function SignIn({ onAuthSuccess }: SignInProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    setGeneralError('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Enter your email above first, then tap Forgot password' });
      return;
    }
    setResetSending(true);
    try {
      await authService.requestPasswordReset(email);
      pushToast('success', 'Reset link sent — check your email.');
    } catch (err) {
      setGeneralError(
        err instanceof Error ? err.message : 'Could not send the reset email.'
      );
    } finally {
      setResetSending(false);
    }
  };

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Enter a valid email address';
    }
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Must be at least 6 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setGeneralError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const user =
        mode === 'signin'
          ? await authService.signIn(email, password)
          : await authService.signUp(email, password);
      pushToast('success', mode === 'signin' ? 'Welcome back!' : 'Account created!');
      onAuthSuccess(user);
      navigate('/gallery');
    } catch (err) {
      setGeneralError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: hero collage */}
      <div className="relative lg:w-1/2 min-h-[200px] lg:min-h-screen overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2 gap-1">
          <img
            src="https://images.pexels.com/photos/8146336/pexels-photo-8146336.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Room before"
            className="w-full h-full object-cover"
          />
          <img
            src="https://images.pexels.com/photos/8251236/pexels-photo-8251236.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Room after"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-ink-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
          <h1 className="text-3xl lg:text-5xl font-serif text-white leading-tight max-w-md">
            See your room,
            <br />
            reimagined.
          </h1>
        </div>
      </div>

      {/* Right: auth card */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 lg:p-12 bg-canvas">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-serif text-ink-900 mb-1">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-ink-500 text-sm">
              {mode === 'signin'
                ? 'Sign in to reimagine your spaces.'
                : 'Start transforming rooms in minutes.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-2xl bg-surface border border-border-warm p-1 mb-6">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErrors({});
                  setGeneralError('');
                }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                  mode === m
                    ? 'bg-accent text-white shadow-warm'
                    : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {generalError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-error-50 border border-error-soft px-3 py-2.5 text-sm text-error animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`input-base pl-10 ${
                    errors.email ? 'border-error focus:border-error focus:ring-error/20' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-error">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`input-base pl-10 pr-10 ${
                    errors.password ? 'border-error focus:border-error focus:ring-error/20' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-error">{errors.password}</p>
              )}
              {mode === 'signin' && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetSending}
                    className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                  >
                    {resetSending ? 'Sending reset link…' : 'Forgot password?'}
                  </button>
                </div>
              )}
            </div>

            <PrimaryButton
              type="submit"
              loading={loading}
              className="w-full mt-2"
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
}
