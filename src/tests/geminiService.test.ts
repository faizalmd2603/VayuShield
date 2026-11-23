import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateVayuShieldPlan,
  streamGeminiChat,
  verifyGeminiApiKey,
} from '../services/geminiService';
import { safeParseJsonPlan } from '../services/geminiSchemas';
import type { CombinedAirTelemetry } from '../types/airQuality';
import { GeminiApiError } from '../types/errors';
import type { LifestyleProfile } from '../types/profile';

function toUrlString(url: RequestInfo | URL): string {
  if (typeof url === 'string') return url;
  if (url instanceof URL) return url.href;
  return url.url;
}

describe('Google Gemini Integration Engine', () => {
  const dummyApiKey = 'AIzaSyTestApiKeySecret1234567890';

  const sampleTelemetry: CombinedAirTelemetry = {
    location: {
      name: 'Delhi NCR',
      latitude: 28.6,
      longitude: 77.2,
      country: 'India',
    },
    currentPollutants: {
      usAqi: 310,
      europeanAqi: 95,
      pm25: 180,
      pm10: 270,
      carbonMonoxide: 1.8,
      nitrogenDioxide: 65,
      sulphurDioxide: 20,
      ozone: 35,
      dust: 40,
      uvIndex: 4,
    },
    hourlyForecast: [],
    cpcbAqi: {
      aqi: 345,
      category: 'Very Poor',
      dominantPollutant: 'PM25',
      subIndices: { pm25: 345 },
    },
    grapStage: 'Stage II (Very Poor)',
    smogTrap: {
      riskLevel: 'Severe',
      boundaryLayerHeight: 180,
      windSpeed: 3.5,
      temperature: 14,
      explanation: 'Nocturnal winter inversion',
    },
    safestVentilation: {
      startHour: '13:00',
      endHour: '15:00',
      averagePm25: 65,
      boundaryLayerHeight: 850,
      windSpeed: 11,
      isSafestWindow: true,
      rationale: 'Adequate midday mixing',
    },
    lastUpdated: '2026-11-23T12:00:00Z',
  };

  const sampleProfile: LifestyleProfile = {
    familyMembersCount: 4,
    healthSensitivities: ['asthma', 'seniors'],
    housingType: 'high_rise_apartment',
    roomSizeSqMeters: 25,
    ceilingHeightMeters: 2.8,
    ventilationType: 'split_ac_no_fresh_air',
    purifierStatus: 'hepa_purifier_active',
    cookingFuel: 'piped_natural_gas',
    commuteMode: 'metro_subway',
    dailyCommuteKm: 25,
    budgetTier: 'budget_conscious',
    communityRole: 'apartment_rwa_member',
  };

  const validPlanJson = JSON.stringify({
    summaryAdvisory: 'Severe winter smog active. Run HEPA units on high and seal balcony doors.',
    routines: [
      {
        id: 'r-1',
        timeSlot: '06:30 - 08:30',
        periodLabel: 'Morning Peak',
        action: 'Close all east-facing ventilation slots',
        whyNow: 'Boundary layer is at 180m; outdoor PM2.5 is 180 µg/m³',
        lowEmissionAlternative: 'Shift exercise indoors with HEPA air filtration',
        directImpact: {
          personalPm25ReductionUgm3: 130,
          co2eAvoidedKg: 0.1,
          healthBenefit: 'Protects elderly family members and prevents bronchospasm',
        },
      },
    ],
    indoorHacks: [
      {
        id: 'h-1',
        category: 'Zero-Cost',
        title: 'Door Jamb Damp Towel Sealing',
        description: 'Place a damp microfiber towel along drafty outer door frames',
        directHealthImpact: 'Lowers particulate ingress by 35%',
        directEmissionImpact: 'Zero additional energy consumption',
        estimatedCost: 'Free ($0)',
        effortLevel: 'Low',
        achCadrImprovement: '+1.2 ACH effective infiltration barrier',
      },
    ],
    communityPlaybook: {
      id: 'cp-1',
      title: 'RWA Winter Smog Action Directive',
      targetAudience: 'Apartment RWA Members & Security Staff',
      currentGrapContext: 'GRAP Stage II Enforcement Active',
      actionChecklist: [
        'Halt diesel generators for non-emergency lifts',
        'Wet-mop basement parking ramps to curb resuspension',
      ],
      directCommunityImpact: 'Prevents 4.2 kg localized particulate resuspension daily',
      advisoryNoticeText:
        'Dear Residents: Stage II Smog Emergency Active. Please carpool and avoid DG sets.',
    },
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('passes API key strictly via x-goog-api-key header and never in URL', async () => {
    let capturedUrl = '';
    let capturedHeaders: HeadersInit | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
      (url: RequestInfo | URL, init?: RequestInit) => {
        capturedUrl = toUrlString(url);
        capturedHeaders = init?.headers;
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              candidates: [{ content: { parts: [{ text: validPlanJson }] } }],
            }),
        } as unknown as Response);
      }
    );

    await generateVayuShieldPlan({
      apiKey: dummyApiKey,
      telemetry: sampleTelemetry,
      profile: sampleProfile,
    });

    expect(capturedUrl).not.toContain(dummyApiKey);
    expect(capturedUrl).not.toContain('key=');
    expect(capturedHeaders).toHaveProperty('x-goog-api-key', dummyApiKey);
  });

  it('validates structured plan output and returns parsed VayuShieldPlan', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          candidates: [{ content: { parts: [{ text: validPlanJson }] } }],
        }),
    } as unknown as Response);

    const plan = await generateVayuShieldPlan({
      apiKey: dummyApiKey,
      telemetry: sampleTelemetry,
      profile: sampleProfile,
    });

    expect(plan.summaryAdvisory).toContain('Severe winter smog active');
    expect(plan.routines).toHaveLength(1);
    expect(plan.routines[0]?.directImpact.personalPm25ReductionUgm3).toBe(130);
    expect(plan.indoorHacks[0]?.category).toBe('Zero-Cost');
    expect(plan.communityPlaybook.targetAudience).toContain('RWA');
  });

  it('throws typed GeminiApiError when API key is invalid (401/403)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as unknown as Response);

    await expect(
      generateVayuShieldPlan({
        apiKey: 'bad_key',
        telemetry: sampleTelemetry,
        profile: sampleProfile,
      })
    ).rejects.toThrow(GeminiApiError);
  });

  it('retries on rate limit (429) and falls back to deep model', async () => {
    let callCount = 0;
    const requestedModels: string[] = [];

    vi.spyOn(globalThis, 'fetch').mockImplementation((url: RequestInfo | URL) => {
      callCount++;
      requestedModels.push(toUrlString(url));

      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
        } as unknown as Response);
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: validPlanJson }] } }],
          }),
      } as unknown as Response);
    });

    const plan = await generateVayuShieldPlan({
      apiKey: dummyApiKey,
      telemetry: sampleTelemetry,
      profile: sampleProfile,
    });

    expect(callCount).toBe(2);
    expect(requestedModels[0]).toContain('gemini-3.5-flash-lite');
    expect(requestedModels[1]).toContain('gemini-3.8-flash');
    expect(plan.routines).toHaveLength(1);
  });

  it('verifies Gemini API key connection test ping', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as unknown as Response);

    const isValid = await verifyGeminiApiKey('valid_key');
    expect(isValid).toBe(true);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as unknown as Response);

    const isInvalid = await verifyGeminiApiKey('invalid_key');
    expect(isInvalid).toBe(false);
  });

  it('streams copilot chat chunks via SSE and accumulates response', async () => {
    const sseStreamChunks = [
      'data: {"candidates":[{"content":{"parts":[{"text":"Hello! Based on current CPCB AQI "}]}}]}\n\n',
      'data: {"candidates":[{"content":{"parts":[{"text":"of 345, I suggest keeping purifiers on."}]}}]}\n\n',
      'data: [DONE]\n\n',
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < sseStreamChunks.length) {
          const chunkStr = sseStreamChunks[chunkIndex++];
          return Promise.resolve({
            done: false,
            value: new TextEncoder().encode(chunkStr),
          });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: {
        getReader: () => mockReader,
      },
    } as unknown as Response);

    const receivedChunks: string[] = [];
    const fullText = await streamGeminiChat({
      apiKey: dummyApiKey,
      messages: [{ id: '1', role: 'user', content: 'What should I do now?', timestamp: '12:00' }],
      telemetry: sampleTelemetry,
      profile: sampleProfile,
      onChunk: (chunk) => {
        receivedChunks.push(chunk);
      },
    });

    expect(receivedChunks).toHaveLength(2);
    expect(fullText).toContain('Hello! Based on current CPCB AQI of 345');
  });

  it('safely auto-repairs unclosed JSON and strips trailing commas', () => {
    const brokenJson = '{"summaryAdvisory": "Keep indoors", "routines": [{"id": "r1",}],';
    const parsed = safeParseJsonPlan(brokenJson) as {
      summaryAdvisory?: string;
      routines?: unknown[];
    };
    expect(parsed.summaryAdvisory).toBe('Keep indoors');
    expect(Array.isArray(parsed.routines)).toBe(true);
  });

  it('cascades stream to gemini-3.5-flash-lite when balanced model returns 503', async () => {
    const sseStreamChunks = [
      'data: {"candidates":[{"content":{"parts":[{"text":"Streamed via fallback lite model."}]}}]}\n\n',
      'data: [DONE]\n\n',
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < sseStreamChunks.length) {
          const chunkStr = sseStreamChunks[chunkIndex++];
          return Promise.resolve({
            done: false,
            value: new TextEncoder().encode(chunkStr),
          });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    // First call (gemini-3.5-flash) returns 503
    // Second call (gemini-3.5-flash-lite) returns 200
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: { getReader: () => mockReader },
      } as unknown as Response);

    const receivedChunks: string[] = [];
    const fullText = await streamGeminiChat({
      apiKey: dummyApiKey,
      model: 'gemini-3.5-flash',
      messages: [{ id: '1', role: 'user', content: 'Help!', timestamp: '12:00' }],
      telemetry: sampleTelemetry,
      profile: sampleProfile,
      onChunk: (chunk) => {
        receivedChunks.push(chunk);
      },
    });

    expect(receivedChunks).toHaveLength(1);
    expect(fullText).toContain('Streamed via fallback lite model.');
  });
});
