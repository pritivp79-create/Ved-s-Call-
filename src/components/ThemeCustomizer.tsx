import React, { useState } from 'react';
import {
  User,
  Sliders,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Zap,
  Check,
  RefreshCw,
  Phone
} from 'lucide-react';
import { CallerProfile, CallTheme, ThemeId } from '../types';
import { PRESET_CALLERS, PRESET_WALLPAPERS } from '../data/themes';
import { soundService } from '../services/soundService';

interface ThemeCustomizerProps {
  currentCaller: CallerProfile;
  onUpdateCaller: (caller: CallerProfile) => void;
  selectedWallpaperUrl?: string;
  onSelectWallpaper: (url?: string) => void;
  edgeLightingEnabled: boolean;
  onToggleEdgeLighting: () => void;
  flashOnCallEnabled: boolean;
  onToggleFlashOnCall: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeTheme: CallTheme;
  onTriggerSimulatedCall: (type: 'incoming' | 'outgoing') => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  currentCaller,
  onUpdateCaller,
  selectedWallpaperUrl,
  onSelectWallpaper,
  edgeLightingEnabled,
  onToggleEdgeLighting,
  flashOnCallEnabled,
  onToggleFlashOnCall,
  soundEnabled,
  onToggleSound,
  activeTheme,
  onTriggerSimulatedCall,
}) => {
  const [isPlayingRingtone, setIsPlayingRingtone] = useState(false);
  const [customName, setCustomName] = useState(currentCaller.name);
  const [customNumber, setCustomNumber] = useState(currentCaller.number);
  const [customAvatar, setCustomAvatar] = useState(currentCaller.avatarUrl);

  const handleApplyCustomCaller = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCaller({
      ...currentCaller,
      name: customName.trim() || 'Ved',
      number: customNumber.trim() || '+1 (555) 019-4820',
      avatarUrl: customAvatar.trim() || currentCaller.avatarUrl,
    });
  };

  const handleRingtonePreview = () => {
    if (isPlayingRingtone) {
      soundService.stopRingtone();
      setIsPlayingRingtone(false);
    } else {
      soundService.startRingtone(activeTheme.id);
      setIsPlayingRingtone(true);
      // Auto stop after 6 seconds
      setTimeout(() => {
        soundService.stopRingtone();
        setIsPlayingRingtone(false);
      }, 6000);
    }
  };

  return (
    <div id="theme-customizer-panel" className="flex flex-col gap-6">
      {/* Simulation Quick Launch Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Interactive Call Simulator</span>
          </h4>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Current Theme: <strong className="text-indigo-600 dark:text-indigo-400">{activeTheme.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="btn-trigger-incoming"
            onClick={() => onTriggerSimulatedCall('incoming')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Simulate Incoming Call</span>
          </button>
          <button
            id="btn-trigger-outgoing"
            onClick={() => onTriggerSimulatedCall('outgoing')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold border border-neutral-700 active:scale-95 transition-all"
          >
            <span>Dial Outgoing</span>
          </button>
        </div>
      </div>

      {/* 1. Caller Profile Manager */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Caller ID & Avatar</span>
          </h4>
          <span className="text-[11px] text-neutral-500">Pick preset or edit</span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PRESET_CALLERS.map((preset) => {
            const isSelected = preset.name === currentCaller.name;
            return (
              <button
                key={preset.name}
                onClick={() => {
                  onUpdateCaller(preset);
                  setCustomName(preset.name);
                  setCustomNumber(preset.number);
                  setCustomAvatar(preset.avatarUrl);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                }`}
              >
                <img
                  src={preset.avatarUrl}
                  alt={preset.name}
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium">{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Edit Inputs */}
        <form onSubmit={handleApplyCustomCaller} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">Caller Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Ved Sharma"
              className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-500 mb-1">Phone Number</label>
            <input
              type="text"
              value={customNumber}
              onChange={(e) => setCustomNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-neutral-500 mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={customAvatar}
                onChange={(e) => setCustomAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white truncate"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* 2. Custom Call Wallpaper / Backgrounds */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
          <ImageIcon className="w-4 h-4 text-emerald-500" />
          <span>Call Screen Wallpaper</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {PRESET_WALLPAPERS.map((wp) => {
            const isSelected = selectedWallpaperUrl === wp.url;
            return (
              <button
                key={wp.id}
                onClick={() => onSelectWallpaper(wp.url || undefined)}
                className={`group relative flex flex-col items-center p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                }`}
              >
                <div
                  className="w-full h-14 rounded-lg mb-1.5 relative overflow-hidden flex items-center justify-center text-white"
                  style={{ background: wp.thumbnail }}
                >
                  {wp.url && (
                    <img
                      src={wp.url}
                      alt={wp.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 truncate w-full text-center">
                  {wp.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Audio & Ringtone Synthesis */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <span>Theme Ringtone Audio</span>
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Default for this theme: <strong className="text-neutral-700 dark:text-neutral-300">{activeTheme.defaultRingtone}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              soundEnabled
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5 text-rose-500" />}
            <span>{soundEnabled ? 'Ringer On' : 'Silent Mode'}</span>
          </button>

          <button
            onClick={handleRingtonePreview}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPlayingRingtone
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
            }`}
          >
            {isPlayingRingtone ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isPlayingRingtone ? 'Stop Sound' : 'Preview Ringer'}</span>
          </button>
        </div>
      </div>

      {/* 4. Special Effects: Edge Lighting & Flash */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          onClick={onToggleEdgeLighting}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
            edgeLightingEnabled
              ? 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-500 shadow-xs'
              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${edgeLightingEnabled ? 'bg-cyan-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Edge Lighting Glow</div>
              <div className="text-[11px] text-neutral-500">Pulsing phone edge illumination</div>
            </div>
          </div>
          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${edgeLightingEnabled ? 'bg-cyan-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${edgeLightingEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>

        <div
          onClick={onToggleFlashOnCall}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
            flashOnCallEnabled
              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 shadow-xs'
              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${flashOnCallEnabled ? 'bg-amber-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Flash on Call (LED)</div>
              <div className="text-[11px] text-neutral-500">Strobe flashlight when ringing</div>
            </div>
          </div>
          <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${flashOnCallEnabled ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${flashOnCallEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
