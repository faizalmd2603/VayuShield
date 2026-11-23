import React from 'react';
import { KeyIcon, MoonIcon, ShieldIcon, SunIcon } from '../icons/Icons';

interface Props {
  readonly locationName?: string;
  readonly hasValidKey: boolean;
  readonly theme: 'light' | 'dark';
  readonly onToggleTheme: () => void;
  readonly onOpenApiKeyModal: () => void;
}

/**
 * Top semantic header landmark with status indicators and quick settings.
 */
export const Header: React.FC<Props> = ({
  locationName,
  hasValidKey,
  theme,
  onToggleTheme,
  onOpenApiKeyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/85 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-neutral-900 border border-neutral-700/60 dark:border-neutral-800 flex items-center justify-center text-[#00FFC2] shadow-sm">
            <ShieldIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white font-mono">
                VAYUSHIELD<span className="text-[#00FFC2]">.</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFC2] animate-pulse" />
                <span>STUDIO</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 hidden sm:block">
              {locationName ? `LIVE // ${locationName}` : 'REAL-TIME ATMOSPHERIC INTELLIGENCE'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase border transition-all cursor-pointer ${
              hasValidKey
                ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:border-[#00FFC2]'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/40 animate-pulse'
            }`}
            aria-label="Configure Google Gemini API Key"
          >
            <KeyIcon className="w-3.5 h-3.5 text-[#00FFC2]" />
            <span className="hidden xs:inline">{hasValidKey ? 'API Connected' : 'Connect Key'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#00FFC2] transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
