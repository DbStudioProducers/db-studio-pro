import { useState } from 'react';
import DesktopApp from './components/DesktopApp';
import MobileApp from './components/MobileApp';
import ProcessingPanel from './components/ProcessingPanel';
import SettingsModal from './components/SettingsModal';
import { Monitor, Smartphone } from 'lucide-react';

function App() {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Switcher para teste no navegador */}
      <div className="fixed bottom-6 right-6 z-[1000] bg-zinc-900 border border-white/10 rounded-2xl p-2 flex gap-2 shadow-2xl">
        <button
          onClick={() => setMode('desktop')}
          className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
            mode === 'desktop' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Monitor size={18} />
          DESKTOP
        </button>
        <button
          onClick={() => setMode('mobile')}
          className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
            mode === 'mobile' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Smartphone size={18} />
          MOBILE
        </button>
      </div>

      {mode === 'desktop' ? <DesktopApp /> : <MobileApp />}

      <ProcessingPanel />
      <SettingsModal />
    </div>
  );
}

export default App;
