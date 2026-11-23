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
      className="p-5 rounded-2xl bg-gradient-to-r from-sky-900 to-teal-900 text-white shadow-lg space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-teal-300" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-200">
            Direct Choice Impact Scorecard
          </h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-teal-100 font-medium">
          {impact.checkedCount} of {impact.totalSteps} Actions Adopted
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
        {/* PM2.5 Inhalation Reduced */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
          <span className="text-[11px] text-teal-200 uppercase font-medium">
            PM2.5 Exposure Cut
          </span>
          <p className="text-2xl font-black mt-0.5 text-white">
            -{impact.personalPm25ReductionUgm3}
            <span className="text-xs font-normal text-teal-200 ml-1">µg/m³</span>
          </p>
          <p className="text-[10px] text-teal-100/70 mt-0.5">Inhaled dose avoided</p>
        </div>

        {/* CO2e Saved Weekly */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
          <span className="text-[11px] text-teal-200 uppercase font-medium">
            CO₂e Avoided
          </span>
          <p className="text-2xl font-black mt-0.5 text-white">
            {impact.weeklyCo2eAvoidedKg}
            <span className="text-xs font-normal text-teal-200 ml-1">kg/week</span>
          </p>
          <p className="text-[10px] text-teal-100/70 mt-0.5">Commute & energy swaps</p>
        </div>

        {/* Community Particulate Saved */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
          <span className="text-[11px] text-teal-200 uppercase font-medium">
            Neighborhood PM Cut
          </span>
          <p className="text-2xl font-black mt-0.5 text-white">
            {impact.communityPmPreventedGrams}
            <span className="text-xs font-normal text-teal-200 ml-1">grams</span>
          </p>
          <p className="text-[10px] text-teal-100/70 mt-0.5">Community particulate</p>
        </div>

        {/* Tree Equivalent */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
          <span className="text-[11px] text-teal-200 uppercase font-medium">
            Tree Equivalent
          </span>
          <p className="text-2xl font-black mt-0.5 text-white">
            ~{impact.treeAbsorptionEquivalent}
            <span className="text-xs font-normal text-teal-200 ml-1">trees</span>
          </p>
          <p className="text-[10px] text-teal-100/70 mt-0.5">Weekly offset value</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-teal-100/90 pt-1">
        <CheckIcon className="w-4 h-4 text-teal-300 shrink-0" />
        <span>Every routine step toggled below updates your verified family & neighborhood reduction.</span>
      </div>
    </section>
  );
};
