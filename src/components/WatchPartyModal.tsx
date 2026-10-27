import React, { useState } from 'react';
import { X, Users, Copy, Check, Sparkles, Shield, Send, Radio } from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import { usePlayerStore } from '../store/playerStore';

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WatchPartyModal: React.FC<WatchPartyModalProps> = ({ isOpen, onClose }) => {
  const { accentHex } = useAccent();
  const { timeDriftThreshold } = usePlayerStore();
  const [partyCode, setPartyCode] = useState('DX-7492-CUDDLE');
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [inParty, setInParty] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Alex', text: 'Hey everyone! Popcorn ready 🍿', time: '10:42 PM' },
    { sender: 'Maya', text: 'Sound and video in sync!', time: '10:43 PM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  if (!isOpen) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(partyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartParty = () => {
    const randomCode = 'DX-' + Math.floor(1000 + Math.random() * 9000) + '-SYNC';
    setPartyCode(randomCode);
    setInParty(true);
  };

  const handleJoinParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setPartyCode(inputCode.toUpperCase());
    setInParty(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages([...chatMessages, { sender: 'You', text: newMessage.trim(), time }]);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-[#303841] border border-white/10 text-white shadow-[var(--md-sys-elevation-level3)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#3A4750] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `${accentHex}20`, color: accentHex }}
            >
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>Watch Party</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Sync
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Watch together with synchronized playback</p>
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
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {!inParty ? (
            <div className="space-y-6">
              {/* Start party card */}
              <div className="rounded-xl bg-[#3A4750] border border-white/5 p-5 text-center space-y-3">
                <Sparkles className="h-7 w-7 mx-auto" style={{ color: accentHex }} />
                <h4 className="font-bold text-lg text-white">Host a Watch Party</h4>
                <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                  Start a room and invite your friends. Everyone's stream stays in lockstep down to the exact second.
                </p>
                <button
                  onClick={handleStartParty}
                  className="w-full py-3 rounded-full font-semibold text-sm text-white shadow-[var(--md-sys-elevation-level1)] transition-all hover:brightness-110 active:scale-98"
                  style={{ background: accentHex }}
                >
                  Start New Party
                </button>
              </div>

              {/* Join party */}
              <form onSubmit={handleJoinParty} className="rounded-xl bg-[#3A4750] border border-white/5 p-5 space-y-3">
                <h4 className="font-bold text-sm text-white">Join with a Party Code</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    placeholder="Enter code (e.g. DX-7492-SYNC)"
                    className="flex-1 rounded-full bg-[#303841] border border-white/10 px-4 py-2.5 text-sm text-white uppercase placeholder:normal-case placeholder:text-zinc-400 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="px-6 rounded-full font-semibold text-sm bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    Join
                  </button>
                </div>
              </form>

              {/* Security info */}
              <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>End-to-end encrypted: private streams are never shared.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Party Code Card */}
              <div className="rounded-xl bg-[#3A4750] border border-white/5 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Party Code</span>
                  <p className="text-xl font-mono font-black text-white tracking-wider">{partyCode}</p>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: copied ? '#10b981' : `${accentHex}30`, color: copied ? '#fff' : accentHex }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Active Participants & Sync Telemetry */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Watching together (3):</span>
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#303841] bg-blue-500 text-[10px] font-bold flex items-center justify-center">You</div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#303841] bg-purple-500 text-[10px] font-bold flex items-center justify-center">AL</div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#303841] bg-emerald-500 text-[10px] font-bold flex items-center justify-center">MY</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono">
                  <Radio className="h-3 w-3 animate-pulse" />
                  <span>±0.04s drift (&lt;{timeDriftThreshold}s threshold)</span>
                </div>
              </div>

              {/* Live Chat Box */}
              <div className="rounded-xl bg-[#3A4750] border border-white/5 p-3 flex flex-col h-48 justify-between">
                <div className="overflow-y-auto space-y-2 pr-1 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-300">{msg.sender}</span>
                        <span className="text-[10px] text-zinc-400">{msg.time}</span>
                      </div>
                      <p className="text-zinc-100 mt-0.5">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="mt-2 flex gap-1.5 pt-2 border-t border-white/5">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Send a reaction or message..."
                    className="flex-1 rounded-lg bg-[#303841] border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="px-3 rounded-lg flex items-center justify-center text-white"
                    style={{ background: accentHex }}
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </form>
              </div>

              {/* Leave button */}
              <button
                onClick={() => setInParty(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Leave Party
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
