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
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Purifier Sizing</span>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Room Volume:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{roomMetrics.roomVolumeM3} m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Required Metric CADR:</span>
          <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{roomMetrics.requiredCadrM3H} m³/h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">CFM Equivalent:</span>
          <span className="font-mono font-bold">{roomMetrics.requiredCadrCfm} CFM</span>
        </div>
      </div>
      <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 text-xs">
        <strong>DIY Corsi-Rosenthal:</strong> Box fan + 4x MERV-13 filters delivers ~450 CFM, fully adequate.
      </div>
    </div>

    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Infiltration Model</span>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Outdoor PM2.5:</span>
          <span className="font-mono font-bold">{indoorEstimate.outdoorPm25} µg/m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Estimated Indoor PM2.5:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{indoorEstimate.estimatedIndoorPm25} µg/m³</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Envelope Shield:</span>
          <span className="font-mono font-bold text-teal-600 dark:text-teal-400">-{indoorEstimate.infiltrationReductionPercent}% Infiltration</span>
        </div>
      </div>
      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs">
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
