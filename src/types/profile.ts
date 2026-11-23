/**
 * User and Community Lifestyle Profile Types.
 */

export type HealthSensitivity =
  | 'asthma'
  | 'copd'
  | 'cardiovascular'
  | 'allergies'
  | 'infants_children'
  | 'seniors'
  | 'pregnant'
  | 'healthy_adult';

export type HousingType =
  | 'high_rise_apartment'
  | 'low_rise_apartment'
  | 'independent_house'
  | 'naturally_ventilated_flat'
  | 'dense_urban_cluster';

export type VentilationType =
  'sealed_hvac' | 'split_ac_no_fresh_air' | 'natural_cross_ventilation' | 'leaky_unsealed_windows';

export type PurifierStatus =
  'hepa_purifier_active' | 'basic_filter_fan' | 'diy_corsi_rosenthal' | 'none';

export type CookingFuel =
  'lpg_gas' | 'induction_electric' | 'piped_natural_gas' | 'biomass_wood_coal';

export type CommuteMode =
  | 'metro_subway'
  | 'electric_vehicle'
  | 'petrol_diesel_car'
  | 'motorcycle_scooter'
  | 'public_bus'
  | 'walking_cycling'
  | 'work_from_home';

export type BudgetTier = 'zero_cost' | 'budget_conscious' | 'flexible_wellness';

export type CommunityRole =
  | 'apartment_rwa_member'
  | 'school_educator_admin'
  | 'neighborhood_resident'
  | 'commuter_group_lead'
  | 'individual_family';

export interface LifestyleProfile {
  readonly familyMembersCount: number;
  readonly healthSensitivities: readonly HealthSensitivity[];
  readonly housingType: HousingType;
  readonly roomSizeSqMeters: number;
  readonly ceilingHeightMeters: number;
  readonly ventilationType: VentilationType;
  readonly purifierStatus: PurifierStatus;
  readonly cookingFuel: CookingFuel;
  readonly commuteMode: CommuteMode;
  readonly dailyCommuteKm: number;
  readonly budgetTier: BudgetTier;
  readonly communityRole: CommunityRole;
}
