import React, { useState } from 'react';
import { Check, PhoneCall, Sparkles, SlidersHorizontal, Smartphone } from 'lucide-react';
import { CallTheme, ThemeId } from '../types';
import { CALL_THEMES } from '../data/themes';

interface ThemeSelectorProps {
  activeThemeId: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onInstantTestCall: (themeId: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  activeThemeId,
  onSelectTheme,
  onInstantTestCall,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'flagship' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThemes = CALL_THEMES.filter((theme) => {
    const matchesSearch =
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.signatureFeature.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterCategory === 'custom') return theme.id === 'jolt';
    if (filterCategory === 'flagship') return theme.id !== 'jolt';
    return true;
  });

  return (
    <div id="theme-selector-section" className="flex flex-col gap-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>OEM & Brand Call Themes ({CALL_THEMES.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Choose an authentic caller screen skin or preview interactive gestures.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-medium self-start">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterCategory === 'all'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            All (10)
          </button>
          <button
            onClick={() => setFilterCategory('flagship')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterCategory === 'flagship'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Brand OEMs
          </button>
          <button
            onClick={() => setFilterCategory('custom')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterCategory === 'custom'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Jolt Special
          </button>
        </div>
      </div>

      {/* Grid of Call Themes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
        {filteredThemes.map((theme) => {
          const isActive = theme.id === activeThemeId;

          return (
            <div
              key={theme.id}
              id={`theme-card-${theme.id}`}
              onClick={() => onSelectTheme(theme.id)}
              className={`group relative p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                  : 'bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Brand Logo / Accent Dot & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${theme.badgeColor}`}>
                      {theme.brand}
                    </span>
                    {theme.id === 'jolt' && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-950/60 px-1.5 py-0.5 rounded">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-neutral-900 dark:text-white truncate">
                    {theme.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-2">
                    {theme.subtitle}
                  </p>
                </div>

                {/* Active Indicator or Action */}
                {isActive ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/70 px-2.5 py-1 rounded-full shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Active
                  </span>
                ) : (
                  <span className="text-xs font-medium text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors shrink-0">
                    Select
                  </span>
                )}
              </div>

              {/* Visual preview strip mimicking the theme's colors */}
              <div
                className={`h-2.5 w-full rounded-full bg-gradient-to-r ${theme.gradientBg} my-3 border border-white/10`}
              />

              {/* Signature Feature & Instant Test Call Button */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium truncate max-w-[190px]">
                  {theme.signatureFeature}
                </span>

                <button
                  id={`btn-instant-call-${theme.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onInstantTestCall(theme.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-transform active:scale-95 shadow-xs"
                  title="Simulate incoming call with this theme"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Test Call</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
