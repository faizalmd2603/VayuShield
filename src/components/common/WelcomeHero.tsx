import React from 'react';

/**
 * Empty onboarding banner inviting the user to search a city or use GPS.
 */
export const WelcomeHero: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 text-center space-y-10">
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60 text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FFC2] animate-pulse" />
          <span>AUTONOMOUS WINTER SMOG ASSISTANT</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.1]">
          <span>Welcome to VayuShield</span>
          <span className="text-[#00FFC2]">.</span>
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-[#00FFC2]">
          CLEAR AIR. SMARTER CHOICES. GROUND-LEVEL DISPERSION PHYSICS.
        </p>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Ground-level thermal inversions trap hazardous particulates. VayuShield synthesizes live
          Open-Meteo atmospheric dispersion physics with Google Gemini GenAI to architect
          personalized routines and community playbooks.
        </p>
      </div>

      {/* NK Studio Signature Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md text-left space-y-1 hover:border-[#00FFC2]/50 transition-colors">
          <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-neutral-950 dark:text-white">
            -78%
          </p>
          <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
            INDOOR EXPOSURE
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md text-left space-y-1 hover:border-[#00FFC2]/50 transition-colors">
          <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-neutral-950 dark:text-white">
            550 <span className="text-sm font-normal text-neutral-400">m³/h</span>
          </p>
          <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
            DIY CADR POWER
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md text-left space-y-1 hover:border-[#00FFC2]/50 transition-colors">
          <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[#00FFC2]">
            0
          </p>
          <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
            MOCK DATA IN SOURCE
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md text-left space-y-1 hover:border-[#00FFC2]/50 transition-colors">
          <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-neutral-950 dark:text-white">
            100%
          </p>
          <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
            PHYSICS GROUNDED
          </p>
        </div>
      </div>

      <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
        [ STEP 01: SEARCH A CITY OR CLICK &ldquo;USE GPS&rdquo; ABOVE TO STREAM TELEMETRY ]
      </p>
    </div>
  );
};
