import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { EventItem, CheckInResponse } from '../../types';
import { api } from '../../services/api';
import {
  X,
  Camera,
  QrCode,
  Keyboard,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Volume2,
  SwitchCamera,
  Layers,
  Sparkles,
  ExternalLink,
  Loader2,
  UserCheck
} from 'lucide-react';

interface OrganizerScannerModalProps {
  events: EventItem[];
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
  initialEventId?: string;
  onCheckInSuccess?: () => void;
}

type ScannerTab = 'choice' | 'camera' | 'external' | 'manual';

export const OrganizerScannerModal: React.FC<OrganizerScannerModalProps> = ({
  events,
  isOpen,
  onClose,
  onShowToast,
  initialEventId,
  onCheckInSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<ScannerTab>('choice');
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || events[0]?.id || '');
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<CheckInResponse | null>(null);

  // Camera states
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCamera, setHasCamera] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Keep selected event synced
  useEffect(() => {
    if (initialEventId) {
      setSelectedEventId(initialEventId);
    } else if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId, initialEventId]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Clean up camera stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleClose = () => {
    stopCamera();
    setActiveTab('choice');
    setResult(null);
    setCameraError(null);
    setManualCode('');
    onClose();
  };

  // Start video stream for Camera Scanning
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera API is not supported in this browser environment. Please use Manual Entry.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanVideoFrame();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser or use Manual Entry.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setHasCamera(false);
        setCameraError('No video camera detected on this device. You can use manual entry or external scanner.');
      } else {
        setCameraError(`Camera initialization note: ${err.message || 'Unable to open camera.'}. Please use manual entry.`);
      }
    }
  };

  // Continuous frame analysis with jsQR
  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data && code.data.trim().length > 0) {
        // Scanned QR code detected!
        handleTicketIdentified(code.data.trim());
        return; // stop scanning while processing result
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  // Start camera when entering 'camera' tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !result) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode, result]);

  // Execute check-in on backend
  const handleTicketIdentified = async (code: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    stopCamera();

    try {
      const response = await api.checkInTicket(code, {
        eventId: selectedEventId || undefined,
        role: 'organizer',
        organizerName: 'Gate Check-In Lead',
      });

      setResult(response);

      if (response.status === 'checked_in') {
        onShowToast(`Check-In Approved: ${response.studentName}`);
        onCheckInSuccess?.();
      } else if (response.status === 'already_checked_in') {
        onShowToast(`Warning: Already checked in!`);
      } else if (response.status === 'wrong_event') {
        onShowToast(`Warning: Wrong event ticket!`);
      } else {
        onShowToast(`Invalid ticket: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Check-in error:', err);
      setResult({
        success: false,
        status: 'invalid_ticket',
        message: err?.message || 'Check-in request failed. Ticket not found.',
        error: 'Invalid Ticket',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleTicketIdentified(manualCode.trim());
  };

  const handleResetForNext = () => {
    setResult(null);
    setManualCode('');
    if (activeTab === 'camera') {
      startCamera(facingMode);
    }
  };

  if (!isOpen) return null;

  const currentSelectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg my-auto bg-[#0d1316] border border-[#00f2ff]/40 rounded-3xl shadow-[0_0_50px_rgba(0,242,255,0.25)] overflow-hidden text-zinc-100 flex flex-col max-h-[95vh]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#091113] px-4 py-3 border-b border-[#00f2ff]/30 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            {activeTab !== 'choice' && !result ? (
              <button
                onClick={() => {
                  stopCamera();
                  setActiveTab('choice');
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Back to Choice Screen"
              >
                <ArrowLeft className="w-4 h-4 text-[#00f2ff]" />
              </button>
            ) : null}
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#00f2ff]" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Organizer Attendance & Gate Check-In
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event Selector Strip */}
        <div className="bg-[#121c1e] px-4 py-2.5 border-b border-white/5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] shrink-0">
            <Layers className="w-3.5 h-3.5 text-[#00f2ff]" />
            <span>Target Event:</span>
          </div>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={isProcessing || Boolean(result)}
            className="bg-[#091113] border border-[#00f2ff]/30 rounded-lg px-2.5 py-1 text-xs text-[#00f2ff] font-medium focus:outline-none focus:ring-1 focus:ring-[#00f2ff] max-w-[280px] truncate"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.registeredCount}/{evt.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-700 p-5 sm:p-6 space-y-5">
          {/* ------------------------------------------------------------- */}
          {/* VERIFICATION RESULT SCREEN                                    */}
          {/* ------------------------------------------------------------- */}
          {result ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* STATUS 1: VALID & CHECKED IN */}
              {result.status === 'checked_in' && (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      GATE ADMISSION APPROVED
                    </span>
                    <h4 className="text-xl font-extrabold text-white mt-1">
                      {result.studentName}
                    </h4>
                    <p className="text-xs text-zinc-300 font-mono mt-0.5">
                      Roll No: <strong className="text-white">{result.rollNumber || result.studentId}</strong>
                    </p>
                  </div>

                  <div className="bg-[#091113] p-3 rounded-xl border border-emerald-500/30 text-left text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Department:</span>
                      <span className="text-zinc-200">{result.department || 'Engineering'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Seat Pass:</span>
                      <span className="text-[#ff9e00] font-bold">{result.seatPass || 'General Pass'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ticket ID:</span>
                      <span className="text-cyan-300 font-bold">{result.ticketId}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1.5 text-emerald-400">
                      <span>Checked-In At:</span>
                      <span>{new Date(result.checkedInAt || Date.now()).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS 2: ALREADY CHECKED IN (DUPLICATE ATTEMPT) */}
              {result.status === 'already_checked_in' && (
                <div className="p-5 rounded-2xl bg-amber-950/40 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                    <AlertTriangle className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                      DUPLICATE ENTRY PREVENTED
                    </span>
                    <h4 className="text-xl font-extrabold text-white mt-1">
                      {result.studentName}
                    </h4>
                    <p className="text-xs text-amber-200 mt-1 font-medium">
                      This ticket was ALREADY checked in!
                    </p>
                  </div>

                  <div className="bg-[#091113] p-3 rounded-xl border border-amber-500/30 text-left text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Roll No:</span>
                      <span className="text-zinc-200">{result.rollNumber || result.studentId}</span>
                    </div>
                    <div className="flex justify-between text-amber-400 font-bold">
                      <span>Initial Check-In:</span>
                      <span>
                        {result.originalCheckedInAt
                          ? new Date(result.originalCheckedInAt).toLocaleTimeString()
                          : 'Earlier Session'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ticket ID:</span>
                      <span className="text-zinc-300">{result.ticketId}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS 3: WRONG EVENT */}
              {result.status === 'wrong_event' && (
                <div className="p-5 rounded-2xl bg-orange-950/40 border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center mx-auto text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                    <AlertTriangle className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold block">
                      INCORRECT EVENT TICKET
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">
                      {result.studentName} ({result.rollNumber})
                    </h4>
                    <p className="text-xs text-orange-200 mt-1 leading-relaxed">
                      {result.message}
                    </p>
                  </div>

                  <div className="bg-[#091113] p-3 rounded-xl border border-orange-500/30 text-left text-xs space-y-1.5 font-mono">
                    <div className="text-zinc-400">
                      Ticket is valid for:{' '}
                      <strong className="text-emerald-400 block mt-0.5">
                        {result.actualEvent?.title || 'Another Event'}
                      </strong>
                    </div>
                    <div className="text-zinc-400 border-t border-white/5 pt-1.5">
                      Current door station:{' '}
                      <strong className="text-orange-400 block mt-0.5">
                        {result.expectedEvent?.title || currentSelectedEvent?.title}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS 4: INVALID TICKET */}
              {(result.status === 'invalid_ticket' || result.status === 'unauthorized') && (
                <div className="p-5 rounded-2xl bg-red-950/40 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center mx-auto text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                    <XCircle className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                      CHECK-IN REJECTED
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">
                      {result.error || 'Invalid Ticket'}
                    </h4>
                    <p className="text-xs text-red-200 mt-1 leading-relaxed">
                      {result.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Fast Action: Scan Next Attendee */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleResetForNext}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#00bfff] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Scan Next Attendee</span>
                </button>

                <button
                  onClick={() => {
                    setResult(null);
                    setActiveTab('choice');
                  }}
                  className="py-3 px-4 rounded-xl bg-[#182326] hover:bg-[#203034] text-zinc-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer border border-white/10"
                >
                  Menu
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ------------------------------------------------------------- */}
              {/* TAB 1: CHOICE SCREEN (Requirement 5)                          */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'choice' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-base font-bold text-white">Choose Verification Method</h4>
                    <p className="text-xs text-zinc-400">
                      Select how you would like to scan or verify attendee tickets at the gate.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1">
                    {/* Option A: Camera Scanner */}
                    <button
                      onClick={() => setActiveTab('camera')}
                      className="p-4 rounded-2xl bg-[#141f22] hover:bg-[#1a292d] border border-[#00f2ff]/30 hover:border-[#00f2ff] text-left transition-all cursor-pointer group shadow-sm flex items-start gap-4 active:scale-98"
                    >
                      <div className="p-3 rounded-xl bg-[#00f2ff]/15 text-[#00f2ff] group-hover:scale-110 transition-transform shrink-0">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">Scan with Camera</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30">
                            OPTION A
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          Scan tickets directly using your device camera with live viewfinder and instant gate check-in.
                        </p>
                      </div>
                    </button>

                    {/* Option B: External Scanner */}
                    <button
                      onClick={() => setActiveTab('external')}
                      className="p-4 rounded-2xl bg-[#141f22] hover:bg-[#1a292d] border border-white/10 hover:border-[#ff7a00]/40 text-left transition-all cursor-pointer group shadow-sm flex items-start gap-4 active:scale-98"
                    >
                      <div className="p-3 rounded-xl bg-[#ff7a00]/15 text-[#ff7a00] group-hover:scale-110 transition-transform shrink-0">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">Use External Scanner</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff7a00]/10 text-[#ffb68b] border border-[#ff7a00]/30">
                            OPTION B
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          Scan tickets using standard phone cameras, Google Lens, or 3rd-party QR scanner apps.
                        </p>
                      </div>
                    </button>

                    {/* Manual Fallback */}
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="p-4 rounded-2xl bg-[#141f22] hover:bg-[#1a292d] border border-white/10 hover:border-purple-400/40 text-left transition-all cursor-pointer group shadow-sm flex items-start gap-4 active:scale-98"
                    >
                      <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                        <Keyboard className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">Enter Ticket ID Manually</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                            FALLBACK
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          Type or paste the attendee registration ID or pass code when barcode scanning is unavailable.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: OPTION A — CAMERA SCANNER VIEW                         */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  {/* Camera Viewfinder */}
                  <div className="relative w-full aspect-video sm:aspect-square max-h-[340px] rounded-2xl overflow-hidden bg-black border-2 border-[#00f2ff]/40 flex items-center justify-center shadow-inner">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Optical Aim Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-56 h-56 border-2 border-[#00f2ff] rounded-2xl relative shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-white rounded-tl" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-white rounded-tr" />
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-white rounded-bl" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-white rounded-br" />

                        {/* Laser Scan line animation */}
                        <div className="absolute inset-x-2 top-2 h-0.5 bg-[#00f2ff] shadow-[0_0_12px_#00f2ff] animate-pulse" />
                      </div>
                    </div>

                    {/* Top Floating Controls */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/70 text-[#00f2ff] border border-[#00f2ff]/30 backdrop-blur-md flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00f2ff] animate-ping" />
                        LIVE SCANNER
                      </span>

                      <button
                        onClick={() => {
                          const nextMode = facingMode === 'environment' ? 'user' : 'environment';
                          setFacingMode(nextMode);
                          startCamera(nextMode);
                        }}
                        className="p-2 rounded-xl bg-black/70 text-zinc-300 hover:text-white border border-white/20 backdrop-blur-md cursor-pointer transition-colors"
                        title="Flip Camera (Front/Rear)"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Loading Overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 text-[#00f2ff] animate-spin" />
                        <p className="text-xs font-mono font-bold text-white">Verifying Gate Pass...</p>
                      </div>
                    )}
                  </div>

                  {/* Camera Error Banner */}
                  {cameraError && (
                    <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Camera Unavailable</p>
                        <p className="mt-0.5 text-[11px] text-red-300 leading-relaxed">{cameraError}</p>
                        <button
                          onClick={() => setActiveTab('manual')}
                          className="mt-2 text-[11px] font-bold text-white underline cursor-pointer"
                        >
                          Switch to Manual Entry →
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-400 text-center font-mono">
                    Point camera at attendee ticket QR code • Auto-detects on alignment
                  </p>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 3: OPTION B — EXTERNAL SCANNER INSTRUCTIONS               */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'external' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#141f22] border border-[#ff7a00]/30 space-y-3">
                    <div className="flex items-center gap-2 text-[#ff9e00]">
                      <QrCode className="w-5 h-5" />
                      <h4 className="font-bold text-sm text-white">External QR Scanner Mode</h4>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Students can display their ticket on their phone screen or as a downloaded pass. Any external QR app or smartphone camera can scan it.
                    </p>

                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex items-start gap-2 text-zinc-300">
                        <span className="text-[#ff7a00] font-bold">1.</span>
                        <span>Open your smartphone's built-in <strong>Camera</strong>, <strong>Google Lens</strong>, or any QR scanner app.</span>
                      </div>
                      <div className="flex items-start gap-2 text-zinc-300">
                        <span className="text-[#ff7a00] font-bold">2.</span>
                        <span>Scan the student's ticket QR code. It will open the official Gatherly gate verification URL.</span>
                      </div>
                      <div className="flex items-start gap-2 text-zinc-300">
                        <span className="text-[#ff7a00] font-bold">3.</span>
                        <span>The verification page connects to the backend to confirm authenticity and allow one-tap check-in.</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulate / Quick Check for External Scanners */}
                  <div className="p-4 rounded-2xl bg-[#091113] border border-white/10 space-y-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                      Test External URL or Paste Code:
                    </span>
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Paste verification URL or ticket ID..."
                        className="flex-1 px-3 py-2 bg-[#121c1e] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#00f2ff]"
                      />
                      <button
                        type="submit"
                        disabled={isProcessing || !manualCode.trim()}
                        className="px-4 py-2 bg-[#00f2ff] hover:bg-[#00dbe7] text-black font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        Verify
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 4: MANUAL VERIFICATION FALLBACK (Requirement 3)          */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'manual' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#141f22] border border-purple-500/30 space-y-2">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Keyboard className="w-4 h-4 text-purple-400" />
                      <span>Manual Identifier Entry</span>
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Enter the student's <strong>Ticket ID</strong> (e.g. <code className="text-cyan-300">TKT-EVT1-...</code>) or <strong>Registration ID</strong> (e.g. <code className="text-cyan-300">reg-...</code>) to authorize entry directly through the backend.
                    </p>
                  </div>

                  <form onSubmit={handleManualSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Ticket ID or Registration ID
                      </label>
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="e.g. TKT-EVT1-ALEXCHEN or reg-seed-1"
                        autoFocus
                        className="w-full px-3 py-2.5 bg-[#121c1e] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing || !manualCode.trim()}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#00bfff] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_16px_rgba(0,242,255,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Checking Records...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Authorize Gate Check-In</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
