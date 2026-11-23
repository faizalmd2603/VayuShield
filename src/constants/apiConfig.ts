/**
 * API Endpoints, Model Names, and Telemetry Configuration.
 */

export const API_CONFIG = {
  GEMINI: {
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    MODELS: {
      PRIMARY: 'gemini-3.5-flash-lite',
      DEEP: 'gemini-3.8-flash',
    } as const,
    TIMEOUT_MS: 25_000,
    STREAM_TIMEOUT_MS: 30_000,
    MAX_RETRIES: 2,
    BACKOFF_BASE_MS: 1_000,
    TEMPERATURE: 0.3,
  },
  OPEN_METEO: {
    GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1/search',
    AIR_QUALITY_URL: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    FORECAST_URL: 'https://api.open-meteo.com/v1/forecast',
    CACHE_TTL_MS: 10 * 60 * 1000, // 10 minutes TTL
    GEOCODE_DEBOUNCE_MS: 350,
  },
} as const;
