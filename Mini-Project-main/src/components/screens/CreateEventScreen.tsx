import React, { useState, useMemo } from 'react';
import { ScreenId, EventItem } from '../../types';
import { GatherlyLogo } from '../GatherlyLogo';
import {
  selectEventImage,
  getMatchedTopicLabel,
  FALLBACK_EVENT_IMAGE
} from '../../utils/eventImageSelector';
import {
  Menu,
  Bell,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Check,
  Home,
  CalendarDays,
  User,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';

interface CreateEventScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenMenu?: () => void;
  onPublishEvent: (event: Partial<EventItem>) => void;
  onUpdateEvent?: (id: string, event: Partial<EventItem>) => void;
  onShowToast: (message: string) => void;
  eventToEdit?: EventItem | null;
}

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({
  onNavigate,
  onOpenMenu,
  onPublishEvent,
  onUpdateEvent,
  onShowToast,
  eventToEdit,
}) => {
  const isEditing = Boolean(eventToEdit);
  const [title, setTitle] = useState(eventToEdit?.title || 'Spring Career Fair 2024');
  const [eventType, setEventType] = useState<'Academic' | 'Tech Workshop' | 'Hackathon' | 'Career' | 'Cultural' | 'Sports'>(
    (eventToEdit?.type as any) || (eventToEdit?.category as any) || 'Academic'
  );
  const [venue, setVenue] = useState(eventToEdit?.venue || 'Student Union Hall');
  const [date, setDate] = useState(eventToEdit?.date || '2024-10-15');
  const [time, setTime] = useState(eventToEdit?.time || '10:00 AM');
  const [capacity, setCapacity] = useState<number>(eventToEdit?.capacity || 200);
  const [description, setDescription] = useState(
    eventToEdit?.description ||
    'Connect with top employers from across the country looking for bright minds in tech, design, and management.'
  );
  const [eligibleYears, setEligibleYears] = useState<string[]>(
    eventToEdit?.eligibleYears || ['Freshman', 'Sophomore']
  );
  const [regLink, setRegLink] = useState(
    eventToEdit?.registrationLink || 'https://gatherly.campus.edu/rsvp/springfair2024'
  );
  // Custom image override state
  const [customImageUrl, setCustomImageUrl] = useState(
    eventToEdit?.image && eventToEdit.image !== FALLBACK_EVENT_IMAGE ? eventToEdit.image : ''
  );

  // Compute context-aware image automatically based on event metadata
  const autoMatchedImage = useMemo(() => {
    return selectEventImage({
      title,
      category: eventType,
      type: eventType,
      description
    });
  }, [title, eventType, description]);

  const matchedTopicLabel = useMemo(() => {
    return getMatchedTopicLabel({
      title,
      category: eventType,
      type: eventType,
      description
    });
  }, [title, eventType, description]);

  // Effective image to display and save: custom input wins, otherwise intelligent match
  const effectiveImage = customImageUrl.trim() ? customImageUrl.trim() : autoMatchedImage;

  const toggleYear = (yr: string) => {
    if (eligibleYears.includes(yr)) {
      setEligibleYears(eligibleYears.filter((y) => y !== yr));
    } else {
      setEligibleYears([...eligibleYears, yr]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && eventToEdit && onUpdateEvent) {
      onUpdateEvent(eventToEdit.id, {
        title,
        type: eventType,
        category: eventType === 'Academic' ? 'Career' : eventType,
        venue,
        date: date.includes('•') ? date : `${date} • ${time}`,
        time,
        capacity: Number(capacity) || 100,
        description,
        eligibleYears,
        registrationLink: regLink,
        image: effectiveImage,
      });
      onShowToast(`Event "${title}" successfully updated!`);
    } else {
      onPublishEvent({
        title,
        type: eventType,
        category: eventType === 'Academic' ? 'Career' : eventType,
        venue,
        date: date.includes('•') ? date : `${date} • ${time}`,
        time,
        capacity: Number(capacity) || 100,
        description,
        eligibleYears,
        registrationLink: regLink,
        image: effectiveImage,
        status: 'Upcoming',
      });
      onShowToast(`Event "${title}" published with context image!`);
    }

    onNavigate('organizer');
  };

  return (
    <div className="min-h-full flex flex-col bg-[#080f10] text-[#dce4e4]">
      {/* Top Header */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#1b2628] bg-[#091113]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenMenu ? onOpenMenu() : onNavigate('organizer')}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-[#00f2ff] hover:bg-white/5 transition-colors cursor-pointer"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#00f2ff]" />
          </button>
          <GatherlyLogo size="md" variant="cyan" />
        </div>

        <button
          onClick={() => onShowToast('Organizer event publishing panel active.')}
          className="p-2 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4 text-[#00f2ff]" />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-5 py-5 space-y-6 pb-24">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
            {isEditing ? 'Edit Event Details' : 'Create New Event'}
          </h1>
          <p className="text-xs text-[#7d9294] mt-1">
            {isEditing
              ? 'Update event configuration. Image automatically adapts to event context.'
              : 'Fill in event details to publish. Gatherly automatically pairs your event with an appropriate image.'}
          </p>
        </div>

        {/* Event Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div>
            <label className="block text-xs font-medium text-[#8ca0a3] mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Garba Night 2024, Campus Hackathon, Cricket League"
              className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-xs font-medium text-[#8ca0a3] mb-1">
              Event Type / Category
            </label>
            <div className="relative">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all cursor-pointer pr-10"
              >
                <option value="Academic">Academic</option>
                <option value="Tech Workshop">Tech Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Career">Career Fair</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-medium text-[#8ca0a3] mb-1">
              Venue
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g., Student Union Hall, Main Ground"
              className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8ca0a3] mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="mm/dd/yyyy"
                  className="w-full px-3 py-2.5 text-xs bg-[#121c1e] border border-[#223438] rounded-xl text-white focus:outline-none focus:border-[#00f2ff] transition-all"
                />
                <Calendar className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8ca0a3] mb-1">
                Time
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="--:-- --"
                  className="w-full px-3 py-2.5 text-xs bg-[#121c1e] border border-[#223438] rounded-xl text-white focus:outline-none focus:border-[#00f2ff] transition-all"
                />
                <Clock className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-medium text-[#8ca0a3] mb-1">
              Event Capacity (Max Attendees)
            </label>
            <input
              type="number"
              min="1"
              required
              value={capacity}
              onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              placeholder="e.g. 200"
              className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#8ca0a3] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the event activities, schedule, and guidelines..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all resize-none"
            />
          </div>

          {/* Context-Aware Image Selection Box (Feature 1) */}
          <div className="p-3.5 rounded-2xl bg-[#111c1f] border border-[#1f3135] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#00f2ff]" />
                <span>Event Cover Image</span>
              </label>

              {/* Topic Match Pill */}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Match: {matchedTopicLabel}</span>
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-normal">
              Gatherly automatically selects a relevant image based on your event title and category. You can also paste an explicit image URL below to override.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Paste custom image URL (Optional, overrides auto-match)..."
                className="flex-1 px-3 py-2 text-xs bg-[#0b1214] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] font-mono"
              />

              {customImageUrl.trim() && (
                <button
                  type="button"
                  onClick={() => setCustomImageUrl('')}
                  title="Reset to Context Auto-Match"
                  className="px-2.5 py-2 rounded-xl bg-[#182326] hover:bg-[#203135] text-zinc-300 hover:text-[#00f2ff] border border-[#25393d] text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Auto</span>
                </button>
              )}
            </div>
          </div>

          {/* Eligible Years */}
          <div>
            <label className="block text-xs font-medium text-[#8ca0a3] mb-2">
              Eligible Years
            </label>
            <div className="flex flex-wrap gap-2">
              {['Freshman', 'Sophomore', 'Junior', 'Senior'].map((yr) => {
                const isSelected = eligibleYears.includes(yr);
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => toggleYear(yr)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00f2ff] text-black shadow-[0_0_12px_rgba(0,242,255,0.4)] font-bold'
                        : 'bg-[#121b1d] text-zinc-300 border border-[#223336] hover:border-[#384f53]'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Registration Link (Optional) */}
          <div>
            <label className="block text-xs font-medium text-[#8ca0a3] mb-1">
              Registration Link (Optional)
            </label>
            <input
              type="text"
              value={regLink}
              onChange={(e) => setRegLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all font-mono text-xs"
            />
          </div>

          {/* Section: Live Student Preview Card */}
          <div className="pt-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Student Preview</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  Live Sync
                </span>
              </h2>
              <span className="text-xs text-zinc-400 font-mono">
                {customImageUrl.trim() ? 'Custom Image' : `Matched: ${matchedTopicLabel}`}
              </span>
            </div>

            {/* Live Student Card with Context-Aware Image */}
            <div className="rounded-2xl bg-[#111a1c] border border-[#203134] overflow-hidden shadow-xl">
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={effectiveImage}
                  alt={title}
                  className="w-full h-full object-cover filter contrast-[1.05]"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_EVENT_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111a1c] via-black/20 to-black/20" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/80 text-[#00f2ff] border border-[#00f2ff]/40 flex items-center gap-1.5 backdrop-blur-md">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{eventType}</span>
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-lg font-bold text-[#00f2ff] tracking-tight leading-snug">
                  {title || 'Event Title Preview'}
                </h3>

                <div className="space-y-1.5 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#00f2ff]" />
                    <span>{date} • {time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#00f2ff]" />
                    <span>{venue || 'Campus Venue'}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {description || 'Event description preview...'}
                </p>

                <button
                  type="button"
                  onClick={() => onShowToast('RSVP registration preview active!')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00f2ff] hover:bg-[#3bf5ff] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(0,242,255,0.4)] transition-all cursor-pointer mt-2"
                >
                  Register Now
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => onNavigate('organizer')}
              className="flex-1 py-3 px-4 rounded-xl bg-[#141d1f] hover:bg-[#1e2a2c] text-zinc-300 text-xs font-semibold border border-[#223336] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 rounded-xl bg-[#00f2ff] hover:bg-[#3bf5ff] text-black text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? 'Save Changes' : 'Publish to Campus'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Navigation */}
      <nav className="h-14 bg-[#091113] border-t border-[#1b2628] flex items-center justify-around px-4 sticky bottom-0 z-20">
        <button
          onClick={() => onNavigate('organizer')}
          className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => onNavigate('create-event')}
          className="flex flex-col items-center gap-0.5 text-[#00f2ff] cursor-pointer"
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Post Event</span>
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
