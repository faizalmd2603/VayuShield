import { API_CONFIG } from '../constants/apiConfig';
import type { CombinedAirTelemetry } from '../types/airQuality';
import { GeminiApiError } from '../types/errors';
import type { ChatMessage, GeminiModelName, VayuShieldPlan } from '../types/gemini';
import type { LifestyleProfile } from '../types/profile';
import { isValidVayuShieldPlan, VAYUSHIELD_PLAN_RESPONSE_SCHEMA } from './geminiSchemas';
import { callOpenRouterCompletion, streamOpenRouterChat } from './openRouterService';
import { sanitizeUserInput } from './sanitizer';

export interface PlanGenerationRequest {
  readonly apiKey: string;
  readonly backupApiKey?: string;
  readonly openRouterApiKey?: string;
  readonly telemetry: CombinedAirTelemetry;
  readonly profile: LifestyleProfile;
  readonly model?: GeminiModelName;
  readonly signal?: AbortSignal;
}

export interface ChatStreamRequest {
  readonly apiKey: string;
  readonly backupApiKey?: string;
  readonly openRouterApiKey?: string;
  readonly messages: readonly ChatMessage[];
  readonly telemetry: CombinedAirTelemetry;
  readonly profile: LifestyleProfile;
  readonly onChunk: (chunk: string) => void;
  readonly model?: GeminiModelName;
  readonly signal?: AbortSignal;
}

/**
 * Builds the context-injected prompt for structured plan generation.
 */
function buildPlanPrompt(telemetry: CombinedAirTelemetry, profile: LifestyleProfile): string {
  const p = telemetry.currentPollutants;
  const sens = profile.healthSensitivities.join(', ');
  const ventWin = telemetry.safestVentilation
    ? `${telemetry.safestVentilation.startHour} to ${telemetry.safestVentilation.endHour} (Avg PM2.5: ${telemetry.safestVentilation.averagePm25} µg/m³)`
    : 'None identified';

  return `You are VayuShield, an expert GenAI Urban Air Quality & Winter Smog Assistant.
Generate a structured, hyper-personalized winter smog action plan for BOTH families and communities navigating severe smog.

LIVE ENVIRONMENTAL TELEMETRY:
- Location: ${telemetry.location.name}, ${telemetry.location.country}
- CPCB AQI: ${telemetry.cpcbAqi.aqi} (${telemetry.cpcbAqi.category}), Dominant: ${telemetry.cpcbAqi.dominantPollutant}
- GRAP Status: ${telemetry.grapStage}
- Ambient Pollutants: PM2.5: ${p.pm25} µg/m³, PM10: ${p.pm10} µg/m³, NO2: ${p.nitrogenDioxide} µg/m³, O3: ${p.ozone} µg/m³, CO: ${p.carbonMonoxide} mg/m³
- Smog Trap Risk: ${telemetry.smogTrap.riskLevel} (${telemetry.smogTrap.explanation})
- Safest Ventilation Window: ${ventWin}

USER LIFESTYLE & COMMUNITY PROFILE:
- Family Members: ${profile.familyMembersCount}, Health Sensitivities: ${sens}
- Housing: ${profile.housingType}, Ventilation: ${profile.ventilationType}, Purifier: ${profile.purifierStatus}
- Cooking Fuel: ${profile.cookingFuel}, Commute: ${profile.commuteMode} (${profile.dailyCommuteKm} km/day)
- Budget Tier: ${profile.budgetTier}, Community Role: ${profile.communityRole}

CRITICAL RULES:
1. Provide realistic, quantified direct health impacts (e.g. personal PM2.5 reduction in µg/m³) and environmental savings (kg CO2e avoided).
2. Ground all routine timings in the live hourly curve and safest ventilation window.
3. Indoor hacks must include low-cost DIY options (e.g. Corsi-Rosenthal boxes), appliance tuning, and zero-cost behaviors.
4. Community playbook must address the user's community role (${profile.communityRole}) and live GRAP stage (${telemetry.grapStage}).`;
}

/**
 * Verifies a Google Gemini API key by sending a lightweight test request.
 *
 * @param apiKey Google Gemini API Key
 * @returns True if the key is valid and connected
 */
export async function verifyGeminiApiKey(apiKey: string): Promise<boolean> {
  const trimmed = apiKey.trim();
  if (!trimmed) return false;

  const url = `${API_CONFIG.GEMINI.BASE_URL}/${API_CONFIG.GEMINI.MODELS.PRIMARY}:generateContent`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': trimmed,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 2 },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Executes a single REST call to Gemini generateContent with timeout and headers.
 */
async function callGeminiRest(
  model: GeminiModelName,
  apiKey: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Response> {
  const url = `${API_CONFIG.GEMINI.BASE_URL}/${model}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, API_CONFIG.GEMINI.TIMEOUT_MS);

  if (signal) {
    signal.addEventListener('abort', () => {
      controller.abort();
    }, { once: true });
  }

  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Maps HTTP response status to typed GeminiApiError.
 */
function handleGeminiErrorStatus(status: number): GeminiApiError {
  if (status === 401 || status === 403) {
    return new GeminiApiError(
      'Invalid Gemini API Key. Please verify your key at Google AI Studio.',
      'INVALID_KEY',
      false
    );
  }
  if (status === 429) {
    return new GeminiApiError(
      'Gemini API rate limit exceeded. Please try again shortly.',
      'RATE_LIMITED',
      true
    );
  }
  if (status === 503) {
    return new GeminiApiError(
      'Gemini API is temporarily experiencing high demand (HTTP 503). Engaging resilience fallback...',
      'TIMEOUT',
      true
    );
  }
  return new GeminiApiError(`Gemini API Error (HTTP ${status})`, 'TIMEOUT', true);
}

/**
 * Tries a single model candidate with backoff.
 */
async function attemptSingleModel(
  model: GeminiModelName,
  apiKey: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Response | null> {
  for (let attempt = 0; attempt <= 1; attempt++) {
    if (signal?.aborted) {
      throw new GeminiApiError('Request was aborted', 'ABORTED', true);
    }
    const res = await callGeminiRest(model, apiKey, payload, signal);
    if (res.ok) return res;

    const err = handleGeminiErrorStatus(res.status);
    if (!err.recoverable) throw err;
    if (res.status === 503 || res.status === 429) return null;

    const delay = API_CONFIG.GEMINI.BACKOFF_BASE_MS * Math.pow(2, attempt);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return null;
}

/**
 * Calls Gemini with automatic retry, exponential backoff, and model fallback.
 */
async function callWithRetryAndFallback(
  initialModel: GeminiModelName,
  apiKey: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Response> {
  const modelsToTry: readonly GeminiModelName[] = [
    initialModel,
    API_CONFIG.GEMINI.MODELS.PRIMARY,
    API_CONFIG.GEMINI.MODELS.DEEP,
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  for (const model of modelsToTry) {
    try {
      const res = await attemptSingleModel(model, apiKey, payload, signal);
      if (res) return res;
    } catch (err: unknown) {
      if (err instanceof GeminiApiError && !err.recoverable) throw err;
    }
  }

  throw new GeminiApiError(
    'Gemini API is temporarily experiencing high demand (HTTP 503). Engaging resilience fallback...',
    'TIMEOUT',
    true
  );
}

/**
 * Parses and validates raw Gemini text output into a typed VayuShieldPlan.
 */
function parseAndValidatePlan(
  textOutput: string | undefined,
  locationName: string,
  modelUsed: string
): VayuShieldPlan {
  if (!textOutput) {
    throw new GeminiApiError('Gemini returned an empty response', 'SCHEMA_INVALID');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textOutput);
  } catch {
    throw new GeminiApiError(
      'Failed to parse JSON response from Gemini',
      'SCHEMA_INVALID'
    );
  }

  if (!isValidVayuShieldPlan(parsed)) {
    throw new GeminiApiError(
      'Gemini response failed runtime schema validation',
      'SCHEMA_INVALID'
    );
  }

  return {
    ...parsed,
    generatedAt: new Date().toISOString(),
    locationName,
    modelUsed,
  };
}

async function callPlanAttempt(
  model: GeminiModelName,
  key: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal
): Promise<string | undefined> {
  const res = await callWithRetryAndFallback(model, key, payload, signal);
  const data = (await res.json()) as {
    candidates?: readonly { content?: { parts?: readonly { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

async function tryBackupKeyOrOpenRouter(
  _model: GeminiModelName,
  payload: Record<string, unknown>,
  request: PlanGenerationRequest,
  promptText: string
): Promise<{ readonly text: string | undefined; readonly modelUsed: string } | null> {
  // 1. Secondary Alternative: OpenRouter (free tier resilient model)
  if (request.openRouterApiKey) {
    try {
      const openRouterText = await callOpenRouterCompletion({
        apiKey: request.openRouterApiKey,
        prompt: promptText,
        signal: request.signal,
      });
      return { text: openRouterText, modelUsed: 'openrouter/free' };
    } catch {
      // OpenRouter error, cascade to backup Gemini key
    }
  }

  // 2. Safety Fallback: Gemini Backup Key on fast lite model
  if (request.backupApiKey && request.backupApiKey !== request.apiKey) {
    try {
      const text = await callPlanAttempt(
        API_CONFIG.GEMINI.MODELS.PRIMARY,
        request.backupApiKey,
        payload,
        request.signal
      );
      return { text, modelUsed: `${API_CONFIG.GEMINI.MODELS.PRIMARY} (backup-key)` };
    } catch {
      // Fallback failed
    }
  }

  return null;
}

/**
 * Executes structured plan generation with multi-key and OpenRouter fallback.
 */
async function executePlanWithFallback(
  model: GeminiModelName,
  payload: Record<string, unknown>,
  request: PlanGenerationRequest,
  promptText: string
): Promise<{ readonly text: string | undefined; readonly modelUsed: string }> {
  try {
    const text = await callPlanAttempt(model, request.apiKey, payload, request.signal);
    return { text, modelUsed: model };
  } catch (err: unknown) {
    const fallback = await tryBackupKeyOrOpenRouter(model, payload, request, promptText);
    if (fallback) return fallback;
    throw err;
  }
}

/**
 * Generates a complete VayuShield structured action plan via Gemini or fallback providers.
 *
 * @param request Configuration and telemetry request
 * @returns Fully typed and validated VayuShieldPlan
 */
export async function generateVayuShieldPlan(
  request: PlanGenerationRequest
): Promise<VayuShieldPlan> {
  const {
    telemetry,
    profile,
    model = API_CONFIG.GEMINI.MODELS.PRIMARY,
  } = request;

  const promptText = buildPlanPrompt(telemetry, profile);
  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: VAYUSHIELD_PLAN_RESPONSE_SCHEMA,
      temperature: API_CONFIG.GEMINI.TEMPERATURE,
    },
  };

  const outcome = await executePlanWithFallback(model, payload, request, promptText);
  return parseAndValidatePlan(outcome.text, telemetry.location.name, outcome.modelUsed);
}

interface SsePayload {
  readonly candidates?: readonly {
    readonly content?: {
      readonly parts?: readonly {
        readonly text?: string;
      }[];
    };
  }[];
}

/**
 * Safely parses candidate text from an SSE payload object.
 */
function parseCandidateText(parsed: SsePayload): string | null {
  const candidate = parsed.candidates?.[0];
  const part = candidate?.content?.parts?.[0];
  return typeof part?.text === 'string' ? part.text : null;
}

/**
 * Extracts candidate text from a single SSE data line.
 */
function extractSseText(line: string): string | null {
  if (!line.startsWith('data: ')) return null;
  const payload = line.slice(6).trim();
  if (!payload || payload === '[DONE]') return null;

  try {
    return parseCandidateText(JSON.parse(payload) as SsePayload);
  } catch {
    return null;
  }
}

async function obtainStreamResponse(
  url: string,
  body: string,
  systemContext: string,
  request: ChatStreamRequest
): Promise<Response | string> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': request.apiKey },
      body,
      signal: request.signal,
    });
    if (res.ok) return res;
    throw handleGeminiErrorStatus(res.status);
  } catch (err: unknown) {
    if (request.openRouterApiKey) {
      try {
        return await streamOpenRouterChat({
          apiKey: request.openRouterApiKey,
          systemPrompt: systemContext,
          messages: request.messages,
          onChunk: request.onChunk,
          signal: request.signal,
        });
      } catch {
        // OpenRouter failed or 402, cascade to backup Gemini key
      }
    }

    if (request.backupApiKey && request.backupApiKey !== request.apiKey) {
      const fallbackUrl = `${API_CONFIG.GEMINI.BASE_URL}/${API_CONFIG.GEMINI.MODELS.PRIMARY}:streamGenerateContent?alt=sse`;
      const backupRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': request.backupApiKey },
        body,
        signal: request.signal,
      });
      if (backupRes.ok) return backupRes;
    }

    throw err;
  }
}

async function consumeSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (chunk: string) => void
): Promise<string> {
  const decoder = new TextDecoder();
  let fullAccumulated = '';
  let buffer = '';
  let isDone = false;

  while (!isDone) {
    const result = await reader.read();
    isDone = result.done;
    if (!result.value) continue;

    buffer += decoder.decode(result.value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const text = extractSseText(line);
      if (!text) continue;
      fullAccumulated += text;
      onChunk(text);
    }
  }

  return fullAccumulated;
}

/**
 * Handles real-time SSE streaming chat with Google Gemini models and OpenRouter fallback.
 *
 * @param request Streaming chat configuration
 * @returns Accumulated complete message string
 */
export async function streamGeminiChat(request: ChatStreamRequest): Promise<string> {
  const {
    messages,
    telemetry,
    profile,
    onChunk,
    model = API_CONFIG.GEMINI.MODELS.PRIMARY,
  } = request;

  const url = `${API_CONFIG.GEMINI.BASE_URL}/${model}:streamGenerateContent?alt=sse`;
  const systemContext = `You are VayuShield Smog Copilot. Live context: ${telemetry.location.name}, CPCB AQI: ${telemetry.cpcbAqi.aqi} (${telemetry.cpcbAqi.category}), Dominant: ${telemetry.cpcbAqi.dominantPollutant}, GRAP: ${telemetry.grapStage}, User Housing: ${profile.housingType}, Commute: ${profile.commuteMode}. Provide actionable, science-grounded answers. In every answer with action suggestions, include a concise Direct Choice Impact section.`;

  const contents = [
    { role: 'user', parts: [{ text: systemContext }] },
    ...messages.map((m) => ({
      role: m.role,
      parts: [{ text: sanitizeUserInput(m.content) }],
    })),
  ];

  const streamOutcome = await obtainStreamResponse(
    url,
    JSON.stringify({ contents, generationConfig: { temperature: 0.4 } }),
    systemContext,
    request
  );

  if (typeof streamOutcome === 'string') return streamOutcome;

  const reader = streamOutcome.body?.getReader();
  if (!reader) throw new GeminiApiError('Streaming not supported', 'SCHEMA_INVALID');

  return consumeSseStream(reader, onChunk);
}
