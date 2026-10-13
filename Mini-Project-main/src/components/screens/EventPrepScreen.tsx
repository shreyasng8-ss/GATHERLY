import React, { useState } from 'react';
import { ScreenId, TeamMember, TaskItem } from '../../types';
import { GatherlyLogo } from '../GatherlyLogo';
import { NewTaskModal } from '../modals/NewTaskModal';
import {
  Plus,
  Check,
  Compass,
  LayoutGrid,
  PlusCircle,
  User,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
} from 'lucide-react';

interface EventPrepScreenProps {
  teamMembers: TeamMember[];
  tasks: TaskItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, assignee: string, assigneeAvatar?: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (message: string) => void;
}

export const EventPrepScreen: React.FC<EventPrepScreenProps> = ({
  teamMembers,
  tasks,
  onToggleTask,
  onAddTask,
  onNavigate,
  onShowToast,
}) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const remainingCount = totalCount - completedCount;

  // Circular progress calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const getBadgeStyle = (color: TeamMember['badgeColor']) => {
    switch (color) {
      case 'cyan':
        return 'text-[#00f2ff] bg-[#00f2ff]/10 border-[#00f2ff]/30';
      case 'magenta':
        return 'text-[#ebb2ff] bg-[#b600f8]/20 border-[#ebb2ff]/30';
      case 'green':
        return 'text-[#79ff5b] bg-[#34fc0d]/15 border-[#79ff5b]/30';
      case 'purple':
        return 'text-[#d8b4fe] bg-[#7e22ce]/20 border-[#c084fc]/30';
      case 'teal':
        return 'text-[#74f5ff] bg-[#00dbe7]/15 border-[#74f5ff]/30';
      case 'slate':
      default:
        return 'text-[#94a3b8] bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#080d0e] text-[#dce4e4]">
      {/* Top Header matching Image 3 */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#1b2527] bg-[#091113]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <GatherlyLogo size="md" variant="cyan" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('organizer')}
            className="text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-[#121c1e] border border-[#213235] cursor-pointer"
          >
            ← Back to Dash
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-5 py-5 space-y-6 pb-24">
        {/* Title */}
        <div>
          <h1 className="text-lg font-bold text-[#00f2ff] tracking-tight leading-snug">
            Event Preparation: Tech Workshop
          </h1>
          <p className="text-xs text-[#82979a] mt-1 leading-relaxed">
            Manage your team and track essential tasks for a successful launch.
          </p>
        </div>

        {/* Overall Progress Card matching Image 3 */}
        <div className="p-5 rounded-2xl bg-[#0f1718] border border-[#1e2e31] space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#8ca0a3]">
            <Layers className="w-4 h-4 text-[#00f2ff]" />
            <span>Overall Progress</span>
          </div>

          {/* Circular Progress Gauge */}
          <div className="flex justify-center items-center py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#1c282a"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Ring with Magenta/Cyan Glow */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f2ff" />
                    <stop offset="100%" stopColor="#ebb2ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Remaining Banner */}
          <div className="p-3 rounded-xl bg-[#0a1011] border border-[#1b2628] text-center">
            <p className="text-xs text-zinc-300">
              <strong className="text-white font-bold">{remainingCount} tasks remaining</strong> for event launch.
            </p>
          </div>
        </div>

        {/* Core Team Section matching Image 3 */}
        <div className="rounded-2xl bg-[#0f1718] border border-[#1e2e31] p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8ca0a3]">
            <span>👥</span>
            <span>Core Team</span>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00f2ff]/30"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{member.name}</h4>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${getBadgeStyle(
                        member.badgeColor
                      )}`}
                    >
                      {member.badgeText}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onShowToast(`Contacting ${member.name} (${member.badgeText}).`)}
                  className="text-xs text-zinc-500 hover:text-white px-2 py-1 cursor-pointer"
                >
                  •••
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Task Assignment & Tracking Section matching Image 3 */}
        <div className="rounded-2xl bg-[#0f1718] border border-[#1e2e31] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">📋</span>
              <h3 className="text-xs font-bold text-white tracking-wide">
                Task Assignment & Tracking
              </h3>
            </div>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-[#c5fcff] hover:bg-white text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,242,255,0.3)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>

          {/* Interactive Checkbox List */}
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  task.completed
                    ? 'bg-[#141822] border-[#252838] opacity-90'
                    : 'bg-[#0b1213] border-[#1d2d30] hover:border-[#00f2ff]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Styled Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-[#d97706] sm:bg-[#b600f8] text-white shadow-[0_0_8px_#b600f8]'
                        : 'border border-zinc-600 bg-transparent'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <span
                    className={`text-xs font-medium ${
                      task.completed ? 'text-zinc-400 line-through' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Assignee badge */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#141e20] border border-[#233538] text-[11px] text-zinc-300 font-mono">
                  {task.assigneeAvatar && (
                    <img
                      src={task.assigneeAvatar}
                      alt={task.assignee}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  )}
                  <span>{task.assignee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        teamMembers={teamMembers}
        onAddTask={(title, assignee, avatar) => {
          onAddTask(title, assignee, avatar);
          onShowToast(`Task "${title}" assigned to ${assignee}!`);
        }}
      />

      {/* Bottom Navigation */}
      <nav className="h-14 bg-[#091113] border-t border-[#1b2628] flex items-center justify-around px-4 sticky bottom-0 z-20">
        <button
          onClick={() => onNavigate('organizer')}
          className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-medium">Explore</span>
        </button>

        <button
          onClick={() => onNavigate('team-tasks')}
          className="flex flex-col items-center gap-0.5 text-[#00f2ff] cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Manage</span>
        </button>

        <button
          onClick={() => onNavigate('create-event')}
          className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-[10px] font-medium">Create</span>
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
