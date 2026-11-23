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

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-sky-500" />
            GenAI Action Planner
          </h2>
          <p className="text-xs text-slate-500">Grounded in live telemetry & personal lifestyle</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => { onSelectModel(e.target.value as GeminiModelName); }}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
            aria-label="Select Google Gemini Model"
          >
            <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Fast)</option>
            <option value="gemini-3.8-flash">gemini-3.8-flash (Deep)</option>
          </select>

          <button
            type="button"
            disabled={isGenerating}
            onClick={() => {
              if (!hasValidApiKey) {
                onRequestApiKey();
                return;
              }
              onGeneratePlan();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Plan...' : plan ? 'Regenerate Plan' : 'Generate Smog Defense Plan'}</span>
          </button>

          {plan && (
            <button
              type="button"
              onClick={onExport}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Download Markdown Report"
              aria-label="Download Markdown Report"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {genError && (
        <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs">
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
