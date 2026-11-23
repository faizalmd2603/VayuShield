import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAirQualityTelemetry } from '../services/airQualityService';
import { searchLocations } from '../services/locationService';
import { httpClient } from '../services/httpClient';
import type { GeoLocation } from '../types/airQuality';
import { NetworkError } from '../types/errors';

describe('Open-Meteo Air Quality & Location Services', () => {
  const sampleLocation: GeoLocation = {
    name: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    country: 'India',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    httpClient.clearCache();
  });

  it('searches locations and parses valid geocoding results', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 1234,
              name: 'New Delhi',
              latitude: 28.6139,
              longitude: 77.209,
              country: 'India',
              admin1: 'Delhi',
            },
          ],
        }),
    } as unknown as Response);

    const results = await searchLocations('Delhi');
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('New Delhi');
    expect(results[0]?.country).toBe('India');
  });

  it('returns empty array when search query is shorter than 2 chars', async () => {
    const results = await searchLocations('D');
    expect(results).toEqual([]);
  });

  it('fetches and synthesizes air quality and weather telemetry', async () => {
    vi.spyOn(globalThis, 'fetch')
      // 1. Air Quality API call
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            current: {
              us_aqi: 220,
              european_aqi: 80,
              pm2_5: 140,
              pm10: 210,
              carbon_monoxide: 1200,
              nitrogen_dioxide: 45,
              sulphur_dioxide: 15,
              ozone: 30,
              dust: 25,
              uv_index: 3.5,
            },
            hourly: {
              time: ['2026-11-23T12:00', '2026-11-23T13:00'],
              us_aqi: [220, 200],
              pm2_5: [140, 120],
              pm10: [210, 180],
              nitrogen_dioxide: [45, 40],
              ozone: [30, 35],
            },
          }),
      } as unknown as Response)
      // 2. Weather Forecast API call
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            current: {
              temperature_2m: 18,
              relative_humidity_2m: 65,
              wind_speed_10m: 6.2,
              boundary_layer_height: 320,
            },
            hourly: {
              time: ['2026-11-23T12:00', '2026-11-23T13:00'],
              temperature_2m: [18, 19],
              relative_humidity_2m: [65, 60],
              wind_speed_10m: [6.2, 7.0],
              boundary_layer_height: [320, 450],
            },
          }),
      } as unknown as Response);

    const telemetry = await fetchAirQualityTelemetry(sampleLocation);

    expect(telemetry.location.name).toBe('New Delhi');
    expect(telemetry.currentPollutants.pm25).toBe(140);
    expect(telemetry.cpcbAqi.aqi).toBeGreaterThan(300); // 140 PM2.5 is Very Poor in CPCB
    expect(telemetry.grapStage).toBe('Stage II (Very Poor)');
    expect(telemetry.hourlyForecast).toHaveLength(2);
    expect(telemetry.smogTrap.riskLevel).toBe('High');
  });

  it('throws typed NetworkError when API returns non-200 status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as unknown as Response);

    await expect(fetchAirQualityTelemetry(sampleLocation)).rejects.toThrow(NetworkError);
  });
});
