import React from 'react';
import type { RoutineStep } from '../../types/gemini';
import { CheckIcon, SparklesIcon, WindIcon } from '../icons/Icons';

interface Props {
  readonly routines: readonly RoutineStep[];
  readonly checkedStepIds: ReadonlySet<string>;
  readonly onToggleStep: (id: string) => void;
}

const RoutineCard: React.FC<{
  readonly step: RoutineStep;
  readonly isChecked: boolean;
  readonly onToggle: (id: string) => void;
}> = ({ step, isChecked, onToggle }) => (
  <div
    className={`p-4 rounded-2xl border transition-all ${
      isChecked
        ? 'bg-white dark:bg-slate-900 border-sky-300 dark:border-sky-800 shadow-sm'
        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
    }`}
  >
    <div className="flex items-start gap-3.5">
      <button
        type="button"
        onClick={() => { onToggle(step.id); }}
        className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
          isChecked
            ? 'bg-sky-600 border-sky-600 text-white'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-transparent'
        }`}
        aria-checked={isChecked}
        role="checkbox"
        aria-label={`Toggle action: ${step.action}`}
      >
        <CheckIcon className="w-4 h-4" />
      </button>

      <div className="flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {step.timeSlot}
            </span>
            <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              {step.periodLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              -{step.directImpact.personalPm25ReductionUgm3} µg/m³
            </span>
            <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              -{step.directImpact.co2eAvoidedKg} kg CO₂e
            </span>
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.action}</p>

        <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <WindIcon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-500" />
          <span><strong>Live Rationale:</strong> {step.whyNow}</span>
        </div>

        <div className="text-xs p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
          <strong>Alternative:</strong> {step.lowEmissionAlternative}
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            ✓ Health impact: {step.directImpact.healthBenefit}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Time-blocked 24-hour routine schedule aligned to diurnal smog curve.
 */
export const RoutineTimelineView: React.FC<Props> = ({
  routines,
  checkedStepIds,
  onToggleStep,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-sky-500" />
            24-Hour Low-Emission Routine Architect
          </h3>
          <p className="text-xs text-slate-500">Synchronized with live boundary layer inversion</p>
        </div>
      </div>

      <div className="space-y-3">
        {routines.map((step) => (
          <RoutineCard
            key={step.id}
            step={step}
            isChecked={checkedStepIds.has(step.id)}
            onToggle={onToggleStep}
          />
        ))}
      </div>
    </div>
  );
};
