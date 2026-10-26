import React from 'react';
import { X, MessageSquare, ExternalLink, Sparkles, Shield } from 'lucide-react';
import { useAccent } from '../context/AccentContext';

interface DiscordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscordModal: React.FC<DiscordModalProps> = ({ isOpen, onClose }) => {
  const { accentHex } = useAccent();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#131317] border border-white/10 text-white shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0b0b0d]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5865F2]/20 text-[#5865F2]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Join Discord Community</span>
              </h3>
              <p className="text-xs text-zinc-400">Connect with fellow viewers & movie buffs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Server Card */}
          <div className="rounded-xl bg-[#18181d] border border-white/5 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[#5865F2] flex items-center justify-center shadow-lg">
                <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-white text-base">CuddleCast Community</h4>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    3,840 Online
                  </span>
                  <span>·</span>
                  <span>14,280 Members</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" style={{ color: accentHex }} />
                <span>Request missing movies, anime, and series releases</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" style={{ color: accentHex }} />
                <span>Host public and private Watch Parties with live chat</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" style={{ color: accentHex }} />
                <span>Real-time status alerts for torrent & HLS scrapers</span>
              </div>
            </div>
          </div>

          <a
            href="https://discord.gg/VGQKGPM9Ej"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-98"
            style={{ background: '#5865F2' }}
          >
            <span>Join Discord Server</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
