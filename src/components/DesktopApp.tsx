import React, { useEffect, useRef } from 'react';
import { useStudioStore, SESSION_EXT } from '../store/studioStore';

const DesktopApp: React.FC = () => {
  const store = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LOGICA REAL DO ANALISADOR DE ÁUDIO
  useEffect(() => {
    let animationFrame: number;
    let audioSrc: MediaStreamAudioSourceNode | null = null;
    let analyzer: AnalyserNode | null = null;

    const runEngine = async () => {
      if (store.isRunning && store.audioContext) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { deviceId: store.system.inputDeviceId, echoCancellation: false } 
          });
          audioSrc = store.audioContext.createMediaStreamSource(stream);
          analyzer = store.audioContext.createAnalyser();
          analyzer.fftSize = 256;
          audioSrc.connect(analyzer);
          const dataArray = new Uint8Array(analyzer.frequencyBinCount);

          const update = () => {
            if (analyzer) {
              analyzer.getByteFrequencyData(dataArray);
              const levels: Record<number, number> = {};
              store.tracks.forEach((track, i) => {
                const val = dataArray[i * 2] || 0;
                levels[track.id] = (val / 255) * track.gain * (track.isMuted ? 0 : 1);
              });
              store.updateMeters(levels);
              animationFrame = requestAnimationFrame(update);
            }
          };
          update();
        } catch (err) { console.error(err); }
      } else { store.updateMeters({}); }
    };

    runEngine();
    return () => cancelAnimationFrame(animationFrame);
  }, [store.isRunning, store.audioContext, store.system.inputDeviceId]);

  return (
    <div className="flex flex-col h-screen bg-[#111] text-[#ccc] font-sans overflow-hidden">
      <header className="h-12 bg-[#2a2a2a] border-b border-black flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-blue-600 rounded text-white font-black italic text-xs">dB STUDIO</div>
          <button onClick={() => store.saveSession()} className="p-2 hover:bg-white/5 rounded">SAVE</button>
          <button onClick={() => store.togglePower()} className={`px-4 py-1.5 rounded-md flex items-center gap-2 font-black text-[10px] ${store.isRunning ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
            {store.isRunning ? 'ENGINE ONLINE' : 'ENGINE OFFLINE'}
          </button>
        </div>
        <button onClick={() => store.setSettingsOpen(true)} className="text-blue-400 text-[10px] font-bold uppercase">HARDWARE CONFIG</button>
      </header>

      <div className="flex-1 flex overflow-x-auto bg-[#151515] p-1 gap-1">
        {store.tracks.map(track => (
          <div key={track.id} className="w-36 flex-shrink-0 flex flex-col bg-[#222] border border-black">
            <div className="p-2 border-b border-black text-[10px] font-bold text-white uppercase text-center">{track.name}</div>
            <div className="flex-1 p-2 flex flex-col gap-4">
              <div className="flex-1 bg-black rounded-sm relative overflow-hidden border border-white/5">
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-green-500 via-yellow-400 to-red-500" style={{ height: `${track.inputLevel * 100}%`, transition: 'height 0.05s ease-out' }}></div>
              </div>
              <div className="h-32 relative flex justify-center">
                <div className="w-1 bg-black h-full"></div>
                <input type="range" min="0" max="1" step="0.01" value={track.gain} onChange={(e) => store.updateTrackGain(track.id, parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize rotate-180" style={{ writingMode: 'bt-lr' } as any} />
                <div className="absolute w-8 h-4 bg-zinc-300 rounded shadow-xl" style={{ bottom: `${track.gain * 100}%`, transform: 'translateY(50%)' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button onClick={() => store.toggleMute(track.id)} className={`text-[9px] font-bold py-1 rounded ${track.isMuted ? 'bg-red-700 text-white' : 'bg-[#444]'}`}>M</button>
                <button onClick={() => store.toggleSolo(track.id)} className={`text-[9px] font-bold py-1 rounded ${track.isSolo ? 'bg-yellow-600 text-white' : 'bg-[#444]'}`}>S</button>
              </div>
              <button onClick={() => store.setEditingTrack(track.id)} className="w-full py-1 bg-blue-900/40 text-[8px] font-bold rounded">PROCESS</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesktopApp;
