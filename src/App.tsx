import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneCall,
  Sparkles,
  Sliders,
  Grid,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { ThemeId, CallTheme, CallerProfile, CallState, RecentCallLog } from './types';
import { CALL_THEMES, PRESET_CALLERS } from './data/themes';
import { soundService } from './services/soundService';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ThemeSelector } from './components/ThemeSelector';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { DialerPad } from './components/DialerPad';

export default function App() {
  // Application State
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('vedscall_theme');
    return (saved as ThemeId) || 'samsung';
  });

  const [caller, setCaller] = useState<CallerProfile>(() => {
    const saved = localStorage.getItem('vedscall_caller');
    return saved ? JSON.parse(saved) : PRESET_CALLERS[0];
  });

  const [callState, setCallState] = useState<CallState>('incoming');
  const [wallpaperUrl, setWallpaperUrl] = useState<string | undefined>(undefined);
  const [edgeLighting, setEdgeLighting] = useState<boolean>(true);
  const [flashOnCall, setFlashOnCall] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'themes' | 'customizer' | 'dialer'>('themes');
  const [recentLogs, setRecentLogs] = useState<RecentCallLog[]>(() => {
    return [
      {
        id: '1',
        caller: PRESET_CALLERS[0],
        timestamp: '10:42 AM',
        type: 'incoming',
        durationSeconds: 48,
        themeId: 'samsung',
      },
      {
        id: '2',
        caller: PRESET_CALLERS[1],
        timestamp: 'Yesterday',
        type: 'missed',
        themeId: 'mi',
      },
    ];
  });

  const currentTheme = CALL_THEMES.find((t) => t.id === activeThemeId) || CALL_THEMES[0];
  const activeCallStartTime = useRef<number | null>(null);

  // Sync sound service mute state
  useEffect(() => {
    soundService.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Handle ringtones during incoming calls
  useEffect(() => {
    if (callState === 'incoming') {
      soundService.startRingtone(activeThemeId);
    } else {
      soundService.stopRingtone();
    }
    return () => {
      soundService.stopRingtone();
    };
  }, [callState, activeThemeId]);

  // Persist theme & caller
  useEffect(() => {
    localStorage.setItem('vedscall_theme', activeThemeId);
  }, [activeThemeId]);

  useEffect(() => {
    localStorage.setItem('vedscall_caller', JSON.stringify(caller));
  }, [caller]);

  // Call actions
  const handleAnswer = () => {
    soundService.stopRingtone();
    soundService.playCallAnswerTone();
    activeCallStartTime.current = Date.now();
    setCallState('active');
  };

  const handleDecline = () => {
    soundService.stopRingtone();
    soundService.playCallEndTone();

    // Add to missed / declined logs
    const newLog: RecentCallLog = {
      id: Date.now().toString(),
      caller,
      timestamp: 'Just now',
      type: 'missed',
      themeId: activeThemeId,
    };
    setRecentLogs((prev) => [newLog, ...prev.slice(0, 15)]);
    setCallState('idle');
  };

  const handleEndCall = () => {
    soundService.playCallEndTone();
    const durationSec = activeCallStartTime.current
      ? Math.round((Date.now() - activeCallStartTime.current) / 1000)
      : 0;

    const newLog: RecentCallLog = {
      id: Date.now().toString(),
      caller,
      timestamp: 'Just now',
      type: 'incoming',
      durationSeconds: durationSec,
      themeId: activeThemeId,
    };
    setRecentLogs((prev) => [newLog, ...prev.slice(0, 15)]);
    setCallState('idle');
    activeCallStartTime.current = null;
  };

  const handleStartOutgoingCall = (number: string, customContact?: CallerProfile) => {
    if (customContact) {
      setCaller(customContact);
    } else {
      setCaller({
        name: `Dialed (${number})`,
        number,
        label: 'Outgoing',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      });
    }
    setCallState('outgoing');
    soundService.stopRingtone();

    // Auto connect after 3 seconds for realistic simulation
    setTimeout(() => {
      setCallState((curr) => {
        if (curr === 'outgoing') {
          soundService.playCallAnswerTone();
          activeCallStartTime.current = Date.now();
          return 'active';
        }
        return curr;
      });
    }, 3200);
  };

  const handleInstantTestCall = (themeId: ThemeId) => {
    setActiveThemeId(themeId);
    setCallState('incoming');
    soundService.stopRingtone();
    soundService.startRingtone(themeId);
  };

  const triggerCallAfterDelay = (seconds: number) => {
    setCallState('idle');
    soundService.stopRingtone();
    setTimeout(() => {
      setCallState('incoming');
    }, seconds * 1000);
  };

  return (
    <div id="veds-call-app" className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-600/30 text-white">
              <Phone className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-800 dark:from-white dark:via-indigo-200 dark:to-neutral-300 bg-clip-text text-transparent">
                  Ved&#39;s Call
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Call Theme Studio
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Lenovo • Huawei • M.I • Samsung • Oppo • Vivo • OnePlus • Realme • Sony • Jolt
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sound Toggle */}
            <button
              id="btn-header-sound"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200 dark:border-rose-900'
              }`}
              title={soundEnabled ? 'Mute ringtones and dial tones' : 'Unmute audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Audio On' : 'Muted'}</span>
            </button>

            {/* Test Call Trigger */}
            <button
              id="btn-header-test-call"
              onClick={() => setCallState('incoming')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Ring Phone</span>
            </button>

            {/* Countdown Ring in 3s */}
            <button
              onClick={() => triggerCallAfterDelay(3)}
              className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-all"
              title="Simulate incoming call in 3 seconds"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Ring in 3s</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row items-start gap-8">
        {/* Left Column: Interactive Phone Hardware Device Simulator */}
        <div className="w-full lg:w-auto flex flex-col items-center shrink-0">
          <div className="flex items-center justify-between w-full max-w-[380px] mb-2 px-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <span>Live Phone Preview</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {currentTheme.name}
            </span>
          </div>

          {/* The Phone Shell */}
          <PhoneSimulator
            theme={currentTheme}
            caller={caller}
            callState={callState}
            customWallpaperUrl={wallpaperUrl}
            onAnswer={handleAnswer}
            onDecline={handleDecline}
            onEndCall={handleEndCall}
            edgeLightingEnabled={edgeLighting}
            flashOnCallEnabled={flashOnCall}
          />

          {/* Device Controls Bar below phone */}
          <div className="w-full max-w-[380px] mt-4 flex items-center justify-center gap-2 p-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <button
              onClick={() => setCallState('incoming')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                callState === 'incoming'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Incoming</span>
            </button>

            <button
              onClick={() => setCallState('active')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                callState === 'active'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span>In-Call</span>
            </button>

            <button
              onClick={() => setCallState('idle')}
              className={`py-1.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                callState === 'idle'
                  ? 'bg-neutral-700 text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Reset phone state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Theme Catalog, Customizer & Dialer Tabs */}
        <div className="flex-1 w-full flex flex-col gap-5">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <button
              id="tab-themes"
              onClick={() => setActiveTab('themes')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'themes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Brand Themes (10)</span>
            </button>

            <button
              id="tab-customizer"
              onClick={() => setActiveTab('customizer')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'customizer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Customizer & Audio</span>
            </button>

            <button
              id="tab-dialer"
              onClick={() => setActiveTab('dialer')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'dialer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Dialer & History</span>
            </button>
          </div>

          {/* Active Tab Content Area */}
          <div className="min-h-[500px]">
            {activeTab === 'themes' && (
              <ThemeSelector
                activeThemeId={activeThemeId}
                onSelectTheme={(id) => setActiveThemeId(id)}
                onInstantTestCall={handleInstantTestCall}
              />
            )}

            {activeTab === 'customizer' && (
              <ThemeCustomizer
                currentCaller={caller}
                onUpdateCaller={setCaller}
                selectedWallpaperUrl={wallpaperUrl}
                onSelectWallpaper={setWallpaperUrl}
                edgeLightingEnabled={edgeLighting}
                onToggleEdgeLighting={() => setEdgeLighting(!edgeLighting)}
                flashOnCallEnabled={flashOnCall}
                onToggleFlashOnCall={() => setFlashOnCall(!flashOnCall)}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                activeTheme={currentTheme}
                onTriggerSimulatedCall={(type) => {
                  if (type === 'incoming') {
                    setCallState('incoming');
                  } else {
                    handleStartOutgoingCall(caller.number, caller);
                  }
                }}
              />
            )}

            {activeTab === 'dialer' && (
              <DialerPad
                onStartCall={handleStartOutgoingCall}
                recentLogs={recentLogs}
              />
            )}
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="mt-auto py-4 px-6 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-center text-xs text-neutral-500">
        Ved&#39;s Call • Authentic Call Screen Themes for Lenovo, Huawei, M.I, Samsung, Oppo, Vivo, OnePlus, Realme, Sony & Jolt
      </footer>
    </div>
  );
}
