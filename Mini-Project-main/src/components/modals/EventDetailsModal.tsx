import React, { useEffect } from 'react';
import { EventItem } from '../../types';
import { FALLBACK_EVENT_IMAGE } from '../../utils/eventImageSelector';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Ticket,
  Sparkles,
  QrCode,
  Building,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';

interface EventDetailsModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: (event: EventItem) => void;
  onViewTicketClick: (event: EventItem) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegisterClick,
  onViewTicketClick,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const seatsLeft = Math.max(0, event.capacity - (event.registeredCount || 0));
  const isFull = seatsLeft === 0;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg my-auto bg-[#121622] border border-[#ff7a00]/40 rounded-3xl shadow-[0_0_50px_rgba(255,122,0,0.35)] overflow-hidden text-zinc-100 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-[#1c1827] px-4 py-3 border-b border-[#ff7a00]/30 flex items-center justify-between gap-2 shadow-md">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff7a00]/15 hover:bg-[#ff7a00]/25 text-[#ffb68b] hover:text-white border border-[#ff7a00]/40 transition-all text-xs font-bold cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#ff7a00]" />
            <span>Back to Dashboard</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-700">
          {/* Banner Image */}
          <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
            <img
              src={event.image || FALLBACK_EVENT_IMAGE}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_EVENT_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-black/40 to-black/30" />

            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#ff7a00] text-black uppercase tracking-wider shadow-[0_0_12px_#ff7a00]">
                {event.category || event.type || 'CAMPUS EVENT'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-zinc-200 border border-white/10 backdrop-blur-md">
                {event.status || 'Upcoming'}
              </span>
            </div>

            {event.isRegistered && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>REGISTERED</span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Title & Organizer */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {event.title}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                <div className="flex items-center gap-1.5 text-[#ff9e00]">
                  <Building className="w-4 h-4" />
                  <span className="font-semibold">{event.organizer || 'Campus Student Organization'}</span>
                </div>
                <span>•</span>
                <span className="text-zinc-400 font-mono">Seat Pass: {event.seatPass || 'General Admission'}</span>
              </div>
            </div>

            {/* Key Schedule Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#181f2f] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Date</p>
                  <p className="text-xs font-bold text-white">{event.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Time</p>
                  <p className="text-xs font-bold text-white">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                <div className="p-2.5 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Venue</p>
                  <p className="text-xs font-bold text-white">{event.venue}</p>
                </div>
              </div>
            </div>

            {/* Capacity & Availability Bar */}
            <div className="p-4 rounded-2xl bg-[#141824] border border-[#ff7a00]/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <Users className="w-4 h-4 text-[#ff7a00]" />
                  <span>Attendance Capacity</span>
                </span>
                <span className="font-mono text-zinc-400">
                  <strong className="text-white">{event.registeredCount}</strong> / {event.capacity} Filled
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#1e2436] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff7a00] to-[#ff9e00] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round(((event.registeredCount || 0) / event.capacity) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className={isFull ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
                  {isFull ? '● Capacity Reached (0 Seats Left)' : `● ${seatsLeft} Seats Remaining`}
                </span>
                <span className="text-zinc-500">Auto-persisted via JSON storage</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider font-mono font-bold text-zinc-400">
                About This Event
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-[#141824] p-3.5 rounded-xl border border-white/5">
                {event.description ||
                  'Join your fellow students and faculty for this campus event. Please arrive 10 minutes prior to session commencement for digital gate pass verification.'}
              </p>
            </div>

            {/* Eligible Years */}
            {event.eligibleYears && event.eligibleYears.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#ff7a00]" />
                  <span>Eligible Academic Cohorts</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {event.eligibleYears.map((year, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#ff7a00]/10 text-[#ffb68b] border border-[#ff7a00]/30"
                    >
                      {year}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0d1017] border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#1e2436] hover:bg-[#28324a] text-zinc-200 hover:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-white/10 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#ff7a00]" />
            <span>Back</span>
          </button>

          {event.isRegistered ? (
            <button
              onClick={() => {
                onClose();
                onViewTicketClick(event);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>View Digital Gate Pass (Registered)</span>
            </button>
          ) : isFull ? (
            <button
              disabled
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-wider border border-zinc-700 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Capacity Full — Registration Closed</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onRegisterClick(event);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9e00] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(255,122,0,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              <span>Register Now for Free</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
