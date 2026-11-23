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
  const filtered =
    activeCategory === 'all' ? hacks : hacks.filter((h) => h.category === activeCategory);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-teal-500" />
            Indoor Air Quality Hacks & Sustainable Alternatives
          </h3>
          <p className="text-xs text-slate-500">
            Zero-cost hacks, DIY Corsi-Rosenthal sizing, and sustainable swaps
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
              }}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-bold'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-white border border-neutral-200 dark:border-neutral-700'
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
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3 flex flex-col justify-between hover:border-[#00FFC2]/50 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                  {hack.category}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Cost:{' '}
                  <strong className="text-neutral-900 dark:text-white">{hack.estimatedCost}</strong>{' '}
                  • Effort: {hack.effortLevel}
                </span>
              </div>

              <h4 className="text-sm font-bold text-neutral-950 dark:text-white mt-2">
                {hack.title}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                {hack.description}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5 text-xs font-mono">
              <div className="flex items-start justify-between gap-2">
                <span className="text-neutral-500">Health Impact:</span>
                <span className="font-bold text-[#00FFC2] text-right">
                  {hack.directHealthImpact}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-neutral-500">Emission Impact:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300 text-right">
                  {hack.directEmissionImpact}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-neutral-500">Filtration Delta:</span>
                <span className="font-mono text-[#00FFC2] text-right">
                  {hack.achCadrImprovement}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
