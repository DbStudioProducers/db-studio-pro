import React from 'react';
import { X, Activity, Zap } from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { motion, AnimatePresence } from 'framer-motion';

const ProcessingPanel: React.FC = () => {
  const store = useStudioStore();
  const track = store.tracks.find(t => t.id === store.editingTrackId);

  if (!track) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1a1a] border border-white/10 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
        <div className="p-4 bg-[#252525] border-b border-black flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg" style={{ backgroundColor: track.color }}></div><div><h3 className="text-white font-bold uppercase text-sm">{track.name} Processing</h3></div></div>
          <button onClick={() => store.setEditingTrack(null)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Parametric EQ */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-blue-400 mb-4 font-black uppercase text-xs tracking-widest"><Activity size={18}/> Parametric EQ</div>
            <div className="h-40 bg-black rounded-xl border border-white/5 relative overflow-hidden">
               <svg className="w-full h-full opacity-40" viewBox="0 0 400 100">
                  <path d={`M 0 50 Q 100 ${50 - track.eq.lowShelf * 2}, 200 ${50 - track.eq.lowMid * 2} T 400 ${50 - track.eq.highShelf * 2}`} fill="none" stroke="#3b82f6" strokeWidth="3"/>
               </svg>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {['lowShelf', 'lowMid', 'highMid', 'highShelf'].map(band => (
                 <label key={band} className="block"><span className="text-[10px] text-zinc-500 uppercase font-bold">{band}: {track.eq[band as keyof typeof track.eq]}dB</span>
                   <input type="range" min="-15" max="15" value={track.eq[band as keyof typeof track.eq]} onChange={(e) => store.updateTrackEQ(track.id, { [band]: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-2" />
                 </label>
               ))}
            </div>
          </section>
          {/* Compressor */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 text-orange-400 font-black uppercase text-xs tracking-widest"><Zap size={18}/> VCA Compressor</div>
              <button onClick={() => store.updateTrackComp(track.id, { enabled: !track.comp.enabled })} className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${track.comp.enabled ? 'bg-orange-600' : 'bg-zinc-800'}`}>{track.comp.enabled ? 'Active' : 'Bypass'}</button>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-6">
               {['threshold', 'ratio', 'attack', 'release'].map(param => (
                 <div key={param} className="space-y-2"><div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase"><span>{param}</span><span className="text-white">{track.comp[param as keyof typeof track.comp]}</span></div>
                   <input type="range" min={param === 'threshold' ? -60 : 1} max={param === 'ratio' ? 20 : 100} value={track.comp[param as keyof typeof track.comp]} onChange={(e) => store.updateTrackComp(track.id, { [param]: parseInt(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                 </div>
               ))}
            </div>
          </section>
        </div>
        <div className="p-6 bg-[#252525] border-t border-black flex justify-end"><button onClick={() => store.setEditingTrack(null)} className="px-8 py-3 bg-blue-600 text-white text-xs font-black uppercase rounded-2xl tracking-widest">Apply Processing</button></div>
      </motion.div>
    </div>
  );
};

export default ProcessingPanel;
