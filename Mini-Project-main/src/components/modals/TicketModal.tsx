import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
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
  Copy,
  Check
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
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Derive unique ticket ID from event or fallback
  const ticketId =
    event?.ticketId ||
    `TKT-${(event?.id || 'EVT').toUpperCase().replace(/[^A-Z0-9]/g, '')}-${(profile?.studentId || 'STUDENT').replace(/[^A-Z0-9]/g, '')}`;

  // Generate real dynamic scannable QR code whenever ticket opens
  useEffect(() => {
    if (!isOpen || !event) return;

    let isMounted = true;
    const qrPayload = JSON.stringify({
      ticketId,
      eventId: event.id,
      title: event.title,
      studentName: profile.name,
      studentId: profile.studentId,
      venue: event.venue,
      date: event.date,
      seatPass: event.seatPass || 'General Pass',
      verifiedAt: new Date().toISOString()
    });

    QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 2,
      color: {
        dark: '#070b0c',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, event, profile, ticketId]);

  // Support Escape key to return to dashboard
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyTicketId = () => {
    navigator.clipboard.writeText(ticketId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen || !event) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
              <span>Digital Gate Pass</span>
              <span className="ml-auto text-[10px] bg-[#ff7a00]/20 text-[#ffb68b] px-2 py-0.5 rounded-full border border-[#ff7a00]/30 font-mono">
                AUTHENTICATED
              </span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
              {event.title}
            </h3>

            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-[#ff9e00] font-medium">{event.category || event.type || 'Workshop'}</span>
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

            {/* Scannable QR Code Container with real dynamic QR code image */}
            <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <div className="relative w-44 h-44 flex items-center justify-center bg-white rounded-xl">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Scannable Event QR Code"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-zinc-400 text-xs font-mono">
                    Generating QR...
                  </div>
                )}

                {/* Animated laser scan line */}
                <div className="absolute inset-x-2 top-0 h-1 bg-[#ff7a00] shadow-[0_0_12px_#ff7a00] animate-pulse pointer-events-none" />
              </div>

              {/* Pass ID Display & Copy Button */}
              <div className="mt-2.5 flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-300">
                <p className="text-[11px] font-mono font-bold tracking-wider text-zinc-900 select-all">
                  {ticketId}
                </p>
                <button
                  onClick={handleCopyTicketId}
                  className="p-1 hover:bg-zinc-200 rounded text-zinc-700 transition-colors cursor-pointer"
                  title="Copy Ticket ID"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
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
              <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">
                Hold to terminal scanner • Fast Pass Entry
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
