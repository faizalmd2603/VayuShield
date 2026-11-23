import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatAqi,
  formatCo2e,
  formatConcentration,
  formatPercentage,
  formatTimeHour,
} from '../utils/formatters';
import {
  clearSessionApiKey,
  DEFAULT_LIFESTYLE_PROFILE,
  getSessionApiKey,
  getStoredProfile,
  getStoredTheme,
  setSessionApiKey,
  setStoredProfile,
  setStoredTheme,
} from '../utils/storage';
import { generateMarkdownReport } from '../utils/exportReport';
import type { CombinedAirTelemetry } from '../types/airQuality';
import type { VayuShieldPlan } from '../types/gemini';
import type { AggregateImpactResult } from '../domain/impactCalculator';

describe('Formatters and Localization Utilities', () => {
  it('formats AQI values correctly with edge cases', () => {
    expect(formatAqi(152.4)).toBe('152');
    expect(formatAqi(152.6)).toBe('153');
    expect(formatAqi(NaN)).toBe('—');
    expect(formatAqi(-10)).toBe('—');
  });

  it('formats pollutant concentrations with units', () => {
    expect(formatConcentration(45.2)).toBe('45 µg/m³');
    expect(formatConcentration(10.8, 'ppm')).toBe('11 ppm');
    expect(formatConcentration(NaN)).toBe('— µg/m³');
    expect(formatConcentration(-5)).toBe('— µg/m³');
  });

  it('formats carbon equivalent metrics', () => {
    expect(formatCo2e(2.34)).toBe('2.3 kg CO₂e');
    expect(formatCo2e(NaN)).toBe('0.0 kg CO₂e');
    expect(formatCo2e(-1)).toBe('0.0 kg CO₂e');
  });

  it('formats ISO time strings gracefully', () => {
    const formatted = formatTimeHour('2026-11-23T14:30:00Z');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);

    expect(formatTimeHour('invalid-date')).toBe('invalid-date');
  });

  it('clamps and formats percentages [0, 100]', () => {
    expect(formatPercentage(55.4)).toBe('55%');
    expect(formatPercentage(-10)).toBe('0%');
    expect(formatPercentage(150)).toBe('100%');
  });
});

describe('Browser Storage Persistence Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('reads default profile when storage is empty or invalid', () => {
    expect(getStoredProfile()).toEqual(DEFAULT_LIFESTYLE_PROFILE);

    localStorage.setItem('vayushield_profile_v1', 'not-json');
    expect(getStoredProfile()).toEqual(DEFAULT_LIFESTYLE_PROFILE);

    localStorage.setItem('vayushield_profile_v1', JSON.stringify({ invalid: true }));
    expect(getStoredProfile()).toEqual(DEFAULT_LIFESTYLE_PROFILE);
  });

  it('persists and retrieves lifestyle profile accurately', () => {
    const custom = {
      ...DEFAULT_LIFESTYLE_PROFILE,
      familyMembersCount: 5,
      roomSizeSqMeters: 35,
    };
    setStoredProfile(custom);
    expect(getStoredProfile()).toEqual(custom);
  });

  it('manages theme preferences correctly', () => {
    expect(['light', 'dark']).toContain(getStoredTheme());

    setStoredTheme('dark');
    expect(getStoredTheme()).toBe('dark');

    setStoredTheme('light');
    expect(getStoredTheme()).toBe('light');
  });

  it('manages session-only API keys in sessionStorage strictly', () => {
    expect(getSessionApiKey()).toBeNull();

    setSessionApiKey('AIzaSyTest123');
    expect(getSessionApiKey()).toBe('AIzaSyTest123');

    // Confirm it never touched localStorage
    expect(localStorage.getItem('vayushield_session_key_v1')).toBeNull();

    clearSessionApiKey();
    expect(getSessionApiKey()).toBeNull();
  });
});

describe('Executive Markdown Report Exporter', () => {
  const sampleTelemetry: CombinedAirTelemetry = {
    location: { name: 'Delhi', latitude: 28.6, longitude: 77.2, country: 'India' },
    currentPollutants: {
      usAqi: 300,
      europeanAqi: 90,
      pm25: 150,
      pm10: 250,
      carbonMonoxide: 2.0,
      nitrogenDioxide: 50,
      sulphurDioxide: 15,
      ozone: 30,
      dust: 30,
      uvIndex: 3,
    },
    hourlyForecast: [],
    cpcbAqi: { aqi: 320, category: 'Very Poor', dominantPollutant: 'PM25', subIndices: { pm25: 320 } },
    grapStage: 'Stage II (Very Poor)',
    smogTrap: { riskLevel: 'Severe', boundaryLayerHeight: 200, windSpeed: 4, temperature: 15, explanation: 'Inversion' },
    safestVentilation: { startHour: '13:00', endHour: '15:00', averagePm25: 70, boundaryLayerHeight: 800, windSpeed: 10, isSafestWindow: true, rationale: 'Midday mixing' },
    lastUpdated: '2026-11-23T12:00:00Z',
  };

  const samplePlan: VayuShieldPlan = {
    generatedAt: '2026-11-23T12:00:00Z',
    locationName: 'Delhi',
    modelUsed: 'gemini-3.5-flash-lite',
    summaryAdvisory: 'Run purifiers continuously and wear N95 outdoors.',
    routines: [
      {
        id: 'r1',
        timeSlot: '07:00 - 09:00',
        periodLabel: 'Morning Peak',
        action: 'Seal balcony windows',
        whyNow: 'Low boundary layer',
        lowEmissionAlternative: 'Indoor workout',
        directImpact: { personalPm25ReductionUgm3: 80, co2eAvoidedKg: 0.5, healthBenefit: 'Protects lungs' },
      },
    ],
    indoorHacks: [
      {
        id: 'h1',
        category: 'Zero-Cost',
        title: 'Wet Mopping',
        description: 'Mop floors twice daily',
        directHealthImpact: 'Reduces resuspension',
        directEmissionImpact: 'Zero carbon cost',
        estimatedCost: '₹0',
        effortLevel: 'Low',
        achCadrImprovement: '+15% effective filtration',
      },
    ],
    communityPlaybook: {
      id: 'cp1',
      title: 'Apartment RWA Advisory',
      targetAudience: 'Residents',
      currentGrapContext: 'GRAP Stage II',
      actionChecklist: ['Ban leaf burning', 'Halt diesel gensets'],
      directCommunityImpact: 'Reduces 20 kg particulates',
      advisoryNoticeText: 'Please keep gates closed and carpool.',
    },
  };

  const sampleImpact: AggregateImpactResult = {
    checkedCount: 1,
    totalSteps: 1,
    personalPm25ReductionUgm3: 80,
    weeklyCo2eAvoidedKg: 3.5,
    communityPmPreventedGrams: 200,
    treeAbsorptionEquivalent: 0.8,
  };

  it('generates fully populated markdown report string', () => {
    const report = generateMarkdownReport(samplePlan, sampleTelemetry, sampleImpact);
    expect(report).toContain('# 🛡️ VayuShield Winter Smog Action Report');
    expect(report).toContain('Delhi, India');
    expect(report).toContain('CPCB NAQI 320');
    expect(report).toContain('Personal PM2.5 Inhalation Reduced');
    expect(report).toContain('Weekly Household CO₂e Avoided');
    expect(report).toContain('Community & Neighborhood Playbook');
    expect(report).toContain('Residents');
    expect(report).toContain('Ban leaf burning');
  });
});
