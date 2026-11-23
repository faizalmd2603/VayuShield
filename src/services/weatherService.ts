import { API_CONFIG } from '../constants/apiConfig';
import { NetworkError } from '../types/errors';
import { httpClient } from './httpClient';

export interface RawWeatherCurrent {
  readonly temperature_2m?: number;
  readonly relative_humidity_2m?: number;
  readonly wind_speed_10m?: number;
  readonly boundary_layer_height?: number;
}

export interface RawWeatherHourly {
  readonly time?: readonly string[];
  readonly temperature_2m?: readonly (number | null)[];
  readonly relative_humidity_2m?: readonly (number | null)[];
  readonly wind_speed_10m?: readonly (number | null)[];
  readonly boundary_layer_height?: readonly (number | null)[];
}

export interface OpenMeteoWeatherResponse {
  readonly current?: RawWeatherCurrent;
  readonly hourly?: RawWeatherHourly;
}

export interface ParsedWeatherPoint {
  readonly temperature2m: number;
  readonly relativeHumidity2m: number;
  readonly windSpeed10m: number;
  readonly boundaryLayerHeight: number;
}

export interface ParsedWeatherResult {
  readonly current: ParsedWeatherPoint;
  readonly hourlyByTime: ReadonlyMap<string, ParsedWeatherPoint>;
}

/**
 * Builds a parsed weather point with fallback defaults.
 */
function createWeatherPoint(
  temp?: number | null,
  hum?: number | null,
  wind?: number | null,
  blh?: number | null
): ParsedWeatherPoint {
  return {
    temperature2m: temp ?? 20,
    relativeHumidity2m: hum ?? 50,
    windSpeed10m: wind ?? 8,
    boundaryLayerHeight: blh ?? 500,
  };
}

/**
 * Parses hourly weather arrays into a time-keyed map.
 */
function parseHourlyMap(
  hourly?: RawWeatherHourly
): ReadonlyMap<string, ParsedWeatherPoint> {
  const result = new Map<string, ParsedWeatherPoint>();
  const times = hourly?.time;
  if (!times) return result;

  const temps = hourly.temperature_2m;
  const hums = hourly.relative_humidity_2m;
  const winds = hourly.wind_speed_10m;
  const blhs = hourly.boundary_layer_height;

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    if (!t) continue;
    result.set(
      t,
      createWeatherPoint(temps?.[i], hums?.[i], winds?.[i], blhs?.[i])
    );
  }

  return result;
}

/**
 * Fetches real-time weather and planetary boundary layer height data from Open-Meteo.
 *
 * @param latitude Geographical latitude
 * @param longitude Geographical longitude
 * @param signal Optional AbortSignal for cancellation
 * @returns Parsed weather and boundary layer metrics
 */
export async function fetchWeatherTelemetry(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<ParsedWeatherResult> {
  const url = `${API_CONFIG.OPEN_METEO.FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,boundary_layer_height&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,boundary_layer_height&forecast_days=2&timezone=auto`;

  const raw = await httpClient.get<OpenMeteoWeatherResponse>(url, {
    signal,
    cacheTtlMs: API_CONFIG.OPEN_METEO.CACHE_TTL_MS,
  });

  if (!raw.current) {
    throw new NetworkError('Malformed weather payload: missing current values', 502);
  }

  const current = createWeatherPoint(
    raw.current.temperature_2m,
    raw.current.relative_humidity_2m,
    raw.current.wind_speed_10m,
    raw.current.boundary_layer_height
  );

  const hourlyByTime = parseHourlyMap(raw.hourly);

  return { current, hourlyByTime };
}
