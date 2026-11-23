import type { LifestyleProfile } from '../types/profile';

const STORAGE_KEYS = {
  PROFILE: 'vayushield_profile_v1',
  THEME: 'vayushield_theme_v1',
  SESSION_API_KEY: 'vayushield_session_key_v1',
} as const;

export const DEFAULT_LIFESTYLE_PROFILE: LifestyleProfile = {
  familyMembersCount: 3,
  healthSensitivities: ['asthma', 'seniors'],
  housingType: 'high_rise_apartment',
  roomSizeSqMeters: 24,
  ceilingHeightMeters: 2.8,
  ventilationType: 'split_ac_no_fresh_air',
  purifierStatus: 'hepa_purifier_active',
  cookingFuel: 'piped_natural_gas',
  commuteMode: 'metro_subway',
  dailyCommuteKm: 18,
  budgetTier: 'budget_conscious',
  communityRole: 'apartment_rwa_member',
};

/**
 * Validates whether an unknown value conforms to LifestyleProfile.
 */
function isLifestyleProfile(data: unknown): data is LifestyleProfile {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  return (
    typeof p.familyMembersCount === 'number' &&
    Array.isArray(p.healthSensitivities) &&
    typeof p.housingType === 'string' &&
    typeof p.roomSizeSqMeters === 'number' &&
    typeof p.ventilationType === 'string' &&
    typeof p.purifierStatus === 'string' &&
    typeof p.cookingFuel === 'string' &&
    typeof p.commuteMode === 'string'
  );
}

/**
 * Safely reads the user lifestyle profile from localStorage.
 *
 * @returns Saved profile or fallback defaults
 */
export function getStoredProfile(): LifestyleProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_LIFESTYLE_PROFILE;
    const parsed: unknown = JSON.parse(raw);
    return isLifestyleProfile(parsed) ? parsed : DEFAULT_LIFESTYLE_PROFILE;
  } catch {
    return DEFAULT_LIFESTYLE_PROFILE;
  }
}

/**
 * Persists the user lifestyle profile to localStorage.
 *
 * @param profile Profile object
 */
export function setStoredProfile(profile: LifestyleProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // Gracefully handle storage quota or private browsing exceptions
  }
}

/**
 * Retrieves the stored theme preference.
 *
 * @returns 'light' or 'dark'
 */
export function getStoredTheme(): 'light' | 'dark' {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.THEME);
    if (val === 'light' || val === 'dark') return val;
  } catch {
    // Fall back to system preference
  }
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Persists user theme preference.
 *
 * @param theme 'light' or 'dark'
 */
export function setStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Reads API key strictly from sessionStorage (NEVER localStorage).
 *
 * @returns Session-cached key or null
 */
export function getSessionApiKey(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.SESSION_API_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves API key strictly in sessionStorage for current browser session.
 *
 * @param key Gemini API Key
 */
export function setSessionApiKey(key: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_API_KEY, key.trim());
  } catch {
    // Ignore session storage errors
  }
}

/**
 * Clears API key from sessionStorage.
 */
export function clearSessionApiKey(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_API_KEY);
  } catch {
    // Ignore session storage errors
  }
}
