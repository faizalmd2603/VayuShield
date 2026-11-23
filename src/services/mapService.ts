import { API_CONFIG } from '../constants/apiConfig';
import { httpClient } from './httpClient';

export interface SerpApiMapResult {
  readonly title: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly thumbnail?: string;
  readonly description?: string;
  readonly address?: string;
  readonly googleMapsUrl?: string;
  readonly satelliteUrl: string;
}

interface RawSerpApiResponse {
  readonly place_results?: {
    readonly title?: string;
    readonly gps_coordinates?: {
      readonly latitude?: number;
      readonly longitude?: number;
    };
    readonly thumbnail?: string;
    readonly description?: {
      readonly snippet?: string;
    };
    readonly address?: string;
  };
  readonly search_metadata?: {
    readonly google_maps_url?: string;
  };
}

/**
 * Generates direct Google Maps satellite view link with 1e3 satellite layer flag.
 */
export function getGoogleSatelliteUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/@${lat},${lon},13z/data=!3m1!1e3`;
}

function parseSerpApiPlace(
  data: RawSerpApiResponse,
  fallbackTitle: string
): SerpApiMapResult | null {
  const place = data.place_results;
  if (!place) return null;
  const coords = place.gps_coordinates;
  if (!coords?.latitude || !coords.longitude) return null;

  const lat = Math.round(coords.latitude * 10000) / 10000;
  const lon = Math.round(coords.longitude * 10000) / 10000;

  return {
    title: place.title ?? fallbackTitle,
    latitude: lat,
    longitude: lon,
    thumbnail: place.thumbnail,
    description: place.description?.snippet,
    address: place.address,
    googleMapsUrl: data.search_metadata?.google_maps_url,
    satelliteUrl: getGoogleSatelliteUrl(lat, lon),
  };
}

/**
 * Queries SerpAPI Google Maps engine for high-resolution satellite/place telemetry.
 */
export async function fetchSerpApiMapLocation(
  query: string,
  signal?: AbortSignal
): Promise<SerpApiMapResult | null> {
  const trimmed = query.trim();
  const key = import.meta.env.VITE_SERPAPI_KEY;
  if (!trimmed || !key) return null;

  const url = `${API_CONFIG.SERPAPI.BASE_URL}?engine=google_maps&q=${encodeURIComponent(trimmed)}&api_key=${key}`;

  try {
    const data = await httpClient.get<RawSerpApiResponse>(url, {
      signal,
      cacheTtlMs: API_CONFIG.SERPAPI.CACHE_TTL_MS,
    });
    return parseSerpApiPlace(data, trimmed);
  } catch {
    return null;
  }
}
