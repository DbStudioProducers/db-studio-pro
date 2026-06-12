import React, { useEffect, useRef } from 'react';
import { 
  Play, Square, Power, Settings, Share2, 
  Activity, Zap, Save, FolderOpen, Download, FileText, Monitor, Cpu, Volume2
} from 'lucide-react';
import { useStudioStore, SESSION_EXT } from '../store/studioStore';

const DesktopApp: React.FC = () => {
  const store = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LOGICA DE MEDIÇÃO DE ÁUDIO REAL (Web Audio API)
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
        } catch (err) { console.error("Hardware Error:", err); }
      } else { store.updateMeters({}); }
    };
    runEngine();
    return () => cancelAnimationFrame(animationFrame);
  }, [store.isRunning, store.audioContext, store.system.inputDeviceId]);

  return (
    <div className="flex flex-col h-screen bg-[#111] text-[#ccc] font-sans overflow-hidden border-b-4 border-blue-600">
      {/* Menu & Transport */}
      <header className="h-12 bg-[#2a2a2a] border-b border-black flex items-center justify-between px-3">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-blue-600 rounded text-white font-black italic text-xs tracking-tighter">dB STUDIO</div>
          <div className="flex gap-1 border-r border-white/10 pr-4">
             <button onClick={() => store.saveSession()} className="p-2 hover:bg-white/5 rounded text-zinc-400"><Save size={16} /></button>
             <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/5 rounded text-zinc-400"><FolderOpen size={16} /></button>
             <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && store.loadSession(e.target.files[0])} accept={SESSION_EXT} className="hidden" />
          </div>
          <button onClick={() => store.togglePower()} className={`px-4 py-1.5 rounded-md flex items-center gap-2 transition-all font-black text-[10px] ${store.isRunning ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
            <Power size={14} /> {store.isRunning ? 'ENGINE ONLINE' : 'OFFLINE'}
          </button>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase">
          <button onClick={() => store.setSettingsOpen(true)} className="flex items-center gap-2 text-blue-400"><Settings size={14} /> Hardware</button>
          <div className="bg-black/40 px-3 py-1 rounded-full border border-white/5 text-zinc-500 flex items-center gap-2"><FileText size={12}/> {store.currentSessionName}</div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track View */}
        <div className="flex-1 overflow-x-auto flex bg-[#151515] p-1 gap-[1px]">
          {store.tracks.map(track => (
            <div key={track.id} className="w-36 flex-shrink-0 flex flex-col bg-[#222] border border-black/40">
              <div className="p-2 border-b border-black bg-[#2a2a2a]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-zinc-600 font-black">0{track.id}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: track.color }}></div>
                </div>
                <div className="text-[10px] font-bold text-white uppercase truncate">{track.name}</div>
              </div>
              {/* FX SLOTS */}
              <div className="flex-1 p-1 space-y-1 bg-black/10">
                <button onClick={() => store.setEditingTrack(track.id)} className="w-full py-1 bg-[#333] hover:bg-blue-600 text-[8px] rounded-sm text-zinc-400 uppercase font-bold">EQ-PARAM</button>
                <button onClick={() => store.setEditingTrack(track.id)} className={`w-full py-1 text-[8px] rounded-sm uppercase font-bold ${track.comp.enabled ? 'bg-orange-600 text-white' : 'bg-[#333] text-zinc-400'}`}>COMP-VCA</button>
              </div>
              {/* MIXER STRIP */}
              <div className="h-64 bg-[#252525] p-2 flex flex-col gap-3">
                <div className="h-32 bg-black rounded-sm relative p-0.5 overflow-hidden border border-white/5">
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 transition-all duration-75" style={{ height: `${track.inputLevel * 100}%` }}></div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button onClick={() => store.toggleMute(track.id)} className={`text-[9px] font-bold py-1 rounded ${track.isMuted ? 'bg-red-700 text-white' : 'bg-[#444]'}`}>M</button>
                  <button onClick={() => store.toggleSolo(track.id)} className={`text-[9px] font-bold py-1 rounded ${track.isSolo ? 'bg-yellow-600 text-white' : 'bg-[#444]'}`}>S</button>
                </div>
                <div className="flex-1 relative flex justify-center">
                  <div className="w-1 bg-black h-full"></div>
                  <input type="range" min="0" max="1" step="0.01" value={track.gain} onChange={(e) => store.updateTrackGain(track.id, parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize rotate-180" style={{ writingMode: 'bt-lr' } as any} />
                  <div className="absolute w-8 h-4 bg-zinc-300 rounded shadow-xl border border-zinc-500 pointer-events-none" style={{ bottom: `${track.gain * 100}%`, transform: 'translateY(50%)' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sync Hub Sidebar */}
        <div className="w-72 bg-[#1a1a1a] border-l border-black flex flex-col p-4">
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6"><Share2 size={14}/> Mobile Sync Hub</div>
          <div className="flex-1 space-y-4 overflow-y-auto">
            {store.auxMixes.map(mix => (
              <div key={mix.id} onClick={() => store.setActiveAux(mix.id)} className={`p-3 rounded-xl border transition-all cursor-pointer ${store.activeAuxId === mix.id ? 'bg-blue-600/10 border-blue-500/40' : 'bg-black/20 border-white/5'}`}>
                <div className="text-[10px] font-bold text-white mb-2 uppercase">{mix.name}</div>
                <div className="flex gap-0.5 h-6">
                  {store.tracks.map(t => <div key={t.id} className="flex-1 bg-black/40 rounded-sm relative flex flex-col-reverse"><div className="w-full bg-blue-500/50" style={{ height: `${(mix.channelLevels[t.id] || 0) * 100}%` }}></div></div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-10 bg-[#0a0a0a] border-t border-black flex items-center justify-between px-6 text-[9px] text-zinc-600 font-bold uppercase">
        <div className="flex gap-8">
          <div className="flex items-center gap-2"><Cpu size={12}/> CPU: 4%</div>
          <div className="flex items-center gap-2"><Volume2 size={12}/> ASIO: {store.isRunning ? 'Active' : 'Ready'}</div>
        </div>
        <div className="text-blue-600 tracking-[0.3em]">Professional Audio Ecosystem</div>
      </footer>
    </div>
  );
};

export default DesktopApp;
