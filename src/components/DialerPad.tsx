import React, { useState } from 'react';
import { Phone, Delete, Clock, ArrowDownLeft, ArrowUpRight, PhoneMissed, UserCheck } from 'lucide-react';
import { RecentCallLog, CallerProfile } from '../types';
import { soundService } from '../services/soundService';

interface DialerPadProps {
  onStartCall: (number: string, contact?: CallerProfile) => void;
  recentLogs: RecentCallLog[];
}

const DIAL_KEYS = [
  { digit: '1', sub: ' ' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
  { digit: '*', sub: ' ' },
  { digit: '0', sub: '+' },
  { digit: '#', sub: ' ' },
];

export const DialerPad: React.FC<DialerPadProps> = ({ onStartCall, recentLogs }) => {
  const [dialedNumber, setDialedNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'keypad' | 'recent'>('keypad');

  const handleKeyPress = (digit: string) => {
    soundService.playDtmf(digit);
    setDialedNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setDialedNumber('');
  };

  const handleCall = () => {
    if (!dialedNumber.trim()) return;
    onStartCall(dialedNumber);
  };

  return (
    <div id="dialer-pad-container" className="flex flex-col gap-4">
      {/* Dialer Mode Tabs */}
      <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab('keypad')}
          className={`flex-1 py-1.5 px-4 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'keypad'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Keypad
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 py-1.5 px-4 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'recent'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recent ({recentLogs.length})</span>
        </button>
      </div>

      {activeTab === 'keypad' ? (
        <div className="flex flex-col items-center max-w-sm mx-auto w-full p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          {/* Display screen */}
          <div className="w-full h-14 flex items-center justify-between px-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
            <span className="text-2xl font-mono font-bold tracking-wider text-neutral-900 dark:text-white truncate">
              {dialedNumber || <span className="text-neutral-400 font-sans text-lg font-normal">Dial a number...</span>}
            </span>
            {dialedNumber && (
              <button
                onClick={handleBackspace}
                className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white active:scale-90 transition-transform"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            {DIAL_KEYS.map(({ digit, sub }) => (
              <button
                key={digit}
                id={`btn-dial-${digit}`}
                onClick={() => handleKeyPress(digit)}
                className="h-16 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/60 active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer select-none"
              >
                <span className="text-2xl font-semibold text-neutral-900 dark:text-white leading-tight">
                  {digit}
                </span>
                <span className="text-[9px] font-bold text-neutral-400 tracking-wider">
                  {sub}
                </span>
              </button>
            ))}
          </div>

          {/* Action Call Button */}
          <div className="flex items-center gap-6">
            {dialedNumber && (
              <button
                onClick={handleClear}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 font-medium"
              >
                Clear
              </button>
            )}
            <button
              id="btn-dialer-call"
              onClick={handleCall}
              disabled={!dialedNumber.trim()}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white active:scale-95 transition-all"
              title="Call with current theme"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        </div>
      ) : (
        /* Recent Calls List */
        <div className="max-w-md mx-auto w-full p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
            Call History Logs
          </div>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              No recent calls yet. Make or receive a simulated call!
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-3 px-2 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={log.caller.avatarUrl}
                      alt={log.caller.name}
                      className="w-9 h-9 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <span>{log.caller.name}</span>
                        {log.type === 'incoming' && <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />}
                        {log.type === 'outgoing' && <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />}
                        {log.type === 'missed' && <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {log.caller.number} • {log.timestamp}
                        {log.durationSeconds !== undefined && log.durationSeconds > 0 && ` (${log.durationSeconds}s)`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartCall(log.caller.number, log.caller)}
                    className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"
                    title="Call again"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
