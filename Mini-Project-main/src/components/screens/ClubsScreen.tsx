import React, { useState, useEffect, useMemo } from 'react';
import { ScreenId, ClubItem, EventItem, StudentProfile } from '../../types';
import { GatherlyLogo } from '../GatherlyLogo';
import { ClubDetailsModal } from '../modals/ClubDetailsModal';
import { FALLBACK_EVENT_IMAGE } from '../../utils/eventImageSelector';
import { api } from '../../services/api';
import {
  Menu,
  Bell,
  Users,
  Search,
  Check,
  UserPlus,
  UserMinus,
  Sparkles,
  Compass,
  ArrowRight,
  Info,
  Calendar,
  Home,
  CalendarCheck,
  User
} from 'lucide-react';

interface ClubsScreenProps {
  profile: StudentProfile;
  events: EventItem[];
  onNavigate: (screen: ScreenId) => void;
  onOpenMenu: () => void;
  onShowToast: (message: string) => void;
  onSelectEventDetails?: (event: EventItem) => void;
}

export const ClubsScreen: React.FC<ClubsScreenProps> = ({
  profile,
  events,
  onNavigate,
  onOpenMenu,
  onShowToast,
  onSelectEventDetails
}) => {
  const [activeTab, setActiveTab] = useState<'joined' | 'explore'>('joined');
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal State
  const [selectedClub, setSelectedClub] = useState<ClubItem | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Fetch clubs from real API
  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getClubs(profile.studentId);
      if (Array.isArray(data)) {
        setClubs(data);
      }
    } catch (err: any) {
      console.warn('Clubs API fetch error, using existing state:', err);
      onShowToast('Loaded local clubs data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [profile.studentId]);

  const joinedClubs = useMemo(() => {
    return clubs.filter((c) => Boolean(c.isJoined));
  }, [clubs]);

  const filteredExploreClubs = useMemo(() => {
    return clubs.filter((c) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        c.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [clubs, selectedCategory, searchQuery]);

  // Categories
  const categories = [
    'All',
    'Technology',
    'Cultural',
    'Performing Arts',
    'Music',
    'Athletics',
    'Creative Arts',
    'Business'
  ];

  // Join / Leave Handler
  const handleToggleJoin = async (clubId: string, currentJoined: boolean) => {
    setActionInProgressId(clubId);
    const targetClub = clubs.find((c) => c.id === clubId);
    const clubName = targetClub?.name || 'Club';

    try {
      if (currentJoined) {
        // Leave club
        // Optimistic UI update
        setClubs((prev) =>
          prev.map((c) =>
            c.id === clubId
              ? { ...c, isJoined: false, memberCount: Math.max(0, c.memberCount - 1) }
              : c
          )
        );
        if (selectedClub && selectedClub.id === clubId) {
          setSelectedClub((prev) =>
            prev ? { ...prev, isJoined: false, memberCount: Math.max(0, prev.memberCount - 1) } : null
          );
        }

        await api.leaveClub(clubId, profile.studentId);
        onShowToast(`Left ${clubName}. Membership updated.`);
      } else {
        // Join club
        // Optimistic UI update
        setClubs((prev) =>
          prev.map((c) =>
            c.id === clubId ? { ...c, isJoined: true, memberCount: c.memberCount + 1 } : c
          )
        );
        if (selectedClub && selectedClub.id === clubId) {
          setSelectedClub((prev) =>
            prev ? { ...prev, isJoined: true, memberCount: prev.memberCount + 1 } : null
          );
        }

        const res = await api.joinClub(clubId, profile.studentId, profile.name);
        onShowToast(res.message || `Joined ${clubName}!`);
      }
    } catch (err: any) {
      console.error('Failed to toggle club membership:', err);
      onShowToast(err?.message || 'Membership update failed. Please retry.');
      // Rollback on failure
      fetchClubs();
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleOpenDetails = (club: ClubItem) => {
    setSelectedClub(club);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="min-h-full flex flex-col bg-[#080d0f] text-[#dce4e4]">
      {/* Top Header */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#1b2628] bg-[#091113]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-[#00f2ff] hover:bg-white/5 transition-colors cursor-pointer"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#00f2ff]" />
          </button>
          <GatherlyLogo size="md" variant="cyan" />
        </div>

        <div className="flex items-center gap-2">
          {/* Active persona badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 text-[11px] font-mono">
            <Users className="w-3 h-3" />
            <span>{joinedClubs.length} Joined</span>
          </div>

          <div
            onClick={() => onNavigate('settings')}
            className="w-8 h-8 rounded-full bg-[#00f2ff]/20 border border-[#00f2ff]/40 flex items-center justify-center text-[#00f2ff] cursor-pointer hover:border-[#00f2ff]"
            title="Settings & Profile"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-5 py-5 space-y-5 pb-28">
        {/* Title & Introduction */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-tight flex items-center gap-2">
            <span>Campus Clubs & Societies</span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-[#00f2ff]/15 text-[#00f2ff] border border-[#00f2ff]/30">
              Interactive
            </span>
          </h1>
          <p className="text-xs text-[#7d9294] mt-0.5">
            Discover student communities, manage your memberships, and join upcoming club activities.
          </p>
        </div>

        {/* Tab Switcher: My Clubs vs Explore Clubs */}
        <div className="grid grid-cols-2 p-1 bg-[#10191c] rounded-2xl border border-[#1e2f33]">
          <button
            onClick={() => setActiveTab('joined')}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'joined'
                ? 'bg-[#00f2ff] text-black shadow-[0_0_14px_rgba(0,242,255,0.4)]'
                : 'text-[#849a9c] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Clubs ({joinedClubs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'explore'
                ? 'bg-[#00f2ff] text-black shadow-[0_0_14px_rgba(0,242,255,0.4)]'
                : 'text-[#849a9c] hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore All Clubs</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: MY CLUBS (Only clubs joined by current student)              */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'joined' && (
          <div className="space-y-4">
            {joinedClubs.length === 0 ? (
              /* Friendly Empty State */
              <div className="p-8 rounded-3xl bg-[#0f1719] border border-[#1b2b2f] text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,242,255,0.2)]">
                  <Compass className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    You haven't joined any campus clubs yet
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Explore active campus societies to connect with fellow students, collaborate on projects, and receive private club invitations.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('explore')}
                  className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#00f2ff] hover:bg-[#3bf5ff] text-black text-xs font-bold tracking-wide shadow-[0_0_16px_rgba(0,242,255,0.4)] transition-all cursor-pointer"
                >
                  <span>Explore Clubs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {joinedClubs.map((club) => (
                  <div
                    key={club.id}
                    className="rounded-2xl bg-[#10191c] border border-[#1e2f33] overflow-hidden shadow-lg transition-all hover:border-[#00f2ff]/40 flex flex-col justify-between"
                  >
                    <div>
                      {/* Club Card Hero */}
                      <div className="relative h-32 w-full overflow-hidden">
                        <img
                          src={club.image || FALLBACK_EVENT_IMAGE}
                          alt={club.name}
                          className="w-full h-full object-cover filter contrast-[1.05]"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#10191c] via-black/30 to-black/30" />

                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/80 text-[#00f2ff] border border-[#00f2ff]/40 backdrop-blur-md">
                            {club.category}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Enrolled</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-base font-bold text-white tracking-tight">
                            {club.name}
                          </h3>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {club.memberCount} members
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {club.description}
                        </p>

                        {club.meetingSchedule && (
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono pt-1">
                            <Calendar className="w-3 h-3 text-[#00f2ff]" />
                            <span>{club.meetingSchedule}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 pt-1 flex items-center gap-2 border-t border-[#172528] mt-2">
                      <button
                        onClick={() => handleOpenDetails(club)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#142023] hover:bg-[#1d2d31] text-zinc-200 text-xs font-semibold border border-[#233538] transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Info className="w-3.5 h-3.5 text-[#00f2ff]" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => handleToggleJoin(club.id, true)}
                        disabled={actionInProgressId === club.id}
                        className="py-2 px-3 rounded-xl bg-[#181d20] hover:bg-red-950/40 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        title="Leave this club"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Leave</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: EXPLORE ALL CLUBS                                            */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'explore' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by club name, topic, category..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#10191c] border border-[#1e2f33] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-medium px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#00f2ff] text-black font-bold shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                      : 'bg-[#121c1e] text-zinc-400 hover:text-white border border-[#203236]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Club Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredExploreClubs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#10191c] border border-[#1e2f33] text-center text-xs text-zinc-400">
                  No campus clubs found matching your search. Try adjusting the filter.
                </div>
              ) : (
                filteredExploreClubs.map((club) => {
                  const isJoined = Boolean(club.isJoined);

                  return (
                    <div
                      key={club.id}
                      className="rounded-2xl bg-[#10191c] border border-[#1e2f33] overflow-hidden shadow-lg transition-all hover:border-[#00f2ff]/40 flex flex-col justify-between"
                    >
                      <div>
                        {/* Club Hero */}
                        <div className="relative h-32 w-full overflow-hidden">
                          <img
                            src={club.image || FALLBACK_EVENT_IMAGE}
                            alt={club.name}
                            className="w-full h-full object-cover filter contrast-[1.05]"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#10191c] via-black/30 to-black/30" />

                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/80 text-[#00f2ff] border border-[#00f2ff]/40 backdrop-blur-md">
                              {club.category}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/80 text-zinc-300 border border-white/10 backdrop-blur-md">
                              {club.memberCount} members
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4 space-y-2">
                          <h3 className="text-base font-bold text-white tracking-tight">
                            {club.name}
                          </h3>

                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {club.description}
                          </p>

                          {club.meetingSchedule && (
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono pt-1">
                              <Calendar className="w-3 h-3 text-[#00f2ff]" />
                              <span>{club.meetingSchedule}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-4 pt-1 flex items-center gap-2 border-t border-[#172528] mt-2">
                        <button
                          onClick={() => handleOpenDetails(club)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#142023] hover:bg-[#1d2d31] text-zinc-200 text-xs font-semibold border border-[#233538] transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Info className="w-3.5 h-3.5 text-[#00f2ff]" />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => handleToggleJoin(club.id, isJoined)}
                          disabled={actionInProgressId === club.id}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isJoined
                              ? 'bg-[#182326] text-emerald-400 hover:bg-red-950/40 hover:text-red-400 border border-emerald-500/30'
                              : 'bg-[#00f2ff] text-black hover:bg-[#3af4ff] shadow-[0_0_14px_rgba(0,242,255,0.35)]'
                          }`}
                        >
                          {actionInProgressId === club.id ? (
                            <span>...</span>
                          ) : isJoined ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Joined</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Join Club</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Club Details Modal */}
      <ClubDetailsModal
        club={selectedClub}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onToggleJoin={handleToggleJoin}
        onSelectEvent={(evt) => {
          if (onSelectEventDetails) {
            onSelectEventDetails(evt);
          } else {
            onNavigate('student');
          }
        }}
      />

      {/* Bottom Navigation */}
      <nav className="h-14 bg-[#091113] border-t border-[#1b2628] flex items-center justify-around px-4 sticky bottom-0 z-20">
        <button
          onClick={() => onNavigate('student')}
          className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => onNavigate('my-registrations')}
          className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <CalendarCheck className="w-4 h-4" />
          <span className="text-[10px] font-medium">My Events</span>
        </button>

        <button
          onClick={() => {}}
          className="flex flex-col items-center gap-0.5 text-[#00f2ff] cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Clubs</span>
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
