import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  viewMode: 'frame' | 'responsive';
  theme?: 'cyan' | 'orange';
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  viewMode,
  theme = 'cyan',
}) => {
  if (viewMode === 'responsive') {
    return (
      <main className="w-full min-h-[calc(100vh-60px)] px-4 py-8 flex justify-center">
        <div className="w-full max-w-4xl bg-[#0a1011] rounded-2xl border border-[#1d2a2d] shadow-2xl overflow-hidden min-h-[700px]">
          {children}
        </div>
      </main>
    );
  }

  const isOrange = theme === 'orange';
  const glowBorder = isOrange
    ? 'border-[#ff7a00]/30 shadow-[0_0_35px_rgba(255,122,0,0.25)]'
    : 'border-[#00f2ff]/30 shadow-[0_0_35px_rgba(0,242,255,0.25)]';

  return (
    <div className="w-full min-h-[calc(100vh-60px)] py-8 px-4 flex items-center justify-center">
      {/* Phone chassis */}
      <div
        className={`relative w-full max-w-[430px] rounded-[44px] bg-[#060a0a] border-[8px] border-[#182325] ${glowBorder} shadow-2xl overflow-hidden flex flex-col transition-all duration-300`}
        style={{
          height: '890px',
        }}
      >
        {/* Top Status Bar & Camera Pinhole */}
        <div className="shrink-0 h-10 px-6 pt-2 flex items-center justify-between text-xs font-mono text-zinc-400 select-none z-30 bg-[#060a0a]/90 backdrop-blur-sm">
          <span className="font-semibold tracking-tight text-[11px] text-zinc-200">9:41</span>
          
          {/* Dynamic Island / Camera hole */}
          <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end pr-2 border border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#050808] border border-cyan-500/20 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-cyan-400/40" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Scrollable screen viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {children}
        </div>

        {/* Bottom Home Indicator */}
        <div className="shrink-0 h-5 bg-[#060a0a] flex items-center justify-center pointer-events-none">
          <div className="w-32 h-1 bg-zinc-600/70 rounded-full" />
        </div>
      </div>
    </div>
  );
};
