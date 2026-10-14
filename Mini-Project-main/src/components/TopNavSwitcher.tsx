import React, { useState } from 'react';
import { ScreenId } from '../types';
import { GatherlyLogo } from './GatherlyLogo';
import { Menu, Smartphone, Monitor, RotateCcw, Download, Check, Sparkles } from 'lucide-react';
import { downloadProjectZip } from '../utils/exportProject';

interface TopNavSwitcherProps {
  currentScreen: ScreenId;
  onOpenMenu: () => void;
  viewMode: 'frame' | 'responsive';
  onToggleViewMode: (mode: 'frame' | 'responsive') => void;
  onResetData: () => void;
  onSelectScreen?: (screen: ScreenId) => void;
}

const screenLabels: Record<ScreenId, string> = {
  login: 'Sign In / Portal',
  organizer: 'Organizer Dashboard',
  student: 'Student Dashboard',
  'create-event': 'Post Event',
  'team-tasks': 'Team & Tasks',
  'org-setup': 'Organization Setup',
  settings: 'Profile & Settings',
  'ticket-scanner': 'Gate Pass Scanner',
  'verify-ticket': 'Ticket Verification',
  clubs: 'Campus Clubs',
  'explore-events': 'Explore Events',
  'my-registrations': 'My Registrations'
};

export const TopNavSwitcher: React.FC<TopNavSwitcherProps> = ({
  currentScreen,
  onOpenMenu,
  viewMode,
  onToggleViewMode,
  onResetData,
  onSelectScreen
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

  const activeLabel = screenLabels[currentScreen] || 'Dashboard';

  return (
    <header className="sticky top-0 z-40 bg-[#070d0f]/95 backdrop-blur-md border-b border-[#00f2ff]/20 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Hamburger Menu Trigger & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111c1f] hover:bg-[#1a2b30] text-[#00f2ff] border border-[#00f2ff]/40 shadow-[0_0_12px_rgba(0,242,255,0.25)] transition-all cursor-pointer font-medium text-xs group"
            title="Open Main Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
            <span className="font-semibold tracking-wide">Menu</span>
          </button>

          <button
            onClick={() => onSelectScreen ? onSelectScreen('student') : onOpenMenu()}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <GatherlyLogo size="md" variant="cyan" />
          </button>

          {/* Active Screen Context Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121c1e] border border-[#203236] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
            <span className="text-zinc-400 font-mono text-[11px]">Current:</span>
            <span className="text-white font-medium">{activeLabel}</span>
          </div>
        </div>

        {/* Right: View Mode Switcher & Utilities */}
        <div className="flex items-center gap-2">
          {/* View mode toggle: Frame vs Responsive */}
          <div className="flex items-center bg-[#11191b] p-0.5 rounded-xl border border-[#223336]">
            <button
              onClick={() => onToggleViewMode('frame')}
              title="Mobile Device Mockup View"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'frame'
                  ? 'bg-[#00f2ff] text-black font-semibold shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                  : 'text-[#849a9c] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Device Frame</span>
            </button>
            <button
              onClick={() => onToggleViewMode('responsive')}
              title="Responsive Wide Desktop View"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === 'responsive'
                  ? 'bg-[#00f2ff] text-black font-semibold shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                  : 'text-[#849a9c] hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Wide Responsive</span>
            </button>
          </div>

          {/* Download Full Source Code */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download Full Project Source (.zip)"
            className="px-2.5 py-1.5 rounded-xl bg-[#00f2ff]/15 hover:bg-[#00f2ff]/25 text-[#00f2ff] border border-[#00f2ff]/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,242,255,0.2)] cursor-pointer"
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

          {/* Reset App Data */}
          <button
            onClick={onResetData}
            title="Reset Mock Data"
            className="p-1.5 rounded-xl bg-[#11191b] hover:bg-[#1a272a] text-[#849a9c] hover:text-white border border-[#223336] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
