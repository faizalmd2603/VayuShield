import { COMMUTE_EMISSION_FACTORS } from '../constants/emissionFactors';
import type { CommuteMode, LifestyleProfile } from '../types/profile';
import type { RoutineStep } from '../types/gemini';

export interface AggregateImpactResult {
  readonly checkedCount: number;
  readonly totalSteps: number;
  readonly personalPm25ReductionUgm3: number;
  readonly weeklyCo2eAvoidedKg: number;
  readonly communityPmPreventedGrams: number;
  readonly treeAbsorptionEquivalent: number;
}

/**
 * Calculates commute emission savings compared to a conventional solo petrol/diesel vehicle.
 *
 * @param currentMode User's chosen commute mode
 * @param dailyKm Round-trip daily commute distance in kilometers
 * @param daysPerWeek Number of commute days per week (default 5)
 * @returns Weekly emissions and savings in kg CO2e and grams PM2.5
 */
export function calculateCommuteSavings(
  currentMode: CommuteMode,
  dailyKm: number,
  daysPerWeek = 5
): {
  readonly weeklyCo2eKg: number;
  readonly weeklyCo2eSavedKg: number;
  readonly weeklyPm25SavedGrams: number;
} {
  const safeKm = Math.max(0, dailyKm) * daysPerWeek;
  const baseline = COMMUTE_EMISSION_FACTORS.petrol_diesel_car;
  const current = COMMUTE_EMISSION_FACTORS[currentMode];

  const currentCo2Kg = (safeKm * current.co2eGPerKm) / 1000;
  const baselineCo2Kg = (safeKm * baseline.co2eGPerKm) / 1000;
  const savedCo2Kg = Math.max(0, Math.round((baselineCo2Kg - currentCo2Kg) * 10) / 10);

  const baselinePmG = (safeKm * baseline.pm25MgPerKm) / 1000;
  const currentPmG = (safeKm * current.pm25MgPerKm) / 1000;
  const savedPmG = Math.max(0, Math.round((baselinePmG - currentPmG) * 10) / 10);

  return {
    weeklyCo2eKg: Math.round(currentCo2Kg * 10) / 10,
    weeklyCo2eSavedKg: savedCo2Kg,
    weeklyPm25SavedGrams: savedPmG,
  };
}

/**
 * Aggregates verified health and environmental savings from checked routine actions.
 *
 * @param routines Complete list of scheduled routine actions
 * @param checkedStepIds Set of step IDs toggled as completed by the user
 * @param profile User's lifestyle profile
 * @returns Quantified impact report
 */
export function calculateCheckedRoutinesImpact(
  routines: readonly RoutineStep[],
  checkedStepIds: ReadonlySet<string>,
  profile: Pick<LifestyleProfile, 'commuteMode' | 'dailyCommuteKm'>
): AggregateImpactResult {
  let pm25ReductionSum = 0;
  let co2eAvoidedSum = 0;

  for (const step of routines) {
    if (checkedStepIds.has(step.id)) {
      pm25ReductionSum += step.directImpact.personalPm25ReductionUgm3;
      co2eAvoidedSum += step.directImpact.co2eAvoidedKg;
    }
  }

  // Include weekly commute savings contribution
  const commute = calculateCommuteSavings(profile.commuteMode, profile.dailyCommuteKm);
  const totalWeeklyCo2e = Math.round((co2eAvoidedSum * 7 + commute.weeklyCo2eSavedKg) * 10) / 10;
  const communityPm =
    Math.round((commute.weeklyPm25SavedGrams + pm25ReductionSum * 0.05) * 10) / 10;

  // 1 tree absorbs ~21 kg CO2/year (~0.404 kg/week)
  const treesEquiv = Math.round((totalWeeklyCo2e / 0.404) * 10) / 10;

  return {
    checkedCount: checkedStepIds.size,
    totalSteps: routines.length,
    personalPm25ReductionUgm3: Math.round(pm25ReductionSum),
    weeklyCo2eAvoidedKg: totalWeeklyCo2e,
    communityPmPreventedGrams: communityPm,
    treeAbsorptionEquivalent: treesEquiv,
  };
}
