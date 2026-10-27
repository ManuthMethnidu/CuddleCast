import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, Radio } from 'lucide-react';
import '@material/web/progress/circular-progress.js';
import '@material/web/button/filled-tonal-button.js';

export interface SandboxedEmbedPlayerProps {
  src: string;
  title: string;
  onLoaded?: () => void;
  onError?: () => void;
  className?: string;
  isPausedOrOffline?: boolean;
  offlineMessage?: string;
}

/**
 * SandboxedEmbedPlayer renders an isolated 16:9 <iframe> embed player.
 *
 * Security Model (T-02-01, T-02-02):
 * - Strict sandbox: "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
 * - Explicitly OMITS "allow-top-navigation" and "allow-top-navigation-by-user-activation"
 *   to prevent malicious ad scripts from redirecting users away from CuddleCast.
 * - Enforces referrerPolicy="strict-origin-when-cross-origin" to avoid token/query leaks.
 * - Aspect ratio strictly locked to 16:9 (CLS 0.0).
 */
export const SandboxedEmbedPlayer: React.FC<SandboxedEmbedPlayerProps> = ({
  src,
  title,
  onLoaded,
  onError,
  className = '',
  isPausedOrOffline = false,
  offlineMessage,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Reset loading & error state whenever the stream URL changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoaded?.();
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const handleManualRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setReloadKey((k) => k + 1);
  };

  return (
    <div
      className={`relative w-full aspect-video bg-[#303841] overflow-hidden rounded-2xl border border-white/10 shadow-2xl select-none ${className}`}
      style={{ aspectRatio: '16 / 9' }}
    >
      {/* 1. Sandboxed Iframe (Strict Security Containment) */}
      {!isPausedOrOffline && !hasError && (
        <iframe
          key={`${src}-${reloadKey}`}
          src={src}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          allow="autoplay; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          className={`w-full h-full border-0 bg-black transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      )}

      {/* 2. Loading State with Centered Material 3 Progress & Shimmer */}
      {isLoading && !isPausedOrOffline && !hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#303841]/90 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
            <md-circular-progress
              indeterminate
              style={{
                '--md-circular-progress-active-indicator-color': '#0070F3',
                '--md-circular-progress-size': '48px',
              }}
            />
            <div className="space-y-1.5 animate-pulse">
              <p className="text-sm font-semibold text-white tracking-wide flex items-center justify-center gap-2">
                <Radio className="h-4 w-4 text-[#0070F3] animate-pulse" />
                <span>Connecting to secure stream mirror...</span>
              </p>
              <p className="text-xs text-zinc-400">
                Establishing isolated sandboxed playback session
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Coverage Paused / Offline Overlay */}
      {isPausedOrOffline && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#303841]/95 backdrop-blur-md p-6 text-center">
          <div className="flex flex-col items-center max-w-md space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-semibold text-white">
                Broadcaster Feed Interrupted
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {offlineMessage ||
                  'Broadcaster Feed Interrupted: Upstream broadcast temporarily paused. Standing by for live feed restoration...'}
              </p>
            </div>
            <div className="pt-2">
              <md-filled-tonal-button
                onClick={handleManualRetry}
                className="text-xs font-semibold"
                style={{
                  '--md-filled-tonal-button-container-color': 'rgba(255, 255, 255, 0.1)',
                  '--md-filled-tonal-button-label-text-color': '#FFFFFF',
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" slot="icon" />
                Retry Mirror Connection
              </md-filled-tonal-button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Stream Mirror Load Error State */}
      {hasError && !isPausedOrOffline && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#303841]/95 backdrop-blur-md p-6 text-center">
          <div className="flex flex-col items-center max-w-md space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-lg">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-semibold text-white">
                Stream Mirror Failed to Connect
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The embedded stream mirror refused connection or timed out. Please retry or switch to an alternate channel above.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <md-filled-tonal-button
                onClick={handleManualRetry}
                className="text-xs font-semibold"
                style={{
                  '--md-filled-tonal-button-container-color': 'rgba(255, 255, 255, 0.1)',
                  '--md-filled-tonal-button-label-text-color': '#FFFFFF',
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" slot="icon" />
                Retry Mirror
              </md-filled-tonal-button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Security Isolation Badge (Top Left Corner Indicator) */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-zinc-300">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Sandboxed Mirror</span>
        <span className="text-[10px] text-zinc-400">• Ad Redirects Blocked</span>
      </div>
    </div>
  );
};
