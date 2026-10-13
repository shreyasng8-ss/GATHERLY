import React, { useState } from 'react';
import { TeamMember } from '../../types';
import { X, Plus, Check } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  onAddTask: (title: string, assignee: string, assigneeAvatar?: string) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(teamMembers[0]?.name || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const member = teamMembers.find((m) => m.name === selectedAssignee);
    onAddTask(title.trim(), selectedAssignee, member?.avatar);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#121c1e] border border-[#00f2ff]/30 rounded-2xl p-5 text-zinc-100 shadow-[0_0_35px_rgba(0,242,255,0.25)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#233538]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#00f2ff]" />
            <span>Create Event Task</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#849a9c] mb-1.5 uppercase">
              Task Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Confirm AV technician & mics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#0a1213] border border-[#233538] rounded-xl text-white focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#849a9c] mb-1.5 uppercase">
              Assign To
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#0a1213] border border-[#233538] rounded-xl text-white focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all cursor-pointer"
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.name} className="bg-[#121c1e] text-white">
                  {member.name} — {member.badgeText}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 text-xs font-medium rounded-xl bg-[#1b2628] hover:bg-[#253538] text-zinc-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-[#00f2ff] hover:bg-[#38f6ff] text-black shadow-[0_0_14px_rgba(0,242,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
