import React, { useState } from 'react';
import { Wifi, Volume2, User, Zap, Lock, ChevronRight, Sliders, Menu, X, CheckCircle2, Activity } from 'lucide-react';
import { useStudioStore } from '../store/studioStore';
import { motion, AnimatePresence } from 'framer-motion';

const MobileApp: React.FC = () => {
  const store = useStudioStore();
  const [locked, setLocked] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const currentMix = store.auxMixes.find(m => m.id === store.activeAuxId) || store.auxMixes[0];

  return (
    <div className="h-full w-full bg-[#050505] text-white flex flex-col overflow-hidden font-sans relative">
      <header className="px-6 pt-12 pb-6 bg-gradient-to-b from-[#111] to-black border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Zap size={22} fill="white" /></div>
             <div><h1 className="text-sm font-black italic">dB STUDIO</h1><span className="text-[9px] text-green-500 font-bold uppercase tracking-widest animate-pulse">Live • Connected</span></div>
          </div>
          <button onClick={() => setLocked(!locked)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${locked ? 'bg-orange-600' : 'bg-[#1a1a1a] text-zinc-500'}`}><Lock size={18}/></button>
        </div>
        <button onClick={() => !locked && setShowSelector(true)} className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4"><User size={20} className="text-blue-500" /><div><span className="text-[9px] text-zinc-600 font-black uppercase block mb-1">YOUR MIX</span><span className="text-sm font-bold text-white">{currentMix.name}</span></div></div>
          <ChevronRight size={18} className="text-zinc-700" />
        </button>
      </header>

      <div className="flex-1 overflow-x-auto flex p-6 gap-6 items-stretch scrollbar-hide">
        {store.tracks.map((track) => (
          <div key={track.id} className="w-28 flex-shrink-0 flex flex-col items-center">
            <div className="flex-1 w-full bg-[#0a0a0a] rounded-[2.5rem] relative flex flex-col items-center p-3 border border-white/5 shadow-inner">
               <div className="absolute inset-y-8 right-3 w-1.5 bg-white/5 rounded-full overflow-hidden flex flex-col-reverse">
                  <motion.div className="w-full bg-blue-500" animate={{ height: `${track.inputLevel * 100}%` }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
               </div>
               <div className="relative flex-1 w-full flex justify-center py-10">
                  <div className="w-1 bg-white/10 h-full rounded-full"></div>
                  <div className={`absolute w-16 h-14 bg-[#1a1a1a] border-2 border-white/10 rounded-2xl shadow-2xl flex flex-col items-center justify-center ${locked ? 'opacity-30' : ''}`} style={{ bottom: `calc(${(currentMix.channelLevels[track.id] || 0) * 82}% + 0px)` }}>
                     <div className="w-10 h-1 bg-blue-500/30 rounded-full mb-1"></div>
                     <span className="text-[10px] font-black text-white/40">{Math.round((currentMix.channelLevels[track.id] || 0) * 100)}</span>
                     <input type="range" min="0" max="1" step="0.01" disabled={locked} value={currentMix.channelLevels[track.id] || 0} onChange={(e) => store.updateAuxLevel(store.activeAuxId, track.id, parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style={{ writingMode: 'bt-lr' } as any} />
                  </div>
               </div>
               <div className="w-full space-y-4 z-20 pb-2">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => !locked && store.setEditingTrack(track.id)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-500"><Activity size={18}/></button>
                  </div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter truncate text-center">{track.name}</div>
                  <button onClick={() => !locked && store.toggleMute(track.id)} className={`w-full py-4 rounded-3xl text-[10px] font-black transition-all ${track.isMuted ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-white/5 text-zinc-600'}`}>MUTE</button>
               </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="p-6 bg-[#0a0a0a] border-t border-white/5 pb-12 flex items-center justify-around">
        <button className="flex flex-col items-center gap-1 text-blue-500 font-black"><Sliders size={20}/><span className="text-[8px]">MIX</span></button>
        <button className="flex flex-col items-center gap-1 text-zinc-700 font-black"><Wifi size={20}/><span className="text-[8px]">SYNC</span></button>
        <button className="flex flex-col items-center gap-1 text-zinc-700 font-black"><Menu size={20}/><span className="text-[8px]">MENU</span></button>
      </footer>

      {/* AUX SELECTOR MODAL */}
      <AnimatePresence>
        {showSelector && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-[100] bg-black flex flex-col p-8 pt-16">
             <div className="flex justify-between items-center mb-10"><div><h3 className="text-3xl font-black italic tracking-tighter">SELECT YOUR MIX</h3><p className="text-zinc-500 text-sm mt-1">Designate your personal monitor</p></div><button onClick={() => setShowSelector(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-zinc-500"><X size={28}/></button></div>
             <div className="flex-1 space-y-4 overflow-y-auto">
                {store.auxMixes.map(mix => (
                  <button key={mix.id} onClick={() => { store.setActiveAux(mix.id); setShowSelector(false); }} className={`w-full p-8 rounded-[2rem] border text-left transition-all ${store.activeAuxId === mix.id ? 'bg-blue-600 border-blue-400 shadow-2xl' : 'bg-[#111] border-white/5'}`}>
                    <div className="relative z-10 flex justify-between items-center"><div><div className="text-[9px] opacity-60 font-black uppercase mb-1">AUX OUTPUT</div><div className="text-xl font-black">{mix.name}</div></div>{store.activeAuxId === mix.id && <CheckCircle2 size={32} className="text-white/40" />}</div>
                  </button>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileApp;
