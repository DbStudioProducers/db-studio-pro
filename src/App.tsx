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
      <div className="fixed bottom-6 right-6 z-[500] flex gap-3 bg-zinc-900/80 p-2 rounded-2xl border border-white/10">
        <button onClick={() => setMode('desktop')} className={`p-3 rounded-xl ${mode === 'desktop' ? 'bg-blue-600' : 'bg-transparent text-zinc-500'}`}><Monitor /></button>
        <button onClick={() => setMode('mobile')} className={`p-3 rounded-xl ${mode === 'mobile' ? 'bg-blue-600' : 'bg-transparent text-zinc-500'}`}><Smartphone /></button>
      </div>
      {mode === 'desktop' ? <DesktopApp /> : <MobileApp />}
      <ProcessingPanel />
      <SettingsModal />
    </div>
  );
}
export default App;
