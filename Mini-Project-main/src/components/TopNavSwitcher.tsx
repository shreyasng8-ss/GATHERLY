import React, { useState } from 'react';
import { ScreenId } from '../types';
import { GatherlyLogo } from './GatherlyLogo';
import { Smartphone, Monitor, RotateCcw, Download, Check } from 'lucide-react';
import { downloadProjectZip } from '../utils/exportProject';

interface TopNavSwitcherProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  viewMode: 'frame' | 'responsive';
  onToggleViewMode: (mode: 'frame' | 'responsive') => void;
  onResetData: () => void;
}

const screens: { id: ScreenId; label: string; number: number }[] = [
  { id: 'login', label: 'Login', number: 1 },
  { id: 'organizer', label: 'Organizer Dash', number: 2 },
  { id: 'student', label: 'Student Dash', number: 3 },
  { id: 'create-event', label: 'Post Event', number: 4 },
  { id: 'team-tasks', label: 'Team & Tasks', number: 5 },
  { id: 'org-setup', label: 'Org Setup', number: 6 },
  { id: 'settings', label: 'Settings', number: 7 },
  { id: 'ticket-scanner', label: 'Gate Scanner', number: 8 },
];

export const TopNavSwitcher: React.FC<TopNavSwitcherProps> = ({
  currentScreen,
  onSelectScreen,
  viewMode,
  onToggleViewMode,
  onResetData,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadProjectZip();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 1500);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090e10]/95 backdrop-blur-md border-b border-[#00f2ff]/20 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectScreen('login')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <GatherlyLogo size="md" variant="cyan" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">
              All-in-One App
            </span>
          </button>
        </div>

        {/* Screen switcher tabs matching Image 13.png */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-full">
          {screens.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#00f2ff] text-[#061011] font-bold shadow-[0_0_14px_rgba(0,242,255,0.6)] scale-[1.02]'
                    : 'bg-[#151f21] text-[#9eb2b5] hover:text-white hover:bg-[#1e2c2f] border border-[#233538]'
                }`}
              >
                <span>{item.number}.</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* View mode toggle, reset & download code */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#131b1d] p-0.5 rounded-lg border border-[#233336]">
            <button
              onClick={() => onToggleViewMode('frame')}
              title="Mobile Device Mockup Frame"
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'frame'
                  ? 'bg-[#00f2ff] text-black font-semibold shadow-[0_0_8px_rgba(0,242,255,0.4)]'
                  : 'text-[#849a9c] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Device Frame</span>
            </button>
            <button
              onClick={() => onToggleViewMode('responsive')}
              title="Responsive Wide Web View"
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'responsive'
                  ? 'bg-[#00f2ff] text-black font-semibold shadow-[0_0_8px_rgba(0,242,255,0.4)]'
                  : 'text-[#849a9c] hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Wide Responsive</span>
            </button>
          </div>

          {/* Download code button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download Full Website Code (.zip)"
            className="px-2.5 py-1.5 rounded-lg bg-[#00f2ff]/15 hover:bg-[#00f2ff]/25 text-[#00f2ff] border border-[#00f2ff]/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,242,255,0.2)] cursor-pointer"
          >
            {isDownloading ? (
              <>
                <Check className="w-3.5 h-3.5 animate-bounce" />
                <span className="hidden sm:inline text-[11px]">Zipping...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Download Code</span>
              </>
            )}
          </button>

          <button
            onClick={onResetData}
            title="Reset Mock Data"
            className="p-1.5 rounded-lg bg-[#131b1d] hover:bg-[#1f2b2e] text-[#849a9c] hover:text-white border border-[#233336] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
