import { API_CONFIG } from '../constants/apiConfig';
import type { GeoLocation } from '../types/airQuality';
import { LocationError } from '../types/errors';
import { httpClient } from './httpClient';

interface OpenMeteoGeocodingResult {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly admin1?: string;
  readonly country?: string;
  readonly timezone?: string;
}

interface OpenMeteoGeocodingResponse {
  readonly results?: readonly OpenMeteoGeocodingResult[];
}

/**
 * Validates whether an unknown value conforms to OpenMeteoGeocodingResult.
 */
function isValidGeocodingResult(item: unknown): item is OpenMeteoGeocodingResult {
  if (typeof item !== 'object' || item === null) return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.latitude === 'number' &&
    typeof candidate.longitude === 'number'
  );
}

/**
 * Searches for global cities and localities matching a user query using Open-Meteo Geocoding.
 *
 * @param query Search text (city name or locality)
 * @param signal Optional AbortSignal for cancellation
 * @returns Array of validated GeoLocation candidates
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<readonly GeoLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `${API_CONFIG.OPEN_METEO.GEOCODING_URL}?name=${encodeURIComponent(
    trimmed
  )}&count=6&language=en&format=json`;

  const raw = await httpClient.get<OpenMeteoGeocodingResponse>(url, {
    signal,
    cacheTtlMs: API_CONFIG.OPEN_METEO.CACHE_TTL_MS,
  });

  if (!raw.results || !Array.isArray(raw.results)) {
    return [];
  }

  const validLocations: GeoLocation[] = [];
  for (const item of raw.results) {
    if (isValidGeocodingResult(item)) {
      validLocations.push({
        name: item.name,
        latitude: Math.round(item.latitude * 10000) / 10000,
        longitude: Math.round(item.longitude * 10000) / 10000,
        admin1: item.admin1,
        country: item.country ?? 'Unknown',
        timezone: item.timezone,
      });
    }
  }

  return validLocations;
}

/**
 * Obtains current browser GPS coordinates with clear error mapping.
 *
 * @returns GeoLocation with GPS coordinates
 */
export function getCurrentGpsPosition(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(
        new LocationError(
          'Geolocation is not supported by your browser',
          'POSITION_UNAVAILABLE'
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        resolve({
          name: 'Current GPS Location',
          latitude: lat,
          longitude: lon,
          admin1: 'Browser GPS',
          country: 'Local',
        });
      },
      (err) => {
        let code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' =
          'POSITION_UNAVAILABLE';
        if (err.code === 1) code = 'PERMISSION_DENIED';
        if (err.code === 3) code = 'TIMEOUT';

        reject(new LocationError(err.message, code));
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  });
}
