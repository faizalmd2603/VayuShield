import React from 'react';
import { SparklesIcon } from '../icons/Icons';

/**
 * Empty onboarding banner inviting the user to search a city or use GPS.
 */
export const WelcomeHero: React.FC = () => {
  return (
    <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
        <SparklesIcon className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Welcome to VayuShield
      </h2>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        Search any city globally or click <strong>Use GPS</strong> above to stream live air quality telemetry and generate AI smog defense routines.
      </p>
    </div>
  );
};
