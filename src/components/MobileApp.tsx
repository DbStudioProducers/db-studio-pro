import React from 'react'
import { useStudioStore } from '../store/studioStore'

const MobileApp: React.FC = () => {
  const store = useStudioStore()
  const currentMix = store.auxMixes.find(m => m.id === store.activeAuxId) || store.auxMixes[0]

  return (
    <div className="h-full w-full bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 bg-gradient-to-b from-[#111] to-black border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-xl font-black italic text-white">dB</span>
            </div>
            <div>
              <h1 className="text-lg font-black italic tracking-tight text-white">
                dB STUDIO
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  Connected • Live
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] text-zinc-600 font-black uppercase block mb-1">
            YOUR PERSONAL MIX
          </span>
          <span className="text-sm font-bold text-white">{currentMix.name}</span>
        </div>
      </header>

      {/* Mixer */}
      <div className="flex-1 overflow-x-auto flex p-6 gap-6 items-stretch scrollbar-hide">
        {store.tracks.map((track) => (
          <div
            key={track.id}
            className="w-28 flex-shrink-0 flex flex-col bg-[#0a0a0a] rounded-3xl border border-white/5 p-3 relative shadow-xl"
          >
            {/* VU Meter Lateral */}
            <div className="absolute top-4 right-2 w-2 bottom-28 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className="w-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] absolute bottom-0"
                style={{
                  height: `${track.inputLevel * 100}%`,
                  transition: 'height 0.1s ease-out'
                }}
              ></div>
            </div>

            {/* Fader */}
            <div className="flex-1 relative flex justify-center py-8">
              <div className="w-1.5 bg-white/5 h-full rounded-full"></div>
              <div
                className="absolute w-16 h-14 bg-[#1a1a1a] border-2 border-white/10 rounded-2xl shadow-2xl flex flex-col items-center justify-center"
                style={{
                  bottom: `${(currentMix.channelLevels[track.id] || 0) * 85}%`
                }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={currentMix.channelLevels[track.id] || 0}
                  onChange={(e) =>
                    store.updateAuxLevel(
                      store.activeAuxId,
                      track.id,
                      parseFloat(e.target.value)
                    )
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ writingMode: 'bt-lr' } as any}
                />
                <span className="text-[10px] font-black text-white/40">
                  {Math.round((currentMix.channelLevels[track.id] || 0) * 100)}
                </span>
              </div>
            </div>

            {/* Track Info */}
            <div className="text-center mb-3">
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter truncate">
                {track.name}
              </div>
            </div>

            {/* Mute Button */}
            <button
              onClick={() => store.toggleMute(track.id)}
              className={`w-full py-4 rounded-2xl text-[10px] font-black transition-all ${
                track.isMuted
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                  : 'bg-white/5 text-zinc-600'
              }`}
            >
              MUTE
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MobileApp
