import React from 'react';
import { Radio, WifiOff, Tv2 } from 'lucide-react';
import { StreamChannel } from '../../types/sports';

import '@material/web/chips/filter-chip.js';

export interface ChannelSelectorBarProps {
  channels: StreamChannel[];
  activeChannelId: string;
  onSelectChannel: (channel: StreamChannel) => void;
  className?: string;
}

/**
 * ChannelSelectorBar renders dynamic stream channel selector pills using Material 3 Expressive chips.
 *
 * Requirements:
 * - Active channel highlighted with accent border #0070F3, subtle accent glow, and active status badge.
 * - Displays channel name, bitrate badge (e.g., "1080p 60fps"), and operational ping indicator.
 * - Handles available vs unavailable/offline states with accessible aria-labels.
 * - Horizontal smooth-scrolling strip with no scrollbar.
 */
export const ChannelSelectorBar: React.FC<ChannelSelectorBarProps> = ({
  channels,
  activeChannelId,
  onSelectChannel,
  className = '',
}) => {
  if (!channels || channels.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Stream Channel Selector"
      className={`relative w-full py-2.5 px-1 ${className}`}
    >
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
        <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-white/10 text-xs font-semibold text-zinc-400">
          <Tv2 className="h-4 w-4 text-[#0070F3]" />
          <span className="hidden sm:inline">CHANNELS</span>
        </div>

        {channels.map((channel) => {
          const isActive = channel.id === activeChannelId;
          const isAvailable = channel.available !== false;

          return (
            <button
              key={channel.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                if (isAvailable) {
                  onSelectChannel(channel);
                }
              }}
              aria-label={`Switch Stream Channel to ${channel.name}`}
              aria-pressed={isActive}
              title={
                isAvailable
                  ? `Switch to ${channel.name} (${channel.bitrate || '1080p 60fps'})`
                  : `${channel.name} is currently offline`
              }
              className={`
                group relative inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-medium
                transition-all duration-200 select-none cursor-pointer shrink-0 border
                ${
                  isActive
                    ? 'bg-[#0070F3]/15 text-[#0070F3] border-[#0070F3] shadow-[0_0_15px_-3px_rgba(0,112,243,0.4)]'
                    : isAvailable
                    ? 'bg-[#353f49] hover:bg-[#353f49]/80 text-zinc-300 hover:text-white border-white/10 hover:border-white/20'
                    : 'bg-zinc-800/40 text-zinc-500 border-white/5 cursor-not-allowed opacity-50'
                }
              `}
            >
              {/* Status Ping / Dot Indicator */}
              <span className="relative flex h-2 w-2 shrink-0">
                {isActive && isAvailable && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0070F3] opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isActive
                      ? 'bg-[#0070F3]'
                      : isAvailable
                      ? 'bg-emerald-400'
                      : 'bg-zinc-600'
                  }`}
                />
              </span>

              {/* Channel Name */}
              <span className="font-semibold tracking-tight whitespace-nowrap">
                {channel.name}
              </span>

              {/* Bitrate / Stream Type Chip */}
              {isAvailable ? (
                <span
                  className={`
                    px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider transition-colors
                    ${
                      isActive
                        ? 'bg-[#0070F3]/20 text-[#0070F3] font-semibold'
                        : 'bg-black/30 text-zinc-400 group-hover:text-zinc-200'
                    }
                  `}
                >
                  {channel.bitrate || (channel.type === 'hls' ? 'HLS Live' : 'Mirror')}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                  <WifiOff className="h-3 w-3" />
                  OFFLINE
                </span>
              )}

              {/* Direct HLS badge if active */}
              {isActive && channel.type === 'hls' && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <Radio className="h-2.5 w-2.5 animate-pulse" />
                  DIRECT
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
