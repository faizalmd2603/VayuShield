import React from 'react';
import type { HealthSensitivity, LifestyleProfile } from '../../types/profile';

interface Props {
  readonly profile: LifestyleProfile;
  readonly onUpdateProfile: (partial: Partial<LifestyleProfile>) => void;
  readonly onReset: () => void;
}

const SENSITIVITIES: readonly { id: HealthSensitivity; label: string }[] = [
  { id: 'asthma', label: 'Asthma / Bronchial' },
  { id: 'seniors', label: 'Elderly / Seniors (60+)' },
  { id: 'infants_children', label: 'Infants & Children' },
  { id: 'cardiovascular', label: 'Heart / Cardiovascular' },
  { id: 'pregnant', label: 'Pregnant Member' },
  { id: 'allergies', label: 'Allergies' },
];

const SensitivityChips: React.FC<{
  readonly activeList: readonly HealthSensitivity[];
  readonly onToggle: (id: HealthSensitivity) => void;
}> = ({ activeList, onToggle }) => (
  <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
    <span className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
      [ HOUSEHOLD VULNERABILITIES &amp; SENSITIVITIES ]
    </span>
    <div className="flex flex-wrap gap-2">
      {SENSITIVITIES.map((opt) => {
        const active = activeList.includes(opt.id);
        return (
          <button
            key={opt.id} type="button" onClick={() => { onToggle(opt.id); }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
              active
                ? 'bg-[#00FFC2]/15 text-[#00FFC2] border border-[#00FFC2]/50 font-bold'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:text-white'
            }`}
            aria-pressed={active}
          >
            {active ? '✓ ' : '+ '}{opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

const ProfileDropdowns: React.FC<{
  readonly profile: LifestyleProfile;
  readonly onUpdate: (partial: Partial<LifestyleProfile>) => void;
}> = ({ profile, onUpdate }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
    <div className="space-y-1.5">
      <label htmlFor="community-role" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Community Role</label>
      <select
        id="community-role" value={profile.communityRole}
        onChange={(e) => { onUpdate({ communityRole: e.target.value as LifestyleProfile['communityRole'] }); }}
        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
      >
        <option value="apartment_rwa_member">Apartment Association (RWA) Member</option>
        <option value="school_educator_admin">School Educator / Admin</option>
        <option value="neighborhood_resident">Neighborhood Resident</option>
        <option value="commuter_group_lead">Commuter Carpool Lead</option>
        <option value="individual_family">Family / Household</option>
      </select>
    </div>

    <div className="space-y-1.5">
      <label htmlFor="vent-type" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Ventilation</label>
      <select
        id="vent-type" value={profile.ventilationType}
        onChange={(e) => { onUpdate({ ventilationType: e.target.value as LifestyleProfile['ventilationType'] }); }}
        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
      >
        <option value="sealed_hvac">Sealed Double-Glazed / HVAC</option>
        <option value="split_ac_no_fresh_air">Split AC / Weatherstripped</option>
        <option value="natural_cross_ventilation">Natural Cross-Ventilation</option>
        <option value="leaky_unsealed_windows">Drafty Windows</option>
      </select>
    </div>

    <div className="space-y-1.5">
      <label htmlFor="purifier-status" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Air Purifier</label>
      <select
        id="purifier-status" value={profile.purifierStatus}
        onChange={(e) => { onUpdate({ purifierStatus: e.target.value as LifestyleProfile['purifierStatus'] }); }}
        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
      >
        <option value="hepa_purifier_active">Active HEPA Purifier</option>
        <option value="diy_corsi_rosenthal">DIY Corsi-Rosenthal Box</option>
        <option value="basic_filter_fan">Basic Filter Fan</option>
        <option value="none">No Purifier</option>
      </select>
    </div>

    <div className="space-y-1.5">
      <label htmlFor="commute-mode" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Daily Commute ({profile.dailyCommuteKm} km)</label>
      <select
        id="commute-mode" value={profile.commuteMode}
        onChange={(e) => { onUpdate({ commuteMode: e.target.value as LifestyleProfile['commuteMode'] }); }}
        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
      >
        <option value="metro_subway">Rapid Metro / Rail</option>
        <option value="electric_vehicle">Electric Vehicle</option>
        <option value="public_bus">Public Bus</option>
        <option value="petrol_diesel_car">Solo Car</option>
        <option value="motorcycle_scooter">Motorcycle</option>
        <option value="work_from_home">Work from Home</option>
      </select>
    </div>

    <div className="space-y-1.5">
      <label htmlFor="cooking-fuel" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Cooking Setup</label>
      <select
        id="cooking-fuel" value={profile.cookingFuel}
        onChange={(e) => { onUpdate({ cookingFuel: e.target.value as LifestyleProfile['cookingFuel'] }); }}
        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
      >
        <option value="induction_electric">Induction Electric</option>
        <option value="piped_natural_gas">Piped Natural Gas</option>
        <option value="lpg_gas">LPG Cylinder Gas</option>
        <option value="biomass_wood_coal">Biomass / Solid Fuel</option>
      </select>
    </div>
  </div>
);

/**
 * Interactive lifestyle & community profile configuration form.
 */
export const LifestyleProfileForm: React.FC<Props> = ({
  profile,
  onUpdateProfile,
  onReset,
}) => {
  const toggleSensitivity = (id: HealthSensitivity): void => {
    const set = new Set(profile.healthSensitivities);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onUpdateProfile({ healthSensitivities: Array.from(set) });
  };

  return (
    <section aria-label="Lifestyle & Community Profile" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Family & Community Profile</h2>
          <p className="text-xs text-slate-500">Tailors Gemini routine architect and indoor aero math</p>
        </div>
        <button type="button" onClick={() => { onReset(); }} className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer">
          Reset Defaults
        </button>
      </div>

      <ProfileDropdowns profile={profile} onUpdate={onUpdateProfile} />
      <SensitivityChips activeList={profile.healthSensitivities} onToggle={toggleSensitivity} />
    </section>
  );
};
