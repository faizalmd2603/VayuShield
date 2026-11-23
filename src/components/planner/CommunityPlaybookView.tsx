import React, { useState } from 'react';
import type { CommunityPlaybook } from '../../types/gemini';
import { CheckIcon, CommunityIcon, CopyIcon } from '../icons/Icons';

interface Props {
  readonly playbook: CommunityPlaybook;
}

/**
 * Community & Neighborhood Playbook with ready-to-share WhatsApp advisory notice.
 */
export const CommunityPlaybookView: React.FC<Props> = ({ playbook }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyNotice = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(playbook.advisoryNoticeText);
      setCopied(true);
      setTimeout(() => { setCopied(false); }, 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CommunityIcon className="w-5 h-5 text-indigo-500" />
            {playbook.title}
          </h3>
          <p className="text-xs text-slate-500">
            Target: <strong>{playbook.targetAudience}</strong> • Context: {playbook.currentGrapContext}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Collective Action Checklist */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Collective Action Protocols
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            {playbook.actionChecklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
            ✓ Collective Impact: {playbook.directCommunityImpact}
          </p>
        </div>

        {/* WhatsApp & Noticeboard Advisory */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ready-to-Share RWA / School Advisory
              </h4>
              <button
                type="button"
                onClick={() => { void handleCopyNotice(); }}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors cursor-pointer"
                aria-label="Copy community advisory notice to clipboard"
              >
                {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <CopyIcon className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy for WhatsApp'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed max-h-56 overflow-y-auto">
              {playbook.advisoryNoticeText}
            </pre>
          </div>
          <p className="text-[11px] text-slate-400">
            Formatted specifically for instant broadcast on Society WhatsApp groups, school parent portals, and building lobbies.
          </p>
        </div>
      </div>
    </div>
  );
};
