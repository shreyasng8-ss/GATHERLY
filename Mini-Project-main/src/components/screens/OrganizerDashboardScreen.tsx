import React from 'react';
import { ScreenId, EventItem, NotificationItem } from '../../types';
import { GatherlyLogo } from '../GatherlyLogo';
import { FALLBACK_EVENT_IMAGE } from '../../utils/eventImageSelector';
import {
  Menu,
  Bell,
  LogOut,
  Eye,
  Calendar,
  Users,
  CheckCircle2,
  UserCheck,
  AlertTriangle,
  Radio,
  Plus,
  Home,
  CalendarDays,
  User,
  ExternalLink,
  ChevronRight,
  QrCode,
  Scan,
} from 'lucide-react';

interface OrganizerDashboardProps {
  events: EventItem[];
  notifications: NotificationItem[];
  onNavigate: (screen: ScreenId) => void;
  onOpenMenu?: () => void;
  onMarkAllRead: () => void;
  onSelectEvent: (event: EventItem) => void;
  onShowToast: (message: string) => void;
  onDeleteEvent?: (eventId: string) => void;
  onOpenScanner?: (eventId?: string) => void;
}

export const OrganizerDashboardScreen: React.FC<OrganizerDashboardProps> = ({
  events,
  notifications,
  onNavigate,
  onOpenMenu,
  onMarkAllRead,
  onSelectEvent,
  onShowToast,
  onDeleteEvent,
  onOpenScanner,
}) => {
  const [showAllEvents, setShowAllEvents] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-full flex flex-col bg-[#080f10] text-[#dce4e4]">
      {/* Top Header matching Image 11 */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#1b2628] bg-[#091113]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenMenu ? onOpenMenu() : onNavigate('student')}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#00f2ff]" />
          </button>
          <GatherlyLogo size="md" variant="cyan" />
        </div>

        <div className="flex items-center gap-2">
          {/* Bell Notification */}
          <button
            onClick={onMarkAllRead}
            className="relative p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#00f2ff]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00f2ff] ring-2 ring-[#080f10]" />
            )}
          </button>

          {/* Log Out */}
          <button
            onClick={() => {
              onShowToast('Signed out of Organizer Dashboard.');
              onNavigate('login');
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg border border-[#233538] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-5 py-5 space-y-6 pb-24">
        {/* Organization Title & Switcher */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
              Google Developer Student Club
            </h1>
            <p className="text-xs text-[#7d9294] mt-0.5">Organizer Dashboard</p>
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="text-[11px] text-zinc-400 hover:text-[#00f2ff] flex items-center gap-1 py-1 px-2 rounded-lg bg-[#11191b] border border-[#233538] transition-colors cursor-pointer shrink-0"
          >
            <span>Back to Login</span>
          </button>
        </div>

        {/* Stats Grid matching Image 11 */}
        <div className="grid grid-cols-1 gap-3">
          {/* Total Reach */}
          <div className="p-4 rounded-2xl bg-[#111a1c] border border-[#203134] relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#8ca0a3] font-medium">Total Reach</span>
              <div className="p-1.5 rounded-lg bg-[#00f2ff]/10 text-[#00f2ff]">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#00f2ff] tracking-tight">
              12.4k
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <span>↗</span>
              <span>+15% this month</span>
            </p>
          </div>

          {/* 2-column stats */}
          <div className="grid grid-cols-2 gap-3">
            {/* Active Events */}
            <div className="p-4 rounded-2xl bg-[#111a1c] border border-[#203134] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8ca0a3] font-medium">Active Events</span>
                <div className="p-1.5 rounded-lg bg-[#00f2ff]/10 text-[#00f2ff]">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-[#00f2ff]">4</span>
              </div>
              <p className="text-[10px] text-[#7d9294]">2 happening this week</p>
            </div>

            {/* Registrations */}
            <div className="p-4 rounded-2xl bg-[#111a1c] border border-[#203134] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8ca0a3] font-medium">Registrations</span>
                <div className="p-1.5 rounded-lg bg-[#00f2ff]/10 text-[#00f2ff]">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-[#00f2ff]">452</span>
              </div>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span>↗</span>
                <span>+42 new today</span>
              </p>
            </div>
          </div>

          {/* Manage Team Card */}
          <div
            onClick={() => onNavigate('team-tasks')}
            className="p-4 rounded-2xl bg-[#111a1c] border border-[#203134] hover:border-[#00f2ff]/40 transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <span className="text-xs text-[#8ca0a3] font-medium block mb-2">Manage Team</span>
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#111a1c] object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Alex"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#111a1c] object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                    alt="Sarah"
                  />
                  <img
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#111a1c] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="Marcus"
                  />
                </div>
                <span className="ml-3 text-xs text-[#8ca0a3] font-medium">+3 others</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#00f2ff]/10 text-[#00f2ff]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Tasks Progress Card */}
          <div
            onClick={() => onNavigate('team-tasks')}
            className="p-4 rounded-2xl bg-[#111a1c] border border-[#203134] hover:border-[#00f2ff]/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8ca0a3] font-medium">Tasks Progress</span>
              <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-white">40%</span>
              <span className="text-xs text-zinc-400 font-mono">12/30 Tasks</span>
            </div>
            {/* Cyan progress bar */}
            <div className="w-full h-2 rounded-full bg-[#1b2628] overflow-hidden">
              <div className="h-full bg-[#00f2ff] rounded-full shadow-[0_0_10px_#00f2ff]" style={{ width: '40%' }} />
            </div>
          </div>
        </div>

        {/* Gate Pass & Attendance Scanner Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0c1a1d] to-[#111a1c] border border-[#00f2ff]/30 shadow-[0_0_20px_rgba(0,242,255,0.06)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00f2ff]/10 border border-[#00f2ff]/30 flex items-center justify-center text-[#00f2ff] shrink-0 shadow-[0_0_12px_rgba(0,242,255,0.2)]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Gate Pass Scanner</h3>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-[#8ca0a3] mt-0.5">
                Scan attendee QR passes via camera, external scanner, or manual ID
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenScanner?.()}
            className="px-3 py-2 rounded-xl bg-[#00f2ff] hover:bg-[#3bf5ff] text-black text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,242,255,0.35)] transition-all cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Passes</span>
          </button>
        </div>

        {/* My Active Events Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white tracking-tight">
              My Active Events ({events.length})
            </h2>
            {events.length > 2 && (
              <button
                onClick={() => setShowAllEvents(!showAllEvents)}
                className="text-xs text-[#00f2ff] hover:underline cursor-pointer font-medium"
              >
                {showAllEvents ? 'Show Less' : `View All (${events.length})`}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(showAllEvents ? events : events.slice(0, 2)).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#111a1c] border border-[#203134] overflow-hidden transition-all hover:border-[#00f2ff]/40 flex flex-col"
              >
                {/* Image Banner with Badge */}
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={item.image || FALLBACK_EVENT_IMAGE}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111a1c] via-transparent to-black/30" />
                  
                  {/* Status Badge in corner */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        item.status === 'Active'
                          ? 'bg-black/70 text-emerald-400 border border-emerald-500/40 backdrop-blur-sm'
                          : 'bg-black/70 text-cyan-300 border border-cyan-500/40 backdrop-blur-sm'
                      }`}
                    >
                      {item.status === 'Active' ? 'Active' : 'Upcoming'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <span className="text-[11px] font-medium text-[#00f2ff] bg-[#00f2ff]/10 px-2 py-0.5 rounded border border-[#00f2ff]/20">
                    {item.category}
                  </span>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {item.title}
                  </h3>

                  <div className="space-y-1 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#00f2ff]" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">📍</span>
                      <span className="truncate">{item.venue}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#1e2c2f] mt-3">
                    <span className="text-xs font-mono text-zinc-400">
                      <strong className="text-white">{item.registeredCount}</strong> / {item.capacity} Registered
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onOpenScanner?.(item.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20 border border-[#00f2ff]/30 transition-colors cursor-pointer flex items-center gap-1"
                        title="Scan Gate Passes for this event"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan</span>
                      </button>
                      <button
                        onClick={() => {
                          onSelectEvent(item);
                          onNavigate('create-event');
                        }}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-[#182325] text-zinc-200 hover:text-white hover:bg-[#203134] border border-[#2b3d40] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onSelectEvent(item);
                          onNavigate('team-tasks');
                        }}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-[#00f2ff] text-black hover:bg-[#3bf5ff] shadow-[0_0_10px_rgba(0,242,255,0.35)] transition-all cursor-pointer"
                      >
                        View
                      </button>
                      {onDeleteEvent && (
                        <button
                          onClick={() => onDeleteEvent(item.id)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-500/30 transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Section matching Image 11 */}
        <div className="rounded-2xl bg-[#111a1c] border border-[#203134] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1d2a2d]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#00f2ff]" />
              <span>Notifications</span>
            </h3>
            <button
              onClick={onMarkAllRead}
              className="text-zinc-400 hover:text-white"
            >
              •••
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => {
              const isAction = notif.type === 'action-required';
              return (
                <div key={notif.id} className="flex items-start gap-3 text-xs">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isAction
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-[#00f2ff]/10 text-[#00f2ff]'
                    }`}
                  >
                    {isAction ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-200 leading-relaxed">
                      {isAction && (
                        <strong className="text-red-400 mr-1">Action Required:</strong>
                      )}
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">
                      {notif.timeAgo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center border-t border-[#1d2a2d]">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#00f2ff] hover:underline font-medium cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button '+' at bottom right */}
      <button
        onClick={() => onNavigate('create-event')}
        title="Create New Event"
        className="fixed bottom-16 right-6 sm:right-8 z-30 w-12 h-12 rounded-full bg-[#00f2ff] text-black flex items-center justify-center shadow-[0_0_24px_rgba(0,242,255,0.7)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="h-14 bg-[#091113] border-t border-[#1b2628] flex items-center justify-around px-4 sticky bottom-0 z-20">
        <button
          onClick={() => onNavigate('organizer')}
          className="flex flex-col items-center gap-0.5 text-[#00f2ff] cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          onClick={() => onNavigate('team-tasks')}
          className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-[10px] font-medium">My Events</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
};
