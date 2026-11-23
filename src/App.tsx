import React, { useState, useEffect } from 'react';
import { ApiKeyModal } from './components/common/ApiKeyModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/common/Header';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { SkipLink } from './components/common/SkipLink';
import { StatusBanner } from './components/common/StatusBanner';
import { WelcomeHero } from './components/common/WelcomeHero';
import { HourlyForecastChart } from './components/location/HourlyForecastChart';
import { LiveTelemetryGrid } from './components/location/LiveTelemetryGrid';
import { LocationSearchBar } from './components/location/LocationSearchBar';
import { PlannerWorkspace } from './components/planner/PlannerWorkspace';
import type { AggregateImpactResult } from './domain/impactCalculator';
import { useGeminiPlanner } from './hooks/useGeminiPlanner';
import { useLifestyleProfile } from './hooks/useLifestyleProfile';
import { useLiveAirQuality } from './hooks/useLiveAirQuality';
import type { CombinedAirTelemetry } from './types/airQuality';
import type { VayuShieldPlan } from './types/gemini';
import { generateMarkdownReport } from './utils/exportReport';
import { getStoredTheme, setStoredTheme } from './utils/storage';

function useThemeSync(): [theme: 'light' | 'dark', toggleTheme: () => void] {
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    setStoredTheme(theme);
  }, [theme]);

  return [theme, () => { setTheme((t) => (t === 'light' ? 'dark' : 'light')); }];
}

function exportPlanReport(plan: VayuShieldPlan, telemetry: CombinedAirTelemetry, impact: AggregateImpactResult): void {
  const md = generateMarkdownReport(plan, telemetry, impact);
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VayuShield-${telemetry.location.name}-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export const App: React.FC = () => {
  const [theme, toggleTheme] = useThemeSync();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const { location, telemetry, isLoading: isAqLoading, error: aqError, selectLocation } = useLiveAirQuality();
  const { profile, updateProfile, resetProfile } = useLifestyleProfile();
  const {
    apiKey, setApiKey, clearApiKey, hasValidApiKey,
    selectedModel, setSelectedModel,
    plan, isGenerating, error: genError,
    checkedStepIds, toggleStep, generatePlan, aggregateImpact,
  } = useGeminiPlanner();

  const handleExport = (): void => {
    if (plan && telemetry) exportPlanReport(plan, telemetry, aggregateImpact);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-50 text-neutral-950 dark:bg-[#070708] dark:text-neutral-100 transition-colors font-sans antialiased">
        <SkipLink />
        <Header
          locationName={telemetry?.location.name}
          hasValidKey={hasValidApiKey}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenApiKeyModal={() => { setIsKeyModalOpen(true); }}
        />

        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <LocationSearchBar onSelectLocation={selectLocation} selectedLocation={location} />

          {aqError && (
            <div role="alert" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-sm">
              {aqError}
            </div>
          )}

          {isAqLoading && <LoadingSkeleton count={3} />}

          {telemetry && (
            <>
              <StatusBanner telemetry={telemetry} />
              <LiveTelemetryGrid telemetry={telemetry} />
              <HourlyForecastChart hourly={telemetry.hourlyForecast} />

              <PlannerWorkspace
                telemetry={telemetry} profile={profile}
                onUpdateProfile={updateProfile} onResetProfile={resetProfile}
                apiKey={apiKey} hasValidApiKey={hasValidApiKey}
                onRequestApiKey={() => { setIsKeyModalOpen(true); }}
                selectedModel={selectedModel} onSelectModel={setSelectedModel}
                plan={plan} isGenerating={isGenerating} genError={genError}
                onGeneratePlan={() => { void generatePlan(telemetry, profile); }}
                checkedStepIds={checkedStepIds} onToggleStep={toggleStep}
                aggregateImpact={aggregateImpact} onExport={handleExport}
              />
            </>
          )}

          {!location && !isAqLoading && <WelcomeHero />}
        </main>

        <ApiKeyModal
          isOpen={isKeyModalOpen}
          currentKey={apiKey}
          onClose={() => { setIsKeyModalOpen(false); }}
          onSaveKey={(k) => { setApiKey(k); setIsKeyModalOpen(false); }}
          onClearKey={clearApiKey}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
