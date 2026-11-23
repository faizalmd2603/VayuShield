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
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
            <CommunityIcon className="w-5 h-5 text-[#00FFC2]" />
            {playbook.title}
          </h3>
          <p className="text-xs font-mono text-neutral-500 mt-0.5">
            Target:{' '}
            <strong className="text-neutral-900 dark:text-white">{playbook.targetAudience}</strong>{' '}
            • Context: {playbook.currentGrapContext}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Collective Action Checklist */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 hover:border-[#00FFC2]/50 transition-colors">
          <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-neutral-400">
            [ COLLECTIVE ACTION PROTOCOLS ]
          </h4>
          <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
            {playbook.actionChecklist.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800"
              >
                <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-neutral-700 text-[#00FFC2] flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-sans">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs font-mono text-[#00FFC2] font-semibold pt-1">
            ✓ Collective Impact: {playbook.directCommunityImpact}
          </p>
        </div>

        {/* WhatsApp & Noticeboard Advisory */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#00FFC2]/50 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-neutral-400">
                [ READY-TO-SHARE ADVISORY ]
              </h4>
              <button
                type="button"
                onClick={() => {
                  void handleCopyNotice();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-[#00FFC2] transition-colors cursor-pointer"
                aria-label="Copy community advisory notice to clipboard"
              >
                {copied ? (
                  <CheckIcon className="w-3.5 h-3.5 text-[#00FFC2]" />
                ) : (
                  <CopyIcon className="w-3.5 h-3.5 text-[#00FFC2]" />
                )}
                <span>{copied ? 'Copied!' : 'Copy for WhatsApp'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-mono whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 leading-relaxed max-h-56 overflow-y-auto">
              {playbook.advisoryNoticeText}
            </pre>
          </div>
          <p className="text-[11px] font-mono text-neutral-500">
            Formatted for instant broadcast on WhatsApp groups, school parent channels, and society
            notice boards.
          </p>
        </div>
      </div>
    </div>
  );
};
