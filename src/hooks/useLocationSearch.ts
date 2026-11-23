import { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '../constants/apiConfig';
import { getCurrentGpsPosition, searchLocations } from '../services/locationService';
import type { GeoLocation } from '../types/airQuality';
import { LocationError } from '../types/errors';

export interface UseLocationSearchResult {
  readonly query: string;
  readonly setQuery: (query: string) => void;
  readonly candidates: readonly GeoLocation[];
  readonly isSearching: boolean;
  readonly isGpsLocating: boolean;
  readonly error: string | null;
  readonly fetchGpsLocation: () => Promise<GeoLocation | null>;
  readonly clearSearch: () => void;
}

/**
 * Hook providing debounced geocoding search and browser GPS positioning.
 */
export function useLocationSearch(
  onSelectLocation?: (location: GeoLocation) => void
): UseLocationSearchResult {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<readonly GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setCandidates([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    const timer = setTimeout(() => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      void searchLocations(trimmed, controller.signal)
        .then((results) => {
          setCandidates(results);
          setIsSearching(false);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          setError(err instanceof Error ? err.message : 'Search failed');
          setIsSearching(false);
        });
    }, API_CONFIG.OPEN_METEO.GEOCODE_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const fetchGpsLocation = useCallback(async (): Promise<GeoLocation | null> => {
    setIsGpsLocating(true);
    setError(null);
    try {
      const loc = await getCurrentGpsPosition();
      setCandidates([]);
      setQuery(loc.name);
      onSelectLocation?.(loc);
      return loc;
    } catch (err: unknown) {
      const msg =
        err instanceof LocationError
          ? err.message
          : 'Unable to access your current GPS location';
      setError(msg);
      return null;
    } finally {
      setIsGpsLocating(false);
    }
  }, [onSelectLocation]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setCandidates([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    candidates,
    isSearching,
    isGpsLocating,
    error,
    fetchGpsLocation,
    clearSearch,
  };
}
