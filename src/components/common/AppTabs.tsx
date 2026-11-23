import React from 'react';

export type TabId = 'routines' | 'hacks' | 'community' | 'physics' | 'copilot' | 'profile';

interface Props {
  readonly activeTab: TabId;
  readonly onChangeTab: (tab: TabId) => void;
}

const TABS: readonly { id: TabId; label: string; code: string }[] = [
  { id: 'routines', label: 'Daily Routines', code: '01' },
  { id: 'hacks', label: 'Indoor Hacks', code: '02' },
  { id: 'community', label: 'Community Playbook', code: '03' },
  { id: 'physics', label: 'Aero Physics Lab', code: '04' },
  { id: 'copilot', label: 'Smog Copilot', code: '05' },
  { id: 'profile', label: 'Family Profile', code: '06' },
];

/**
 * WAI-ARIA Accessible Tab Navigation Header in NK Studio editorial layout.
 */
export const AppTabs: React.FC<Props> = ({ activeTab, onChangeTab }) => {
  return (
    <nav
      aria-label="Application Sections"
      className="border-b border-neutral-200 dark:border-neutral-800/80"
    >
      <div role="tablist" className="flex items-center gap-2 overflow-x-auto py-2 -mb-px">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={isActive}
              aria-label={tab.label}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                onChangeTab(tab.id);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold border border-neutral-700 dark:border-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800'
              }`}
            >
              <span className={`text-[10px] ${isActive ? 'text-[#00FFC2]' : 'text-neutral-400'}`}>
                {tab.code}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
