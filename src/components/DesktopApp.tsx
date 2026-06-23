import React, { useEffect, useRef } from 'react';
import { useStudioStore, SESSION_EXT } from '../store/studioStore';
import { Power, Save, FolderOpen, Settings, Activity, Zap } from 'lucide-react';

const DesktopApp: React.FC = () => {
  const store = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real Audio Metering
  useEffect(() => {
    let raf: number;
    let audioSource: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;

    const startMetering = async () => {
      if (!store.isRunning || !store.audioContext) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: store.system.inputDeviceId || undefined, echoCancellation: false }
        });
        audioSource = store.audioContext.createMediaStreamSource(stream);
        analyser = store.audioContext.createAnalyser();
        analyser.fftSize = 128;
        audioSource.connect(analyser);

        const buffer = new Uint8Array(analyser.frequencyBinCount);

        const loop = () => {
          if (analyser) {
            analyser.getByteFrequencyData(buffer);
            const levels: Record<number, number> = {};
            store.tracks.forEach((track, i) => {
              levels[track.id] = (buffer[i] || 0) / 255 * track.gain * (track.isMuted ? 0 : 1);
            });
            store.updateMeters(levels);
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch (err) {
        console.error("Audio input error:", err);
      }
    };

    startMetering();

    return () => {
      cancelAnimationFrame(raf);
      if (audioSource) audioSource.disconnect();
    };
  }, [store.isRunning, store.audioContext, store.system.inputDeviceId]);

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 bg-[#1a1a1a] border-b border-zinc-800 flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="font-black text-xl tracking-tighter text-blue-500">dB</div>
          <div className="text-sm font-bold uppercase tracking-widest text-zinc-400">STUDIO</div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => store.saveSession()} className="flex items-center gap-2 text-zinc-400 hover:text-white">
            <Save size={18} /> Save
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-zinc-400 hover:text-white">
            <FolderOpen size={18} /> Open
          </button>
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && store.loadSession(e.target.files[0])} className="hidden" accept=".dbstudio" />

          <button
            onClick={() => store.togglePower()}
            className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
              store.isRunning ? 'bg-green-600 text-white' : 'bg-zinc-700 text-zinc-300'
            }`}
          >
            <Power size={18} />
            {store.isRunning ? 'ENGINE RUNNING' : 'START ENGINE'}
          </button>

          <button onClick={() => store.setSettingsOpen(true)} className="text-blue-400 hover:text-blue-300">
            <Settings size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tracks */}
        <div className="flex-1 overflow-x-auto flex p-4 gap-3 bg-[#151515]">
          {store.tracks.map(track => (
            <div key={track.id} className="w-44 bg-[#1f1f1f] border border-zinc-700 rounded-xl flex flex-col">
              <div className="p-3 border-b border-zinc-700">
                <div className="text-xs text-zinc-500">INPUT {track.id.toString().padStart(2, '0')}</div>
                <div className="font-bold text-white mt-1">{track.name}</div>
              </div>

              <div className="flex-1 p-4 flex flex-col gap-4">
                <div className="h-40 bg-black rounded-lg relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 to-cyan-500 transition-all duration-75"
                    style={{ height: `${track.inputLevel * 100}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.gain}
                  onChange={(e) => store.updateTrackGain(track.id, parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => store.toggleMute(track.id)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${track.isMuted ? 'bg-red-600 text-white' : 'bg-zinc-800'}`}
                  >
                    MUTE
                  </button>
                  <button
                    onClick={() => store.setEditingTrack(track.id)}
                    className="flex-1 py-2 text-xs font-bold bg-blue-600 rounded-lg"
                  >
                    EQ / COMP
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - Mobile Sync */}
        <div className="w-80 bg-[#1a1a1a] border-l border-zinc-800 p-4">
          <div className="text-blue-400 font-bold text-sm mb-4 flex items-center gap-2">
            <Share2 size={18} /> MOBILE SYNC
          </div>
          {store.auxMixes.map(mix => (
            <div
              key={mix.id}
              onClick={() => store.setActiveAux(mix.id)}
              className={`p-4 rounded-xl mb-3 cursor-pointer border transition-all ${
                store.activeAuxId === mix.id ? 'border-blue-500 bg-blue-950/30' : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="font-semibold text-sm">{mix.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesktopApp;
