import React from 'react';

export type TabId = 'routines' | 'hacks' | 'community' | 'physics' | 'copilot' | 'profile';

interface Props {
  readonly activeTab: TabId;
  readonly onChangeTab: (tab: TabId) => void;
}

const TABS: readonly { id: TabId; label: string }[] = [
  { id: 'routines', label: 'Daily Routines' },
  { id: 'hacks', label: 'Indoor Hacks' },
  { id: 'community', label: 'Community Playbook' },
  { id: 'physics', label: 'Aero Physics Lab' },
  { id: 'copilot', label: 'Smog Copilot' },
  { id: 'profile', label: 'Family Profile' },
];

/**
 * WAI-ARIA Accessible Tab Navigation Header.
 */
export const AppTabs: React.FC<Props> = ({ activeTab, onChangeTab }) => {
  return (
    <nav aria-label="Application Sections" className="border-b border-slate-200 dark:border-slate-800">
      <div role="tablist" className="flex items-center gap-1 overflow-x-auto py-2 -mb-px">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => { onChangeTab(tab.id); }}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
