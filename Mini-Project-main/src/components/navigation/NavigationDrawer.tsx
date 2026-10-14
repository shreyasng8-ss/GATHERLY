import React, { useEffect } from 'react';
import { ScreenId } from '../../types';
import { GatherlyLogo } from '../GatherlyLogo';
import {
  X,
  Home,
  LayoutDashboard,
  Compass,
  Users,
  PlusCircle,
  Ticket,
  Settings,
  ShieldCheck,
  CheckSquare,
  QrCode,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  studentName?: string;
  studentId?: string;
  onSignOut?: () => void;
  onOpenScanner?: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: ScreenId;
    label: string;
    icon: React.ElementType;
    badge?: string;
    customAction?: () => void;
  }[];
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onSelectScreen,
  studentName = 'Alex Chen',
  studentId = '#GTH-8821',
  onSignOut,
  onOpenScanner
}) => {
  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleItemClick = (screen: ScreenId, customAction?: () => void) => {
    if (customAction) {
      customAction();
    } else {
      onSelectScreen(screen);
    }
    onClose();
  };

  const navSections: NavSection[] = [
    {
      title: 'CAMPUS DISCOVERY',
      items: [
        {
          id: 'student',
          label: 'Home',
          icon: Home
        },
        {
          id: 'explore-events',
          label: 'Explore Events',
          icon: Compass,
          badge: 'Live'
        },
        {
          id: 'clubs',
          label: 'My Clubs',
          icon: Users,
          badge: 'New'
        }
      ]
    },
    {
      title: 'STUDENT PORTAL',
      items: [
        {
          id: 'student',
          label: 'Student Dashboard',
          icon: LayoutDashboard
        },
        {
          id: 'my-registrations',
          label: 'My Registrations',
          icon: Ticket
        }
      ]
    },
    {
      title: 'ORGANIZER HUB',
      items: [
        {
          id: 'organizer',
          label: 'Organizer Dashboard',
          icon: ShieldCheck
        },
        {
          id: 'create-event',
          label: 'Post Event',
          icon: PlusCircle
        },
        {
          id: 'team-tasks',
          label: 'Team & Tasks',
          icon: CheckSquare
        },
        {
          id: 'ticket-scanner',
          label: 'Gate Pass Scanner',
          icon: QrCode,
          customAction: onOpenScanner
        }
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        {
          id: 'settings',
          label: 'Profile & Settings',
          icon: Settings
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <aside
        className="relative z-10 w-80 max-w-[85vw] h-full bg-[#0a0f12] border-r border-[#1a292d] shadow-[0_0_50px_rgba(0,242,255,0.15)] flex flex-col justify-between overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 animate-in slide-in-from-left duration-300"
        role="dialog"
        aria-label="Navigation Menu"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-[#182528] bg-[#0c1417]/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <GatherlyLogo size="md" variant="cyan" />
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
              title="Close Navigation Menu"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* User profile snippet in drawer */}
          <div className="mt-4 p-3 rounded-xl bg-[#111c1f] border border-[#1f3135] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#00f2ff]/20 to-[#00f2ff]/40 border border-[#00f2ff]/50 flex items-center justify-center text-white font-bold text-xs">
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{studentName}</p>
              <p className="text-[10px] text-zinc-400 font-mono truncate">ID: {studentId}</p>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">
              Active
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-4 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentScreen === item.id ||
                  (item.id === 'student' && currentScreen === 'student' && item.label === 'Student Dashboard') ||
                  (item.id === 'explore-events' && currentScreen === 'explore-events') ||
                  (item.id === 'my-registrations' && currentScreen === 'my-registrations');

                return (
                  <button
                    key={`${section.title}-${item.label}`}
                    onClick={() => handleItemClick(item.id, item.customAction)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#00f2ff]/15 text-[#00f2ff] border border-[#00f2ff]/40 shadow-[0_0_14px_rgba(0,242,255,0.25)] font-bold'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#00f2ff]' : 'text-zinc-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/40 font-bold">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? 'text-[#00f2ff] translate-x-0.5' : 'text-zinc-600'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-[#182528] bg-[#0c1417]/80 space-y-2">
          <button
            onClick={() => {
              if (onSignOut) {
                onSignOut();
              } else {
                onSelectScreen('login');
              }
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#141e21] hover:bg-[#1e2d31] text-zinc-300 hover:text-red-400 border border-[#233538] text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <p className="text-[10px] text-zinc-400 text-center font-mono pt-1">
            Gatherly Campus v1.2.0 • 2026
          </p>
        </div>
      </aside>
    </div>
  );
};
