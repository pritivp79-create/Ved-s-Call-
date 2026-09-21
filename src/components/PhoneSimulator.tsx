import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Zap, Sun } from 'lucide-react';
import { CallTheme, CallerProfile, CallState } from '../types';
import { BrandCallInterface } from './BrandCallInterface';

interface PhoneSimulatorProps {
  theme: CallTheme;
  caller: CallerProfile;
  callState: CallState;
  customWallpaperUrl?: string;
  onAnswer: () => void;
  onDecline: () => void;
  onEndCall: () => void;
  edgeLightingEnabled: boolean;
  flashOnCallEnabled: boolean;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  theme,
  caller,
  callState,
  customWallpaperUrl,
  onAnswer,
  onDecline,
  onEndCall,
  edgeLightingEnabled,
  flashOnCallEnabled,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [flashStrobe, setFlashStrobe] = useState(false);

  // Time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Flash on call strobe simulation
  useEffect(() => {
    let interval: number | null = null;
    if (flashOnCallEnabled && callState === 'incoming') {
      interval = window.setInterval(() => {
        setFlashStrobe((prev) => !prev);
      }, 300);
    } else {
      setFlashStrobe(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [flashOnCallEnabled, callState]);

  return (
    <div className="relative flex items-center justify-center p-2 sm:p-4">
      {/* Background simulated flashlight glow behind device if flash enabled */}
      {flashStrobe && (
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/40 blur-2xl pointer-events-none animate-ping z-0" />
      )}

      {/* Physical Phone Outer Shell Frame */}
      <div
        id="phone-device-frame"
        className="relative w-[340px] sm:w-[380px] h-[680px] sm:h-[740px] bg-neutral-950 rounded-[46px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] border-[4px] border-neutral-800 transition-all"
        style={{
          boxShadow: edgeLightingEnabled && callState === 'incoming'
            ? `0 0 45px 5px ${theme.edgeGlowColor}, 0 25px 60px -15px rgba(0,0,0,0.8)`
            : undefined,
        }}
      >
        {/* Physical hardware buttons on side */}
        <div className="absolute -left-[7px] top-28 w-[3px] h-10 bg-neutral-700 rounded-l-md" title="Volume Up" />
        <div className="absolute -left-[7px] top-42 w-[3px] h-10 bg-neutral-700 rounded-l-md" title="Volume Down" />
        <div className="absolute -right-[7px] top-32 w-[3px] h-14 bg-neutral-700 rounded-r-md" title="Power" />

        {/* Top Speaker Ear-piece */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-neutral-800 rounded-full z-40" />

        {/* Screen Glass Area */}
        <div className="relative w-full h-full rounded-[36px] overflow-hidden flex flex-col bg-black">
          {/* Status Bar */}
          <div
            id="phone-status-bar"
            className="relative z-30 h-8 px-6 pt-1.5 flex items-center justify-between text-[11px] font-medium text-white/90 select-none bg-gradient-to-b from-black/40 to-transparent"
          >
            {/* Clock */}
            <span className="tracking-tight font-semibold">{currentTime || '09:41'}</span>

            {/* Front Camera Punch-hole */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full ring-2 ring-neutral-900 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
            </div>

            {/* Network & Battery Status */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-tight">5G</span>
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-0.5">
                {theme.statusBarStyle === 'oneui' && <span className="text-[10px] font-semibold">92%</span>}
                <div className="relative flex items-center">
                  <Battery className="w-4 h-4" />
                  <div className="absolute left-[2px] top-[4px] bottom-[4px] w-2 bg-emerald-400 rounded-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Core Call Screen Interface */}
          <div className="flex-1 w-full h-[calc(100%-2rem)]">
            <BrandCallInterface
              theme={theme}
              caller={caller}
              callState={callState}
              customWallpaperUrl={customWallpaperUrl}
              onAnswer={onAnswer}
              onDecline={onDecline}
              onEndCall={onEndCall}
              edgeLightingEnabled={edgeLightingEnabled}
            />
          </div>

          {/* Bottom Gestural Navigation Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-40 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
