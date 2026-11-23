import React, { useState } from 'react';
import type { AggregateImpactResult } from '../../domain/impactCalculator';
import type { CombinedAirTelemetry } from '../../types/airQuality';
import type { GeminiModelName, VayuShieldPlan } from '../../types/gemini';
import type { LifestyleProfile } from '../../types/profile';
import { AppTabs, type TabId } from '../common/AppTabs';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { SmogCopilotChat } from '../copilot/SmogCopilotChat';
import { DownloadIcon, SparklesIcon } from '../icons/Icons';
import { LifestyleProfileForm } from '../profile/LifestyleProfileForm';
import { CommunityPlaybookView } from './CommunityPlaybookView';
import { ImpactSummaryBar } from './ImpactSummaryBar';
import { IndoorHacksView } from './IndoorHacksView';
import { IndoorPhysicsLab } from './IndoorPhysicsLab';
import { RoutineTimelineView } from './RoutineTimelineView';

interface Props {
  readonly telemetry: CombinedAirTelemetry;
  readonly profile: LifestyleProfile;
  readonly onUpdateProfile: (p: Partial<LifestyleProfile>) => void;
  readonly onResetProfile: () => void;
  readonly apiKey: string;
  readonly hasValidApiKey: boolean;
  readonly onRequestApiKey: () => void;
  readonly selectedModel: GeminiModelName;
  readonly onSelectModel: (m: GeminiModelName) => void;
  readonly plan: VayuShieldPlan | null;
  readonly isGenerating: boolean;
  readonly genError: string | null;
  readonly onGeneratePlan: () => void;
  readonly checkedStepIds: ReadonlySet<string>;
  readonly onToggleStep: (id: string) => void;
  readonly aggregateImpact: AggregateImpactResult;
  readonly onExport: () => void;
}

const ActivePanel: React.FC<{
  readonly tab: TabId;
  readonly plan: VayuShieldPlan;
  readonly telemetry: CombinedAirTelemetry;
  readonly profile: LifestyleProfile;
  readonly checkedStepIds: ReadonlySet<string>;
  readonly onToggleStep: (id: string) => void;
  readonly apiKey: string;
  readonly selectedModel: GeminiModelName;
  readonly onUpdateProfile: (p: Partial<LifestyleProfile>) => void;
  readonly onResetProfile: () => void;
}> = (props) => {
  const { tab, plan, telemetry, profile, checkedStepIds, onToggleStep, apiKey, selectedModel, onUpdateProfile, onResetProfile } = props;
  if (tab === 'routines') return <RoutineTimelineView routines={plan.routines} checkedStepIds={checkedStepIds} onToggleStep={onToggleStep} />;
  if (tab === 'hacks') return <IndoorHacksView hacks={plan.indoorHacks} />;
  if (tab === 'community') return <CommunityPlaybookView playbook={plan.communityPlaybook} />;
  if (tab === 'physics') return <IndoorPhysicsLab telemetry={telemetry} profile={profile} />;
  if (tab === 'copilot') return <SmogCopilotChat apiKey={apiKey} telemetry={telemetry} profile={profile} selectedModel={selectedModel} />;
  return <LifestyleProfileForm profile={profile} onUpdateProfile={onUpdateProfile} onReset={onResetProfile} />;
};

interface HeaderControlProps {
  readonly selectedModel: GeminiModelName;
  readonly onSelectModel: (m: GeminiModelName) => void;
  readonly isGenerating: boolean;
  readonly hasPlan: boolean;
  readonly onGenerateClick: () => void;
  readonly onExport: () => void;
}

const PlannerHeaderControls: React.FC<HeaderControlProps> = ({
  selectedModel,
  onSelectModel,
  isGenerating,
  hasPlan,
  onGenerateClick,
  onExport,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <div className="flex items-center gap-2">
        <SparklesIcon className="w-4 h-4 text-[#00FFC2]" />
        <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
          [ 03 // GENAI ACTION PLANNER ]
        </h2>
      </div>
      <p className="text-xs text-neutral-500 font-mono mt-0.5">GROUNDED IN LIVE TELEMETRY &amp; HOUSEHOLD PROFILE</p>
    </div>

    <div className="flex items-center gap-2">
      <select
        value={selectedModel}
        onChange={(e) => { onSelectModel(e.target.value as GeminiModelName); }}
        className="px-3 py-2 text-xs font-mono rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer"
        aria-label="Select Google Gemini Model"
      >
        <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Fast)</option>
        <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced)</option>
        <option value="gemini-3.8-flash">gemini-3.8-flash (Deep)</option>
        <option value="gemini-4-hydrogen">gemini-4-hydrogen (Preview)</option>
      </select>

      <button
        type="button"
        disabled={isGenerating}
        onClick={onGenerateClick}
        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00FFC2] hover:bg-[#00e6ae] text-black text-xs font-mono font-bold tracking-wider uppercase shadow-md shadow-[#00FFC2]/20 transition-all cursor-pointer disabled:opacity-50"
      >
        <SparklesIcon className="w-3.5 h-3.5 text-black" />
        <span>{isGenerating ? 'Generating...' : hasPlan ? 'Regenerate Plan' : 'Generate Smog Defense Plan'}</span>
      </button>

      {hasPlan && (
        <button
          type="button"
          onClick={onExport}
          className="p-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-[#00FFC2] text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
          title="Download Markdown Report"
          aria-label="Download Markdown Report"
        >
          <DownloadIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

/**
 * GenAI Action Planner Container and Multi-Tab Workspace.
 */
export const PlannerWorkspace: React.FC<Props> = (props) => {
  const [activeTab, setActiveTab] = useState<TabId>('routines');
  const {
    telemetry, profile, onUpdateProfile, onResetProfile,
    apiKey, hasValidApiKey, onRequestApiKey,
    selectedModel, onSelectModel,
    plan, isGenerating, genError, onGeneratePlan,
    checkedStepIds, onToggleStep, aggregateImpact, onExport,
  } = props;

  const handleGenerateClick = (): void => {
    if (!hasValidApiKey) {
      onRequestApiKey();
      return;
    }
    onGeneratePlan();
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 backdrop-blur-md">
      <PlannerHeaderControls
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
        isGenerating={isGenerating}
        hasPlan={Boolean(plan)}
        onGenerateClick={handleGenerateClick}
        onExport={onExport}
      />

      {genError && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs font-mono">
          {genError}
        </div>
      )}

      {isGenerating && <LoadingSkeleton count={2} heightClass="h-28" />}

      {plan && (
        <div className="space-y-5">
          <ImpactSummaryBar impact={aggregateImpact} />
          <AppTabs activeTab={activeTab} onChangeTab={setActiveTab} />
          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
            <ActivePanel
              tab={activeTab} plan={plan} telemetry={telemetry} profile={profile}
              checkedStepIds={checkedStepIds} onToggleStep={onToggleStep}
              apiKey={apiKey} selectedModel={selectedModel}
              onUpdateProfile={onUpdateProfile} onResetProfile={onResetProfile}
            />
          </div>
        </div>
      )}
    </div>
  );
};
