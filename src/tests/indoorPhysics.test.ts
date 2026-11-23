import { describe, it, expect } from 'vitest';
import { calculateRoomMetrics, estimateIndoorPm25 } from '../domain/indoorPhysics';
import { calculateCommuteSavings, calculateCheckedRoutinesImpact } from '../domain/impactCalculator';
import type { RoutineStep } from '../types/gemini';

describe('Indoor Physics & Aero Metrics', () => {
  it('calculates room volume and CADR according to target ACH', () => {
    // 20 m2, 3m height => 60 m3
    // At ACH = 4.5, CADR = 60 * 4.5 = 270 m3/h
    const metrics = calculateRoomMetrics(20, 3.0, 4.5);
    expect(metrics.roomVolumeM3).toBe(60);
    expect(metrics.requiredCadrM3H).toBe(270);
    expect(metrics.requiredCadrCfm).toBe(159);
  });

  it('estimates indoor PM2.5 and reduction accurately based on ventilation and purifier', () => {
    const sealedWithHepa = estimateIndoorPm25(200, {
      ventilationType: 'sealed_hvac',
      purifierStatus: 'hepa_purifier_active',
      cookingFuel: 'induction_electric',
      roomSizeSqMeters: 25,
      ceilingHeightMeters: 2.8,
    });

    // Infiltration = 200 * 0.1 * (1 - 0.85) = 3 ug/m3 + minor induction cooking
    expect(sealedWithHepa.estimatedIndoorPm25).toBeLessThan(15);
    expect(sealedWithHepa.infiltrationReductionPercent).toBeGreaterThan(90);
    expect(sealedWithHepa.cleanAirDeliveryAdequacy).toBe('Optimal');

    const leakyWithoutPurifier = estimateIndoorPm25(200, {
      ventilationType: 'leaky_unsealed_windows',
      purifierStatus: 'none',
      cookingFuel: 'biomass_wood_coal',
      roomSizeSqMeters: 25,
      ceilingHeightMeters: 2.8,
    });

    expect(leakyWithoutPurifier.estimatedIndoorPm25).toBeGreaterThan(150);
    expect(leakyWithoutPurifier.cleanAirDeliveryAdequacy).toBe('Critical Deficit');
  });
});

describe('Impact Calculator', () => {
  it('calculates commute emission savings between car and metro', () => {
    const savings = calculateCommuteSavings('metro_subway', 20, 5);
    // 100 km weekly: Car = 18 kg CO2e, Metro = 2 kg CO2e => Saved = 16 kg
    expect(savings.weeklyCo2eSavedKg).toBe(16);
    expect(savings.weeklyPm25SavedGrams).toBeGreaterThan(0);
  });

  it('aggregates checked routine impact accurately', () => {
    const sampleRoutines: RoutineStep[] = [
      {
        id: 'step-1',
        timeSlot: '07:00 - 08:30',
        periodLabel: 'Morning Peak',
        action: 'Close bedroom windows & run HEPA on max speed',
        whyNow: 'Boundary layer is at 180m; outdoor PM2.5 is 220 µg/m³',
        lowEmissionAlternative: 'Avoid burning morning incense or mosquito coils',
        directImpact: {
          personalPm25ReductionUgm3: 140,
          co2eAvoidedKg: 0.2,
          healthBenefit: 'Lowers particulate deposition in deep alveolar airways',
        },
      },
      {
        id: 'step-2',
        timeSlot: '08:30 - 09:30',
        periodLabel: 'Commute',
        action: 'Take Delhi Metro Blue Line with N95 respirator',
        whyNow: 'Roadside particulate concentration reaches 350 µg/m³',
        lowEmissionAlternative: 'Shift from single-occupancy petrol vehicle to rapid transit',
        directImpact: {
          personalPm25ReductionUgm3: 110,
          co2eAvoidedKg: 3.2,
          healthBenefit: 'Prevents 85% particulate exposure compared to open vehicle',
        },
      },
    ];

    const checkedIds = new Set(['step-1', 'step-2']);
    const result = calculateCheckedRoutinesImpact(sampleRoutines, checkedIds, {
      commuteMode: 'metro_subway',
      dailyCommuteKm: 20,
    });

    expect(result.checkedCount).toBe(2);
    expect(result.personalPm25ReductionUgm3).toBe(250);
    expect(result.weeklyCo2eAvoidedKg).toBeGreaterThan(30);
    expect(result.treeAbsorptionEquivalent).toBeGreaterThan(70);
  });
});
