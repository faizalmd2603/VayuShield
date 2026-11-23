import React from 'react';
import { getUsAqiCategory } from '../../domain/aqiScience';
import type { CombinedAirTelemetry, PollutantTelemetry } from '../../types/airQuality';
import { AlertIcon, ShieldIcon, WindIcon } from '../icons/Icons';

interface Props {
  readonly telemetry: CombinedAirTelemetry;
}

const GasBadges: React.FC<{ readonly current: PollutantTelemetry }> = ({ current }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <span className="text-slate-500">NO₂</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{current.nitrogenDioxide} µg/m³</span>
      </div>
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <span className="text-slate-500">O₃</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{current.ozone} µg/m³</span>
      </div>
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <span className="text-slate-500">SO₂</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{current.sulphurDioxide} µg/m³</span>
      </div>
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <span className="text-slate-500">CO</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{current.carbonMonoxide} mg/m³</span>
      </div>
    </div>
  );
};

/**
 * Grid displaying live pollutant concentrations and atmospheric metrics.
 */
export const LiveTelemetryGrid: React.FC<Props> = ({ telemetry }) => {
  const { currentPollutants, cpcbAqi, smogTrap } = telemetry;
  const usCat = getUsAqiCategory(currentPollutants.usAqi);

  return (
    <section aria-label="Real-time Air Quality Telemetry" className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPCB NAQI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Indian CPCB AQI</span>
            <ShieldIcon className="w-5 h-5 text-sky-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{cpcbAqi.aqi}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {cpcbAqi.category}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Dominant: <strong className="text-slate-800 dark:text-slate-200">{cpcbAqi.dominantPollutant}</strong>
          </p>
        </div>

        {/* US EPA AQI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">US EPA AQI</span>
            <AlertIcon className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentPollutants.usAqi}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {usCat}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            European Index: <strong className="text-slate-800 dark:text-slate-200">{currentPollutants.europeanAqi}</strong>
          </p>
        </div>

        {/* PM2.5 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PM2.5 Fine Smog</span>
            <span className="text-xs font-mono text-slate-400">µg/m³</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentPollutants.pm25}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {currentPollutants.pm25 > 15 ? `${Math.round(currentPollutants.pm25 / 15)}x WHO Limit` : 'WHO Safe'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            PM10 Coarse: <strong className="text-slate-800 dark:text-slate-200">{currentPollutants.pm10} µg/m³</strong>
          </p>
        </div>

        {/* Dispersion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dispersion Ceiling</span>
            <WindIcon className="w-5 h-5 text-teal-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
              {Math.round(smogTrap.boundaryLayerHeight)}
            </span>
            <span className="text-xs font-mono text-slate-400">meters</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Wind: {smogTrap.windSpeed} km/h • Temp: {smogTrap.temperature}°C
          </p>
        </div>
      </div>

      <GasBadges current={currentPollutants} />
    </section>
  );
};
