import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { ApiKeyModal } from '../components/common/ApiKeyModal';
import { Header } from '../components/common/Header';
import { SkipLink } from '../components/common/SkipLink';
import { StatusBanner } from '../components/common/StatusBanner';
import { WelcomeHero } from '../components/common/WelcomeHero';
import { LiveTelemetryGrid } from '../components/location/LiveTelemetryGrid';
import type { CombinedAirTelemetry } from '../types/airQuality';

describe('WCAG 2.1 AA Accessibility & Keyboard Suite', () => {
  const sampleTelemetry: CombinedAirTelemetry = {
    location: { name: 'London', latitude: 51.5, longitude: -0.1, country: 'UK' },
    currentPollutants: {
      usAqi: 45,
      europeanAqi: 20,
      pm25: 11,
      pm10: 18,
      carbonMonoxide: 0.3,
      nitrogenDioxide: 22,
      sulphurDioxide: 5,
      ozone: 40,
      dust: 8,
      uvIndex: 1.5,
    },
    hourlyForecast: [],
    cpcbAqi: {
      aqi: 45,
      category: 'Good',
      dominantPollutant: 'O3',
      subIndices: { o3: 45 },
    },
    grapStage: 'None',
    smogTrap: {
      riskLevel: 'Low',
      boundaryLayerHeight: 850,
      windSpeed: 14,
      temperature: 12,
      explanation: 'Optimal vertical dispersion',
    },
    safestVentilation: {
      startHour: '12:00',
      endHour: '14:00',
      averagePm25: 9,
      boundaryLayerHeight: 900,
      windSpeed: 15,
      isSafestWindow: true,
      rationale: 'Clean midday window',
    },
    lastUpdated: '2026-11-23T12:00:00Z',
  };

  it('renders SkipLink without accessibility violations', async () => {
    const { container } = render(<SkipLink />);
    expect(await axe(container)).toHaveNoViolations();
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('renders Header without accessibility violations', async () => {
    const { container } = render(
      <Header
        locationName="London"
        hasValidKey={true}
        theme="light"
        onToggleTheme={vi.fn()}
        onOpenApiKeyModal={vi.fn()}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders WelcomeHero without accessibility violations', async () => {
    const { container } = render(<WelcomeHero />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders StatusBanner and TelemetryGrid with zero axe violations', async () => {
    const { container: bannerCont } = render(<StatusBanner telemetry={sampleTelemetry} />);
    expect(await axe(bannerCont)).toHaveNoViolations();

    const { container: gridCont } = render(<LiveTelemetryGrid telemetry={sampleTelemetry} />);
    expect(await axe(gridCont)).toHaveNoViolations();
  });

  it('handles ApiKeyModal keyboard dismissal via Escape key', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <ApiKeyModal
        isOpen={true}
        currentKey=""
        onClose={onClose}
        onSaveKey={vi.fn()}
        onClearKey={vi.fn()}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles theme correctly via header theme button and is accessible', async () => {
    let currentTheme: 'light' | 'dark' = 'light';
    const onToggle = vi.fn(() => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    });

    const { rerender, container } = render(
      <Header
        locationName="London"
        hasValidKey={true}
        theme={currentTheme}
        onToggleTheme={onToggle}
        onOpenApiKeyModal={vi.fn()}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: 'Switch to Dark Mode' });
    expect(toggleBtn).toBeInTheDocument();
    await userEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(
      <Header
        locationName="London"
        hasValidKey={true}
        theme="dark"
        onToggleTheme={onToggle}
        onOpenApiKeyModal={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Switch to Light Mode' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
