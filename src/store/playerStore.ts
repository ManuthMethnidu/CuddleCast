import { create } from 'zustand';
import { MediaItem } from '../types/schema';

export interface ChannelInfo {
  id: string;
  name: string;
  category: string;
  logo: string;
  streamUrl: string;
  isYoutube?: boolean;
  youtubeId?: string;
  epgNow?: string;
  quality?: string;
}

export interface PlayerState {
  // Current Playback State
  currentMedia: MediaItem | null;
  activeChannel: ChannelInfo | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  playbackSpeed: number;
  isScrubbing: boolean;
  scrubTime: number;
  isPiP: boolean;
  isStalled: boolean;
  hasPlaybackError: boolean;
  playbackErrorMessage: string | null;

  // Watch Party / Sync Management
  timeDriftThreshold: number; // default: 2.0s
  hostTimestamp: number | null;
  isWatchPartyHost: boolean;

  // Actions
  playMedia: (media: MediaItem) => void;
  playChannel: (channel: ChannelInfo) => void;
  pause: () => void;
  resume: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setMuted: (isMuted: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setScrubbing: (isScrubbing: boolean, scrubTime?: number) => void;
  setPiP: (isPiP: boolean) => void;
  setStalled: (isStalled: boolean) => void;
  setPlaybackError: (error: string | null) => void;
  clearPlaybackError: () => void;
  closePlayer: () => void;

  // Watch Party Time-Drift Threshold Sync Handler
  syncWithHostTimestamp: (
    hostTime: number,
    onDriftExceeded?: (targetTime: number) => void
  ) => boolean;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentMedia: null,
  activeChannel: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 1,
  isMuted: false,
  playbackSpeed: 1,
  isScrubbing: false,
  scrubTime: 0,
  isPiP: false,
  isStalled: false,
  hasPlaybackError: false,
  playbackErrorMessage: null,

  timeDriftThreshold: 2.0, // 2-second threshold prevents audio micro-stuttering
  hostTimestamp: null,
  isWatchPartyHost: false,

  playMedia: (media) => {
    set({
      currentMedia: media,
      activeChannel: null,
      isPlaying: true,
      hasPlaybackError: false,
      playbackErrorMessage: null,
      currentTime: 0,
    });
  },

  playChannel: (channel) => {
    set({
      activeChannel: channel,
      currentMedia: null,
      isPlaying: true,
      hasPlaybackError: false,
      playbackErrorMessage: null,
      currentTime: 0,
    });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setBuffered: (buffered) => set({ buffered }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setMuted: (isMuted) => set({ isMuted }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

  setScrubbing: (isScrubbing, scrubTime = 0) =>
    set({ isScrubbing, scrubTime }),

  setPiP: (isPiP) => set({ isPiP }),
  setStalled: (isStalled) => set({ isStalled }),

  setPlaybackError: (error) =>
    set({
      hasPlaybackError: !!error,
      playbackErrorMessage: error,
      isPlaying: false,
      isStalled: false,
    }),

  clearPlaybackError: () =>
    set({
      hasPlaybackError: false,
      playbackErrorMessage: null,
    }),

  closePlayer: () =>
    set({
      currentMedia: null,
      activeChannel: null,
      isPlaying: false,
      isPiP: false,
      hasPlaybackError: false,
      playbackErrorMessage: null,
    }),

  /**
   * Watch Party Time-Drift Threshold Handler:
   * If local playback drifts by > timeDriftThreshold (2.0s) from the host,
   * performs an atomic seek to the host position instead of constant micro-stuttering.
   */
  syncWithHostTimestamp: (hostTime: number, onDriftExceeded) => {
    const { currentTime, timeDriftThreshold } = get();
    const drift = Math.abs(currentTime - hostTime);

    set({ hostTimestamp: hostTime });

    if (drift > timeDriftThreshold) {
      if (onDriftExceeded) {
        onDriftExceeded(hostTime);
      }
      set({ currentTime: hostTime });
      return true; // Drift corrected via atomic seek
    }

    return false; // In sync
  },
}));
