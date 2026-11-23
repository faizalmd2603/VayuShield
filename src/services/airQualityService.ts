import { API_CONFIG } from '../constants/apiConfig';
import {
  assessSmogTrap,
  calculateCpcbAqi,
  determineGrapStage,
  findSafestVentilationWindow,
} from '../domain/aqiScience';
import type {
  CombinedAirTelemetry,
  GeoLocation,
  HourlyAirQualityPoint,
  PollutantTelemetry,
} from '../types/airQuality';
import { NetworkError } from '../types/errors';
import { httpClient } from './httpClient';
import { fetchWeatherTelemetry, type ParsedWeatherPoint } from './weatherService';

interface RawCurrentAirQuality {
  readonly us_aqi?: number;
  readonly european_aqi?: number;
  readonly pm2_5?: number;
  readonly pm10?: number;
  readonly carbon_monoxide?: number;
  readonly nitrogen_dioxide?: number;
  readonly sulphur_dioxide?: number;
  readonly ozone?: number;
  readonly dust?: number;
  readonly uv_index?: number;
}

interface RawHourlyAirQuality {
  readonly time?: readonly string[];
  readonly us_aqi?: readonly (number | null)[];
  readonly pm2_5?: readonly (number | null)[];
  readonly pm10?: readonly (number | null)[];
  readonly nitrogen_dioxide?: readonly (number | null)[];
  readonly ozone?: readonly (number | null)[];
}

interface OpenMeteoAirQualityResponse {
  readonly current?: RawCurrentAirQuality;
  readonly hourly?: RawHourlyAirQuality;
}

/**
 * Safely rounds an optional numeric metric.
 */
function roundNum(val: number | null | undefined, fallback = 0): number {
  return Math.round(val ?? fallback);
}

/**
 * Parses raw Open-Meteo current pollutant telemetry.
 */
function parseCurrentPollutants(raw?: RawCurrentAirQuality): PollutantTelemetry {
  if (!raw) {
    throw new NetworkError('Missing current air quality data', 502);
  }
  const coRaw = raw.carbon_monoxide ?? 0;
  const uvRaw = raw.uv_index ?? 0;

  return {
    usAqi: roundNum(raw.us_aqi),
    europeanAqi: roundNum(raw.european_aqi),
    pm25: roundNum(raw.pm2_5),
    pm10: roundNum(raw.pm10),
    carbonMonoxide: Math.round(coRaw / 100) / 10,
    nitrogenDioxide: roundNum(raw.nitrogen_dioxide),
    sulphurDioxide: roundNum(raw.sulphur_dioxide),
    ozone: roundNum(raw.ozone),
    dust: roundNum(raw.dust),
    uvIndex: Math.round(uvRaw * 10) / 10,
  };
}

/**
 * Constructs a single hourly air quality point.
 */
function buildHourlyPoint(
  time: string,
  usAqiVal: number | null | undefined,
  pm25Val: number | null | undefined,
  pm10Val: number | null | undefined,
  no2Val: number | null | undefined,
  o3Val: number | null | undefined,
  weather?: ParsedWeatherPoint
): HourlyAirQualityPoint {
  return {
    time,
    usAqi: roundNum(usAqiVal),
    pm25: roundNum(pm25Val),
    pm10: roundNum(pm10Val),
    nitrogenDioxide: roundNum(no2Val),
    ozone: roundNum(o3Val),
    temperature2m: weather?.temperature2m ?? 20,
    relativeHumidity2m: weather?.relativeHumidity2m ?? 50,
    windSpeed10m: weather?.windSpeed10m ?? 8,
    boundaryLayerHeight: weather?.boundaryLayerHeight ?? 500,
  };
}

/**
 * Combines hourly air quality with weather metrics into unified points.
 */
function mergeHourlyPoints(
  rawHourly: RawHourlyAirQuality | undefined,
  weatherMap: ReadonlyMap<string, ParsedWeatherPoint>
): readonly HourlyAirQualityPoint[] {
  const times = rawHourly?.time;
  if (!times) return [];

  const usAqis = rawHourly.us_aqi;
  const pm25s = rawHourly.pm2_5;
  const pm10s = rawHourly.pm10;
  const no2s = rawHourly.nitrogen_dioxide;
  const o3s = rawHourly.ozone;

  const points: HourlyAirQualityPoint[] = [];
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    if (!t) continue;
    const w = weatherMap.get(t);
    points.push(buildHourlyPoint(t, usAqis?.[i], pm25s?.[i], pm10s?.[i], no2s?.[i], o3s?.[i], w));
  }

  return points;
}

/**
 * Fetches and synthesizes real-time air quality, forecast, and dispersion telemetry.
 *
 * @param location Geographic target location
 * @param signal Optional AbortSignal for cancellation
 * @returns Fully computed CombinedAirTelemetry object
 */
export async function fetchAirQualityTelemetry(
  location: GeoLocation,
  signal?: AbortSignal
): Promise<CombinedAirTelemetry> {
  const aqUrl = `${API_CONFIG.OPEN_METEO.AIR_QUALITY_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=us_aqi,european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index&hourly=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone&forecast_days=2&timezone=auto`;

  const [aqRaw, weather] = await Promise.all([
    httpClient.get<OpenMeteoAirQualityResponse>(aqUrl, {
      signal,
      cacheTtlMs: API_CONFIG.OPEN_METEO.CACHE_TTL_MS,
    }),
    fetchWeatherTelemetry(location.latitude, location.longitude, signal),
  ]);

  const currentPollutants = parseCurrentPollutants(aqRaw.current);
  const hourlyForecast = mergeHourlyPoints(aqRaw.hourly, weather.hourlyByTime);

  const cpcbAqi = calculateCpcbAqi(currentPollutants);
  const grapStage = determineGrapStage(cpcbAqi.aqi);
  const smogTrap = assessSmogTrap({
    boundaryLayerHeight: weather.current.boundaryLayerHeight,
    windSpeed: weather.current.windSpeed10m,
    temperature: weather.current.temperature2m,
  });
  const safestVentilation = findSafestVentilationWindow(hourlyForecast);

  return {
    location,
    currentPollutants,
    hourlyForecast,
    cpcbAqi,
    grapStage,
    smogTrap,
    safestVentilation,
    lastUpdated: new Date().toISOString(),
  };
}
