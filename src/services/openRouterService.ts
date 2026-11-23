import { API_CONFIG } from '../constants/apiConfig';
import { GeminiApiError } from '../types/errors';
import type { ChatMessage } from '../types/gemini';
import { sanitizeUserInput } from './sanitizer';

export interface OpenRouterPlanRequest {
  readonly apiKey: string;
  readonly prompt: string;
  readonly signal?: AbortSignal;
}

export interface OpenRouterStreamRequest {
  readonly apiKey: string;
  readonly systemPrompt: string;
  readonly messages: readonly ChatMessage[];
  readonly onChunk: (chunk: string) => void;
  readonly signal?: AbortSignal;
}

/**
 * Calls OpenRouter chat completions endpoint as a safety resilience alternative.
 */
export async function callOpenRouterCompletion(
  request: OpenRouterPlanRequest
): Promise<string> {
  const { apiKey, prompt, signal } = request;
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new GeminiApiError('OpenRouter API key is missing', 'INVALID_KEY', false);
  }

  const res = await fetch(API_CONFIG.OPENROUTER.BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${trimmed}`,
      'HTTP-Referer': 'https://vayushield-nine.vercel.app',
      'X-Title': 'VayuShield',
    },
    body: JSON.stringify({
      model: API_CONFIG.OPENROUTER.MODEL,
      messages: [
        {
          role: 'system',
          content: 'You must respond ONLY with valid JSON conforming to the requested schema. No markdown formatting. Required top-level keys: summaryAdvisory, routines, indoorHacks, communityPlaybook.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
    signal,
  });

  if (!res.ok) {
    if (res.status === 402) {
      throw new GeminiApiError(
        'OpenRouter free-tier credit exhausted (HTTP 402 Payment Required)',
        'RATE_LIMITED',
        true
      );
    }
    throw new GeminiApiError(
      `OpenRouter API returned HTTP ${res.status}`,
      'RATE_LIMITED',
      true
    );
  }

  const data = (await res.json()) as {
    choices?: readonly { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new GeminiApiError('OpenRouter returned an empty completion', 'SCHEMA_INVALID');
  }
  return content;
}

interface OpenRouterDeltaChunk {
  readonly choices?: readonly {
    readonly delta?: {
      readonly content?: string;
    };
  }[];
}

/**
 * Extracts delta content from an OpenRouter SSE line.
 */
function extractDeltaFromLine(line: string): string | null {
  if (!line.startsWith('data: ')) return null;
  const payload = line.slice(6).trim();
  if (!payload || payload === '[DONE]') return null;

  try {
    const parsed = JSON.parse(payload) as OpenRouterDeltaChunk;
    return parsed.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}

/**
 * Consumes an array of OpenRouter SSE lines and dispatches chunks.
 */
function consumeDeltaLines(
  lines: readonly string[],
  onChunk: (chunk: string) => void
): string {
  let textAccum = '';
  for (const line of lines) {
    const text = extractDeltaFromLine(line);
    if (text) {
      textAccum += text;
      onChunk(text);
    }
  }
  return textAccum;
}

/**
 * Streams chat responses from OpenRouter using Server-Sent Events.
 */
export async function streamOpenRouterChat(
  request: OpenRouterStreamRequest
): Promise<string> {
  const { apiKey, systemPrompt, messages, onChunk, signal } = request;
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new GeminiApiError('OpenRouter key missing for stream', 'INVALID_KEY', false);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => { controller.abort(); }, 8_000);
  if (signal) {
    signal.addEventListener('abort', () => { controller.abort(); }, { once: true });
  }

  try {
    const res = await fetch(API_CONFIG.OPENROUTER.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmed}`,
        'HTTP-Referer': 'https://vayushield-nine.vercel.app',
        'X-Title': 'VayuShield',
      },
      body: JSON.stringify({
        model: API_CONFIG.OPENROUTER.MODEL,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role,
            content: sanitizeUserInput(m.content),
          })),
        ],
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new GeminiApiError(`OpenRouter stream failed: HTTP ${res.status}`, 'TIMEOUT');
    }

    const reader = res.body?.getReader();
    if (!reader) throw new GeminiApiError('Streaming not supported', 'SCHEMA_INVALID');

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
      fullAccumulated += consumeDeltaLines(lines, onChunk);
    }

    return fullAccumulated;
  } finally {
    clearTimeout(timer);
  }
}
