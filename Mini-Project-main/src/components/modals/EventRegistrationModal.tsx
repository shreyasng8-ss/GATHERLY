import React, { useState, useEffect } from 'react';
import { EventItem, StudentProfile, EventRegistrationPayload, RegistrationRecord } from '../../types';
import {
  X,
  User,
  Mail,
  Phone,
  Hash,
  Building,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ticket,
  QrCode,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface EventRegistrationModalProps {
  event: EventItem | null;
  profile: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRegistration: (
    eventId: string,
    payload: EventRegistrationPayload
  ) => Promise<{ registration: RegistrationRecord; event: EventItem }>;
  onOpenTicket: (event: EventItem) => void;
}

export const EventRegistrationModal: React.FC<EventRegistrationModalProps> = ({
  event,
  profile,
  isOpen,
  onClose,
  onSubmitRegistration,
  onOpenTicket,
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('Senior (Year 4)');
  const [collegeName, setCollegeName] = useState('Campus Institute of Technology');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Form states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    registration: RegistrationRecord;
    event: EventItem;
  } | null>(null);

  // Initialize form with student profile when opened
  useEffect(() => {
    if (isOpen && event) {
      setFullName(profile.name || 'Alex Chen');
      setEmail('alex.chen@campus.edu');
      setPhone('+1 (555) 234-5678');
      setRollNumber(profile.studentId ? profile.studentId.replace(/^#/, '') : 'GTH-8821');
      setDepartment('Computer Science & Engineering');
      setYearOfStudy(profile.gradYear ? `Class of ${profile.gradYear}` : 'Senior (Year 4)');
      setCollegeName('Campus Institute of Technology');
      setAdditionalNotes('');
      setErrors({});
      setServerError(null);
      setSuccessData(null);
      setIsSubmitting(false);
    }
  }, [isOpen, event, profile]);

  // Support Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !event) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full Name is required (minimum 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. user@campus.edu)';
    }

    const phoneClean = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phoneClean.length < 7) {
      errs.phone = 'Please enter a valid phone number (at least 7 digits)';
    }

    if (!rollNumber.trim()) {
      errs.rollNumber = 'University Roll Number is required';
    }

    if (!department.trim()) {
      errs.department = 'Department / Branch is required';
    }

    if (!yearOfStudy.trim()) {
      errs.yearOfStudy = 'Year of study is required';
    }

    if (!collegeName.trim()) {
      errs.collegeName = 'College name is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const payload: EventRegistrationPayload = {
        studentName: fullName.trim(),
        studentEmail: email.trim(),
        studentPhone: phone.trim(),
        rollNumber: rollNumber.trim(),
        department: department.trim(),
        yearOfStudy: yearOfStudy.trim(),
        collegeName: collegeName.trim(),
        additionalNotes: additionalNotes.trim() || undefined,
        studentId: profile.studentId || rollNumber.trim(),
        seatPass: event.seatPass
      };

      const result = await onSubmitRegistration(event.id, payload);
      setSuccessData(result);
    } catch (err: any) {
      console.error('Registration failed:', err);
      const msg = err?.message || 'Registration failed. Please check your information and try again.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg my-auto bg-[#121622] border border-[#ff7a00]/40 rounded-3xl shadow-[0_0_50px_rgba(255,122,0,0.35)] overflow-hidden text-zinc-100 flex flex-col max-h-[95vh]">
        {/* Top Header */}
        <div className="sticky top-0 z-20 bg-[#1c1827] px-4 py-3 border-b border-[#ff7a00]/30 flex items-center justify-between gap-2 shadow-md">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff7a00]/15 hover:bg-[#ff7a00]/25 text-[#ffb68b] hover:text-white border border-[#ff7a00]/40 transition-all text-xs font-bold cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 text-[#ff7a00]" />
            <span>Cancel</span>
          </button>

          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#ff9e00]">
            Event Registration Form
          </span>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-700 p-5 sm:p-6">
          {successData ? (
            /* SUCCESS VIEW */
            <div className="py-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Registration Confirmed!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                  You have successfully registered for this event!
                </p>
              </div>

              {/* Event & Pass Summary Card */}
              <div className="p-4 rounded-2xl bg-[#181f2f] border border-[#ff7a00]/30 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Event Title</span>
                  <span className="text-xs font-bold text-white max-w-[220px] truncate text-right">
                    {event.title}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Attendee</span>
                  <span className="text-xs font-bold text-[#ffb68b]">
                    {successData.registration.studentName} ({successData.registration.rollNumber})
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Registration ID</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {successData.registration.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Digital Ticket Pass</span>
                  <span className="text-xs font-mono font-bold text-[#ff9e00] bg-[#ff7a00]/15 px-2 py-0.5 rounded border border-[#ff7a00]/30">
                    {successData.registration.ticketId}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-[#1e2436] hover:bg-[#28324a] text-zinc-200 hover:text-white font-semibold text-xs transition-colors cursor-pointer border border-white/10 active:scale-95"
                >
                  Return to Dashboard
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenTicket({
                      ...successData.event,
                      isRegistered: true,
                      registrationId: successData.registration.id,
                      ticketId: successData.registration.ticketId
                    });
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9e00] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_24px_rgba(255,122,0,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View Digital Gate Pass</span>
                </button>
              </div>
            </div>
          ) : (
            /* FORM VIEW */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Recap Strip */}
              <div className="p-3.5 rounded-2xl bg-[#181f2f] border border-white/5 flex items-center gap-3">
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80'}
                  alt={event.title}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#ff7a00]/40 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-[#ff9e00] uppercase font-bold tracking-wider block">
                    {event.category || 'Workshop'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{event.title}</h4>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {event.date} • {event.venue}
                  </p>
                </div>
              </div>

              {/* Server-Side Error Banner */}
              {serverError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Registration Unsuccessful</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-red-300">{serverError}</p>
                  </div>
                </div>
              )}

              {/* Field: Full Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                  <span>Full Name <span className="text-[#ff7a00]">*</span></span>
                  <span className="text-[10px] text-zinc-500 font-mono">Official student name</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="e.g. Alex Chen"
                    className={`w-full pl-9 pr-3 py-2 bg-[#141824] border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-all ${
                      errors.fullName
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-white/10 focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Two-Column Grid: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Field: Email */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Email Address <span className="text-[#ff7a00]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="alex.chen@campus.edu"
                      className={`w-full pl-9 pr-3 py-2 bg-[#141824] border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-all ${
                        errors.email
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-white/10 focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Field: Phone */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Phone Number <span className="text-[#ff7a00]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="+1 (555) 234-5678"
                      className={`w-full pl-9 pr-3 py-2 bg-[#141824] border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-all ${
                        errors.phone
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-white/10 focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Two-Column Grid: Roll Number & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Field: Roll Number */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                    <span>Roll Number <span className="text-[#ff7a00]">*</span></span>
                    <span className="text-[10px] text-zinc-500 font-mono">Unique ID</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => {
                        setRollNumber(e.target.value);
                        if (errors.rollNumber) setErrors((prev) => ({ ...prev, rollNumber: '' }));
                      }}
                      placeholder="GTH-8821"
                      className={`w-full pl-9 pr-3 py-2 bg-[#141824] border rounded-xl text-xs text-white placeholder-zinc-500 font-mono focus:outline-none transition-all ${
                        errors.rollNumber
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-white/10 focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]'
                      }`}
                    />
                  </div>
                  {errors.rollNumber && (
                    <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.rollNumber}</span>
                    </p>
                  )}
                </div>

                {/* Field: Year of Study */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Year of Study <span className="text-[#ff7a00]">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <select
                      value={yearOfStudy}
                      onChange={(e) => {
                        setYearOfStudy(e.target.value);
                        if (errors.yearOfStudy) setErrors((prev) => ({ ...prev, yearOfStudy: '' }));
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-[#141824] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]"
                    >
                      <option value="Freshman (Year 1)">Freshman (Year 1)</option>
                      <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
                      <option value="Junior (Year 3)">Junior (Year 3)</option>
                      <option value="Senior (Year 4)">Senior (Year 4)</option>
                      <option value="Graduate / Master">Graduate / Master</option>
                      <option value="PhD Candidate">PhD Candidate</option>
                    </select>
                  </div>
                  {errors.yearOfStudy && (
                    <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.yearOfStudy}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Field: Department / Branch */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Department / Branch <span className="text-[#ff7a00]">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (errors.department) setErrors((prev) => ({ ...prev, department: '' }));
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-[#141824] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Design & Media Arts">Design & Media Arts</option>
                    <option value="Business Administration & Management">Business Administration & Management</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Biotechnology">Biotechnology</option>
                  </select>
                </div>
                {errors.department && (
                  <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.department}</span>
                  </p>
                )}
              </div>

              {/* Field: College Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                  <span>College Name <span className="text-[#ff7a00]">*</span></span>
                  <span className="text-[10px] text-zinc-500 font-mono">Prefilled</span>
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => {
                    setCollegeName(e.target.value);
                    if (errors.collegeName) setErrors((prev) => ({ ...prev, collegeName: '' }));
                  }}
                  className="w-full px-3 py-2 bg-[#141824] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00]"
                />
                {errors.collegeName && (
                  <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.collegeName}</span>
                  </p>
                )}
              </div>

              {/* Field: Additional Questions / Notes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                  <span>Additional Questions or Notes <span className="text-zinc-500 font-normal">(Optional)</span></span>
                  <span className="text-[10px] text-zinc-500 font-mono">Dietary, queries, etc.</span>
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Interested in Solidity smart contracts demo or hardware lab access..."
                  className="w-full px-3 py-2 bg-[#141824] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-xl bg-[#1e2436] hover:bg-[#28324a] text-zinc-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer border border-white/10 active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff7a00] to-[#ff9e00] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(255,122,0,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>Submit Registration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
