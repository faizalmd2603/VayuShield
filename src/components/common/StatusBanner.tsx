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
        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 text-orange-950 dark:text-orange-100 flex items-start gap-3">
          <ShieldIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-orange-700 dark:text-orange-400">
                Action Protocol
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-200 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200">
                {grapStage}
              </span>
            </div>
            <p className="text-sm font-bold mt-0.5">
              CPCB AQI {cpcbAqi.aqi} — {cpcbAqi.category}
            </p>
            <p className="text-xs text-orange-800 dark:text-orange-300 mt-1">
              Primary driver: {cpcbAqi.dominantPollutant} particulate concentration.
            </p>
          </div>
        </div>

        {/* Thermal Inversion / Smog Trap */}
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-950 dark:text-purple-100 flex items-start gap-3">
          <AlertIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-700 dark:text-purple-400">
                Thermal Inversion
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                {smogTrap.riskLevel} Smog Trap
              </span>
            </div>
            <p className="text-sm font-bold mt-0.5">
              Boundary Layer: {Math.round(smogTrap.boundaryLayerHeight)}m
            </p>
            <p className="text-xs text-purple-800 dark:text-purple-300 mt-1">
              Wind: {smogTrap.windSpeed} km/h • Temp: {smogTrap.temperature}°C. Trapping emissions.
            </p>
          </div>
        </div>

        {/* Safest Ventilation Window */}
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-teal-950 dark:text-teal-100 flex items-start gap-3">
          <WindIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-teal-700 dark:text-teal-400">
              Ventilation Window
            </span>
            <p className="text-sm font-bold mt-0.5">
              {safestVentilation ? safestVentilation.startHour : 'Awaiting Midday Inversion Break'}
            </p>
            <p className="text-xs text-teal-800 dark:text-teal-300 mt-1">
              {safestVentilation?.rationale ?? 'Keep outer doors and draft windows sealed.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
