import React from 'react';
import type { AggregateImpactResult } from '../../domain/impactCalculator';
import { CheckIcon, SparklesIcon } from '../icons/Icons';

interface Props {
  readonly impact: AggregateImpactResult;
}

/**
 * Live quantified impact scorecard reflecting personal and community savings.
 */
export const ImpactSummaryBar: React.FC<Props> = ({ impact }) => {
  return (
    <section
      aria-label="Quantified Choice Impact Metrics"
      aria-live="polite"
      className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-white shadow-xl space-y-4 backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-[#00FFC2]" />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00FFC2] block">
              [ 04 // IMPACT SCORECARD ]
            </span>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200">
              Direct Choice Impact Scorecard
            </h2>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-neutral-800 text-[#00FFC2] border border-neutral-700">
          {impact.checkedCount} of {impact.totalSteps} Actions Adopted
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
        {/* PM2.5 Inhalation Reduced */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-1 hover:border-[#00FFC2]/50 transition-colors">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            PM2.5 EXPOSURE CUT
          </p>
          <p className="text-3xl font-black font-mono text-[#00FFC2]">
            -{impact.personalPm25ReductionUgm3}
            <span className="text-xs font-normal text-neutral-400 ml-1">µg/m³</span>
          </p>
          <p className="text-[10px] font-mono text-neutral-500">Inhaled dose avoided</p>
        </div>

        {/* CO2e Saved Weekly */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-1 hover:border-[#00FFC2]/50 transition-colors">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            CO₂E AVOIDED
          </p>
          <p className="text-3xl font-black font-mono text-white">
            {impact.weeklyCo2eAvoidedKg}
            <span className="text-xs font-normal text-neutral-400 ml-1">kg/wk</span>
          </p>
          <p className="text-[10px] font-mono text-neutral-500">Transit & energy swaps</p>
        </div>

        {/* Community Particulate Saved */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-1 hover:border-[#00FFC2]/50 transition-colors">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            NEIGHBORHOOD PM
          </p>
          <p className="text-3xl font-black font-mono text-white">
            {impact.communityPmPreventedGrams}
            <span className="text-xs font-normal text-neutral-400 ml-1">grams</span>
          </p>
          <p className="text-[10px] font-mono text-neutral-500">Particulate prevented</p>
        </div>

        {/* Tree Equivalent */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-1 hover:border-[#00FFC2]/50 transition-colors">
          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            TREE EQUIVALENT
          </p>
          <p className="text-3xl font-black font-mono text-[#00FFC2]">
            ~{impact.treeAbsorptionEquivalent}
            <span className="text-xs font-normal text-neutral-400 ml-1">trees</span>
          </p>
          <p className="text-[10px] font-mono text-neutral-500">Weekly offset value</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 pt-1">
        <CheckIcon className="w-3.5 h-3.5 text-[#00FFC2] shrink-0" />
        <span>Every routine toggled dynamically recalculates your real-world household and community impact.</span>
      </div>
    </section>
  );
};
