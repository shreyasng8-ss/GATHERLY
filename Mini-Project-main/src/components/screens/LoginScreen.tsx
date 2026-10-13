import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { GatherlyLogo } from '../GatherlyLogo';
import { campusQuadImg } from '../../data/mockData';
import { GraduationCap, ShieldCheck, ArrowRight, Building2, Mail, Lock } from 'lucide-react';

interface LoginScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (message: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [accountType, setAccountType] = useState<'student' | 'organizer'>('student');
  const [email, setEmail] = useState('alex.chen@university.edu');
  const [password, setPassword] = useState('••••••••••••');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType === 'student') {
      onShowToast('Welcome back, Alex Chen! Entering Student Portal.');
      onNavigate('student');
    } else {
      onShowToast('Entering GDSC Organizer Dashboard.');
      onNavigate('organizer');
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#080f10] text-[#dce4e4]">
      {/* Campus Hero Banner with Gatherly watermark */}
      <div className="relative h-48 w-full overflow-hidden shrink-0">
        <img
          src={campusQuadImg}
          alt="University Campus Quad"
          className="w-full h-full object-cover brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080f10] via-black/40 to-transparent" />
        
        {/* Gatherly Watermark Logo at top */}
        <div className="absolute top-4 left-6 flex items-center gap-2">
          <GatherlyLogo size="md" variant="cyan" />
        </div>
      </div>

      {/* Main Content Card Container */}
      <div className="flex-1 px-6 pb-8 -mt-6 relative z-10">
        {/* Title & Subtitle */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-xs text-[#90a2a5] mt-1">
            Enter your details to access your dashboard.
          </p>
        </div>

        {/* Login / Sign Up Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#131d1f] rounded-xl border border-[#223336] mb-5">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-[#00f2ff] text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]'
                : 'text-[#849a9c] hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              onShowToast('Redirecting to Student Registration or Organization Setup.');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-[#00f2ff] text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]'
                : 'text-[#849a9c] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Select Account Type */}
        <div className="mb-5">
          <label className="block text-[11px] font-mono tracking-wider text-[#799092] uppercase mb-2">
            Select Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Student Card */}
            <button
              type="button"
              onClick={() => {
                setAccountType('student');
                setEmail('alex.chen@university.edu');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                accountType === 'student'
                  ? 'bg-[#0f1d20] border-[#00f2ff] shadow-[0_0_16px_rgba(0,242,255,0.25)] ring-1 ring-[#00f2ff]'
                  : 'bg-[#121b1d] border-[#223336] hover:border-[#384f53]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <GraduationCap
                  className={`w-5 h-5 ${
                    accountType === 'student' ? 'text-[#00f2ff]' : 'text-zinc-400'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Student</p>
                <p className="text-[10px] text-[#ff9e00] font-mono mt-0.5">Neon Portal</p>
              </div>
            </button>

            {/* Organizer Card */}
            <button
              type="button"
              onClick={() => {
                setAccountType('organizer');
                setEmail('gdsc.lead@university.edu');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                accountType === 'organizer'
                  ? 'bg-[#0f1d20] border-[#00f2ff] shadow-[0_0_16px_rgba(0,242,255,0.25)] ring-1 ring-[#00f2ff]'
                  : 'bg-[#121b1d] border-[#223336] hover:border-[#384f53]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <ShieldCheck
                  className={`w-5 h-5 ${
                    accountType === 'organizer' ? 'text-[#00f2ff]' : 'text-zinc-400'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Organizer</p>
                <p className="text-[10px] text-[#799092] font-mono mt-0.5">Clubs & Societies</p>
              </div>
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs text-[#8ca0a3] mb-1 font-medium">
              University Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-[#8ca0a3] font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={() => onShowToast('Password reset link sent to registered email.')}
                className="text-xs text-[#8ca0a3] hover:text-[#00f2ff] transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all"
              />
            </div>
          </div>

          {/* Sign In CTA Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#00f2ff] hover:bg-[#3bf5ff] text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,242,255,0.45)] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>
              {accountType === 'student' ? 'Sign In to Student Portal' : 'Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* New organizer register link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => onNavigate('org-setup')}
              className="text-xs text-[#00f2ff] hover:underline inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>New organizer? Register here</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#1e2d30]"></div>
            <span className="flex-shrink mx-3 text-[11px] text-[#6b8082]">
              or continue with
            </span>
            <div className="flex-grow border-t border-[#1e2d30]"></div>
          </div>

          {/* Social / SSO Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                onShowToast('Connected with Campus Single Sign-On.');
                onNavigate(accountType === 'student' ? 'student' : 'organizer');
              }}
              className="py-2.5 px-3 rounded-xl bg-[#121b1d] hover:bg-[#1a272a] border border-[#233538] text-xs font-semibold text-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Building2 className="w-3.5 h-3.5 text-[#00f2ff]" />
              <span>Campus SSO</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onShowToast('Authenticated with Google Workspace.');
                onNavigate(accountType === 'student' ? 'student' : 'organizer');
              }}
              className="py-2.5 px-3 rounded-xl bg-[#121b1d] hover:bg-[#1a272a] border border-[#233538] text-xs font-semibold text-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>Google</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
