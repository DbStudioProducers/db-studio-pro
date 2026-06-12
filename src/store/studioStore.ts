import { create } from 'zustand';

export const SESSION_EXT = '.dbstudio';

export interface EQSettings { lowShelf: number; lowMid: number; lowMidFreq: number; highMid: number; highMidFreq: number; highShelf: number; }
export interface DynamicsSettings { threshold: number; ratio: number; attack: number; release: number; enabled: boolean; }
export interface Track { id: number; name: string; gain: number; pan: number; isMuted: boolean; isSolo: boolean; color: string; inputLevel: number; eq: EQSettings; comp: DynamicsSettings; }
export interface AuxMix { id: string; name: string; channelLevels: Record<number, number>; }
export interface DeviceInfo { id: string; label: string; kind: 'audioinput' | 'audiooutput'; }
export interface SystemSettings { bufferSize: number; sampleRate: number; inputDeviceId: string; outputDeviceId: string; isNetworkDiscoveryOn: boolean; availableInputs: DeviceInfo[]; availableOutputs: DeviceInfo[]; networkStats: { protocol: 'UDP' | 'TCP'; throughput: string; jitter: string; danteNodes: string[]; }; usbProtocol: string; }

interface StudioState {
  isRunning: boolean; audioContext: AudioContext | null; currentSessionName: string; tracks: Track[]; auxMixes: AuxMix[]; activeAuxId: string; system: SystemSettings; editingTrackId: number | null; isSettingsOpen: boolean;
  togglePower: () => Promise<void>;
  updateTrackGain: (id: number, gain: number) => void;
  updateAuxLevel: (auxId: string, trackId: number, level: number) => void;
  updateMeters: (levels: Record<number, number>) => void;
  saveSession: () => void;
  loadSession: (file: File) => Promise<void>;
  updateTrackEQ: (id: number, eq: Partial<EQSettings>) => void;
  updateTrackComp: (id: number, comp: Partial<DynamicsSettings>) => void;
  setEditingTrack: (id: number | null) => void;
  setSettingsOpen: (open: boolean) => void;
  updateSystem: (updates: Partial<SystemSettings>) => void;
  refreshDevices: () => Promise<void>;
  setActiveAux: (id: string) => void;
  toggleMute: (id: number) => void;
  toggleSolo: (id: number) => void;
  exportMix: () => void;
}

const defaultEQ = { lowShelf: 0, lowMid: 0, lowMidFreq: 500, highMid: 0, highMidFreq: 3000, highShelf: 0 };
const defaultComp = { threshold: -20, ratio: 4, attack: 10, release: 100, enabled: false };

export const useStudioStore = create<StudioState>((set, get) => ({
  isRunning: false, audioContext: null, currentSessionName: 'dB_Studio_Project', activeAuxId: 'aux-1', editingTrackId: null, isSettingsOpen: false,
  system: { bufferSize: 64, sampleRate: 48000, inputDeviceId: 'default', outputDeviceId: 'default', isNetworkDiscoveryOn: true, availableInputs: [], availableOutputs: [], usbProtocol: 'USB 3.0', networkStats: { protocol: 'UDP', throughput: '4.8 Mbps', jitter: '0.2ms', danteNodes: ['Mixer-X32', 'Dante-AVIO'] } },
  auxMixes: [ { id: 'aux-1', name: 'Vocalist (Aux 1)', channelLevels: { 1: 1, 2: 0.5, 3: 0.2, 4: 0.2, 5: 0.4, 6: 0.2, 7: 0.2, 8: 0.5 } }, { id: 'aux-2', name: 'Drummer (Aux 2)', channelLevels: { 1: 0.2, 2: 0.2, 3: 0.2, 4: 0.2, 5: 0.8, 6: 1, 7: 1, 8: 0.2 } } ],
  tracks: Array.from({ length: 8 }).map((_, i) => ({ id: i + 1, name: `Channel ${i + 1}`, gain: 0.7, pan: 0, isMuted: false, isSolo: false, color: i % 2 === 0 ? '#3b82f6' : '#ef4444', inputLevel: 0, eq: { ...defaultEQ }, comp: { ...defaultComp } })),

  togglePower: async () => {
    const state = get();
    if (!state.isRunning) {
      const ctx = new AudioContext();
      set({ isRunning: true, audioContext: ctx });
    } else {
      if (state.audioContext) await state.audioContext.close();
      set({ isRunning: false, audioContext: null });
    }
  },
  updateMeters: (levels) => set(state => ({ tracks: state.tracks.map(t => ({ ...t, inputLevel: levels[t.id] || 0 })) })),
  refreshDevices: async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    set(state => ({ system: { ...state.system, availableInputs: devices.filter(d => d.kind === 'audioinput').map(d => ({ id: d.deviceId, label: d.label, kind: 'audioinput' })), availableOutputs: devices.filter(d => d.kind === 'audiooutput').map(d => ({ id: d.deviceId, label: d.label, kind: 'audiooutput' })) } }));
  },
  updateTrackGain: (id, gain) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, gain } : t) })),
  updateAuxLevel: (auxId, trackId, level) => set(state => ({ auxMixes: state.auxMixes.map(aux => aux.id === auxId ? { ...aux, channelLevels: { ...aux.channelLevels, [trackId]: level } } : aux) })),
  updateTrackEQ: (id, updates) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, eq: { ...t.eq, ...updates } } : t) })),
  updateTrackComp: (id, updates) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, comp: { ...t.comp, ...updates } } : t) })),
  toggleMute: (id) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, isMuted: !t.isMuted } : t) })),
  toggleSolo: (id) => set(state => ({ tracks: state.tracks.map(t => t.id === id ? { ...t, isSolo: !t.isSolo } : t) })),
  setEditingTrack: (id) => set({ editingTrackId: id }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  updateSystem: (updates) => set(state => ({ system: { ...state.system, ...updates } })),
  setActiveAux: (id) => set({ activeAuxId: id }),
  exportMix: () => alert("Exporting Mix as FLAC..."),
  saveSession: () => {
    const data = JSON.stringify(get());
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `${get().currentSessionName}${SESSION_EXT}`; link.click();
  },
  loadSession: async (file) => {
    const text = await file.text();
    set(JSON.parse(text));
  }
}));
