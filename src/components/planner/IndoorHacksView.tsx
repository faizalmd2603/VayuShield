import React, { useState } from 'react';
import type { IndoorHack } from '../../types/gemini';
import { SparklesIcon } from '../icons/Icons';

interface Props {
  readonly hacks: readonly IndoorHack[];
}

/**
 * Categorized indoor hacks and sustainable lifestyle alternatives studio.
 */
export const IndoorHacksView: React.FC<Props> = ({ hacks }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'Zero-Cost', 'Low-Cost DIY', 'Appliance Optimization', 'Daily Swap'];
  const filtered = activeCategory === 'all'
    ? hacks
    : hacks.filter((h) => h.category === activeCategory);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-teal-500" />
            Indoor Air Quality Hacks & Sustainable Alternatives
          </h3>
          <p className="text-xs text-slate-500">Zero-cost hacks, DIY Corsi-Rosenthal sizing, and sustainable swaps</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveCategory(cat); }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Hacks' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((hack) => (
          <div
            key={hack.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {hack.category}
                </span>
                <span className="text-xs text-slate-400">
                  Cost: <strong className="text-slate-700 dark:text-slate-200">{hack.estimatedCost}</strong> • Effort: {hack.effortLevel}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                {hack.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {hack.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500">Direct Health Impact:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 text-right">{hack.directHealthImpact}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500">Emission Impact:</span>
                <span className="font-medium text-sky-600 dark:text-sky-400 text-right">{hack.directEmissionImpact}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500">Filtration Delta:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-right">{hack.achCadrImprovement}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
