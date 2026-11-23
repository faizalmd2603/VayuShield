import {
  COOKING_INTERNAL_PM25_UGM3,
  HUMAN_PHYSIOLOGY,
  PURIFIER_EFFICIENCY,
  VENTILATION_INFILTRATION_FACTORS,
} from '../constants/emissionFactors';
import type { LifestyleProfile } from '../types/profile';

export interface RoomAeroMetrics {
  readonly roomVolumeM3: number;
  readonly requiredCadrM3H: number;
  readonly requiredCadrCfm: number;
  readonly targetAch: number;
}

export interface IndoorPollutionEstimate {
  readonly estimatedIndoorPm25: number;
  readonly outdoorPm25: number;
  readonly infiltrationReductionPercent: number;
  readonly dailyInhaledDoseMicrograms: number;
  readonly cleanAirDeliveryAdequacy: 'Optimal' | 'Acceptable' | 'Critical Deficit';
}

/**
 * Calculates room volume and required CADR (Clean Air Delivery Rate) to achieve target ACH.
 *
 * @param areaSqM Room floor area in square meters
 * @param heightM Room ceiling height in meters
 * @param targetAch Desired Air Changes per Hour (defaults to 4.5)
 * @returns Aero metrics for the room
 */
export function calculateRoomMetrics(
  areaSqM: number,
  heightM = 2.8,
  targetAch: number = HUMAN_PHYSIOLOGY.DEFAULT_TARGET_ACH
): RoomAeroMetrics {
  const safeArea = Math.max(5, Math.min(500, areaSqM));
  const safeHeight = Math.max(2.0, Math.min(6.0, heightM));
  const roomVolumeM3 = Math.round(safeArea * safeHeight * 10) / 10;
  const requiredCadrM3H = Math.round(roomVolumeM3 * targetAch);
  const requiredCadrCfm = Math.round(requiredCadrM3H / 1.699);

  return {
    roomVolumeM3,
    requiredCadrM3H,
    requiredCadrCfm,
    targetAch,
  };
}

/**
 * Estimates steady-state indoor PM2.5 levels and inhalation dose based on building envelope physics.
 *
 * @param outdoorPm25 Live outdoor ambient PM2.5 reading (ug/m3)
 * @param profile User's housing, ventilation, cooking and purifier profile
 * @returns Detailed indoor pollution estimation
 */
export function estimateIndoorPm25(
  outdoorPm25: number,
  profile: Pick<
    LifestyleProfile,
    | 'ventilationType'
    | 'purifierStatus'
    | 'cookingFuel'
    | 'roomSizeSqMeters'
    | 'ceilingHeightMeters'
  >
): IndoorPollutionEstimate {
  const safeOutdoor = Math.max(0, outdoorPm25);
  const infilFactor = VENTILATION_INFILTRATION_FACTORS[profile.ventilationType];
  const purifierEff = PURIFIER_EFFICIENCY[profile.purifierStatus];
  const cookingGen = COOKING_INTERNAL_PM25_UGM3[profile.cookingFuel] * 0.15;

  // Infiltration portion reduced by filtration
  const penetratedOutdoor = safeOutdoor * infilFactor * (1 - purifierEff);
  const internalRemnant = cookingGen * (1 - purifierEff * 0.7);
  const estimatedIndoorPm25 = Math.round(Math.max(2, penetratedOutdoor + internalRemnant));

  const reductionPercent =
    safeOutdoor > 0
      ? Math.max(
          0,
          Math.min(99, Math.round(((safeOutdoor - estimatedIndoorPm25) / safeOutdoor) * 100))
        )
      : 0;

  // Daily inhaled dose = concentration (ug/m3) * respiration (m3/day)
  // 16 hours indoor + 8 hours outdoor assumption
  const indoorInhaled = estimatedIndoorPm25 * HUMAN_PHYSIOLOGY.ADULT_RESPIRATION_M3_PER_HOUR * 16;
  const outdoorInhaled = safeOutdoor * HUMAN_PHYSIOLOGY.ADULT_RESPIRATION_M3_PER_HOUR * 8;
  const totalDailyDose = Math.round(indoorInhaled + outdoorInhaled);

  let adequacy: 'Optimal' | 'Acceptable' | 'Critical Deficit' = 'Optimal';
  if (estimatedIndoorPm25 > 60) {
    adequacy = 'Critical Deficit';
  } else if (estimatedIndoorPm25 > 25) {
    adequacy = 'Acceptable';
  }

  return {
    estimatedIndoorPm25,
    outdoorPm25: safeOutdoor,
    infiltrationReductionPercent: reductionPercent,
    dailyInhaledDoseMicrograms: totalDailyDose,
    cleanAirDeliveryAdequacy: adequacy,
  };
}
