import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchAirQualityTelemetry } from '../services/airQualityService';
import type { CombinedAirTelemetry, GeoLocation } from '../types/airQuality';
import { NetworkError } from '../types/errors';

export interface UseLiveAirQualityResult {
  readonly location: GeoLocation | null;
  readonly telemetry: CombinedAirTelemetry | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly selectLocation: (location: GeoLocation) => void;
  readonly refresh: () => Promise<void>;
}

/**
 * Hook managing real-time air quality, forecast, and thermal dispersion telemetry.
 */
export function useLiveAirQuality(
  initialLocation: GeoLocation | null = null
): UseLiveAirQualityResult {
  const [location, setLocation] = useState<GeoLocation | null>(initialLocation);
  const [telemetry, setTelemetry] = useState<CombinedAirTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const loadTelemetry = useCallback(async (targetLoc: GeoLocation): Promise<void> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAirQualityTelemetry(targetLoc, controller.signal);
      setTelemetry(data);
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const msg =
        err instanceof NetworkError ? err.message : 'Failed to fetch live air quality telemetry';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectLocation = useCallback(
    (newLocation: GeoLocation) => {
      setLocation(newLocation);
      void loadTelemetry(newLocation);
    },
    [loadTelemetry]
  );

  const refresh = useCallback(async (): Promise<void> => {
    if (location) {
      await loadTelemetry(location);
    }
  }, [location, loadTelemetry]);

  useEffect(() => {
    if (initialLocation && !telemetry && !isLoading) {
      void loadTelemetry(initialLocation);
    }
  }, [initialLocation, loadTelemetry, telemetry, isLoading]);

  return {
    location,
    telemetry,
    isLoading,
    error,
    selectLocation,
    refresh,
  };
}
