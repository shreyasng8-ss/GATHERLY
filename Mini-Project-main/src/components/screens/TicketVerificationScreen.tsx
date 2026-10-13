import React, { useState, useEffect } from 'react';
import { ScreenId, TicketVerificationResponse, CheckInResponse } from '../../types';
import { api } from '../../services/api';
import { GatherlyLogo } from '../GatherlyLogo';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  Hash,
  Sparkles,
  ArrowLeft,
  Loader2,
  RefreshCw,
  UserCheck,
  Search
} from 'lucide-react';

interface TicketVerificationScreenProps {
  initialTicketId?: string;
  isOrganizer: boolean;
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (message: string) => void;
}

export const TicketVerificationScreen: React.FC<TicketVerificationScreenProps> = ({
  initialTicketId = '',
  isOrganizer,
  onNavigate,
  onShowToast,
}) => {
  const [ticketInput, setTicketInput] = useState<string>(initialTicketId);
  const [activeTicketId, setActiveTicketId] = useState<string>(initialTicketId);
  const [verification, setVerification] = useState<TicketVerificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkInState, setCheckInState] = useState<CheckInResponse | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);

  // Parse ticket parameter from window URL if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const urlTicket = params.get('ticket') || params.get('t') || params.get('id');
      if (urlTicket && urlTicket.trim().length > 0) {
        setTicketInput(urlTicket.trim());
        setActiveTicketId(urlTicket.trim());
      }
    }
  }, []);

  // Fetch ticket verification whenever activeTicketId changes
  useEffect(() => {
    if (!activeTicketId.trim()) return;

    let isMounted = true;
    setIsLoading(true);
    setCheckInState(null);

    api.verifyTicket(activeTicketId.trim())
      .then((data) => {
        if (isMounted) setVerification(data);
      })
      .catch((err) => {
        if (isMounted) {
          setVerification({
            valid: false,
            ticketId: activeTicketId,
            error: 'Ticket not found',
            message: err?.message || `No registration pass found for code '${activeTicketId}'.`,
            verifiedAt: new Date().toISOString()
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTicketId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    setActiveTicketId(ticketInput.trim());
  };

  const handleAuthorizeCheckIn = async () => {
    if (!verification?.ticketId || isCheckingIn) return;

    try {
      setIsCheckingIn(true);
      const res = await api.checkInTicket(verification.ticketId, {
        eventId: verification.event?.id,
        role: 'organizer',
        organizerName: 'Gate Check-In Lead'
      });

      setCheckInState(res);
      if (res.status === 'checked_in') {
        onShowToast(`Check-in confirmed for ${res.studentName}!`);
        // Refresh verification state
        setVerification((prev) =>
          prev ? { ...prev, checkedIn: true, checkedInAt: res.checkedInAt, status: 'Attended' } : null
        );
      } else {
        onShowToast(res.message);
      }
    } catch (err: any) {
      console.error('Check-in error:', err);
      onShowToast(err?.message || 'Check-in failed');
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#070b0c] text-zinc-100">
      {/* Top Header */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#1b2527] bg-[#091113]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <GatherlyLogo size="md" variant="cyan" />
        </div>

        <button
          onClick={() => onNavigate(isOrganizer ? 'organizer' : 'student')}
          className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121c1e] border border-[#213235] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00f2ff]" />
          <span>Dashboard</span>
        </button>
      </header>

      {/* Main Body */}
      <div className="flex-1 px-5 py-6 space-y-6 max-w-lg mx-auto w-full pb-20">
        {/* Page Title & Search Bar */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2ff] font-bold block">
            OFFICIAL GATE VERIFICATION PORTAL
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            Digital Gate Pass Verification
          </h1>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Authenticates attendee passes against live backend registration records.
          </p>
        </div>

        {/* Ticket Lookup Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Enter Ticket ID (e.g. TKT-EVT1-ALEXCHEN)..."
              className="w-full pl-9 pr-3 py-2 bg-[#0d1417] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !ticketInput.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#00f2ff] to-[#00bfff] text-black font-bold text-xs rounded-xl shadow-[0_0_14px_rgba(0,242,255,0.3)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
          >
            Verify
          </button>
        </form>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00f2ff] animate-spin" />
            <p className="text-xs font-mono text-zinc-400">Verifying pass with backend API...</p>
          </div>
        )}

        {/* Verification Result Card */}
        {!isLoading && verification && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {verification.valid ? (
              /* VALID PASS CARD */
              <div className="rounded-2xl bg-[#0d1417] border border-[#00f2ff]/30 overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.15)]">
                {/* Status Banner */}
                <div className={`p-4 flex items-center justify-between border-b ${
                  verification.checkedIn
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {verification.checkedIn ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    )}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                        {verification.checkedIn ? 'ALREADY ATTENDED / CHECKED IN' : 'AUTHENTIC GATE PASS • VALID'}
                      </h3>
                      <p className="text-[11px] text-zinc-300 mt-0.5">
                        {verification.checkedIn
                          ? `Checked in at ${verification.checkedInAt ? new Date(verification.checkedInAt).toLocaleTimeString() : 'Earlier'}`
                          : 'Ready for gate admission'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                    {verification.ticketId}
                  </span>
                </div>

                {/* Event & Attendee Info Body */}
                <div className="p-5 space-y-4">
                  {/* Event Details */}
                  {verification.event && (
                    <div className="p-3.5 rounded-xl bg-[#131c20] border border-white/5 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-[#00f2ff] font-bold tracking-wider">
                        {verification.event.category || 'EVENT'}
                      </span>
                      <h2 className="text-base font-bold text-white leading-snug">
                        {verification.event.title}
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 pt-1 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#00f2ff]" />
                          <span>{verification.event.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#00f2ff]" />
                          <span>{verification.event.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-[#00f2ff]" />
                          <span>{verification.event.venue}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attendee Details */}
                  <div className="p-3.5 rounded-xl bg-[#131c20] border border-white/5 space-y-2 text-xs">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                      ATTENDEE CREDENTIALS
                    </span>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-400 font-mono">Attendee Name:</span>
                      <span className="font-bold text-white">{verification.studentName}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-400 font-mono">Roll Number:</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {verification.rollNumber || verification.studentId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-400 font-mono">Department:</span>
                      <span className="text-zinc-200">{verification.department || 'Engineering'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-mono">Seat Pass:</span>
                      <span className="text-[#ff9e00] font-bold font-mono">
                        {verification.seatPass || 'General Pass'}
                      </span>
                    </div>
                  </div>

                  {/* Check-In Action Button for Organizers */}
                  {!verification.checkedIn && (
                    <button
                      onClick={handleAuthorizeCheckIn}
                      disabled={isCheckingIn}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#00bfff] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {isCheckingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Recording Check-In...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Authorize Gate Entry & Check-In</span>
                        </>
                      )}
                    </button>
                  )}

                  {checkInState && (
                    <div className={`p-3 rounded-xl text-xs font-mono ${
                      checkInState.status === 'checked_in'
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                        : 'bg-amber-950/60 border border-amber-500/40 text-amber-200'
                    }`}>
                      {checkInState.message}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* INVALID PASS CARD */
              <div className="p-6 rounded-2xl bg-red-950/40 border-2 border-red-500 text-center space-y-3 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center mx-auto text-red-400">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                    INVALID TICKET IDENTIFIER
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">Ticket Not Recognized</h3>
                  <p className="text-xs text-red-200 mt-1 leading-relaxed">
                    {verification.message || `No registration was found for ticket code "${verification.ticketId}".`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
