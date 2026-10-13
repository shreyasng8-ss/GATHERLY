import React, { useEffect } from 'react';
import { EventItem, StudentProfile } from '../../types';
import {
  X,
  ArrowLeft,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

interface TicketModalProps {
  event: EventItem | null;
  profile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  event,
  profile,
  isOpen,
  onClose,
}) => {
  // Support Escape key to return to dashboard
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-sm my-auto bg-[#121622] border border-[#ff7a00]/40 rounded-3xl shadow-[0_0_50px_rgba(255,122,0,0.35)] overflow-hidden text-zinc-100 flex flex-col max-h-[95vh]">
        {/* Top Sticky Navigation Bar with clear "Back to Dashboard" */}
        <div className="sticky top-0 z-20 bg-[#1c1827] px-4 py-3 border-b border-[#ff7a00]/30 flex items-center justify-between gap-2 shadow-md">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff7a00]/15 hover:bg-[#ff7a00]/25 text-[#ffb68b] hover:text-white border border-[#ff7a00]/40 transition-all text-xs font-bold cursor-pointer shadow-[0_0_12px_rgba(255,122,0,0.2)] active:scale-95"
            title="Return to Student Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-[#ff7a00]" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Close Ticket Pass"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Pass Area */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-700">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-b from-[#221c2c] to-[#121622] px-6 pt-4 pb-4 border-b border-[#ff7a00]/20">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#ff7a00] uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital Event Pass</span>
              <span className="ml-auto text-[10px] bg-[#ff7a00]/20 text-[#ffb68b] px-2 py-0.5 rounded-full border border-[#ff7a00]/30 font-mono">
                FAST PASS
              </span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
              {event.title}
            </h3>

            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-[#ff9e00] font-medium">{event.category}</span>
              <span>•</span>
              <span>{event.seatPass || 'General Access'}</span>
            </div>
          </div>

          {/* Pass Body with Ticket Notch Cutouts */}
          <div className="relative px-6 py-5 space-y-4">
            {/* Simulated Ticket Tear Notches */}
            <div className="absolute -left-3 top-[-10px] w-6 h-6 rounded-full bg-black/90 border-r border-[#ff7a00]/30" />
            <div className="absolute -right-3 top-[-10px] w-6 h-6 rounded-full bg-black/90 border-l border-[#ff7a00]/30" />

            {/* Attendee Info Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a202e] border border-white/5">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Attendee</p>
                <p className="text-sm font-bold text-white">{profile.name}</p>
                <p className="text-xs text-zinc-400 font-mono">{profile.studentId} • {profile.gradYear}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified</span>
              </div>
            </div>

            {/* Time & Location */}
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ff7a00]" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ff7a00]" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ff7a00]" />
                <span>{event.venue}</span>
              </div>
            </div>

            {/* QR Code Container with simulated scanning effect */}
            <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Dynamic QR SVG */}
                <svg className="w-40 h-40 text-black" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="5" y="5" width="25" height="25" rx="3" fill="#000" />
                  <rect x="9" y="9" width="17" height="17" rx="2" fill="#fff" />
                  <rect x="13" y="13" width="9" height="9" fill="#ff7a00" />
                  
                  <rect x="70" y="5" width="25" height="25" rx="3" fill="#000" />
                  <rect x="74" y="9" width="17" height="17" rx="2" fill="#fff" />
                  <rect x="78" y="13" width="9" height="9" fill="#ff7a00" />

                  <rect x="5" y="70" width="25" height="25" rx="3" fill="#000" />
                  <rect x="9" y="74" width="17" height="17" rx="2" fill="#fff" />
                  <rect x="13" y="78" width="9" height="9" fill="#ff7a00" />

                  {/* Matrix dots */}
                  <rect x="35" y="10" width="6" height="6" fill="#000" />
                  <rect x="45" y="15" width="6" height="6" fill="#000" />
                  <rect x="55" y="8" width="6" height="6" fill="#000" />
                  <rect x="35" y="25" width="6" height="6" fill="#000" />
                  <rect x="48" y="28" width="6" height="6" fill="#000" />

                  <rect x="10" y="40" width="6" height="6" fill="#000" />
                  <rect x="22" y="48" width="6" height="6" fill="#000" />
                  <rect x="36" y="42" width="8" height="8" fill="#ff7a00" />
                  <rect x="50" y="46" width="6" height="6" fill="#000" />
                  <rect x="62" y="40" width="8" height="8" fill="#000" />
                  <rect x="78" y="46" width="6" height="6" fill="#000" />

                  <rect x="40" y="65" width="6" height="6" fill="#000" />
                  <rect x="52" y="72" width="6" height="6" fill="#000" />
                  <rect x="65" y="62" width="6" height="6" fill="#000" />
                  <rect x="78" y="75" width="6" height="6" fill="#000" />
                  <rect x="88" y="82" width="6" height="6" fill="#000" />
                </svg>

                {/* Animated laser scan line */}
                <div className="absolute inset-x-2 top-0 h-1 bg-[#ff7a00] shadow-[0_0_12px_#ff7a00] animate-pulse" />
              </div>
              <p className="mt-2 text-[11px] font-mono font-bold tracking-widest text-zinc-800">
                GTH-SCAN-{event.id.toUpperCase()}-PASS
              </p>
            </div>

            {/* Barcode Strip */}
            <div className="border-t border-dashed border-zinc-700 pt-3 text-center">
              <div className="flex justify-center items-center gap-[3px] h-7 px-4">
                {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4].map((width, i) => (
                  <div
                    key={i}
                    className="bg-zinc-300 h-full"
                    style={{ width: `${width * 2}px` }}
                  />
                ))}
              </div>
              <p className="text-[10px] font-mono text-zinc-500 mt-1">
                HOLD TO TERMINAL SCANNER • AUTO-VALIDATES ON ENTRY
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row with prominent Back to Dashboard button */}
        <div className="p-4 bg-[#0d1017] border-t border-white/5 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#1e2436] hover:bg-[#28324a] text-zinc-200 hover:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-white/10 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#ff7a00]" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9e00] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(255,122,0,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Ready for Check-In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
