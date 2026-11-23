import React from 'react';
import { getUsAqiCategory } from '../../domain/aqiScience';
import type { CombinedAirTelemetry, PollutantTelemetry } from '../../types/airQuality';
import { AlertIcon, ShieldIcon, WindIcon } from '../icons/Icons';

interface Props {
  readonly telemetry: CombinedAirTelemetry;
}

const GasBadges: React.FC<{ readonly current: PollutantTelemetry }> = ({ current }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <span className="text-neutral-500">NO₂</span>
        <span className="font-bold text-neutral-900 dark:text-white">
          {current.nitrogenDioxide} µg/m³
        </span>
      </div>
      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <span className="text-neutral-500">O₃</span>
        <span className="font-bold text-neutral-900 dark:text-white">{current.ozone} µg/m³</span>
      </div>
      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <span className="text-neutral-500">SO₂</span>
        <span className="font-bold text-neutral-900 dark:text-white">
          {current.sulphurDioxide} µg/m³
        </span>
      </div>
      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <span className="text-neutral-500">CO</span>
        <span className="font-bold text-neutral-900 dark:text-white">
          {current.carbonMonoxide} mg/m³
        </span>
      </div>
    </div>
  );
};

const AqiPrimaryCard: React.FC<{
  readonly aqi: number;
  readonly category: string;
  readonly dominant: string;
}> = ({ aqi, category, dominant }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-[#00FFC2]/50 transition-colors backdrop-blur-md">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
        Indian CPCB AQI
      </span>
      <ShieldIcon className="w-4 h-4 text-[#00FFC2]" />
    </div>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-4xl font-extrabold font-mono text-neutral-950 dark:text-white">
        {aqi}
      </span>
      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
        {category}
      </span>
    </div>
    <p className="mt-2 text-xs text-neutral-500 font-mono">
      Driver: <strong className="text-neutral-900 dark:text-white">{dominant}</strong>
    </p>
  </div>
);

const AqiSecondaryCard: React.FC<{
  readonly usAqi: number;
  readonly europeanAqi: number;
}> = ({ usAqi, europeanAqi }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-[#00FFC2]/50 transition-colors backdrop-blur-md">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
        US EPA AQI
      </span>
      <AlertIcon className="w-4 h-4 text-amber-400" />
    </div>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-4xl font-extrabold font-mono text-neutral-950 dark:text-white">
        {usAqi}
      </span>
      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
        {getUsAqiCategory(usAqi)}
      </span>
    </div>
    <p className="mt-2 text-xs text-neutral-500 font-mono">
      European AQI: <strong className="text-neutral-900 dark:text-white">{europeanAqi}</strong>
    </p>
  </div>
);

const Pm25Card: React.FC<{
  readonly pm25: number;
  readonly pm10: number;
}> = ({ pm25, pm10 }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-[#00FFC2]/50 transition-colors backdrop-blur-md">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
        PM2.5 Fine Smog
      </span>
      <span className="text-[10px] font-mono text-neutral-400">µg/m³</span>
    </div>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-4xl font-extrabold font-mono text-neutral-950 dark:text-white">
        {pm25}
      </span>
      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30">
        {pm25 > 15 ? `${Math.round(pm25 / 15)}x WHO Limit` : 'WHO Safe'}
      </span>
    </div>
    <p className="mt-2 text-xs text-neutral-500 font-mono">
      PM10 Coarse: <strong className="text-neutral-900 dark:text-white">{pm10} µg/m³</strong>
    </p>
  </div>
);

const DispersionCard: React.FC<{
  readonly boundaryLayerHeight: number;
  readonly windSpeed: number;
  readonly temperature: number;
}> = ({ boundaryLayerHeight, windSpeed, temperature }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-[#00FFC2]/50 transition-colors backdrop-blur-md">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
        Dispersion Ceiling
      </span>
      <WindIcon className="w-4 h-4 text-[#00FFC2]" />
    </div>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-4xl font-extrabold font-mono text-neutral-950 dark:text-white">
        {Math.round(boundaryLayerHeight)}
      </span>
      <span className="text-xs font-mono text-neutral-400">meters</span>
    </div>
    <p className="mt-2 text-xs text-neutral-500 font-mono">
      Wind: <strong className="text-neutral-900 dark:text-white">{windSpeed} km/h</strong> • Temp:{' '}
      <strong className="text-neutral-900 dark:text-white">{temperature}°C</strong>
    </p>
  </div>
);

/**
 * Grid displaying live pollutant concentrations and atmospheric metrics.
 */
export const LiveTelemetryGrid: React.FC<Props> = ({ telemetry }) => {
  const { currentPollutants, cpcbAqi, smogTrap } = telemetry;

  return (
    <section aria-label="Real-time Air Quality Telemetry" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
          [ 01 // LIVE POLLUTANT TELEMETRY ]
        </h2>
        <span className="text-[10px] font-mono text-neutral-400">OPEN-METEO V1 STREAM</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AqiPrimaryCard
          aqi={cpcbAqi.aqi}
          category={cpcbAqi.category}
          dominant={cpcbAqi.dominantPollutant}
        />
        <AqiSecondaryCard
          usAqi={currentPollutants.usAqi}
          europeanAqi={currentPollutants.europeanAqi}
        />
        <Pm25Card pm25={currentPollutants.pm25} pm10={currentPollutants.pm10} />
        <DispersionCard
          boundaryLayerHeight={smogTrap.boundaryLayerHeight}
          windSpeed={smogTrap.windSpeed}
          temperature={smogTrap.temperature}
        />
      </div>

      <GasBadges current={currentPollutants} />
    </section>
  );
};
