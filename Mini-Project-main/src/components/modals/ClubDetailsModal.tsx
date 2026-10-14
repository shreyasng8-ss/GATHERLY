import React, { useState } from 'react';
import { ClubItem, EventItem } from '../../types';
import { FALLBACK_EVENT_IMAGE } from '../../utils/eventImageSelector';
import {
  X,
  Users,
  Calendar,
  Clock,
  MapPin,
  Check,
  UserPlus,
  UserMinus,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface ClubDetailsModalProps {
  club: ClubItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleJoin: (clubId: string, currentJoined: boolean) => Promise<void>;
  onSelectEvent?: (event: EventItem) => void;
}

export const ClubDetailsModal: React.FC<ClubDetailsModalProps> = ({
  club,
  isOpen,
  onClose,
  onToggleJoin,
  onSelectEvent
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  if (!isOpen || !club) return null;

  const handleAction = async () => {
    setIsActionLoading(true);
    try {
      await onToggleJoin(club.id, Boolean(club.isJoined));
    } finally {
      setIsActionLoading(false);
    }
  };

  const isJoined = Boolean(club.isJoined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-[#0b1214] border border-[#1b2b2f] rounded-3xl shadow-[0_0_50px_rgba(0,242,255,0.2)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Hero Image */}
        <div className="relative h-48 w-full overflow-hidden shrink-0">
          <img
            src={club.image || FALLBACK_EVENT_IMAGE}
            alt={club.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_EVENT_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1214] via-[#0b1214]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Category Badge */}
          <div className="absolute bottom-4 left-5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40 backdrop-blur-md">
              {club.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-zinc-700">
          {/* Header Title & Actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{club.name}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#00f2ff]" />
                  <span>{club.memberCount} members</span>
                </span>
                {club.leadName && (
                  <span>• Lead: <strong className="text-zinc-200">{club.leadName}</strong></span>
                )}
              </div>
            </div>

            {/* Join / Leave Button */}
            <button
              onClick={handleAction}
              disabled={isActionLoading}
              className={`shrink-0 py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isJoined
                  ? 'bg-[#182326] text-red-400 hover:bg-red-950/40 border border-red-500/30'
                  : 'bg-[#00f2ff] text-black hover:bg-[#3af4ff] shadow-[0_0_16px_rgba(0,242,255,0.4)]'
              }`}
            >
              {isActionLoading ? (
                <span>Processing...</span>
              ) : isJoined ? (
                <>
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Leave Club</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Join Club</span>
                </>
              )}
            </button>
          </div>

          {/* Meeting Schedule Pill */}
          {club.meetingSchedule && (
            <div className="p-3 rounded-2xl bg-[#121c1f] border border-[#1f3135] flex items-center gap-2.5 text-xs">
              <Calendar className="w-4 h-4 text-[#00f2ff] shrink-0" />
              <div>
                <span className="text-zinc-400 block text-[10px] font-mono">MEETING SCHEDULE</span>
                <span className="text-zinc-200 font-medium">{club.meetingSchedule}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">
              About The Club
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">{club.description}</p>
          </div>

          {/* Tags */}
          {club.tags && club.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {club.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-lg bg-[#142023] text-zinc-300 border border-[#213539] text-[11px] font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Associated Club Events (Requirement 5) */}
          <div className="pt-2 border-t border-[#182528] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#00f2ff] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Associated Club Events</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">
                {club.events && club.events.length > 0 ? `${club.events.length} upcoming` : 'No upcoming events'}
              </span>
            </div>

            {club.events && club.events.length > 0 ? (
              <div className="space-y-2">
                {club.events.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      if (onSelectEvent) {
                        onClose();
                        onSelectEvent(evt);
                      }
                    }}
                    className="p-3 rounded-xl bg-[#111c1f] hover:bg-[#18272b] border border-[#1f3135] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={evt.image || FALLBACK_EVENT_IMAGE}
                        alt={evt.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-[#00f2ff] transition-colors truncate">
                          {evt.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {evt.date} • {evt.venue}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#00f2ff] transition-transform group-hover:translate-x-1 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#111a1c] border border-white/5 text-center text-xs text-zinc-500">
                No active events linked to this club right now. Check back soon!
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#182528] bg-[#0c1417]/90 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-[#141e21] hover:bg-[#1e2c30] text-zinc-300 text-xs font-semibold border border-[#233538] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
