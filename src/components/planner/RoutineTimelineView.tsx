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
    className={`p-5 rounded-2xl border transition-all ${
      isChecked
        ? 'bg-white dark:bg-neutral-900/50 border-neutral-300 dark:border-neutral-700 shadow-sm hover:border-[#00FFC2]/50'
        : 'bg-neutral-50 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800/80 opacity-60'
    }`}
  >
    <div className="flex items-start gap-3.5">
      <button
        type="button"
        onClick={() => {
          onToggle(step.id);
        }}
        className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
          isChecked
            ? 'bg-[#00FFC2] border-[#00FFC2] text-black shadow-sm'
            : 'border-neutral-300 dark:border-neutral-700 bg-transparent text-transparent'
        }`}
        aria-checked={isChecked}
        role="checkbox"
        aria-label={`Toggle action: ${step.action}`}
      >
        <CheckIcon className="w-4 h-4 text-black stroke-[3]" />
      </button>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
              {step.timeSlot}
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {step.periodLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00FFC2]/10 text-[#00FFC2] border border-[#00FFC2]/30 font-bold">
              -{step.directImpact.personalPm25ReductionUgm3} µg/m³
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
              -{step.directImpact.co2eAvoidedKg} kg CO₂e
            </span>
          </div>
        </div>

        <p className="text-sm font-bold text-neutral-950 dark:text-white leading-snug">
          {step.action}
        </p>

        <div className="flex items-start gap-1.5 text-xs text-neutral-500 font-mono">
          <WindIcon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#00FFC2]" />
          <span>
            <strong>Rationale:</strong> {step.whyNow}
          </span>
        </div>

        <div className="text-xs p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800">
          <strong>Low-Emission Alternative:</strong> {step.lowEmissionAlternative}
          <div className="text-[11px] text-[#00FFC2] font-mono mt-1 font-medium">
            ✓ Health: {step.directImpact.healthBenefit}
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
