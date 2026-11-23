import React, { useState } from 'react';
import { calculateRoomMetrics, estimateIndoorPm25, type IndoorPollutionEstimate, type RoomAeroMetrics } from '../../domain/indoorPhysics';
import type { CombinedAirTelemetry } from '../../types/airQuality';
import type { LifestyleProfile } from '../../types/profile';
import { WindIcon } from '../icons/Icons';

interface Props {
  readonly telemetry: CombinedAirTelemetry;
  readonly profile: LifestyleProfile;
}

const MetricsCards: React.FC<{
  readonly roomMetrics: RoomAeroMetrics;
  readonly indoorEstimate: IndoorPollutionEstimate;
}> = ({ roomMetrics, indoorEstimate }) => (
  <>
    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-3 font-mono hover:border-[#00FFC2]/50 transition-colors">
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">[ PURIFIER SIZING ]</span>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-neutral-500">Room Volume:</span>
          <span className="font-bold text-neutral-900 dark:text-white">{roomMetrics.roomVolumeM3} m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Required CADR:</span>
          <span className="font-bold text-[#00FFC2]">{roomMetrics.requiredCadrM3H} m³/h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">CFM Equivalent:</span>
          <span className="font-bold">{roomMetrics.requiredCadrCfm} CFM</span>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-sans">
        <strong>DIY Corsi-Rosenthal:</strong> Box fan + 4x MERV-13 filters delivers ~450 CFM, fully adequate.
      </div>
    </div>

    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 space-y-3 font-mono hover:border-[#00FFC2]/50 transition-colors">
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">[ INFILTRATION MODEL ]</span>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-neutral-500">Outdoor PM2.5:</span>
          <span className="font-bold">{indoorEstimate.outdoorPm25} µg/m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Indoor PM2.5:</span>
          <span className="font-bold text-[#00FFC2]">{indoorEstimate.estimatedIndoorPm25} µg/m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Envelope Shield:</span>
          <span className="font-bold text-neutral-900 dark:text-white">-{indoorEstimate.infiltrationReductionPercent}% Infiltration</span>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-sans">
        <strong>Pulmonary Shield:</strong> Cuts ~{Math.round(indoorEstimate.dailyInhaledDoseMicrograms)} µg daily inhaled dose.
      </div>
    </div>
  </>
);

/**
 * Interactive aero-physics simulation lab computing CADR, ACH, and indoor PM2.5 infiltration.
 */
export const IndoorPhysicsLab: React.FC<Props> = ({ telemetry, profile }) => {
  const [area, setArea] = useState(profile.roomSizeSqMeters || 24);
  const [height, setHeight] = useState(profile.ceilingHeightMeters || 2.8);
  const [targetAch, setTargetAch] = useState(4.5);

  const roomMetrics = calculateRoomMetrics(area, height, targetAch);
  const indoorEstimate = estimateIndoorPm25(telemetry.currentPollutants.pm25, {
    ...profile,
    roomSizeSqMeters: area,
    ceilingHeightMeters: height,
  });

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <WindIcon className="w-5 h-5 text-sky-500" />
            Deterministic Indoor Aero-Physics Lab
          </h3>
          <p className="text-xs text-slate-500">Live building envelope infiltration & CADR sizing math</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Room Floor Area</span>
              <span className="font-mono text-sky-600 dark:text-sky-400">{area} m²</span>
            </div>
            <input
              type="range" min={10} max={120} step={2} value={area}
              onChange={(e) => { setArea(Number(e.target.value)); }}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Ceiling Height</span>
              <span className="font-mono text-sky-600 dark:text-sky-400">{height.toFixed(1)} m</span>
            </div>
            <input
              type="range" min={2.4} max={4.5} step={0.1} value={height}
              onChange={(e) => { setHeight(Number(e.target.value)); }}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Target Clean ACH</span>
              <span className="font-mono text-sky-600 dark:text-sky-400">{targetAch} ACH</span>
            </div>
            <input
              type="range" min={2.0} max={8.0} step={0.5} value={targetAch}
              onChange={(e) => { setTargetAch(Number(e.target.value)); }}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>
        </div>

        <MetricsCards roomMetrics={roomMetrics} indoorEstimate={indoorEstimate} />
      </div>
    </div>
  );
};
