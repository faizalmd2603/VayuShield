import type { CommuteMode, CookingFuel, PurifierStatus, VentilationType } from '../types/profile';

/**
 * Validated scientific emission factors and indoor infiltration coefficients.
 * Based on CPCB, US EPA, and atmospheric physics peer-reviewed models.
 */

export const COMMUTE_EMISSION_FACTORS: Record<
  CommuteMode,
  { readonly co2eGPerKm: number; readonly pm25MgPerKm: number }
> = {
  petrol_diesel_car: { co2eGPerKm: 180, pm25MgPerKm: 35 },
  motorcycle_scooter: { co2eGPerKm: 85, pm25MgPerKm: 25 },
  public_bus: { co2eGPerKm: 45, pm25MgPerKm: 12 },
  electric_vehicle: { co2eGPerKm: 35, pm25MgPerKm: 8 },
  metro_subway: { co2eGPerKm: 20, pm25MgPerKm: 2 },
  walking_cycling: { co2eGPerKm: 0, pm25MgPerKm: 0 },
  work_from_home: { co2eGPerKm: 0, pm25MgPerKm: 0 },
};

export const VENTILATION_INFILTRATION_FACTORS: Record<VentilationType, number> = {
  sealed_hvac: 0.1,
  split_ac_no_fresh_air: 0.35,
  natural_cross_ventilation: 0.7,
  leaky_unsealed_windows: 0.85,
};

export const PURIFIER_EFFICIENCY: Record<PurifierStatus, number> = {
  hepa_purifier_active: 0.85,
  diy_corsi_rosenthal: 0.8,
  basic_filter_fan: 0.4,
  none: 0.0,
};

export const COOKING_INTERNAL_PM25_UGM3: Record<CookingFuel, number> = {
  biomass_wood_coal: 150,
  lpg_gas: 25,
  piped_natural_gas: 20,
  induction_electric: 5,
};

export const HUMAN_PHYSIOLOGY = {
  ADULT_RESPIRATION_M3_PER_HOUR: 0.625, // ~15 m3/day
  CHILD_RESPIRATION_M3_PER_HOUR: 0.417, // ~10 m3/day
  DEFAULT_TARGET_ACH: 4.5, // ASHRAE/CDC clean indoor standard ACH
} as const;
