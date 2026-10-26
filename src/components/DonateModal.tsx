import React, { useState } from 'react';
import { X, Bitcoin, Copy, Check, Heart, ShieldCheck } from 'lucide-react';
import { useAccent } from '../context/AccentContext';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLETS = [
  {
    crypto: 'Bitcoin (BTC)',
    symbol: 'BTC',
    network: 'Bitcoin Native (SegWit)',
    address: 'bc1q8y0z42q009g7k6h695q32n7k30r3k6w9z3m0e',
    color: '#F7931A',
  },
  {
    crypto: 'Ethereum (ETH)',
    symbol: 'ETH',
    network: 'ERC-20',
    address: '0x71C692aC7fB891A9b9A208D1F7B91278C1D6B829',
    color: '#627EEA',
  },
  {
    crypto: 'Solana (SOL)',
    symbol: 'SOL',
    network: 'Solana Mainnet',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJos9q2L',
    color: '#14F195',
  },
  {
    crypto: 'Tether (USDT)',
    symbol: 'USDT',
    network: 'TRC-20 (Tron)',
    address: 'TX9H1a3q8J9eX2sP9V8cM7kF5tB3zL4vW8',
    color: '#26A17B',
  },
];

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const { accentHex } = useAccent();
  const [selectedWallet, setSelectedWallet] = useState(WALLETS[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedWallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#131317] border border-white/10 text-white shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0b0b0d]">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: `${accentHex}20`, color: accentHex }}
            >
              <Bitcoin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Support CuddleCast</span>
                <Heart className="h-4 w-4 fill-rose-500 text-rose-500 animate-pulse" />
              </h3>
              <p className="text-xs text-zinc-400">Keep servers 100% ad-free & high-speed</p>
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
          <p className="text-xs text-zinc-300 leading-relaxed text-center">
            CuddleCast runs zero ads and zero tracking. All streaming proxies, scraping servers, and HLS relays are powered by community crypto donations.
          </p>

          {/* Wallet Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {WALLETS.map(w => (
              <button
                key={w.symbol}
                onClick={() => {
                  setSelectedWallet(w);
                  setCopied(false);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedWallet.symbol === w.symbol
                    ? 'bg-white/15 border-white/30 text-white shadow'
                    : 'bg-[#18181d] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {w.symbol}
              </button>
            ))}
          </div>

          {/* Wallet Details Card */}
          <div className="rounded-xl bg-[#18181d] border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">{selectedWallet.crypto}</span>
                <span className="text-[11px] text-zinc-400 font-mono">Network: {selectedWallet.network}</span>
              </div>
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: selectedWallet.color }}
              />
            </div>

            {/* Address Box */}
            <div className="flex items-center gap-2 rounded-lg bg-[#0b0b0d] border border-white/10 p-2.5 font-mono text-[11px] text-zinc-300 break-all">
              <span className="flex-1 truncate">{selectedWallet.address}</span>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 shadow"
              style={{
                background: copied ? '#10b981' : accentHex,
                color: '#ffffff',
              }}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Address Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy {selectedWallet.symbol} Address</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Direct on-chain wallet addresses · 100% verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
