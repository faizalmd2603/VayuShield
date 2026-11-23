import { useState, useCallback, useMemo, useRef } from 'react';
import { API_CONFIG } from '../constants/apiConfig';
import {
  calculateCheckedRoutinesImpact,
  type AggregateImpactResult,
} from '../domain/impactCalculator';
import { generateVayuShieldPlan } from '../services/geminiService';
import type { CombinedAirTelemetry } from '../types/airQuality';
import { GeminiApiError } from '../types/errors';
import type { GeminiModelName, VayuShieldPlan } from '../types/gemini';
import type { LifestyleProfile } from '../types/profile';
import {
  clearSessionApiKey,
  getSessionApiKey,
  setSessionApiKey,
} from '../utils/storage';

export interface UseGeminiPlannerResult {
  readonly apiKey: string;
  readonly setApiKey: (key: string) => void;
  readonly clearApiKey: () => void;
  readonly hasValidApiKey: boolean;
  readonly selectedModel: GeminiModelName;
  readonly setSelectedModel: (model: GeminiModelName) => void;
  readonly plan: VayuShieldPlan | null;
  readonly isGenerating: boolean;
  readonly error: string | null;
  readonly checkedStepIds: ReadonlySet<string>;
  readonly toggleStep: (id: string) => void;
  readonly generatePlan: (
    telemetry: CombinedAirTelemetry,
    profile: LifestyleProfile
  ) => Promise<void>;
  readonly aggregateImpact: AggregateImpactResult;
}

/**
 * Resolves initial API key from environment variable or session storage.
 */
function resolveInitialApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();
  const sessionKey = getSessionApiKey();
  return sessionKey ?? '';
}

/**
 * Computes impact metrics from the current plan and checked steps.
 */
function computeAggregateImpact(
  plan: VayuShieldPlan | null,
  checkedStepIds: ReadonlySet<string>
): AggregateImpactResult {
  if (!plan) {
    return {
      checkedCount: 0,
      totalSteps: 0,
      personalPm25ReductionUgm3: 0,
      weeklyCo2eAvoidedKg: 0,
      communityPmPreventedGrams: 0,
      treeAbsorptionEquivalent: 0,
    };
  }
  return calculateCheckedRoutinesImpact(plan.routines, checkedStepIds, {
    commuteMode: 'metro_subway',
    dailyCommuteKm: 20,
  });
}

/**
 * Sub-hook for managing API key persistence and validation state.
 */
export function useApiKeyManager(): {
  readonly apiKey: string;
  readonly setApiKey: (key: string) => void;
  readonly clearApiKey: () => void;
} {
  const [apiKey, setApiKeyState] = useState<string>(resolveInitialApiKey);

  const setApiKey = useCallback((key: string): void => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    setSessionApiKey(trimmed);
  }, []);

  const clearApiKey = useCallback((): void => {
    setApiKeyState('');
    clearSessionApiKey();
  }, []);

  return { apiKey, setApiKey, clearApiKey };
}

/**
 * Hook orchestrating GenAI action plan creation, model selection, and choice impact math.
 */
export function useGeminiPlanner(): UseGeminiPlannerResult {
  const { apiKey, setApiKey, clearApiKey } = useApiKeyManager();
  const [selectedModel, setSelectedModel] = useState<GeminiModelName>(
    API_CONFIG.GEMINI.MODELS.PRIMARY
  );
  const [plan, setPlan] = useState<VayuShieldPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedStepIds, setCheckedStepIds] = useState<ReadonlySet<string>>(
    () => new Set<string>()
  );

  const abortRef = useRef<AbortController | null>(null);

  const toggleStep = useCallback((id: string): void => {
    setCheckedStepIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const generatePlan = useCallback(
    async (
      telemetry: CombinedAirTelemetry,
      profile: LifestyleProfile
    ): Promise<void> => {
      if (!apiKey) {
        setError('Please configure your Google Gemini API Key first.');
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsGenerating(true);
      setError(null);

      try {
        const result = await generateVayuShieldPlan({
          apiKey,
          telemetry,
          profile,
          model: selectedModel,
          signal: controller.signal,
        });
        setPlan(result);
        setCheckedStepIds(new Set(result.routines.map((r) => r.id)));
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof GeminiApiError
            ? err.message
            : 'Plan generation failed. Please check API key and try again.'
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [apiKey, selectedModel]
  );

  const aggregateImpact = useMemo(
    () => computeAggregateImpact(plan, checkedStepIds),
    [plan, checkedStepIds]
  );

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    hasValidApiKey: Boolean(apiKey.trim()),
    selectedModel,
    setSelectedModel,
    plan,
    isGenerating,
    error,
    checkedStepIds,
    toggleStep,
    generatePlan,
    aggregateImpact,
  };
}
