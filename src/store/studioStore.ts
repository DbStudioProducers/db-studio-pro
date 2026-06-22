import { create } from 'zustand';

export const SESSION_EXT = '.dbstudio';

export interface Track {
  id: number;
  name: string;
  gain: number;
  isMuted: boolean;
  isSolo: boolean;
  color: string;
  inputLevel: number;
}

interface StudioState {
  isRunning: boolean;
  tracks: Track[];
  togglePower: () => Promise<void>;
  updateTrackGain: (id: number, gain: number) => void;
  updateMeters: (levels: Record<number, number>) => void;
  toggleMute: (id: number) => void;
  toggleSolo: (id: number) => void;
  saveSession: () => void;
  loadSession: (file: File) => Promise<void>;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  isRunning: false,
  tracks: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Input ${i + 1}`,
    gain: 0.7,
    isMuted: false,
    isSolo: false,
    color: i % 2 === 0 ? '#3b82f6' : '#ef4444',
    inputLevel: 0
  })),

  togglePower: async () => {
    const state = get();
    set({ isRunning: !state.isRunning });
  },

  updateTrackGain: (id, gain) => set(state => ({
    tracks: state.tracks.map(t => t.id === id ? { ...t, gain } : t)
  })),

  updateMeters: (levels) => set(state => ({
    tracks: state.tracks.map(t => ({ ...t, inputLevel: levels[t.id] || 0 }))
  })),

  toggleMute: (id) => set(state => ({
    tracks: state.tracks.map(t => t.id === id ? { ...t, isMuted: !t.isMuted } : t)
  })),

  toggleSolo: (id) => set(state => ({
    tracks: state.tracks.map(t => t.id === id ? { ...t, isSolo: !t.isSolo } : t)
  })),

  saveSession: () => {
    const data = JSON.stringify(get());
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Session${SESSION_EXT}`;
    link.click();
  },

  loadSession: async (file) => {
    const text = await file.text();
    set(JSON.parse(text));
  }
}));
