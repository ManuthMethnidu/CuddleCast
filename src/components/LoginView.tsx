import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { supabase } from '../services/supabase';
import { EchoraLogo } from './EchoraLogo';

interface LoginViewProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBack, onSuccess }) => {
  const { accentHex } = useAccent();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (!supabase) {
        // Fallback for offline / guest mode without live Supabase env
        setTimeout(() => {
          setIsLoading(false);
          setSuccessMsg(`Welcome to Echora, ${email.split('@')[0]}! (Offline session activated)`);
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else onBack();
          }, 1000);
        }, 600);
        return;
      }

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Successfully signed in! Redirecting...');
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else onBack();
          }, 800);
        }
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data?.user?.identities?.length === 0) {
          setErrorMsg('An account with this email address already exists. Please sign in.');
        } else {
          setSuccessMsg('Account created successfully! Check your email to confirm or sign in.');
          setTimeout(() => {
            setMode('signin');
            setSuccessMsg(null);
          }, 2000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOauthLoading(provider);

    try {
      if (!supabase) {
        setTimeout(() => {
          setOauthLoading(null);
          setSuccessMsg(`Signed in with ${provider === 'google' ? 'Google' : 'GitHub'} (Guest Mode)`);
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else onBack();
          }, 1000);
        }, 700);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setOauthLoading(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to authenticate with ${provider}.`);
      setOauthLoading(null);
    }
  };

  const handleGuestAccess = () => {
    setSuccessMsg('Guest mode activated. Enjoy unlimited ad-free streaming!');
    setTimeout(() => {
      if (onSuccess) onSuccess();
      else onBack();
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#303841] text-[#F3F3F3] grid lg:grid-cols-2 select-none">
      {/* Left Column: Authentic shadcn login-02 Form Structure */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10">
        {/* Top Header: Brand & Back to Browse */}
        <div className="flex items-center justify-between">
          <EchoraLogo size="md" />

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Browse</span>
          </button>
        </div>

        {/* Center: Main Form Card */}
        <div className="mx-auto w-full max-w-sm sm:max-w-md py-8">
          <div className="space-y-6">
            {/* Header / Title */}
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {mode === 'signin' ? 'Welcome back' : 'Create an account'}
              </h1>
              <p className="text-sm text-zinc-400">
                {mode === 'signin'
                  ? 'Enter your email below to log into your account'
                  : 'Enter your email below to get started with Echora'}
              </p>
            </div>

            {/* Error / Success Notifications */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs animate-fadeIn">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-400" />
                <p className="flex-1 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <p className="flex-1 leading-relaxed">{successMsg}</p>
              </div>
            )}

            {/* Social Authentication Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google OAuth Button */}
              <button
                type="button"
                disabled={isLoading || oauthLoading !== null}
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-[#3A4750] border border-white/10 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 active:scale-98 transition-all disabled:opacity-50 shadow-sm"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 17C3.7 20.6 7.5 23.5 12 23.5z"
                    />
                  </svg>
                )}
                <span>Google</span>
              </button>

              {/* GitHub OAuth Button */}
              <button
                type="button"
                disabled={isLoading || oauthLoading !== null}
                onClick={() => handleOAuth('github')}
                className="flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-[#3A4750] border border-white/10 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 active:scale-98 transition-all disabled:opacity-50 shadow-sm"
              >
                {oauthLoading === 'github' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
                ) : (
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                <span>GitHub</span>
              </button>
            </div>

            {/* "Or continue with" Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-[#303841] px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Or continue with
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Email address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#3A4750] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2185D5] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Password</span>
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => alert('Password reset link will be sent to your email when Supabase SMTP is connected.')}
                      className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-10 rounded-xl bg-[#3A4750] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2185D5] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg transition-all hover:brightness-110 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ background: accentHex }}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            {/* Toggle Mode: Sign In vs Sign Up */}
            <div className="text-center text-xs text-zinc-400">
              {mode === 'signin' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-semibold text-white underline underline-offset-4 hover:text-[#2185D5] transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-semibold text-white underline underline-offset-4 hover:text-[#2185D5] transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            {/* Instant Guest Mode Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGuestAccess}
                className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Continue as Guest Watcher</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Legal Disclaimer */}
        <div className="text-center text-[11px] text-zinc-400 pt-6">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline underline-offset-4 hover:text-white">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline underline-offset-4 hover:text-white">
            Privacy Policy
          </a>
          .
        </div>
      </div>

      {/* Right Column: Hero Cinematic Artwork (shadcn login-02 pattern) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[#1f252b]">
        {/* Cinematic Backdrop Image with Contrast & Vignette */}
        <img
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80"
          alt="Echora Cinematic Experience"
          className="absolute inset-0 h-full w-full object-cover filter brightness-[0.45] contrast-[1.1] scale-105 transform hover:scale-100 transition-transform duration-1000"
        />

        {/* Multi-layered Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#303841] via-transparent to-[#303841]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#303841] via-transparent to-transparent" />

        {/* Top Floating Badge */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-lg">
            Ultra-Crisp 4K HDR Streaming
          </span>
        </div>

        {/* Bottom Floating Cinema Quote Glass Card */}
        <div className="relative z-10 max-w-lg rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium text-white italic leading-relaxed">
              &ldquo;Cinema is a mirror by which we often see ourselves. It doesn&apos;t have a flag or a border or a passport.&rdquo;
            </p>
            <footer className="text-xs font-semibold text-zinc-400 pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-white">Echora Premium Streaming Engine</span>
              <span className="font-mono text-[10px] tracking-wider text-zinc-400">100% AD-FREE</span>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};
