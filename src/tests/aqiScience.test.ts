import { describe, it, expect } from 'vitest';
import {
  calculateCpcbSubIndex,
  calculateCpcbAqi,
  getCpcbCategory,
  getUsAqiCategory,
  determineGrapStage,
  assessSmogTrap,
  findSafestVentilationWindow,
} from '../domain/aqiScience';
import type { HourlyAirQualityPoint } from '../types/airQuality';

describe('CPCB Sub-Index Calculations', () => {
  it('calculates PM2.5 sub-index correctly across bands', () => {
    // 0-30 => 0-50
    expect(calculateCpcbSubIndex('pm25', 15)).toBe(25);
    // 31-60 => 51-100
    expect(calculateCpcbSubIndex('pm25', 45)).toBe(75);
    // 61-90 => 101-200
    expect(calculateCpcbSubIndex('pm25', 75)).toBe(149);
    // 91-120 => 201-300
    expect(calculateCpcbSubIndex('pm25', 105)).toBe(249);
    // 121-250 => 301-400
    expect(calculateCpcbSubIndex('pm25', 185)).toBe(350);
    // 251-500 => 401-500
    expect(calculateCpcbSubIndex('pm25', 375)).toBe(450);
  });

  it('handles boundary conditions, negative values, and extreme concentrations', () => {
    expect(calculateCpcbSubIndex('pm25', 0)).toBe(0);
    expect(calculateCpcbSubIndex('pm25', -10)).toBeUndefined();
    expect(calculateCpcbSubIndex('pm25', Number.NaN)).toBeUndefined();
    expect(calculateCpcbSubIndex('unknown_pollutant', 50)).toBeUndefined();
    // Beyond 500 should cap at 500
    expect(calculateCpcbSubIndex('pm25', 850)).toBe(500);
  });

  it('calculates PM10 and gas sub-indices correctly', () => {
    expect(calculateCpcbSubIndex('pm10', 50)).toBe(50);
    expect(calculateCpcbSubIndex('no2', 40)).toBe(50);
    expect(calculateCpcbSubIndex('co', 1.0)).toBe(50);
  });
});

describe('CPCB Aggregate AQI & Dominant Pollutant', () => {
  it('identifies dominant pollutant and maximum sub-index', () => {
    const result = calculateCpcbAqi({
      pm25: 110, // ~264 (Poor)
      pm10: 80, // ~80 (Satisfactory)
      nitrogenDioxide: 30, // ~38 (Good)
      sulphurDioxide: 10,
      carbonMonoxide: 0.5,
      ozone: 20,
    });

    expect(result.aqi).toBeGreaterThan(200);
    expect(result.dominantPollutant).toBe('PM25');
    expect(result.category).toBe('Poor');
  });

  it('correctly maps category labels', () => {
    expect(getCpcbCategory(25)).toBe('Good');
    expect(getCpcbCategory(75)).toBe('Satisfactory');
    expect(getCpcbCategory(150)).toBe('Moderate');
    expect(getCpcbCategory(250)).toBe('Poor');
    expect(getCpcbCategory(350)).toBe('Very Poor');
    expect(getCpcbCategory(450)).toBe('Severe');
  });
});

describe('US AQI & GRAP Stage Classifications', () => {
  it('maps US AQI categories correctly', () => {
    expect(getUsAqiCategory(35)).toBe('Good');
    expect(getUsAqiCategory(75)).toBe('Moderate');
    expect(getUsAqiCategory(125)).toBe('Unhealthy for Sensitive Groups');
    expect(getUsAqiCategory(175)).toBe('Unhealthy');
    expect(getUsAqiCategory(250)).toBe('Very Unhealthy');
    expect(getUsAqiCategory(400)).toBe('Hazardous');
  });

  it('evaluates GRAP stage thresholds strictly', () => {
    expect(determineGrapStage(150)).toBe('None');
    expect(determineGrapStage(250)).toBe('Stage I (Poor)');
    expect(determineGrapStage(350)).toBe('Stage II (Very Poor)');
    expect(determineGrapStage(420)).toBe('Stage III (Severe)');
    expect(determineGrapStage(480)).toBe('Stage IV (Severe+)');
  });
});

describe('Smog Trap & Safest Ventilation Window', () => {
  it('detects severe thermal inversion risk when boundary layer is shallow and winds calm', () => {
    const assessment = assessSmogTrap({
      boundaryLayerHeight: 180,
      windSpeed: 3.2,
      temperature: 11,
    });
    expect(assessment.riskLevel).toBe('Severe');
    expect(assessment.explanation).toContain('nocturnal thermal inversion');
  });

  it('identifies safe ventilation window from hourly series', () => {
    const hourlyMock: HourlyAirQualityPoint[] = [
      {
        time: '2026-11-23T06:00:00Z',
        usAqi: 350,
        pm25: 180,
        pm10: 250,
        nitrogenDioxide: 60,
        ozone: 20,
        temperature2m: 12,
        relativeHumidity2m: 85,
        windSpeed10m: 4,
        boundaryLayerHeight: 150,
      },
      {
        time: '2026-11-23T14:00:00Z',
        usAqi: 120,
        pm25: 45,
        pm10: 90,
        nitrogenDioxide: 30,
        ozone: 40,
        temperature2m: 22,
        relativeHumidity2m: 45,
        windSpeed10m: 12,
        boundaryLayerHeight: 950,
      },
      {
        time: '2026-11-23T20:00:00Z',
        usAqi: 280,
        pm25: 140,
        pm10: 200,
        nitrogenDioxide: 55,
        ozone: 25,
        temperature2m: 16,
        relativeHumidity2m: 70,
        windSpeed10m: 6,
        boundaryLayerHeight: 280,
      },
    ];

    const window = findSafestVentilationWindow(hourlyMock);
    expect(window).not.toBeNull();
    expect(window?.averagePm25).toBe(45);
    expect(window?.isSafestWindow).toBe(true);
  });
});
