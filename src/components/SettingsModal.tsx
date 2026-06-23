import React, { useEffect } from 'react'
import { useStudioStore } from '../store/studioStore'

const SettingsModal: React.FC = () => {
  const store = useStudioStore()

  useEffect(() => {
    if (store.isSettingsOpen) {
      store.refreshDevices()
    }
  }, [store.isSettingsOpen])

  if (!store.isSettingsOpen) return null

  return (
    <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 font-sans">
      <div className="bg-[#111] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-[#151515]">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-white">
              HARDWARE ENGINE CONFIG
            </h2>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              Live Driver Management
            </p>
          </div>
          <button
            onClick={() => store.setSettingsOpen(false)}
            className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* I/O Drivers */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-blue-500">
                <span className="text-sm font-black uppercase tracking-widest">
                  💾 I/O Drivers
                </span>
              </div>
              <button
                onClick={() => store.refreshDevices()}
                className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-blue-400 bg-white/5 px-4 py-2 rounded-xl transition-all"
              >
                ↻ Rescan
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                  Input Device (ASIO)
                </label>
                <select
                  value={store.system.inputDeviceId}
                  onChange={(e) =>
                    store.updateSystem({ inputDeviceId: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl text-white text-sm focus:border-blue-500 outline-none font-bold appearance-none"
                >
                  <option value="default">Default Input</option>
                  {store.system.availableInputs.map((device: any) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || 'Unknown Device'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                  Output Destination
                </label>
                <select
                  value={store.system.outputDeviceId}
                  onChange={(e) =>
                    store.updateSystem({ outputDeviceId: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl text-white text-sm focus:border-blue-500 outline-none font-bold appearance-none"
                >
                  <option value="default">Default Output</option>
                  {store.system.availableOutputs.map((device: any) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || 'Unknown Device'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Buffer & Sample Rate */}
          <section className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 text-orange-500">
              <span className="text-sm font-black uppercase tracking-widest">
                ⚙ Core Logic
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-600 font-black uppercase">
                  Buffer Size
                </label>
                <select
                  value={store.system.bufferSize}
                  onChange={(e) =>
                    store.updateSystem({ bufferSize: parseInt(e.target.value) })
                  }
                  className="w-full bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl text-white text-sm"
                >
                  {[32, 64, 128, 256].map(s => (
                    <option key={s} value={s}>
                      {s} samples
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-600 font-black uppercase">
                  Sample Rate
                </label>
                <select
                  value={store.system.sampleRate}
                  onChange={(e) =>
                    store.updateSystem({ sampleRate: parseInt(e.target.value) })
                  }
                  className="w-full bg-[#1a1a1a] border border-white/5 p-4 rounded-2xl text-white text-sm"
                >
                  {[44100, 48000, 96000].map(s => (
                    <option key={s} value={s}>
                      {s} Hz
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-10 bg-[#0a0a0a] border-t border-white/5">
          <button
            onClick={() => store.setSettingsOpen(false)}
            className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl transition-all active:scale-[0.98] hover:bg-blue-500"
          >
            INITIALIZE HARDWARE CORE
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
