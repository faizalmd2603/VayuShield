import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSerpApiMapLocation, getGoogleSatelliteUrl } from '../services/mapService';

describe('SerpAPI Google Maps Intelligence Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates correct Google Maps satellite layer url', () => {
    const url = getGoogleSatelliteUrl(28.7041, 77.1025);
    expect(url).toContain('https://www.google.com/maps/@28.7041,77.1025,13z');
    expect(url).toContain('data=!3m1!1e3');
  });

  it('returns null for empty query', async () => {
    const res = await fetchSerpApiMapLocation('   ');
    expect(res).toBeNull();
  });

  it('parses valid SerpAPI Google Maps response correctly', async () => {
    const mockData = {
      place_results: {
        title: 'New Delhi',
        gps_coordinates: {
          latitude: 28.6139,
          longitude: 77.209,
        },
        thumbnail: 'https://lh3.googleusercontent.com/test-satellite-thumb.jpg',
        description: { snippet: 'Capital of India' },
        address: 'Delhi, India',
      },
      search_metadata: {
        google_maps_url: 'https://maps.google.com/?q=New+Delhi',
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as unknown as Response);

    const result = await fetchSerpApiMapLocation('Delhi');
    expect(result).not.toBeNull();
    expect(result?.title).toBe('New Delhi');
    expect(result?.latitude).toBe(28.6139);
    expect(result?.longitude).toBe(77.209);
    expect(result?.thumbnail).toContain('test-satellite-thumb.jpg');
    expect(result?.description).toBe('Capital of India');
    expect(result?.satelliteUrl).toContain('!1e3');
  });

  it('handles SerpAPI network error gracefully without throwing', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network offline'));

    const result = await fetchSerpApiMapLocation('Mumbai');
    expect(result).toBeNull();
  });
});
