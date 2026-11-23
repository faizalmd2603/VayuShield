import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { httpClient } from '../services/httpClient';

function toUrlString(url: RequestInfo | URL): string {
  if (typeof url === 'string') return url;
  if (url instanceof URL) return url.href;
  return url.url;
}

describe('VayuShield End-to-End Application Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    httpClient.clearCache();
    sessionStorage.clear();
    localStorage.clear();
  });

  const mockGeocodingResponse = {
    results: [
      {
        id: 1,
        name: 'New Delhi',
        latitude: 28.6139,
        longitude: 77.209,
        country: 'India',
        admin1: 'Delhi',
      },
    ],
  };

  const mockAirQualityResponse = {
    current: {
      us_aqi: 240,
      european_aqi: 80,
      pm2_5: 160,
      pm10: 240,
      carbon_monoxide: 1200,
      nitrogen_dioxide: 55,
      sulphur_dioxide: 18,
      ozone: 32,
      dust: 30,
      uv_index: 3.0,
    },
    hourly: {
      time: ['2026-11-23T12:00', '2026-11-23T13:00'],
      us_aqi: [240, 220],
      pm2_5: [160, 140],
      pm10: [240, 210],
      nitrogen_dioxide: [55, 50],
      ozone: [32, 35],
    },
  };

  const mockWeatherResponse = {
    current: {
      temperature_2m: 16,
      relative_humidity_2m: 70,
      wind_speed_10m: 4.5,
      boundary_layer_height: 220,
    },
    hourly: {
      time: ['2026-11-23T12:00', '2026-11-23T13:00'],
      temperature_2m: [16, 17],
      relative_humidity_2m: [70, 65],
      wind_speed_10m: [4.5, 6.0],
      boundary_layer_height: [220, 380],
    },
  };

  const mockPlanJson = JSON.stringify({
    summaryAdvisory: 'High thermal inversion trapping smog. Seal windows during morning hours.',
    routines: [
      {
        id: 'r-1',
        timeSlot: '07:00 - 09:00',
        periodLabel: 'Morning Peak',
        action: 'Operate HEPA filtration inside sealed living areas',
        whyNow: 'Boundary layer is at 220m; outdoor PM2.5 is 160 µg/m³',
        lowEmissionAlternative: 'Avoid outdoor brisk walking until inversion lifts',
        directImpact: {
          personalPm25ReductionUgm3: 110,
          co2eAvoidedKg: 0.2,
          healthBenefit: 'Lowers acute alveolar inflammation',
        },
      },
    ],
    indoorHacks: [
      {
        id: 'h-1',
        category: 'Zero-Cost',
        title: 'Microfiber Door Sealing',
        description: 'Block doorway gaps using draft stoppers',
        directHealthImpact: 'Cuts draft ingress by 30%',
        directEmissionImpact: 'Zero energy spent',
        estimatedCost: '$0',
        effortLevel: 'Low',
        achCadrImprovement: '+1.0 ACH equivalent',
      },
    ],
    communityPlaybook: {
      id: 'cp-1',
      title: 'Apartment RWA Advisory',
      targetAudience: 'Apartment Residents & Staff',
      currentGrapContext: 'GRAP Stage II Enforcement',
      actionChecklist: ['Enforce anti-idling at school bus stops'],
      directCommunityImpact: 'Reduces curb exposure by 40%',
      advisoryNoticeText: 'Attention residents: GRAP II active. Avoid diesel generator sets.',
    },
  });

  it('navigates initial onboarding state, searches city, and renders live telemetry', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo | URL) => {
      const u = toUrlString(url);
      if (u.includes('geocoding-api')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockGeocodingResponse),
        } as unknown as Response);
      }
      if (u.includes('air-quality-api')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockAirQualityResponse),
        } as unknown as Response);
      }
      if (u.includes('api.open-meteo.com/v1/forecast')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockWeatherResponse),
        } as unknown as Response);
      }
      return Promise.reject(new Error(`Unhandled URL: ${u}`));
    });

    render(<App />);

    // Verify initial clean onboarding state
    expect(screen.getByText('Welcome to VayuShield')).toBeInTheDocument();

    // Type in location search
    const searchInput = screen.getByLabelText('Search city or locality');
    await userEvent.type(searchInput, 'New Delhi');

    // Wait for debounced candidate dropdown
    const candidateBtn = await screen.findByRole('button', { name: /New Delhi/i });
    expect(candidateBtn).toBeInTheDocument();
    await userEvent.click(candidateBtn);

    // Verify live telemetry renders
    expect(await screen.findByText('Indian CPCB AQI')).toBeInTheDocument();
    expect(screen.getAllByText('160').length).toBeGreaterThan(0);
    expect(screen.getByText('Severe Smog Trap')).toBeInTheDocument();
  });

  it('configures Gemini API key and generates live smog action plan', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo | URL) => {
      const u = toUrlString(url);
      if (u.includes('geocoding-api')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockGeocodingResponse),
        } as unknown as Response);
      }
      if (u.includes('air-quality-api')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockAirQualityResponse),
        } as unknown as Response);
      }
      if (u.includes('api.open-meteo.com/v1/forecast')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockWeatherResponse),
        } as unknown as Response);
      }
      if (u.includes('generateContent')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              candidates: [{ content: { parts: [{ text: mockPlanJson }] } }],
            }),
        } as unknown as Response);
      }
      return Promise.reject(new Error(`Unhandled URL: ${u}`));
    });

    render(<App />);

    // Select location
    const searchInput = screen.getByLabelText('Search city or locality');
    await userEvent.type(searchInput, 'New Delhi');
    const candidateBtn = await screen.findByRole('button', { name: /New Delhi/i });
    await userEvent.click(candidateBtn);

    // Open Gemini API key modal
    const keyBtn = screen.getByLabelText('Configure Google Gemini API Key');
    await userEvent.click(keyBtn);

    const keyInput = screen.getByLabelText('API Key');
    await userEvent.type(keyInput, 'AIzaSyValidIntegrationKey');

    const verifyBtn = screen.getByRole('button', { name: 'Verify & Save' });
    await userEvent.click(verifyBtn);

    // Close modal if open
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Generate action plan
    const generateBtn = screen.getByRole('button', { name: 'Generate Smog Defense Plan' });
    await userEvent.click(generateBtn);

    // Verify generated plan
    expect(
      await screen.findByText('Operate HEPA filtration inside sealed living areas')
    ).toBeInTheDocument();
    expect(screen.getByText('Direct Choice Impact Scorecard')).toBeInTheDocument();

    // Switch tabs to Indoor Hacks
    const hacksTab = screen.getByRole('tab', { name: 'Indoor Hacks' });
    await userEvent.click(hacksTab);
    expect(await screen.findByText('Microfiber Door Sealing')).toBeInTheDocument();

    // Switch tabs to Community Playbook
    const communityTab = screen.getByRole('tab', { name: 'Community Playbook' });
    await userEvent.click(communityTab);
    expect(await screen.findByText('Apartment RWA Advisory')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Copy community advisory notice/i })
    ).toBeInTheDocument();

    // Switch tabs to Aero Physics Lab
    const physicsTab = screen.getByRole('tab', { name: 'Aero Physics Lab' });
    await userEvent.click(physicsTab);
    expect(await screen.findByText('Deterministic Indoor Aero-Physics Lab')).toBeInTheDocument();

    // Toggle routine check
    const routinesTab = screen.getByRole('tab', { name: 'Daily Routines' });
    await userEvent.click(routinesTab);
    const routineCheckbox = screen.getByRole('checkbox', { name: /Toggle action:/i });
    await userEvent.click(routineCheckbox); // Uncheck
    expect(
      within(screen.getByLabelText('Quantified Choice Impact Metrics')).getByText(
        '0 of 1 Actions Adopted'
      )
    ).toBeInTheDocument();
  });
});
