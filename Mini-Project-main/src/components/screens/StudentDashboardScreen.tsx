import React, { useState } from 'react';
import { ScreenId, EventItem, StudentProfile, NotificationItem } from '../../types';
import { GatherlyLogo } from '../GatherlyLogo';
import { FALLBACK_EVENT_IMAGE } from '../../utils/eventImageSelector';
import {
  Menu,
  Bell,
  LogOut,
  Calendar,
  TrendingUp,
  Users,
  Award,
  Sparkles,
  MapPin,
  Clock,
  QrCode,
  Wifi,
  Radio,
  CheckCircle2,
  Ticket,
  ShieldCheck,
  Home,
  CalendarCheck,
  Compass,
  User,
  Info,
  Search,
  Filter
} from 'lucide-react';

interface StudentDashboardProps {
  profile: StudentProfile;
  events: EventItem[];
  notifications: NotificationItem[];
  onNavigate: (screen: ScreenId) => void;
  onOpenMenu?: () => void;
  onOpenTicket: (event: EventItem) => void;
  onSelectEventDetails: (event: EventItem) => void;
  onOpenRegistrationModal: (event: EventItem) => void;
  onMarkAllRead: () => void;
  onShowToast: (message: string) => void;
  onRegisterEvent?: (eventId: string) => void;
  registeringEventId?: string | null;
}

export const StudentDashboardScreen: React.FC<StudentDashboardProps> = ({
  profile,
  events,
  notifications,
  onNavigate,
  onOpenMenu,
  onOpenTicket,
  onSelectEventDetails,
  onOpenRegistrationModal,
  onMarkAllRead,
  onShowToast,
  registeringEventId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const registeredEvents = events.filter((e) => e.isRegistered);
  const unregisteredEvents = events.filter((e) => !e.isRegistered);

  // Filtered discover events
  const filteredEvents = unregisteredEvents.filter((e) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (e.category && e.category.toLowerCase() === selectedCategory.toLowerCase()) ||
      (e.type && e.type.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      !searchQuery.trim() ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.venue && e.venue.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Tech Workshop', 'Hackathon', 'Career', 'Academic'];

  return (
    <div className="min-h-full flex flex-col bg-[#0a0c10] text-[#dfe2ef]">
      {/* Top Header matching Image 16 */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#231b14] bg-[#0f131c]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenMenu ? onOpenMenu() : onNavigate('organizer')}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-[#ff7a00] hover:bg-white/5 transition-colors cursor-pointer"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#ff7a00]" />
          </button>
          <GatherlyLogo size="md" variant="orange" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onMarkAllRead}
            className="relative p-1.5 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-[#ff9e00]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff7a00] ring-2 ring-[#0a0c10]" />
          </button>

          <button
            onClick={() => {
              onShowToast('Logged out of Student Session.');
              onNavigate('login');
            }}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-zinc-400 hover:text-white" />
          </button>

          <div
            onClick={() => onNavigate('settings')}
            className="w-8 h-8 rounded-full bg-[#ff7a00]/20 border border-[#ff7a00]/40 flex items-center justify-center text-[#ff7a00] cursor-pointer hover:border-[#ff7a00]"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-5 py-5 space-y-5 pb-28">
        {/* Alex Chen Profile Card matching Image 16 */}
        <div className="p-4 rounded-2xl bg-[#141824] border border-[#ff7a00]/25 shadow-[0_0_20px_rgba(255,122,0,0.1)] relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#ff7a00]"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ff7a00] ring-2 ring-[#141824] flex items-center justify-center text-[9px] text-black font-bold">
                  ⚡
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">{profile.name}</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ff7a00]/20 text-[#ffb68b] border border-[#ff7a00]/30 font-semibold">
                    {profile.gradYear}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  {profile.standing} • ID: {profile.studentId}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('login')}
              className="text-[11px] text-zinc-400 hover:text-[#ff9e00] flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#1b2030] border border-white/5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-[#ff9e00]">
              <span className="w-2 h-2 rounded-full bg-[#ff7a00] animate-pulse" />
              <span className="tracking-wider uppercase text-[11px] font-semibold">Live Telemetry</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Campus Pass Valid</span>
            </div>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="space-y-3">
          {/* Upcoming Registered */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
                  Upcoming Registered
                </span>
                <span className="text-xl font-extrabold text-white">
                  {registeredEvents.length}{' '}
                  <span className="text-xs font-normal text-zinc-400">
                    {registeredEvents.length === 1 ? 'pass' : 'passes'}
                  </span>
                </span>
              </div>
            </div>
            <span className="text-xs text-[#ffb68b] font-mono bg-[#ff7a00]/10 px-2 py-0.5 rounded-md border border-[#ff7a00]/20">
              Active Sync
            </span>
          </div>

          {/* Campus Activity XP */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
                  Campus Activity XP
                </span>
                <span className="text-xl font-extrabold text-white">
                  1,450 <span className="text-xs font-normal text-zinc-400">XP</span>
                </span>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
              <span>⚡</span>
              <span>+180 mo</span>
            </span>
          </div>

          {/* Joined Clubs */}
          <div
            onClick={() => onNavigate('clubs')}
            className="p-3.5 rounded-xl bg-[#141824] hover:bg-[#1a2030] border border-white/5 hover:border-[#ff7a00]/30 transition-all cursor-pointer flex items-center justify-between group"
            title="Manage Campus Clubs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono block">
                  Campus Clubs & Societies
                </span>
                <span className="text-xl font-extrabold text-white">
                  My Clubs
                </span>
              </div>
            </div>
            {/* Club badge icons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-1.5">
                <span className="w-6 h-6 rounded-full bg-zinc-800 text-[10px] flex items-center justify-center font-bold text-zinc-300 ring-2 ring-[#141824]">
                  {'< >'}
                </span>
                <span className="w-6 h-6 rounded-full bg-[#ff7a00] text-[10px] flex items-center justify-center font-bold text-black ring-2 ring-[#141824]">
                  AI
                </span>
                <span className="w-6 h-6 rounded-full bg-amber-700 text-[10px] flex items-center justify-center font-bold text-white ring-2 ring-[#141824]">
                  🤖
                </span>
              </div>
              <span className="text-xs text-[#ff7a00] font-bold group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Semester Engagement */}
          <div className="p-4 rounded-xl bg-[#141824] border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#ff7a00]" />
                <span className="text-xs uppercase tracking-wider text-zinc-300 font-mono font-medium">
                  Semester Engagement
                </span>
              </div>
              <span className="text-sm font-bold text-[#ff9e00]">65%</span>
            </div>
            <div className="text-lg font-bold text-white mb-2">
              13/20 <span className="text-xs font-normal text-zinc-400">Milestones</span>
            </div>
            {/* Neon orange progress bar */}
            <div className="w-full h-2.5 rounded-full bg-[#1e2436] overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-[#ff7a00] to-[#ff9e00] rounded-full shadow-[0_0_12px_#ff7a00]"
                style={{ width: '65%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Target: Honor Tier (18 req.)</span>
              <span className="text-amber-400 font-semibold">✪ Silver Status</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MY REGISTRATIONS SECTION (Feature Requirement 5)                  */}
        {/* ------------------------------------------------------------------ */}
        <section id="my-registrations" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#ff7a00]" />
              <h3 className="text-base font-bold text-white tracking-tight">
                My Registrations ({registeredEvents.length})
              </h3>
            </div>
            {registeredEvents.length > 0 && (
              <span className="text-xs text-[#ff9e00] font-medium font-mono">
                {registeredEvents.length} Active {registeredEvents.length === 1 ? 'Pass' : 'Passes'}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {registeredEvents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#141824] border border-white/5 text-center space-y-2">
                <Ticket className="w-8 h-8 text-zinc-500 mx-auto" />
                <p className="text-sm font-semibold text-zinc-300">No active registrations yet</p>
                <p className="text-xs text-zinc-500">
                  Select an upcoming campus event below to fill your student registration form and receive your scannable gate pass.
                </p>
              </div>
            ) : (
              registeredEvents.map((evt, idx) => {
                const regCode = evt.registrationId || `REG-${evt.id.toUpperCase()}`;
                const passCode = evt.ticketId || `TKT-${evt.id.toUpperCase()}`;

                return (
                  <div
                    key={evt.id}
                    className={`rounded-2xl bg-[#141824] overflow-hidden ${
                      idx === 0
                        ? 'border border-[#ff7a00]/30 shadow-[0_0_20px_rgba(255,122,0,0.15)]'
                        : 'border border-white/5'
                    }`}
                  >
                    {/* Event Banner */}
                    <div
                      onClick={() => onSelectEventDetails(evt)}
                      className="relative h-40 w-full overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={evt.image || FALLBACK_EVENT_IMAGE}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141824] via-black/30 to-black/30" />

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff7a00] text-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_#ff7a00]">
                          <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                          CONFIRMED
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/70 text-white backdrop-blur-md border border-white/10">
                          Fast Pass Ready
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 text-[#ff7a00]">
                        <Sparkles className="w-5 h-5 drop-shadow-[0_0_8px_#ff7a00]" />
                      </div>
                    </div>

                    {/* Registration Card Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[11px] font-mono font-bold tracking-wider text-[#ff9e00] uppercase block">
                          {evt.category || evt.type || 'CAMPUS EVENT'}
                        </span>
                        <h4
                          onClick={() => onSelectEventDetails(evt)}
                          className="text-base font-bold text-white leading-snug cursor-pointer hover:text-[#ff9e00] transition-colors"
                        >
                          {evt.title}
                        </h4>
                      </div>

                      {/* Event Date & Venue */}
                      <div className="space-y-1 text-xs text-zinc-300 bg-[#0e121a] p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#ff7a00]" />
                          <span>{evt.date} • {evt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#ff7a00]" />
                          <span>{evt.venue}</span>
                        </div>
                      </div>

                      {/* Registration ID & Status Tags */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-2 rounded-lg bg-[#181f2f] border border-white/5">
                          <span className="text-zinc-500 block text-[10px]">REGISTRATION ID</span>
                          <span className="text-zinc-200 font-bold truncate block">{regCode}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#181f2f] border border-white/5">
                          <span className="text-zinc-500 block text-[10px]">PASS CODE</span>
                          <span className="text-[#ff9e00] font-bold truncate block">{passCode}</span>
                        </div>
                      </div>

                      {/* Actions: View Ticket & View Details */}
                      <div className="pt-1 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onOpenTicket(evt)}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9e00] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(255,122,0,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View Ticket</span>
                        </button>

                        <button
                          onClick={() => onSelectEventDetails(evt)}
                          className="py-2.5 px-3 rounded-xl bg-[#1e2436] hover:bg-[#28324a] text-zinc-200 hover:text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-white/10 active:scale-95"
                        >
                          <Info className="w-3.5 h-3.5 text-[#ff7a00]" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* DISCOVER CAMPUS EVENTS (Feature Requirement 1)                     */}
        {/* ------------------------------------------------------------------ */}
        <section id="discover-events" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#ff7a00]" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Discover Campus Events ({filteredEvents.length})
              </h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Open for RSVP</span>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, workshops, hackathons..."
                className="w-full pl-9 pr-3 py-2 bg-[#141824] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#ff7a00] text-black font-bold'
                      : 'bg-[#181f2f] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#141824] border border-white/5 text-center text-zinc-400 text-xs">
                No events found matching your criteria.
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const seatsLeft = Math.max(0, evt.capacity - (evt.registeredCount || 0));
                const isFull = seatsLeft === 0;
                const isRegistering = registeringEventId === evt.id;

                return (
                  <div
                    key={evt.id}
                    className="rounded-2xl bg-[#141824] border border-white/5 overflow-hidden hover:border-[#ff7a00]/30 transition-all"
                  >
                    {/* Clickable Card Header */}
                    <div
                      onClick={() => onSelectEventDetails(evt)}
                      className="relative h-36 w-full overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={evt.image || FALLBACK_EVENT_IMAGE}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141824] via-black/20 to-black/30" />

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/80 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                          {evt.category || 'EVENT'}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/80 text-white border border-white/10">
                          {isFull ? 'Sold Out' : `${seatsLeft} seats left`}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <h4
                        onClick={() => onSelectEventDetails(evt)}
                        className="text-base font-bold text-white leading-snug cursor-pointer hover:text-[#ff9e00] transition-colors"
                      >
                        {evt.title}
                      </h4>

                      <div className="space-y-1 text-xs text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#ff7a00]" />
                          <span>{evt.date} • {evt.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#ff7a00]" />
                          <span>{evt.venue}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-2">
                        <span className="text-xs font-mono text-zinc-400">
                          <strong className="text-white">{evt.registeredCount}</strong> / {evt.capacity} Registered
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectEventDetails(evt)}
                            className="py-2 px-3 rounded-xl bg-[#1e2436] hover:bg-[#28324a] text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer border border-white/10"
                          >
                            Details
                          </button>

                          <button
                            disabled={isFull || isRegistering}
                            onClick={() => onOpenRegistrationModal(evt)}
                            className={`py-2 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                              isFull
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                                : isRegistering
                                ? 'bg-[#ff7a00]/50 text-black cursor-wait animate-pulse'
                                : 'bg-gradient-to-r from-[#ff7a00] to-[#ff9e00] text-black shadow-[0_0_14px_rgba(255,122,0,0.35)] hover:brightness-110 active:scale-95'
                            }`}
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>
                              {isFull
                                ? 'Capacity Full'
                                : isRegistering
                                ? 'Registering...'
                                : 'Register Now'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Notifications & Alerts Section matching Image 16 */}
        <div className="rounded-2xl bg-[#141824] border border-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#ff7a00]" />
              <span>Notifications & Alerts</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff7a00]/20 text-[#ffb68b] border border-[#ff7a00]/30 font-semibold">
              2 New
            </span>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 text-xs">
                <div className="p-2 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] shrink-0 mt-0.5">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{n.title || 'Notice'}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{n.timeAgo}</span>
                  </div>
                  <p className="text-zinc-300 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center border-t border-white/5">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#ff9e00] hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
            >
              <span>✓ Mark all notifications as read</span>
            </button>
          </div>
        </div>

        {/* Telemetry Status Bar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#141824] border border-white/5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ff7a00]/10 text-[#ff7a00]">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-400">Student NFC</p>
              <p className="text-xs font-bold text-emerald-400">Auto-Sync On</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#141824] border border-white/5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ff7a00]/10 text-[#ff7a00]">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-400">Mesh Network</p>
              <p className="text-xs font-bold text-cyan-400">Connected (5G)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button: Glowing Orange QR Pass Button */}
      <button
        onClick={() => registeredEvents[0] && onOpenTicket(registeredEvents[0])}
        title="Open Dynamic Gate Pass"
        className="fixed bottom-16 right-6 sm:right-8 z-30 w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#ff7a00] to-[#ffb68b] text-black flex items-center justify-center shadow-[0_0_28px_rgba(255,122,0,0.7)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
      >
        <QrCode className="w-7 h-7 stroke-[2.2]" />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="h-14 bg-[#0a0c10] border-t border-[#1e2436] flex items-center justify-around px-4 sticky bottom-0 z-20">
        <button
          onClick={() => onNavigate('student')}
          className="flex flex-col items-center gap-0.5 text-[#ff7a00] cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('my-registrations');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <CalendarCheck className="w-4 h-4" />
          <span className="text-[10px] font-medium">My Events</span>
        </button>

        <button
          onClick={() => onNavigate('clubs')}
          className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-medium">Clubs</span>
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
