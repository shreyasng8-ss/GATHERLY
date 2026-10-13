import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { GatherlyLogo } from '../GatherlyLogo';
import { X, ArrowRight, User, Check, Building2, UploadCloud, ShieldCheck } from 'lucide-react';

interface OrgSetupScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (message: string) => void;
}

export const OrgSetupScreen: React.FC<OrgSetupScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orgName, setOrgName] = useState('Computer Science Society');
  const [category, setCategory] = useState<'Technical' | 'Cultural' | 'Sports' | 'Academic'>('Technical');
  const [facultyName, setFacultyName] = useState('Dr. Jane Smith');
  const [about, setAbout] = useState('');
  
  // Step 2 & 3 state
  const [website, setWebsite] = useState('https://cssociety.campus.edu');
  const [presidentId, setPresidentId] = useState('#GTH-8821');

  const categories: ('Technical' | 'Cultural' | 'Sports' | 'Academic')[] = [
    'Technical',
    'Cultural',
    'Sports',
    'Academic',
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!orgName.trim()) {
        onShowToast('Please enter an organization name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      onShowToast(`Organization "${orgName}" registered successfully! Review pending.`);
      onNavigate('organizer');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as any);
    } else {
      onNavigate('login');
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#080f10] text-[#dce4e4]">
      {/* Top Header matching Image 1 */}
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-[#1b2628] bg-[#091113]/90 sticky top-0 z-20 backdrop-blur-md">
        <GatherlyLogo size="md" variant="cyan" />
        <button
          onClick={() => onNavigate('login')}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-5 py-5 space-y-6 pb-24">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-[#00f2ff] tracking-tight leading-snug">
            Organization Setup
          </h1>
          <p className="text-xs text-[#8ca0a3] mt-1">
            Register your club, society, or department to start managing events.
          </p>
        </div>

        {/* Stepper matching Image 1 */}
        <div className="py-2">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 1
                    ? 'bg-[#00f2ff] text-black shadow-[0_0_12px_rgba(0,242,255,0.6)]'
                    : 'bg-[#1b2527] text-zinc-500'
                }`}
              >
                1
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium ${
                  step === 1 ? 'text-[#00f2ff]' : 'text-zinc-500'
                }`}
              >
                Details
              </span>
            </div>

            {/* Line 1-2 */}
            <div className="flex-1 h-0.5 mx-2 bg-[#1b2527] relative -top-3">
              <div
                className={`h-full bg-[#00f2ff] transition-all duration-300 ${
                  step > 1 ? 'w-full' : 'w-1/2'
                }`}
              />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= 2
                    ? 'bg-[#00f2ff] text-black shadow-[0_0_12px_rgba(0,242,255,0.6)]'
                    : 'bg-[#1b2527] text-zinc-500'
                }`}
              >
                2
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium ${
                  step === 2 ? 'text-[#00f2ff]' : 'text-zinc-500'
                }`}
              >
                Identity
              </span>
            </div>

            {/* Line 2-3 */}
            <div className="flex-1 h-0.5 mx-2 bg-[#1b2527] relative -top-3">
              <div
                className={`h-full bg-[#00f2ff] transition-all duration-300 ${
                  step >= 3 ? 'w-full' : 'w-0'
                }`}
              />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 3
                    ? 'bg-[#00f2ff] text-black shadow-[0_0_12px_rgba(0,242,255,0.6)]'
                    : 'bg-[#1b2527] text-zinc-500'
                }`}
              >
                3
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium ${
                  step === 3 ? 'text-[#00f2ff]' : 'text-zinc-500'
                }`}
              >
                Verification
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Organization Name */}
            <div>
              <label className="block text-xs font-medium text-[#8ca0a3] mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Computer Science Society"
                className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#8ca0a3] mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {categories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00f2ff] text-black shadow-[0_0_14px_rgba(0,242,255,0.4)]'
                          : 'bg-[#121b1d] text-zinc-300 border border-[#223336] hover:border-[#384f53]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faculty Coordinator Name */}
            <div>
              <label className="block text-xs font-medium text-[#8ca0a3] mb-1.5">
                Faculty Coordinator Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all"
                />
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* About the Organization */}
            <div>
              <label className="block text-xs font-medium text-[#8ca0a3] mb-1.5">
                About the Organization
              </label>
              <textarea
                rows={3}
                maxLength={250}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Briefly describe the purpose and goals of your organization..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all resize-none"
              />
              <div className="text-right text-[10px] font-mono text-zinc-500 mt-1">
                {about.length} / 250 characters
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Identity */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-medium text-[#8ca0a3] mb-1.5">
                Society Emblem / Logo
              </label>
              <div className="p-6 rounded-2xl border-2 border-dashed border-[#223336] bg-[#121b1d] text-center flex flex-col items-center justify-center cursor-pointer hover:border-[#00f2ff]">
                <UploadCloud className="w-8 h-8 text-[#00f2ff] mb-2" />
                <p className="text-xs text-white font-medium">Click to upload chapter logo</p>
                <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG, or SVG up to 5MB</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8ca0a3] mb-1.5">
                Official Website or Linktree
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white focus:outline-none focus:border-[#00f2ff]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Verification */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-xl bg-[#0e1819] border border-[#00f2ff]/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#00f2ff] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Campus Verification Review</span>
              </div>
              <p className="text-zinc-300">
                Official registrations require approval by student government and faculty advisor confirmation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8ca0a3] mb-1.5">
                Club President Student ID
              </label>
              <input
                type="text"
                value={presidentId}
                onChange={(e) => setPresidentId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#121c1e] border border-[#223438] rounded-xl text-white font-mono"
              />
            </div>
          </div>
        )}

        {/* Bottom Actions matching Image 1 */}
        <div className="pt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3 px-4 rounded-xl bg-[#121b1d] hover:bg-[#1a2729] text-zinc-300 text-xs font-semibold border border-[#223336] transition-colors cursor-pointer"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex-2 py-3 px-4 rounded-xl bg-[#00f2ff] hover:bg-[#3bf5ff] text-black text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(0,242,255,0.45)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{step === 1 ? 'Continue to Identity' : step === 2 ? 'Continue to Verification' : 'Submit Organization'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
