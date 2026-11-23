import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmogCopilotChat } from '../components/copilot/SmogCopilotChat';
import type { CombinedAirTelemetry } from '../types/airQuality';
import { DEFAULT_LIFESTYLE_PROFILE } from '../utils/storage';

beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const sampleTelemetry: CombinedAirTelemetry = {
  location: { name: 'Chennai', latitude: 13.08, longitude: 80.27, country: 'India' },
  currentPollutants: {
    usAqi: 120,
    europeanAqi: 50,
    pm25: 45,
    pm10: 85,
    carbonMonoxide: 0.8,
    nitrogenDioxide: 28,
    sulphurDioxide: 12,
    ozone: 24,
    dust: 15,
    uvIndex: 5,
  },
  hourlyForecast: [],
  cpcbAqi: { aqi: 110, category: 'Moderate', dominantPollutant: 'PM25', subIndices: { pm25: 110 } },
  grapStage: 'Stage I (Poor)',
  smogTrap: { riskLevel: 'Moderate', boundaryLayerHeight: 450, windSpeed: 8, temperature: 27, explanation: 'Coastal breeze' },
  safestVentilation: { startHour: '12:00', endHour: '16:00', averagePm25: 35, boundaryLayerHeight: 650, windSpeed: 12, isSafestWindow: true, rationale: 'Afternoon sea breeze' },
  lastUpdated: '2026-11-23T12:00:00Z',
};

describe('SmogCopilotChat Component Suite', () => {
  it('renders initial chips and keeps the text input non-blocking and active', () => {
    render(
      <SmogCopilotChat
        apiKey="AIzaSyTestApiKey123"
        telemetry={sampleTelemetry}
        profile={DEFAULT_LIFESTYLE_PROFILE}
        selectedModel="gemini-3.5-flash-lite"
      />
    );

    expect(screen.getByText(/Streaming Smog Copilot/i)).toBeInTheDocument();
    expect(screen.getByText(/LIVE CONVERSATIONAL GROUNDING/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Ask Smog Copilot about routines/i);
    expect(input).toBeInTheDocument();
    expect(input).not.toBeDisabled();

    // Verify typing works seamlessly
    fireEvent.change(input, { target: { value: 'How is the air in Chennai?' } });
    expect((input as HTMLInputElement).value).toBe('How is the air in Chennai?');
  });

  it('clicking a prompt chip populates and triggers message dispatch', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        body: {
          getReader: () => ({
            read: () => Promise.resolve({ done: true, value: undefined }),
          }),
        },
      } as unknown as Response)
    );

    render(
      <SmogCopilotChat
        apiKey="AIzaSyTestApiKey123"
        telemetry={sampleTelemetry}
        profile={DEFAULT_LIFESTYLE_PROFILE}
        selectedModel="gemini-3.5-flash-lite"
      />
    );

    const firstChip = screen.getByRole('button', {
      name: /Can children exercise outdoors in Chennai right now\?/i,
    });
    expect(firstChip).toBeInTheDocument();
    fireEvent.click(firstChip);

    // The user message bubble appears immediately
    expect(screen.getByText(/Can children exercise outdoors in Chennai right now\?/i)).toBeInTheDocument();
  });
});
