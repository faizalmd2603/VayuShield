import React from 'react';
import type { CombinedAirTelemetry } from '../../types/airQuality';
import { AlertIcon, ShieldIcon, WindIcon } from '../icons/Icons';

interface Props {
  readonly telemetry: CombinedAirTelemetry;
}

/**
 * High-visibility banner surfacing GRAP stage, smog trap risk, and ventilation timing.
 */
export const StatusBanner: React.FC<Props> = ({ telemetry }) => {
  const { cpcbAqi, grapStage, smogTrap, safestVentilation } = telemetry;

  return (
    <section aria-label="Winter Smog Status & GRAP Stage" className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* GRAP Protocol Alert */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-start gap-3.5 backdrop-blur-md hover:border-[#00FFC2]/50 transition-colors">
          <ShieldIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                PROTOCOL
              </span>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">
                {grapStage}
              </span>
            </div>
            <p className="text-sm font-bold font-mono">
              CPCB AQI {cpcbAqi.aqi} — {cpcbAqi.category}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Primary driver: <strong className="text-neutral-900 dark:text-white font-mono">{cpcbAqi.dominantPollutant}</strong> concentration.
            </p>
          </div>
        </div>

        {/* Thermal Inversion / Smog Trap */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-start gap-3.5 backdrop-blur-md hover:border-[#00FFC2]/50 transition-colors">
          <AlertIcon className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
                THERMAL INVERSION
              </span>
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {smogTrap.riskLevel} Smog Trap
              </span>
            </div>
            <p className="text-sm font-bold font-mono">
              Ceiling: {Math.round(smogTrap.boundaryLayerHeight)}m
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Wind: {smogTrap.windSpeed} km/h • Temp: {smogTrap.temperature}°C. Trapping particulates.
            </p>
          </div>
        </div>

        {/* Safest Ventilation Window */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-start gap-3.5 backdrop-blur-md hover:border-[#00FFC2]/50 transition-colors">
          <WindIcon className="w-5 h-5 text-[#00FFC2] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
              VENTILATION WINDOW
            </span>
            <p className="text-sm font-bold font-mono text-[#00FFC2]">
              {safestVentilation ? safestVentilation.startHour : 'Awaiting Midday Inversion Break'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {safestVentilation?.rationale ?? 'Keep outer doors and draft windows sealed.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
