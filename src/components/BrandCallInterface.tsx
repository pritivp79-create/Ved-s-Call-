import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Grid,
  Pause,
  Play,
  CircleDot,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Radio,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  X,
  Plus
} from 'lucide-react';
import { CallTheme, CallerProfile, CallState } from '../types';
import { soundService } from '../services/soundService';

interface BrandCallInterfaceProps {
  theme: CallTheme;
  caller: CallerProfile;
  callState: CallState;
  customWallpaperUrl?: string;
  onAnswer: () => void;
  onDecline: () => void;
  onEndCall: () => void;
  edgeLightingEnabled: boolean;
}

export const BrandCallInterface: React.FC<BrandCallInterfaceProps> = ({
  theme,
  caller,
  callState,
  customWallpaperUrl,
  onAnswer,
  onDecline,
  onEndCall,
  edgeLightingEnabled,
}) => {
  // In-call states
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showInCallKeypad, setShowInCallKeypad] = useState(false);
  const [duration, setDuration] = useState(0);

  // Active call duration counter
  useEffect(() => {
    let timer: number | null = null;
    if (callState === 'active') {
      timer = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
      setIsMuted(false);
      setIsSpeaker(false);
      setIsOnHold(false);
      setIsRecording(false);
      setShowInCallKeypad(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleKeypadPress = (digit: string) => {
    soundService.playDtmf(digit);
  };

  // Background style
  const bgStyle = customWallpaperUrl
    ? { backgroundImage: `url(${customWallpaperUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;

  return (
    <div
      id="brand-call-interface"
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b ${theme.gradientBg} text-white`}
      style={bgStyle}
    >
      {/* Dark overlay for contrast if custom wallpaper is used */}
      {customWallpaperUrl && <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0" />}

      {/* Edge Lighting Glow (especially for Jolt & active setting) */}
      {(edgeLightingEnabled || theme.id === 'jolt') && callState === 'incoming' && (
        <motion.div
          id="edge-lighting-glow"
          animate={{
            boxShadow: [
              `inset 0 0 16px 4px ${theme.edgeGlowColor}`,
              `inset 0 0 32px 10px ${theme.edgeGlowColor}`,
              `inset 0 0 16px 4px ${theme.edgeGlowColor}`,
            ],
          }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none z-30"
        />
      )}

      {/* Brand Watermark / Tag */}
      <div className="relative z-10 pt-4 px-6 flex justify-between items-center text-xs opacity-75">
        <span className="flex items-center gap-1.5 font-medium tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>HD VoLTE • SIM 1</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase font-semibold tracking-wider">
          {theme.brand}
        </span>
      </div>

      {/* Middle Top: Caller Info Poster */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-2">
        {/* Avatar with Theme Specific Treatment */}
        <div className="relative mb-4">
          <motion.div
            animate={
              callState === 'incoming'
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(255,255,255,0.2)',
                      `0 0 0 16px ${theme.edgeGlowColor}`,
                      '0 0 0 0 rgba(255,255,255,0.2)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
            className={`relative w-28 h-28 rounded-full overflow-hidden border-2 ${
              theme.id === 'jolt'
                ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.7)]'
                : theme.id === 'samsung'
                ? 'border-white/30 rounded-3xl'
                : 'border-white/20'
            }`}
          >
            <img
              src={caller.avatarUrl}
              alt={caller.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {theme.id === 'jolt' && (
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/30 to-transparent pointer-events-none" />
            )}
          </motion.div>

          {/* Verification Badge */}
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Name & Contact Label */}
        <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm mb-1">
          {caller.name}
        </h2>
        <p className="text-sm font-medium text-white/80 mb-1">{caller.number}</p>
        <p className="text-xs text-white/60">
          {caller.label} {caller.location ? `• ${caller.location}` : ''}
        </p>

        {/* Dynamic Status / Call Timer */}
        <div className="mt-3">
          {callState === 'incoming' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-300 backdrop-blur-md animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              Incoming Call...
            </span>
          )}
          {callState === 'outgoing' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-amber-300 backdrop-blur-md animate-pulse">
              Calling...
            </span>
          )}
          {callState === 'active' && (
            <div className="flex flex-col items-center">
              <span className="text-base font-semibold font-mono tracking-wider text-emerald-400 bg-emerald-950/40 px-3 py-0.5 rounded-full border border-emerald-500/30">
                {formatTime(duration)}
              </span>
              {isOnHold && (
                <span className="text-[11px] text-amber-400 font-medium mt-1">Call On Hold</span>
              )}
              {isRecording && (
                <span className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Recording
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Jolt Audio Visualizer (Waveform Simulation) */}
      {theme.id === 'jolt' && callState === 'incoming' && (
        <div className="relative z-10 flex items-center justify-center gap-1 my-2">
          {[40, 75, 95, 60, 30, 85, 100, 45, 90, 65, 35].map((height, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${height * 0.25}px`, `${height * 0.55}px`, `${height * 0.25}px`] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.08 }}
              className="w-1.5 bg-gradient-to-t from-cyan-400 to-fuchsia-400 rounded-full shadow-[0_0_8px_#00f0ff]"
            />
          ))}
        </div>
      )}

      {/* In-Call Keypad Overlay */}
      <AnimatePresence>
        {showInCallKeypad && callState === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="relative z-20 mx-4 p-4 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">In-Call Keypad</span>
              <button
                onClick={() => setShowInCallKeypad(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleKeypadPress(d)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/15 active:scale-95 text-base font-medium transition-all text-white"
                >
                  {d}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Lower Controls: Depends on Call State */}
      <div className="relative z-10 pb-8 px-6">
        {/* ACTIVE CALL CONTROLS */}
        {callState === 'active' ? (
          <div className="flex flex-col gap-6">
            {/* 6 Grid action buttons (Mute, Keypad, Speaker, Add, Hold, Record) */}
            <div className="grid grid-cols-3 gap-y-4 gap-x-3 text-center">
              <button
                id="btn-mute"
                onClick={() => setIsMuted(!isMuted)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                  isMuted ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5 mb-1" /> : <Mic className="w-5 h-5 mb-1" />}
                <span className="text-[11px] font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
              </button>

              <button
                id="btn-keypad"
                onClick={() => setShowInCallKeypad(!showInCallKeypad)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                  showInCallKeypad ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <Grid className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">Keypad</span>
              </button>

              <button
                id="btn-speaker"
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                  isSpeaker ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                {isSpeaker ? <Volume2 className="w-5 h-5 mb-1 text-emerald-400" /> : <VolumeX className="w-5 h-5 mb-1" />}
                <span className="text-[11px] font-medium">{isSpeaker ? 'Speaker On' : 'Speaker'}</span>
              </button>

              <button
                id="btn-add-call"
                onClick={() => alert("Simulated: Add second call")}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition-all"
              >
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">Add Call</span>
              </button>

              <button
                id="btn-hold"
                onClick={() => setIsOnHold(!isOnHold)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                  isOnHold ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                {isOnHold ? <Play className="w-5 h-5 mb-1 text-amber-400" /> : <Pause className="w-5 h-5 mb-1" />}
                <span className="text-[11px] font-medium">{isOnHold ? 'Resume' : 'Hold'}</span>
              </button>

              <button
                id="btn-record"
                onClick={() => setIsRecording(!isRecording)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                  isRecording ? 'bg-rose-600/40 text-rose-300 border border-rose-500' : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
              >
                <CircleDot className={`w-5 h-5 mb-1 ${isRecording ? 'animate-pulse text-rose-400' : ''}`} />
                <span className="text-[11px] font-medium">{isRecording ? 'Recording' : 'Record'}</span>
              </button>
            </div>

            {/* Red End Call Button */}
            <div className="flex justify-center">
              <button
                id="btn-end-active-call"
                onClick={onEndCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 flex items-center justify-center shadow-lg shadow-rose-900/50 transition-transform"
                title="End Call"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
            </div>
          </div>
        ) : callState === 'outgoing' ? (
          /* OUTGOING CALL CONTROLS */
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isMuted ? 'bg-rose-500/30 text-rose-300' : 'bg-white/10 text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isSpeaker ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 text-white'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <button
              id="btn-cancel-outgoing-call"
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 flex items-center justify-center shadow-lg shadow-rose-900/50 transition-transform"
              title="Cancel Call"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          </div>
        ) : (
          /* INCOMING CALL CONTROLS: THEME SPECIFIC GESTURES */
          <div className="w-full">
            {/* Quick SMS / Reply Pill */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => alert("Quick reply message sent: 'Can't talk now. What's up?'")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-medium text-white/90 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white/80" />
                <span>Quick Message</span>
              </button>
            </div>

            {/* THEME 1: SAMSUNG ONE UI (Split horizontal swipe) */}
            {theme.id === 'samsung' && (
              <div className="flex items-center justify-between px-2">
                {/* Green Answer Swipe Right */}
                <div className="flex items-center gap-2">
                  <motion.button
                    id="btn-samsung-answer"
                    whileTap={{ scale: 0.92 }}
                    onClick={onAnswer}
                    className="relative w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/60 cursor-pointer"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-emerald-300 pointer-events-none"
                    />
                    <Phone className="w-7 h-7 text-white" />
                  </motion.button>
                  <div className="flex items-center text-emerald-400 text-xs font-medium animate-pulse">
                    <ArrowRight className="w-4 h-4" />
                    <ArrowRight className="w-4 h-4 -ml-2" />
                  </div>
                </div>

                <span className="text-[11px] text-white/50 font-medium">Swipe to answer</span>

                {/* Red Decline Swipe Left */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-rose-400 text-xs font-medium animate-pulse">
                    <ArrowLeft className="w-4 h-4 -mr-2" />
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  <motion.button
                    id="btn-samsung-decline"
                    whileTap={{ scale: 0.92 }}
                    onClick={onDecline}
                    className="relative w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/60 cursor-pointer"
                  >
                    <PhoneOff className="w-7 h-7 text-white" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* THEME 2: XIAOMI / M.I (Vertical swipe up to answer, down to decline) */}
            {theme.id === 'mi' && (
              <div className="flex flex-col items-center">
                {/* Arrow up animations */}
                <div className="flex flex-col items-center mb-3 text-orange-400 animate-bounce">
                  <ChevronUp className="w-5 h-5 -mb-2" />
                  <ChevronUp className="w-5 h-5" />
                  <span className="text-[11px] text-white/70 font-medium mt-1">Swipe up to answer</span>
                </div>

                <div className="flex items-center justify-center gap-12 w-full">
                  <motion.button
                    id="btn-mi-decline"
                    whileTap={{ scale: 0.92 }}
                    onClick={onDecline}
                    className="w-14 h-14 rounded-full bg-neutral-800/90 border border-white/15 flex items-center justify-center hover:bg-rose-700 transition-colors"
                  >
                    <PhoneOff className="w-6 h-6 text-rose-400 hover:text-white" />
                  </motion.button>

                  <motion.button
                    id="btn-mi-answer"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    onClick={onAnswer}
                    className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-950/60"
                  >
                    <Phone className="w-7 h-7 text-white" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* THEME 3: HUAWEI (Central circular gesture ring slider) */}
            {theme.id === 'huawei' && (
              <div className="relative flex flex-col items-center">
                <div className="w-full max-w-[280px] h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between px-3 relative overflow-hidden">
                  <button
                    id="btn-huawei-decline"
                    onClick={onDecline}
                    className="w-11 h-11 rounded-full bg-rose-600 flex items-center justify-center shadow-md active:scale-95"
                  >
                    <PhoneOff className="w-5 h-5 text-white" />
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-medium text-white/75">Slide to action</span>
                    <div className="flex gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>

                  <button
                    id="btn-huawei-answer"
                    onClick={onAnswer}
                    className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-md active:scale-95 animate-pulse"
                  >
                    <Phone className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* THEME 4: ONEPLUS (OxygenOS Minimalist Red & Emerald dual action) */}
            {theme.id === 'oneplus' && (
              <div className="flex items-center justify-around px-4">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    id="btn-oneplus-decline"
                    whileTap={{ scale: 0.92 }}
                    onClick={onDecline}
                    className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-950/70"
                  >
                    <PhoneOff className="w-7 h-7 text-white" />
                  </motion.button>
                  <span className="text-[11px] font-semibold text-white/60 tracking-wider uppercase">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    id="btn-oneplus-answer"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    whileTap={{ scale: 0.92 }}
                    onClick={onAnswer}
                    className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/70"
                  >
                    <Phone className="w-7 h-7 text-white" />
                  </motion.button>
                  <span className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">Answer</span>
                </div>
              </div>
            )}

            {/* THEME 5: OPPO (ColorOS Aquamorphic Capsule Slider) */}
            {theme.id === 'oppo' && (
              <div className="flex items-center justify-between px-3">
                <button
                  id="btn-oppo-decline"
                  onClick={onDecline}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-rose-600/80 hover:bg-rose-600 backdrop-blur-md border border-rose-500/40 text-xs font-semibold text-white active:scale-95 transition-all"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Decline</span>
                </button>

                <button
                  id="btn-oppo-answer"
                  onClick={onAnswer}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-white shadow-lg shadow-emerald-900/50 active:scale-95 transition-all animate-pulse"
                >
                  <Phone className="w-4 h-4" />
                  <span>Accept</span>
                </button>
              </div>
            )}

            {/* THEME 6: VIVO (OriginOS Liquid Wave Droplet) */}
            {theme.id === 'vivo' && (
              <div className="flex flex-col items-center">
                <div className="w-full flex items-center justify-around">
                  <motion.button
                    id="btn-vivo-decline"
                    whileTap={{ scale: 0.92 }}
                    onClick={onDecline}
                    className="w-14 h-14 rounded-3xl bg-neutral-800/80 border border-white/20 flex items-center justify-center"
                  >
                    <PhoneOff className="w-6 h-6 text-rose-400" />
                  </motion.button>

                  <motion.button
                    id="btn-vivo-answer"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    whileTap={{ scale: 0.92 }}
                    onClick={onAnswer}
                    className="w-16 h-16 rounded-3xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-900/50 border border-cyan-300"
                  >
                    <Phone className="w-7 h-7 text-white" />
                  </motion.button>
                </div>
                <span className="text-[11px] text-cyan-300/80 mt-2 font-medium">OriginOS Slide to Connect</span>
              </div>
            )}

            {/* THEME 7: REALME (Dare To Leap High-Contrast Amber Slider) */}
            {theme.id === 'realme' && (
              <div className="flex items-center justify-between px-2">
                <button
                  id="btn-realme-decline"
                  onClick={onDecline}
                  className="w-14 h-14 rounded-2xl bg-neutral-900 border-2 border-rose-500/60 flex items-center justify-center active:scale-95"
                >
                  <PhoneOff className="w-6 h-6 text-rose-500" />
                </button>

                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Dare to leap</span>
                  <div className="text-[11px] text-white/60">Tap to answer</div>
                </div>

                <motion.button
                  id="btn-realme-answer"
                  whileTap={{ scale: 0.95 }}
                  onClick={onAnswer}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-950/80 text-neutral-950 font-bold"
                >
                  <Phone className="w-7 h-7 text-neutral-950 fill-neutral-950" />
                </motion.button>
              </div>
            )}

            {/* THEME 8: SONY (Xperia Precision Cinema Track) */}
            {theme.id === 'sony' && (
              <div className="flex flex-col gap-2">
                <div className="w-full bg-neutral-900/90 border border-white/20 rounded-lg p-2 flex items-center justify-between">
                  <button
                    id="btn-sony-decline"
                    onClick={onDecline}
                    className="px-4 py-2 rounded bg-neutral-800 text-xs font-mono text-rose-400 hover:text-white flex items-center gap-1.5"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>DECLINE</span>
                  </button>
                  <div className="h-0.5 flex-1 mx-3 bg-white/20 relative">
                    <motion.div
                      animate={{ left: ['0%', '80%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-400"
                    />
                  </div>
                  <button
                    id="btn-sony-answer"
                    onClick={onAnswer}
                    className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-600 text-xs font-mono text-white flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>ANSWER</span>
                  </button>
                </div>
                <div className="text-center text-[10px] font-mono text-white/50 tracking-wider">
                  SONY XPERIA CINEMA DIALER
                </div>
              </div>
            )}

            {/* THEME 9: LENOVO (Dual Bubble Arc) */}
            {theme.id === 'lenovo' && (
              <div className="flex items-center justify-around px-4">
                <button
                  id="btn-lenovo-decline"
                  onClick={onDecline}
                  className="w-14 h-14 rounded-full bg-neutral-800/90 border border-white/20 flex items-center justify-center hover:bg-rose-700 text-white"
                >
                  <PhoneOff className="w-6 h-6 text-rose-400" />
                </button>

                <div className="text-center">
                  <span className="text-xs font-semibold text-blue-300">Lenovo ZUI</span>
                  <p className="text-[10px] text-white/60">Tap to engage</p>
                </div>

                <motion.button
                  id="btn-lenovo-answer"
                  whileTap={{ scale: 0.92 }}
                  onClick={onAnswer}
                  className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/60"
                >
                  <Phone className="w-7 h-7 text-white" />
                </motion.button>
              </div>
            )}

            {/* THEME 10: JOLT (Cyber Neon HUD with pulsating rings) */}
            {theme.id === 'jolt' && (
              <div className="flex items-center justify-between px-2">
                <motion.button
                  id="btn-jolt-decline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onDecline}
                  className="relative w-16 h-16 rounded-full bg-black border-2 border-fuchsia-500 flex items-center justify-center shadow-[0_0_18px_#d946ef]"
                >
                  <PhoneOff className="w-7 h-7 text-fuchsia-400" />
                </motion.button>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-black tracking-widest text-cyan-400 drop-shadow-[0_0_8px_#00f0ff]">
                    JOLT CYBER
                  </span>
                  <span className="text-[10px] text-fuchsia-300 animate-pulse">CONNECT NEURAL</span>
                </div>

                <motion.button
                  id="btn-jolt-answer"
                  animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 15px #00f0ff', '0 0 28px #00f0ff', '0 0 15px #00f0ff'] }}
                  transition={{ duration: 1.3, repeat: Infinity }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onAnswer}
                  className="relative w-16 h-16 rounded-full bg-black border-2 border-cyan-400 flex items-center justify-center cursor-pointer"
                >
                  <Phone className="w-7 h-7 text-cyan-400 fill-cyan-400" />
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
