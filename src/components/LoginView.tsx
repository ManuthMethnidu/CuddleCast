import React, { useState } from 'react';
import { ArrowLeft, Sparkles, KeyRound } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/react';
import { dark } from '@clerk/themes';
import { useAccent } from '../context/AccentContext';
import { EchoraLogo } from './EchoraLogo';

interface LoginViewProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBack, onSuccess }) => {
  const { accentHex } = useAccent();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const hasClerkKey = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  const clerkAppearance = {
    theme: dark,
    variables: {
      colorPrimary: accentHex || '#2185D5',
      colorBackground: '#303841',
      borderRadius: '0.75rem',
    },
    elements: {
      card: 'bg-[#303841] border border-white/10 shadow-2xl rounded-2xl',
      headerTitle: 'text-2xl font-black text-white tracking-tight',
      headerSubtitle: 'text-xs text-zinc-400',
      socialButtonsBlockButton:
        'bg-[#3A4750] border border-white/10 text-white hover:bg-white/10 text-xs font-semibold rounded-xl h-11',
      formButtonPrimary:
        'h-11 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-98 transition-all',
      formFieldInput:
        'bg-[#3A4750] border border-white/10 text-white placeholder-zinc-500 rounded-xl h-11 focus:ring-2 focus:ring-[#2185D5]',
      footerActionLink: 'text-[#2185D5] hover:text-[#2185D5]/80 font-semibold',
    },
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

        {/* Center: Clerk Authentication Form */}
        <div className="mx-auto w-full max-w-sm sm:max-w-md py-6 flex flex-col items-center justify-center">
          {hasClerkKey ? (
            <div className="w-full flex flex-col items-center space-y-4">
              {authMode === 'signin' ? (
                <SignIn
                  routing="hash"
                  appearance={clerkAppearance}
                  fallbackRedirectUrl="/"
                  signUpUrl="#signup"
                />
              ) : (
                <SignUp
                  routing="hash"
                  appearance={clerkAppearance}
                  fallbackRedirectUrl="/"
                  signInUrl="#signin"
                />
              )}

              {/* Mode Toggle & Guest Action */}
              <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2">
                <button
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="hover:text-white underline underline-offset-4 transition-colors"
                >
                  {authMode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    if (onSuccess) onSuccess();
                    else onBack();
                  }}
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Guest Access</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3A4750] border border-white/10 shadow-lg">
                <KeyRound className="h-7 w-7 text-[#2185D5]" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  Clerk Authentication Ready
                </h1>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Linked to Clerk application <code className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">app_3LGvQKNKQ5CvSlC391y2TL39XFS</code>.
                  Add your Publishable Key to activate live sign-in.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#3A4750]/60 border border-white/10 text-left text-xs space-y-2">
                <p className="text-zinc-300 font-semibold">To complete setup:</p>
                <div className="p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-zinc-300 break-all select-all">
                  VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
                </div>
                <p className="text-[11px] text-zinc-400">
                  Find this in your Clerk Dashboard under <strong>API Keys</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSuccess) onSuccess();
                  else onBack();
                }}
                className="w-full h-11 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all hover:brightness-110 active:scale-98 flex items-center justify-center gap-2"
                style={{ background: accentHex }}
              >
                <Sparkles className="h-4 w-4" />
                <span>Continue as Guest Watcher</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer: Legal Disclaimer */}
        <div className="text-center text-[11px] text-zinc-400 pt-6">
          Protected by{' '}
          <a
            href="https://clerk.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-white underline underline-offset-4 hover:text-[#2185D5]"
          >
            Clerk Auth
          </a>
          . By continuing, you agree to our{' '}
          <a href="#" className="underline underline-offset-4 hover:text-white">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="underline underline-offset-4 hover:text-white">
            Privacy
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
