import { create } from 'zustand';

export const SESSION_EXT = '.dbstudio';

export interface EQSettings { lowShelf: number; lowMid: number; lowMidFreq: number; highMid: number; highMidFreq: number; highShelf: number; }
export interface DynamicsSettings { threshold: number; ratio: number; attack: number; release: number; enabled: boolean; }
export interface Track { id: number; name: string; gain: number; isMuted: boolean; isSolo: boolean; color: string; inputLevel: number; eq: EQSettings; comp: DynamicsSettings; }
export interface AuxMix { id: string; name: string; channelLevels: Record<number, number>; }

interface StudioState {
  isRunning: boolean;
  audioContext: AudioContext | null;
  tracks: Track[];
  auxMixes: AuxMix[];
  activeAuxId: string;
  isSettingsOpen: boolean;
  editingTrackId: number | null;
  system: any;
  currentSessionName: string;

  togglePower: () => Promise<void>;
  updateTrackGain: (id: number, gain: number) => void;
  updateAuxLevel: (auxId: string, trackId: number, level: number) => void;
  updateMeters: (levels: Record<number, number>) => void;
  setSettingsOpen: (open: boolean) => void;
  setEditingTrack: (id: number | null) => void;
  updateSystem: (updates: any) => void;
  saveSession: () => void;
  loadSession: (file: File) => Promise<void>;
  updateTrackEQ: (id: number, eq: Partial<EQSettings>) => void;
  updateTrackComp: (id: number, comp: Partial<DynamicsSettings>) => void;
  toggleMute: (id: number) => void;
  toggleSolo: (id: number) => void;
  setActiveAux: (id: string) => void;
  refreshDevices: () => Promise<void>;
}

const defaultEQ: EQSettings = { lowShelf: 0, lowMid: 0, lowMidFreq: 500, highMid: 0, highMidFreq: 3000, highShelf: 0 };
const defaultComp: DynamicsSettings = { threshold: -20, ratio: 4, attack: 10, release: 100, enabled: false };

export const useStudioStore = create<StudioState>((set, get) => ({
  isRunning: false,
  audioContext: null,
  currentSessionName: 'dB_Studio_Session',
  activeAuxId: 'aux-1',
  editingTrackId: null,
  isSettingsOpen: false,
  system: {
    bufferSize: 64, sampleRate: 48000, inputDeviceId: 'default', outputDeviceId: 'default',
    availableInputs: [], availableOutputs: [], networkStats: { protocol: 'UDP', throughput: '0 Mbps', jitter: '0ms' }
  },
  auxMixes: [
    { id: 'aux-1', name: 'Personal Mix (Aux 1)', channelLevels: { 1: 1, 2: 0.5, 3: 0.2, 4: 0.2, 5: 0.4, 6: 0.2, 7: 0.2, 8: 0.5 } }
  ],
  tracks: Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1, name: `Input ${i + 1}`, gain: 0.7, isMuted: false, isSolo: false, color: i % 2 === 0 ? '#3b82f6' : '#ef4444', inputLevel: 0, eq: { ...defaultEQ }, comp: { ...defaultComp }
  })),

  togglePower: async () => {
    const state = get();
    if (!state.isRunning) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      set({ isRunning: true, audioContext: ctx });
    } else {
      if (state.audioContext) await state.audioContext.close();
      set({ isRunning: false, audioContext: null });
    }
  },

  updateMeters: (levels) => set(state => ({
    tracks: state.tracks.map(t => ({ ...t, inputLevel: levels[t.id] || 0 }))
  })),

  refreshDevices: async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    set(state => ({
      system: {
        ...state.system,
        availableInputs: devices.filter(d => d.kind === 'audioinput'),
        availableOutputs: devices.filter(d => d.kind === 'audiooutput')
      }
    }));
  },

  updateTrackGain: (id, gain) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, gain } : t) })),
  updateAuxLevel: (auxId, trackId, level) => set(state => ({ auxMixes: state.auxMixes.map(aux => aux.id === auxId ? { ...aux, channelLevels: { ...aux.channelLevels, [trackId]: level } } : aux) })),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setEditingTrack: (id) => set({ editingTrackId: id }),
  updateSystem: (updates) => set(state => ({ system: { ...state.system, ...updates } })),
  setActiveAux: (id) => set({ activeAuxId: id }),
  updateTrackEQ: (id, updates) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, eq: { ...t.eq, ...updates } } : t) })),
  updateTrackComp: (id, updates) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, comp: { ...t.comp, ...updates } } : t) })),
  toggleMute: (id) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, isMuted: !t.isMuted } : t) })),
  toggleSolo: (id) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, isSolo: !t.isSolo } : t) })),
  
  saveSession: () => {
    const data = JSON.stringify(get());
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${get().currentSessionName}${SESSION_EXT}`;
    link.click();
  },

  loadSession: async (file) => {
    const text = await file.text();
    set(JSON.parse(text));
  }
}));
