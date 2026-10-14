import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { GatherlyLogo } from '../GatherlyLogo';
import {
  ArrowLeft,
  ChevronRight,
  Info,
  Bell,
  Lock,
  User,
  Shield,
  Smartphone,
  LogOut,
  Check,
  Menu,
} from 'lucide-react';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenMenu?: () => void;
  onShowToast: (message: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  onOpenMenu,
  onShowToast,
}) => {
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [nfcSync, setNfcSync] = useState(true);

  // Sub-panel modals
  const [expandedSection, setExpandedSection] = useState<'profile' | 'security' | null>(null);
  const [userName, setUserName] = useState('Alex Chen');
  const [userBio, setUserBio] = useState('Sophomore Computer Science student & GDSC web lead.');

  return (
    <div className="min-h-full flex flex-col bg-[#080d0e] text-[#dce4e4]">
      {/* Top Header matching Image 7 */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#1b2628] bg-[#091113]/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('organizer')}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Back to Organizer"
          >
            <ArrowLeft className="w-5 h-5 text-[#00f2ff]" />
          </button>
          <GatherlyLogo size="md" variant="cyan" />
        </div>
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-1.5 rounded-lg bg-[#121c1e] border border-[#213235] text-zinc-300 hover:text-white hover:border-[#00f2ff]/50 transition-colors cursor-pointer"
            title="Open Navigation Menu"
          >
            <Menu className="w-4 h-4 text-[#00f2ff]" />
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-5 py-5 space-y-6 pb-24">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight leading-snug">
            Settings
          </h1>
          <p className="text-xs text-[#8ca0a3] mt-1">
            Manage your Gatherly preferences and account details.
          </p>
        </div>

        {/* Section: Account Access */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#799092] font-semibold block px-1">
            ACCOUNT ACCESS
          </span>

          <div className="rounded-2xl bg-[#11191b] border border-[#1f2d30] divide-y divide-[#1b272a] overflow-hidden">
            {/* Profile Information */}
            <div
              onClick={() => setExpandedSection(expandedSection === 'profile' ? null : 'profile')}
              className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div>
                <h3 className="text-sm font-bold text-white">Profile Information</h3>
                <p className="text-xs text-[#8ca0a3] mt-0.5">
                  Update your name, bio, and avatar.
                </p>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-zinc-400 transition-transform ${
                  expandedSection === 'profile' ? 'rotate-90' : ''
                }`}
              />
            </div>

            {/* Expanded Profile Form */}
            {expandedSection === 'profile' && (
              <div className="p-4 bg-[#0a1112] space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#121c1e] border border-[#233538] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#121c1e] border border-[#233538] rounded-lg text-white resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExpandedSection(null);
                    onShowToast('Profile information saved!');
                  }}
                  className="py-1.5 px-3 rounded-lg bg-[#00f2ff] text-black text-xs font-bold cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            )}

            {/* Security Settings */}
            <div
              onClick={() => setExpandedSection(expandedSection === 'security' ? null : 'security')}
              className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Security Settings</h3>
                  <Info className="w-3.5 h-3.5 text-[#00f2ff]" />
                </div>
                <p className="text-xs text-[#8ca0a3] mt-0.5">
                  Password, 2FA, and connected accounts.
                </p>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-zinc-400 transition-transform ${
                  expandedSection === 'security' ? 'rotate-90' : ''
                }`}
              />
            </div>

            {/* Expanded Security Form */}
            {expandedSection === 'security' && (
              <div className="p-4 bg-[#0a1112] space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Two-Factor Authentication (2FA)</span>
                  <span className="text-emerald-400 font-mono font-semibold">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Student ID Pass Cryptography</span>
                  <span className="text-cyan-400 font-mono font-semibold">Active ECDSA</span>
                </div>
                <button
                  type="button"
                  onClick={() => onShowToast('Password reset link sent to registered email.')}
                  className="py-1.5 px-3 rounded-lg bg-[#182528] text-zinc-200 hover:text-white text-xs font-medium cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section: Notification Preferences */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#799092] font-semibold block px-1">
            NOTIFICATION PREFERENCES
          </span>

          <div className="rounded-2xl bg-[#11191b] border border-[#1f2d30] divide-y divide-[#1b272a] overflow-hidden">
            {/* Push Notifications */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Push Notifications</h3>
                <p className="text-xs text-[#8ca0a3] mt-0.5">
                  Receive alerts on your device for events.
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => {
                  setPushNotifs(!pushNotifs);
                  onShowToast(`Push notifications ${!pushNotifs ? 'enabled' : 'disabled'}.`);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  pushNotifs ? 'bg-[#00f2ff]' : 'bg-[#223336]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    pushNotifs ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Email Alerts */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Email Alerts</h3>
                <p className="text-xs text-[#8ca0a3] mt-0.5">
                  Weekly summaries and important updates.
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => {
                  setEmailAlerts(!emailAlerts);
                  onShowToast(`Email alerts ${!emailAlerts ? 'enabled' : 'disabled'}.`);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  emailAlerts ? 'bg-[#00f2ff]' : 'bg-[#223336]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    emailAlerts ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section: NFC & Pass Sync */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#799092] font-semibold block px-1">
            HARDWARE & PASS TELEMETRY
          </span>

          <div className="rounded-2xl bg-[#11191b] border border-[#1f2d30] p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Student NFC Auto-Sync</h3>
              <p className="text-xs text-[#8ca0a3] mt-0.5">
                Automatically authorises passes for physical turnstiles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setNfcSync(!nfcSync);
                onShowToast(`NFC auto-sync ${!nfcSync ? 'enabled' : 'disabled'}.`);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                nfcSync ? 'bg-[#ff7a00]' : 'bg-[#223336]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  nfcSync ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section: Export & Code Download */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#799092] font-semibold block px-1">
            DEVELOPER & SOURCE CODE
          </span>

          <div className="rounded-2xl bg-[#11191b] border border-[#1f2d30] p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Export Website Repository</h3>
              <p className="text-xs text-[#8ca0a3] mt-0.5">
                Download the complete React 19, TypeScript & Tailwind CSS source code bundle as a ZIP.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const { downloadProjectZip } = await import('../../utils/exportProject');
                  await downloadProjectZip();
                  onShowToast('Source code ZIP downloaded successfully!');
                } catch {
                  onShowToast('Could not initiate ZIP download.');
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#00f2ff] hover:bg-[#3bf5ff] text-black text-xs font-bold tracking-wide shadow-[0_0_16px_rgba(0,242,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Download Website Code (.zip)</span>
            </button>
          </div>
        </div>

        {/* Logout / Switch Account */}
        <div className="pt-2">
          <button
            onClick={() => {
              onShowToast('Logged out.');
              onNavigate('login');
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#181216] border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Gatherly</span>
          </button>
        </div>
      </div>
    </div>
  );
};
